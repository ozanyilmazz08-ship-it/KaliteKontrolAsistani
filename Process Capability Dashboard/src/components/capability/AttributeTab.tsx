import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Badge } from "../ui/badge";

// Mock attribute data
const attributeData = {
  type: "p",
  n: 1000,
  defectives: 32,
  pHat: 0.032,
  yield: 96.8,
  dpmo: 32000,
  zbench: 1.85,
  ciLower: 0.022,
  ciUpper: 0.045
};

const sampleData = Array.from({ length: 25 }, (_, i) => ({
  sample: i + 1,
  proportion: 0.032 + (Math.random() - 0.5) * 0.02,
  inControl: Math.random() > 0.1
}));

export function AttributeTab() {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Capability indices (Cp/Cpk) are defined for continuous characteristics. 
          For attribute data, we summarize defect performance with yield, DPMO, and sigma level.
        </AlertDescription>
      </Alert>

      {/* Data Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Attribute Data Configuration</CardTitle>
          <CardDescription>
            Select attribute chart type and configure inputs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="attr-type">Attribute Chart Type</Label>
            <Select defaultValue="p">
              <SelectTrigger id="attr-type" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p">p-chart (proportion defective)</SelectItem>
                <SelectItem value="np">np-chart (number defective)</SelectItem>
                <SelectItem value="c">c-chart (count of defects)</SelectItem>
                <SelectItem value="u">u-chart (defects per unit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sample-size">Sample size (n)</Label>
              <Input
                id="sample-size"
                type="number"
                defaultValue="1000"
                min="1"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Number of trials per sample</p>
            </div>

            <div>
              <Label htmlFor="defectives">Number defective</Label>
              <Input
                id="defectives"
                type="number"
                defaultValue="32"
                min="0"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Count of defective items</p>
            </div>
          </div>

          <div>
            <Label htmlFor="samples">Number of samples</Label>
            <Input
              id="samples"
              type="number"
              defaultValue="25"
              min="5"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Estimated p̂</CardDescription>
            <div className="text-3xl">{(attributeData.pHat * 100).toFixed(2)}%</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600">Defect proportion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Yield</CardDescription>
            <div className="text-3xl">{attributeData.yield.toFixed(1)}%</div>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-amber-600">Moderate</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>DPMO</CardDescription>
            <div className="text-3xl">{attributeData.dpmo.toLocaleString()}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600">Defects per million opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Z<sub>bench</sub></CardDescription>
            <div className="text-3xl">{attributeData.zbench.toFixed(2)}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600">Benchmark σ-level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sample Size</CardDescription>
            <div className="text-3xl">{attributeData.n}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600">n per sample</p>
          </CardContent>
        </Card>
      </div>

      {/* Proportion Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Proportion Defective Over Time</CardTitle>
          <CardDescription>
            p-chart with control limits (based on binomial distribution)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="sample" 
                label={{ value: 'Sample Number', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Proportion Defective', angle: -90, position: 'insideLeft' }}
                domain={[0, 0.08]}
              />
              <Tooltip 
                formatter={(value: any) => `${(value * 100).toFixed(2)}%`}
              />
              <Bar dataKey="proportion">
                {sampleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.inControl ? '#3b82f6' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Statistics & CI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Statistics</CardTitle>
            <CardDescription>
              Binomial proportion estimates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Estimated p̂</span>
                <span className="text-sm">{attributeData.pHat.toFixed(4)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">95% CI (Clopper-Pearson)</span>
                <span className="text-sm">[{attributeData.ciLower.toFixed(3)}, {attributeData.ciUpper.toFixed(3)}]</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Sample size (n)</span>
                <span className="text-sm">{attributeData.n.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Number defective</span>
                <span className="text-sm">{attributeData.defectives}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Yield</span>
                <span className="text-sm">{attributeData.yield.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">DPMO</span>
                <span className="text-sm">{attributeData.dpmo.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Z<sub>bench</sub> (approx.)</span>
                <span className="text-sm">{attributeData.zbench.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Control Limits</CardTitle>
            <CardDescription>
              Binomial-based control chart limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Center Line (p̄)</span>
                <span className="text-sm">{attributeData.pHat.toFixed(4)}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">UCL (Upper)</span>
                <span className="text-sm">{(attributeData.pHat + 3 * Math.sqrt(attributeData.pHat * (1 - attributeData.pHat) / attributeData.n)).toFixed(4)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">LCL (Lower)</span>
                <span className="text-sm">{Math.max(0, attributeData.pHat - 3 * Math.sqrt(attributeData.pHat * (1 - attributeData.pHat) / attributeData.n)).toFixed(4)}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-slate-600">
                UCL/LCL = p̄ ± 3√[p̄(1−p̄)/n]
              </p>
              <p className="text-xs text-slate-600 mt-2">
                Out-of-control points indicate special-cause variation in defect rate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guidance */}
      <Card>
        <CardHeader>
          <CardTitle>Attribute Data Guidance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="font-medium text-slate-700 mb-1">p-chart (proportion defective)</p>
            <p className="text-xs">
              For variable sample size n. Each sample: count defectives out of n trials. 
              Charts p = defectives/n. Use when sample size varies.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="font-medium text-slate-700 mb-1">np-chart (number defective)</p>
            <p className="text-xs">
              For fixed sample size n. Charts raw count of defectives. 
              Easier to interpret than proportions; use when n is constant.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="font-medium text-slate-700 mb-1">c-chart (count of defects)</p>
            <p className="text-xs">
              For Poisson counts of defects on a unit (e.g., scratches on a panel). 
              Charts total defect count c. Assumes constant inspection area/time.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <p className="font-medium text-slate-700 mb-1">u-chart (defects per unit)</p>
            <p className="text-xs">
              For Poisson rate when opportunities vary (e.g., defects per square meter). 
              Charts u = c/opportunities. Normalizes for varying area/time.
            </p>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs">
              <strong>Note:</strong> Capability indices Cp/Cpk do not apply to attribute data. 
              Use yield, DPMO, and Z<sub>bench</sub> for performance communication.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
