/* Simple Next.js custom server for Hostinger Node.js app */
// Load environment variables from .env and .env.local when running on a VPS without a panel
try {
  const path = require('path');
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '.env') });
  dotenv.config({ path: path.join(__dirname, '.env.local') }); // overrides .env
} catch {}
const { createServer } = require('http');
const next = require('next');

const dev = false; // production server
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        await handle(req, res);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    }).listen(port, hostname, () => {
      console.log(`> Next server ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
