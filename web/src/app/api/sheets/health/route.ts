export const dynamic = 'force-dynamic';
// no request object needed
import { readSheet } from '@/lib/sheets';
import fs from 'node:fs';
import path from 'node:path';

type HealthOk = {
  status: 'ok';
  buildId?: string;
  env: {
    sheetId: boolean;
    serviceEmail: boolean;
    privateKey: boolean;
    csvUrl: boolean;
  };
  sheet: {
    mode: 'csv' | 'sheets';
    header: string[];
    rowCount: number; // total rows excluding header (approx. via column A length)
    sampleRange: string;
    sample: string[][]; // includes header row as first row in the sample
  };
};

type HealthErr = {
  status: 'error';
  env: {
    sheetId: boolean;
    serviceEmail: boolean;
    privateKey: boolean;
    csvUrl: boolean;
  };
  error: {
    message: string;
  };
};

let HEALTH_CACHE: { at: number; body: any } | null = null;
let HEALTH_IN_FLIGHT: Promise<Response> | null = null;

export async function GET() {
  const ttl = Number(process.env.HEALTH_TTL_MS || '60000'); // 60s default
  const now = Date.now();
  if (HEALTH_CACHE && now - HEALTH_CACHE.at < Math.max(5000, ttl)) {
    return new Response(JSON.stringify(HEALTH_CACHE.body), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-health-cached': '1' },
    });
  }
  if (HEALTH_IN_FLIGHT) return HEALTH_IN_FLIGHT;
  // Include build ID to verify which version is running on the server
  let buildId = '';
  try { buildId = fs.readFileSync(path.join(process.cwd(), '.next', 'BUILD_ID'), 'utf8').trim(); } catch {}

  const csvUrl = !!(process.env.GOOGLE_SHEETS_CSV_URL || '').trim();
  const hasPrivateKeyPlain = !!(process.env.GOOGLE_PRIVATE_KEY || '').trim();
  const hasPrivateKeyBase64 = !!(process.env.GOOGLE_PRIVATE_KEY_BASE64 || '').trim();
  const keyCandidates = [
    path.join(process.cwd(), 'key.b64'),
    path.join(process.cwd(), 'web', 'key.b64'),
  ];
  let hasKeyFile = false;
  for (const p of keyCandidates) {
    try { if (fs.existsSync(p)) { hasKeyFile = true; break; } } catch {}
  }
  const env = {
    sheetId: !!process.env.GOOGLE_SHEETS_ID,
    serviceEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: hasPrivateKeyPlain || hasPrivateKeyBase64 || hasKeyFile,
    csvUrl,
  };

  // If CSV mode is NOT set and service-account env is incomplete, fail fast
  if (!env.csvUrl && (!env.sheetId || !env.serviceEmail || !env.privateKey)) {
    const res: HealthErr = {
      status: 'error',
      env,
      error: {
        message:
          'Missing Google Sheets env vars. Please set GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY (with \\n escaped newlines) and share the sheet read access with the service account.',
      },
    };
    return Response.json(res, { status: 200 });
  }

  const doWork = async (): Promise<Response> => {
  try {
    // Determine effective mode similar to readSheet
    const forceMode = String(process.env.GOOGLE_SHEETS_MODE || '').trim().toLowerCase();
    const csvConfigured = !!(
      (process.env.GOOGLE_SHEETS_CSV_URL || '').trim() ||
      (process.env.GOOGLE_SHEETS_CSV_URLS || '').trim()
    );
    let mode: 'csv' | 'sheets' = 'sheets';
    if (forceMode === 'csv') mode = 'csv';
    else if (forceMode === 'sheets') mode = 'sheets';
    else if (!(env.sheetId && env.serviceEmail && env.privateKey) && csvConfigured) mode = 'csv';

    // Small sample to verify header + first rows (use wider range to include all headers)
    const tab = (process.env.GOOGLE_SHEETS_TAB || '').trim();
    const tabsEnv = String(process.env.GOOGLE_SHEETS_TABS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const baseSample = 'A1:ZZ6';
    const baseCount = 'A:A';
    // If multiple tabs are configured, probe the first working one for header; count rows across all configured tabs
    let sampleRange = tab ? `${tab}!${baseSample}` : baseSample;
    let countRanges: string[] = [tab ? `${tab}!${baseCount}` : baseCount];
    if (!tab && tabsEnv.length > 0) {
      sampleRange = `${tabsEnv[0]}!${baseSample}`;
      countRanges = tabsEnv.map((t) => `${t}!${baseCount}`);
    }

    const sample = await readSheet(sampleRange); // CSV mode ignores range
    const header = (sample[0] ?? []).map((v) => String(v));

    // Use first column length as an approximation of row count
    let rowCount = 0;
    for (const cr of countRanges) {
      try {
        const colA = await readSheet(cr);
        rowCount += Math.max(0, (colA.length || 0) - 1);
      } catch {
        // ignore missing tab in health summary
      }
    }

    const ok: HealthOk = {
      status: 'ok',
      buildId,
      env,
      sheet: {
        mode,
        header,
        rowCount,
        sampleRange,
        sample,
      },
    };
    const res = Response.json(ok, { status: 200 });
    try { HEALTH_CACHE = { at: Date.now(), body: ok }; } catch {}
    return res;
  } catch (e: unknown) {
    const message =
      typeof e === 'object' && e && 'message' in e
        ? String((e as { message?: unknown }).message || '')
        : 'Unknown error while contacting Google Sheets';
    const res: HealthErr = {
      status: 'error',
      env,
      error: {
        message,
      },
    };
    const r = Response.json(res, { status: 200 });
    try { HEALTH_CACHE = { at: Date.now(), body: res }; } catch {}
    return r;
  }
  };

  HEALTH_IN_FLIGHT = doWork().finally(() => { HEALTH_IN_FLIGHT = null; });
  return HEALTH_IN_FLIGHT;
}
