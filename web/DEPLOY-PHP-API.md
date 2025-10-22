# PHP-API Deployment (Hostinger Webhosting)

Ziel: Statisches Next.js-Frontend aus `out/` + einfache PHP-API unter `/api`, um Produkte dynamisch aus Google Sheets (CSV) zu laden.

## Struktur auf dem Server (public_html)

- Kopiere den Inhalt von `web/out/` direkt nach `public_html/`.
- Lege ein Verzeichnis `public_html/api/` an und lade die PHP-Dateien aus `web/php-api/` dorthin:
  - `public_html/api/lib.php`
  - `public_html/api/products.php`
  - `public_html/api/suggest.php`
  - `public_html/api/clicks.php`

Optional: Lege `public_html/.cache/` an (schreibbar), damit CSV-Daten 5 Minuten gecacht werden.

## Konfiguration

- Empfohlen: Stelle dein Google Sheet als CSV-Export-URL bereit und setze in der Hosting-Umgebung eine Umgebungsvariable `GOOGLE_SHEETS_CSV_URL`.
  - Alternativ kannst du die Variable direkt in `api/lib.php` hart eintragen oder `.htaccess`/`php.ini` nutzen.
- Frontend: Setze im Build (oder in `.env`) `NEXT_PUBLIC_API_BASE` auf deine Domain (oder leer lassen, wenn API unter derselben Domain erreichbar ist).
  - Beispiel `.env.local`:
    ```
    NEXT_PUBLIC_STATIC_EXPORT=true
    # Leer lassen = gleiche Domain, also https://deine-domain.tld/api/...
    NEXT_PUBLIC_API_BASE=
    # Standard ist true: Client nutzt die API auch im Static-Export
    NEXT_PUBLIC_USE_API=true
    ```

## Build & Upload

1. Lokal bauen:
   ```bash
   cd web
   # Optional: CSV-URL setzen und kombinierten Lauf verwenden
   # GOOGLE_SHEETS_CSV_URL="https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>" npm run export:csv
   npm run export
   ```
2. `web/out/` nach `public_html/` hochladen.
3. `web/php-api/`-Dateien nach `public_html/api/` kopieren.

## Test

- Öffne `https://deine-domain.tld/` – Seiten werden statisch ausgeliefert.
- API-Check:
  - `https://deine-domain.tld/api/products?category=shoes&page=1&pageSize=12`
  - `https://deine-domain.tld/api/suggest?q=samba`
  - `POST https://deine-domain.tld/api/clicks` mit JSON `{ "id": "xyz" }` (optional)

## Hinweise

- CSV-Download wird 5 Minuten gecacht (`.cache/products.csv.json`).
- Fallback, falls keine CSV-URL gesetzt ist: Die API versucht `public_html/data/products.generated.json` zu lesen (aus dem Export). Damit lässt sich auch ohne CSV-URL testen.
- Schreibrichtlinien: Der Click-Counter speichert in `public_html/api/.data-clicks.json`. Stelle sicher, dass PHP in diesem Ordner schreiben darf.
