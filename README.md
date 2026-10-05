# FinMan

A personal finance tracker. Paste a bank SMS or upload a bill photo, a Hugging Face model pulls out the transaction, you check the fields, and the dashboard charts your spending. The stack is MongoDB Atlas, Express 5, React 19 and TypeScript. Build plan: [ROADMAP.md](ROADMAP.md).

## Setup

You need Node 24, a MongoDB Atlas cluster and a Hugging Face token with Inference Providers access.

1. Copy `backend/.env.example` to `backend/.env` and fill in every key. The Atlas URI and the HF token are the two you must supply.
2. Install and seed:

```bash
cd backend
npm install
npm run seed -- --demo
```

3. Run the API and the frontend in two terminals:

```bash
cd backend && npm run dev
cd frontend && npm install && npm run dev
```

The frontend opens on http://localhost:5173 and proxies `/api` to the backend on port 4000. If another dev server already uses 5173, Vite will not start (strict port is not set, so it picks the next free one). Update `CORS_ORIGIN` in `backend/.env` to match, or leave the proxy to handle it.

## Commands

| Where | Command | What it does |
|---|---|---|
| backend | `npm run dev` | API with reload |
| backend | `npm run seed` | Upserts the 12 default categories |
| backend | `npm run seed -- --demo 60` | Also inserts 60 fake transactions |
| backend | `npm test` | Unit tests (no network, no database) |
| backend | `npm run build` | Type-checks and compiles to `dist/` |
| frontend | `npm run build` | Type-checks and builds to `dist/` |

`api.http` has ready-made requests for the VS Code REST Client extension.

## Notes

- Single user, no login. Every day is an IST day.
- If the Atlas cluster has been idle for a while it pauses. Resume it from the Atlas page, then restart the backend.
- If your IP changes (new Wi-Fi, hotspot), add it under Network Access in Atlas.
- When the AI call fails, parsing still returns the amount from a regex and the form stays editable.
