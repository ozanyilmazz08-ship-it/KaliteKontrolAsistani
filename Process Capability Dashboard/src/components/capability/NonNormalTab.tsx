import { CapabilityConfig } from "../../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Info } from "lucide-react";
import { Slider } from "../ui/slider";

type NonNormalTabProps = {
  config: CapabilityConfig;
  setConfig: (config: CapabilityConfig) => void;
};

const strategyComparisons = [
  {
    strategy: "Normal (baseline)",
    cpk: 1.33,
    ppk: 1.15,
    ppm: 3000,
    note: "Assumes normal distribution"
  },
  {
    strategy: "Fit-based (Weibull)",
    cpk: 1.28,
    ppk: 1.12,
    ppm: 3200,
    note: "Uses Weibull percentiles"
  },
  {
    strategy: "Box-Cox Transform (λ=0.85)",
    cpk: 1.31,
    ppk: 1.14,
    ppm: 2950,
    note: "Power transformation to normality"
  },
  {
    strategy: "Johnson Transform (SU)",
    cpk: 1.30,
    ppk: 1.13,
    ppm: 3050,
    note: "Johnson family transformation"
  },
  {
    strategy: "Percentile (distribution-free)",
    cpk: 1.29,
    ppk: 1.11,
    ppm: 3150,
    note: "Uses empirical quantiles"
  }
];

