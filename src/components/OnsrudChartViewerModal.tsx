import React, { useState } from 'react';
import { HARD_PLASTIC_SERIES, MDF_SERIES, SOFT_PLASTIC_SERIES, DIAMETERS } from '../data/onsrudCharts';
import { MaterialCategory } from '../types';
import { X, Search, Table, ArrowUpRight, Filter } from 'lucide-react';

interface OnsrudChartViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSeriesAndDiameter: (materialId: MaterialCategory, series: string, diameterFraction: string) => void;
}

export const OnsrudChartViewerModal: React.FC<OnsrudChartViewerModalProps> = ({
  isOpen,
  onClose,
  onSelectSeriesAndDiameter,
}) => {
  const [activeTab, setActiveTab] = useState<MaterialCategory>('hard_plastic');
  const [searchTerm, setSearchTerm] = useState('');
  const [diameterFilter, setDiameterFilter] = useState<string>('all');

  if (!isOpen) return null;

  const getSeriesData = () => {
    switch (activeTab) {
      case 'hard_plastic':
        return HARD_PLASTIC_SERIES;
      case 'mdf':
        return MDF_SERIES;
      case 'soft_plastic':
        return SOFT_PLASTIC_SERIES;
      default:
        return HARD_PLASTIC_SERIES;
    }
  };

  const rawSeries = getSeriesData();

  // Filter series rows
  const filteredSeries = rawSeries.filter((s) =>
    s.series.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter diameter columns
  const activeDiameters =
    diameterFilter === 'all'
      ? DIAMETERS
      : DIAMETERS.filter((d) => d.fraction === diameterFilter);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>LMT Onsrud Chip Load Matrix</span>
                <span className="text-xs font-normal text-slate-400">Technical Data</span>
              </h2>
              <p className="text-xs text-slate-400">
                Click any cell to load the Series & Diameter directly into the calculator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          {/* Material Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('hard_plastic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'hard_plastic'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hard Plastic (HP)
            </button>
            <button
              onClick={() => setActiveTab('soft_plastic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'soft_plastic'
                  ? 'bg-teal-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Soft Plastic (SP)
            </button>
            <button
              onClick={() => setActiveTab('mdf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'mdf'
                  ? 'bg-amber-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MDF (CW)
            </button>
          </div>

          {/* Search & Diameter Filter */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search series (e.g., 63-700, 52-200)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={diameterFilter}
                onChange={(e) => setDiameterFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2 py-1.5 focus:outline-none"
              >
                <option value="all">All Diameters</option>
                {DIAMETERS.map((d) => (
                  <option key={d.fraction} value={d.fraction}>
                    {d.fraction}"
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 bg-slate-950/50">
          <div className="min-w-max border border-slate-800 rounded-xl overflow-hidden shadow-inner bg-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-300 font-mono border-b border-slate-800 sticky top-0 z-10 shadow-sm">
                  <th className="p-3 border-r border-slate-800 bg-slate-950 sticky left-0 z-20 font-semibold w-28">
                    Series
                  </th>
                  <th className="p-3 border-r border-slate-800 font-semibold w-20">Cut</th>
                  {activeDiameters.map((d) => (
                    <th key={d.fraction} className="p-2.5 text-center border-r border-slate-800/80 font-bold text-cyan-300 min-w-[70px]">
                      {d.fraction}"
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredSeries.map((s) => (
                  <tr key={s.series} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Series Name */}
                    <td className="p-3 border-r border-slate-800 font-bold text-slate-200 bg-slate-900 group-hover:bg-slate-800 sticky left-0 z-10">
                      {s.series}
                    </td>
                    {/* Cut Type */}
                    <td className="p-3 border-r border-slate-800 text-slate-400 text-[11px]">
                      {s.cut || '1 x D'}
                    </td>
                    {/* Diameter Columns */}
                    {activeDiameters.map((d) => {
                      const range = s.chipLoads[d.fraction];
                      if (!range) {
                        return (
                          <td key={d.fraction} className="p-2 text-center text-slate-700 border-r border-slate-800/40 text-[11px]">
                            —
                          </td>
                        );
                      }

                      const [min, max] = range;
                      const formatted = `.${min.toString().split('.')[1] || min}-${max.toString().split('.')[1] || max}`;

                      return (
                        <td key={d.fraction} className="p-1 text-center border-r border-slate-800/40">
                          <button
                            onClick={() => {
                              onSelectSeriesAndDiameter(activeTab, s.series, d.fraction);
                              onClose();
                            }}
                            className="w-full py-1.5 px-1 rounded-md bg-cyan-950/40 hover:bg-cyan-600 hover:text-white text-cyan-300 font-semibold text-[11px] transition-all border border-cyan-800/40 flex items-center justify-center gap-0.5 group/btn"
                            title={`Click to load Series ${s.series} with ${d.fraction}" tool`}
                          >
                            <span>{formatted}</span>
                            <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div>
            Depth of cut rule: <strong>1xD</strong> = 100% chip load, <strong>2xD</strong> = 75%, <strong>3xD</strong> = 50%.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
