import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, ResponsiveContainer, ReferenceLine } from 'recharts@2.15.2';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus } from 'lucide-react';
import { useRCA } from '../../contexts/RCAContext';

export function ParetoEditor() {
  const { project, addAction } = useRCA();
  const currentAnalysis = project.paretoAnalyses[0];

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

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="mb-2">{currentAnalysis.name}</h2>
          <p className="text-sm text-muted-foreground">
            Pareto Analysis applies the 80/20 rule to prioritize the most significant causes. 
            The chart shows causes sorted by impact, with a cumulative percentage line.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <Label>Category Field</Label>
            <Input value={currentAnalysis.categoryField} readOnly />
          </div>
          <div>
            <Label>Value Field</Label>
            <Input value={currentAnalysis.valueField} readOnly />
          </div>
          <div>
            <Label>Threshold (%)</Label>
            <Input type="number" value={currentAnalysis.threshold} readOnly />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border overflow-hidden">
          <div className="w-full" style={{ height: '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={currentAnalysis.data} 
                margin={{ top: 20, right: 60, left: 60, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left" 
                  label={{ value: 'Occurrences', angle: -90, position: 'insideLeft', offset: 10 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  label={{ value: 'Cumulative %', angle: 90, position: 'insideRight', offset: 10 }}
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ fontSize: 12 }}
                  wrapperStyle={{ zIndex: 1000 }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }} 
                  iconSize={12}
                />
                <ReferenceLine 
                  y={currentAnalysis.threshold} 
                  yAxisId="right" 
                  stroke="#ff7300" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: `${currentAnalysis.threshold}% threshold`, 
                    position: 'insideTopRight',
                    fill: '#ff7300',
                    fontSize: 11,
                    offset: 10
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  name="Occurrences"
                  yAxisId="left"
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Cumulative %"
                  yAxisId="right"
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="mb-2">Vital Few (Top Contributors)</h3>
            <div className="space-y-2">
              {currentAnalysis.data
                .filter(d => (d.cumulative || 0) <= currentAnalysis.threshold)
                .map(d => (
                  <div key={d.category} className="flex justify-between text-sm">
                    <span>{d.category}</span>
                    <span>{d.value} ({d.percentage?.toFixed(1)}%)</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="mb-2">Trivial Many</h3>
            <div className="space-y-2">
              {currentAnalysis.data
                .filter(d => (d.cumulative || 0) > currentAnalysis.threshold)
                .map(d => (
                  <div key={d.category} className="flex justify-between text-sm">
                    <span>{d.category}</span>
                    <span>{d.value} ({d.percentage?.toFixed(1)}%)</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p>
              <strong>Focus on the vital few:</strong> The top {currentAnalysis.data.filter(d => (d.cumulative || 0) <= currentAnalysis.threshold).length} categories 
              account for {currentAnalysis.threshold}% of the total impact.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              The cumulative percentage above this cut identifies the "vital few" contributors that should receive priority attention.
            </p>
          </div>
          <Button onClick={handleCreateActions}>
            <Plus className="h-4 w-4 mr-2" />
            Create Actions from Top Contributors
          </Button>
        </div>
      </div>
    </div>
  );
}
