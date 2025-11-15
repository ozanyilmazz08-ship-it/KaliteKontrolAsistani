import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Play, Pause, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { Progress } from "./ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { toast } from "sonner@2.0.3";

interface Sample {
  id: number;
  characteristic: string;
  target: string;
  measured: string;
  result: "pass" | "fail" | null;
  defectCode: string;
  notes: string;
}

const initialSamples: Sample[] = [
  { id: 1, characteristic: "Overall Length", target: "450.0 ± 0.5 mm", measured: "", result: null, defectCode: "", notes: "" },
  { id: 2, characteristic: "Width Dimension", target: "120.0 ± 0.3 mm", measured: "", result: null, defectCode: "", notes: "" },
  { id: 3, characteristic: "Hole Diameter Ø1", target: "12.00 ± 0.05 mm", measured: "", result: null, defectCode: "", notes: "" },
  { id: 4, characteristic: "Surface Finish", target: "Ra ≤ 1.6 μm", measured: "", result: null, defectCode: "", notes: "" },
  { id: 5, characteristic: "Thread Depth", target: "15.0 ± 0.2 mm", measured: "", result: null, defectCode: "", notes: "" },
];

export function ExecutionTab() {
  const [samples, setSamples] = useState<Sample[]>(initialSamples);
  const [status, setStatus] = useState<"not-started" | "in-progress" | "paused" | "completed">("not-started");
  const [selectedLot, setSelectedLot] = useState("lot-20241115-001");

  const validateMeasurement = (characteristic: string, value: string): "pass" | "fail" | null => {
    if (!value) return null;
    
    const val = parseFloat(value);
    if (isNaN(val)) return null;

    // Simple validation logic for demo
    if (characteristic === "Overall Length") {
      return val >= 449.5 && val <= 450.5 ? "pass" : "fail";
    }
    if (characteristic === "Width Dimension") {
      return val >= 119.7 && val <= 120.3 ? "pass" : "fail";
    }
    if (characteristic === "Hole Diameter Ø1") {
      return val >= 11.95 && val <= 12.05 ? "pass" : "fail";
    }
    if (characteristic === "Surface Finish") {
      return val <= 1.6 ? "pass" : "fail";
    }
    if (characteristic === "Thread Depth") {
      return val >= 14.8 && val <= 15.2 ? "pass" : "fail";
    }
    
    return "pass";
  };

  const handleMeasurementChange = (id: number, value: string) => {
    setSamples(prev => prev.map(sample => {
      if (sample.id === id) {
        const result = validateMeasurement(sample.characteristic, value);
        if (result === "fail") {
          toast.warning(`Measurement out of tolerance for ${sample.characteristic}`);
        }
        return { ...sample, measured: value, result };
      }
      return sample;
    }));
  };

  const handleDefectCodeChange = (id: number, code: string) => {
    setSamples(prev => prev.map(sample => 
      sample.id === id ? { ...sample, defectCode: code } : sample
    ));
  };

  const handleNotesChange = (id: number, notes: string) => {
    setSamples(prev => prev.map(sample => 
      sample.id === id ? { ...sample, notes } : sample
    ));
  };

  const handleStart = () => {
    setStatus("in-progress");
    toast.success("Inspection started");
  };

  const handlePause = () => {
    setStatus("paused");
    toast.info("Inspection paused");
  };

  const handleResume = () => {
    setStatus("in-progress");
    toast.success("Inspection resumed");
  };

  const handleComplete = () => {
    const failCount = samples.filter(s => s.result === "fail").length;
    const acceptThreshold = 3;
    
    if (failCount > acceptThreshold) {
      toast.error(`Lot rejected: ${failCount} defects (threshold: ${acceptThreshold})`);
    } else {
      toast.success(`Lot accepted: ${failCount} defects (threshold: ${acceptThreshold})`);
    }
    setStatus("completed");
  };

  const handleHoldLot = () => {
    toast.warning("Lot placed on hold - requires supervisor approval");
  };

  const completedCount = samples.filter(s => s.measured).length;
  const totalSamples = 50; // From sampling plan
  const progressPercent = (completedCount / samples.length) * 100;

  return (
    <div className="space-y-6">
      {/* Inspection Run Selector & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-2">Current Inspection Run</div>
          <Select value={selectedLot} onValueChange={setSelectedLot}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lot-20241115-001">LOT-20241115-001</SelectItem>
              <SelectItem value="lot-20241115-002">LOT-20241115-002</SelectItem>
              <SelectItem value="lot-20241114-045">LOT-20241114-045</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-slate-600 mt-2">Lot Size: 500 units</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-2">Sampling Plan</div>
          <div className="font-medium">IP-2024-1234</div>
          <div className="text-xs text-slate-600 mt-1">Code H, n=50, Ac=3, Re=4</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-2">Sample Progress</div>
          <div className="text-2xl mb-2">{completedCount} / {totalSamples}</div>
          <Progress value={progressPercent} className="h-2" />
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-2">Status</div>
          <Badge 
            variant={
              status === "completed" ? "default" : 
              status === "in-progress" ? "secondary" : 
              "outline"
            }
            className="mb-2"
          >
            {status === "not-started" ? "Not Started" :
             status === "in-progress" ? "In Progress" :
             status === "paused" ? "Paused" :
             "Completed"}
          </Badge>
          <div className="text-xs text-slate-600">Started: 2024-11-15 08:30</div>
        </Card>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        {status === "not-started" && (
          <Button onClick={handleStart}>
            <Play className="h-4 w-4 mr-2" />
            Start Inspection
          </Button>
        )}
        {status === "in-progress" && (
          <>
            <Button variant="outline" onClick={handlePause}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button onClick={handleComplete}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Run
            </Button>
          </>
        )}
        {status === "paused" && (
          <Button onClick={handleResume}>
            <Play className="h-4 w-4 mr-2" />
            Resume
          </Button>
        )}
        <Button variant="outline" onClick={handleHoldLot}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Hold Lot
        </Button>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <FileText className="h-4 w-4 mr-2" />
              Work Instructions
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Inspector Guidance & Work Instructions</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="mb-2">Step 1: Overall Length Measurement</h4>
                <div className="text-sm text-slate-600 space-y-2">
                  <p>Use calibrated vernier caliper (ID: CAL-2024-VC-089)</p>
                  <p>Measure from left edge to right edge at centerline</p>
                  <p>Take measurement at room temperature (20±2°C)</p>
                  <p className="text-amber-600">⚠️ Clean measurement surfaces before measuring</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="mb-2">Step 2: Width Dimension</h4>
                <div className="text-sm text-slate-600 space-y-2">
                  <p>Use same calibrated vernier caliper</p>
                  <p>Measure perpendicular to length at mid-point</p>
                  <p>Record to 0.01mm precision</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="mb-2">Step 3: Hole Diameter</h4>
                <div className="text-sm text-slate-600 space-y-2">
                  <p>Use pin gauge set (ID: CAL-2024-PG-034)</p>
                  <p>Measure internal diameter at 3 points</p>
                  <p>Report average of 3 measurements</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-red-800 mb-2">Safety Notes</h4>
                <div className="text-sm text-red-700 space-y-1">
                  <p>• Wear safety glasses at all times</p>
                  <p>• Ensure parts are properly secured</p>
                  <p>• Report any damaged measurement equipment immediately</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Execution Table */}
      <Card className="p-6">
        <h3 className="mb-4">Measurement Data Collection</h3>
        
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Sample</TableHead>
                <TableHead>Characteristic</TableHead>
                <TableHead>Target / Tolerance</TableHead>
                <TableHead className="w-40">Measured Value</TableHead>
                <TableHead className="w-24">Result</TableHead>
                <TableHead className="w-32">Defect Code</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samples.map((sample) => (
                <TableRow key={sample.id}>
                  <TableCell>#{sample.id}</TableCell>
                  <TableCell>{sample.characteristic}</TableCell>
                  <TableCell className="text-sm">{sample.target}</TableCell>
                  <TableCell>
                    <Input 
                      value={sample.measured}
                      onChange={(e) => handleMeasurementChange(sample.id, e.target.value)}
                      disabled={status !== "in-progress"}
                      placeholder="Enter value"
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    {sample.result === "pass" && (
                      <Badge variant="default" className="bg-green-600">Pass</Badge>
                    )}
                    {sample.result === "fail" && (
                      <Badge variant="destructive">Fail</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {sample.result === "fail" && (
                      <Select value={sample.defectCode} onValueChange={(val) => handleDefectCodeChange(sample.id, val)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="D001">D001 - Oversize</SelectItem>
                          <SelectItem value="D002">D002 - Undersize</SelectItem>
                          <SelectItem value="D003">D003 - Surface defect</SelectItem>
                          <SelectItem value="D004">D004 - Thread damage</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={sample.notes}
                      onChange={(e) => handleNotesChange(sample.id, e.target.value)}
                      placeholder="Optional notes"
                      disabled={status !== "in-progress"}
                      className="h-9"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <div className="text-xs text-slate-600 mb-1">Total Inspected</div>
            <div className="text-xl">{completedCount}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">Pass</div>
            <div className="text-xl text-green-600">{samples.filter(s => s.result === "pass").length}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">Fail</div>
            <div className="text-xl text-red-600">{samples.filter(s => s.result === "fail").length}</div>
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">Accept Threshold (Ac)</div>
            <div className="text-xl">≤ 3</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
