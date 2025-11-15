import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface PlansTabProps {
  onChangeDetected: () => void;
  onValidationChange: (errors: string[]) => void;
}

interface Plan {
  id: string;
  part: string;
  operation: string;
  standard: string;
  aql: string;
  level: string;
  state: string;
  updated: string;
  active: boolean;
}

const initialPlans: Plan[] = [
  { 
    id: "IP-2024-1234", 
    part: "Frame Assembly XJ-2400", 
    operation: "Final Assembly", 
    standard: "ISO 2859-1", 
    aql: "1.0", 
    level: "II", 
    state: "Normal", 
    updated: "2024-11-10",
    active: true
  },
  { 
    id: "IP-2024-1235", 
    part: "Bracket Weldment B-450", 
    operation: "Welding QC", 
    standard: "ANSI/ASQ Z1.4", 
    aql: "0.65", 
    level: "II", 
    state: "Tightened", 
    updated: "2024-11-12",
    active: true
  },
  { 
    id: "IP-2024-1236", 
    part: "Housing Component H-900", 
    operation: "Machining Check", 
    standard: "ISO 2859-1", 
    aql: "2.5", 
    level: "II", 
    state: "Reduced", 
    updated: "2024-11-14",
    active: true
  },
];

export function PlansTab({ onChangeDetected, onValidationChange }: PlansTabProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [lotSize, setLotSize] = useState("500");
  const [minLotSize, setMinLotSize] = useState("100");
  const [maxLotSize, setMaxLotSize] = useState("1000");
  const [phaseRulesExpanded, setPhaseRulesExpanded] = useState(false);
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterPhase, setFilterPhase] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Validation
  useEffect(() => {
    const errors: string[] = [];
    const lot = parseInt(lotSize);
    const min = parseInt(minLotSize);
    const max = parseInt(maxLotSize);

    if (isNaN(lot) || lot <= 0) {
      errors.push("Lot size must be greater than 0");
    }
    if (min > max) {
      errors.push("Minimum lot size cannot exceed maximum lot size");
    }
    if (lot < min || lot > max) {
      errors.push("Lot size must be between minimum and maximum");
    }

    onValidationChange(errors);
  }, [lotSize, minLotSize, maxLotSize, onValidationChange]);

  // Calculate sample size based on ISO 2859-1 logic
  const calculateSampleSize = () => {
    const lot = parseInt(lotSize);
    if (isNaN(lot)) return { code: "-", size: 0, ac: 0, re: 0 };
    
    if (lot <= 150) return { code: "F", size: 20, ac: 1, re: 2 };
    if (lot <= 280) return { code: "G", size: 32, ac: 2, re: 3 };
    if (lot <= 500) return { code: "H", size: 50, ac: 3, re: 4 };
    if (lot <= 1200) return { code: "J", size: 80, ac: 5, re: 6 };
    return { code: "K", size: 125, ac: 7, re: 8 };
  };

  const sampling = calculateSampleSize();

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    if (filterProduct !== "all" && !plan.part.toLowerCase().includes(filterProduct.toLowerCase())) return false;
    if (filterStatus !== "all" && plan.active.toString() !== filterStatus) return false;
    return true;
  });

  const handlePlanChange = (field: string, value: string) => {
    setSelectedPlan({ ...selectedPlan, [field]: value });
    onChangeDetected();
    
    // Update in plans list
    setPlans(plans.map(p => p.id === selectedPlan.id ? { ...selectedPlan, [field]: value } : p));
  };

  const handleAddPlan = () => {
    const newPlan: Plan = {
      id: `IP-2024-${1237 + plans.length}`,
      part: "New Product",
      operation: "New Operation",
      standard: "ISO 2859-1",
      aql: "1.0",
      level: "II",
      state: "Normal",
      updated: new Date().toISOString().split('T')[0],
      active: false
    };
    setPlans([...plans, newPlan]);
    setSelectedPlan(newPlan);
    onChangeDetected();
    toast.success("New inspection plan created");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Panel - Plan List */}
      <div className="lg:col-span-2">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2>Inspection Plans</h2>
            <Button size="sm" onClick={handleAddPlan}>
              <Plus className="h-4 w-4 mr-1" />
              New Plan
            </Button>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger>
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="frame">Frame Assembly</SelectItem>
                <SelectItem value="bracket">Bracket Weldment</SelectItem>
                <SelectItem value="housing">Housing Component</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPhase} onValueChange={setFilterPhase}>
              <SelectTrigger>
                <SelectValue placeholder="All Phases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                <SelectItem value="ppap">PPAP</SelectItem>
                <SelectItem value="launch">Safe Launch</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plans Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan ID</TableHead>
                  <TableHead>Part</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow 
                    key={plan.id}
                    className={`cursor-pointer ${selectedPlan.id === plan.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <TableCell>{plan.id}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{plan.part}</TableCell>
                    <TableCell>
                      <Badge variant={plan.state === "Normal" ? "default" : plan.state === "Tightened" ? "destructive" : "secondary"}>
                        {plan.state}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {plan.active ? <Badge variant="outline" className="bg-green-50 text-green-700">Yes</Badge> : <Badge variant="outline">No</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Right Panel - Plan Detail */}
      <div className="lg:col-span-3 space-y-4">
        {/* Plan Detail Form */}
        <Card className="p-6">
          <h3 className="mb-4">Plan Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Plan Name</Label>
              <Input 
                value={selectedPlan.part} 
                onChange={(e) => handlePlanChange('part', e.target.value)}
              />
            </div>

            <div>
              <Label>Part / Product</Label>
              <Input 
                value={selectedPlan.part}
                onChange={(e) => handlePlanChange('part', e.target.value)}
              />
            </div>

            <div>
              <Label>Operation / Station</Label>
              <Input 
                value={selectedPlan.operation} 
                onChange={(e) => handlePlanChange('operation', e.target.value)}
              />
            </div>

            <div>
              <Label>Inspection Standard</Label>
              <Select 
                value={selectedPlan.standard}
                onValueChange={(val) => handlePlanChange('standard', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISO 2859-1">ISO 2859-1</SelectItem>
                  <SelectItem value="ANSI/ASQ Z1.4">ANSI/ASQ Z1.4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Inspection Level</Label>
              <Select 
                value={selectedPlan.level}
                onValueChange={(val) => handlePlanChange('level', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Level I</SelectItem>
                  <SelectItem value="II">Level II</SelectItem>
                  <SelectItem value="III">Level III</SelectItem>
                  <SelectItem value="S1">S-1 (Special)</SelectItem>
                  <SelectItem value="S2">S-2 (Special)</SelectItem>
                  <SelectItem value="S3">S-3 (Special)</SelectItem>
                  <SelectItem value="S4">S-4 (Special)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>AQL (Acceptable Quality Limit)</Label>
              <Select 
                value={selectedPlan.aql}
                onValueChange={(val) => handlePlanChange('aql', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.065">0.065</SelectItem>
                  <SelectItem value="0.10">0.10</SelectItem>
                  <SelectItem value="0.15">0.15</SelectItem>
                  <SelectItem value="0.25">0.25</SelectItem>
                  <SelectItem value="0.40">0.40</SelectItem>
                  <SelectItem value="0.65">0.65</SelectItem>
                  <SelectItem value="1.0">1.0</SelectItem>
                  <SelectItem value="1.5">1.5</SelectItem>
                  <SelectItem value="2.5">2.5</SelectItem>
                  <SelectItem value="4.0">4.0</SelectItem>
                  <SelectItem value="6.5">6.5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sampling Frequency</Label>
              <Select defaultValue="every-lot">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="every-lot">Every Lot</SelectItem>
                  <SelectItem value="every-2">Every 2nd Lot</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="shift">Per Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Minimum Lot Size</Label>
              <Input 
                type="number" 
                value={minLotSize}
                onChange={(e) => {
                  setMinLotSize(e.target.value);
                  onChangeDetected();
                }}
              />
            </div>

            <div>
              <Label>Maximum Lot Size</Label>
              <Input 
                type="number" 
                value={maxLotSize}
                onChange={(e) => {
                  setMaxLotSize(e.target.value);
                  onChangeDetected();
                }}
              />
            </div>
          </div>
        </Card>

        {/* Sampling Calculator */}
        <Card className="p-6">
          <h3 className="mb-4">Sampling Calculator</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <Label>Lot Size</Label>
              <Input 
                type="number" 
                value={lotSize} 
                onChange={(e) => {
                  setLotSize(e.target.value);
                  onChangeDetected();
                }}
              />
            </div>
            <div>
              <Label>AQL</Label>
              <Input value={selectedPlan.aql} disabled />
            </div>
            <div>
              <Label>Inspection Level</Label>
              <Input value={selectedPlan.level} disabled />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="text-xs text-slate-600 mb-1">Code Letter</div>
              <div className="text-2xl">{sampling.code}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Sample Size</div>
              <div className="text-2xl">{sampling.size}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Accept (Ac)</div>
              <div className="text-2xl text-green-600">{sampling.ac}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Reject (Re)</div>
              <div className="text-2xl text-red-600">{sampling.re}</div>
            </div>
          </div>

          <div className="mt-4">
            <Button 
              variant="link" 
              className="text-xs p-0 h-auto"
              onClick={() => toast.info("Opening ISO 2859-1 reference table...")}
            >
              → View reference table (ISO 2859-1, Table 2-A)
            </Button>
          </div>
        </Card>

        {/* Phase-Based Sampling Rules */}
        <Card className="p-6">
          <button
            onClick={() => setPhaseRulesExpanded(!phaseRulesExpanded)}
            className="flex items-center justify-between w-full"
          >
            <h3>Phase-Based Sampling Rules</h3>
            {phaseRulesExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
          
          {phaseRulesExpanded && (
            <div className="mt-4 space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span>PPAP (Pre-Production Approval)</span>
                  <Badge>100% Inspection</Badge>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• Cpk {"≥"} 1.67 required to advance</div>
                  <div>• All dimensions within specification</div>
                  <div>• Minimum 30 consecutive pieces</div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span>Safe Launch</span>
                  <Badge variant="destructive">Tightened (AQL 0.65)</Badge>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• First 10 lots or 30 days</div>
                  <div>• Escalate to PPAP if Cpk {"<"} 1.33</div>
                  <div>• Advance if 10 consecutive lots pass</div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <span>Production (Current)</span>
                  <Badge variant="default">Normal (AQL 1.0)</Badge>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• Standard sampling applied</div>
                  <div>• Escalate to Tightened if 2 of 5 lots fail</div>
                  <div>• Reduce if 10 consecutive lots pass</div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span>Reduced Inspection</span>
                  <Badge variant="secondary">Reduced (AQL 2.5)</Badge>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• Production score excellent</div>
                  <div>• Cpk {"≥"} 1.67 maintained</div>
                  <div>• Return to Normal if 1 lot fails</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
