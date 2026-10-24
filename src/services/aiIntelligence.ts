/**
 * @file aiIntelligence.ts
 * @description Client-side adaptive intelligence coordinator for GlobTraceX.
 * Follows the "Data First, AI Second" paradigm:
 * 1. Evaluates deterministic calculations immediately (0ms latency, 100% reliable).
 * 2. Asynchronously requests server-side Gemini 3.8 Flash interpretation for qualitative narrative enhancement.
 * 3. Fallback gracefully ensures uninterrupted operation if offline or without API key.
 */

import { LiveEarthIntelligence } from './intelligenceEngine';

// In-memory cache for intelligence interpretations
const interpretationCache = new Map<string, LiveEarthIntelligence>();

export async function fetchEnhancedIntelligence(
  baseIntelligence: LiveEarthIntelligence,
  abortSignal?: AbortSignal
): Promise<LiveEarthIntelligence> {
  const cacheKey = `${baseIntelligence.regionId}_${baseIntelligence.indicator.id}_${baseIntelligence.period.start}_${baseIntelligence.period.end}_${baseIntelligence.evidenceAndConfidence.pValue}`;

  if (interpretationCache.has(cacheKey)) {
    return interpretationCache.get(cacheKey)!;
  }

  try {
    const payload = {
      regionName: baseIntelligence.regionName,
      variableName: baseIntelligence.indicator.name,
      units: baseIntelligence.indicator.units,
      period: `${baseIntelligence.period.start} to ${baseIntelligence.period.end}`,
      slopePerDecade: baseIntelligence.evidencePassport.theilSenSlopePerDecade,
      pValue: baseIntelligence.evidenceAndConfidence.pValue,
      isSignificant: baseIntelligence.evidenceAndConfidence.pValue <= 0.05,
      situation: baseIntelligence.situation.label,
      coveragePct: baseIntelligence.evidenceAndConfidence.coveragePct,
      baselinePeriod: baseIntelligence.indicator.baselinePeriod,
      sensor: baseIntelligence.indicator.sensor,
      datasetId: baseIntelligence.indicator.productId,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch('/api/intelligence/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: abortSignal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return baseIntelligence;
    }

    const json = await res.json();
    if (json.success && json.data && json.source === 'gemini-3.8-flash') {
      const d = json.data;
      // Merge qualitative narrative enhancement while PRESERVING all validated numbers
      const enhanced: LiveEarthIntelligence = {
        ...baseIntelligence,
        situation: {
          ...baseIntelligence.situation,
          summary: d.situationSummary || baseIntelligence.situation.summary,
        },
        whatIsHappening: {
          ...baseIntelligence.whatIsHappening,
          rateStatement: d.whatIsHappening || baseIntelligence.whatIsHappening.rateStatement,
        },
        whyDoesItMatter: {
          ...baseIntelligence.whyDoesItMatter,
          environmentalImpact: d.whyItMatters || baseIntelligence.whyDoesItMatter.environmentalImpact,
          biophysicalMechanism: d.underlyingDrivers || baseIntelligence.whyDoesItMatter.biophysicalMechanism,
        },
        whatShouldHappenNext: {
          ...baseIntelligence.whatShouldHappenNext,
          topPriority: d.immediateAction || baseIntelligence.whatShouldHappenNext.topPriority,
          whatToMonitor: d.whatToMonitor
            ? [d.whatToMonitor, ...baseIntelligence.whatShouldHappenNext.whatToMonitor.slice(0, 2)]
            : baseIntelligence.whatShouldHappenNext.whatToMonitor,
          whatToAvoid: d.whatToAvoid
            ? [d.whatToAvoid, ...baseIntelligence.whatShouldHappenNext.whatToAvoid.slice(0, 2)]
            : baseIntelligence.whatShouldHappenNext.whatToAvoid,
        },
      };

      interpretationCache.set(cacheKey, enhanced);
      return enhanced;
    }
  } catch (err: any) {
    // Silently fall back to deterministic calculations on network timeout or abort
    if (err.name !== 'AbortError') {
      console.warn('AI enhancement unavailable, running on verified deterministic intelligence.');
    }
  }

  interpretationCache.set(cacheKey, baseIntelligence);
  return baseIntelligence;
}
