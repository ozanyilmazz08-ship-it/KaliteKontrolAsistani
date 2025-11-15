import { useState } from 'react';
import { Search, Filter, ChevronRight, Info } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// Mock data
const characteristics = [
  { id: 'CH-001', name: 'Bore Diameter', processStep: 'Machining', criticality: 'C', currentPlan: 'AQL 0.65 - Tightened', measurementType: 'Variable', controlMethod: 'SPC', status: 'Active' },
  { id: 'CH-002', name: 'Surface Finish', processStep: 'Machining', criticality: 'S', currentPlan: 'AQL 1.0 - Normal', measurementType: 'Variable', controlMethod: 'Sampling', status: 'Active' },
  { id: 'CH-003', name: 'Thread Depth', processStep: 'Machining', criticality: 'C', currentPlan: '100% Inspection', measurementType: 'Variable', controlMethod: '100%', status: 'Active' },
  { id: 'CH-004', name: 'Weld Integrity', processStep: 'Welding', criticality: 'C', currentPlan: 'AQL 0.65 - Tightened', measurementType: 'Attribute', controlMethod: 'NDT', status: 'Active' },
  { id: 'CH-005', name: 'Paint Thickness', processStep: 'Surface Treatment', criticality: 'S', currentPlan: 'AQL 1.5 - Normal', measurementType: 'Variable', controlMethod: 'Sampling', status: 'Active' },
  { id: 'CH-006', name: 'Assembly Torque', processStep: 'Assembly', criticality: 'C', currentPlan: '100% Inspection', measurementType: 'Variable', controlMethod: 'Torque Tool', status: 'Active' },
  { id: 'CH-007', name: 'Visual Defects', processStep: 'Final Inspection', criticality: 'R', currentPlan: 'AQL 2.5 - Normal', measurementType: 'Attribute', controlMethod: 'Visual', status: 'Active' },
  { id: 'CH-008', name: 'Dimensional Check', processStep: 'Incoming', criticality: 'S', currentPlan: 'AQL 1.0 - Normal', measurementType: 'Variable', controlMethod: 'CMM', status: 'Active' },
];

const samplingPlans = [
  { id: 'plan-1', name: '100% Inspection', description: 'Every unit inspected', recommended: ['Critical features', 'New processes'] },
  { id: 'plan-2', name: 'AQL 0.65 - Tightened', description: 'Stringent sampling, 0.65% acceptable defect level', recommended: ['Critical features', 'Recent issues'] },
  { id: 'plan-3', name: 'AQL 1.0 - Normal', description: 'Standard sampling, 1.0% acceptable defect level', recommended: ['Significant features', 'Stable processes'] },
  { id: 'plan-4', name: 'AQL 1.5 - Normal', description: 'Standard sampling, 1.5% acceptable defect level', recommended: ['Significant features'] },
  { id: 'plan-5', name: 'AQL 2.5 - Reduced', description: 'Reduced sampling for proven stable processes', recommended: ['Routine features', 'Stable history'] },
  { id: 'plan-6', name: 'Skip Lot', description: 'Sample only every Nth lot', recommended: ['Low risk', 'Excellent history'] },
];

