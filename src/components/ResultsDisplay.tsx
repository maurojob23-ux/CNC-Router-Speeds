import React, { useState } from 'react';
import { MaterialCategory, DepthOfCut, UnitSystem, SavedCut } from '../types';
import { MATERIALS, DIAMETERS } from '../data/onsrudCharts';
import {
  lookupChipLoad,
  calculateFeedRate,
  calculateChipLoadFromFeed,
} from '../utils/calculator';
import {
  Zap,
  Gauge,
  AlertTriangle,
  BookmarkPlus,
  ArrowRightLeft,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface ResultsDisplayProps {
  materialId: MaterialCategory;
  toolDiameterFraction: string;
  selectedSeries: string;
  flutes: number;
  depthOfCut: DepthOfCut;
  customDepthMultiplier: number;
  rpm: number;
  unitSystem: UnitSystem;
  onSaveCut: (cut: Omit<SavedCut, 'id' | 'timestamp'>) => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  materialId,
  toolDiameterFraction,
  selectedSeries,
  flutes,
  depthOfCut,
  customDepthMultiplier,
  rpm,
  unitSystem,
  onSaveCut,
}) => {
  // Mode: 'forward' (calc feed from chip load) or 'reverse_chipload' (calc chipload from feed rate)
  const [calcMode, setCalcMode] = useState<'forward' | 'reverse_chipload'>('forward');
  const [userFeedRate, setUserFeedRate] = useState<number>(100); // for reverse mode
  const [cutLabel, setCutLabel] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const currentMaterial = MATERIALS.find((m) => m.id === materialId) || MATERIALS[0];
  const diaObj = DIAMETERS.find((d) => d.fraction === toolDiameterFraction) || DIAMETERS[6];

  // Lookup Onsrud recommended Chip Load range
  const chipLoadData = lookupChipLoad(
    materialId,
    toolDiameterFraction,
    selectedSeries,
    depthOfCut,
    customDepthMultiplier
  );

  // Active chip load state
  const [selectedChipLoad, setSelectedChipLoad] = useState<number>(chipLoadData.recommended);

  // Update chip load if lookup changes drastically (e.g. tool diameter changed)
  React.useEffect(() => {
    setSelectedChipLoad(chipLoadData.recommended);
  }, [materialId, toolDiameterFraction, selectedSeries, depthOfCut, customDepthMultiplier]);

  // Derived Calculations
  const activeChipLoad =
    calcMode === 'reverse_chipload'
      ? calculateChipLoadFromFeed(userFeedRate, rpm, flutes, unitSystem)
      : selectedChipLoad;

  const { ipm, mmMin } = calculateFeedRate(rpm, flutes, activeChipLoad);

  const primaryFeedRate = unitSystem === 'metric' ? `${mmMin} mm/min` : `${ipm.toFixed(1)} IPM`;
  const secondaryFeedRate = unitSystem === 'metric' ? `${ipm.toFixed(1)} IPM` : `${mmMin} mm/min`;

  // Warning checks
  const isReweldingRisk =
    (materialId === 'hard_plastic' || materialId === 'soft_plastic') &&
    flutes > 1 &&
    rpm > 18000;

  const isChipLoadTooLow = activeChipLoad < chipLoadData.min * 0.7;
  const isChipLoadTooHigh = activeChipLoad > chipLoadData.max * 1.3;

  // Save cut sheet handler
  const handleSaveCut = () => {
    const label =
      cutLabel.trim() ||
      `${currentMaterial.name} - ${toolDiameterFraction}" (${flutes}F, ${rpm} RPM)`;

    onSaveCut({
      label,
      materialName: currentMaterial.name,
      toolDiameterFraction,
      toolDiameterInches: diaObj.decimal,
      flutes,
      series: selectedSeries,
      rpm,
      chipLoadInches: activeChipLoad,
      feedRateIPM: ipm,
      feedRateMMMin: mmMin,
      depthOfCut: depthOfCut === 'custom' ? `${Math.round(customDepthMultiplier * 100)}%` : depthOfCut,
    });

    setCutLabel('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Results Top Header & Mode Switcher */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Calculated Feeds & Speeds</h2>
              <p className="text-[11px] text-slate-400">
                {chipLoadData.seriesFound
                  ? `Onsrud Series ${selectedSeries}`
                  : 'Estimated Standard Material Data'}
              </p>
            </div>
          </div>

          {/* Forward / Reverse Mode Toggle */}
          <button
            onClick={() =>
              setCalcMode(calcMode === 'forward' ? 'reverse_chipload' : 'forward')
            }
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Toggle calculation direction"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">
              {calcMode === 'forward' ? 'Feed Rate Mode' : 'Reverse Mode'}
            </span>
          </button>
        </div>

        {/* Big Feed Rate Display Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-6 text-center space-y-2 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Suggested Feed Rate</span>
          </div>

          <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
            {calcMode === 'forward' ? (
              primaryFeedRate
            ) : (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  value={userFeedRate}
                  onChange={(e) => setUserFeedRate(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-36 bg-slate-900/90 border border-cyan-500 text-cyan-300 font-mono font-bold text-center text-3xl sm:text-4xl py-1 rounded-xl focus:outline-none"
                />
                <span className="text-xl text-slate-400">{unitSystem === 'metric' ? 'mm/min' : 'IPM'}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Equivalent: <span className="text-slate-300 font-semibold">{secondaryFeedRate}</span> @ {rpm.toLocaleString()} RPM
          </div>

          {/* Formula Summary Line */}
          <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="text-slate-500">Formula:</span>
            <span className="text-slate-300">{rpm} RPM</span>
            <span className="text-slate-600">×</span>
            <span className="text-slate-300">{flutes} Flute{flutes > 1 ? 's' : ''}</span>
            <span className="text-slate-600">×</span>
            <span className="text-cyan-400 font-semibold">{activeChipLoad.toFixed(4)}" Chip Load</span>
          </div>
        </div>

        {/* Chip Load Selection & Gauge */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Chip Load per Tooth
            </span>
          </div>

          {/* Current Chip Load Display - 3x bigger and centered */}
          <div className="text-center py-1">
            <div className="inline-flex flex-col items-center justify-center font-mono text-3xl sm:text-4xl font-black text-cyan-400 bg-cyan-950/80 px-6 py-2.5 rounded-xl border border-cyan-800/50 shadow-lg">
              <span>
                {activeChipLoad.toFixed(4)}" <span className="text-lg text-slate-400 font-medium">/ tooth</span>
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-normal">
                ({(activeChipLoad * 25.4).toFixed(3)} mm)
              </span>
            </div>
          </div>

          {/* Recommended Range Info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>Onsrud Rec Min: <strong className="text-slate-200">{chipLoadData.min}"</strong></span>
            <span>Ideal: <strong className="text-cyan-300">{chipLoadData.recommended}"</strong></span>
            <span>Rec Max: <strong className="text-slate-200">{chipLoadData.max}"</strong></span>
          </div>

          {/* Interactive Chip Load Slider (in Forward Mode) */}
          {calcMode === 'forward' && (
            <div className="space-y-1">
              <input
                type="range"
                min={Math.max(0.0005, chipLoadData.min * 0.5)}
                max={chipLoadData.max * 1.5}
                step="0.0001"
                value={selectedChipLoad}
                onChange={(e) => setSelectedChipLoad(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-900 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Lighter Cut</span>
                <button
                  type="button"
                  onClick={() => setSelectedChipLoad(chipLoadData.recommended)}
                  className="text-cyan-400 hover:underline font-medium"
                >
                  Reset to Onsrud Target ({chipLoadData.recommended}")
                </button>
                <span>Heavier Cut</span>
              </div>
            </div>
          )}

          {/* Visual Gauge Bar */}
          <div className="relative pt-1">
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div className="w-1/4 bg-amber-500/40" title="Light Chip Load" />
              <div className="w-1/2 bg-emerald-500/60" title="Recommended Onsrud Range" />
              <div className="w-1/4 bg-red-500/40" title="Heavy Chip Load" />
            </div>
          </div>
        </div>

        {/* Warnings & Milling Guidelines */}
        <div className="space-y-2">
          {isReweldingRisk && (
            <div className="p-3 bg-amber-950/50 border border-amber-800/80 rounded-xl text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Plastic Rewelding Risk!</strong>
                Cutting plastic at high RPM ({rpm} RPM) with {flutes} flutes can cause friction heat & plastic melting. Consider using a <strong>Single Flute (1 Flute)</strong> tool or lowering RPM.
              </div>
            </div>
          )}

          {isChipLoadTooLow && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Chip load is low ({activeChipLoad.toFixed(4)}"):</strong> Cutter may rub against material instead of shearing, generating excess heat and premature tool wear.
              </span>
            </div>
          )}

          {isChipLoadTooHigh && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>Chip load is high ({activeChipLoad.toFixed(4)}"):</strong> Excessive force on cutter risks tool breakage or material cratering.
              </span>
            </div>
          )}

          {/* Material-specific Onsrud Warning Note */}
          {currentMaterial.warnings && currentMaterial.warnings.length > 0 && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-300 text-xs space-y-1">
              <span className="font-semibold text-cyan-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" /> Onsrud Technical Note
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {currentMaterial.warnings[0]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Cut Sheet Form */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase block">
          Save Cut to Sheet
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 1/4 Acrylic Single Pass"
            value={cutLabel}
            onChange={(e) => setCutLabel(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="button"
            onClick={handleSaveCut}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 shrink-0"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Saved to Cut Sheet!
          </div>
        )}
      </div>
    </div>
  );
};
