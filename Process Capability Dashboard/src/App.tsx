import { useState } from "react";
import { Header } from "./components/capability/Header";
import { RightPanel } from "./components/capability/RightPanel";
import { SummaryTab } from "./components/capability/SummaryTab";
import { DistributionFitTab } from "./components/capability/DistributionFitTab";
import { IndicesTab } from "./components/capability/IndicesTab";
import { NonNormalTab } from "./components/capability/NonNormalTab";
import { RollingCapabilityTab } from "./components/capability/RollingCapabilityTab";
import { AttributeTab } from "./components/capability/AttributeTab";
import { SettingsTab } from "./components/capability/SettingsTab";
import { HelpDialog } from "./components/capability/HelpDialog";
import { BasisSelector, BasisType } from "./components/capability/BasisSelector";
import { WhatIfSimulator } from "./components/capability/WhatIfSimulator";
import { ApplyToDialog } from "./components/capability/ApplyToDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { toast } from "sonner@2.0.3";
import { CapabilityConfig } from "./lib/capability-types";

// Re-export for backward compatibility with existing components
export type { CapabilityConfig } from "./lib/capability-types";
export type {
  SpecificationLimits,
  EstimatorSettings,
  NonNormalSettings,
  OutlierSettings,
  RollingSettings,
  AttributeSettings,
} from "./lib/capability-types";

