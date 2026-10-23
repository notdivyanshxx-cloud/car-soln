import "dotenv/config";
import express from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 4173);
const ollamaUrl = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
const ollamaModel = process.env.OLLAMA_MODEL || "deepseek-r1:latest";
const dataDirectory = path.join(__dirname, "data");
const dataFile = path.join(dataDirectory, "user-data.json");
const sessionCookie = "motoriq_session";
const trustedDomains = [
  "hyundai.com",
  "nhtsa.gov",
  "michelinman.com",
  "bridgestonetire.com",
  "continental-tires.com",
  "boschcarservice.com"
];

app.use(express.json({ limit: "256kb" }));

function ensureStore() {
  fs.mkdirSync(dataDirectory, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ users: [], vehicles: [], otps: [], sessions: [] }, null, 2));
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeStore(store) {
  ensureStore();
  const temporaryFile = `${dataFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(store, null, 2));
  fs.renameSync(temporaryFile, dataFile);
}

function id() {
  return crypto.randomUUID();
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return "";
}

function cleanText(value, max = 120) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

function setSession(response, userId) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const store = readStore();
  store.sessions = store.sessions.filter((session) => session.expiresAt > Date.now());
  store.sessions.push({ tokenHash: hash(rawToken), userId, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30 });
  writeStore(store);
  const flags = `HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
  response.setHeader("Set-Cookie", `${sessionCookie}=${rawToken}; ${flags}; Path=/`);
}

function currentUser(request) {
  const token = request.headers.cookie?.match(new RegExp(`${sessionCookie}=([^;]+)`))?.[1];
  if (!token) return null;
  const store = readStore();
  const session = store.sessions.find((item) => item.tokenHash === hash(token) && item.expiresAt > Date.now());
  return session ? store.users.find((user) => user.id === session.userId) || null : null;
}

function requireUser(request, response, next) {
  const user = currentUser(request);
  if (!user) return response.status(401).json({ error: "Sign in is required." });
  request.user = user;
  return next();
}

function publicUser(user) {
  return { id: user.id, name: user.name, phone: user.phone, verifiedAt: user.verifiedAt };
}

