import html
import json
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote_plus, urlparse
from urllib.request import Request, urlopen


HOST = "127.0.0.1"
PORT = 4173
TRUSTED_DOMAINS = (
    "hyundai.com",
    "nhtsa.gov",
    "michelinman.com",
    "bridgestonetire.com",
    "continental-tires.com",
    "boschcarservice.com",
)


def search_web(query):
    url = "https://www.bing.com/search?format=rss&q=" + quote_plus(query + " automotive safety repair")
    request = Request(url, headers={"User-Agent": "MotorIQ/1.0"})
    with urlopen(request, timeout=12) as response:
        page = response.read().decode("utf-8", errors="replace")

    results = []
    for match in re.finditer(r"<item>(.*?)</item>", page, re.I | re.S):
        block = match.group(1)
        title_match = re.search(r"<title>(.*?)</title>", block, re.I | re.S)
        link_match = re.search(r"<link>(.*?)</link>", block, re.I | re.S)
        snippet_match = re.search(r"<description>(.*?)</description>", block, re.I | re.S)
        if not title_match or not link_match:
            continue
        link = html.unescape(link_match.group(1).strip())
        parsed = urlparse(link)
        domain = parsed.netloc.lower().removeprefix("www.")
        if not any(domain == trusted or domain.endswith("." + trusted) for trusted in TRUSTED_DOMAINS):
            continue
        title = re.sub(r"<[^>]+>", "", title_match.group(1))
        snippet = re.sub(r"<[^>]+>", "", snippet_match.group(1)) if snippet_match else ""
        result = {"title": html.unescape(title).strip(), "url": link, "snippet": html.unescape(snippet).strip()}
        result["excerpt"] = fetch_source_excerpt(link)
        results.append(result)
        if len(results) == 5:
            break
    return results


def fetch_source_excerpt(url):
    request = Request(url, headers={"User-Agent": "MotorIQ/1.0"})
    try:
        with urlopen(request, timeout=8) as response:
            content_type = response.headers.get("Content-Type", "")
            if "text/html" not in content_type.lower():
                return ""
            page = response.read(120000).decode("utf-8", errors="replace")
        page = re.sub(r"<(script|style|noscript|svg)\b[^>]*>.*?</\1>", " ", page, flags=re.I | re.S)
        text = re.sub(r"<[^>]+>", " ", page)
        text = html.unescape(re.sub(r"\s+", " ", text)).strip()
        return text[:3500]
    except Exception:
        return ""


class MotorIqHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/research":
            return super().do_GET()

        query = parse_qs(parsed.query).get("q", [""])[0].strip()
        if len(query) < 4 or len(query) > 300:
            return self.send_json(400, {"error": "Enter a more specific vehicle problem."})
        try:
            results = search_web(query)
            self.send_json(200, {"query": query, "sources": results})
        except Exception as error:
            self.send_json(502, {"error": "Live web research is unavailable.", "detail": str(error)})

    def send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    print("MotorIQ server: http://127.0.0.1:4173")
    ThreadingHTTPServer((HOST, PORT), MotorIqHandler).serve_forever()
