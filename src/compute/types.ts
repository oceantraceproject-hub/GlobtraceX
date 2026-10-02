export type VariableDomain = 'ocean' | 'land' | 'bangladesh';

export type VariableType =
  | 'sst'
  | 'chlorophyll'
  | 'ssh_anomaly'
  | 'lst'
  | 'rainfall'
  | 'vegetation';

export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

export type StabilityStatus =
  | 'STABLE_PERSISTENT'
  | 'RECENT_ACCELERATION'
  | 'PERIOD_SENSITIVE'
  | 'INSUFFICIENT_EVIDENCE';

export type SignificanceMagnitudeQuadrant =
  | 'LARGE_STRONG'
  | 'LARGE_UNCERTAIN'
  | 'SMALL_STRONG'
  | 'SMALL_UNCERTAIN';

export interface ObservationPoint {
  date: string; // YYYY-MM
  year: number;
  month: number;
  rawValue: number;
  climatologyBaseline: number;
  anomaly: number;
  qualityFlag: 'valid' | 'missing' | 'interpolated';
  uncertainty: number;
}

export interface RobustnessAssessment {
  stabilityStatus: StabilityStatus;
  stabilityLabel: string;
  earlyPeriodSlope: number; // units / decade
  earlyPeriodP: number;
  recentPeriodSlope: number; // units / decade
  recentPeriodP: number;
  fullPeriodSlope: number;
  fullPeriodP: number;
  windowSensitivityExplanation: string;
  autocorrelationRisk: 'LOW' | 'MODERATE' | 'HIGH';
  autocorrelationNote: string;
  seasonalityPresent: boolean;
  dataGapPercentage: number;
}

export interface TrendAnalysisResult {
  variable: VariableType;
  variableName: string;
  units: string;
  regionId: string;
  regionName: string;
  domain: VariableDomain;
  datasetId: string;
  datasetName: string;
  provider: string;
  doi: string;
  status: 'TREND-READY' | 'SHORT-RECORD' | 'CONTEXT-ONLY';
  timeRange: {
    start: string;
    end: string;
    totalMonths: number;
    validObservations: number;
    missingObservations: number;
    coveragePct: number;
  };
  baselinePeriod: string;
  // Theil-Sen Non-Parametric Estimator
  theilSenSlope: number; // units per year
  theilSenSlopePerDecade: number;
  theilSenIntercept: number;
  confidenceInterval95: [number, number]; // [lower, upper] per decade
  // Mann-Kendall Rank Test
  mannKendallS: number;
  mannKendallVarS: number;
  mannKendallZ: number;
  mannKendallPValue: number;
  isSignificant005: boolean;
  isSignificant001: boolean;
  trendDirection: TrendDirection;
  // Magnitude
  totalMagnitude: number; // slope * totalYears
  percentChange: number;
  // Robustness & Matrix Innovations
  robustness: RobustnessAssessment;
  quadrant: SignificanceMagnitudeQuadrant;
  quadrantLabel: string;
  // Explainability
  structuredWhyThisResult: {
    direction: string;
    rateStatement: string;
    statisticalAssessment: string;
    uncertaintyStatement: string;
    dataCoverageStatement: string;
    limitationStatement: string;
  };
  whatWouldChangeConclusion: string[];
  limitations: string[];
}

export interface TrendFingerprintItem {
  variable: VariableType;
  name: string;
  unit: string;
  slopePerDecade: number;
  direction: TrendDirection;
  pValue: number;
  isSignificant: boolean;
  dataCompletenessScore: number; // 1-5 dots
  uncertaintyLevel: 'Low' | 'Moderate' | 'High';
}

export interface RegionFingerprint {
  regionId: string;
  regionName: string;
  domain: VariableDomain;
  items: TrendFingerprintItem[];
  overallSummary: string;
}

export interface EvidenceChainNode {
  step: number;
  title: string;
  category: string;
  detail: string;
  sourceValue: string;
  url?: string;
  badge?: string;
}
