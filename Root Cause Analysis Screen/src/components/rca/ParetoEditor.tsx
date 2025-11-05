import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, ResponsiveContainer, ReferenceLine } from 'recharts@2.15.2';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Plus, Download, Upload, Settings2, TrendingUp, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRCA } from '../../contexts/RCAContext';

export function ParetoEditor() {
  const { project, addAction } = useRCA();
  const currentAnalysis = project.paretoAnalyses[0];
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState(false);

  const handleCreateActions = () => {
    // Create actions from top contributors (those before threshold)
    const topContributors = currentAnalysis.data.filter(d => (d.cumulative || 0) <= currentAnalysis.threshold);
    
    topContributors.forEach(contributor => {
      addAction({
        id: `action-pareto-${Date.now()}-${contributor.category}`,
        title: `Address ${contributor.category}`,
        description: `Investigate and resolve ${contributor.category} (${contributor.value} occurrences, ${contributor.percentage?.toFixed(1)}% of total)`,
        owner: '',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: contributor.percentage && contributor.percentage > 30 ? 'critical' : 'high',
        status: 'open',
        linkedTo: [{ method: 'pareto', nodeId: currentAnalysis.id }],
        createdAt: new Date().toISOString()
      });
    });
  };

  const vitalFew = currentAnalysis.data.filter(d => (d.cumulative || 0) <= currentAnalysis.threshold);
  const trivialMany = currentAnalysis.data.filter(d => (d.cumulative || 0) > currentAnalysis.threshold);
  const totalValue = currentAnalysis.data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-full flex bg-slate-50/50">
      {/* Left Panel - Analysis Overview */}
      {isNavigatorCollapsed ? (
        <div className="w-12 flex-shrink-0 border-r bg-white flex flex-col items-center py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNavigatorCollapsed(false)}
            className="h-8 w-8 p-0 mb-4"
            title="Expand Analysis Overview"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div 
            className="text-xs font-medium text-muted-foreground tracking-wider"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            OVERVIEW
          </div>
        </div>
      ) : (
        <div className="w-72 border-r flex flex-col bg-white">
          <div className="p-5 border-b bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600">Analysis Overview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNavigatorCollapsed(true)}
                className="h-8 w-8 p-0"
                title="Collapse Overview"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-3">
              {/* Total Statistics */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Total Items</span>
                  </div>
                  <Badge variant="secondary" className="px-2.5 py-0.5">
                    {currentAnalysis.data.length}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Value</span>
                    <span className="font-semibold">{totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Threshold</span>
                    <span className="font-semibold">{currentAnalysis.threshold}%</span>
                  </div>
                </div>
              </div>

              {/* Vital Few */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-white border border-red-200 shadow-sm">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Vital Few
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Categories</span>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      {vitalFew.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impact</span>
                    <span className="font-semibold text-red-700">
                      {vitalFew.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Percentage</span>
                    <span className="font-semibold text-red-700">
                      {vitalFew.reduce((sum, d) => sum + (d.percentage || 0), 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Trivial Many */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  Trivial Many
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Categories</span>
                    <Badge variant="outline">
                      {trivialMany.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impact</span>
                    <span className="font-semibold">
                      {trivialMany.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Percentage</span>
                    <span className="font-semibold">
                      {trivialMany.reduce((sum, d) => sum + (d.percentage || 0), 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Data Bindings */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">Data Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <Label className="text-xs">Category Field</Label>
                    <Input value={currentAnalysis.categoryField} readOnly className="h-8 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Value Field</Label>
                    <Input value={currentAnalysis.valueField} readOnly className="h-8 mt-1" />
                  </div>
                </div>
              </div>
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
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Pareto Analysis
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Applies the 80/20 rule to prioritize the most significant causes. 
                The chart shows causes sorted by impact, with a cumulative percentage line.
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

          {/* Statistics Bar */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              {currentAnalysis.data.length} total categories
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {vitalFew.length} vital few ({currentAnalysis.threshold}% threshold)
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
              {trivialMany.length} trivial many
            </span>
          </div>
        </div>

        {/* Chart Area */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Main Chart */}
            <Card className="p-6 border-slate-200 shadow-sm overflow-hidden">
              <div className="w-full" style={{ height: '500px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={currentAnalysis.data} 
                    margin={{ top: 20, right: 60, left: 60, bottom: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      label={{ value: 'Occurrences', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b' }}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      label={{ value: 'Cumulative %', angle: 90, position: 'insideRight', offset: 10, fill: '#64748b' }}
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{ fontSize: 12, borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }} 
                      iconSize={12}
                    />
                    <ReferenceLine 
                      y={currentAnalysis.threshold} 
                      yAxisId="right" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      label={{ 
                        value: `${currentAnalysis.threshold}% threshold (Vital Few)`, 
                        position: 'insideTopRight',
                        fill: '#f97316',
                        fontSize: 12,
                        fontWeight: 600,
                        offset: 10
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#3b82f6" 
                      name="Occurrences"
                      yAxisId="left"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="Cumulative %"
                      yAxisId="right"
                      dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Analysis Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Vital Few Details */}
              <Card className="p-5 bg-gradient-to-br from-red-50 to-white border-red-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">Vital Few (Top Contributors)</h3>
                </div>
                <div className="space-y-2 mb-4">
                  {vitalFew.map(d => (
                    <div key={d.category} className="flex justify-between text-sm p-2 bg-white rounded-lg border border-red-100">
                      <span className="font-medium">{d.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{d.value.toLocaleString()}</span>
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          {d.percentage?.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleCreateActions} className="w-full shadow-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Actions from Top Contributors
                </Button>
              </Card>

              {/* Trivial Many Details */}
              <Card className="p-5 bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">Trivial Many</h3>
                </div>
                <div className="space-y-2">
                  {trivialMany.map(d => (
                    <div key={d.category} className="flex justify-between text-sm p-2 bg-white rounded-lg border">
                      <span className="font-medium">{d.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{d.value.toLocaleString()}</span>
                        <Badge variant="outline">
                          {d.percentage?.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Interpretation */}
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-sm">
              <h3 className="font-semibold mb-3">Analysis Interpretation</h3>
              <div className="space-y-2 text-sm">
                <p className="leading-relaxed">
                  <strong>Focus on the vital few:</strong> The top {vitalFew.length} categories 
                  account for approximately <strong>{currentAnalysis.threshold}%</strong> of the total impact 
                  ({vitalFew.reduce((sum, d) => sum + d.value, 0).toLocaleString()} out of {totalValue.toLocaleString()} total occurrences).
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The cumulative percentage line shows how quickly the impact accumulates. 
                  Categories below the {currentAnalysis.threshold}% threshold line represent the "vital few" 
                  that should receive priority attention and resources.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Note:</strong> Pareto prioritizes effort but does not prove causality. 
                  Pair this analysis with evidence and deeper methods like Fishbone or FMEA.
                </p>
              </div>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
