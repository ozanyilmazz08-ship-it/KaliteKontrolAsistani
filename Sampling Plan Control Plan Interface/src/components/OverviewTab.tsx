import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="text-slate-600">Features Covered</div>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="mb-1">128 of 132</div>
          <Progress value={97} className="h-2 mb-2" />
          <div className="text-slate-600 flex items-center gap-1">
            <span>97% coverage</span>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="text-slate-600">Sampling Plans Linked</div>
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mb-1">8 Active Plans</div>
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="secondary" className="text-xs">Normal</Badge>
            <Badge variant="secondary" className="text-xs">Tightened</Badge>
            <Badge variant="secondary" className="text-xs">Safe Launch</Badge>
          </div>
          <div className="text-slate-600">3 inspection levels</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="text-slate-600">Current Inspection Load</div>
            <TrendingDown className="h-5 w-5 text-green-600" />
          </div>
          <div className="mb-1">42 samples/batch</div>
          <div className="text-slate-600 mb-2">avg. batch size: 500</div>
          <div className="text-slate-600 flex items-center gap-1">
            <span>-8% vs last month</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="text-slate-600">Non-Conformance Rate</div>
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="mb-1">0.82%</div>
          <div className="h-8 flex items-end gap-0.5 mb-2">
            {[0.6, 0.8, 0.9, 1.2, 0.7, 0.6, 0.82].map((val, i) => (
              <div 
                key={i} 
                className="flex-1 bg-orange-200 rounded-t"
                style={{ height: `${val * 30}px` }}
              />
            ))}
          </div>
          <div className="text-slate-600">Within target: &lt;1.5%</div>
        </Card>
      </div>

      {/* Linked Plan Panel */}
      <Card className="p-6">
        <h3 className="mb-4">Control Plan Sections & Linked Sampling Plans</h3>
        
        <div className="space-y-4">
          {/* Incoming Inspection */}
          <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span>Incoming Inspection</span>
                  <Badge variant="outline" className="text-xs">23 features</Badge>
                </div>
                <div className="text-slate-600">Raw materials & purchased components</div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">Material Receipt</Badge>
              <Badge variant="secondary" className="text-xs">Dimensional Check</Badge>
              <Badge variant="secondary" className="text-xs">Visual Inspection</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200">
                <span>AQL 1.0 – Normal</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs border border-purple-200">
                <span>100% Critical Features</span>
              </div>
            </div>
          </div>

          {/* In-Process Inspection */}
          <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span>In-Process Inspection</span>
                  <Badge variant="outline" className="text-xs">67 features</Badge>
                </div>
                <div className="text-slate-600">Manufacturing operations monitoring</div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">Machining</Badge>
              <Badge variant="secondary" className="text-xs">Assembly</Badge>
              <Badge variant="secondary" className="text-xs">Welding</Badge>
              <Badge variant="secondary" className="text-xs">Surface Treatment</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200">
                <span>AQL 0.65 – Tightened</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-xs border border-orange-200">
                <span>Safe Launch – 100%</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs border border-green-200">
                <span>SPC Monitoring</span>
              </div>
            </div>
          </div>

          {/* Final Inspection */}
          <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span>Final Inspection</span>
                  <Badge variant="outline" className="text-xs">42 features</Badge>
                </div>
                <div className="text-slate-600">Pre-shipment validation</div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">Functional Test</Badge>
              <Badge variant="secondary" className="text-xs">Final Audit</Badge>
              <Badge variant="secondary" className="text-xs">Packaging</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200">
                <span>AQL 1.5 – Normal</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs border border-purple-200">
                <span>Customer-Specific: Level II</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline/Phase Indicator */}
      <Card className="p-6">
        <h3 className="mb-4">Production Phase Timeline</h3>
        
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200">
            <div className="absolute h-full w-3/4 bg-blue-600"></div>
          </div>
          
          {/* Steps */}
          <div className="relative grid grid-cols-4 gap-4">
            {/* PPAP */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 relative z-10">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="mb-1">PPAP</div>
              <div className="text-slate-600">100% Inspection</div>
              <Badge variant="outline" className="mt-2 text-xs">Completed</Badge>
            </div>

            {/* Safe Launch */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 relative z-10">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="mb-1">Safe Launch</div>
              <div className="text-slate-600">Enhanced Sampling</div>
              <Badge variant="outline" className="mt-2 text-xs">Completed</Badge>
            </div>

            {/* Production */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 relative z-10 ring-4 ring-blue-200">
                <span>3</span>
              </div>
              <div className="mb-1">Production</div>
              <div className="text-slate-600">Normal Sampling</div>
              <Badge className="mt-2 text-xs bg-blue-600">Current</Badge>
            </div>

            {/* Reduced */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mb-2 relative z-10">
                <span>4</span>
              </div>
              <div className="mb-1">Reduced Inspection</div>
              <div className="text-slate-600">Earned reduction</div>
              <Badge variant="outline" className="mt-2 text-xs">Eligible in 45 days</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}