export type DatasetStatus =
  | 'TREND-READY'
  | 'CONTEXT-ONLY'
  | 'SHORT-RECORD'
  | 'REQUIRES-HARMONIZATION'
  | 'NOT-READY-FOR-CURRENT-ANALYSIS';

export type VariableType =
  | 'sst'
  | 'chlorophyll'
  | 'ssh_anomaly'
  | 'mur_sst'
  | 'lst'
  | 'rainfall'
  | 'ndvi';

export interface NasaDataset {
  id: string;
  mission: string;
  instrument: string;
  productTitle: string;
  shortName: string;
  processingLevel: 'Level-2' | 'Level-3' | 'Level-4';
  variable: VariableType;
  variableLabel: string;
  units: string;
  temporalCoverage: {
    start: string;
    end: string | 'Present';
  };
  spatialCoverage: string;
  spatialResolution: string;
  provider:
    | 'NASA Ocean Biology DAAC (OB.DAAC)'
    | 'NASA PO.DAAC'
    | 'NASA PACE Science Team'
    | 'NASA JPL'
    | 'NASA LP DAAC'
    | 'NASA Goddard Earth Sciences (GES) DISC';
  version: string;
  qualityNotes: string;
  accessMethod: string;
  officialSourceUrl: string;
  documentationUrl: string;
  doi: string;
  citation: string;
  status: DatasetStatus;
  lastVerified: string;
  limitations: string[];
}

export interface OceanRegion {
  id: string;
  name: string;
  category: 'Featured' | 'Ocean Basin' | 'Marginal Sea' | 'Global';
  description: string;
  coordinates: {
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
  };
  center: [number, number]; // [lon, lat]
  areaKm2: string;
  oceanBasin: string;
  ecologicalSignificance: string;
  isFeatured?: boolean;
}

export interface MonthlyObservation {
  date: string; // YYYY-MM
  year: number;
  month: number;
  rawValue: number;
  climatologyBaseline: number; // 2002-2020 monthly reference mean
  anomaly: number; // rawValue - climatologyBaseline
  qualityFlag: 'valid' | 'gap_interpolated' | 'cloud_flagged';
  uncertaintyEstimate: number;
}

export interface TrendAnalysisResult {
  variable: VariableType;
  variableName: string;
  units: string;
  region: OceanRegion;
  dataset: NasaDataset;
  timeRange: {
    start: string;
    end: string;
    totalMonths: number;
    validObservations: number;
    missingObservations: number;
    coveragePct: number;
  };
  baselinePeriod: string;
  // OLS statistics
  olsSlope: number; // units per year
  olsIntercept: number;
  olsR2: number;
  olsPValue: number;
  olsStdErr: number;
  // Non-parametric Sen's Slope & Mann-Kendall
  sensSlope: number; // units per year
  mannKendallS: number;
  mannKendallZ: number;
  mannKendallPValue: number;
  isSignificant005: boolean;
  isSignificant001: boolean;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  // Magnitude
  totalMagnitude: number; // Slope * totalYears
  percentChange: number;
  // Scientific Assessment text
  assessmentSummary: string;
  qualityStatus: 'High Quality — Full Record' | 'Short Record — Exploratory Only' | 'Cloud Constrained';
  methodologyNotes: string;
  limitations: string[];
}

export interface CrossVariableResult {
  region: OceanRegion;
  variableA: VariableType;
  variableB: VariableType;
  datasetA: NasaDataset;
  datasetB: NasaDataset;
  overlapPeriod: {
    start: string;
    end: string;
    months: number;
  };
  pearsonR: number;
  spearmanRho: number;
  pValue: number;
  relationshipCharacter: 'Moderate Inverse Correlation' | 'Weak Inverse Correlation' | 'Co-occurring Warm/Low Nutrient Pattern' | 'Weak Positive Association' | 'No Statistically Distinguishable Linear Correlation';
  scientificCaveat: string;
}

export interface SavedInvestigation {
  id: string;
  userId: string;
  title: string;
  regionId: string;
  regionName: string;
  variable: VariableType;
  datasetId: string;
  timeRange: string;
  trendEstimate: string;
  statisticalResult: string;
  notes: string;
  createdAt: string;
}

export interface SavedComparison {
  id: string;
  userId: string;
  title: string;
  regionId: string;
  regionName: string;
  variableA: VariableType;
  variableB: VariableType;
  timeRange: string;
  correlation: string;
  notes: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  displayOrder: number;
  isPublic: boolean;
  under18: boolean;
  bio: string;
  createdAt: string;
  updatedAt: string;
}
