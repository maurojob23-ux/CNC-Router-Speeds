export type UnitSystem = 'imperial' | 'metric';

export type MaterialCategory = 'hard_plastic' | 'soft_plastic' | 'mdf' | 'aluminum' | 'hardwood_softwood' | 'composite' | 'acrylic' | 'custom';

export type OperationType = 'single_pass' | 'roughing' | 'finishing';

export type DepthOfCut = '1xD' | '2xD' | '3xD' | 'custom';

export interface ToolSeriesData {
  series: string;
  name?: string;
  description?: string;
  cut?: string;
  // Map of diameter string (e.g. "1/4") to min-max chip load tuple or array [min, max]
  chipLoads: Record<string, [number, number] | number[]>;
}

export interface RecommendationSet {
  good?: string;
  better?: string;
  best?: string;
}

export interface MaterialRecommendations {
  underHalfInch: {
    singlePass?: RecommendationSet;
    roughing?: RecommendationSet;
    finishing?: RecommendationSet;
  };
  halfInchAndAbove: {
    singlePass?: RecommendationSet;
    roughing?: RecommendationSet;
    finishing?: RecommendationSet;
  };
}

export interface MaterialConfig {
  id: MaterialCategory;
  name: string;
  code: string;
  color: string;
  description: string;
  warnings?: string[];
  recommendations?: MaterialRecommendations;
  seriesList: ToolSeriesData[];
  defaultChipLoad?: number; // fallback chip load if series not selected
}

export interface CalculationInput {
  materialId: MaterialCategory;
  toolDiameterFraction: string; // e.g. "1/4"
  toolDiameterInches: number; // e.g. 0.25
  flutes: number;
  operation: OperationType;
  selectedSeries: string; // e.g. "63-700"
  depthOfCut: DepthOfCut;
  customDepthMultiplier: number; // 1.0, 0.75, 0.5, etc.
  rpm: number;
  targetChipLoad: number; // in inches
  unitSystem: UnitSystem;
}

export interface SavedCut {
  id: string;
  timestamp: number;
  label: string;
  materialName: string;
  toolDiameterFraction: string;
  toolDiameterInches: number;
  flutes: number;
  series: string;
  rpm: number;
  chipLoadInches: number;
  feedRateIPM: number;
  feedRateMMMin: number;
  depthOfCut: string;
}
