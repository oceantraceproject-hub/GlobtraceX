import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// Shared Gemini client setup using @google/genai modern SDK
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Server-side interpretation endpoint
app.post('/api/intelligence/interpret', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      regionName,
      variableName,
      units,
      period,
      slopePerDecade,
      pValue,
      isSignificant,
      situation,
      coveragePct,
      netChangePct,
      baselinePeriod,
      sensor,
      datasetId,
    } = req.body;

    if (!ai) {
      res.json({
        success: true,
        source: 'deterministic-fallback',
        message: 'Using validated deterministic scientific intelligence engine.',
      });
      return;
    }

    const prompt = `You are the GlobTraceX Senior Earth System Intelligence Analyst for the NASA Space Apps Challenge.
Strict rule: DO NOT invent, alter, or round any numbers or statistical parameters. Rely ONLY on the provided verified satellite telemetry.

Observed Telemetry Summary:
- Region: ${regionName}
- Variable / Parameter: ${variableName} (${units})
- Satellite Sensor / Product: ${sensor} (${datasetId})
- Time Period: ${period} (Baseline Reference: ${baselinePeriod})
- Theil-Sen Median Slope: ${slopePerDecade} ${units}/decade
- Mann-Kendall Hypothesis Test: p-value = ${pValue} (Statistically Significant at p <= 0.05: ${isSignificant ? 'YES' : 'NO'})
- Data Completeness & Temporal Coverage: ${coveragePct}%
- Relative Anomaly Change: ${netChangePct}%
- Deterministic Situation Classification: ${situation}

Provide an authoritative, scientifically grounded synthesis in structured JSON with these exact keys:
{
  "situationSummary": "A punchy, informative 2-sentence diagnostic assessment",
  "whatIsHappening": "Clear plain-language explanation of the physical trajectory",
  "whyItMatters": "Environmental and human relevance, distinguishing proven biophysical relationships from local vulnerabilities",
  "underlyingDrivers": "Primary atmospheric/climatic or anthropogenic drivers",
  "immediateAction": "Top priority action for next 0-6 months",
  "whatToMonitor": "Key leading indicator or environmental threshold to track",
  "whatToAvoid": "Critical maladaptive practice or premature decision to prevent"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed: Record<string, any> = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {};
    }

    res.json({
      success: true,
      source: 'gemini-3.8-flash',
      data: parsed,
    });
  } catch (error: any) {
    console.error('Gemini interpretation error:', error);
    res.json({
      success: false,
      source: 'deterministic-fallback',
      error: error?.message || 'Server error',
    });
  }
});

import fs from 'fs';

// Persistent Atomic Member Number Sequence Storage
const DATA_DIR = path.resolve(__dirname, 'data');
const MEMBERSHIP_FILE = path.resolve(DATA_DIR, 'memberships.json');

interface MembershipStore {
  nextSeq: number; // Starts at 100 -> GTX-M-0100
  members: Record<string, { memberNumber: string; email: string; assignedAt: string; displayName?: string }>;
}

function getMembershipStore(): MembershipStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(MEMBERSHIP_FILE)) {
      const raw = fs.readFileSync(MEMBERSHIP_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading membership store:', err);
  }
  return { nextSeq: 100, members: {} };
}

function saveMembershipStore(store: MembershipStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(MEMBERSHIP_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing membership store:', err);
  }
}

// Atomic Member Number Generation Endpoint: Starts at GTX-M-0100
app.post('/api/auth/member-number', (req: Request, res: Response) => {
  const { uid, email, displayName } = req.body;
  if (!uid) {
    res.status(400).json({ error: 'Missing uid' });
    return;
  }

  const store = getMembershipStore();

  // If this UID or email already has an assigned member number, return it idempotently
  if (store.members[uid]) {
    res.json({
      success: true,
      memberNumber: store.members[uid].memberNumber,
      assignedAt: store.members[uid].assignedAt,
      isNew: false,
    });
    return;
  }

  // Check by email in case UID changed
  if (email) {
    const existingEntry = Object.values(store.members).find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );
    if (existingEntry) {
      store.members[uid] = existingEntry;
      saveMembershipStore(store);
      res.json({
        success: true,
        memberNumber: existingEntry.memberNumber,
        assignedAt: existingEntry.assignedAt,
        isNew: false,
      });
      return;
    }
  }

  // Atomically allocate the next sequential number (GTX-M-0100, GTX-M-0101, etc.)
  const seq = store.nextSeq;
  const memberNumber = `GTX-M-${String(seq).padStart(4, '0')}`;
  store.nextSeq = seq + 1;
  store.members[uid] = {
    memberNumber,
    email: email || '',
    displayName: displayName || '',
    assignedAt: new Date().toISOString(),
  };

  saveMembershipStore(store);

  res.json({
    success: true,
    memberNumber,
    assignedAt: store.members[uid].assignedAt,
    isNew: true,
  });
});

app.get('/api/auth/member-number/:uid', (req: Request, res: Response) => {
  const { uid } = req.params;
  const store = getMembershipStore();
  const entry = store.members[uid];
  if (entry) {
    res.json({ success: true, memberNumber: entry.memberNumber, assignedAt: entry.assignedAt });
  } else {
    res.json({ success: false, memberNumber: null });
  }
});

// Real NASA POWER API Caching Proxy
const nasaPowerCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

app.get('/api/nasa/power', async (req: Request, res: Response) => {
  const { lon, lat, longitude: qLong, latitude: qLat, startYear, endYear, parameters } = req.query;
  const longitude = parseFloat((lon || qLong) as string);
  const latitude = parseFloat((lat || qLat) as string);
  const sYear = parseInt(startYear as string, 10) || 2020;
  const eYear = parseInt(endYear as string, 10) || 2024;
  const params = (parameters as string) || 'T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,ALLSKY_SFC_SW_DWN,RH2M';

  if (isNaN(longitude) || isNaN(latitude)) {
    res.status(400).json({ error: 'Valid longitude and latitude are required' });
    return;
  }

  const cacheKey = `${longitude.toFixed(2)}_${latitude.toFixed(2)}_${sYear}_${eYear}_${params}`;
  const cached = nasaPowerCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.json({ success: true, source: 'cache', data: cached.data });
    return;
  }

  const startStr = `${sYear}0101`;
  const endStr = `${eYear}1231`;
  const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&community=AG&longitude=${longitude.toFixed(2)}&latitude=${latitude.toFixed(2)}&start=${startStr}&end=${endStr}&format=JSON`;

  try {
    const response = await fetch(nasaUrl, { headers: { 'User-Agent': 'GlobTraceX-NASA-SpaceApps/2026' } });
    if (!response.ok) {
      res.status(response.status).json({ error: `NASA POWER API returned ${response.status}: ${response.statusText}` });
      return;
    }
    const json = await response.json();
    nasaPowerCache.set(cacheKey, { timestamp: Date.now(), data: json });
    res.json({ success: true, source: 'nasa-power-api', data: json });
  } catch (err: any) {
    console.error('NASA POWER proxy error:', err);
    res.status(500).json({ error: 'Failed to contact NASA POWER API', details: err?.message });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'GlobTraceX Earth Intelligence', timestamp: new Date().toISOString() });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GlobTraceX server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
