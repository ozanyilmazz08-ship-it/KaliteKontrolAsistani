import { CapabilityConfig } from "../../App";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { AlertCircle, Info, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Alert, AlertDescription } from "../ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type RightPanelProps = {
  isOpen: boolean;
  config: CapabilityConfig;
  setConfig: (config: CapabilityConfig) => void;
};

export function RightPanel({ isOpen, config, setConfig }: RightPanelProps) {
  const [openSections, setOpenSections] = useState({
    specs: true,
    methods: true,
    outliers: true,
    notes: true
  });

  if (!isOpen) return null;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className="fixed right-0 top-[73px] bottom-[73px] w-96 bg-white border-l border-slate-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Specifications & Inputs */}
        <Collapsible open={openSections.specs}>
          <CollapsibleTrigger 
            onClick={() => toggleSection('specs')}
            className="flex items-center justify-between w-full mb-4 hover:text-slate-600"
          >
            <h3 className="text-slate-900">Specifications & Inputs</h3>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.specs ? '' : '-rotate-90'}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lsl">Lower Spec Limit (LSL)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="lsl"
                    type="number"
                    value={config.specifications.lsl}
                    onChange={(e) => setConfig({
                      ...config,
                      specifications: { ...config.specifications, lsl: parseFloat(e.target.value) }
                    })}
                    step="0.1"
                  />
                  <Badge variant="outline" className="px-3 flex items-center">
                    {config.specifications.unit}
                  </Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="target">Target (T)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="target"
                    type="number"
                    value={config.specifications.target}
                    onChange={(e) => setConfig({
                      ...config,
                      specifications: { ...config.specifications, target: parseFloat(e.target.value) }
                    })}
                    step="0.1"
                  />
                  <Badge variant="outline" className="px-3 flex items-center">
                    {config.specifications.unit}
                  </Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="usl">Upper Spec Limit (USL)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="usl"
                    type="number"
                    value={config.specifications.usl}
                    onChange={(e) => setConfig({
                      ...config,
                      specifications: { ...config.specifications, usl: parseFloat(e.target.value) }
                    })}
                    step="0.1"
                  />
                  <Badge variant="outline" className="px-3 flex items-center">
                    {config.specifications.unit}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="subgroup">Subgroup size (m)</Label>
                <Input
                  id="subgroup"
                  type="number"
                  value={config.subgroupSize}
                  onChange={(e) => setConfig({ ...config, subgroupSize: parseInt(e.target.value) })}
                  min="2"
                  className="mt-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 cursor-help">
                        <Info className="h-3 w-3" />
                        Rational subgrouping hint
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Subgroups should capture within-time variation; across-time goes to between-subgroup variation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="stable-window">Use stable window for short-term</Label>
                <Switch
                  id="stable-window"
                  checked={config.useStableWindow}
                  onCheckedChange={(checked) => setConfig({ ...config, useStableWindow: checked })}
                />
              </div>

              <div>
                <Label>Confidence Level</Label>
                <div className="flex gap-2 mt-1">
                  {[0.9, 0.95, 0.99].map((level) => (
                    <Button
                      key={level}
                      variant={config.ciLevel === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig({ ...config, ciLevel: level as 0.9 | 0.95 | 0.99 })}
                      className="flex-1"
                    >
                      {(level * 100).toFixed(0)}%
                    </Button>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  N = 150 samples. For reliable indices, N ≥ 25 recommended.
                </AlertDescription>
              </Alert>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Method & Estimators */}
        <Collapsible open={openSections.methods}>
          <CollapsibleTrigger 
            onClick={() => toggleSection('methods')}
            className="flex items-center justify-between w-full mb-4 hover:text-slate-600"
          >
            <h3 className="text-slate-900">Method & Estimators</h3>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.methods ? '' : '-rotate-90'}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Label htmlFor="within-estimator">Within-subgroup estimator (σ̂<sub>within</sub>)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-slate-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium mb-1">Short-term Variation Estimator</p>
                        <p className="text-xs mb-2">Isolates within-subgroup (random) variation:</p>
                        <p className="text-xs">• R̄/d₂: Best for 2 ≤ m ≤ 10, quick calculation</p>
                        <p className="text-xs">• S̄/c₄: More efficient for m &gt; 10</p>
                        <p className="text-xs">• Pooled s: Most efficient, any m</p>
                        <p className="text-xs">• MR/d₂: For Individuals (m=1) chart</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  value={config.estimators.withinEstimator}
                  onValueChange={(value: any) => setConfig({
                    ...config,
                    estimators: { ...config.estimators, withinEstimator: value }
                  })}
                >
                  <SelectTrigger id="within-estimator" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rbar">R̄/d₂ (Range method)</SelectItem>
                    <SelectItem value="sbar">S̄/c₄ (Std Dev method)</SelectItem>
                    <SelectItem value="pooled">Pooled s (most efficient)</SelectItem>
                    <SelectItem value="mr">MR/d₂ (Individuals/MR)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  Current: {config.subgroupSize > 1 ? `Subgroup size m=${config.subgroupSize}` : 'Individuals chart'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mean-estimator">Mean estimator</Label>
                  <p className="text-xs text-slate-500">Median reduces outlier sensitivity</p>
                </div>
                <Select
                  value={config.estimators.meanEstimator}
                  onValueChange={(value: any) => setConfig({
                    ...config,
                    estimators: { ...config.estimators, meanEstimator: value }
                  })}
                >
                  <SelectTrigger id="mean-estimator" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mean">Mean</SelectItem>
                    <SelectItem value="median">Median</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sigma-estimator">Sigma estimator</Label>
                </div>
                <Select
                  value={config.estimators.sigmaEstimator}
                  onValueChange={(value: any) => setConfig({
                    ...config,
                    estimators: { ...config.estimators, sigmaEstimator: value }
                  })}
                >
                  <SelectTrigger id="sigma-estimator" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classical">Classical</SelectItem>
                    <SelectItem value="robust">Robust (MAD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="robust-mad">Use robust MAD (1.4826 × MAD)</Label>
                <Switch
                  id="robust-mad"
                  checked={config.estimators.robustMAD}
                  onCheckedChange={(checked) => setConfig({
                    ...config,
                    estimators: { ...config.estimators, robustMAD: checked }
                  })}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Outliers & Stability */}
        <Collapsible open={openSections.outliers}>
          <CollapsibleTrigger 
            onClick={() => toggleSection('outliers')}
            className="flex items-center justify-between w-full mb-4 hover:text-slate-600"
          >
            <h3 className="text-slate-900">Outliers & Stability</h3>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.outliers ? '' : '-rotate-90'}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="outlier-method">Outlier detection</Label>
                <Select
                  value={config.outliers.method}
                  onValueChange={(value: any) => setConfig({
                    ...config,
                    outliers: { ...config.outliers, method: value }
                  })}
                >
                  <SelectTrigger id="outlier-method" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="iqr">IQR (k = 1.5)</SelectItem>
                    <SelectItem value="sigma">±3σ</SelectItem>
                    <SelectItem value="manual">Manual exclude</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                Preview outliers (dry-run)
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Capability assumes process stability. Review control chart if unstable.
                </AlertDescription>
              </Alert>

              <Button variant="link" size="sm" className="w-full">
                View Control Chart
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Notes & Assumptions */}
        <Collapsible open={openSections.notes}>
          <CollapsibleTrigger 
            onClick={() => toggleSection('notes')}
            className="flex items-center justify-between w-full mb-4 hover:text-slate-600"
          >
            <h3 className="text-slate-900">Notes & Assumptions</h3>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.notes ? '' : '-rotate-90'}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="font-medium text-slate-700 mb-1">Short-term vs Long-term</p>
                <p>Short-term (within) estimates isolate within-subgroup variation; Long-term (overall) includes drifts and shifts over time.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="font-medium text-slate-700 mb-1">MSA Prerequisite</p>
                <p>Ensure gage R&R and bias are acceptable before capability analysis.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="font-medium text-slate-700 mb-1">Non-normal handling</p>
                <p>When data are non-normal, use fit-based, transformation, or percentile methods. Auto selects the best-supported option.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="font-medium text-slate-700 mb-1">One-sided specs</p>
                <p>If only USL is set, report Cpu/Ppu and upper tail metrics only.</p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </aside>
  );
}
