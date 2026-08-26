# Cosmo Voice App

A minimal TypeScript app built on the [Cosmo AI](https://github.com/socratic-ai/cosmo-ai) realtime SDK (`cosmo-ai`). A browser voice session with a live transcript, backed by a tiny local token server that mints end-user JWTs so the API key never ships to the page.

## Architecture

```
browser (React + cosmo-ai) ──POST /token──▶ server/token-server.ts ──▶ Cosmo /api/v1/external/auth/token
        │  TokenSource.endpoint('/token')        (holds COSMO_API_KEY)        { jwt, expires_at }
        └────────────── realtime session (LiveKit WebRTC) ◀────────── Cosmo platform
```

- `server/token-server.ts` — zero-dependency Node adapter of the official [token-server example](https://github.com/socratic-ai/cosmo-ai/tree/main/examples/typescript/token-server). Auth: `Authorization: Bearer $MINT_SECRET`.
- `src/App.tsx` — builds `RealtimeClient` with `TokenSource.endpoint('/token')`; the SDK fetches and refreshes the JWT itself.
- `src/VoiceSession.tsx` — `RealtimeProvider` + `useTranscript` / `useAgentState` / `useMicLevel` hooks.

## Setup

1. Get an API key from the Cosmo platform (or `pipx install cosmo-cli && cosmo login`).
2. Copy env files:

   ```sh
   cp .env.example .env          # set COSMO_API_KEY and MINT_SECRET
   echo "VITE_MINT_SECRET=<same value as MINT_SECRET>" >> .env
   ```

   > Dev note: the browser sends `VITE_MINT_SECRET` to authenticate against the
   > local token server. This mirrors the example's out-of-the-box mode and is
   > fine for local development; for production, replace `identifyUser()` in
   > `server/token-server.ts` with your real auth and drop the Vite variable.

3. Install and run:

   ```sh
   npm install
   npm run dev
   ```

4. Open http://localhost:5173, click **Start talking**, and allow the microphone.

## Scripts

| Command         | What it does                                        |
| --------------- | --------------------------------------------------- |
| `npm run dev`   | Token server (:8787) + Vite dev server (:5173)      |
| `npm run build` | Type-check and production build                     |
| `npm run preview` | Serve the production build                        |

## Docs

- SDK README: [typescript/README.md](https://github.com/socratic-ai/cosmo-ai/blob/main/typescript/README.md)
- Full docs: https://platform.askcosmo.ai/docs
