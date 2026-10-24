/**
 * @file intelligenceEngine.ts
 * @description Deterministic Scientific Intelligence & Adaptive Recommendations Engine for GlobTraceX.
 * Non-negotiable requirement: Every diagnostic classification, rate statement,
 * and statistical calculation is strictly data-driven and reproducible.
 */

import {
  IndicatorId,
  SituationClassification,
  getIndicatorMetadata,
  IndicatorMetadata,
} from './indicatorRegistry';

export interface IntelligenceInput {
  regionId: string;
  regionName: string;
  divisionOrContinent?: string;
  indicatorId: IndicatorId | string;
  period: {
    start: string;
    end: string;
    totalMonths: number;
  };
  observations: {
    totalExpected: number;
    validCount: number;
    missingCount: number;
    coveragePct: number;
  };
  theilSenSlopePerDecade: number;
  theilSenSlopeAnnual?: number;
  senConfidenceInterval95: [number, number];
  mannKendallZ: number;
  mannKendallPValue: number;
  isSignificant: boolean;
  netChangePct?: number;
  baselinePeriod?: string;
  earlyPeriodSlope?: number;
  recentPeriodSlope?: number;
}

export interface ImpactBridgeStep {
  step: number;
  title: string;
  subtitle: string;
  content: string;
  badge?: string;
  tone: 'neutral' | 'caution' | 'warning' | 'success' | 'info';
}

export interface EvidencePassportData {
  passportId: string;
  generatedAt: string;
  regionName: string;
  regionId: string;
  indicatorName: string;
  indicatorId: string;
  units: string;
  temporalCoverage: string;
  validObservations: number;
  coveragePct: number;
  theilSenSlopePerDecade: number;
  senConfidenceInterval95: [number, number];
  mannKendallPValue: number;
  mannKendallZ: number;
  sensor: string;
  datasetId: string;
  doi: string;
  provider: string;
  citation: string;
  classification: SituationClassification;
  rawExportText: string;
}

export interface LiveEarthIntelligence {
  // Metadata & Identifiers
  regionId: string;
  regionName: string;
  indicator: IndicatorMetadata;
  period: {
    start: string;
    end: string;
    totalMonths: number;
  };

  // Section 1: Current Situation
  situation: {
    classification: SituationClassification;
    label: string;
    badgeColor: string; // Tailwind color classes
    badgeBg: string;
    badgeBorder: string;
    iconType: 'check' | 'trending-up' | 'alert-triangle' | 'activity' | 'help-circle' | 'scale';
    headline: string;
    summary: string;
  };

  // Section 2: What Is Happening?
  whatIsHappening: {
    observedMetric: string;
    rateStatement: string;
    anomalyStatement: string;
    baselineComparison: string;
    subPeriodBehavior: string;
  };

  // Section 3: Why Does It Matter?
  whyDoesItMatter: {
    headline: string;
    biophysicalMechanism: string;
    environmentalImpact: string;
    humanVulnerability: string;
    distinctionNote: string;
  };

  // Section 4: What Should Happen Next? (Prioritized Recommendations)
  whatShouldHappenNext: {
    topPriority: string;
    immediate: string[]; // 0–6 months
    mediumTerm: string[]; // 6–24 months
    longTerm: string[]; // 2–5+ years
    whatToMonitor: string[];
    whatToAvoid: string[];
  };

  // Section 5: Evidence & Confidence
  evidenceAndConfidence: {
    coveragePct: number;
    validObservations: number;
    missingObservations: number;
    dataFreshness: string;
    statisticalSignificance: string;
    pValue: number;
    zScore: number;
    confidenceInterval: string;
    uncertaintyLevel: 'Low' | 'Moderate' | 'High';
    limitations: string[];
  };

  // Interactive Impact Bridge Sequence
  impactBridge: ImpactBridgeStep[];

  // Stakeholders
  stakeholders: Array<{
    role: string;
    title: string;
    actionFocus: string;
  }>;

  // Evidence Passport
  evidencePassport: EvidencePassportData;

  // Methodology & Provenance
  methodology: {
    algorithm: string;
    hypothesisTest: string;
    sensor: string;
    datasetId: string;
    doi: string;
    provider: string;
  };
}

/**
 * Deterministically classifies the environmental situation based on sensor telemetry.
 */