function vehicleForClient(vehicle) {
  const registration = vehicle.registrationNumber || "";
  const modelSlug = `${vehicle.make}-${vehicle.model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const assetCandidates = [`${modelSlug}.glb`, `${modelSlug}.gltf`];
  const assetFile = assetCandidates.find((candidate) => fs.existsSync(path.join(__dirname, "models", candidate)));
  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    variant: vehicle.variant || "",
    year: vehicle.year || "",
    registrationNumber: registration ? `${registration.slice(0, 2)}••••${registration.slice(-2)}` : "",
    fuelType: vehicle.fuelType || "",
    transmission: vehicle.transmission || "",
    mileage: vehicle.mileage || "",
    nextServiceDate: vehicle.nextServiceDate || "",
    notes: vehicle.notes || "",
    specifications: vehicle.specifications || [],
    serviceHistory: vehicle.serviceHistory || [],
    viewer: {
      assetUrl: assetFile ? `/models/${assetFile}` : null,
      exactAsset: Boolean(assetFile),
      message: assetFile ? "Verified local vehicle asset loaded from the models directory." : "No verified GLB/GLTF asset is available for this vehicle yet. Showing an approximate showroom model."
    }
  };
}

function issueOtp(phone, purpose) {
  const code = String(crypto.randomInt(100000, 1000000));
  const store = readStore();
  store.otps = store.otps.filter((item) => item.expiresAt > Date.now());
  store.otps.push({ id: id(), phone, purpose, codeHash: hash(code), attempts: 0, expiresAt: Date.now() + 1000 * 60 * 5 });
  writeStore(store);
  return code;
}

app.post("/api/auth/request-otp", (request, response) => {
  const phone = normalizePhone(request.body?.phone);
  const purpose = request.body?.purpose === "register" ? "register" : "login";
  const name = cleanText(request.body?.name, 80);
  if (!phone) return response.status(400).json({ error: "Enter a valid 10-digit mobile number." });
  if (purpose === "register" && name.length < 2) return response.status(400).json({ error: "Enter your name to register." });
  const store = readStore();
  const existing = store.users.find((user) => user.phone === phone);
  if (purpose === "register" && existing) return response.status(409).json({ error: "That mobile number is already registered. Choose login." });
  if (purpose === "login" && !existing) return response.status(404).json({ error: "No account found for this mobile number. Choose register first." });
  if (process.env.NODE_ENV === "production") return response.status(503).json({ error: "SMS OTP delivery is not configured. Add an approved OTP provider before production use." });
  const code = issueOtp(phone, purpose);
  console.log(`MotorIQ local OTP for ${phone}: ${code}`);
  return response.json({ message: "SMS provider is not configured. Use the local development code shown below.", devOtp: code });
});

app.post("/api/auth/verify-otp", (request, response) => {
  const phone = normalizePhone(request.body?.phone);
  const code = String(request.body?.code || "").trim();
  const purpose = request.body?.purpose === "register" ? "register" : "login";
  if (!phone || !/^\d{6}$/.test(code)) return response.status(400).json({ error: "Enter the six-digit verification code." });
  const store = readStore();
  const otp = [...store.otps].reverse().find((item) => item.phone === phone && item.purpose === purpose && item.expiresAt > Date.now());
  if (!otp || otp.attempts >= 5 || otp.codeHash !== hash(code)) {
    if (otp) otp.attempts += 1;
    writeStore(store);
    return response.status(401).json({ error: "The verification code is invalid or expired." });
  }
  store.otps = store.otps.filter((item) => item.id !== otp.id);
  let user = store.users.find((item) => item.phone === phone);
  if (purpose === "register") {
    user = { id: id(), name: cleanText(request.body?.name, 80), phone, verifiedAt: new Date().toISOString(), createdAt: new Date().toISOString() };
    store.users.push(user);
    writeStore(store);
  } else {
    writeStore(store);
  }
  setSession(response, user.id);
  return response.json({ user: publicUser(user) });
});

app.get("/api/auth/session", requireUser, (request, response) => {
  const store = readStore();
  const vehicles = store.vehicles.filter((vehicle) => vehicle.userId === request.user.id);
  return response.json({ user: publicUser(request.user), vehicles: vehicles.map(vehicleForClient) });
});

app.post("/api/auth/logout", (request, response) => {
  const token = request.headers.cookie?.match(new RegExp(`${sessionCookie}=([^;]+)`))?.[1];
  if (token) {
    const store = readStore();
    store.sessions = store.sessions.filter((session) => session.tokenHash !== hash(token));
    writeStore(store);
  }
  response.setHeader("Set-Cookie", `${sessionCookie}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`);
  return response.json({ ok: true });
});

app.post("/api/vehicles", requireUser, (request, response) => {
  const body = request.body || {};
  const vehicle = {
    id: id(),
    userId: request.user.id,
    make: cleanText(body.make, 40),
    model: cleanText(body.model, 80),
    variant: cleanText(body.variant, 80),
    year: cleanText(body.year, 4),
    registrationNumber: cleanText(body.registrationNumber, 20).toUpperCase(),
    fuelType: cleanText(body.fuelType, 30),
    transmission: cleanText(body.transmission, 30),
    mileage: cleanText(body.mileage, 30),
    nextServiceDate: cleanText(body.nextServiceDate, 20),
    notes: cleanText(body.notes, 500),
    specifications: [],
    createdAt: new Date().toISOString(),
    serviceHistory: []
  };
  if (!vehicle.make || !vehicle.model || !vehicle.registrationNumber) return response.status(400).json({ error: "Make, model, and registration number are required." });
  const store = readStore();
  if (store.vehicles.some((item) => item.registrationNumber === vehicle.registrationNumber)) return response.status(409).json({ error: "That registration number is already linked to an account." });
  store.vehicles.push(vehicle);
  writeStore(store);
  return response.status(201).json({ vehicle });
});

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
