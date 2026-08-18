import React from 'react';
import { MaterialCategory, OperationType, DepthOfCut, UnitSystem, RecommendationSet } from '../types';
import { MATERIALS, DIAMETERS } from '../data/onsrudCharts';
import { Settings, Info, Disc, Layers, Zap, CheckCircle2 } from 'lucide-react';

interface CalculatorFormProps {
  materialId: MaterialCategory;
  setMaterialId: (id: MaterialCategory) => void;
  operation: OperationType;
  setOperation: (op: OperationType) => void;
  toolDiameterFraction: string;
  setToolDiameterFraction: (frac: string) => void;
  flutes: number;
  setFlutes: (f: number) => void;
  selectedSeries: string;
  setSelectedSeries: (series: string) => void;
  depthOfCut: DepthOfCut;
  setDepthOfCut: (doc: DepthOfCut) => void;
  customDepthMultiplier: number;
  setCustomDepthMultiplier: (mult: number) => void;
  rpm: number;
  setRpm: (rpm: number) => void;
  unitSystem: UnitSystem;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  materialId,
  setMaterialId,
  operation,
  setOperation,
  toolDiameterFraction,
  setToolDiameterFraction,
  flutes,
  setFlutes,
  selectedSeries,
  setSelectedSeries,
  depthOfCut,
  setDepthOfCut,
  customDepthMultiplier,
  setCustomDepthMultiplier,
  rpm,
  setRpm,
  unitSystem,
}) => {
  const currentMaterial = MATERIALS.find((m) => m.id === materialId) || MATERIALS[0];
  const currentDiaObj = DIAMETERS.find((d) => d.fraction === toolDiameterFraction) || DIAMETERS[6]; // default 1/4"

  // Get Onsrud recommendation for under or >= 1/2" diameter
  const isHalfInchOrGreater = currentDiaObj.decimal >= 0.5;
  const recomGroup = currentMaterial.recommendations
    ? isHalfInchOrGreater
      ? currentMaterial.recommendations.halfInchAndAbove
      : currentMaterial.recommendations.underHalfInch
    : null;

  let recomForOp: RecommendationSet = {};
  if (recomGroup) {
    if (operation === 'single_pass') recomForOp = recomGroup.singlePass || {};
    else if (operation === 'roughing') recomForOp = recomGroup.roughing || {};
    else if (operation === 'finishing') recomForOp = recomGroup.finishing || {};
  }

  // Handle material change
  const handleMaterialChange = (newMatId: MaterialCategory) => {
    setMaterialId(newMatId);
    const newMat = MATERIALS.find((m) => m.id === newMatId);
    if (newMat && newMat.seriesList.length > 0) {
      setSelectedSeries(newMat.seriesList[0].series);
      // Auto-set typical flutes for plastics/aluminum vs wood
      if (newMatId === 'hard_plastic' || newMatId === 'soft_plastic' || newMatId === 'aluminum') {
        setFlutes(1);
      } else {
        setFlutes(2);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Settings className="w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-slate-100">Cut Parameters</h2>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
          Tool & Material Config
        </span>
      </div>

      {/* 1. Material Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center justify-between">
          <span>1. Select Material</span>
          <span className="text-[11px] text-cyan-400 font-normal">
            {currentMaterial.code}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MATERIALS.map((mat) => {
            const isSelected = mat.id === materialId;
            return (
              <button
                key={mat.id}
                type="button"
                onClick={() => handleMaterialChange(mat.id)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500/80 ring-1 ring-cyan-500/30 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-xs text-slate-100">{mat.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {mat.code}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{mat.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Operation Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
          2. Operation Type
        </label>
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['single_pass', 'roughing', 'finishing'] as OperationType[]).map((op) => {
            const isSelected = operation === op;
            const labels = {
              single_pass: 'Single Pass',
              roughing: 'Roughing',
              finishing: 'Finishing',
            };
            return (
              <button
                key={op}
                type="button"
                onClick={() => setOperation(op)}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-center ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {labels[op]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tool Diameter & Flute Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tool Diameter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center justify-between">
            <span>3. Tool Diameter</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {unitSystem === 'metric'
                ? `${(currentDiaObj.decimal * 25.4).toFixed(2)} mm`
                : `${currentDiaObj.decimal.toFixed(3)}"`}
            </span>
          </label>
          <select
            value={toolDiameterFraction}
            onChange={(e) => setToolDiameterFraction(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
          >
            {DIAMETERS.map((d) => (
              <option key={d.fraction} value={d.fraction}>
                {d.fraction}" ({d.decimal.toFixed(3)}" / {(d.decimal * 25.4).toFixed(2)} mm)
              </option>
            ))}
          </select>
        </div>

        {/* Flute Count */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
            4. Cutting Edges / Flutes
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 6].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFlutes(f)}
                className={`py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                  flutes === f
                    ? 'bg-cyan-600 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {f} {f === 1 ? 'Flute' : 'F'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Tool Series Selection & Onsrud Recommendation Badge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
            5. Tool Series
          </label>
          {recomForOp.best && (
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              BEST: Series {recomForOp.best}
            </span>
          )}
        </div>

        {/* Tool Series Dropdown */}
        <select
          value={selectedSeries}
          onChange={(e) => setSelectedSeries(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
        >
          {currentMaterial.seriesList.map((s) => {
            const isGood = recomForOp.good?.includes(s.series);
            const isBetter = recomForOp.better?.includes(s.series);
            const isBest = recomForOp.best?.includes(s.series);
            let badge = '';
            if (isBest) badge = ' ⭐ BEST';
            else if (isBetter) badge = ' 👍 BETTER';
            else if (isGood) badge = ' ✔ GOOD';

            return (
              <option key={s.series} value={s.series}>
                Series {s.series} {s.cut ? `(${s.cut})` : ''} {badge}
              </option>
            );
          })}
        </select>

        {/* Recommended Series Quick Chips */}
        {recomGroup && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] text-slate-400">Onsrud Recs for {operation.replace('_', ' ')}:</span>
            {recomForOp.best && (
              <button
                type="button"
                onClick={() => setSelectedSeries(recomForOp.best!)}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-medium transition-colors ${
                  selectedSeries === recomForOp.best
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-emerald-300 border-emerald-800/60 hover:bg-slate-700'
                }`}
              >
                BEST: {recomForOp.best}
              </button>
            )}
            {recomForOp.better && (
              <button
                type="button"
                onClick={() => setSelectedSeries(recomForOp.better!)}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-medium transition-colors ${
                  selectedSeries === recomForOp.better
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-800 text-blue-300 border-blue-800/60 hover:bg-slate-700'
                }`}
              >
                BETTER: {recomForOp.better}
              </button>
            )}
            {recomForOp.good && (
              <button
                type="button"
                onClick={() => setSelectedSeries(recomForOp.good!)}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-medium transition-colors ${
                  selectedSeries === recomForOp.good
                    ? 'bg-slate-600 text-white border-slate-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                GOOD: {recomForOp.good}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. Depth of Cut Adjustment */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center justify-between">
          <span>6. Depth of Cut (DOC)</span>
          <span className="text-[11px] text-amber-400 font-mono">
            {depthOfCut === '1xD' && '100% Chip Load (1x Dia)'}
            {depthOfCut === '2xD' && '75% Chip Load (-25% Red.)'}
            {depthOfCut === '3xD' && '50% Chip Load (-50% Red.)'}
            {depthOfCut === 'custom' && `${Math.round(customDepthMultiplier * 100)}% Chip Load`}
          </span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['1xD', '2xD', '3xD', 'custom'] as DepthOfCut[]).map((doc) => {
            const isSelected = depthOfCut === doc;
            const labels: Record<DepthOfCut, string> = {
              '1xD': '1 x D (100%)',
              '2xD': '2 x D (-25%)',
              '3xD': '3 x D (-50%)',
              custom: 'Custom',
            };
            return (
              <button
                key={doc}
                type="button"
                onClick={() => setDepthOfCut(doc)}
                className={`py-2 px-2 rounded-xl text-xs font-medium transition-all text-center border ${
                  isSelected
                    ? 'bg-amber-600 border-amber-500 text-white shadow-sm font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {labels[doc]}
              </button>
            );
          })}
        </div>

        {depthOfCut === 'custom' && (
          <div className="pt-2 space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Chip Load Multiplier</span>
              <span className="font-mono text-cyan-400">{(customDepthMultiplier * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.5"
              step="0.05"
              value={customDepthMultiplier}
              onChange={(e) => setCustomDepthMultiplier(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 6. Target Spindle Speed (RPM) */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>7. Spindle Speed (RPM)</span>
          </label>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min="1000"
              max="24000"
              step="500"
              value={rpm}
              onChange={(e) =>
                setRpm(Math.min(24000, Math.max(1000, parseInt(e.target.value) || 12000)))
              }
              className="w-24 bg-slate-950 border border-slate-800 text-slate-100 font-mono font-bold text-center text-sm py-1 rounded-lg focus:outline-none focus:border-cyan-500"
            />
            <span className="text-xs text-slate-400 font-mono">RPM</span>
          </div>
        </div>

        {/* RPM Range Slider */}
        <input
          type="range"
          min="6000"
          max="24000"
          step="500"
          value={Math.min(24000, rpm)}
          onChange={(e) => setRpm(parseInt(e.target.value))}
          className="w-full accent-cyan-500 bg-slate-950 h-2.5 rounded-lg cursor-pointer"
        />

        {/* Quick RPM Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-500 font-medium">Presets:</span>
          {[8000, 10000, 12000, 16000, 18000, 24000].map((presetRpm) => (
            <button
              key={presetRpm}
              type="button"
              onClick={() => setRpm(presetRpm)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-colors ${
                rpm === presetRpm
                  ? 'bg-cyan-600 border-cyan-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {(presetRpm / 1000).toFixed(0)}k RPM
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