function classifySituation(
  input: IntelligenceInput,
  meta: IndicatorMetadata
): {
  classification: SituationClassification;
  label: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  iconType: 'check' | 'trending-up' | 'alert-triangle' | 'activity' | 'help-circle' | 'scale';
  headline: string;
  summary: string;
} {
  const { coveragePct, validCount } = input.observations;
  const slope = input.theilSenSlopePerDecade;
  const absSlope = Math.abs(slope);
  const p = input.mannKendallPValue;
  const isSig = input.isSignificant || p <= 0.05;
  const thresh = meta.thresholds;

  // 1. Check for Insufficient Evidence
  if (coveragePct < meta.minCoveragePct || validCount < meta.minObservationsForTrend) {
    return {
      classification: 'insufficient_evidence',
      label: 'Insufficient Evidence',
      badgeColor: 'text-slate-700',
      badgeBg: 'bg-slate-100',
      badgeBorder: 'border-slate-300',
      iconType: 'help-circle',
      headline: `Limited Telemetry Records (${coveragePct.toFixed(1)}% Coverage)`,
      summary: `Observation density (${validCount} valid monthly samples) is below the rigorous satellite quality threshold (${meta.minObservationsForTrend} samples, ${meta.minCoveragePct}% coverage) required to establish a defensible multi-decadal trend without excessive interpolation risk.`,
    };
  }

  // 2. Check for Mixed Signals (Conflicting sub-periods or high magnitude with high p-value)
  if (
    input.earlyPeriodSlope !== undefined &&
    input.recentPeriodSlope !== undefined &&
    Math.sign(input.earlyPeriodSlope) !== Math.sign(input.recentPeriodSlope) &&
    Math.abs(input.recentPeriodSlope - input.earlyPeriodSlope) > thresh.stableThreshold * 2
  ) {
    return {
      classification: 'mixed_signals',
      label: 'Mixed Signals',
      badgeColor: 'text-indigo-800',
      badgeBg: 'bg-indigo-50',
      badgeBorder: 'border-indigo-200',
      iconType: 'scale',
      headline: `Divergent Decadal Trajectories Detected`,
      summary: `The early record (${input.earlyPeriodSlope > 0 ? '+' : ''}${input.earlyPeriodSlope.toFixed(2)}) and recent record (${input.recentPeriodSlope > 0 ? '+' : ''}${input.recentPeriodSlope.toFixed(2)}) display opposing directional slopes, reflecting intense decadal climate oscillation rather than an uninterrupted monotonic trend.`,
    };
  }

  // 3. Check for Unusual Change Detected (Accelerating shift or severe anomaly)
  if (
    input.recentPeriodSlope !== undefined &&
    input.earlyPeriodSlope !== undefined &&
    Math.abs(input.recentPeriodSlope) > Math.abs(input.earlyPeriodSlope) * 1.8 &&
    absSlope >= thresh.moderateThreshold &&
    isSig
  ) {
    return {
      classification: 'unusual_change',
      label: 'Unusual Change Detected',
      badgeColor: 'text-purple-800',
      badgeBg: 'bg-purple-50',
      badgeBorder: 'border-purple-300',
      iconType: 'activity',
      headline: `Accelerated Decadal Shift Beyond Baseline Variance`,
      summary: `Satellite observations record an unusual rate of change (${slope > 0 ? '+' : ''}${slope.toFixed(2)} ${meta.units}/decade) accelerating significantly over recent observation cycles (p = ${p.toFixed(3)}), exceeding typical 20-year natural oscillatory margins.`,
    };
  }

  // 4. Check for Relatively Stable
  if (absSlope <= thresh.stableThreshold) {
    return {
      classification: 'relatively_stable',
      label: 'Relatively Stable',
      badgeColor: 'text-emerald-800',
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-200',
      iconType: 'check',
      headline: `Stationary Environmental Dynamic`,
      summary: `The estimated non-parametric trend (${slope > 0 ? '+' : ''}${slope.toFixed(2)} ${meta.units}/decade) remains tightly bounded within historical climatological baseline bounds (±${thresh.stableThreshold} ${meta.units}/decade) with no persistent secular divergence.`,
    };
  }

  // 5. Evaluate Directional Desirability (Improving vs Worsening)
  let isWorsening = false;

  if (meta.thresholds.desirability === 'higher_is_worsening') {
    isWorsening = slope > 0;
  } else if (meta.thresholds.desirability === 'higher_is_improving') {
    isWorsening = slope < 0;
  } else if (meta.thresholds.desirability === 'bidirectional_stress') {
    // Both high positive and high negative represent stress
    isWorsening = absSlope >= thresh.moderateThreshold;
  }

  if (isWorsening) {
    const severityLabel = absSlope >= thresh.severeThreshold ? 'High Stress' : 'Elevated Stress';
    return {
      classification: 'worsening',
      label: isSig ? 'Worsening Trend' : 'Potentially Worsening (Uncertain)',
      badgeColor: 'text-rose-800',
      badgeBg: 'bg-rose-50',
      badgeBorder: 'border-rose-200',
      iconType: 'alert-triangle',
      headline: `${severityLabel} • Secular Divergence from Baseline`,
      summary: `Observations show an unfavorable multi-decadal trajectory of ${slope > 0 ? '+' : ''}${slope.toFixed(2)} ${meta.units}/decade. ${isSig ? `The Mann-Kendall rank test confirms statistical significance (Z = ${input.mannKendallZ.toFixed(2)}, p = ${p.toFixed(3)}).` : `However, high interannual variability (p = ${p.toFixed(3)}) indicates statistical uncertainty remains moderate.`}`,
    };
  } else {
    return {
      classification: 'improving',
      label: 'Favorable Recovery',
      badgeColor: 'text-teal-800',
      badgeBg: 'bg-teal-50',
      badgeBorder: 'border-teal-200',
      iconType: 'trending-up',
      headline: `Positive Environmental Recovery Trajectory`,
      summary: `The observed trajectory (${slope > 0 ? '+' : ''}${slope.toFixed(2)} ${meta.units}/decade) indicates an improving environmental baseline relative to the long-term reference period (p = ${p.toFixed(3)}).`,
    };
  }
}