export function NonNormalTab({ config, setConfig }: NonNormalTabProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          When data are non-normal, use fit-based, transformation, or percentile methods. 
          Auto selects the best-supported option based on goodness-of-fit.
        </AlertDescription>
      </Alert>

      {/* AI-Assisted Recommendation */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-purple-700">AI Recommendation</span>
            <Badge variant="outline" className="text-xs">Beta</Badge>
          </CardTitle>
          <CardDescription className="text-purple-900">
            Intelligent analysis of your data distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded border border-purple-200">
            <p className="text-sm font-medium text-purple-900 mb-2">Analysis Summary</p>
            <p className="text-xs text-slate-700">
              Your data passes normality tests (Shapiro-Wilk p=0.24, AD p=0.28). 
              <strong> Recommendation: Use standard normal-theory capability indices.</strong>
            </p>
          </div>
          
          <div className="text-xs text-slate-600 space-y-2">
            <p className="font-medium">Why this recommendation:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>No evidence of skewness (g₁ = 0.15, within ±1.0)</li>
              <li>Kurtosis normal (g₂ = -0.08, within ±1.0)</li>
              <li>No outliers detected (IQR method)</li>
              <li>Sample size adequate (N=150 ≥ 25)</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-purple-200">
            <p className="text-xs text-slate-600">
              <strong>Alternative if needed:</strong> If visual inspection suggests non-normality, 
              consider Weibull (best non-normal fit, AD=0.51, p=0.19) or Box-Cox transformation (λ=0.85).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Non-Normal Strategy Selection</CardTitle>
          <CardDescription>
            Choose method for handling non-normal data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="strategy">Strategy</Label>
            <Select
              value={config.nonNormal.strategy}
              onValueChange={(value: any) => setConfig({
                ...config,
                nonNormal: { ...config.nonNormal, strategy: value }
              })}
            >
              <SelectTrigger id="strategy" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (best fit)</SelectItem>
                <SelectItem value="fit">Fit-based (distribution)</SelectItem>
                <SelectItem value="transform">Transform (Box-Cox/Johnson)</SelectItem>
                <SelectItem value="percentile">Percentile (distribution-free)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.nonNormal.strategy === "auto" && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm mb-1">
                <strong>Auto-selected:</strong> Normal distribution
              </p>
              <p className="text-xs text-slate-600 mb-2">
                Based on Anderson-Darling test (AD=0.42, p=0.28). Data are consistent with normal distribution.
              </p>
              <div className="text-xs text-slate-700 space-y-1">
                <p><strong>Selection criteria:</strong></p>
                <p>✓ Shapiro-Wilk p = 0.24 (≥ 0.05)</p>
                <p>✓ Anderson-Darling p = 0.28 (≥ 0.05)</p>
                <p>✓ Normal has lowest AD among acceptable fits</p>
              </div>
              <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-blue-300">
                If non-normal methods are required by SOP, select fit-based, transform, or percentile manually.
              </p>
            </div>
          )}

          {config.nonNormal.strategy === "fit" && (
            <div>
              <Label htmlFor="distribution">Distribution</Label>
              <Select
                value={config.nonNormal.distribution || "weibull"}
                onValueChange={(value) => setConfig({
                  ...config,
                  nonNormal: { ...config.nonNormal, distribution: value }
                })}
              >
                <SelectTrigger id="distribution" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="lognormal">Lognormal</SelectItem>
                  <SelectItem value="weibull">Weibull</SelectItem>
                  <SelectItem value="gamma">Gamma</SelectItem>
                  <SelectItem value="exponential">Exponential</SelectItem>
                  <SelectItem value="logistic">Logistic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {config.nonNormal.strategy === "transform" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="transform-method">Transformation</Label>
                <Select defaultValue="boxcox">
                  <SelectTrigger id="transform-method" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boxcox">Box-Cox</SelectItem>
                    <SelectItem value="johnson-su">Johnson SU</SelectItem>
                    <SelectItem value="johnson-sb">Johnson SB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lambda">Box-Cox λ (lambda)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="lambda"
                    min={-2}
                    max={2}
                    step={0.05}
                    value={[config.nonNormal.lambda || 1]}
                    onValueChange={(value) => setConfig({
                      ...config,
                      nonNormal: { ...config.nonNormal, lambda: value[0] }
                    })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={config.nonNormal.lambda || 1}
                    onChange={(e) => setConfig({
                      ...config,
                      nonNormal: { ...config.nonNormal, lambda: parseFloat(e.target.value) }
                    })}
                    step="0.05"
                    className="w-20"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  MLE estimate: λ = 0.85. λ=1 is no transform; λ=0 is log transform.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">
                  <strong>Back-transformed specs:</strong> Capability indices computed on transformed scale, 
                  then defect rates computed using original spec limits with inverse transform.
                </p>
              </div>
            </div>
          )}

          {config.nonNormal.strategy === "percentile" && (
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <p className="text-sm mb-2">
                <strong>Percentile Method (Distribution-Free)</strong>
              </p>
              <p className="text-xs text-slate-600 mb-2">
                Uses empirical quantiles Q<sub>0.00135</sub> and Q<sub>0.99865</sub> as ±3σ analogs.
              </p>
              <p className="text-xs text-slate-600">
                Pseudo-Cp = (USL − LSL) / (Q<sub>0.99865</sub> − Q<sub>0.00135</sub>)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Comparison</CardTitle>
          <CardDescription>
            Side-by-side comparison of capability indices under different non-normal handling methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Strategy</th>
                  <th className="text-right py-2 px-4">Cpk</th>
                  <th className="text-right py-2 px-4">Ppk</th>
                  <th className="text-right py-2 px-4">PPM</th>
                  <th className="text-left py-2 px-4">Note</th>
                </tr>
              </thead>
              <tbody>
                {strategyComparisons.map((item, index) => (
                  <tr 
                    key={item.strategy} 
                    className={`border-b ${index === 0 ? 'bg-blue-50' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {item.strategy}
                        {index === 0 && <Badge variant="outline" className="text-xs">Current</Badge>}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">{item.cpk.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">{item.ppk.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">{item.ppm.toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Method Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fit-based Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>How it works:</strong> Fit candidate distributions (Weibull, Lognormal, Gamma, etc.) 
              using Maximum Likelihood Estimation.
            </p>
            <p>
              Select best fit based on Anderson-Darling statistic and p-value ≥ 0.05.
            </p>
            <p>
              Compute capability indices using percentiles from the fitted distribution:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 ml-2">
              <li>Pseudo-Cp = (USL − LSL) / (P<sub>99.865</sub> − P<sub>0.135</sub>)</li>
              <li>Pseudo-Cpk based on tail probabilities and distance from spec limits</li>
            </ul>
            <div className="pt-2 border-t">
              <Badge variant="outline">Label: "Non-normal (fit: Weibull)"</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transformation Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Box-Cox:</strong> Power transformation Y′ = (Y<sup>λ</sup> − 1) / λ (λ ≠ 0), or log(Y) if λ=0.
            </p>
            <p>
              Find λ by maximum likelihood to make data approximately normal.
            </p>
            <p>
              <strong>Johnson:</strong> Fit one of Johnson family distributions (SU, SB, SL, SN) 
              that transforms to standard normal via γ + δ·f(Z).
            </p>
            <p className="text-xs text-slate-600">
              After transformation, compute Cp/Cpk on transformed scale. 
              For defect rates, back-transform spec limits and compute tail probabilities on original scale.
            </p>
            <div className="pt-2 border-t">
              <Badge variant="outline">Label: "Transform (Box-Cox λ=0.85)"</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Percentile Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Distribution-free:</strong> Makes no assumptions about underlying distribution.
            </p>
            <p>
              Uses empirical quantiles as ±3σ equivalents:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 ml-2">
              <li>Q<sub>0.00135</sub> ≈ μ − 3σ</li>
              <li>Q<sub>0.99865</sub> ��� μ + 3σ</li>
            </ul>
            <p className="text-xs text-slate-600">
              Pseudo-Cp = (USL − LSL) / (Q<sub>0.99865</sub> − Q<sub>0.00135</sub>)
            </p>
            <p className="text-xs text-slate-600">
              Tail probabilities estimated directly from empirical CDF or smoothed quantiles.
            </p>
            <div className="pt-2 border-t">
              <Badge variant="outline">Robust to outliers and heavy tails</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selection Guidance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">When to use each method:</p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 ml-2">
                <li><strong>Auto:</strong> Let software pick based on GoF tests</li>
                <li><strong>Fit-based:</strong> Known distribution family (e.g., Weibull for reliability)</li>
                <li><strong>Transform:</strong> Data can be normalized; preserves parametric power</li>
                <li><strong>Percentile:</strong> Unknown distribution; robust to outliers; large N</li>
              </ul>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-slate-600">
                <strong>Recommendation:</strong> If Anderson-Darling test passes (p ≥ 0.05), 
                use normal-theory indices. Otherwise, use Auto or consult your SOP.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
