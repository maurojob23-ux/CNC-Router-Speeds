import React, { useState, useEffect } from 'react';
import { MaterialCategory, OperationType, DepthOfCut, UnitSystem, SavedCut } from './types';
import { Header } from './components/Header';
import { CalculatorForm } from './components/CalculatorForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { OnsrudChartViewerModal } from './components/OnsrudChartViewerModal';
import { FormulaGuideModal } from './components/FormulaGuideModal';
import { SavedCutsTable } from './components/SavedCutsTable';
import { MATERIALS } from './data/onsrudCharts';

export default function App() {
  // State
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [materialId, setMaterialId] = useState<MaterialCategory>('hard_plastic');
  const [operation, setOperation] = useState<OperationType>('single_pass');
  const [toolDiameterFraction, setToolDiameterFraction] = useState<string>('1/4');
  const [flutes, setFlutes] = useState<number>(1);
  const [selectedSeries, setSelectedSeries] = useState<string>('63-700');
  const [depthOfCut, setDepthOfCut] = useState<DepthOfCut>('1xD');
  const [customDepthMultiplier, setCustomDepthMultiplier] = useState<number>(1.0);
  const [rpm, setRpm] = useState<number>(18000);

  // Saved Cuts State (with LocalStorage)
  const [savedCuts, setSavedCuts] = useState<SavedCut[]>(() => {
    try {
      const stored = localStorage.getItem('cnc_saved_cuts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [isChartsModalOpen, setIsChartsModalOpen] = useState(false);
  const [isFormulasModalOpen, setIsFormulasModalOpen] = useState(false);
  const [activeMainView, setActiveMainView] = useState<'calculator' | 'saved_cuts'>('calculator');

  // Persist saved cuts
  useEffect(() => {
    try {
      localStorage.setItem('cnc_saved_cuts', JSON.stringify(savedCuts));
    } catch {
      // ignore
    }
  }, [savedCuts]);

  // Handle Save Cut
  const handleSaveCut = (newCutData: Omit<SavedCut, 'id' | 'timestamp'>) => {
    const newCut: SavedCut = {
      ...newCutData,
      id: `cut_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    setSavedCuts((prev) => [newCut, ...prev]);
  };

  // Handle Delete Cut
  const handleDeleteCut = (id: string) => {
    setSavedCuts((prev) => prev.filter((c) => c.id !== id));
  };

  // Handle Clear All Cuts
  const handleClearAllCuts = () => {
    setSavedCuts([]);
  };

  // Handle Chart Selection callback
  const handleSelectSeriesAndDiameter = (
    matId: MaterialCategory,
    series: string,
    diameterFraction: string
  ) => {
    setMaterialId(matId);
    setSelectedSeries(series);
    setToolDiameterFraction(diameterFraction);

    // Auto update flutes for plastics vs wood
    if (matId === 'hard_plastic' || matId === 'soft_plastic' || matId === 'aluminum') {
      setFlutes(1);
    } else {
      setFlutes(2);
    }

    setActiveMainView('calculator');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        unitSystem={unitSystem}
        setUnitSystem={setUnitSystem}
        onOpenCharts={() => setIsChartsModalOpen(true)}
        onOpenFormulas={() => setIsFormulasModalOpen(true)}
        savedCutsCount={savedCuts.length}
        onOpenSavedCuts={() => setActiveMainView('saved_cuts')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Main View Switcher Bar (Mobile & Quick Toggle) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveMainView('calculator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeMainView === 'calculator'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => setActiveMainView('saved_cuts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeMainView === 'saved_cuts'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>Saved Cut Sheet Log</span>
              {savedCuts.length > 0 && (
                <span className="bg-slate-800 text-cyan-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {savedCuts.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setIsChartsModalOpen(true)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 underline underline-offset-4"
          >
            View Full Onsrud Matrix →
          </button>
        </div>

        {/* Dynamic Main Section */}
        {activeMainView === 'calculator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Input Form Column */}
            <CalculatorForm
              materialId={materialId}
              setMaterialId={setMaterialId}
              operation={operation}
              setOperation={setOperation}
              toolDiameterFraction={toolDiameterFraction}
              setToolDiameterFraction={setToolDiameterFraction}
              flutes={flutes}
              setFlutes={setFlutes}
              selectedSeries={selectedSeries}
              setSelectedSeries={setSelectedSeries}
              depthOfCut={depthOfCut}
              setDepthOfCut={setDepthOfCut}
              customDepthMultiplier={customDepthMultiplier}
              setCustomDepthMultiplier={setCustomDepthMultiplier}
              rpm={rpm}
              setRpm={setRpm}
              unitSystem={unitSystem}
            />

            {/* Live Results Column */}
            <ResultsDisplay
              materialId={materialId}
              toolDiameterFraction={toolDiameterFraction}
              selectedSeries={selectedSeries}
              flutes={flutes}
              depthOfCut={depthOfCut}
              customDepthMultiplier={customDepthMultiplier}
              rpm={rpm}
              unitSystem={unitSystem}
              onSaveCut={handleSaveCut}
            />
          </div>
        ) : (
          <SavedCutsTable
            savedCuts={savedCuts}
            onDeleteCut={handleDeleteCut}
            onClearAll={handleClearAllCuts}
            unitSystem={unitSystem}
          />
        )}
      </main>

      {/* Onsrud Chart Matrix Modal */}
      <OnsrudChartViewerModal
        isOpen={isChartsModalOpen}
        onClose={() => setIsChartsModalOpen(false)}
        onSelectSeriesAndDiameter={handleSelectSeriesAndDiameter}
      />

      {/* Formulas & Definitions Modal */}
      <FormulaGuideModal
        isOpen={isFormulasModalOpen}
        onClose={() => setIsFormulasModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CNC Milling Chip Load Calculator based on LMT Onsrud Cutting Data Recommendations.</span>
          <span>Imperial & Metric Feeds and Speeds Engine</span>
        </div>
      </footer>
    </div>
  );
}