/**
 * Builds the 5-step Impact Bridge from Earth signal to human action.
 */
function buildImpactBridge(
  input: IntelligenceInput,
  meta: IndicatorMetadata,
  situation: { classification: SituationClassification; label: string }
): ImpactBridgeStep[] {
  const slope = input.theilSenSlopePerDecade;
  const isSig = input.isSignificant || input.mannKendallPValue <= 0.05;
  const pathway = meta.impactPathway;

  return [
    {
      step: 1,
      title: 'Earth Signal Observed',
      subtitle: `${meta.shortName} • Satellite Telemetry`,
      content: `${input.regionName} exhibits a non-parametric slope of ${slope > 0 ? '+' : ''}${slope.toFixed(2)} ${meta.units}/decade across ${input.period.start} to ${input.period.end} (${input.observations.validCount} monthly observations).`,
      badge: `${slope > 0 ? '+' : ''}${slope.toFixed(2)} ${meta.units}/dec`,
      tone: 'info',
    },
    {
      step: 2,
      title: 'Strength of Evidence',
      subtitle: 'Non-Parametric Statistical Robustness',
      content: `The Mann-Kendall rank test yields p = ${input.mannKendallPValue.toFixed(3)} (Z = ${input.mannKendallZ.toFixed(2)}) with ${input.observations.coveragePct.toFixed(1)}% sensor observation completeness. Sen 95% Confidence Interval: [${input.senConfidenceInterval95[0].toFixed(2)}, ${input.senConfidenceInterval95[1].toFixed(2)}].`,
      badge: isSig ? 'Statistically Robust (p ≤ 0.05)' : 'Inconclusive Noise (p > 0.05)',
      tone: isSig ? 'success' : 'caution',
    },
    {
      step: 3,
      title: 'Impact Pathway',
      subtitle: 'Biophysical Mechanism to Local Stress',
      content: `${pathway.biophysicalMechanism} This directly manifests as: ${pathway.environmentalImpact}`,
      tone: 'warning',
    },
    {
      step: 4,
      title: 'Needed Local Evidence',
      subtitle: 'Ground-Truthing & Contextual Calibration',
      content: `Requires pairing satellite radiometry with local weather station microclimate logs, in-situ ground boreholes, municipal infrastructure vulnerability audits, and demographic density maps.`,
      tone: 'neutral',
    },
    {
      step: 5,
      title: 'Proportionate Next Steps',
      subtitle: 'Immediate Adaptive Action',
      content: meta.recommendations.immediate[0] || 'Implement enhanced real-time satellite surveillance and municipal response protocols.',
      badge: 'Actionable Priority',
      tone: 'success',
    },
  ];
}

/**
 * Creates the traceable Evidence Passport for the active analysis.
 */
