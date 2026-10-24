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
