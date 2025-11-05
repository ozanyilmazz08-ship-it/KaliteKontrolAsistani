import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TrendingUp, TrendingDown, Minus, Lightbulb, RotateCcw } from "lucide-react";
import { CapabilityConfig } from "../../App";

type WhatIfSimulatorProps = {
  config: CapabilityConfig;
};

// Calculate capability indices
const calculateIndices = (
  lsl: number, 
  usl: number, 
  target: number, 
  mean: number, 
  sigmaWithin: number
) => {
  const cp = (usl - lsl) / (6 * sigmaWithin);
  const cpu = (usl - mean) / (3 * sigmaWithin);
  const cpl = (mean - lsl) / (3 * sigmaWithin);
  const cpk = Math.min(cpu, cpl);
  const cpm = (usl - lsl) / (6 * Math.sqrt(sigmaWithin ** 2 + (mean - target) ** 2));
  const zst = 3 * cpk;
  
  // Calculate PPM using normal approximation
  const zLower = (mean - lsl) / sigmaWithin;
  const zUpper = (usl - mean) / sigmaWithin;
  const ppmBelow = (1 - normCDF(zLower)) * 1_000_000;
  const ppmAbove = (1 - normCDF(zUpper)) * 1_000_000;
  const ppmTotal = ppmBelow + ppmAbove;
  const yield_ = 100 - (ppmTotal / 10_000);
  
  return { cp, cpk, cpu, cpl, cpm, zst, ppmTotal, yield: yield_ };
};

// Simple normal CDF approximation
const normCDF = (z: number): number => {
  if (z < -6) return 0;
  if (z > 6) return 1;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
};

