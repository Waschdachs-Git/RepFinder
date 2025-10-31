Product Finder
==============

Minimalistische Next.js-App (App Router, Tailwind v4) mit dynamischen Agent-Themes, Kategorien, Startseite mit Top-Produkten, Produkt-Detail, Suche/Filter und Favoriten.

Hinweis zum Deployment (VPS/Node.js)
------------------------------------
Dieses Projekt ist für den Betrieb als Node.js-App konfiguriert. Ein kleiner Custom-Server (`server.js`) startet Next.js im Produktionsmodus. Siehe `DEPLOY-VPS.md` für die Einrichtung (Ports, PM2, Umgebungsvariablen).

Start
-----

```bash
npm install
npm run dev
```

Struktur
--------

- src/lib/types.ts – Typen (Agent, Kategorie, Produkt)
- src/lib/data.ts – Dummy-Daten (Shops, Kategorien, Produkte)
- src/lib/utils.ts – Formatierung, Favoriten/Klicks (localStorage)
- src/providers/AgentProvider.tsx – aktueller Agent + Theme via data-agent
- src/components/* – Header, Footer, ProductCard, ProductGrid, SearchFilter
- src/app/* – Seiten: Home, Kategorie (/c/[slug]), Produkt (/p/[id]), statische Seiten

Agent/Theme anpassen
--------------------

Die Akzentfarbe wird über CSS-Variablen gesteuert:

```
html[data-agent='itaobuy'] { --accent: 19 100% 60%; }
html[data-agent='cnfans'] { --accent: 355 79% 41%; }
html[data-agent='superbuy'] { --accent: 220 72% 55%; }
html[data-agent='mulebuy'] { --accent: 268 62% 52%; }
html[data-agent='allchinabuy'] { --accent: 188 70% 45%; }
```

Produkte & Kategorien erweitern
-------------------------------

- Daten liegen in `src/lib/data.ts`.
- Neues Produkt anlegen, `agent` und `category` zuweisen, Bild/Preis/Links ergänzen.
- Kategorienliste in `CATEGORIES`/`CATEGORY_INTRO` pflegen.

Hinweise
--------

Datenquellen-Optionen für Produkte (du kannst dein bestehendes Google Sheet weiterverwenden):

1) Veröffentlichtes CSV (einfach, keine Auth)
   - In Google Sheets: Datei → Freigeben → „Jeder mit dem Link“ (nur ansehen).
   - CSV-Link: `https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>`
   - In `.env.local`:
     - Ein Tab: `GOOGLE_SHEETS_CSV_URL="<dein-csv-link>"`
     - Mehrere Tabs (eine URL pro Tabellenblatt):
       - Entweder alle in `GOOGLE_SHEETS_CSV_URL` kommasepariert
       - Oder als Liste in `GOOGLE_SHEETS_CSV_URLS` (Komma oder Zeilenumbruch)
       - Wir mergen alle CSVs und behalten nur die erste Header-Zeile
   - Effekt: Die API lädt live aus diesem CSV. Keine Credentials nötig. Achtung: öffentlich einsehbar.

2) Service Account (privat, kontrolliert)
   - `.env.local` mit: 
     - `GOOGLE_SHEETS_ID` = Spreadsheet-ID (URL zwischen `/d/` und `/edit`)
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = E-Mail aus dem Service-Account JSON
     - Eines von:
       - `GOOGLE_PRIVATE_KEY` = PEM-Inhalt, Zeilenumbrüche als `\n` escapen
       - oder `GOOGLE_PRIVATE_KEY_BASE64` = Base64-kodierter PEM
       - optional statt ENV: `key.b64` (Base64) im Repo-Root oder unter `web/key.b64`
     - Optional zur Tab-/Bereich-Steuerung deines bestehenden Sheets:
       - `GOOGLE_SHEETS_TAB` = Name der Registerkarte (z. B. `Produkte`)
    - `GOOGLE_SHEETS_RANGE` = Zellenbereich (Default `A1:H100000`)
    - `GOOGLE_SHEETS_TABS` = Kommaseparierte Liste von Tabs (wir mergen sie; erstes Tab liefert Header)
    - `GOOGLE_SHEETS_IGNORE_TABS` = Tabs, die ignoriert werden (Komma)
    - `SHEETS_IGNORE_PLACEHOLDER_LINKS=true|false` (Default true; ignoriert example/placeholder-Links)
    - `PRODUCTS_CACHE_TTL_MS=120000` (In-Memory-Cache für Produkte, beschleunigt erste Kategorie-Aufrufe)
  - `GOOGLE_SHEETS_GID=<number>` (wie CSV: nutze die numerische gid eines Tabs; wir lösen den Tab-Namen automatisch)
   - In Google Sheets: das Dokument für die Service-Account-E-Mail „Betrachter“ freigeben.
   - Spalten (erste Zeile = Header): `name, agent, category, price, image, description, affiliateUrl, clicks, id(optional)`
   - Effekt: Die API lädt privat und live aus deinem Sheet.

  - Multi-Tab support (one tab per main category)
    - If you maintain one tab per main category (e.g., Footwear, Tops, Bottoms, Outerwear, Full-Body-Clothing, Headwear, Accessories, Jewelry, Other Stuff), the loader can merge them automatically.
    - Control via env:
      - `GOOGLE_SHEETS_TABS="Footwear,Tops,Bottoms,Outerwear,Full-Body-Clothing,Headwear,Accessories,Jewelry,Other Stuff"` explicitly sets which tabs to merge (first tab contributes headers; later tabs append rows without headers).
      - `GOOGLE_SHEETS_AUTO_TABS=true|false` toggles auto-detection of the standard tabs above; defaults to `true` when `GOOGLE_SHEETS_TABS` is not set.
      - `GOOGLE_SHEETS_RANGE` still applies to each tab (default `A1:ZZ100000`).
    - Ignore tabs with `GOOGLE_SHEETS_IGNORE_TABS` (comma-separated, substring match; e.g., `Test,Archive`).

3) Einmaliger Import in lokales JSON (schnell, kein Runtime-Zugriff)
   - Deine Quelle kann ein CSV aus Google Sheets sein (manuell exportiert oder die CSV-URL).
   - Import: `npm run import:csv "<pfad-oder-csv-url>"`
   - Ergebnis: `public/data/products.generated.json` (wird automatisch verwendet, wenn kein Live-Sheet erreichbar ist).
   - Ideal für statisches Hosting oder Performance ohne Google-Zugriff zur Laufzeit.

- Quellenauswahl zur Laufzeit
  - Priorität: CSV-URL → Service-Account → Local JSON → Builtin Seed-Daten.
  - D. h. sobald `GOOGLE_SHEETS_CSV_URL` gesetzt ist, hat sie Vorrang.

### Health-Check für Google Sheets
  1) Vorlage ansehen: `public/data/products.template.csv`
  2) CSV lokal pflegen oder Google Sheets benutzen und „Datei → Herunterladen → Kommagetrennte Werte (.csv)“ oder über eine öffentliche CSV-URL freigeben:
	  - Öffne Sheets → Datei → Freigeben → „Jeder mit dem Link“ (nur anzeigen)
	  - URL-Format: `https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>`
  3) Import starten:
	  - Lokal: `npm run import:csv ./public/data/products.template.csv`
	  - Aus Google Sheets: `npm run import:csv "https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>"`
  4) Ergebnis liegt in `public/data/products.generated.json` und wird automatisch von `/api/products` verwendet.
    5) Falls deine Bilder aus neuen Domains kommen, trage die Domain in `next.config.js > images.remotePatterns` ein.

### Health-Check für Google Sheets

Nutze die Route `/api/sheets/health`, um schnell zu prüfen, ob die Verbindung und Berechtigungen zum Google Sheet funktionieren:

- Zeigt gesetzte Env-Variablen (nur als Booleans), Header der Tabelle, geschätzte Zeilenzahl und ein kleines Sample.
- Typische Fehlerursachen:
  - .env.local nicht gesetzt oder Private Key nicht mit `\\n` Zeilenumbrüchen versehen
  - Das Sheet ist nicht mit der Service-Account-E-Mail freigegeben (mind. „Betrachter“)
  - Falsche Spreadsheet-ID oder Tab/Range/Header stimmen nicht (erste Zeile muss Spaltennamen enthalten)


- Favoriten und Klickzahlen werden ausschließlich im Browser gespeichert.
- Die meisten UI-Elemente sind responsive und nutzen Tailwind-Utilities.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
