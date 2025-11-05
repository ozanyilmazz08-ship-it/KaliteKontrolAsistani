import { CapabilityConfig } from "../../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";
import { Alert, AlertDescription } from "../ui/alert";
import { Info } from "lucide-react";

type RollingCapabilityTabProps = {
  config: CapabilityConfig;
};

// Mock rolling capability data
const rollingCpkData = Array.from({ length: 50 }, (_, i) => {
  const baselineShift = i > 30 ? -0.15 : 0;
  return {
    window: i + 1,
    cpk: 1.33 + (Math.random() - 0.5) * 0.1 + baselineShift,
    ppk: 1.15 + (Math.random() - 0.5) * 0.1 + baselineShift,
    unstable: i > 30 && i < 40
  };
});

const rollingStatsData = Array.from({ length: 50 }, (_, i) => {
  const drift = i > 30 ? 0.3 : 0;
  return {
    window: i + 1,
    mean: 99.8 + (Math.random() - 0.5) * 0.2 + drift,
    sigmaWithin: 1.15 + (Math.random() - 0.5) * 0.05,
    sigmaOverall: 1.37 + (Math.random() - 0.5) * 0.08
  };
});

export function RollingCapabilityTab({ config }: RollingCapabilityTabProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Rolling capability detects time-varying degradation, drift, and seasonality that overall averages would mask. 
          Each window computes Cpk/Ppk using a moving subset of data.
        </AlertDescription>
      </Alert>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Rolling Window Settings</CardTitle>
          <CardDescription>
            Configure the moving window for time-based capability analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="window-size">Window Size</Label>
              <Select defaultValue="100">
                <SelectTrigger id="window-size" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 points</SelectItem>
                  <SelectItem value="100">100 points</SelectItem>
                  <SelectItem value="20-subgroups">20 subgroups</SelectItem>
                  <SelectItem value="30-subgroups">30 subgroups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="step-size">Step Size</Label>
              <Input
                id="step-size"
                type="number"
                defaultValue="5"
                min="1"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Points to advance per step</p>
            </div>

            <div>
              <Label htmlFor="min-n">Minimum N per Window</Label>
              <Input
                id="min-n"
                type="number"
                defaultValue="30"
                min="10"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Skip windows with N &lt; min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rolling Cpk/Ppk Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rolling Capability Indices</CardTitle>
          <CardDescription>
            Cpk and Ppk over rolling windows; color-coded for unstable periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={rollingCpkData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="window" 
                label={{ value: 'Window Number', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                domain={[0.8, 1.8]}
                label={{ value: 'Capability Index', angle: -90, position: 'insideLeft' }}
              />
              <RechartsTooltip />
              <Legend />
              <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="5 5" label="Min acceptable" />
              <ReferenceLine y={1.33} stroke="#10b981" strokeDasharray="5 5" label="Target" />
              <Line 
                type="monotone" 
                dataKey="cpk" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Cpk (short-term)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="ppk" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Ppk (long-term)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rolling Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rolling Mean</CardTitle>
            <CardDescription>
              Process centering over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={rollingStatsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="window" />
                <YAxis domain={[99, 101]} />
                <RechartsTooltip />
                <ReferenceLine 
                  y={config.specifications.target} 
                  stroke="#3b82f6" 
                  strokeDasharray="5 5" 
                  label="Target" 
                />
                <ReferenceLine 
                  y={config.specifications.lsl} 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  label="LSL" 
                />
                <ReferenceLine 
                  y={config.specifications.usl} 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  label="USL" 
                />
                <Line 
                  type="monotone" 
                  dataKey="mean" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rolling Variation</CardTitle>
            <CardDescription>
              σ̂<sub>within</sub> and σ̂<sub>overall</sub> over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={rollingStatsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="window" />
                <YAxis domain={[0.8, 1.8]} />
                <RechartsTooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sigmaWithin" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="σ̂ within"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="sigmaOverall" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="σ̂ overall"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Unstable Periods Detection */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Events</CardTitle>
          <CardDescription>
            Time periods where capability degraded or process became unstable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded border border-amber-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-amber-900">Windows 31-40: Capability Drop</span>
                <span className="text-xs text-amber-700">Moderate severity</span>
              </div>
              <p className="text-xs text-amber-700">
                Cpk dropped from 1.33 to 1.18. Ppk dropped from 1.15 to 1.05. 
                Investigate for process drift or increased variation.
              </p>
              <div className="mt-2 flex gap-2">
                <span className="text-xs text-amber-700">Mean shift: +0.3 {config.specifications.unit}</span>
                <span className="text-xs text-amber-700">σ increase: +8%</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Windows 1-30: Stable Period</span>
                <span className="text-xs text-green-700">Good</span>
              </div>
              <p className="text-xs text-slate-600">
                Cpk stable around 1.33. Process in control.
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-900">
                <strong>Use cases:</strong> Detect drift, seasonality, tool wear, shift changes, 
                lot-to-lot variation, and time-varying degradation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