export function WhatIfSimulator({ config }: WhatIfSimulatorProps) {
  // Current baseline values
  const baselineLSL = config.specifications.lsl || 95;
  const baselineUSL = config.specifications.usl || 105;
  const baselineTarget = config.specifications.target || 100;
  const baselineMean = 99.8;
  const baselineSigma = 1.15;
  
  // Simulated values
  const [simLSL, setSimLSL] = useState(baselineLSL);
  const [simUSL, setSimUSL] = useState(baselineUSL);
  const [simTarget, setSimTarget] = useState(baselineTarget);
  const [simMean, setSimMean] = useState(baselineMean);
  const [simSigma, setSimSigma] = useState(baselineSigma);

  // Calculate baseline and simulated indices
  const baselineResults = calculateIndices(
    baselineLSL, 
    baselineUSL, 
    baselineTarget, 
    baselineMean, 
    baselineSigma
  );
  
  const simulatedResults = calculateIndices(
    simLSL, 
    simUSL, 
    simTarget, 
    simMean, 
    simSigma
  );

  const handleReset = () => {
    setSimLSL(baselineLSL);
    setSimUSL(baselineUSL);
    setSimTarget(baselineTarget);
    setSimMean(baselineMean);
    setSimSigma(baselineSigma);
  };

  const getDelta = (baseline: number, simulated: number) => {
    const delta = ((simulated - baseline) / baseline) * 100;
    return delta;
  };

  const getTrendIcon = (baseline: number, simulated: number, higherIsBetter: boolean = true) => {
    const delta = getDelta(baseline, simulated);
    if (Math.abs(delta) < 0.5) return <Minus className="h-4 w-4 text-slate-500" />;
    
    const isImproved = higherIsBetter ? delta > 0 : delta < 0;
    return isImproved 
      ? <TrendingUp className="h-4 w-4 text-green-600" />
      : <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <Alert className="border-purple-200 bg-purple-50">
        <Lightbulb className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-900">
          <strong>What-If Analysis:</strong> Adjust specifications or process parameters to see instant 
          impact on capability indices and PPM. Explore process improvement scenarios before implementation.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Simulation Controls</CardTitle>
            <CardDescription>
              Adjust parameters to explore "what-if" scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Specifications */}
            <div>
              <h4 className="font-medium mb-3">Specification Limits</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sim-lsl">LSL (Lower Spec Limit)</Label>
                  <Input
                    id="sim-lsl"
                    type="number"
                    value={simLSL}
                    onChange={(e) => setSimLSL(parseFloat(e.target.value))}
                    step="0.1"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sim-target">Target</Label>
                  <Input
                    id="sim-target"
                    type="number"
                    value={simTarget}
                    onChange={(e) => setSimTarget(parseFloat(e.target.value))}
                    step="0.1"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="sim-usl">USL (Upper Spec Limit)</Label>
                  <Input
                    id="sim-usl"
                    type="number"
                    value={simUSL}
                    onChange={(e) => setSimUSL(parseFloat(e.target.value))}
                    step="0.1"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Process Parameters */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Process Parameters</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="sim-mean">Process Mean (μ)</Label>
                    <span className="text-sm">{simMean.toFixed(2)} {config.specifications.unit}</span>
                  </div>
                  <Slider
                    id="sim-mean"
                    min={baselineMean - 2}
                    max={baselineMean + 2}
                    step={0.01}
                    value={[simMean]}
                    onValueChange={(value) => setSimMean(value[0])}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Baseline: {baselineMean.toFixed(2)} {config.specifications.unit}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="sim-sigma">Process Std Dev (σ)</Label>
                    <span className="text-sm">{simSigma.toFixed(3)} {config.specifications.unit}</span>
                  </div>
                  <Slider
                    id="sim-sigma"
                    min={baselineSigma * 0.5}
                    max={baselineSigma * 1.5}
                    step={0.01}
                    value={[simSigma]}
                    onValueChange={(value) => setSimSigma(value[0])}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Baseline: {baselineSigma.toFixed(3)} {config.specifications.unit}
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={handleReset} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Baseline
            </Button>
          </CardContent>
        </Card>

        {/* Results Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Impact Analysis</CardTitle>
            <CardDescription>
              Compare simulated vs baseline performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Baseline</TableHead>
                  <TableHead className="text-right">Simulated</TableHead>
                  <TableHead className="text-center">Δ</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Cp</TableCell>
                  <TableCell className="text-right">{baselineResults.cp.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{simulatedResults.cp.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getDelta(baselineResults.cp, simulatedResults.cp) > 0 ? "default" : "outline"}>
                      {getDelta(baselineResults.cp, simulatedResults.cp).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getTrendIcon(baselineResults.cp, simulatedResults.cp, true)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Cpk</TableCell>
                  <TableCell className="text-right">{baselineResults.cpk.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{simulatedResults.cpk.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getDelta(baselineResults.cpk, simulatedResults.cpk) > 0 ? "default" : "outline"}>
                      {getDelta(baselineResults.cpk, simulatedResults.cpk).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getTrendIcon(baselineResults.cpk, simulatedResults.cpk, true)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Cpm</TableCell>
                  <TableCell className="text-right">{baselineResults.cpm.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{simulatedResults.cpm.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getDelta(baselineResults.cpm, simulatedResults.cpm) > 0 ? "default" : "outline"}>
                      {getDelta(baselineResults.cpm, simulatedResults.cpm).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getTrendIcon(baselineResults.cpm, simulatedResults.cpm, true)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Z<sub>st</sub></TableCell>
                  <TableCell className="text-right">{baselineResults.zst.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{simulatedResults.zst.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getDelta(baselineResults.zst, simulatedResults.zst) > 0 ? "default" : "outline"}>
                      {getDelta(baselineResults.zst, simulatedResults.zst).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getTrendIcon(baselineResults.zst, simulatedResults.zst, true)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">PPM</TableCell>
                  <TableCell className="text-right">{baselineResults.ppmTotal.toFixed(0)}</TableCell>
                  <TableCell className="text-right">{simulatedResults.ppmTotal.toFixed(0)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getDelta(baselineResults.ppmTotal, simulatedResults.ppmTotal) < 0 ? "default" : "outline"}>
                      {getDelta(baselineResults.ppmTotal, simulatedResults.ppmTotal).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getTrendIcon(baselineResults.ppmTotal, simulatedResults.ppmTotal, false)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Yield (%)</TableCell>
                  <TableCell className="text-right">{baselineResults.yield.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{simulatedResults.yield.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getDelta(baselineResults.yield, simulatedResults.yield) > 0 ? "default" : "outline"}>
                      {getDelta(baselineResults.yield, simulatedResults.yield).toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getTrendIcon(baselineResults.yield, simulatedResults.yield, true)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">AI-Powered Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {simulatedResults.cpk > baselineResults.cpk && (
            <div className="p-3 bg-white rounded border border-blue-200">
              <p className="font-medium text-green-700 mb-1">✓ Improvement Detected</p>
              <p className="text-slate-700">
                Your simulation shows a {((simulatedResults.cpk - baselineResults.cpk) / baselineResults.cpk * 100).toFixed(1)}% 
                improvement in Cpk. Consider implementing process changes to achieve μ ≈ {simMean.toFixed(2)} 
                and σ ≈ {simSigma.toFixed(3)} {config.specifications.unit}.
              </p>
            </div>
          )}
          
          {Math.abs(simMean - simTarget) > 0.5 && (
            <div className="p-3 bg-white rounded border border-amber-200">
              <p className="font-medium text-amber-700 mb-1">⚠ Off-Target Process</p>
              <p className="text-slate-700">
                Simulated mean ({simMean.toFixed(2)}) is {(Math.abs(simMean - simTarget)).toFixed(2)} {config.specifications.unit} from 
                target ({simTarget.toFixed(2)}). Centering on target could improve Cpm by{" "}
                {((calculateIndices(simLSL, simUSL, simTarget, simTarget, simSigma).cpm - simulatedResults.cpm) / simulatedResults.cpm * 100).toFixed(1)}%.
              </p>
            </div>
          )}

          <div className="p-3 bg-white rounded border border-slate-200 text-xs text-slate-600">
            <p>
              <strong>Tip:</strong> Use this simulator to evaluate the business impact of tightening specs, 
              reducing variation (Six Sigma projects), or adjusting target values before investing in process changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
