import { CapabilityConfig } from "../../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine, Cell } from "recharts";

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

  return (
    <div className="space-y-6">
      {/* Warning alerts */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          Process not stable per control rules. Review control chart before interpreting capability.
        </AlertDescription>
      </Alert>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Short-term Cp</CardDescription>
            <CardTitle className="text-3xl">{mockCapabilityData.shortTerm.cp.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                CI: 1.38 - 1.52
              </Badge>
              <TrendingUp className="h-3 w-3 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Short-term Cpk</CardDescription>
            <CardTitle className="text-3xl">{mockCapabilityData.shortTerm.cpk.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                CI: 1.25 - 1.41
              </Badge>
              <TrendingUp className="h-3 w-3 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Long-term Pp</CardDescription>
            <CardTitle className="text-3xl">{mockCapabilityData.longTerm.pp.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                CI: 1.15 - 1.29
              </Badge>
              <Minus className="h-3 w-3 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Long-term Ppk</CardDescription>
            <CardTitle className="text-3xl">{mockCapabilityData.longTerm.ppk.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                CI: 1.08 - 1.22
              </Badge>
              <Minus className="h-3 w-3 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Short-term Z<sub>st</sub></CardDescription>
            <CardTitle className="text-3xl">{mockCapabilityData.shortTerm.zst.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">
              σ-level
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Long-term Z<sub>lt</sub></CardDescription>
            <CardTitle className="text-3xl">{mockCapabilityData.longTerm.zlt.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">
              σ-level
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>PPM Total</CardDescription>
            <CardTitle className="text-3xl">{mockCapabilityData.defects.ppmTotal.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-600">
              Below LSL: {mockCapabilityData.defects.belowLSL}%<br />
              Above USL: {mockCapabilityData.defects.aboveUSL}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Yield</CardDescription>
            <CardTitle className="text-3xl">{mockCapabilityData.defects.yield.toFixed(2)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-green-600 text-xs">
              {mockCapabilityData.fit.distribution}
            </Badge>
            <Badge variant="outline" className="ml-2 text-xs">
              {mockCapabilityData.fit.quality}
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
              Process distribution vs specification limits (LSL: {lsl}, USL: {usl}, Target: {target} {config.specifications.unit})
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
                <Tooltip />
                <ReferenceLine x={lsl} stroke="#ef4444" strokeWidth={2} label="LSL" />
                <ReferenceLine x={target} stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" label="T" />
                <ReferenceLine x={usl} stroke="#ef4444" strokeWidth={2} label="USL" />
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

            <div className="pt-2 border-t">
              <p className="text-xs text-slate-600">
                Centering: {((mockCapabilityData.stats.mean - target!) / (usl! - lsl!) * 100).toFixed(1)}% offset from target
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capability comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Short-term vs Long-term Comparison</CardTitle>
          <CardDescription>
            Short-term (within) isolates within-subgroup variation; Long-term (overall) includes shifts and drift
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
              <Tooltip />
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