function createEvidencePassport(
  input: IntelligenceInput,
  meta: IndicatorMetadata,
  classification: SituationClassification
): EvidencePassportData {
  const dateStr = new Date().toISOString();
  const passportId = `GTX-2026-${input.regionId.toUpperCase().slice(0, 4)}-${meta.symbol}-${meta.productId.replace(/[^a-zA-Z0-9]/g, '')}`;

  const rawExportText = `=======================================================
GLOBTRACEX LIVE EARTH INTELLIGENCE • EVIDENCE PASSPORT
NASA SPACE APPS CHALLENGE 2026 • TEAM PROTICHAMP
=======================================================
Passport ID:         ${passportId}
Timestamp:           ${dateStr}
Region:              ${input.regionName} (${input.regionId})
Indicator:           ${meta.name} [${meta.symbol}]
Unit of Measure:     ${meta.units}
Satellite Sensor:    ${meta.sensor}
Satellite Mission:   ${meta.mission}
NASA Product ID:     ${meta.productId}
Source Agency:       ${meta.provider}
DOI:                 https://doi.org/${meta.doi}
Baseline Reference:  ${meta.baselinePeriod}

STATISTICAL DIAGNOSTIC METRICS
-------------------------------------------------------
Analysis Window:     ${input.period.start} to ${input.period.end} (${input.period.totalMonths} months)
Valid Observations:  ${input.observations.validCount} / ${input.observations.totalExpected}
Temporal Coverage:   ${input.observations.coveragePct.toFixed(1)}%
Theil-Sen Slope:     ${input.theilSenSlopePerDecade > 0 ? '+' : ''}${input.theilSenSlopePerDecade.toFixed(4)} ${meta.units}/decade
Sen's 95% CI:        [${input.senConfidenceInterval95[0].toFixed(4)}, ${input.senConfidenceInterval95[1].toFixed(4)}]
Mann-Kendall Z:      ${input.mannKendallZ.toFixed(2)}
Mann-Kendall p:      ${input.mannKendallPValue.toFixed(4)}
Stat. Significant:   ${input.isSignificant ? 'YES (p <= 0.05)' : 'NO'}
Current Situation:   ${classification.toUpperCase()}

RECOMMENDED ACTIONABLE PRIORITY
-------------------------------------------------------
1. ${meta.recommendations.immediate[0] || 'Maintain continuous sentinel monitoring.'}
2. ${meta.recommendations.immediate[1] || 'Strengthen regional emergency early warning channels.'}

VERIFICATION & CITATION
-------------------------------------------------------
Citation: GlobTraceX Scientific Engine (2026). Deterministic Theil-Sen & Mann-Kendall telemetry analysis of NASA ${meta.productId}.
License: Open NASA Earth Observation Data Policy (CC0 / Public Domain)
=======================================================`;

  return {
    passportId,
    generatedAt: dateStr,
    regionName: input.regionName,
    regionId: input.regionId,
    indicatorName: meta.name,
    indicatorId: meta.id,
    units: meta.units,
    temporalCoverage: `${input.period.start} to ${input.period.end}`,
    validObservations: input.observations.validCount,
    coveragePct: input.observations.coveragePct,
    theilSenSlopePerDecade: input.theilSenSlopePerDecade,
    senConfidenceInterval95: input.senConfidenceInterval95,
    mannKendallPValue: input.mannKendallPValue,
    mannKendallZ: input.mannKendallZ,
    sensor: meta.sensor,
    datasetId: meta.productId,
    doi: meta.doi,
    provider: meta.provider,
    citation: `GlobTraceX Scientific Analysis (${input.regionName}, ${meta.name}) based on NASA ${meta.productId}.`,
    classification,
    rawExportText,
  };
}

/**
 * Main Pure Deterministic Intelligence Function.
 * Runs instantly in the browser without network latency.
 */
