import { CapabilityConfig } from "../../lib/capability-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Lock, Info, Globe, Eye, Keyboard } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Separator } from "../ui/separator";
import { Slider } from "../ui/slider";

type SettingsTabProps = {
  config: CapabilityConfig;
  setConfig: (config: CapabilityConfig) => void;
};

export function SettingsTab({ config, setConfig }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Settings control computational methods, estimators, display preferences, and accessibility features. 
          All changes are logged to Audit History for traceability and compliance.
        </AlertDescription>
      </Alert>

      {/* Subgrouping & Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Subgrouping Configuration
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-medium mb-1">Subgroup Mode Selection</p>
                  <p className="text-xs">
                    <strong>X̄-R:</strong> Range-based for subgroups n=2-10 (Montgomery Ch. 6)<br />
                    <strong>X̄-S:</strong> StdDev-based for subgroups n≥10 (more efficient)<br />
                    <strong>X-MR:</strong> Individuals with Moving Range for single observations
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Define rational subgroups and within-subgroup estimator method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subgroup-mode">Subgroup Mode</Label>
              <Select 
                value={config.subgroupMode} 
                onValueChange={(value: any) => 
                  setConfig({...config, subgroupMode: value})
                }
              >
                <SelectTrigger id="subgroup-mode" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xbar-r">X̄-R (Xbar-R Charts)</SelectItem>
                  <SelectItem value="xbar-s">X̄-S (Xbar-S Charts)</SelectItem>
                  <SelectItem value="x-mr">X-MR (Individuals)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.subgroupMode !== "x-mr" && (
              <div>
                <Label htmlFor="subgroup-size">Subgroup Size (m)</Label>
                <Input
                  id="subgroup-size"
                  type="number"
                  min={2}
                  max={25}
                  value={config.subgroupSize}
                  onChange={(e) => setConfig({...config, subgroupSize: parseInt(e.target.value) || 5})}
                  className="mt-1"
                />
              </div>
            )}

            {config.subgroupMode === "x-mr" && (
              <div>
                <Label htmlFor="mr-span" className="flex items-center gap-2">
                  Moving Range Span
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Number of consecutive points used to compute moving range. 
                          Typical: 2 or 3. Higher values reduce sensitivity to shifts but improve normality.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="mr-span"
                  type="number"
                  min={2}
                  max={5}
                  value={config.individualsMRSpan}
                  onChange={(e) => setConfig({...config, individualsMRSpan: parseInt(e.target.value) || 2})}
                  className="mt-1"
                />
                <p className="text-xs text-slate-600 mt-1">Usually 2 or 3 (AIAG SPC Handbook)</p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="within-estimator">Within-Subgroup Estimator (σ̂<sub>within</sub>)</Label>
            <Select 
              value={config.estimators.withinEstimator}
              onValueChange={(value: any) => 
                setConfig({
                  ...config, 
                  estimators: {...config.estimators, withinEstimator: value}
                })
              }
            >
              <SelectTrigger id="within-estimator" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rbar">R̄/d₂ (Range-based)</SelectItem>
                <SelectItem value="sbar">S̄/c₄ (StdDev-based)</SelectItem>
                <SelectItem value="pooled">Pooled StdDev</SelectItem>
                <SelectItem value="mr">MR/d₂ (for Individuals)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Intervals */}
      <Card>
        <CardHeader>
          <CardTitle>Confidence Intervals</CardTitle>
          <CardDescription>
            Configure CI level and computation method (NIST/SEMATECH Ch. 7)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ci-level">Confidence Level</Label>
              <Select 
                value={config.ciLevel.toString()}
                onValueChange={(value) => 
                  setConfig({...config, ciLevel: parseFloat(value) as 0.9 | 0.95 | 0.99})
                }
              >
                <SelectTrigger id="ci-level" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.9">90%</SelectItem>
                  <SelectItem value="0.95">95% (recommended)</SelectItem>
                  <SelectItem value="0.99">99%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ci-method">CI Method</Label>
              <Select 
                value={config.ciMethod}
                onValueChange={(value: any) => setConfig({...config, ciMethod: value})}
              >
                <SelectTrigger id="ci-method" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analytic">Analytic (fast, assumes normal)</SelectItem>
                  <SelectItem value="bootstrap-percentile">Bootstrap Percentile</SelectItem>
                  <SelectItem value="bootstrap-bca">Bootstrap BCa (best)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bootstrap-resamples">Bootstrap Resamples</Label>
              <Input
                id="bootstrap-resamples"
                type="number"
                min={100}
                max={10000}
                step={100}
                value={config.bootstrapResamples}
                onChange={(e) => setConfig({...config, bootstrapResamples: parseInt(e.target.value) || 1000})}
                className="mt-1"
              />
              <p className="text-xs text-slate-600 mt-1">Recommended: ≥1000 for stable CIs</p>
            </div>

            <div>
              <Label htmlFor="bootstrap-seed">Random Seed (reproducibility)</Label>
              <Input
                id="bootstrap-seed"
                type="number"
                value={config.bootstrapSeed}
                onChange={(e) => setConfig({...config, bootstrapSeed: parseInt(e.target.value) || 42})}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rolling Capability */}
      <Card>
        <CardHeader>
          <CardTitle>Rolling Capability Window</CardTitle>
          <CardDescription>
            Moving window for drift detection and temporal analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="window-size">Window Size</Label>
              <Input
                id="window-size"
                type="number"
                min={20}
                max={500}
                value={config.rolling.windowSize}
                onChange={(e) => setConfig({
                  ...config,
                  rolling: {...config.rolling, windowSize: parseInt(e.target.value) || 100}
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="step-size">Step Size</Label>
              <Input
                id="step-size"
                type="number"
                min={1}
                max={50}
                value={config.rolling.stepSize}
                onChange={(e) => setConfig({
                  ...config,
                  rolling: {...config.rolling, stepSize: parseInt(e.target.value) || 5}
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="min-samples">Min Samples per Window</Label>
              <Input
                id="min-samples"
                type="number"
                min={10}
                max={200}
                value={config.rolling.minSamplesPerWindow}
                onChange={(e) => setConfig({
                  ...config,
                  rolling: {...config.rolling, minSamplesPerWindow: parseInt(e.target.value) || 30}
                })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internationalization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Internationalization & Number Formatting
          </CardTitle>
          <CardDescription>
            Configure locale, decimal separators, and display preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="locale">Locale</Label>
              <Select 
                value={config.i18n.locale}
                onValueChange={(value) => setConfig({
                  ...config,
                  i18n: {...config.i18n, locale: value}
                })}
              >
                <SelectTrigger id="locale" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (United States)</SelectItem>
                  <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
                  <SelectItem value="de-DE">Deutsch (Deutschland)</SelectItem>
                  <SelectItem value="fr-FR">Français (France)</SelectItem>
                  <SelectItem value="es-ES">Español (España)</SelectItem>
                  <SelectItem value="zh-CN">中文 (中国)</SelectItem>
                  <SelectItem value="ja-JP">日本語 (日本)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="decimal-places">Decimal Places</Label>
              <Input
                id="decimal-places"
                type="number"
                min={0}
                max={6}
                value={config.i18n.decimalPlaces}
                onChange={(e) => setConfig({
                  ...config,
                  i18n: {...config.i18n, decimalPlaces: parseInt(e.target.value) || 3}
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="decimal-sep">Decimal Separator</Label>
              <Select 
                value={config.i18n.decimalSeparator}
                onValueChange={(value: any) => setConfig({
                  ...config,
                  i18n: {...config.i18n, decimalSeparator: value}
                })}
              >
                <SelectTrigger id="decimal-sep" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=".">. (period)</SelectItem>
                  <SelectItem value=",">, (comma)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="thousand-sep">Thousand Separator</Label>
              <Select 
                value={config.i18n.thousandSeparator}
                onValueChange={(value: any) => setConfig({
                  ...config,
                  i18n: {...config.i18n, thousandSeparator: value}
                })}
              >
                <SelectTrigger id="thousand-sep" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">, (comma)</SelectItem>
                  <SelectItem value=".">. (period)</SelectItem>
                  <SelectItem value=" ">(space)</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Number Preview</Label>
              <div className="mt-1 p-3 bg-slate-50 border rounded-md">
                <p className="text-sm">
                  Example: {(1234.5678).toLocaleString(config.i18n.locale, {
                    minimumFractionDigits: config.i18n.decimalPlaces,
                    maximumFractionDigits: config.i18n.decimalPlaces
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility (WCAG 2.1 AA)
          </CardTitle>
          <CardDescription>
            Configure visual and interaction preferences for inclusivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="colorblind-safe">Colorblind-Safe Palette</Label>
                <p className="text-xs text-slate-600">Use distinguishable colors</p>
              </div>
              <Switch
                id="colorblind-safe"
                checked={config.a11y.colorBlindSafe}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  a11y: {...config.a11y, colorBlindSafe: checked}
                })}
              />
            </div>

            {config.a11y.colorBlindSafe && (
              <div>
                <Label htmlFor="colorblind-type">Colorblind Type</Label>
                <Select 
                  value={config.a11y.colorBlindType}
                  onValueChange={(value: any) => setConfig({
                    ...config,
                    a11y: {...config.a11y, colorBlindType: value}
                  })}
                >
                  <SelectTrigger id="colorblind-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Auto-detect</SelectItem>
                    <SelectItem value="protanopia">Protanopia (red-blind)</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia (green-blind)</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia (blue-blind)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <p className="text-xs text-slate-600">Increase contrast ratios</p>
              </div>
              <Switch
                id="high-contrast"
                checked={config.a11y.highContrast}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  a11y: {...config.a11y, highContrast: checked}
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduced-motion">Reduced Motion</Label>
                <p className="text-xs text-slate-600">Minimize animations</p>
              </div>
              <Switch
                id="reduced-motion"
                checked={config.a11y.reducedMotion}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  a11y: {...config.a11y, reducedMotion: checked}
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="keyboard-nav">Keyboard Navigation</Label>
                <p className="text-xs text-slate-600">Full keyboard control</p>
              </div>
              <Switch
                id="keyboard-nav"
                checked={config.a11y.keyboardNavigationEnabled}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  a11y: {...config.a11y, keyboardNavigationEnabled: checked}
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="screen-reader">Screen Reader Optimized</Label>
                <p className="text-xs text-slate-600">Enhanced ARIA labels</p>
              </div>
              <Switch
                id="screen-reader"
                checked={config.a11y.screenReaderOptimized}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  a11y: {...config.a11y, screenReaderOptimized: checked}
                })}
              />
            </div>

            <div>
              <Label htmlFor="font-size">Font Size</Label>
              <Select 
                value={config.a11y.fontSize}
                onValueChange={(value: any) => setConfig({
                  ...config,
                  a11y: {...config.a11y, fontSize: value}
                })}
              >
                <SelectTrigger id="font-size" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="x-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RBAC Info (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Role & Permissions
          </CardTitle>
          <CardDescription>
            Your current role and capabilities (managed by administrator)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Current Role:</span>
            <Badge variant="outline">{config.rbac.role}</Badge>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              {config.rbac.canEditSpecs ? "✓" : "×"} Edit Specifications
            </div>
            <div className="flex items-center gap-2">
              {config.rbac.canEditOutliers ? "✓" : "×"} Edit Outliers
            </div>
            <div className="flex items-center gap-2">
              {config.rbac.canEditEstimators ? "✓" : "×"} Edit Estimators
            </div>
            <div className="flex items-center gap-2">
              {config.rbac.canEditNonNormal ? "✓" : "×"} Edit Non-Normal Settings
            </div>
            <div className="flex items-center gap-2">
              {config.rbac.canExport ? "✓" : "×"} Export Reports
            </div>
            <div className="flex items-center gap-2">
              {config.rbac.canViewAudit ? "✓" : "×"} View Audit History
            </div>
            <div className="flex items-center gap-2">
              {config.rbac.canApplyToOthers ? "✓" : "×"} Apply to Other Analyses
            </div>
            <div className="flex items-center gap-2">
              {config.rbac.requireJustification ? "✓" : "×"} Justification Required
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
