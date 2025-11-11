import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RotateCcw, Play } from 'lucide-react';
import { useState } from 'react';
import { RiskMetrics } from '@/lib/mock-data';

interface ScenarioSimulatorProps {
  currentRisk: RiskMetrics;
  onSimulate: (deltaTarget: number, sigmaReduction: number) => void;
  onReset: () => void;
}

export function ScenarioSimulator({ currentRisk, onSimulate, onReset }: ScenarioSimulatorProps) {
  const [deltaTarget, setDeltaTarget] = useState<number[]>([0]);
  const [sigmaReduction, setSigmaReduction] = useState<number[]>([0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    onSimulate(deltaTarget[0], sigmaReduction[0]);
    setTimeout(() => setIsSimulating(false), 500);
  };

  const handleReset = () => {
    setDeltaTarget([0]);
    setSigmaReduction([0]);
    onReset();
  };

  // Calculate simulated risk
  const simulatedPPM = Math.max(
    10,
    currentRisk.expectedPPM * (1 - sigmaReduction[0] / 100) * (1 - Math.abs(deltaTarget[0]) * 0.05)
  );
  const simulatedYield = Math.min(99.99, 100 - simulatedPPM / 10000);

  const improvement = ((currentRisk.expectedPPM - simulatedPPM) / currentRisk.expectedPPM) * 100;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-900">Scenario Simulator (What-If Analysis)</h3>
          <p className="text-sm text-muted-foreground">
            Adjust process parameters to see predicted impact on risk and yield
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSimulate} disabled={isSimulating}>
            <Play className="size-4 mr-2" />
            Run Simulation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm">Δ Target Setpoint (mm)</label>
              <Badge variant="secondary">{deltaTarget[0] > 0 ? '+' : ''}{deltaTarget[0].toFixed(2)}</Badge>
            </div>
            <Slider
              value={deltaTarget}
              onValueChange={setDeltaTarget}
              min={-2}
              max={2}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Shift the process mean up or down
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm">σ Reduction (%)</label>
              <Badge variant="secondary">{sigmaReduction[0].toFixed(0)}%</Badge>
            </div>
            <Slider
              value={sigmaReduction}
              onValueChange={setSigmaReduction}
              min={0}
              max={50}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Process improvement: reduce variability
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              💡 <span className="font-semibold">Prescriptive Recommendation:</span>
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Shift target by <span className="font-semibold">+0.5mm</span> and reduce σ by <span className="font-semibold">15%</span> to achieve PPM &lt; 500
            </p>
          </div>
        </div>

        {/* Current vs Simulated */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm text-muted-foreground mb-3">Current State</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Expected PPM</div>
                <div className="text-gray-900">{currentRisk.expectedPPM.toFixed(0)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Forecasted Yield</div>
                <div className="text-gray-900">{currentRisk.forecastedYield.toFixed(2)}%</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Z-Risk</div>
                <div className="text-gray-900">{currentRisk.zRisk.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm text-muted-foreground mb-3">Simulated State</h4>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${improvement > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                <div className="text-sm text-muted-foreground">Expected PPM</div>
                <div className="flex items-center justify-between">
                  <div className={improvement > 0 ? 'text-green-700' : 'text-gray-900'}>
                    {simulatedPPM.toFixed(0)}
                  </div>
                  {improvement > 0 && (
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      -{improvement.toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${improvement > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                <div className="text-sm text-muted-foreground">Forecasted Yield</div>
                <div className={improvement > 0 ? 'text-green-700' : 'text-gray-900'}>
                  {simulatedYield.toFixed(2)}%
                </div>
              </div>
              <div className={`p-3 rounded-lg ${improvement > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                <div className="text-sm text-muted-foreground">Z-Risk</div>
                <div className={improvement > 0 ? 'text-green-700' : 'text-gray-900'}>
                  {(currentRisk.zRisk + sigmaReduction[0] * 0.02).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-900">
          ⚠ Risk to specs assumes the forecast distribution shown. Use 95% PI to be conservative. 
          Projected values require Quality Engineer approval and will be logged to Audit.
        </p>
      </div>
    </Card>
  );
}