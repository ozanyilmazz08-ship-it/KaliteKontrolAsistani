import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShapValue, AnomalyDetail, DriftMetrics } from '@/lib/mock-data';
import { AlertCircle, TrendingUp, TrendingDown, Activity, Wrench, GitBranch } from 'lucide-react';

interface InsightsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawerType: 'risk' | 'mean' | 'variability' | 'condition' | 'anomaly' | null;
  shapValues: ShapValue[];
  anomalyDetails: AnomalyDetail[];
  driftMetrics: DriftMetrics;
}

export function InsightsDrawer({
  open,
  onOpenChange,
  drawerType,
  shapValues,
  anomalyDetails,
  driftMetrics
}: InsightsDrawerProps) {
  const getTitle = () => {
    switch (drawerType) {
      case 'risk': return 'Risk of Spec Violation — Details';
      case 'mean': return 'Predicted Mean & Range — Details';
      case 'variability': return 'Predicted Variability — Details';
      case 'condition': return 'AI Condition — Details';
      case 'anomaly': return 'Anomaly Details';
      default: return 'AI Insights';
    }
  };

  const getDescription = () => {
    switch (drawerType) {
      case 'risk': return 'Tail probabilities, forecast quantiles, and sensitivity analysis';
      case 'mean': return 'Point forecasts with prediction intervals and trend decomposition';
      case 'variability': return 'Expected variance components and stability metrics';
      case 'condition': return 'Aggregated alerts, drift metrics, and system health';
      case 'anomaly': return 'Detection methods, severity, and contributing factors';
      default: return 'Explore model parameters, explainability, and quality metrics';
    }
  };

  // Prepare SHAP data for chart
  const shapChartData = shapValues
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .map(s => ({
      feature: s.feature,
      contribution: s.contribution,
      absContribution: Math.abs(s.contribution)
    }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
          <SheetDescription>{getDescription()}</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="explainability" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="explainability">Explain</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="drift">Drift</TabsTrigger>
          </TabsList>

          {/* Explainability Tab */}
          <TabsContent value="explainability" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="size-4 text-blue-600" />
                <h4 className="text-sm">SHAP Feature Importance (Global)</h4>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shapChartData} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis dataKey="feature" type="category" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded p-2 shadow-lg">
                          <p className="text-sm font-semibold">{data.feature}</p>
                          <p className="text-sm">Impact: {data.contribution > 0 ? '+' : ''}{data.contribution.toFixed(3)}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                    {shapChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.contribution > 0 ? '#3b82f6' : '#ef4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Top Driver:</span> Temperature is pushing the forecast lower by 0.42 units. 
                  Consider cooling optimization.
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <GitBranch className="size-4 text-purple-600" />
                <h4 className="text-sm">Local Explanation (Latest Forecast Point)</h4>
              </div>
              <div className="space-y-2">
                {shapValues.slice(0, 5).map((shap, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="text-sm">{shap.feature}</div>
                      <div className="text-xs text-muted-foreground">Value: {shap.value}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {shap.contribution > 0 ? (
                        <TrendingUp className="size-4 text-blue-600" />
                      ) : (
                        <TrendingDown className="size-4 text-red-600" />
                      )}
                      <Badge variant={shap.contribution > 0 ? 'default' : 'destructive'}>
                        {shap.contribution > 0 ? '+' : ''}{shap.contribution.toFixed(3)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Model Tab */}
          <TabsContent value="model" className="space-y-4 mt-4">
            <Card className="p-4">
              <h4 className="text-sm mb-3">Model Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Model Type</span>
                  <Badge>Temporal Fusion Transformer (TFT)</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm">v2.3.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Trained</span>
                  <span className="text-sm">2025-11-05 14:32 UTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Training Window</span>
                  <span className="text-sm">500 hours</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm mb-3">Performance Metrics</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">RMSE</span>
                    <span className="text-sm">0.82</span>
                  </div>
                  <Progress value={18} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">MAPE</span>
                    <span className="text-sm">3.2%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">MASE</span>
                    <span className="text-sm">0.76</span>
                  </div>
                  <Progress value={24} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Calibration Score</span>
                    <span className="text-sm">0.94</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm mb-3">Uncertainty Quantification</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span>Conformal Prediction + Quantile Regression</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coverage Level</span>
                  <span>95% PI</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Empirical Coverage</span>
                  <Badge variant="outline" className="text-green-700 border-green-300">94.8%</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Anomalies Tab */}
          <TabsContent value="anomalies" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm">Detected Anomalies ({anomalyDetails.length})</h4>
              <Badge variant="outline">{anomalyDetails.filter(a => a.severity === 'high').length} High</Badge>
            </div>

            <div className="space-y-3">
              {anomalyDetails.slice(0, 8).map((anomaly, idx) => (
                <Card key={idx} className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`size-4 ${
                        anomaly.severity === 'high' ? 'text-red-600' :
                        anomaly.severity === 'medium' ? 'text-orange-600' :
                        'text-yellow-600'
                      }`} />
                      <span className="text-sm">
                        {anomaly.timestamp.toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <Badge variant={
                      anomaly.severity === 'high' ? 'destructive' :
                      anomaly.severity === 'medium' ? 'default' :
                      'secondary'
                    }>
                      {anomaly.severity}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value:</span>
                      <span>{anomaly.value.toFixed(2)} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Z-Score:</span>
                      <span>{anomaly.zScore.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reason:</span>
                      <span>{anomaly.reason}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-muted-foreground">Rules triggered:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {anomaly.rules.map((rule, rIdx) => (
                          <Badge key={rIdx} variant="outline" className="text-xs">
                            {rule}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Drift Tab */}
          <TabsContent value="drift" className="space-y-4 mt-4">
            <Card className="p-4">
              <h4 className="text-sm mb-3">Data Drift Metrics</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">PSI (Population Stability Index)</span>
                    <Badge variant={driftMetrics.psi > 0.25 ? 'destructive' : driftMetrics.psi > 0.1 ? 'default' : 'secondary'}>
                      {driftMetrics.psi.toFixed(3)}
                    </Badge>
                  </div>
                  <Progress 
                    value={Math.min(driftMetrics.psi * 400, 100)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {driftMetrics.psi < 0.1 ? 'Small drift' : driftMetrics.psi < 0.25 ? 'Moderate drift' : 'Large drift'}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">KS Statistic</span>
                    <span className="text-sm">{driftMetrics.ksStatistic.toFixed(3)}</span>
                  </div>
                  <Progress value={driftMetrics.ksStatistic * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Concept Drift Score</span>
                    <span className="text-sm">{driftMetrics.conceptDrift.toFixed(3)}</span>
                  </div>
                  <Progress value={driftMetrics.conceptDrift * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Data Quality Score</span>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {(driftMetrics.dataQualityScore * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={driftMetrics.dataQualityScore * 100} className="h-2" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="size-4 text-purple-600" />
                <h4 className="text-sm">Monitoring Recommendations</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span>•</span>
                  <span>PSI indicates moderate drift in Temperature distribution. Review recent calibration.</span>
                </div>
                <div className="flex gap-2">
                  <span>•</span>
                  <span>Model retraining recommended within 48 hours to maintain accuracy.</span>
                </div>
                <div className="flex gap-2">
                  <span>•</span>
                  <span>Data quality remains high (96.2%). No immediate action required.</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <p className="text-sm text-yellow-900">
                ⚠ <span className="font-semibold">Alert:</span> Rolling forecast error (sMAPE) has increased by 15% 
                over the last 3 days. Consider investigating recent process changes.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
