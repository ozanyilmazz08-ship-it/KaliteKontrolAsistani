import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { RiskMetrics } from '@/lib/mock-data';
import { FormulaTooltip } from './formula-tooltip';

interface KPICardsProps {
  riskMetrics: RiskMetrics;
  predictedMean: number;
  predictedSigma: number;
  aiCondition: 'Normal' | 'Warning' | 'Alert';
  aiReasons: string[];
  onCardClick: (cardType: 'risk' | 'mean' | 'variability' | 'condition') => void;
}

export function KPICards({
  riskMetrics,
  predictedMean,
  predictedSigma,
  aiCondition,
  aiReasons,
  onCardClick
}: KPICardsProps) {
  const conditionColors = {
    Normal: 'bg-green-50 border-green-200',
    Warning: 'bg-yellow-50 border-yellow-200',
    Alert: 'bg-red-50 border-red-200'
  };

  const conditionTextColors = {
    Normal: 'text-green-700',
    Warning: 'text-yellow-700',
    Alert: 'text-red-700'
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Risk of Spec Violation */}
      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onCardClick('risk')}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-orange-600" />
            <span className="text-muted-foreground text-sm">Risk of Spec Violation</span>
          </div>
          <Badge variant="outline" className="text-xs">95% PI</Badge>
        </div>
        <div className="space-y-1">
          <div className="text-gray-900">{riskMetrics.expectedPPM.toFixed(0)} PPM</div>
          <div className="text-sm text-muted-foreground">
            Forecasted Yield: {riskMetrics.forecastedYield.toFixed(2)}%
          </div>
          <div className="text-sm text-muted-foreground">
            Z-risk: {riskMetrics.zRisk.toFixed(2)}
          </div>
          {riskMetrics.projectedCpk && (
            <div className="text-sm text-muted-foreground">
              Projected Cpk: {riskMetrics.projectedCpk.toFixed(2)} <span className="text-xs">(info)</span>
            </div>
          )}
        </div>
      </Card>

      {/* Predicted Mean & Range */}
      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onCardClick('mean')}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-blue-600" />
            <span className="text-muted-foreground text-sm">Predicted Mean & Range</span>
          </div>
          <Badge variant="outline" className="text-xs">Next 24h</Badge>
        </div>
        <div className="space-y-1">
          <div className="text-gray-900">{predictedMean.toFixed(2)} mm</div>
          <div className="text-sm text-muted-foreground">
            90% PI: [{(predictedMean - 1.645 * predictedSigma).toFixed(2)}, {(predictedMean + 1.645 * predictedSigma).toFixed(2)}]
          </div>
          <div className="text-sm text-muted-foreground">
            95% PI: [{(predictedMean - 1.96 * predictedSigma).toFixed(2)}, {(predictedMean + 1.96 * predictedSigma).toFixed(2)}]
          </div>
        </div>
      </Card>

      {/* Predicted Variability */}
      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onCardClick('variability')}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-purple-600" />
            <span className="text-muted-foreground text-sm">Predicted Variability</span>
          </div>
          <Badge variant="outline" className="text-xs">σ̂ₕ</Badge>
        </div>
        <div className="space-y-1">
          <div className="text-gray-900">{predictedSigma.toFixed(3)} mm</div>
          <div className="text-sm text-muted-foreground">
            Short-term σ: {(predictedSigma * 0.85).toFixed(3)}
          </div>
          <div className="text-sm text-muted-foreground">
            Long-term σ: {(predictedSigma * 1.15).toFixed(3)}
          </div>
        </div>
      </Card>

      {/* AI Condition */}
      <Card 
        className={`p-4 cursor-pointer hover:shadow-md transition-shadow border-2 ${conditionColors[aiCondition]}`}
        onClick={() => onCardClick('condition')}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className={`size-4 ${conditionTextColors[aiCondition]}`} />
            <span className="text-muted-foreground text-sm">AI Condition</span>
          </div>
          <Badge 
            variant={aiCondition === 'Normal' ? 'default' : 'destructive'}
            className="text-xs"
          >
            {aiCondition}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className={`${conditionTextColors[aiCondition]}`}>{aiCondition}</div>
          {aiReasons.slice(0, 2).map((reason, idx) => (
            <div key={idx} className="text-sm text-muted-foreground">
              • {reason}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}