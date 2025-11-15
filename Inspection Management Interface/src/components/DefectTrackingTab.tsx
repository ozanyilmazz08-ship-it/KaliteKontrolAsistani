import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { TrendingDown, AlertCircle, Upload } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Defect {
  id: string;
  date: string;
  part: string;
  operation: string;
  characteristic: string;
  category: string;
  severity: string;
  rootCauseStatus: string;
  capaId: string;
  status: string;
  description: string;
  rootCauseAnalysis: string;
}

const initialDefects: Defect[] = [
  {
    id: "DEF-2024-0890",
    date: "2024-11-14 10:23",
    part: "Frame Assembly XJ-2400",
    operation: "Final Assembly",
    characteristic: "Overall Length",
    category: "Dimensional",
    severity: "Major",
    rootCauseStatus: "Analyzed",
    capaId: "CAPA-2024-045",
    status: "Corrective Action in Place",
    description: "Measured length exceeded upper tolerance limit by 0.8mm. Out-of-spec dimension detected during final inspection sampling.",
    rootCauseAnalysis: "5-Why Analysis:\n1. Why out-of-spec? → Fixture wear\n2. Why fixture wear? → Exceeded maintenance interval\n3. Why exceeded? → Maintenance schedule not followed"
  },
  {
    id: "DEF-2024-0891",
    date: "2024-11-14 14:15",
    part: "Bracket Weldment B-450",
    operation: "Welding QC",
    characteristic: "Weld Integrity",
    category: "Structural",
    severity: "Critical",
    rootCauseStatus: "Under Investigation",
    capaId: "CAPA-2024-046",
    status: "Under Investigation",
    description: "Weld penetration below specification. Safety critical defect.",
    rootCauseAnalysis: "Investigation in progress. Preliminary finding: incorrect welding parameters."
  },
  {
    id: "DEF-2024-0892",
    date: "2024-11-15 08:45",
    part: "Frame Assembly XJ-2400",
    operation: "Final Assembly",
    characteristic: "Surface Finish",
    category: "Cosmetic",
    severity: "Minor",
    rootCauseStatus: "Unanalyzed",
    capaId: "-",
    status: "Open",
    description: "Surface roughness exceeds specification.",
    rootCauseAnalysis: ""
  },
  {
    id: "DEF-2024-0893",
    date: "2024-11-15 11:30",
    part: "Housing Component H-900",
    operation: "Machining Check",
    characteristic: "Thread Depth",
    category: "Dimensional",
    severity: "Major",
    rootCauseStatus: "Analyzed",
    capaId: "CAPA-2024-047",
    status: "Closed",
    description: "Thread depth below minimum specification.",
    rootCauseAnalysis: "Root cause: Tool wear. Corrective action: Implemented tool change schedule."
  },
];

