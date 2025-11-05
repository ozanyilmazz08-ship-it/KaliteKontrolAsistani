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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { toast } from "sonner@2.0.3";

export type SpecificationLimits = {
  lsl?: number;
  usl?: number;
  target?: number;
  unit: string;
};

export type EstimatorSettings = {
  meanEstimator: "mean" | "median";
  sigmaEstimator: "classical" | "robust";
  withinEstimator: "rbar" | "sbar" | "pooled" | "mr";
  robustMAD: boolean;
};

export type NonNormalSettings = {
  strategy: "auto" | "fit" | "transform" | "percentile";
  distribution?: string;
  lambda?: number;
};

export type OutlierSettings = {
  method: "none" | "iqr" | "sigma" | "manual";
  params: { k?: number; sigma?: number };
  excludedIds: number[];
};

export type CapabilityConfig = {
  specifications: SpecificationLimits;
  estimators: EstimatorSettings;
  nonNormal: NonNormalSettings;
  outliers: OutlierSettings;
  ciLevel: 0.9 | 0.95 | 0.99;
  subgroupSize: number;
  useStableWindow: boolean;
  bootstrapResamples: number;
  bootstrapSeed: number;
};

export default function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  
  const [config, setConfig] = useState<CapabilityConfig>({
    specifications: {
      lsl: 95.0,
      usl: 105.0,
      target: 100.0,
      unit: "mm"
    },
    estimators: {
      meanEstimator: "mean",
      sigmaEstimator: "classical",
      withinEstimator: "rbar",
      robustMAD: false
    },
    nonNormal: {
      strategy: "auto"
    },
    outliers: {
      method: "none",
      params: {},
      excludedIds: []
    },
    ciLevel: 0.95,
    subgroupSize: 5,
    useStableWindow: true,
    bootstrapResamples: 1000,
    bootstrapSeed: 42
  });

  const handleRecalculate = () => {
    toast.success("Capability updated — v19");
  };

  const handleReset = () => {
    setConfig({
      specifications: {
        lsl: 95.0,
        usl: 105.0,
        target: 100.0,
        unit: "mm"
      },
      estimators: {
        meanEstimator: "mean",
        sigmaEstimator: "classical",
        withinEstimator: "rbar",
        robustMAD: false
      },
      nonNormal: {
        strategy: "auto"
      },
      outliers: {
        method: "none",
        params: {},
        excludedIds: []
      },
      ciLevel: 0.95,
      subgroupSize: 5,
      useStableWindow: true,
      bootstrapResamples: 1000,
      bootstrapSeed: 42
    });
    toast.success("Reset to defaults");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
        isPanelOpen={isPanelOpen}
      />
      
      <div className="flex">
        <main className={`flex-1 transition-all duration-300 ${isPanelOpen ? 'mr-96' : 'mr-0'}`}>
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7 mb-6">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="distribution">Distribution Fit</TabsTrigger>
                <TabsTrigger value="indices">Indices & CI</TabsTrigger>
                <TabsTrigger value="nonnormal">Non-Normal</TabsTrigger>
                <TabsTrigger value="rolling">Rolling Capability</TabsTrigger>
                <TabsTrigger value="attribute">Attribute</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <SummaryTab config={config} />
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
          <Button variant="outline" size="lg">
            Apply to…
          </Button>
        </div>
        <HelpDialog />
      </footer>
    </div>
  );
}
