import { MaterialCategory, DepthOfCut, UnitSystem } from '../types';
import { MATERIALS, DIAMETERS } from '../data/onsrudCharts';

export interface ChipLoadLookupResult {
  min: number;
  max: number;
  recommended: number;
  seriesFound: boolean;
  multiplier: number;
}

export function getDepthMultiplier(depthOfCut: DepthOfCut, customMultiplier = 1.0): number {
  switch (depthOfCut) {
    case '1xD':
      return 1.0;
    case '2xD':
      return 0.75; // 25% reduction
    case '3xD':
      return 0.50; // 50% reduction
    case 'custom':
      return customMultiplier;
    default:
      return 1.0;
  }
}

export function lookupChipLoad(
  materialId: MaterialCategory,
  toolDiameterFraction: string,
  seriesName?: string,
  depthOfCut: DepthOfCut = '1xD',
  customDepthMultiplier = 1.0
): ChipLoadLookupResult {
  const mat = MATERIALS.find((m) => m.id === materialId) || MATERIALS[0];
  const depthMult = getDepthMultiplier(depthOfCut, customDepthMultiplier);

  // If a series is selected, look for it in the material's seriesList
  if (seriesName) {
    const seriesData = mat.seriesList.find((s) => s.series === seriesName);
    if (seriesData && seriesData.chipLoads[toolDiameterFraction]) {
      const [rawMin, rawMax] = seriesData.chipLoads[toolDiameterFraction];
      const min = Math.round(rawMin * depthMult * 10000) / 10000;
      const max = Math.round(rawMax * depthMult * 10000) / 10000;
      const recommended = Math.round(((min + max) / 2) * 10000) / 10000;
      return { min, max, recommended, seriesFound: true, multiplier: depthMult };
    }

    // If exact diameter not in that series, find closest diameter in same series
    if (seriesData && Object.keys(seriesData.chipLoads).length > 0) {
      const targetDia = DIAMETERS.find((d) => d.fraction === toolDiameterFraction)?.decimal || 0.25;
      let closestDiaKey = Object.keys(seriesData.chipLoads)[0];
      let minDiff = Infinity;

      for (const diaKey of Object.keys(seriesData.chipLoads)) {
        const diaVal = DIAMETERS.find((d) => d.fraction === diaKey)?.decimal || 0.25;
        const diff = Math.abs(diaVal - targetDia);
        if (diff < minDiff) {
          minDiff = diff;
          closestDiaKey = diaKey;
        }
      }

      if (closestDiaKey) {
        const [rawMin, rawMax] = seriesData.chipLoads[closestDiaKey];
        // Scale proportionally by diameter ratio if needed
        const closestVal = DIAMETERS.find((d) => d.fraction === closestDiaKey)?.decimal || 0.25;
        const scale = targetDia / closestVal;
        const min = Math.round(rawMin * scale * depthMult * 10000) / 10000;
        const max = Math.round(rawMax * scale * depthMult * 10000) / 10000;
        const recommended = Math.round(((min + max) / 2) * 10000) / 10000;
        return { min, max, recommended, seriesFound: true, multiplier: depthMult };
      }
    }
  }

  // Fallback heuristic based on tool diameter & material default
  const diaObj = DIAMETERS.find((d) => d.fraction === toolDiameterFraction) || { decimal: 0.25 };
  const baseChip = mat.defaultChipLoad || 0.005;
  // Standard rule of thumb: chip load scales with tool diameter (~0.02 * diameter)
  const estimatedMin = Math.round(baseChip * (diaObj.decimal / 0.25) * 0.8 * depthMult * 10000) / 10000;
  const estimatedMax = Math.round(baseChip * (diaObj.decimal / 0.25) * 1.2 * depthMult * 10000) / 10000;
  const recommended = Math.round(((estimatedMin + estimatedMax) / 2) * 10000) / 10000;

  return {
    min: Math.max(0.0005, estimatedMin),
    max: Math.max(0.001, estimatedMax),
    recommended: Math.max(0.0008, recommended),
    seriesFound: false,
    multiplier: depthMult,
  };
}

export function calculateFeedRate(
  rpm: number,
  flutes: number,
  chipLoadInches: number
): { ipm: number; mmMin: number } {
  const ipm = Math.round(rpm * flutes * chipLoadInches * 10) / 10;
  const mmMin = Math.round(ipm * 25.4);
  return { ipm, mmMin };
}

export function calculateChipLoadFromFeed(
  feedRate: number,
  rpm: number,
  flutes: number,
  unitSystem: UnitSystem = 'imperial'
): number {
  if (rpm <= 0 || flutes <= 0) return 0;
  const feedIPM = unitSystem === 'metric' ? feedRate / 25.4 : feedRate;
  const chipLoadInches = feedIPM / (rpm * flutes);
  return Math.round(chipLoadInches * 100000) / 100000;
}

export function formatFractionOrDecimal(fraction: string, unitSystem: UnitSystem): string {
  const dia = DIAMETERS.find((d) => d.fraction === fraction);
  if (!dia) return fraction;

  if (unitSystem === 'metric') {
    const mm = Math.round(dia.decimal * 25.4 * 100) / 100;
    return `${mm} mm (${fraction}")`;
  }
  return `${fraction}" (${dia.decimal.toFixed(3)}")`;
}
