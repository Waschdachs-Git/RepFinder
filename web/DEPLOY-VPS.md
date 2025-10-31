# Deploying RepFinder on a VPS (Node.js + Next.js App Router)

This project is configured to run as a standard Node.js server using a tiny custom server (`server.js`). No PHP required.

## Requirements
- Node.js 18 or newer
- Build tools for Next.js (on the VPS or build locally and upload .next)
- A process manager (PM2 recommended) or a systemd service

## Environment variables
Configure at least one of the data sources:

Option A — Published Google Sheets CSV (no auth):
- Single tab:
  - GOOGLE_SHEETS_CSV_URL=https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>
- Multiple tabs (one CSV link per sheet):
  - Either list them comma/whitespace-separated in GOOGLE_SHEETS_CSV_URL
  - Or set GOOGLE_SHEETS_CSV_URLS with a comma/newline-separated list
  - We merge all CSVs and keep only the first header row.

Option B — Private Google Sheet via Service Account:
- GOOGLE_SHEETS_ID=<spreadsheet-id>
- GOOGLE_SERVICE_ACCOUNT_EMAIL=<name>@<project>.iam.gserviceaccount.com
- GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  - Alternatively: GOOGLE_PRIVATE_KEY_BASE64 with the Base64 of the PEM
- Optional: GOOGLE_SHEETS_TAB, GOOGLE_SHEETS_RANGE, GOOGLE_SHEETS_TABS, GOOGLE_SHEETS_IGNORE_TABS
  - Optional (CSV-like): GOOGLE_SHEETS_GID to target a specific tab by its `gid` (we resolve the title automatically)

Optional frontend flags (defaults are fine):
- NEXT_PUBLIC_USE_API=true
- NEXT_PUBLIC_API_BASE="" (empty = same-origin)

Loading env files on a VPS:
- This project loads `.env` and `.env.local` automatically via `dotenv` in `server.js`.
- That means you can upload a `.env.local` next to `server.js` on your VPS (not committed) with e.g.:
  - `GOOGLE_SHEETS_CSV_URL=...` (single or comma-separated)
  - or `GOOGLE_SHEETS_CSV_URLS=...` (one per line is fine)
- Alternatively set the variables in your process manager or hosting control panel.

## Build & run

Local dev:
```
npm run dev
```

Production build and start (VPS):
```
npm run build
npm start
```

By default the server binds to 0.0.0.0:3000. You can override with:
- PORT=8080 HOST=127.0.0.1 npm start

## PM2 (recommended)
```
pm install -g pm2
pm2 start server.js --name repfinder --update-env --time
pm2 save
pm2 startup
```
- Logs: `pm2 logs repfinder`
- Restart: `pm2 restart repfinder`

## Reverse proxy (optional)
If you run behind Nginx/Apache, proxy incoming HTTPS traffic to the Node server (e.g. 127.0.0.1:3000). Make sure to forward headers like `X-Forwarded-Proto`.

## Health checks
- Sheets config: GET /api/sheets/health
- Products API: GET /api/products?limit=1
- Clicks map: GET /api/clicks

## Notes
- Static export and PHP artifacts were removed. The app now always renders via Node.js.
- Image optimization runs on the Node server (remotePatterns configured in `next.config.js`).
- Clicks are aggregated in `.data-clicks.json` on the server. Ensure the app has write permissions in its working directory.
