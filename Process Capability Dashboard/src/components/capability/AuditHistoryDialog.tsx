import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { History, Download, RotateCcw, Search, Filter } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

type AuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  category: string;
  changesBefore: string;
  changesAfter: string;
  dataWindow: string;
  notes?: string;
};

const mockAuditData: AuditEntry[] = [
  {
    id: "A-2024-1105-001",
    timestamp: "2024-11-05 14:23:15",
    user: "John Doe",
    role: "Quality Engineer",
    action: "Specification Limits Updated",
    category: "Specifications",
    changesBefore: "USL: 105.0 mm, LSL: 95.0 mm, Target: 100.0 mm",
    changesAfter: "USL: 106.0 mm, LSL: 95.0 mm, Target: 100.0 mm",
    dataWindow: "All data (2024-11-01 to 2024-11-30)",
    notes: "Approved by engineering change order ECO-2024-789"
  },
  {
    id: "A-2024-1105-002",
    timestamp: "2024-11-05 10:15:42",
    user: "Jane Smith",
    role: "Statistician",
    action: "Estimator Method Changed",
    category: "Methods",
    changesBefore: "σ̂within: S̄/c₄, Subgroup size: 5",
    changesAfter: "σ̂within: R̄/d₂, Subgroup size: 5",
    dataWindow: "All data (2024-11-01 to 2024-11-30)",
    notes: "Changed to match control chart methodology"
  },
  {
    id: "A-2024-1104-003",
    timestamp: "2024-11-04 16:45:22",
    user: "John Doe",
    role: "Quality Engineer",
    action: "Capability Analysis Computed",
    category: "Computation",
    changesBefore: "N/A",
    changesAfter: "Cpk: 1.33, Ppk: 1.15, N: 150, Normal distribution",
    dataWindow: "All data (2024-11-01 to 2024-11-30)",
    notes: "Monthly capability review - November 2024"
  },
  {
    id: "A-2024-1104-004",
    timestamp: "2024-11-04 09:12:08",
    user: "Jane Smith",
    role: "Statistician",
    action: "Outlier Policy Applied",
    category: "Outliers",
    changesBefore: "Method: None",
    changesAfter: "Method: IQR (k=1.5), Excluded: 3 points [#47, #92, #134]",
    dataWindow: "All data (2024-11-01 to 2024-11-30)",
    notes: "Points investigated and verified as measurement errors per SOP-QC-015"
  },
  {
    id: "A-2024-1103-005",
    timestamp: "2024-11-03 15:30:11",
    user: "Mike Johnson",
    role: "Process Engineer",
    action: "Non-Normal Strategy Changed",
    category: "Distribution",
    changesBefore: "Strategy: Auto (Normal selected)",
    changesAfter: "Strategy: Transform (Box-Cox λ=0.85)",
    dataWindow: "Phase I baseline (2024-10-01 to 2024-10-31)",
    notes: "Data showed mild right skew; transformation improved normality"
  },
  {
    id: "A-2024-1103-006",
    timestamp: "2024-11-03 11:20:45",
    user: "John Doe",
    role: "Quality Engineer",
    action: "Bootstrap Settings Modified",
    category: "CI Settings",
    changesBefore: "Resamples: 1000, Seed: 42, Method: Percentile",
    changesAfter: "Resamples: 5000, Seed: 42, Method: BCa",
    dataWindow: "Phase I baseline (2024-10-01 to 2024-10-31)",
    notes: "Increased precision for small-N analysis"
  },
  {
    id: "A-2024-1102-007",
    timestamp: "2024-11-02 14:05:33",
    user: "Jane Smith",
    role: "Statistician",
    action: "CI Level Changed",
    category: "CI Settings",
    changesBefore: "Confidence Level: 90%",
    changesAfter: "Confidence Level: 95%",
    dataWindow: "All data",
    notes: "Standardized to company-wide 95% CI policy"
  },
  {
    id: "A-2024-1101-008",
    timestamp: "2024-11-01 08:45:00",
    user: "John Doe",
    role: "Quality Engineer",
    action: "Target Specification Updated",
    category: "Specifications",
    changesBefore: "Target: 99.5 mm",
    changesAfter: "Target: 100.0 mm",
    dataWindow: "All data (2024-11-01 to 2024-11-30)",
    notes: "Design change per ECR-2024-0512"
  }
];

type AuditHistoryDialogProps = {
  config: any; // CapabilityConfig type
};

export function AuditHistoryDialog({ config }: AuditHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUser, setFilterUser] = useState("all");

  const filteredData = mockAuditData.filter(entry => {
    const matchesSearch = searchTerm === "" || 
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || entry.category === filterCategory;
    const matchesUser = filterUser === "all" || entry.user === filterUser;

    return matchesSearch && matchesCategory && matchesUser;
  });

  const handleRevert = (entryId: string) => {
    console.log("Reverting to state before:", entryId);
    // Implement revert logic
  };

  const handleExport = () => {
    console.log("Exporting audit history");
    // Implement CSV export of audit log
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-2" />
          Audit History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Audit History & Change Log</DialogTitle>
          <DialogDescription>
            Complete traceability of all capability analysis changes, settings modifications, 
            and computation events. All entries are immutable and timestamped for compliance.
          </DialogDescription>
        </DialogHeader>

        {/* Filters and Search */}
        <div className="flex items-center gap-3 py-3 border-b">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search actions, users, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Specifications">Specifications</SelectItem>
              <SelectItem value="Methods">Methods & Estimators</SelectItem>
              <SelectItem value="Distribution">Distribution</SelectItem>
              <SelectItem value="Outliers">Outliers</SelectItem>
              <SelectItem value="CI Settings">CI Settings</SelectItem>
              <SelectItem value="Computation">Computation</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="John Doe">John Doe</SelectItem>
              <SelectItem value="Jane Smith">Jane Smith</SelectItem>
              <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Audit Table */}
        <ScrollArea className="h-[500px] pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">ID</TableHead>
                <TableHead className="w-36">Timestamp</TableHead>
                <TableHead className="w-32">User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Before → After</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((entry) => (
                <TableRow key={entry.id} className="align-top">
                  <TableCell className="font-mono text-xs">{entry.id}</TableCell>
                  <TableCell className="text-xs text-slate-600">{entry.timestamp}</TableCell>
                  <TableCell>
                    <div className="text-sm">{entry.user}</div>
                    <div className="text-xs text-slate-600">{entry.role}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.action}</span>
                        <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                      </div>
                      <div className="text-xs text-slate-600">{entry.dataWindow}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 text-xs">
                      {entry.changesBefore !== "N/A" && (
                        <div className="p-2 bg-red-50 rounded border border-red-200">
                          <span className="text-red-700 font-medium">Before:</span>
                          <p className="text-red-800 mt-1">{entry.changesBefore}</p>
                        </div>
                      )}
                      <div className="p-2 bg-green-50 rounded border border-green-200">
                        <span className="text-green-700 font-medium">After:</span>
                        <p className="text-green-800 mt-1">{entry.changesAfter}</p>
                      </div>
                      {entry.notes && (
                        <div className="p-2 bg-blue-50 rounded border border-blue-200">
                          <span className="text-blue-700 font-medium text-xs">Notes:</span>
                          <p className="text-blue-800 mt-1">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {entry.changesBefore !== "N/A" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevert(entry.id)}
                        className="w-full"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Revert
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="flex items-center justify-between pt-3 border-t text-sm text-slate-600">
          <div>
            Showing {filteredData.length} of {mockAuditData.length} entries
          </div>
          <div className="text-xs">
            Audit retention: 7 years per ISO 9001 compliance
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