export function DefectTrackingTab() {
  const [defects, setDefects] = useState(initialDefects);
  const [selectedDefect, setSelectedDefect] = useState(defects[0]);
  const [filterDateRange, setFilterDateRange] = useState("7days");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const totalDefects = 47;
  const dpmo = 2340;
  const trend = -12;

  // Filter defects
  const filteredDefects = defects.filter(defect => {
    if (filterProduct !== "all" && !defect.part.toLowerCase().includes(filterProduct.toLowerCase())) return false;
    if (filterSeverity !== "all" && defect.severity !== filterSeverity) return false;
    if (filterStatus !== "all" && defect.status !== filterStatus) return false;
    return true;
  });

  const handleStatusChange = (newStatus: string) => {
    const updatedDefect = { ...selectedDefect, status: newStatus };
    setSelectedDefect(updatedDefect);
    setDefects(defects.map(d => d.id === selectedDefect.id ? updatedDefect : d));
    toast.success(`Defect status updated to: ${newStatus}`);
  };

  const handleDescriptionChange = (desc: string) => {
    setSelectedDefect({ ...selectedDefect, description: desc });
  };

  const handleRootCauseChange = (analysis: string) => {
    setSelectedDefect({ ...selectedDefect, rootCauseAnalysis: analysis });
  };

  const handleUpdateDefect = () => {
    setDefects(defects.map(d => d.id === selectedDefect.id ? selectedDefect : d));
    toast.success("Defect record updated successfully");
  };

  const handleAttachDocuments = () => {
    toast.info("Document attachment dialog opened");
  };

  const handleViewCapa = () => {
    toast.info(`Opening CAPA record: ${selectedDefect.capaId}`);
  };

  const handleExportList = () => {
    toast.success("Defect list exported to Excel");
  };

  return (
    <div className="space-y-6">
      {/* Filters & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 lg:col-span-2">
          <Label className="text-xs text-slate-500 mb-2">Filters</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="frame">Frame Assembly</SelectItem>
                <SelectItem value="bracket">Bracket Weldment</SelectItem>
                <SelectItem value="housing">Housing Component</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Major">Major</SelectItem>
                <SelectItem value="Minor">Minor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                <SelectItem value="Corrective Action in Place">Corrective Action</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-1">Total Defects</div>
          <div className="text-2xl mb-1">{totalDefects}</div>
          <div className="flex items-center text-xs text-green-600">
            <TrendingDown className="h-3 w-3 mr-1" />
            {Math.abs(trend)}% vs last period
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-1">DPMO</div>
          <div className="text-2xl mb-1">{dpmo.toLocaleString()}</div>
          <div className="text-xs text-slate-600">Defects per Million Opportunities</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-1">Top Defect Category</div>
          <div className="font-medium mb-1">Dimensional</div>
          <div className="text-xs text-slate-600">24 occurrences (51%)</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Defect List */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3>Defect Records</h3>
              <Button size="sm" onClick={handleExportList}>Export List</Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Defect ID</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Part</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDefects.map((defect) => (
                    <TableRow 
                      key={defect.id}
                      className={`cursor-pointer ${selectedDefect.id === defect.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedDefect(defect)}
                    >
                      <TableCell className="font-mono text-sm">{defect.id}</TableCell>
                      <TableCell className="text-sm">{defect.date}</TableCell>
                      <TableCell className="max-w-[140px] truncate text-sm">{defect.part}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{defect.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            defect.severity === "Critical" ? "destructive" :
                            defect.severity === "Major" ? "default" :
                            "secondary"
                          }
                        >
                          {defect.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {defect.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Defect Detail Panel */}
        <div>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3>Defect Details</h3>
              <Badge variant={selectedDefect.severity === "Critical" ? "destructive" : "default"}>
                {selectedDefect.severity}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500">Defect ID</Label>
                <div className="font-mono">{selectedDefect.id}</div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Status</Label>
                <Select value={selectedDefect.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                    <SelectItem value="Corrective Action in Place">Corrective Action in Place</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Part / Operation</Label>
                <div className="text-sm">{selectedDefect.part}</div>
                <div className="text-xs text-slate-600">{selectedDefect.operation}</div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Characteristic</Label>
                <div>{selectedDefect.characteristic}</div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Category</Label>
                <div>{selectedDefect.category}</div>
              </div>

              <div>
                <Label className="text-xs text-slate-500">Description</Label>
                <Textarea 
                  placeholder="Detailed defect description..."
                  value={selectedDefect.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500">Root Cause Analysis</Label>
                <div className="text-sm mb-2">Status: <Badge variant="outline">{selectedDefect.rootCauseStatus}</Badge></div>
                <Textarea 
                  placeholder="Enter root cause analysis..."
                  value={selectedDefect.rootCauseAnalysis}
                  onChange={(e) => handleRootCauseChange(e.target.value)}
                  rows={4}
                  className="text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500">Linked CAPA</Label>
                <div className="flex items-center gap-2">
                  <Input value={selectedDefect.capaId} disabled />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleViewCapa}
                    disabled={selectedDefect.capaId === "-"}
                  >
                    View
                  </Button>
                </div>
              </div>

              {selectedDefect.severity === "Critical" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="text-xs text-red-800">
                      <p className="font-medium mb-1">Impact on Sampling:</p>
                      <p>Critical defect triggered escalation to 100% inspection for next 3 lots.</p>
                      <p className="mt-1">Phase rollback from Production to Safe Launch initiated.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <Button className="w-full" onClick={handleUpdateDefect}>Update Defect</Button>
                <Button variant="outline" className="w-full" onClick={handleAttachDocuments}>
                  <Upload className="h-4 w-4 mr-2" />
                  Attach Documents
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
