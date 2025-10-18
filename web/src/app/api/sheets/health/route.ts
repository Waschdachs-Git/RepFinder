import { NextRequest } from 'next/server';
import { readSheet } from '@/lib/sheets';
import fs from 'node:fs';
import path from 'node:path';

type HealthOk = {
  status: 'ok';
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

export async function GET(_req: NextRequest) {
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

  try {
    // Small sample to verify header + first rows
    const tab = (process.env.GOOGLE_SHEETS_TAB || '').trim();
    const baseSample = 'A1:H6';
    const baseCount = 'A:A';
    const sampleRange = tab ? `${tab}!${baseSample}` : baseSample;
    const countRange = tab ? `${tab}!${baseCount}` : baseCount;

    const sample = await readSheet(sampleRange); // CSV mode ignores range
    const header = (sample[0] ?? []).map((v) => String(v));

    // Use first column length as an approximation of row count
    const colA = await readSheet(countRange);
    const rowCount = Math.max(0, (colA.length || 0) - 1);

    const ok: HealthOk = {
      status: 'ok',
      env,
      sheet: {
        mode: env.csvUrl ? 'csv' : 'sheets',
        header,
        rowCount,
        sampleRange,
        sample,
      },
    };
    return Response.json(ok, { status: 200 });
  } catch (e: any) {
    const res: HealthErr = {
      status: 'error',
      env,
      error: {
        message: e?.message || 'Unknown error while contacting Google Sheets',
      },
    };
    return Response.json(res, { status: 200 });
  }
}
