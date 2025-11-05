import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts@2.15.2';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { AlertTriangle, TrendingUp, Plus, Download, Upload, Settings2, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { useRCA } from '../../contexts/RCAContext';

const subgroupColors: Record<string, string> = {
  'Shift A': '#3b82f6',
  'Shift B': '#ef4444',
  'Shift C': '#10b981'
};

export function ScatterEditor() {
  const { project } = useRCA();
  const currentAnalysis = project.scatterAnalyses[0];
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState(false);

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

  const getSignificanceColor = (p: number) => {
    if (p < 0.001) return 'text-green-700';
    if (p < 0.01) return 'text-blue-700';
    if (p < 0.05) return 'text-orange-700';
    return 'text-slate-700';
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

  const outliers = currentAnalysis.data.filter(d => d.isOutlier);
  const correlationStrength = getCorrelationStrength(currentAnalysis.r || 0);
  const significance = getSignificance(currentAnalysis.p || 1);

  return (
    <div className="h-full flex bg-slate-50/50">
      {/* Left Panel - Statistics Overview */}
      {isNavigatorCollapsed ? (
        <div className="w-12 flex-shrink-0 border-r bg-white flex flex-col items-center py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNavigatorCollapsed(false)}
            className="h-8 w-8 p-0 mb-4"
            title="Expand Statistics"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div 
            className="text-xs font-medium text-muted-foreground tracking-wider"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            STATISTICS
          </div>
        </div>
      ) : (
        <div className="w-72 border-r flex flex-col bg-white">
          <div className="p-5 border-b bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600">Statistics</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNavigatorCollapsed(true)}
                className="h-8 w-8 p-0"
                title="Collapse Statistics"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-3">
              {/* Correlation */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Correlation</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Pearson's r</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold">{currentAnalysis.r?.toFixed(3)}</span>
                      <Badge variant="outline">{correlationStrength}</Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">R-squared (R²)</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-semibold">{currentAnalysis.r2?.toFixed(3)}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((currentAnalysis.r2 || 0) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">p-value</div>
                    <div className={`text-sm font-semibold ${getSignificanceColor(currentAnalysis.p || 1)}`}>
                      {currentAnalysis.p?.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Points */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-sm">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Data Points
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <Badge variant="outline">{currentAnalysis.data.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outliers</span>
                    <Badge className={outliers.length > 0 ? "bg-orange-100 text-orange-700 hover:bg-orange-100" : "bg-slate-100 text-slate-700 hover:bg-slate-100"}>
                      {outliers.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subgroups</span>
                    <Badge variant="outline">{Object.keys(dataBySubgroup).length}</Badge>
                  </div>
                </div>
              </div>

              {/* Regression */}
              {currentAnalysis.regressionLine && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 shadow-sm">
                  <h4 className="font-medium mb-3 text-sm">Regression Equation</h4>
                  <div className="p-3 bg-white rounded-lg border font-mono text-sm">
                    y = {currentAnalysis.regressionLine.slope.toFixed(3)}x
                    {currentAnalysis.regressionLine.intercept >= 0 ? ' + ' : ' - '}
                    {Math.abs(currentAnalysis.regressionLine.intercept).toFixed(3)}
                  </div>
                </div>
              )}

              <Separator />

              {/* Outliers List */}
              {outliers.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">Outliers</h4>
                  <div className="space-y-2">
                    {outliers.map(point => (
                      <div key={point.id} className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{point.label}</span>
                          <Badge variant="outline" className="text-xs">{point.subgroup}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ({point.x}, {point.y})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Center - Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0 bg-gradient-to-b from-white to-slate-50/30">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl">{currentAnalysis.name}</h2>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Scatter Analysis
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Correlation analysis between {currentAnalysis.xVar} and {currentAnalysis.yVar}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="shadow-sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Button variant="outline" size="sm" className="shadow-sm">
                <Download className="h-4 w-4 mr-2" />
                Export Chart
              </Button>
              <Button variant="outline" size="sm" className="shadow-sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-orange-900 mb-1">
                Correlation does not imply causation
              </p>
              <p className="text-orange-700">
                Validate causality with experiments or additional evidence. Watch for confounding variables and outliers.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6 min-h-full">
            {/* Statistics Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-5 bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-sm">
                <div className="text-sm text-muted-foreground mb-1">Correlation (r)</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold">{currentAnalysis.r?.toFixed(3)}</span>
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                    {correlationStrength}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {(currentAnalysis.r || 0) > 0 ? 'Positive' : 'Negative'} relationship
                </p>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-sm">
                <div className="text-sm text-muted-foreground mb-1">R-squared (R²)</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold">{currentAnalysis.r2?.toFixed(3)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {((currentAnalysis.r2 || 0) * 100).toFixed(1)}% variance explained
                </p>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-sm">
                <div className="text-sm text-muted-foreground mb-1">Significance</div>
                <div className={`text-lg font-semibold ${getSignificanceColor(currentAnalysis.p || 1)}`}>
                  {significance.split(' ')[0]}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  p = {currentAnalysis.p?.toFixed(4)}
                </p>
              </Card>
            </div>

            {/* Main Scatter Chart */}
            <Card className="p-6 border-slate-200 shadow-sm overflow-hidden">
              <ResponsiveContainer width="100%" height={450}>
                <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={currentAnalysis.xVar}
                    label={{ value: currentAnalysis.xVar, position: 'bottom', offset: 40, fill: '#64748b', fontSize: 12 }}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={currentAnalysis.yVar}
                    label={{ value: currentAnalysis.yVar, angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 12 }}
                    tick={{ fill: '#64748b' }}
                  />
                  <ZAxis range={[100, 100]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                          <p className="font-semibold mb-1">{data.label}</p>
                          <p className="text-sm text-muted-foreground">{currentAnalysis.xVar}: <span className="font-medium text-foreground">{data.x}</span></p>
                          <p className="text-sm text-muted-foreground">{currentAnalysis.yVar}: <span className="font-medium text-foreground">{data.y}</span></p>
                          {data.subgroup && <p className="text-sm text-muted-foreground mt-1">Group: {data.subgroup}</p>}
                          {data.isOutlier && (
                            <Badge variant="destructive" className="mt-2">Outlier</Badge>
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
                            stroke={payload.isOutlier ? '#ef4444' : '#fff'}
                            strokeWidth={payload.isOutlier ? 2 : 1.5}
                            opacity={0.8}
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

            {/* Analysis Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Regression Details */}
              <Card className="p-5 bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">Regression Analysis</h3>
                </div>
                {currentAnalysis.regressionLine && (
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="text-xs text-muted-foreground mb-1">Equation</div>
                      <div className="font-mono text-sm font-medium">
                        y = {currentAnalysis.regressionLine.slope.toFixed(3)}x 
                        {currentAnalysis.regressionLine.intercept >= 0 ? ' + ' : ' - '}
                        {Math.abs(currentAnalysis.regressionLine.intercept).toFixed(3)}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="text-xs text-muted-foreground mb-1">Slope</div>
                      <div className="text-sm">
                        For each unit increase in {currentAnalysis.xVar}, {currentAnalysis.yVar} changes by{' '}
                        <strong>{currentAnalysis.regressionLine.slope.toFixed(3)}</strong> units
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Interpretation */}
              <Card className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                    <Target className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">Interpretation</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p>
                    <strong>Relationship:</strong> There is a <strong>{correlationStrength.toLowerCase()}</strong>
                    {' '}{(currentAnalysis.r || 0) > 0 ? 'positive' : 'negative'} correlation (r = {currentAnalysis.r?.toFixed(3)})
                    between {currentAnalysis.xVar} and {currentAnalysis.yVar}.
                  </p>
                  <p>
                    <strong>Variance:</strong> Approximately <strong>{((currentAnalysis.r2 || 0) * 100).toFixed(1)}%</strong> of
                    the variation in {currentAnalysis.yVar} can be explained by {currentAnalysis.xVar}.
                  </p>
                  <p className={getSignificanceColor(currentAnalysis.p || 1)}>
                    <strong>Significance:</strong> {significance}
                    {(currentAnalysis.p || 1) < 0.05 && 
                      ' — This suggests the relationship is unlikely to be due to chance alone.'}
                  </p>
                </div>
              </Card>
            </div>

            {/* Action Card */}
            <Card className="p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-sm">
              <h3 className="font-semibold mb-3">Next Steps</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This correlation analysis suggests a relationship between the variables. 
                To validate causality, consider conducting controlled experiments or gather additional evidence.
              </p>
              <Button className="shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                <Plus className="h-4 w-4 mr-2" />
                Promote to Hypothesis in Fishbone/FTA
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
