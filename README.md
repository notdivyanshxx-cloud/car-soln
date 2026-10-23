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
- `http://127.0.0.1:4173/auth.html` for the private garage dashboard

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

## Guest access and private car dashboard

All existing showroom, diagnosis, live research, Ollama chat, and pre-trip pages remain public. The **My dashboard** link opens `auth.html`, where a visitor can register or log in with a verified mobile number. In local development, the generated OTP is returned on screen and logged by the server because no SMS provider is configured. For production, configure an SMS/OTP provider and set `NODE_ENV=production`; the local code is then not returned to the browser.

After verification, the dashboard reads only vehicles associated with the authenticated session. A new account starts with the message **“No car is registered with your account yet.”** The user can add a make, model, registration number, year, mileage, next service date, and notes. User data is stored in the ignored `data/user-data.json` file for this local prototype; replace it with a managed database before multi-user production deployment.

When a vehicle is linked, the dashboard includes a responsive Three.js viewer with drag/touch rotation, wheel/pinch zoom, reset view, fullscreen, showroom lighting, loading states, and an owner-scoped vehicle information panel. The backend looks for a verified local asset at `models/<make>-<model>.glb` or `.gltf`. No verified vehicle assets are currently included, so the viewer clearly labels its procedural fallback as an approximate model. Add only licensed, verified assets to `models/`; downloaded model files remain ignored by Git.

## Safety and privacy

The assistant is local-first and does not require an API key. Do not place secrets or downloaded model files in this repository. Ollama responses are educational triage, not a substitute for the exact owner manual or a qualified technician. Stop driving and seek professional help for smoke, fuel leaks, overheating, loss of braking, or unsafe steering.
