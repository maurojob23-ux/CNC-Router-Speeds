import React from 'react';
import { SavedCut, UnitSystem } from '../types';
import { Layers, Trash2, Download, Copy, Check, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface SavedCutsTableProps {
  savedCuts: SavedCut[];
  onDeleteCut: (id: string) => void;
  onClearAll: () => void;
  unitSystem: UnitSystem;
}

export const SavedCutsTable: React.FC<SavedCutsTableProps> = ({
  savedCuts,
  onDeleteCut,
  onClearAll,
  unitSystem,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (savedCuts.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">No Saved Cut Sheets Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Use the "Save to Cut Sheet" form under the calculator results to log and compare tool configurations for your job setup.
        </p>
      </div>
    );
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Label',
      'Material',
      'Tool Diameter',
      'Flutes',
      'Series',
      'RPM',
      'Chip Load (in)',
      'Feed Rate (IPM)',
      'Feed Rate (mm/min)',
      'Depth of Cut',
    ];

    const rows = savedCuts.map((c) => [
      `"${c.label}"`,
      `"${c.materialName}"`,
      `"${c.toolDiameterFraction}"`,
      c.flutes,
      `"${c.series}"`,
      c.rpm,
      c.chipLoadInches,
      c.feedRateIPM,
      c.feedRateMMMin,
      `"${c.depthOfCut}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cnc_cut_sheet_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy to clipboard text
  const handleCopyClipboard = () => {
    const textLines = savedCuts.map(
      (c) =>
        `${c.label}: ${c.materialName} | Tool: ${c.toolDiameterFraction}" (${c.flutes}F, Series ${c.series}) | ${c.rpm} RPM | ${c.feedRateIPM} IPM (${c.feedRateMMMin} mm/min) | Chip Load: ${c.chipLoadInches}" | DOC: ${c.depthOfCut}`
    );

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Table Header & Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Saved Cut Sheet Log</h3>
            <p className="text-xs text-slate-400">
              {savedCuts.length} tool cut configuration{savedCuts.length > 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyClipboard}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onClearAll}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-300 font-mono border-b border-slate-800">
              <th className="p-3 font-semibold">Label & Material</th>
              <th className="p-3 font-semibold">Tool & Series</th>
              <th className="p-3 font-semibold">RPM</th>
              <th className="p-3 font-semibold">Feed Rate</th>
              <th className="p-3 font-semibold">Chip Load</th>
              <th className="p-3 font-semibold">DOC</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {savedCuts.map((cut) => (
              <tr key={cut.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3">
                  <div className="font-bold text-slate-100">{cut.label}</div>
                  <div className="text-[11px] text-slate-400 font-sans">{cut.materialName}</div>
                </td>
                <td className="p-3 text-slate-300">
                  <div>{cut.toolDiameterFraction}" ({cut.flutes} Flute{cut.flutes > 1 ? 's' : ''})</div>
                  <div className="text-[11px] text-cyan-400">Series {cut.series}</div>
                </td>
                <td className="p-3 text-slate-200 font-bold">{cut.rpm.toLocaleString()} RPM</td>
                <td className="p-3">
                  <div className="text-cyan-300 font-bold">
                    {unitSystem === 'metric' ? `${cut.feedRateMMMin} mm/min` : `${cut.feedRateIPM.toFixed(1)} IPM`}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {unitSystem === 'metric' ? `${cut.feedRateIPM.toFixed(1)} IPM` : `${cut.feedRateMMMin} mm/min`}
                  </div>
                </td>
                <td className="p-3 text-amber-300 font-bold">{cut.chipLoadInches.toFixed(4)}"</td>
                <td className="p-3 text-slate-400">{cut.depthOfCut}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => onDeleteCut(cut.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                    title="Delete cut entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