export function MappingTab() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('plan-2');

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    setSelectedRows(selectedRows.length === characteristics.length ? [] : characteristics.map(c => c.id));
  };

  return (
    <div className="flex h-full">
      {/* Left Pane - Data Table */}
      <div className="flex-1 border-r flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-slate-50 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search characteristics..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Process Steps</SelectItem>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="machining">Machining</SelectItem>
                <SelectItem value="welding">Welding</SelectItem>
                <SelectItem value="assembly">Assembly</SelectItem>
                <SelectItem value="final">Final Inspection</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-crit">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-crit">All Criticality</SelectItem>
                <SelectItem value="critical">Critical (C)</SelectItem>
                <SelectItem value="significant">Significant (S)</SelectItem>
                <SelectItem value="routine">Routine (R)</SelectItem>
              </SelectContent>
            </Select>

            {selectedRows.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {selectedRows.length} selected
              </Badge>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b">
                <th className="text-left p-3 w-12">
                  <Checkbox 
                    checked={selectedRows.length === characteristics.length}
                    onCheckedChange={toggleAllRows}
                  />
                </th>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Feature Name</th>
                <th className="text-left p-3">Process Step</th>
                <th className="text-left p-3">Crit.</th>
                <th className="text-left p-3">Current Sampling Plan</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Control</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {characteristics.map((char) => (
                <tr 
                  key={char.id} 
                  className={`border-b hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedRows.includes(char.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleRowSelection(char.id)}
                >
                  <td className="p-3">
                    <Checkbox 
                      checked={selectedRows.includes(char.id)}
                      onCheckedChange={() => toggleRowSelection(char.id)}
                    />
                  </td>
                  <td className="p-3">{char.id}</td>
                  <td className="p-3">{char.name}</td>
                  <td className="p-3">
                    <Badge variant="secondary" className="text-xs">
                      {char.processStep}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge 
                      variant={char.criticality === 'C' ? 'destructive' : char.criticality === 'S' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {char.criticality}
                    </Badge>
                  </td>
                  <td className="p-3 text-slate-700">{char.currentPlan}</td>
                  <td className="p-3 text-slate-600">{char.measurementType}</td>
                  <td className="p-3 text-slate-600">{char.controlMethod}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      {char.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Pane - Editor */}
      <div className="w-[480px] flex flex-col bg-slate-50">
        <div className="p-6 space-y-6 overflow-auto flex-1">
          {/* Selected Summary */}
          <Card className="p-4">
            <div className="mb-2">Selected Characteristics</div>
            <div className="text-slate-600">
              {selectedRows.length === 0 ? (
                'Select one or more characteristics from the table to edit'
              ) : (
                <>
                  <span>{selectedRows.length} characteristic(s) selected</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedRows.slice(0, 3).map(id => {
                      const char = characteristics.find(c => c.id === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {char?.id}
                        </Badge>
                      );
                    })}
                    {selectedRows.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedRows.length - 3} more
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>

          {selectedRows.length > 0 && (
            <>
              {/* Sampling Plan Selector */}
              <div className="space-y-3">
                <Label>Select Sampling Plan</Label>
                <div className="grid gap-2">
                  {samplingPlans.map((plan) => (
                    <Card 
                      key={plan.id}
                      className={`p-3 cursor-pointer transition-all hover:border-blue-400 ${
                        selectedPlan === plan.id ? 'border-blue-600 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedPlan === plan.id ? 'border-blue-600' : 'border-slate-300'
                          }`}>
                            {selectedPlan === plan.id && (
                              <div className="w-2 h-2 rounded-full bg-blue-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="mb-1">{plan.name}</div>
                          <div className="text-slate-600 mb-2">{plan.description}</div>
                          <div className="flex flex-wrap gap-1">
                            {plan.recommended.map((rec, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {rec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Parameters */}
              <Card className="p-4 space-y-4">
                <div>
                  <Label className="mb-2 flex items-center gap-2">
                    Sampling Parameters
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Configure sample size and acceptance criteria based on lot size</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-600">Lot Size Range</Label>
                      <Input type="text" value="281-500" className="mt-1" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-600">Sample Size</Label>
                        <Input type="number" value="50" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-slate-600">Inspection Level</Label>
                        <Select defaultValue="II">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="I">Level I</SelectItem>
                            <SelectItem value="II">Level II</SelectItem>
                            <SelectItem value="III">Level III</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-600">Accept #</Label>
                        <Input type="number" value="1" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-slate-600">Reject #</Label>
                        <Input type="number" value="2" className="mt-1" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-600">Inspection Frequency</Label>
                      <Select defaultValue="every-lot">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="every-lot">Every Lot</SelectItem>
                          <SelectItem value="every-2">Every 2nd Lot</SelectItem>
                          <SelectItem value="every-5">Every 5th Lot</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Impact Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-blue-900 mb-2">Impact Summary</div>
                  <div className="text-blue-800 space-y-1">
                    <div className="flex justify-between">
                      <span>Estimated samples per lot:</span>
                      <span>50 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inspection time:</span>
                      <span>~2.5 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Detection probability:</span>
                      <span>98.5%</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Options */}
              <Card className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Apply to all in process step</Label>
                    <div className="text-slate-600">Apply this plan to all characteristics in the same process step</div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Override customer plan</Label>
                    <div className="text-slate-600">Use internal plan instead of customer-specified plan</div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-escalate on failures</Label>
                    <div className="text-slate-600">Automatically switch to tightened inspection after 2 consecutive failures</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </Card>

              <Button className="w-full">
                Apply Changes to Selected
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
