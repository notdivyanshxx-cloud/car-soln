import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 4173);
const ollamaUrl = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
const ollamaModel = process.env.OLLAMA_MODEL || "deepseek-r1:latest";
const trustedDomains = [
  "hyundai.com",
  "nhtsa.gov",
  "michelinman.com",
  "bridgestonetire.com",
  "continental-tires.com",
  "boschcarservice.com"
];

app.use(express.json({ limit: "256kb" }));

function isTrusted(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return trustedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function stripMarkup(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchExcerpt(url) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "MotorIQ/1.0" },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok || !(response.headers.get("content-type") || "").includes("text/html")) return "";
    const source = (await response.text()).slice(0, 120000)
      .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
    return stripMarkup(source).slice(0, 3500);
  } catch {
    return "";
  }
}

async function searchTrustedWeb(query) {
  const url = `https://www.bing.com/search?format=rss&q=${encodeURIComponent(`${query} automotive safety repair`)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "MotorIQ/1.0" },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Search provider returned ${response.status}`);
  const rss = await response.text();
  const results = [];
  for (const match of rss.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const block = match[1];
    const title = block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "";
    const snippet = block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || "";
    const cleanLink = stripMarkup(link).replace(/&amp;/g, "&");
    if (!title || !cleanLink || !isTrusted(cleanLink)) continue;
    results.push({
      title: stripMarkup(title),
      url: cleanLink,
      snippet: stripMarkup(snippet),
      excerpt: await fetchExcerpt(cleanLink)
    });
    if (results.length === 5) break;
  }
  return results;
}

app.get("/api/research", async (request, response) => {
  const query = String(request.query.q || "").trim();
  if (query.length < 4 || query.length > 300) {
    return response.status(400).json({ error: "Enter a more specific vehicle problem." });
  }
  try {
    return response.json({ query, sources: await searchTrustedWeb(query) });
  } catch (error) {
    return response.status(502).json({ error: "Live web research is unavailable.", detail: error.message });
  }
});

app.post("/api/chat", async (request, response) => {
  const messages = request.body?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) {
    return response.status(400).json({ error: "Send a non-empty conversation history." });
  }
  const safeMessages = messages
    .filter((message) => message && ["system", "user", "assistant"].includes(message.role) && typeof message.content === "string")
    .map((message) => ({ role: message.role, content: message.content.slice(0, 12000) }));
  if (!safeMessages.length) return response.status(400).json({ error: "No valid messages were provided." });

  let upstream;
  try {
    upstream = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: ollamaModel, messages: safeMessages, stream: true }),
      signal: AbortSignal.timeout(180000)
    });
  } catch (error) {
    return response.status(502).json({ error: "Could not connect to Ollama.", detail: error.message });
  }
  if (!upstream.ok) {
    const detail = await upstream.text();
    return response.status(502).json({ error: `Ollama returned ${upstream.status}.`, detail: detail.slice(0, 1000) });
  }

  response.status(200);
  response.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("X-Accel-Buffering", "no");
  for await (const chunk of upstream.body) response.write(chunk);
  response.end();
});

app.use(express.static(__dirname, { extensions: ["html"] }));
app.listen(port, "127.0.0.1", () => {
  console.log(`HYUNDAI PRO running at http://127.0.0.1:${port}`);
  console.log(`Ollama model: ${ollamaModel}`);
});