export default function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const [analysisBasis, setAnalysisBasis] = useState<BasisType>("both");
  
  const [config, setConfig] = useState<CapabilityConfig>({
    // Specification Limits
    specifications: {
      mode: "two-sided",
      lsl: 95.0,
      usl: 105.0,
      target: 100.0,
      unit: "mm"
    },
    
    // Subgrouping and Estimation
    subgroupMode: "xbar-r",
    subgroupSize: 5,
    individualsMRSpan: 2,
    estimators: {
      meanEstimator: "mean",
      sigmaEstimator: "classical",
      withinEstimator: "rbar",
      robustMAD: false
    },
    
    // Non-Normal Analysis
    nonNormal: {
      strategy: "auto",
      manualOverride: false,
      autoThresholds: {
        adPValue: 0.05,
        preferJohnson: false,
        minSampleSize: 30
      },
      fallbackStrategy: "percentile"
    },
    
    // Outlier Handling
    outliers: {
      method: "none",
      params: {},
      excludedIds: []
    },
    
    // Confidence Intervals
    ciLevel: 0.95,
    ciMethod: "bootstrap-percentile",
    bootstrapResamples: 1000,
    bootstrapSeed: 42,
    
    // Stability & Phase Selection
    useStableWindow: true,
    
    // Rolling Capability
    rolling: {
      windowSize: 100,
      stepSize: 5,
      minSamplesPerWindow: 30
    },
    
    // Attribute Data
    attribute: {
      chartType: "p",
      sampleSize: 1000,
      defectives: 32,
      useStandardLimits: true
    },
    
    // Internationalization
    i18n: {
      locale: "en-US",
      decimalSeparator: ".",
      thousandSeparator: ",",
      dateFormat: "MM/DD/YYYY",
      decimalPlaces: 3
    },
    
    // Accessibility
    a11y: {
      colorBlindSafe: false,
      colorBlindType: "none",
      highContrast: false,
      reducedMotion: false,
      keyboardNavigationEnabled: true,
      screenReaderOptimized: false,
      fontSize: "normal"
    },
    
    // Role-Based Access Control
    rbac: {
      role: "engineer",
      canEditSpecs: true,
      canEditOutliers: true,
      canEditEstimators: true,
      canEditNonNormal: true,
      canExport: true,
      canViewAudit: true,
      canApplyToOthers: false,
      requireJustification: false
    },
    
    // Analysis Metadata
    analysisId: "CAP-" + Date.now(),
    analyst: "Current User"
  });

  const handleRecalculate = () => {
    toast.success("Capability updated — v19");
  };

  const handleReset = () => {
    const defaultConfig: CapabilityConfig = {
      specifications: {
        lsl: 95.0,
        usl: 105.0,
        target: 100.0,
        unit: "mm"
      },
      subgroupMode: "xbar-r",
      subgroupSize: 5,
      individualsMRSpan: 2,
      estimators: {
        meanEstimator: "mean",
        sigmaEstimator: "classical",
        withinEstimator: "rbar",
        robustMAD: false
      },
      nonNormal: {
        strategy: "auto",
        manualOverride: false,
        autoThresholds: {
          adPValue: 0.05,
          preferJohnson: false,
          minSampleSize: 30
        },
        fallbackStrategy: "percentile"
      },
      outliers: {
        method: "none",
        params: {},
        excludedIds: []
      },
      ciLevel: 0.95,
      ciMethod: "bootstrap-percentile",
      bootstrapResamples: 1000,
      bootstrapSeed: 42,
      useStableWindow: true,
      rolling: {
        windowSize: 100,
        stepSize: 5,
        minSamplesPerWindow: 30
      },
      attribute: {
        chartType: "p",
        sampleSize: 1000,
        defectives: 32,
        useStandardLimits: true
      },
      i18n: {
        locale: "en-US",
        decimalSeparator: ".",
        thousandSeparator: ",",
        dateFormat: "MM/DD/YYYY",
        decimalPlaces: 3
      },
      a11y: {
        colorBlindSafe: false,
        colorBlindType: "none",
        highContrast: false,
        reducedMotion: false,
        keyboardNavigationEnabled: true,
        screenReaderOptimized: false,
        fontSize: "normal"
      },
      rbac: config.rbac, // Preserve RBAC settings
      analysisId: "CAP-" + Date.now(),
      analyst: config.analyst
    };
    setConfig(defaultConfig);
    toast.success("Reset to defaults — v21");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
        isPanelOpen={isPanelOpen}
        config={config}
      />
      
      <div className="flex">
        <main className={`flex-1 transition-all duration-300 ${isPanelOpen ? 'mr-96' : 'mr-0'}`}>
          <div className="p-6">
            {/* Basis Selector */}
            <div className="mb-6">
              <BasisSelector
                value={analysisBasis}
                onChange={setAnalysisBasis}
                withinEstimator={config.estimators.withinEstimator}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-8 mb-6">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="distribution">Distribution Fit</TabsTrigger>
                <TabsTrigger value="indices">Indices & CI</TabsTrigger>
                <TabsTrigger value="nonnormal">Non-Normal</TabsTrigger>
                <TabsTrigger value="rolling">Rolling</TabsTrigger>
                <TabsTrigger value="whatif">What-If</TabsTrigger>
                <TabsTrigger value="attribute">Attribute</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <SummaryTab config={config} analysisBasis={analysisBasis} />
              </TabsContent>

              <TabsContent value="distribution">
                <DistributionFitTab config={config} />
              </TabsContent>

              <TabsContent value="indices">
                <IndicesTab config={config} />
              </TabsContent>

              <TabsContent value="nonnormal">
                <NonNormalTab config={config} setConfig={setConfig} />
              </TabsContent>

              <TabsContent value="rolling">
                <RollingCapabilityTab config={config} />
              </TabsContent>

              <TabsContent value="whatif">
                <WhatIfSimulator config={config} />
              </TabsContent>

              <TabsContent value="attribute">
                <AttributeTab />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsTab config={config} setConfig={setConfig} />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <RightPanel 
          isOpen={isPanelOpen}
          config={config}
          setConfig={setConfig}
        />
      </div>

      <footer className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex gap-3">
          <Button onClick={handleRecalculate} size="lg">
            Recalculate
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            Reset to defaults
          </Button>
          <ApplyToDialog config={config} />
        </div>
        <HelpDialog />
      </footer>
    </div>
  );
}
