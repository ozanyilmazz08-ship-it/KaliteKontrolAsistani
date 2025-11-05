import { CapabilityConfig } from "../../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine, Cell } from "recharts";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { MSAPrerequisiteCard } from "./MSAPrerequisiteCard";

type SummaryTabProps = {
  config: CapabilityConfig;
};

// Mock capability data
const mockCapabilityData = {
  shortTerm: {
    cp: 1.45,
    cpk: 1.33,
    cpu: 1.38,
    cpl: 1.33,
    cpm: 1.28,
    zst: 3.99
  },
  longTerm: {
    pp: 1.22,
    ppk: 1.15,
    ppu: 1.18,
    ppl: 1.15,
    zlt: 3.45
  },
  defects: {
    belowLSL: 0.12,
    aboveUSL: 0.18,
    ppmTotal: 3000,
    yield: 99.97
  },
  stats: {
    n: 150,
    mean: 99.8,
    median: 99.7,
    stdWithin: 1.15,
    stdOverall: 1.37
  },
  fit: {
    distribution: "Normal",
    ad: 0.42,
    pValue: 0.28,
    quality: "Good"
  }
};

// Mock histogram data
const histogramData = Array.from({ length: 50 }, (_, i) => {
  const x = 92 + (i * 0.3);
  const mean = 99.8;
  const sigma = 1.15;
  const y = Math.exp(-Math.pow(x - mean, 2) / (2 * sigma * sigma)) * 25;
  return {
    value: x,
    frequency: y,
    inSpec: x >= 95 && x <= 105
  };
});

