import { useState } from 'react';
import { RCAProvider, useRCA } from './contexts/RCAContext';
import { TopToolbar } from './components/rca/TopToolbar';
import { MethodTabs } from './components/rca/MethodTabs';
import { Navigator } from './components/rca/Navigator';
import { EvidencePanel } from './components/rca/EvidencePanel';
import { BottomBar } from './components/rca/BottomBar';
import { ConsistencyReport } from './components/rca/ConsistencyReport';
import { FiveWhysEditor } from './components/rca/FiveWhysEditor';
import { FishboneEditor } from './components/rca/FishboneEditor';
import { ParetoEditor } from './components/rca/ParetoEditor';
import { FMEAEditor } from './components/rca/FMEAEditor';
import { FaultTreeEditor } from './components/rca/FaultTreeEditor';
import { AffinityEditor } from './components/rca/AffinityEditor';
import { ScatterEditor } from './components/rca/ScatterEditor';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

function RCAContent() {
  const { currentMethod, selectedNodeId } = useRCA();
  const [showConsistencyReport, setShowConsistencyReport] = useState(false);
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState(false);

  const handleExport = () => {
    toast.success('Export functionality would generate files here');
  };

  const renderMethodEditor = () => {
    switch (currentMethod) {
      case '5whys':
        return <FiveWhysEditor />;
      case 'fishbone':
        return <FishboneEditor />;
      case 'pareto':
        return <ParetoEditor />;
      case 'fmea':
        return <FMEAEditor />;
      case 'fta':
        return <FaultTreeEditor />;
      case 'affinity':
        return <AffinityEditor />;
      case 'scatter':
        return <ScatterEditor />;
      default:
        return <div>Select a method</div>;
    }
  };

  // Fishbone has its own integrated evidence panel
  const showEvidencePanel = currentMethod !== 'fishbone' && !!selectedNodeId;

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopToolbar 
        onExport={handleExport}
        onConsistencyReport={() => setShowConsistencyReport(true)}
      />
      <MethodTabs />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigator */}
        <Navigator 
          isCollapsed={isNavigatorCollapsed}
          onToggleCollapse={() => setIsNavigatorCollapsed(!isNavigatorCollapsed)}
        />

        {/* Center Canvas */}
        <div className="flex-1 overflow-hidden">
          {renderMethodEditor()}
        </div>
      </div>

      <BottomBar />

      {/* Evidence Panel - Sheet overlay for non-Fishbone methods */}
      {currentMethod !== 'fishbone' && <EvidencePanel />}

      <ConsistencyReport 
        open={showConsistencyReport}
        onOpenChange={setShowConsistencyReport}
      />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <RCAProvider>
      <RCAContent />
    </RCAProvider>
  );
}
