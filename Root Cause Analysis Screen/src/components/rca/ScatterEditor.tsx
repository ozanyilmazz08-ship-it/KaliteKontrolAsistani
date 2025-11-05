import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ZAxis } from 'recharts@2.15.2';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import { useRCA } from '../../contexts/RCAContext';

const subgroupColors: Record<string, string> = {
  'Shift A': '#3b82f6',
  'Shift B': '#ef4444',
  'Shift C': '#10b981'
};

export function ScatterEditor() {
  const { project } = useRCA();
  const currentAnalysis = project.scatterAnalyses[0];

  const getCorrelationStrength = (r: number) => {
    const absR = Math.abs(r);
    if (absR >= 0.7) return 'Strong';
    if (absR >= 0.4) return 'Moderate';
    if (absR >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  const getSignificance = (p: number) => {
    if (p < 0.001) return 'Highly significant (p < 0.001)';
    if (p < 0.01) return 'Very significant (p < 0.01)';
    if (p < 0.05) return 'Significant (p < 0.05)';
    return 'Not significant (p ≥ 0.05)';
  };

  const getRegressionData = () => {
    if (!currentAnalysis.regressionLine) return [];
    const { slope, intercept } = currentAnalysis.regressionLine;
    const xMin = Math.min(...currentAnalysis.data.map(d => d.x));
    const xMax = Math.max(...currentAnalysis.data.map(d => d.x));
    return [
      { x: xMin, y: slope * xMin + intercept },
      { x: xMax, y: slope * xMax + intercept }
    ];
  };

  const regressionData = getRegressionData();

  // Group data by subgroup for color coding
  const dataBySubgroup = currentAnalysis.data.reduce((acc, point) => {
    const group = point.subgroup || 'Default';
    if (!acc[group]) acc[group] = [];
    acc[group].push(point);
    return acc;
  }, {} as Record<string, typeof currentAnalysis.data>);

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="mb-2">{currentAnalysis.name}</h2>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm mb-1">
                <strong>Scatter Analysis Guidance:</strong> Correlation quantifies association between variables but does not imply causation.
              </p>
              <p className="text-sm text-muted-foreground">
                Validate causality with experiments or additional evidence. Watch for confounding variables and outliers.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Correlation (r)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl">{currentAnalysis.r?.toFixed(3)}</span>
              <Badge variant="outline">{getCorrelationStrength(currentAnalysis.r || 0)}</Badge>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">R-squared (R²)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl">{currentAnalysis.r2?.toFixed(3)}</span>
              <span className="text-sm text-muted-foreground">
                ({((currentAnalysis.r2 || 0) * 100).toFixed(1)}% variance explained)
              </span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Statistical Significance</div>
            <div className="text-sm mt-2">
              {getSignificance(currentAnalysis.p || 1)}
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name={currentAnalysis.xVar}
                label={{ value: currentAnalysis.xVar, position: 'bottom', offset: 40 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={currentAnalysis.yVar}
                label={{ value: currentAnalysis.yVar, angle: -90, position: 'insideLeft', offset: 10 }}
              />
              <ZAxis range={[100, 100]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <p className="font-medium">{data.label}</p>
                      <p className="text-sm">{currentAnalysis.xVar}: {data.x}</p>
                      <p className="text-sm">{currentAnalysis.yVar}: {data.y}</p>
                      {data.subgroup && <p className="text-sm text-muted-foreground">{data.subgroup}</p>}
                      {data.isOutlier && (
                        <Badge variant="destructive" className="mt-1">Outlier</Badge>
                      )}
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {/* Plot data points by subgroup */}
              {Object.entries(dataBySubgroup).map(([group, points]) => (
                <Scatter
                  key={group}
                  name={group}
                  data={points}
                  fill={subgroupColors[group] || '#6b7280'}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={payload.isOutlier ? 8 : 6}
                        fill={subgroupColors[group] || '#6b7280'}
                        stroke={payload.isOutlier ? '#ef4444' : 'none'}
                        strokeWidth={payload.isOutlier ? 2 : 0}
                        opacity={0.7}
                      />
                    );
                  }}
                />
              ))}

              {/* Regression line */}
              {regressionData.length > 0 && (
                <Scatter
                  name="Regression Line"
                  data={regressionData}
                  fill="none"
                  line={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }}
                  shape={() => null}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h3>Regression Equation</h3>
            </div>
            {currentAnalysis.regressionLine && (
              <div className="font-mono text-sm">
                y = {currentAnalysis.regressionLine.slope.toFixed(3)}x + {currentAnalysis.regressionLine.intercept.toFixed(3)}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="mb-3">Outliers</h3>
            {currentAnalysis.data.filter(d => d.isOutlier).length > 0 ? (
              <div className="space-y-2">
                {currentAnalysis.data.filter(d => d.isOutlier).map(point => (
                  <div key={point.id} className="flex items-center justify-between text-sm">
                    <span>{point.label}</span>
                    <Badge variant="outline">{point.subgroup}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No outliers detected</p>
            )}
          </Card>
        </div>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="mb-3">Analysis Interpretation</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Relationship:</strong> There is a {getCorrelationStrength(currentAnalysis.r || 0).toLowerCase()} 
              {' '}{(currentAnalysis.r || 0) > 0 ? 'positive' : 'negative'} correlation between{' '}
              {currentAnalysis.xVar} and {currentAnalysis.yVar}.
            </p>
            <p>
              <strong>Variance Explained:</strong> Approximately {((currentAnalysis.r2 || 0) * 100).toFixed(1)}% 
              of the variation in {currentAnalysis.yVar} can be explained by {currentAnalysis.xVar}.
            </p>
            <p>
              <strong>Statistical Significance:</strong> {getSignificance(currentAnalysis.p || 1)}
              {(currentAnalysis.p || 1) < 0.05 && 
                ' — This suggests the relationship is unlikely to be due to chance alone.'}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Promote to Hypothesis in Fishbone/FTA
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