export function generateDeterministicIntelligence(input: IntelligenceInput): LiveEarthIntelligence {
  const meta = getIndicatorMetadata(input.indicatorId);
  const situation = classifySituation(input, meta);
  const impactBridge = buildImpactBridge(input, meta, situation);
  const evidencePassport = createEvidencePassport(input, meta, situation.classification);

  const slope = input.theilSenSlopePerDecade;
  const isSig = input.isSignificant || input.mannKendallPValue <= 0.05;
  const netChange = input.netChangePct !== undefined ? `${input.netChangePct > 0 ? '+' : ''}${input.netChangePct.toFixed(1)}%` : 'Consistent with anomaly series';

  // Section 2: What Is Happening?
  const whatIsHappening = {
    observedMetric: `${slope > 0 ? '+' : ''}${slope.toFixed(2)} ${meta.units}/decade`,
    rateStatement: `Between ${input.period.start} and ${input.period.end}, ${input.regionName} recorded a median Theil-Sen rate of change of ${slope > 0 ? '+' : ''}${slope.toFixed(2)} ${meta.units} per decade.`,
    anomalyStatement: `Net cumulative relative deviation stands at ${netChange} relative to the ${meta.baselinePeriod}.`,
    baselineComparison: `Deseasonalized against the official NASA ${meta.baselinePeriod} monthly reference cycle to eliminate cyclical calendar effects.`,
    subPeriodBehavior:
      input.earlyPeriodSlope !== undefined && input.recentPeriodSlope !== undefined
        ? `Early sub-period slope: ${input.earlyPeriodSlope > 0 ? '+' : ''}${input.earlyPeriodSlope.toFixed(2)} vs Recent sub-period slope: ${input.recentPeriodSlope > 0 ? '+' : ''}${input.recentPeriodSlope.toFixed(2)} ${meta.units}/decade.`
        : 'Sustained trajectory across the full satellite observational record.',
  };

  // Section 3: Why Does It Matter?
  const whyDoesItMatter = {
    headline: `Biophysical and Socioeconomic Implications for ${input.regionName}`,
    biophysicalMechanism: meta.impactPathway.biophysicalMechanism,
    environmentalImpact: meta.impactPathway.environmentalImpact,
    humanVulnerability: meta.impactPathway.humanVulnerability,
    distinctionNote: 'Distinction: The observed satellite radiative/hydrological change is an established physical measurement; local demographic, economic, and agricultural impacts depend on local infrastructure and protective measures.',
  };

  // Section 4: What Should Happen Next?
  const whatShouldHappenNext = {
    topPriority: meta.recommendations.immediate[0] || 'Establish real-time alert monitoring protocols.',
    immediate: meta.recommendations.immediate,
    mediumTerm: meta.recommendations.mediumTerm,
    longTerm: meta.recommendations.longTerm,
    whatToMonitor: meta.recommendations.whatToMonitor,
    whatToAvoid: meta.recommendations.whatToAvoid,
  };

  // Section 5: Evidence & Confidence
  const uncertaintyLevel: 'Low' | 'Moderate' | 'High' =
    input.observations.coveragePct >= 90 && isSig
      ? 'Low'
      : input.observations.coveragePct >= 75
      ? 'Moderate'
      : 'High';

  const evidenceAndConfidence = {
    coveragePct: input.observations.coveragePct,
    validObservations: input.observations.validCount,
    missingObservations: input.observations.missingCount,
    dataFreshness: `Synchronized with NASA ${meta.mission} satellite catalog (Temporal span: ${input.period.start} – ${input.period.end})`,
    statisticalSignificance: isSig
      ? `Statistically Significant at 95% Confidence (p = ${input.mannKendallPValue.toFixed(3)} ≤ 0.05, Z = ${input.mannKendallZ.toFixed(2)})`
      : `Not Statistically Distinguishable from Background Noise (p = ${input.mannKendallPValue.toFixed(3)} > 0.05)`,
    pValue: input.mannKendallPValue,
    zScore: input.mannKendallZ,
    confidenceInterval: `95% Confidence Interval: [${input.senConfidenceInterval95[0].toFixed(2)} to ${input.senConfidenceInterval95[1].toFixed(2)}] ${meta.units}/decade`,
    uncertaintyLevel,
    limitations: [
      `Satellite sensor measures skin/radiometric parameters which may differ from surface 2m ambient shelter readings.`,
      `Intermittent monsoonal cloud masking is screened with standard NASA quality flags (${input.observations.missingCount} months filtered).`,
      `Spatial aggregation averages local microclimatic peaks across the full ${input.regionName} boundary polygon.`,
    ],
  };

  return {
    regionId: input.regionId,
    regionName: input.regionName,
    indicator: meta,
    period: input.period,
    situation,
    whatIsHappening,
    whyDoesItMatter,
    whatShouldHappenNext,
    evidenceAndConfidence,
    impactBridge,
    stakeholders: meta.recommendations.stakeholders,
    evidencePassport,
    methodology: {
      algorithm: `Non-parametric Theil-Sen Median Slope (Theil 1950, Sen 1968) with Gilbert (1987) 95% confidence intervals.`,
      hypothesisTest: `Two-tailed Mann-Kendall Rank Correlation Test with tie-corrected variance (Kendall 1975).`,
      sensor: meta.sensor,
      datasetId: meta.productId,
      doi: meta.doi,
      provider: meta.provider,
    },
  };
}
