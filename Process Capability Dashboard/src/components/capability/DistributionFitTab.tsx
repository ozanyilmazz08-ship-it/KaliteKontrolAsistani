import { CapabilityConfig } from "../../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Check } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Line, LineChart } from "recharts";
import { useState } from "react";

type DistributionFitTabProps = {
  config: CapabilityConfig;
};

// Mock probability plot data
const generateProbabilityPlotData = (distribution: string) => {
  return Array.from({ length: 150 }, (_, i) => {
    const theoretical = -3 + (i / 150) * 6;
    const actual = theoretical + (Math.random() - 0.5) * 0.3;
    return {
      theoretical,
      actual
    };
  }).sort((a, b) => a.theoretical - b.theoretical);
};

const distributionFits = [
  { name: "Normal", ad: 0.42, pValue: 0.28, aic: 458.2, bic: 464.8, selected: true },
  { name: "Lognormal", ad: 0.58, pValue: 0.15, aic: 462.5, bic: 469.1, selected: false },
  { name: "Weibull", ad: 0.51, pValue: 0.19, aic: 460.1, bic: 466.7, selected: false },
  { name: "Gamma", ad: 0.65, pValue: 0.11, aic: 465.3, bic: 471.9, selected: false },
  { name: "Exponential", ad: 2.34, pValue: 0.001, aic: 512.8, bic: 516.1, selected: false },
  { name: "Logistic", ad: 0.48, pValue: 0.22, aic: 459.7, bic: 466.3, selected: false },
  { name: "Johnson SU", ad: 0.39, pValue: 0.32, aic: 456.9, bic: 467.4, selected: false },
];

