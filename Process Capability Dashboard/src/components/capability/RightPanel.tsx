import { CapabilityConfig, SpecificationMode } from "../../lib/capability-types";
import { validateSpecifications } from "../../lib/spec-validation";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { AlertCircle, Info, Lock, BookOpen, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Alert, AlertDescription } from "../ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

type RightPanelProps = {
  isOpen: boolean;
  config: CapabilityConfig;
  setConfig: (config: CapabilityConfig) => void;
};

const AVAILABLE_UNITS = ["mm", "cm", "m", "in", "ft", "µm", "nm", "kg", "g", "mg", "°C", "°F", "psi", "MPa", "%"];

export function RightPanel({ isOpen, config, setConfig }: RightPanelProps) {
  const [openSections, setOpenSections] = useState({
    specs: true,
    methods: true,
    outliers: true,
    notes: true
  });

  // Local state for form editing (Apply/Reset pattern)
  const [localConfig, setLocalConfig] = useState<CapabilityConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync external config changes
  useEffect(() => {
    setLocalConfig(config);
    setHasChanges(false);
  }, [config]);

  // Validation state
  const specValidation = useMemo(() => 
    validateSpecifications(localConfig), 
    [localConfig.specifications]
  );

  // Check if LSL field has errors
  const lslErrors = specValidation.errors.filter(e => 
    e.field === "specifications" || e.field === "specifications.lsl"
  );
  const lslWarnings = specValidation.warnings.filter(e => 
    e.field === "specifications" || e.field === "specifications.lsl"
  );

  // Check if Target field has errors
  const targetErrors = specValidation.errors.filter(e => 
    e.field === "specifications.target"
  );
  const targetWarnings = specValidation.warnings.filter(e => 
    e.field === "specifications.target"
  );

  // Check if USL field has errors
  const uslErrors = specValidation.errors.filter(e => 
    e.field === "specifications" || e.field === "specifications.usl"
  );
  const uslWarnings = specValidation.warnings.filter(e => 
    e.field === "specifications" || e.field === "specifications.usl"
  );

  // Check if any spec field is empty
  const { mode, lsl, usl, target } = localConfig.specifications;
  const hasEmptyFields = 
    (mode === "two-sided" && (lsl === undefined || usl === undefined)) ||
    (mode === "upper-only" && usl === undefined) ||
    (mode === "lower-only" && lsl === undefined);

  const canApply = hasChanges && !hasEmptyFields && specValidation.isValid;

  if (!isOpen) return null;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLocalChange = (updates: Partial<CapabilityConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSpecChange = (updates: Partial<typeof localConfig.specifications>) => {
    handleLocalChange({
      specifications: { ...localConfig.specifications, ...updates }
    });
  };

  const handleModeChange = (newMode: SpecificationMode) => {
    handleSpecChange({ mode: newMode });
  };

  const handleApply = () => {
    if (canApply) {
      setConfig(localConfig);
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  return (
    <aside className="fixed right-0 top-[105px] bottom-[73px] w-96 bg-white border-l border-slate-200 flex flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Specifications & Inputs */}
          <Collapsible open={openSections.specs}>
            <CollapsibleTrigger 
              onClick={() => toggleSection('specs')}
              className="flex items-center justify-between w-full mb-4 hover:text-slate-600 sticky top-0 bg-white z-10 py-2"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-slate-900">Specifications & Inputs</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href="/docs/spc-spec-limits" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BookOpen className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View SOP: Specification Limits</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.specs ? '' : '-rotate-90'}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-4">
                {/* Empty state guidance */}
                {hasEmptyFields && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Enter specification limits to begin capability setup.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Capability education hook - PROMINENT */}
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-900">
                    <strong>Prerequisite:</strong> Capability indices assume a stable process.{" "}
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-xs text-amber-900 underline"
                      onClick={() => window.open('/control-charts', '_blank')}
                    >
                      Verify control first
                    </Button>
                  </AlertDescription>
                </Alert>

                {/* Specification Mode Control */}
                <div>
                  <Label htmlFor="spec-mode">Specification mode</Label>
                  <Select
                    value={mode}
                    onValueChange={(value: SpecificationMode) => handleModeChange(value)}
                  >
                    <SelectTrigger id="spec-mode" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="two-sided">Two-sided (LSL & USL)</SelectItem>
                      <SelectItem value="upper-only">Upper-only (USL)</SelectItem>
                      <SelectItem value="lower-only">Lower-only (LSL)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    Defines which specification limits apply to this feature.
                  </p>
                </div>

                {/* Unit selector */}
                <div>
                  <Label htmlFor="spec-unit">Unit</Label>
                  <Select
                    value={localConfig.specifications.unit}
                    onValueChange={(value) => handleSpecChange({ unit: value })}
                  >
                    <SelectTrigger id="spec-unit" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_UNITS.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    Applies to all specification fields.
                  </p>
                </div>

                {/* LSL - conditionally shown */}
                {(mode === "two-sided" || mode === "lower-only") && (
                  <div>
                    <Label htmlFor="lsl">
                      Lower Spec Limit (LSL)
                      {mode === "two-sided" && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="lsl"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        placeholder="100.00"
                        value={lsl ?? ''}
                        onChange={(e) => handleSpecChange({ 
                          lsl: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                        aria-describedby="lsl-helper lsl-error"
                        aria-invalid={lslErrors.length > 0}
                        className={lslErrors.length > 0 ? "border-red-500" : lslWarnings.length > 0 ? "border-amber-500" : ""}
                      />
                      <Badge variant="outline" className="px-3 flex items-center" aria-label={`Unit: ${localConfig.specifications.unit}`}>
                        {localConfig.specifications.unit}
                      </Badge>
                    </div>
                    <p id="lsl-helper" className="text-xs text-slate-500 mt-1">
                      Minimum acceptable value.{" "}
                      <span className="text-slate-400">Use decimal point (e.g., 100.50)</span>
                    </p>
                    {lslErrors.map((err, i) => (
                      <p key={i} id="lsl-error" className="text-xs text-red-600 mt-1 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{err.message}</span>
                      </p>
                    ))}
                    {lslWarnings.map((warn, i) => (
                      <p key={i} className="text-xs text-amber-600 mt-1 flex items-start gap-1">
                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{warn.message}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Target - always shown for two-sided */}
                {mode === "two-sided" && (
                  <div>
                    <Label htmlFor="target">Target (T)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="target"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        placeholder="150.00"
                        value={target ?? ''}
                        onChange={(e) => handleSpecChange({ 
                          target: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                        aria-describedby="target-helper target-error"
                        aria-invalid={targetErrors.length > 0}
                        className={targetErrors.length > 0 ? "border-red-500" : targetWarnings.length > 0 ? "border-amber-500" : ""}
                      />
                      <Badge variant="outline" className="px-3 flex items-center" aria-label={`Unit: ${localConfig.specifications.unit}`}>
                        {localConfig.specifications.unit}
                      </Badge>
                    </div>
                    <p id="target-helper" className="text-xs text-slate-500 mt-1">
                      Must be strictly between LSL and USL (two-sided mode).
                    </p>
                    {targetErrors.map((err, i) => (
                      <p key={i} id="target-error" className="text-xs text-red-600 mt-1 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{err.message}</span>
                      </p>
                    ))}
                    {targetWarnings.map((warn, i) => (
                      <p key={i} className="text-xs text-amber-600 mt-1 flex items-start gap-1">
                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{warn.message}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* USL - conditionally shown */}
                {(mode === "two-sided" || mode === "upper-only") && (
                  <div>
                    <Label htmlFor="usl">
                      Upper Spec Limit (USL)
                      {mode === "two-sided" && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="usl"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        placeholder="200.00"
                        value={usl ?? ''}
                        onChange={(e) => handleSpecChange({ 
                          usl: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                        aria-describedby="usl-helper usl-error"
                        aria-invalid={uslErrors.length > 0}
                        className={uslErrors.length > 0 ? "border-red-500" : uslWarnings.length > 0 ? "border-amber-500" : ""}
                      />
                      <Badge variant="outline" className="px-3 flex items-center" aria-label={`Unit: ${localConfig.specifications.unit}`}>
                        {localConfig.specifications.unit}
                      </Badge>
                    </div>
                    <p id="usl-helper" className="text-xs text-slate-500 mt-1">
                      Maximum acceptable value.
                    </p>
                    {uslErrors.map((err, i) => (
                      <p key={i} id="usl-error" className="text-xs text-red-600 mt-1 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{err.message}</span>
                      </p>
                    ))}
                    {uslWarnings.map((warn, i) => (
                      <p key={i} className="text-xs text-amber-600 mt-1 flex items-start gap-1">
                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{warn.message}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* One-sided spec note */}
                {mode !== "two-sided" && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Cpm is not computed for single-sided specifications.
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />

                <div>
                  <Label htmlFor="subgroup">Subgroup size (m)</Label>
                  <Input
                    id="subgroup"
                    type="number"
                    min="2"
                    step="1"
                    value={localConfig.subgroupSize}
                    onChange={(e) => handleLocalChange({ subgroupSize: parseInt(e.target.value) })}
                    className="mt-1"
                    aria-describedby="subgroup-helper"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p id="subgroup-helper" className="text-xs text-slate-500 mt-1 flex items-center gap-1 cursor-help">
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
                    checked={localConfig.useStableWindow}
                    onCheckedChange={(checked) => handleLocalChange({ useStableWindow: checked })}
                  />
                </div>

                <div>
                  <Label>Confidence Level</Label>
                  <div className="flex gap-2 mt-1">
                    {[0.9, 0.95, 0.99].map((level) => (
                      <Button
                        key={level}
                        variant={localConfig.ciLevel === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLocalChange({ ciLevel: level as 0.9 | 0.95 | 0.99 })}
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
              className="flex items-center justify-between w-full mb-4 hover:text-slate-600 sticky top-0 bg-white z-10 py-2"
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
                    value={localConfig.estimators.withinEstimator}
                    onValueChange={(value: any) => handleLocalChange({
                      estimators: { ...localConfig.estimators, withinEstimator: value }
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
                    Current: {localConfig.subgroupSize > 1 ? `Subgroup size m=${localConfig.subgroupSize}` : 'Individuals chart'}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mean-estimator">Mean estimator</Label>
                    <p className="text-xs text-slate-500">Median reduces outlier sensitivity</p>
                  </div>
                  <Select
                    value={localConfig.estimators.meanEstimator}
                    onValueChange={(value: any) => handleLocalChange({
                      estimators: { ...localConfig.estimators, meanEstimator: value }
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
                    value={localConfig.estimators.sigmaEstimator}
                    onValueChange={(value: any) => handleLocalChange({
                      estimators: { ...localConfig.estimators, sigmaEstimator: value }
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
                    checked={localConfig.estimators.robustMAD}
                    onCheckedChange={(checked) => handleLocalChange({
                      estimators: { ...localConfig.estimators, robustMAD: checked }
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
              className="flex items-center justify-between w-full mb-4 hover:text-slate-600 sticky top-0 bg-white z-10 py-2"
            >
              <h3 className="text-slate-900">Outliers & Stability</h3>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.outliers ? '' : '-rotate-90'}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="outlier-method">Outlier detection</Label>
                  <Select
                    value={localConfig.outliers.method}
                    onValueChange={(value: any) => handleLocalChange({
                      outliers: { ...localConfig.outliers, method: value }
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
              className="flex items-center justify-between w-full mb-4 hover:text-slate-600 sticky top-0 bg-white z-10 py-2"
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
      </div>

      {/* Fixed footer with Apply/Reset */}
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <div className="flex gap-2">
          <Button
            onClick={handleApply}
            disabled={!canApply}
            className="flex-1"
          >
            Apply
          </Button>
          <Button
            onClick={handleReset}
            disabled={!hasChanges}
            variant="outline"
            className="flex-1"
          >
            Reset
          </Button>
        </div>
        {hasChanges && (
          <p className="text-xs text-slate-500 text-center mt-2">
            You have unsaved changes
          </p>
        )}
      </div>
    </aside>
  );
}
