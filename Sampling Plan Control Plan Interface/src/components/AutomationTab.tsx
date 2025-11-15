import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { validateDuration } from './ValidationUtils';

export function AutomationTab() {
  const [rules, setRules] = useState([
    {
      id: 'rule-1',
      name: 'Non-conformance Escalation',
      condition: 'IF non-conformance rate >1.5% in 10 consecutive lots',
      action: 'THEN switch to Tightened AQL 0.65',
      enabled: true,
    },
    {
      id: 'rule-2',
      name: 'Process Capability De-escalation',
      condition: 'IF Cpk >1.67 for 30 days AND zero defects',
      action: 'THEN switch to Reduced Sampling',
      enabled: true,
    },
    {
      id: 'rule-3',
      name: 'Critical Feature Alert',
      condition: 'IF any critical feature fails',
      action: 'THEN notify Quality Manager AND hold lot',
      enabled: true,
    },
  ]);

  // Add Rule Dialog State
  const [isAddRuleDialogOpen, setIsAddRuleDialogOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [conditionMetric, setConditionMetric] = useState('ncr');
  const [conditionOperator, setConditionOperator] = useState('gt');
  const [conditionValue, setConditionValue] = useState('1.5');
  const [conditionWindow, setConditionWindow] = useState('10');
  const [actionType, setActionType] = useState('switch-plan');
  const [actionValue, setActionValue] = useState('tightened');
  const [notifyQM, setNotifyQM] = useState(false);
  const [holdLot, setHoldLot] = useState(false);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
    const rule = rules.find(r => r.id === id);
    toast.success(`Rule "${rule?.name}" ${!rule?.enabled ? 'enabled' : 'disabled'}`);
  };

  const handleAddRule = () => {
    setIsAddRuleDialogOpen(true);
  };

  const handleEditRule = (id: string) => {
    const rule = rules.find(r => r.id === id);
    toast.info(`Editing rule: ${rule?.name}`);
    // In production, this would open an edit dialog
  };

  const handleDeleteRule = (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (confirm(`Are you sure you want to delete the rule "${rule?.name}"?`)) {
      setRules(prev => prev.filter(r => r.id !== id));
      toast.success(`Rule "${rule?.name}" deleted`);
    }
  };

  const handleViewRegulatedFeatures = () => {
    toast.info('Opening regulated features list');
    // In production, this would open a detailed view or modal
  };

  const resetAddRuleForm = () => {
    setNewRuleName('');
    setConditionMetric('ncr');
    setConditionOperator('gt');
    setConditionValue('1.5');
    setConditionWindow('10');
    setActionType('switch-plan');
    setActionValue('tightened');
    setNotifyQM(false);
    setHoldLot(false);
  };

  const handleSaveNewRule = () => {
    // Validate
    if (!newRuleName.trim()) {
      toast.error('Please enter a rule name');
      return;
    }

    if (!conditionValue.trim()) {
      toast.error('Please enter a threshold value');
      return;
    }

    // Build condition text
    const metricLabels: Record<string, string> = {
      ncr: 'non-conformance rate',
      cpk: 'Cpk',
      failures: 'consecutive failures',
      'time-in-phase': 'days in phase',
    };

    const operatorLabels: Record<string, string> = {
      gt: '>',
      lt: '<',
      gte: '≥',
      lte: '≤',
      eq: '=',
    };

    const conditionText = `IF ${metricLabels[conditionMetric]} ${operatorLabels[conditionOperator]}${conditionValue}${conditionMetric === 'failures' ? '' : '%'} ${conditionMetric === 'time-in-phase' ? 'days' : `in ${conditionWindow} consecutive ${conditionMetric === 'cpk' ? 'measurements' : 'lots'}`}`;

    // Build action text
    let actionText = '';
    if (actionType === 'switch-plan') {
      const planLabels: Record<string, string> = {
        '100': '100% Inspection',
        tightened: 'Tightened AQL 0.65',
        normal: 'Normal AQL 1.0',
        reduced: 'Reduced Sampling AQL 2.5',
      };
      actionText = `THEN switch to ${planLabels[actionValue]}`;
    } else if (actionType === 'hold-notify') {
      actionText = 'THEN hold lot AND notify Quality Manager';
    } else if (actionType === 'notify-only') {
      actionText = 'THEN notify Quality Manager';
    }

    if (notifyQM && actionType === 'switch-plan') {
      actionText += ' AND notify Quality Manager';
    }
    if (holdLot && actionType !== 'hold-notify') {
      actionText += ' AND hold lot';
    }

    // Add new rule
    const newRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      condition: conditionText,
      action: actionText,
      enabled: true,
    };

    setRules(prev => [...prev, newRule]);
    toast.success(`Rule "${newRuleName}" created successfully`);
    
    // Reset and close
    resetAddRuleForm();
    setIsAddRuleDialogOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Rules Engine */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="mb-1">Automation Rules</h3>
            <p className="text-slate-600">Define automatic actions based on quality metrics and events</p>
          </div>
          <Button onClick={handleAddRule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>

        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="mb-1">{rule.name}</div>
                      {rule.enabled ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-600">Disabled</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs mt-0.5">IF</Badge>
                      <span className="text-slate-700">{rule.condition}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs mt-0.5">THEN</Badge>
                      <span className="text-slate-700">{rule.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Rule Builder Preview */}
        <Card className="p-6 mt-6 bg-gradient-to-br from-blue-50 to-slate-50">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="mb-2">Rule Builder</div>
              <p className="text-slate-600 mb-4">
                Create custom automation rules with conditions and actions. Click "Add Rule" to open the rule builder.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-700">
                <div>
                  <div className="mb-1">Available Conditions:</div>
                  <div className="text-slate-600 space-y-1">
                    <div>• Non-conformance rate</div>
                    <div>• Process capability (Cp, Cpk)</div>
                    <div>• Consecutive failures</div>
                    <div>• Time in phase</div>
                  </div>
                </div>
                <div>
                  <div className="mb-1">Operators:</div>
                  <div className="text-slate-600 space-y-1">
                    <div>• Greater than / Less than</div>
                    <div>• Between range</div>
                    <div>• Trending up/down</div>
                    <div>• Time-based windows</div>
                  </div>
                </div>
                <div>
                  <div className="mb-1">Actions:</div>
                  <div className="text-slate-600 space-y-1">
                    <div>• Change sampling plan</div>
                    <div>• Switch to 100% inspection</div>
                    <div>• Send alerts/notifications</div>
                    <div>• Hold lot for review</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Phase/Lifecycle Editor */}
      <div>
        <div className="mb-4">
          <h3 className="mb-1">Production Phase Configuration</h3>
          <p className="text-slate-600">Define sampling plans and transition criteria for each production phase</p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Phase: PPAP */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div>PPAP (Production Part Approval)</div>
                    <div className="text-slate-600">Initial validation phase</div>
                  </div>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 ml-11">
                <div>
                  <Label className="mb-2">Default Sampling Plan</Label>
                  <Select defaultValue="100">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100% Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2">Duration</Label>
                  <Input value="First 300 units" readOnly />
                </div>
              </div>
            </div>

            {/* Phase: Safe Launch */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div>Safe Launch</div>
                    <div className="text-slate-600">Enhanced monitoring period</div>
                  </div>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>

              <div className="space-y-4 ml-11">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Default Sampling Plan</Label>
                    <Select defaultValue="tightened">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100% Inspection</SelectItem>
                        <SelectItem value="tightened">AQL 0.65 - Tightened</SelectItem>
                        <SelectItem value="normal">AQL 1.0 - Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Duration Target</Label>
                    <Input type="number" defaultValue="90" />
                    <div className="text-slate-600 mt-1">days</div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Exit Criteria (all must be met)</Label>
                  <div className="space-y-2 bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Checkbox checked readOnly />
                      <span className="text-slate-700">Minimum 90 days in phase</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked readOnly />
                      <span className="text-slate-700">Non-conformance rate &lt; 1.0%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked readOnly />
                      <span className="text-slate-700">No customer complaints</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase: Production */}
            <div className="border-2 border-blue-600 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <div>Production (Normal)</div>
                    <div className="text-slate-600">Standard production sampling</div>
                  </div>
                </div>
                <Badge className="bg-blue-600">Current Phase</Badge>
              </div>

              <div className="space-y-4 ml-11">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Default Sampling Plan</Label>
                    <Select defaultValue="normal">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tightened">AQL 0.65 - Tightened</SelectItem>
                        <SelectItem value="normal">AQL 1.0 - Normal</SelectItem>
                        <SelectItem value="reduced">AQL 2.5 - Reduced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Time in Phase</Label>
                    <Input value="142 days" readOnly />
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Exit Criteria for Reduced Sampling</Label>
                  <div className="space-y-2 bg-white rounded-lg p-3 border">
                    <div className="flex items-center gap-2">
                      <Checkbox checked readOnly />
                      <span className="text-slate-700">Minimum 180 days in production</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox readOnly />
                      <span className="text-slate-700">Cpk ≥ 1.67 for all critical features</span>
                      <Badge variant="outline" className="ml-auto text-xs">In progress</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked readOnly />
                      <span className="text-slate-700">Non-conformance rate &lt; 0.5%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked readOnly />
                      <span className="text-slate-700">Zero customer returns in 6 months</span>
                    </div>
                  </div>
                  <div className="mt-2 text-slate-600 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>Eligible for reduced sampling in ~45 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase: Reduced */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                    4
                  </div>
                  <div>
                    <div>Reduced Inspection</div>
                    <div className="text-slate-600">Earned reduction for proven processes</div>
                  </div>
                </div>
                <Badge variant="outline">Not Active</Badge>
              </div>

              <div className="space-y-4 ml-11">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Default Sampling Plan</Label>
                    <Select defaultValue="reduced">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">AQL 1.0 - Normal</SelectItem>
                        <SelectItem value="reduced">AQL 2.5 - Reduced</SelectItem>
                        <SelectItem value="skip">Skip Lot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Review Frequency</Label>
                    <Select defaultValue="monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Re-escalation Triggers</Label>
                  <div className="space-y-2 bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Checkbox defaultChecked />
                      <span className="text-slate-700">Any customer complaint</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox defaultChecked />
                      <span className="text-slate-700">Non-conformance rate ≥ 1.0%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox defaultChecked />
                      <span className="text-slate-700">Process change or tooling replacement</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit/Compliance Panel */}
      <div>
        <div className="mb-4">
          <h3 className="mb-1">Audit & Compliance Controls</h3>
          <p className="text-slate-600">Manage regulatory requirements and approval workflows</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="mb-1">Regulated Features</div>
                <div className="text-slate-600">Safety and regulatory critical characteristics</div>
              </div>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                18 features
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-700">Bore Diameter (Critical - Safety)</span>
                <Badge variant="outline" className="text-xs">IATF 16949</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-700">Thread Depth (Critical - Safety)</span>
                <Badge variant="outline" className="text-xs">ISO 9001</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-700">Weld Integrity (Critical - Safety)</span>
                <Badge variant="outline" className="text-xs">Customer Spec</Badge>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-3" onClick={handleViewRegulatedFeatures}>
              View All Regulated Features
            </Button>
          </Card>

          <Card className="p-4">
            <div className="mb-3">
              <div className="mb-1">Approval Requirements</div>
              <div className="text-slate-600">Control changes to critical features</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require approval for regulated features</Label>
                  <div className="text-slate-600">Changes to critical features need Quality Manager approval</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Lock customer-specified plans</Label>
                  <div className="text-slate-600">Prevent override of customer requirements</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Audit trail logging</Label>
                  <div className="text-slate-600">Track all changes with timestamps and user info</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <div className="text-blue-900 mb-1">Compliance Status</div>
                <div className="text-blue-800">
                  All regulatory requirements are currently met. Last audit: 14 days ago.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* AI/Future Features Preview */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="mb-2">AI-Powered Optimization (Coming Soon)</div>
            <p className="text-slate-600 mb-4">
              Future AI capabilities will analyze historical defect data, process capability trends, and real-time quality metrics to automatically suggest optimal sampling plans and predict quality issues before they occur.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="text-purple-900 mb-1">Predictive Analytics</div>
                <div className="text-slate-600">Forecast defect rates and recommend proactive plan adjustments</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="text-purple-900 mb-1">Smart Escalation</div>
                <div className="text-slate-600">ML models detect early warning signs and auto-adjust inspection intensity</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="text-purple-900 mb-1">Cost Optimization</div>
                <div className="text-slate-600">Balance quality assurance with inspection costs using AI recommendations</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Rule Dialog */}
      <Dialog open={isAddRuleDialogOpen} onOpenChange={setIsAddRuleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
            <DialogDescription>
              Define a condition and action for automatic quality control responses
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rule Name */}
            <div>
              <Label className="mb-2">Rule Name</Label>
              <Input 
                placeholder="e.g., High Defect Rate Escalation" 
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
              />
            </div>

            {/* Condition Section */}
            <div className="border rounded-lg p-4 bg-slate-50">
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="secondary">IF</Badge>
                <span>Condition</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Metric</Label>
                    <Select value={conditionMetric} onValueChange={setConditionMetric}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ncr">Non-conformance Rate</SelectItem>
                        <SelectItem value="cpk">Process Capability (Cpk)</SelectItem>
                        <SelectItem value="failures">Consecutive Failures</SelectItem>
                        <SelectItem value="time-in-phase">Time in Phase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2">Operator</Label>
                    <Select value={conditionOperator} onValueChange={setConditionOperator}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gt">Greater than (&gt;)</SelectItem>
                        <SelectItem value="gte">Greater than or equal (≥)</SelectItem>
                        <SelectItem value="lt">Less than (&lt;)</SelectItem>
                        <SelectItem value="lte">Less than or equal (≤)</SelectItem>
                        <SelectItem value="eq">Equal to (=)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Threshold Value</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="e.g., 1.5" 
                      value={conditionValue}
                      onChange={(e) => setConditionValue(e.target.value)}
                    />
                  </div>

                  {conditionMetric !== 'time-in-phase' && (
                    <div>
                      <Label className="mb-2">Observation Window</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="10" 
                          value={conditionWindow}
                          onChange={(e) => setConditionWindow(e.target.value)}
                        />
                        <span className="flex items-center text-slate-600">
                          {conditionMetric === 'cpk' ? 'measurements' : 'lots'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="bg-white rounded p-3 border">
                  <div className="text-slate-600 mb-1">Condition Preview:</div>
                  <div className="text-slate-900">
                    IF {conditionMetric === 'ncr' ? 'non-conformance rate' : 
                        conditionMetric === 'cpk' ? 'Cpk' : 
                        conditionMetric === 'failures' ? 'consecutive failures' : 'days in phase'} {' '}
                    {conditionOperator === 'gt' ? '>' : 
                     conditionOperator === 'gte' ? '≥' : 
                     conditionOperator === 'lt' ? '<' : 
                     conditionOperator === 'lte' ? '≤' : '='}
                    {conditionValue || '___'}
                    {conditionMetric !== 'failures' && conditionMetric !== 'time-in-phase' ? '%' : ''}
                    {conditionMetric === 'time-in-phase' ? ' days' : 
                     ` in ${conditionWindow || '___'} consecutive ${conditionMetric === 'cpk' ? 'measurements' : 'lots'}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="border rounded-lg p-4 bg-slate-50">
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="secondary">THEN</Badge>
                <span>Action</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2">Primary Action</Label>
                  <Select value={actionType} onValueChange={setActionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="switch-plan">Switch Sampling Plan</SelectItem>
                      <SelectItem value="notify-only">Notify Quality Manager</SelectItem>
                      <SelectItem value="hold-notify">Hold Lot + Notify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {actionType === 'switch-plan' && (
                  <div>
                    <Label className="mb-2">Switch to Plan</Label>
                    <Select value={actionValue} onValueChange={setActionValue}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100% Inspection</SelectItem>
                        <SelectItem value="tightened">AQL 0.65 - Tightened</SelectItem>
                        <SelectItem value="normal">AQL 1.0 - Normal</SelectItem>
                        <SelectItem value="reduced">AQL 2.5 - Reduced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {actionType === 'switch-plan' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={notifyQM}
                        onCheckedChange={(checked) => setNotifyQM(checked as boolean)}
                      />
                      <Label>Also notify Quality Manager</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={holdLot}
                        onCheckedChange={(checked) => setHoldLot(checked as boolean)}
                      />
                      <Label>Also hold lot for review</Label>
                    </div>
                  </div>
                )}

                {/* Action Preview */}
                <div className="bg-white rounded p-3 border">
                  <div className="text-slate-600 mb-1">Action Preview:</div>
                  <div className="text-slate-900">
                    THEN {actionType === 'switch-plan' ? `switch to ${actionValue === '100' ? '100% Inspection' : actionValue === 'tightened' ? 'Tightened AQL 0.65' : actionValue === 'normal' ? 'Normal AQL 1.0' : 'Reduced Sampling AQL 2.5'}` : actionType === 'notify-only' ? 'notify Quality Manager' : 'hold lot AND notify Quality Manager'}
                    {notifyQM && actionType === 'switch-plan' && ' AND notify Quality Manager'}
                    {holdLot && actionType !== 'hold-notify' && ' AND hold lot'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddRuleDialogOpen(false);
                resetAddRuleForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNewRule}>
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}