export function SummaryTab({ config }: SummaryTabProps) {
  const { lsl, usl, target } = config.specifications;
  
  // Determine if single-sided spec
  const isSingleSided = (lsl === undefined && usl !== undefined) || (lsl !== undefined && usl === undefined);
  const isUpperOnly = lsl === undefined && usl !== undefined;
  const isLowerOnly = lsl !== undefined && usl === undefined;

  return (
    <div className="space-y-6">
      {/* Warning alerts */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          <div className="flex items-center justify-between">
            <span>
              Process not stable per control rules. Capability assumes statistical control.
            </span>
            <Button variant="link" size="sm" className="h-auto p-0 text-amber-900 underline">
              View Control Chart
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Sample size warning */}
      {mockCapabilityData.stats.n < 25 && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            N = {mockCapabilityData.stats.n} samples. For reliable indices, N ≥ 25 recommended. Confidence intervals may be wide.
          </AlertDescription>
        </Alert>
      )}

      {!target && (
        <Alert className="border-slate-200 bg-slate-50">
          <AlertCircle className="h-4 w-4 text-slate-600" />
          <AlertDescription className="text-slate-900">
            No Target specified. Cpm (Taguchi index) not computed. Add Target in right panel to evaluate off-target loss.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1">
              <CardDescription>Short-term Cp</CardDescription>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">Potential Capability (centered)</p>
                    <p className="text-xs">Formula: Cp = (USL − LSL) / (6 × σ̂<sub>within</sub>)</p>
                    <p className="text-xs mt-1">Measures process spread vs tolerance, assuming perfect centering.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardTitle className="text-3xl">{mockCapabilityData.shortTerm.cp.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                95% CI: 1.38 - 1.52
              </Badge>
              <TrendingUp className="h-3 w-3 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1">
              <CardDescription>Short-term Cpk</CardDescription>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">Actual Capability (accounts for centering)</p>
                    <p className="text-xs">Formula: Cpk = min(Cpu, Cpl)</p>
                    <p className="text-xs">Cpu = (USL − μ̂) / (3 × σ̂<sub>within</sub>)</p>
                    <p className="text-xs">Cpl = (μ̂ − LSL) / (3 × σ̂<sub>within</sub>)</p>
                    <p className="text-xs mt-1">Measures actual capability considering process centering. Cpk ≥ 1.33 is typical target.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardTitle className="text-3xl">{mockCapabilityData.shortTerm.cpk.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                95% CI: 1.25 - 1.41
              </Badge>
              <TrendingUp className="h-3 w-3 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1">
              <CardDescription>Long-term Pp</CardDescription>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">Overall Performance (long-term)</p>
                    <p className="text-xs">Formula: Pp = (USL − LSL) / (6 × σ̂<sub>overall</sub>)</p>
                    <p className="text-xs mt-1">Uses overall variation including drift and shifts over time.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardTitle className="text-3xl">{mockCapabilityData.longTerm.pp.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                95% CI: 1.15 - 1.29
              </Badge>
              <Minus className="h-3 w-3 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        {target && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1">
                <CardDescription>Cpm (Taguchi)</CardDescription>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-slate-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium mb-1">Taguchi Index (penalizes off-target)</p>
                      <p className="text-xs">Formula: Cpm = (USL − LSL) / [6 × √(σ̂² + (μ̂ − T)²)]</p>
                      <p className="text-xs mt-1">Accounts for both spread and centering relative to Target. Requires Target to be specified.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardTitle className="text-3xl">{mockCapabilityData.shortTerm.cpm.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  95% CI: 1.21 - 1.36
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1">
              <CardDescription>Long-term Ppk</CardDescription>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">Actual Performance (includes drift)</p>
                    <p className="text-xs">Formula: Ppk = min(Ppu, Ppl)</p>
                    <p className="text-xs">Uses σ̂<sub>overall</sub> which includes between-subgroup variation and drift over time.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardTitle className="text-3xl">{mockCapabilityData.longTerm.ppk.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                95% CI: 1.08 - 1.22
              </Badge>
              <Minus className="h-3 w-3 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1">
              <CardDescription>Short-term Z<sub>st</sub></CardDescription>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">Short-term Sigma Level</p>
                    <p className="text-xs">Formula: Z<sub>st</sub> = 3 × Cpk (two-sided)</p>
                    <p className="text-xs mt-1">Expresses capability as sigma level. Z = 6.0 corresponds to Six Sigma quality.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardTitle className="text-3xl">{mockCapabilityData.shortTerm.zst.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">
              σ-level (short-term)
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1">
              <CardDescription>Long-term Z<sub>lt</sub></CardDescription>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">Long-term Sigma Level</p>
                    <p className="text-xs">Formula: Z<sub>lt</sub> = 3 × Ppk</p>
                    <p className="text-xs mt-1">Includes process drift and shifts. Typically 1.5σ lower than short-term due to time-based variation.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardTitle className="text-3xl">{mockCapabilityData.longTerm.zlt.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">
              σ-level (long-term)
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1">
              <CardDescription>PPM Total</CardDescription>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">Parts Per Million Out-of-Spec</p>
                    <p className="text-xs">Total defect rate from both tails</p>
                    <p className="text-xs mt-1">PPM = (% &lt; LSL + % &gt; USL) × 10<sup>6</sup></p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardTitle className="text-3xl">{mockCapabilityData.defects.ppmTotal.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-600">
              {lsl && `Below LSL: ${mockCapabilityData.defects.belowLSL}%`}
              {lsl && usl && <br />}
              {usl && `Above USL: ${mockCapabilityData.defects.aboveUSL}%`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1">
              <CardDescription>Yield</CardDescription>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">In-Specification Rate</p>
                    <p className="text-xs">Yield = 1 − (% out-of-spec)</p>
                    <p className="text-xs mt-1">Proportion of production meeting specifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardTitle className="text-3xl">{mockCapabilityData.defects.yield.toFixed(2)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-green-600 text-xs">
              {mockCapabilityData.fit.distribution}
            </Badge>
            <Badge variant="outline" className="ml-2 text-xs">
              GoF: {mockCapabilityData.fit.quality}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main capability chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Capability Histogram & Distribution Fit</CardTitle>
            <CardDescription>
              Process distribution vs specification limits
              {lsl && ` (LSL: ${lsl}`}
              {usl && (lsl ? `, USL: ${usl}` : ` (USL: ${usl}`)}
              {target && `, Target: ${target}`}
              {config.specifications.unit && ` ${config.specifications.unit}`})
              {isSingleSided && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {isUpperOnly ? 'Upper spec only' : 'Lower spec only'}
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="value" 
                  label={{ value: `Measurement (${config.specifications.unit})`, position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                <RechartsTooltip />
                {lsl && <ReferenceLine x={lsl} stroke="#ef4444" strokeWidth={2} label="LSL" />}
                {target && <ReferenceLine x={target} stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" label="T" />}
                {usl && <ReferenceLine x={usl} stroke="#ef4444" strokeWidth={2} label="USL" />}
                <ReferenceLine x={99.8 - 3 * 1.15} stroke="#10b981" strokeDasharray="3 3" label="-3σ within" />
                <ReferenceLine x={99.8 + 3 * 1.15} stroke="#10b981" strokeDasharray="3 3" label="+3σ within" />
                <ReferenceLine x={99.8 - 3 * 1.37} stroke="#8b5cf6" strokeDasharray="3 3" label="-3σ overall" />
                <ReferenceLine x={99.8 + 3 * 1.37} stroke="#8b5cf6" strokeDasharray="3 3" label="+3σ overall" />
                <Area 
                  type="monotone" 
                  dataKey="frequency" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Process Statistics</CardTitle>
            <CardDescription>Descriptive statistics (N = {mockCapabilityData.stats.n})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Mean (μ̂)</span>
                <span className="text-sm">{mockCapabilityData.stats.mean.toFixed(2)} {config.specifications.unit}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Median</span>
                <span className="text-sm">{mockCapabilityData.stats.median.toFixed(2)} {config.specifications.unit}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">σ̂<sub>within</sub></span>
                <span className="text-sm">{mockCapabilityData.stats.stdWithin.toFixed(3)} {config.specifications.unit}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">σ̂<sub>overall</sub></span>
                <span className="text-sm">{mockCapabilityData.stats.stdOverall.toFixed(3)} {config.specifications.unit}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Subgroup size (m)</span>
                <span className="text-sm">{config.subgroupSize}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Estimator</span>
                <span className="text-sm capitalize">{config.estimators.withinEstimator}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Distribution</span>
                <span className="text-sm">{mockCapabilityData.fit.distribution}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">AD statistic</span>
                <span className="text-sm">{mockCapabilityData.fit.ad.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">p-value</span>
                <span className="text-sm">{mockCapabilityData.fit.pValue.toFixed(3)}</span>
              </div>
              <Badge variant="outline" className="mt-2">
                GoF: {mockCapabilityData.fit.quality}
              </Badge>
            </div>

            {target && lsl && usl && (
              <div className="pt-2 border-t">
                <p className="text-xs text-slate-600">
                  Centering: {((mockCapabilityData.stats.mean - target) / (usl - lsl) * 100).toFixed(1)}% offset from target
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MSA Prerequisites */}
      <MSAPrerequisiteCard />

      {/* Explanation Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-medium text-blue-900">Understanding Short-term vs Long-term Capability</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-800 mb-1">Short-term (Cp/Cpk, Z<sub>st</sub>)</p>
                <p className="text-xs text-blue-700">
                  • Uses within-subgroup variation (σ̂<sub>within</sub>)<br />
                  • Isolates random, inherent process variation<br />
                  • Answers: "What is the process capable of if perfectly controlled?"<br />
                  • Estimated via R̄/d₂, S̄/c₄, or pooled s<br />
                  • Best-case capability (no drift or shifts)
                </p>
              </div>
              <div>
                <p className="font-medium text-blue-800 mb-1">Long-term (Pp/Ppk, Z<sub>lt</sub>)</p>
                <p className="text-xs text-blue-700">
                  • Uses overall variation (σ̂<sub>overall</sub>)<br />
                  • Includes drifts, shifts, and time-based variation<br />
                  • Answers: "What is the actual performance over time?"<br />
                  • Estimated from total sample standard deviation<br />
                  • Real-world performance (includes special causes)
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-700 pt-2 border-t border-blue-300">
              <strong>Typical relationship:</strong> Ppk is often lower than Cpk due to process drift and shifts. 
              A large gap indicates instability or special-cause variation. 
              <em>References: Montgomery (SQC), AIAG SPC Handbook, ISO 22514</em>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Capability comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Short-term vs Long-term Comparison</CardTitle>
          <CardDescription>
            Visual comparison of capability indices. Lower values indicate need for process improvement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { metric: 'Cp / Pp', shortTerm: mockCapabilityData.shortTerm.cp, longTerm: mockCapabilityData.longTerm.pp },
                { metric: 'Cpk / Ppk', shortTerm: mockCapabilityData.shortTerm.cpk, longTerm: mockCapabilityData.longTerm.ppk },
                { metric: 'Cpu / Ppu', shortTerm: mockCapabilityData.shortTerm.cpu, longTerm: mockCapabilityData.longTerm.ppu },
                { metric: 'Cpl / Ppl', shortTerm: mockCapabilityData.shortTerm.cpl, longTerm: mockCapabilityData.longTerm.ppl },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis domain={[0, 2]} />
              <RechartsTooltip />
              <Legend />
              <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="5 5" label="Min acceptable" />
              <ReferenceLine y={1.33} stroke="#10b981" strokeDasharray="5 5" label="Target" />
              <Bar dataKey="shortTerm" fill="#3b82f6" name="Short-term (within)" />
              <Bar dataKey="longTerm" fill="#8b5cf6" name="Long-term (overall)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
