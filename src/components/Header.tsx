import React from 'react';
import { UnitSystem } from '../types';
import { Wrench, Table, BookOpen, Layers, Ruler } from 'lucide-react';

interface HeaderProps {
  unitSystem: UnitSystem;
  setUnitSystem: (units: UnitSystem) => void;
  onOpenCharts: () => void;
  onOpenFormulas: () => void;
  savedCutsCount: number;
  onOpenSavedCuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unitSystem,
  setUnitSystem,
  onOpenCharts,
  onOpenFormulas,
  savedCutsCount,
  onOpenSavedCuts,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center p-1.5 shadow-md shadow-cyan-900/20 overflow-hidden">
            <img 
              src="./favicon.svg" 
              alt="CNC Machining Icon" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <span>CNC Chip Load Calculator</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-cyan-500/30 font-medium">
                Onsrud Data
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Speeds, Feeds & Chip Load Recommendations
            </p>
          </div>
        </div>

        {/* Right Actions & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Unit Switcher */}
          <div className="bg-slate-800/90 p-1 rounded-lg border border-slate-700/60 flex items-center text-xs">
            <button
              onClick={() => setUnitSystem('imperial')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                unitSystem === 'imperial'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Imperial (in/IPM)
            </button>
            <button
              onClick={() => setUnitSystem('metric')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                unitSystem === 'metric'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Metric (mm/min)
            </button>
          </div>

          {/* Onsrud Charts Modal Button */}
          <button
            onClick={onOpenCharts}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Inspect Onsrud Chart Matrix"
          >
            <Table className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Onsrud Charts</span>
          </button>

          {/* Formulas Guide Modal Button */}
          <button
            onClick={onOpenFormulas}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Milling Formulas & Guidelines"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Formulas</span>
          </button>

          {/* Saved Cut Sheet Button */}
          <button
            onClick={onOpenSavedCuts}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-colors relative"
            title="Saved Cut Sheets"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Cut Sheet</span>
            {savedCutsCount > 0 && (
              <span className="ml-0.5 bg-cyan-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {savedCutsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
