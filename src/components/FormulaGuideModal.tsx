import React from 'react';
import { X, BookOpen, Calculator, AlertCircle, Sparkles } from 'lucide-react';

interface FormulaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaGuideModal: React.FC<FormulaGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Milling Formulas & Definitions</h2>
              <p className="text-xs text-slate-400">LMT Onsrud Technical Reference Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-slate-300 text-xs sm:text-sm">
          {/* Core Formulas */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Core CNC Machining Formulas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">Chip Load</span>
                <code className="text-xs font-mono text-cyan-300 block font-bold">
                  Feed Rate / (RPM × # Flutes)
                </code>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">Feed Rate (IPM)</span>
                <code className="text-xs font-mono text-cyan-300 block font-bold">
                  RPM × # Flutes × Chip Load
                </code>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 font-semibold block">Spindle Speed (RPM)</span>
                <code className="text-xs font-mono text-cyan-300 block font-bold">
                  Feed Rate / (# Flutes × Chip Load)
                </code>
              </div>
            </div>
          </div>

          {/* Depth of Cut Adjustments */}
          <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-xl space-y-2">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Depth of Cut Reduction Rules
            </h4>
            <ul className="space-y-1 text-slate-300 text-xs list-disc pl-5">
              <li>
                <strong>1 x Diameter (1xD)</strong>: Use 100% of recommended chip load chart value.
              </li>
              <li>
                <strong>2 x Diameter (2xD)</strong>: Reduce chip load by <strong>25%</strong> (Multiply chart value by 0.75).
              </li>
              <li>
                <strong>3 x Diameter (3xD)</strong>: Reduce chip load by <strong>50%</strong> (Multiply chart value by 0.50).
              </li>
            </ul>
          </div>

          {/* Technical Definitions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Technical Definitions & Plastic Milling Tips
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                <dt className="font-bold text-slate-100 text-xs">IPM (Inches Per Minute)</dt>
                <dd className="text-slate-400 text-xs">
                  The linear speed at which the CNC tool moves across the workpiece.
                </dd>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                <dt className="font-bold text-slate-100 text-xs">Plastic Chip Rewelding</dt>
                <dd className="text-slate-400 text-xs">
                  Occurs when plastic chips melt and stick back onto the cutter due to friction heat. Fix by increasing feed rate or switching to a single-flute tool.
                </dd>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                <dt className="font-bold text-slate-100 text-xs">Cratering</dt>
                <dd className="text-slate-400 text-xs">
                  Tool or material damage caused by taking overly aggressive chip loads or incorrect rake angles.
                </dd>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                <dt className="font-bold text-slate-100 text-xs">Single-Flute O-Flute Bits</dt>
                <dd className="text-slate-400 text-xs">
                  Ideal for soft plastics & soft aluminum. Wide gullet allows large, cool chips to eject instantly before heat builds up.
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
