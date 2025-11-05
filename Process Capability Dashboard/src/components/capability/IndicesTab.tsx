import { CapabilityConfig } from "../../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Download, Info } from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useState } from "react";

type IndicesTabProps = {
  config: CapabilityConfig;
};

const shortTermIndices = [
  { 
    metric: "Cp", 
    formula: "(USL − LSL) / (6 × σ̂within)",
    estimate: 1.45, 
    lowerCI: 1.38, 
    upperCI: 1.52,
    interpretation: "Potential capability (centered process)"
  },
  { 
    metric: "Cpu", 
    formula: "(USL − μ̂) / (3 × σ̂within)",
    estimate: 1.38, 
    lowerCI: 1.31, 
    upperCI: 1.46,
    interpretation: "Upper one-sided capability"
  },
  { 
    metric: "Cpl", 
    formula: "(μ̂ − LSL) / (3 × σ̂within)",
    estimate: 1.33, 
    lowerCI: 1.25, 
    upperCI: 1.41,
    interpretation: "Lower one-sided capability"
  },
  { 
    metric: "Cpk", 
    formula: "min(Cpu, Cpl)",
    estimate: 1.33, 
    lowerCI: 1.25, 
    upperCI: 1.41,
    interpretation: "Actual capability (accounts for centering)"
  },
  { 
    metric: "Cpm", 
    formula: "(USL − LSL) / [6 × √(σ̂² + (μ̂ − T)²)]",
    estimate: 1.28, 
    lowerCI: 1.21, 
    upperCI: 1.36,
    interpretation: "Taguchi index (penalizes off-target)"
  },
  { 
    metric: "Zst", 
    formula: "3 × Cpk",
    estimate: 3.99, 
    lowerCI: 3.75, 
    upperCI: 4.23,
    interpretation: "Short-term sigma level"
  },
];

const longTermIndices = [
  { 
    metric: "Pp", 
    formula: "(USL − LSL) / (6 × σ̂overall)",
    estimate: 1.22, 
    lowerCI: 1.15, 
    upperCI: 1.29,
    interpretation: "Overall potential performance"
  },
  { 
    metric: "Ppu", 
    formula: "(USL − μ̂) / (3 × σ̂overall)",
    estimate: 1.18, 
    lowerCI: 1.11, 
    upperCI: 1.25,
    interpretation: "Upper one-sided performance"
  },
  { 
    metric: "Ppl", 
    formula: "(μ̂ − LSL) / (3 × σ̂overall)",
    estimate: 1.15, 
    lowerCI: 1.08, 
    upperCI: 1.22,
    interpretation: "Lower one-sided performance"
  },
  { 
    metric: "Ppk", 
    formula: "min(Ppu, Ppl)",
    estimate: 1.15, 
    lowerCI: 1.08, 
    upperCI: 1.22,
    interpretation: "Actual performance (includes drift)"
  },
  { 
    metric: "Zlt", 
    formula: "3 × Ppk",
    estimate: 3.45, 
    lowerCI: 3.24, 
    upperCI: 3.66,
    interpretation: "Long-term sigma level"
  },
];

const defectMetrics = [
  { 
    metric: "% < LSL", 
    formula: "Φ((LSL − μ̂) / σ̂)",
    estimate: 0.12, 
    lowerCI: 0.08, 
    upperCI: 0.18,
    interpretation: "Proportion below lower spec"
  },
  { 
    metric: "% > USL", 
    formula: "1 − Φ((USL − μ̂) / σ̂)",
    estimate: 0.18, 
    lowerCI: 0.12, 
    upperCI: 0.26,
    interpretation: "Proportion above upper spec"
  },
  { 
    metric: "PPM (total)", 
    formula: "(%<LSL + %>USL) × 10⁶",
    estimate: 3000, 
    lowerCI: 2200, 
    upperCI: 4100,
    interpretation: "Parts per million out-of-spec"
  },
  { 
    metric: "Yield (%)", 
    formula: "100 × (1 − %Out)",
    estimate: 99.70, 
    lowerCI: 99.59, 
    upperCI: 99.78,
    interpretation: "In-specification rate"
  },
  { 
    metric: "Zbench", 
    formula: "Φ⁻¹(1 − %Out/2)",
    estimate: 3.72, 
    lowerCI: 3.55, 
    upperCI: 3.89,
    interpretation: "Benchmark sigma level"
  },
];

