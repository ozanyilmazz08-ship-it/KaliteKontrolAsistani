import { CapabilityConfig } from "../../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Lock, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Separator } from "../ui/separator";

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
          Settings control computational methods, estimators, and guardrails. 
          Changes are logged to Audit History for traceability.
        </AlertDescription>
      </Alert>

      {/* Subgrouping */}
      <Card>
        <CardHeader>
          <CardTitle>Subgrouping Configuration</CardTitle>
          <CardDescription>
            Define rational subgroups and within-subgroup estimator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subgroup-mode">Subgroup mode</Label>
              <Select defaultValue="xbar-r">
                <SelectTrigger id="subgroup-mode" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xbar-r">X̄-R (Xbar-R)</SelectItem>
                  <SelectItem value="xbar-s">X̄-S (Xbar-S)</SelectItem>
                  <SelectItem value="x-mr">X-MR (Individuals)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subgroup-size-setting">Subgroup size (m)</Label>
              <Input
                id="subgroup-size-setting"
                type="number"
                value={config.subgroupSize}
                onChange={(e) => setConfig({ ...config, subgroupSize: parseInt(e.target.value) })}
                min="2"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                m &lt; 4 may reduce sensitivity on X̄-R charts
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="within-est-setting">Within-subgroup estimator (σ̂<sub>within</sub>)</Label>
            <Select
              value={config.estimators.withinEstimator}
              onValueChange={(value: any) => setConfig({
                ...config,
                estimators: { ...config.estimators, withinEstimator: value }
              })}
            >
              <SelectTrigger id="within-est-setting" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rbar">R̄/d₂ (Range method)</SelectItem>
                <SelectItem value="sbar">S̄/c₄ (Std Dev method)</SelectItem>
                <SelectItem value="pooled">Pooled s (recommended for m ≥ 10)</SelectItem>
                <SelectItem value="mr">MR/d₂ (Moving Range for X-MR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.estimators.withinEstimator === "mr" && (
            <div>
              <Label htmlFor="mr-span">Moving Range span</Label>
              <Input
                id="mr-span"
                type="number"
                defaultValue="2"
                min="2"
                max="5"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Default = 2 (consecutive pairs). Higher spans reduce sensitivity to autocorrelation.
              </p>
            </div>
          )}

          <div className="p-3 bg-blue-50 rounded border border-blue-200 text-xs text-blue-900">
            <p className="font-medium mb-1">Rational Subgrouping Principle:</p>
            <p>
              Subgroups should be homogeneous within (capture random variation) and allow for variation 
              between subgroups (capture assignable causes over time). Typical: same shift, same setup, 
              consecutive parts.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estimators */}
      <Card>
        <CardHeader>
          <CardTitle>Estimator Selection</CardTitle>
          <CardDescription>
            Choose estimators for location and scale parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mean-est-setting">Mean estimator (μ̂)</Label>
              <Select
                value={config.estimators.meanEstimator}
                onValueChange={(value: any) => setConfig({
                  ...config,
                  estimators: { ...config.estimators, meanEstimator: value }
                })}
              >
                <SelectTrigger id="mean-est-setting" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mean">Mean (arithmetic average)</SelectItem>
                  <SelectItem value="median">Median (robust to outliers)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Median reduces sensitivity to extreme values
              </p>
            </div>

            <div>
              <Label htmlFor="sigma-est-setting">Sigma estimator (σ̂)</Label>
              <Select
                value={config.estimators.sigmaEstimator}
                onValueChange={(value: any) => setConfig({
                  ...config,
                  estimators: { ...config.estimators, sigmaEstimator: value }
                })}
              >
                <SelectTrigger id="sigma-est-setting" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classical">Classical (sample std dev)</SelectItem>
                  <SelectItem value="robust">Robust (MAD-based)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="robust-mad-setting">Use robust MAD (1.4826 × MAD)</Label>
              <p className="text-xs text-slate-500 mt-1">
                Median Absolute Deviation; robust to outliers and heavy tails
              </p>
            </div>
            <Switch
              id="robust-mad-setting"
              checked={config.estimators.robustMAD}
              onCheckedChange={(checked) => setConfig({
                ...config,
                estimators: { ...config.estimators, robustMAD: checked }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Outlier Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Outlier Detection & Handling</CardTitle>
          <CardDescription>
            Policy for identifying and excluding outliers (use with caution)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="outlier-method-setting">Detection method</Label>
            <Select
              value={config.outliers.method}
              onValueChange={(value: any) => setConfig({
                ...config,
                outliers: { ...config.outliers, method: value }
              })}
            >
              <SelectTrigger id="outlier-method-setting" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (include all points)</SelectItem>
                <SelectItem value="iqr">IQR method (k = 1.5 or 3.0)</SelectItem>
                <SelectItem value="sigma">±3σ or ±4σ</SelectItem>
                <SelectItem value="manual">Manual exclusion list</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.outliers.method === "iqr" && (
            <div>
              <Label htmlFor="iqr-k">IQR multiplier (k)</Label>
              <Select defaultValue="1.5">
                <SelectTrigger id="iqr-k" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.5">k = 1.5 (standard)</SelectItem>
                  <SelectItem value="3.0">k = 3.0 (extreme outliers)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Outliers: x &lt; Q1 - k·IQR or x &gt; Q3 + k·IQR
              </p>
            </div>
          )}

          {config.outliers.method === "sigma" && (
            <div>
              <Label htmlFor="sigma-k">Sigma threshold</Label>
              <Select defaultValue="3">
                <SelectTrigger id="sigma-k" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">±3σ</SelectItem>
                  <SelectItem value="4">±4σ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full">
            Preview outliers (dry-run)
          </Button>

          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-xs text-amber-900">
              Outlier removal requires justification and SOP compliance. Never default to removing outliers 
              without user consent. Log all excluded points to Audit History.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Non-Normal Auto-Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Non-Normal Auto-Selection Thresholds</CardTitle>
          <CardDescription>
            Criteria for automatic distribution selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="gof-threshold">Goodness-of-fit p-value threshold</Label>
            <Input
              id="gof-threshold"
              type="number"
              defaultValue="0.05"
              step="0.01"
              min="0"
              max="1"
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Reject normality if p &lt; threshold. Default: 0.05 (α = 5%)
            </p>
          </div>

          <div>
            <Label>Anderson-Darling quality badges</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="p-2 bg-green-50 rounded border border-green-200">
                <p className="text-xs font-medium text-green-900">Good</p>
                <p className="text-xs text-green-700">p ≥ 0.15</p>
              </div>
              <div className="p-2 bg-amber-50 rounded border border-amber-200">
                <p className="text-xs font-medium text-amber-900">Borderline</p>
                <p className="text-xs text-amber-700">0.05 ≤ p &lt; 0.15</p>
              </div>
              <div className="p-2 bg-red-50 rounded border border-red-200">
                <p className="text-xs font-medium text-red-900">Poor</p>
                <p className="text-xs text-red-700">p &lt; 0.05</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="text-xs text-slate-600 space-y-2">
            <p><strong>Auto-selection algorithm:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Fit Normal, Lognormal, Weibull, Gamma, Exponential, Logistic, Johnson</li>
              <li>Compute Anderson-Darling (AD) statistic and p-value for each</li>
              <li>Select distribution with lowest AD among those with p ≥ threshold</li>
              <li>If all p &lt; threshold, fallback to Johnson transformation</li>
              <li>If Johnson fails, use Percentile (distribution-free) method</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Bootstrapping */}
      <Card>
        <CardHeader>
          <CardTitle>Bootstrap Confidence Intervals</CardTitle>
          <CardDescription>
            Settings for non-parametric CI estimation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bootstrap-resamples">Number of resamples</Label>
              <Input
                id="bootstrap-resamples"
                type="number"
                value={config.bootstrapResamples}
                onChange={(e) => setConfig({ ...config, bootstrapResamples: parseInt(e.target.value) })}
                min="100"
                step="100"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Recommended: 1,000–10,000. Higher = more accurate, slower.
              </p>
            </div>

            <div>
              <Label htmlFor="bootstrap-seed">Random seed</Label>
              <Input
                id="bootstrap-seed"
                type="number"
                value={config.bootstrapSeed}
                onChange={(e) => setConfig({ ...config, bootstrapSeed: parseInt(e.target.value) })}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                For reproducibility. Same seed → same CI.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="bootstrap-method">Bootstrap method</Label>
            <Select defaultValue="percentile">
              <SelectTrigger id="bootstrap-method" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentile">Percentile</SelectItem>
                <SelectItem value="bca">BCa (Bias-Corrected and Accelerated)</SelectItem>
                <SelectItem value="basic">Basic (Reverse percentile)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              BCa is more accurate but slower; Percentile is standard.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
            <p>
              Bootstrap CI (95%): {config.bootstrapResamples.toLocaleString()} resamples; 
              seed = {config.bootstrapSeed} for reproducibility.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* RBAC & Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Access Control (RBAC)</CardTitle>
          <CardDescription>
            User permissions for spec editing, transforms, and outlier policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="text-sm">Edit Specification Limits</p>
              <p className="text-xs text-slate-600">LSL, USL, Target</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Locked: Requires Quality Engineer role or higher</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="text-sm">Apply Transformations</p>
              <p className="text-xs text-slate-600">Box-Cox, Johnson</p>
            </div>
            <Badge variant="default" className="bg-green-600">Allowed</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="text-sm">Exclude Outliers</p>
              <p className="text-xs text-slate-600">Manual or automated exclusion</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Locked: Requires Statistician role; requires SOP approval</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="text-sm">Export Data</p>
              <p className="text-xs text-slate-600">CSV, PDF, JSON</p>
            </div>
            <Badge variant="default" className="bg-green-600">Allowed</Badge>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-900">
              Current user: <strong>John Doe (Quality Engineer)</strong>. 
              Contact your administrator to request elevated permissions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Reproducibility */}
      <Card>
        <CardHeader>
          <CardTitle>Reproducibility & Traceability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            All setting changes are logged to <strong>Audit History</strong> with user, timestamp, 
            before/after values, and data window.
          </p>
          <p>
            Export settings as JSON to reproduce analysis on different datasets or share methodology 
            with collaborators.
          </p>
          <Button variant="outline" size="sm" className="w-full mt-2">
            Export Settings (JSON)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