export function DistributionFitTab({ config }: DistributionFitTabProps) {
  const [selectedDist, setSelectedDist] = useState("Normal");
  const plotData = generateProbabilityPlotData(selectedDist);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Probability Plot */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Probability Plot</CardTitle>
                <CardDescription>
                  Q-Q plot for assessing distributional fit
                </CardDescription>
              </div>
              <Select value={selectedDist} onValueChange={setSelectedDist}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Lognormal">Lognormal</SelectItem>
                  <SelectItem value="Weibull">Weibull</SelectItem>
                  <SelectItem value="Gamma">Gamma</SelectItem>
                  <SelectItem value="Exponential">Exponential</SelectItem>
                  <SelectItem value="Logistic">Logistic</SelectItem>
                  <SelectItem value="Johnson">Johnson SU/SB</SelectItem>
                  <SelectItem value="Auto">Auto (best fit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={450}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="theoretical" 
                  type="number"
                  domain={[-3, 3]}
                  label={{ value: 'Theoretical Quantiles', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  dataKey="actual"
                  type="number"
                  label={{ value: 'Sample Quantiles', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip 
                  formatter={(value: any) => value.toFixed(3)}
                  labelFormatter={(value) => `Theoretical: ${value.toFixed(3)}`}
                />
                <ReferenceLine 
                  segment={[{ x: -3, y: -3 }, { x: 3, y: 3 }]} 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  label="Perfect fit"
                />
                <Scatter 
                  data={plotData} 
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center gap-4">
              <Badge variant="outline">AD = 0.42</Badge>
              <Badge variant="outline">p-value = 0.28</Badge>
              <p className="text-sm text-slate-600">
                Decision: p ≥ 0.05 → fail to reject normality
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Parameter Estimates */}
        <Card>
          <CardHeader>
            <CardTitle>Parameter Estimates</CardTitle>
            <CardDescription>
              {selectedDist} distribution parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDist === "Normal" && (
              <>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Location (μ)</span>
                  </div>
                  <p className="text-lg">99.78 {config.specifications.unit}</p>
                  <p className="text-xs text-slate-500">95% CI: [99.59, 99.97]</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Scale (σ)</span>
                  </div>
                  <p className="text-lg">1.15 {config.specifications.unit}</p>
                  <p className="text-xs text-slate-500">95% CI: [1.02, 1.31]</p>
                </div>
              </>
            )}
            {selectedDist === "Weibull" && (
              <>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Shape (β)</span>
                  </div>
                  <p className="text-lg">8.42</p>
                  <p className="text-xs text-slate-500">95% CI: [7.51, 9.45]</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Scale (η)</span>
                  </div>
                  <p className="text-lg">101.23 {config.specifications.unit}</p>
                  <p className="text-xs text-slate-500">95% CI: [100.85, 101.62]</p>
                </div>
              </>
            )}
            {selectedDist === "Johnson" && (
              <>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">γ (gamma)</span>
                  </div>
                  <p className="text-lg">0.23</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">δ (delta)</span>
                  </div>
                  <p className="text-lg">1.15</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">λ (lambda)</span>
                  </div>
                  <p className="text-lg">95.2</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">ξ (xi)</span>
                  </div>
                  <p className="text-lg">10.5</p>
                </div>
              </>
            )}
            {!["Normal", "Weibull", "Johnson"].includes(selectedDist) && (
              <>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Parameter 1</span>
                  </div>
                  <p className="text-lg">99.78</p>
                  <p className="text-xs text-slate-500">95% CI: [99.59, 99.97]</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Parameter 2</span>
                  </div>
                  <p className="text-lg">1.15</p>
                  <p className="text-xs text-slate-500">95% CI: [1.02, 1.31]</p>
                </div>
              </>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-slate-600 mb-2">Fitting Method</p>
              <Badge variant="outline">Maximum Likelihood</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fit diagnostics table */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Fit Diagnostics</CardTitle>
          <CardDescription>
            Goodness-of-fit statistics for candidate distributions. Auto-selection picks lowest AD with p ≥ 0.05.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Distribution</TableHead>
                <TableHead className="text-right">Anderson-Darling</TableHead>
                <TableHead className="text-right">p-value</TableHead>
                <TableHead className="text-right">AIC</TableHead>
                <TableHead className="text-right">BIC</TableHead>
                <TableHead className="text-center">Selected</TableHead>
                <TableHead className="text-center">Quality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributionFits.map((fit) => (
                <TableRow key={fit.name} className={fit.selected ? "bg-blue-50" : ""}>
                  <TableCell>{fit.name}</TableCell>
                  <TableCell className="text-right">{fit.ad.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={fit.pValue >= 0.05 ? "text-green-600" : "text-red-600"}>
                      {fit.pValue.toFixed(3)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{fit.aic.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{fit.bic.toFixed(1)}</TableCell>
                  <TableCell className="text-center">
                    {fit.selected && <Check className="h-4 w-4 text-green-600 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {fit.pValue >= 0.15 && <Badge variant="default" className="bg-green-600">Good</Badge>}
                    {fit.pValue >= 0.05 && fit.pValue < 0.15 && <Badge variant="outline">Borderline</Badge>}
                    {fit.pValue < 0.05 && <Badge variant="destructive">Poor</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Normality Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Normality Tests</CardTitle>
            <CardDescription>
              Statistical tests for normality assumption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead className="text-right">Statistic</TableHead>
                  <TableHead className="text-right">p-value</TableHead>
                  <TableHead className="text-center">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Shapiro-Wilk</TableCell>
                  <TableCell className="text-right">0.988</TableCell>
                  <TableCell className="text-right">0.24</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default" className="bg-green-600">Normal</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Anderson-Darling</TableCell>
                  <TableCell className="text-right">0.42</TableCell>
                  <TableCell className="text-right">0.28</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default" className="bg-green-600">Normal</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Kolmogorov-Smirnov</TableCell>
                  <TableCell className="text-right">0.065</TableCell>
                  <TableCell className="text-right">0.31</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default" className="bg-green-600">Normal</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-xs text-slate-600 mt-4">
              Decision hint: p ≥ 0.05 → fail to reject normality. All tests indicate data are consistent with normal distribution.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto-Selection Strategy</CardTitle>
            <CardDescription>
              Distribution selection criteria and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm mb-2">Auto-fit picked <span className="font-semibold">Normal</span> (AD=0.42, p=0.28)</p>
              <p className="text-xs text-slate-600">
                This distribution has the lowest Anderson-Darling statistic among fits with p ≥ 0.05.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Fallback strategy:</p>
              <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                <li>Use distribution with lowest AD and p ≥ 0.05</li>
                <li>If all p &lt; 0.05, use Johnson transformation</li>
                <li>If Johnson fails, use Percentile method (distribution-free)</li>
              </ol>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-slate-600">
                Switch to Transform or Percentile if required by SOP or if non-normal methods are preferred.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