export function IndicesTab({ config }: IndicesTabProps) {
  const [showShortTerm, setShowShortTerm] = useState(true);
  const [showLongTerm, setShowLongTerm] = useState(true);
  const [useRobust, setUseRobust] = useState(false);

  const getQualityBadge = (cpk: number) => {
    if (cpk >= 1.67) return <Badge variant="default" className="bg-green-600">Excellent</Badge>;
    if (cpk >= 1.33) return <Badge variant="default" className="bg-blue-600">Adequate</Badge>;
    if (cpk >= 1.00) return <Badge variant="default" className="bg-amber-600">Marginal</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch 
                  id="short-term" 
                  checked={showShortTerm}
                  onCheckedChange={setShowShortTerm}
                />
                <Label htmlFor="short-term">Short-term (within)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="long-term" 
                  checked={showLongTerm}
                  onCheckedChange={setShowLongTerm}
                />
                <Label htmlFor="long-term">Long-term (overall)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="robust" 
                  checked={useRobust}
                  onCheckedChange={setUseRobust}
                />
                <Label htmlFor="robust">Robust estimators</Label>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Short-term indices */}
      {showShortTerm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Short-term Capability Indices</CardTitle>
                <CardDescription>
                  Within-subgroup variation; σ̂ via {config.estimators.withinEstimator.toUpperCase()}; 
                  CI level: {(config.ciLevel * 100).toFixed(0)}%
                  {useRobust && " (Robust estimators)"}
                </CardDescription>
              </div>
              {getQualityBadge(1.33)}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Formula</TableHead>
                  <TableHead className="text-right">Point Estimate</TableHead>
                  <TableHead className="text-right">Lower CI</TableHead>
                  <TableHead className="text-right">Upper CI</TableHead>
                  <TableHead>Interpretation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shortTermIndices.map((item) => (
                  <TableRow key={item.metric}>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help flex items-center gap-1">
                              <strong>{item.metric}</strong>
                              <Info className="h-3 w-3 text-slate-400" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{item.interpretation}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">{item.formula}</TableCell>
                    <TableCell className="text-right">{item.estimate.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-slate-600">{item.lowerCI.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-slate-600">{item.upperCI.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-slate-600">{item.interpretation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Long-term indices */}
      {showLongTerm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Long-term Performance Indices</CardTitle>
                <CardDescription>
                  Overall variation including drift; σ̂ = sample std dev; 
                  CI level: {(config.ciLevel * 100).toFixed(0)}%
                  {useRobust && " (Robust estimators)"}
                </CardDescription>
              </div>
              {getQualityBadge(1.15)}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Formula</TableHead>
                  <TableHead className="text-right">Point Estimate</TableHead>
                  <TableHead className="text-right">Lower CI</TableHead>
                  <TableHead className="text-right">Upper CI</TableHead>
                  <TableHead>Interpretation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {longTermIndices.map((item) => (
                  <TableRow key={item.metric}>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help flex items-center gap-1">
                              <strong>{item.metric}</strong>
                              <Info className="h-3 w-3 text-slate-400" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{item.interpretation}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">{item.formula}</TableCell>
                    <TableCell className="text-right">{item.estimate.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-slate-600">{item.lowerCI.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-slate-600">{item.upperCI.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-slate-600">{item.interpretation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* One-sided specification note */}
      {(config.specifications.lsl === undefined || config.specifications.usl === undefined) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 mb-1">One-sided Specification Detected</p>
                <p className="text-sm text-amber-800">
                  {config.specifications.lsl === undefined && config.specifications.usl !== undefined && (
                    <>Only Upper Spec Limit (USL) is set. Reporting Cpu/Ppu and upper tail metrics only. 
                    Lower spec indices (Cpl/Ppl) are not applicable.</>
                  )}
                  {config.specifications.lsl !== undefined && config.specifications.usl === undefined && (
                    <>Only Lower Spec Limit (LSL) is set. Reporting Cpl/Ppl and lower tail metrics only. 
                    Upper spec indices (Cpu/Ppu) are not applicable.</>
                  )}
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  For one-sided specs, use Z<sub>upper</sub> or Z<sub>lower</sub> instead of two-sided Z-level.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Defect metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Defect & Yield Metrics</CardTitle>
          <CardDescription>
            Tail probabilities and out-of-spec rates; CI level: {(config.ciLevel * 100).toFixed(0)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Formula</TableHead>
                <TableHead className="text-right">Point Estimate</TableHead>
                <TableHead className="text-right">Lower CI</TableHead>
                <TableHead className="text-right">Upper CI</TableHead>
                <TableHead>Interpretation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defectMetrics.map((item) => (
                <TableRow key={item.metric}>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help flex items-center gap-1">
                            <strong>{item.metric}</strong>
                            <Info className="h-3 w-3 text-slate-400" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{item.interpretation}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-mono">{item.formula}</TableCell>
                  <TableCell className="text-right">
                    {item.metric === "PPM (total)" 
                      ? item.estimate.toLocaleString()
                      : item.estimate.toFixed(2)
                    }
                  </TableCell>
                  <TableCell className="text-right text-slate-600">
                    {item.metric === "PPM (total)" 
                      ? item.lowerCI.toLocaleString()
                      : item.lowerCI.toFixed(2)
                    }
                  </TableCell>
                  <TableCell className="text-right text-slate-600">
                    {item.metric === "PPM (total)" 
                      ? item.upperCI.toLocaleString()
                      : item.upperCI.toFixed(2)
                    }
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{item.interpretation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CI methodology note */}
      <Card>
        <CardHeader>
          <CardTitle>Confidence Interval Methodology</CardTitle>
          <CardDescription>
            Understanding uncertainty in capability estimates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="p-3 bg-slate-50 rounded">
            <p className="font-medium text-slate-700 mb-1">Normal-theory CI (Parametric)</p>
            <p className="text-xs">
              Analytical formulas based on chi-square distribution for σ̂ and t-distribution for μ̂. 
              Delta method applied to derive CIs for Cp, Cpk, Pp, Ppk from parameter CIs.
            </p>
            <p className="text-xs mt-1">
              <em>Valid when: normality assumption holds, sample size adequate (N ≥ 25)</em>
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded">
            <p className="font-medium text-slate-700 mb-1">Bootstrap CI (Non-parametric)</p>
            <p className="text-xs">
              Resampling-based method: {config.bootstrapResamples.toLocaleString()} resamples; 
              seed = {config.bootstrapSeed} for reproducibility. 
              Percentile or BCa (Bias-Corrected accelerated) method.
            </p>
            <p className="text-xs mt-1">
              <em>Used when: non-normal data, robust estimators, or small sample sizes</em>
            </p>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs">
              <strong>Current settings:</strong> CI level = <Badge variant="outline" className="mx-1">{(config.ciLevel * 100).toFixed(0)}%</Badge>
              {useRobust ? ' Bootstrap (robust estimators)' : ' Normal-theory (classical)'}
            </p>
          </div>

          <div className="pt-2 border-t text-xs">
            <p className="font-medium mb-1">Interpreting CIs:</p>
            <p>
              A 95% CI means: if we repeated this analysis many times with different samples, 
              95% of the intervals would contain the true capability value. 
              Narrow CIs indicate precise estimates; wide CIs suggest more data is needed.
            </p>
          </div>

          <div className="pt-2 border-t text-xs">
            <p className="italic">
              References: NIST/SEMATECH e-Handbook of Statistical Methods (Section 7.2.6), 
              Montgomery "Introduction to SQC" (Ch. 9), Kotz & Johnson "Process Capability Indices" (1993)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
