# HYUNDAI PRO

HYUNDAI PRO combines the Hyundai Studio vehicle configurator with MotorIQ, a safety-first automotive assistant. The existing vanilla frontend is served unchanged by a small Express backend that proxies chat requests to local Ollama.

## Local setup in VS Code

1. Install Node.js 18 or newer and Ollama.
2. In this folder, install dependencies:

   ```powershell
   npm install
   ```

3. Create the local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Set `OLLAMA_MODEL` in `.env` to an installed model. The default is `deepseek-r1:latest`.
5. Confirm Ollama is running and the model exists:

   ```powershell
   ollama list
   ```

6. Start the website and backend:

   ```powershell
   npm run dev
   ```

Open:

- `http://127.0.0.1:4173/` for Hyundai Studio
- `http://127.0.0.1:4173/diagnose.html` for MotorIQ

## Ollama chat

MotorIQ sends the full conversation history to `POST /api/chat`. The backend forwards it to:

```text
http://127.0.0.1:11434/api/chat
```

The response is streamed as Ollama NDJSON and rendered token-by-token in the chat panel. The model is selected only from `OLLAMA_MODEL`; `.env` is ignored by Git.

The existing diagnosis button continues to use the curated diagnosis and live research flow. The new chat is an additional conversational interface and does not replace existing features.

## Pre-Trip Car Care

MotorIQ includes 15 original procedural browser animations under **Before You Hit the Road**. Each task has its own step sequence, component scene, captions, transcript, safety warning, completion state, and tutorial controls. A separate `pre-trip-car-care.html` guide is also available from the end of the MotorIQ page. It contains the supplied two local MP4 videos plus the complete 60-second animated walkthrough.

The videos are stored locally in `media/pre-trip-car-care.mp4` and `media/pre-trip-road-ready.mp4`; they are served by the Express app and do not require an external video host.

The section includes tyre pressure and damage, oil, coolant, washer fluid, wipers, exterior lights, battery, seat belts and mirrors, fuel/range, spare equipment, windshield, fluid leaks, closures, and an emergency kit. The **Ask MotorIQ about this step** control sends the selected tutorial context to the existing chat panel.

## Safety and privacy

The assistant is local-first and does not require an API key. Do not place secrets or downloaded model files in this repository. Ollama responses are educational triage, not a substitute for the exact owner manual or a qualified technician. Stop driving and seek professional help for smoke, fuel leaks, overheating, loss of braking, or unsafe steering.
