# Deployment auf Hostinger (Node.js App)

Dieses Projekt nutzt Next.js mit API-Routen (z. B. `/api/clicks`, `/api/products`). Daher ist ein reiner Static Export (Ordner `out/`) nicht geeignet. Stattdessen wird die App als Node.js-Anwendung betrieben.

## Voraussetzungen
- Node.js 18 oder 20 (hPanel Node.js App)
- Environment Variablen für Google Sheets:
  - `GOOGLE_SHEETS_CSV_URL` (alternativ)
  - oder: `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (oder `GOOGLE_PRIVATE_KEY_BASE64`)
  - optional: `GOOGLE_SHEETS_TAB`, `GOOGLE_SHEETS_RANGE`, `GOOGLE_SHEETS_TABS`, `GOOGLE_SHEETS_IGNORE_TABS`

## Dateien
- `server.js`: einfacher HTTP-Server, der `next` auf `process.env.PORT`/`HOST` startet (prod).
- `package.json` Scripts:
  - `build`: baut die App (`.next`)
  - `start`: startet `node server.js`
  - `start:next`: Fallback `next start`

## Schritt-für-Schritt im hPanel
1. Neue Node.js App anlegen, als Projektverzeichnis den `web/`-Ordner wählen.
2. Env-Variablen setzen (siehe oben).
3. Abhängigkeiten installieren: `npm ci` (oder im hPanel “Install NPM”).
4. Build ausführen: `npm run build`.
5. Start Script: `npm start` (Hostinger setzt `PORT` automatisch).
6. App starten.

## Hinweise
- Wir haben `output: 'export'` entfernt, da es mit API-Routen kollidiert (Static Export unterstützt keine APIs). Der Build erzeugt `.next/` statt `out/`.
- Die Bild-Domains sind in `next.config.*` konfiguriert.
- Falls Hostinger speziell eine Startdatei verlangt, ist `server.js` genau dafür vorhanden.
