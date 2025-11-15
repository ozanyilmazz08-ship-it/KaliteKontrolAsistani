import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Download, FileText } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { toast } from "sonner";

const controlChartData = [
  { sample: 1, value: 450.2, ucl: 450.8, lcl: 449.2, center: 450.0 },
  { sample: 2, value: 450.1, ucl: 450.8, lcl: 449.2, center: 450.0 },
  { sample: 3, value: 450.3, ucl: 450.8, lcl: 449.2, center: 450.0 },
  { sample: 4, value: 449.9, ucl: 450.8, lcl: 449.2, center: 450.0 },
  { sample: 5, value: 450.0, ucl: 450.8, lcl: 449.2, center: 450.0 },
  { sample: 6, value: 450.4, ucl: 450.8, lcl: 449.2, center: 450.0 },
  { sample: 7, value: 450.1, ucl: 450.8, lcl: 449.2, center: 450.0 },
  { sample: 8, value: 449.8, ucl: 450.8, lcl: 449.2, center: 450.0 },
  { sample: 9, value: 450.2, ucl: 450.8, lcl: 449.2, center: 450.0 },
  { sample: 10, value: 450.0, ucl: 450.8, lcl: 449.2, center: 450.0 },
];

const defectTrendData = [
  { date: "Nov 08", rate: 0.8 },
  { date: "Nov 09", rate: 1.2 },
  { date: "Nov 10", rate: 0.9 },
  { date: "Nov 11", rate: 1.4 },
  { date: "Nov 12", rate: 1.1 },
  { date: "Nov 13", rate: 0.7 },
  { date: "Nov 14", rate: 0.9 },
  { date: "Nov 15", rate: 0.6 },
];

const capabilityData = [
  { characteristic: "Length", cp: 1.45, cpk: 1.38 },
  { characteristic: "Width", cp: 1.67, cpk: 1.62 },
  { characteristic: "Hole Ø", cp: 1.52, cpk: 1.48 },
  { characteristic: "Thread", cp: 1.33, cpk: 1.29 },
];

const savedReports = [
  {
    id: "RPT-2024-1120",
    type: "PPAP Documentation Package",
    date: "2024-11-10",
    format: "PDF",
    owner: "J. Smith"
  },
  {
    id: "RPT-2024-1121",
    type: "Daily Inspection Summary",
    date: "2024-11-14",
    format: "Excel",
    owner: "M. Johnson"
  },
  {
    id: "RPT-2024-1122",
    type: "Monthly Quality Report",
    date: "2024-11-01",
    format: "PDF",
    owner: "L. Chen"
  },
  {
    id: "RPT-2024-1123",
    type: "Customer Complaint Response",
    date: "2024-11-12",
    format: "PDF",
    owner: "J. Smith"
  },
];

export function ReportsTab() {
  const [selectedReport, setSelectedReport] = useState(null);

  const handleReportDownload = (report) => {
    setSelectedReport(report);
    toast.success(`Report ${report.id} downloaded successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Report Scope Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Select defaultValue="30days">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All Parts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parts</SelectItem>
              <SelectItem value="frame">Frame Assembly XJ-2400</SelectItem>
              <SelectItem value="bracket">Bracket Weldment B-450</SelectItem>
              <SelectItem value="housing">Housing Component H-900</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All Lines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lines</SelectItem>
              <SelectItem value="line1">Line 1</SelectItem>
              <SelectItem value="line2">Line 2</SelectItem>
              <SelectItem value="line3">Line 3</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All Phases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Phases</SelectItem>
              <SelectItem value="ppap">PPAP</SelectItem>
              <SelectItem value="launch">Safe Launch</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="reduced">Reduced Inspection</SelectItem>
            </SelectContent>
          </Select>

          <Button>Apply Filters</Button>
        </div>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-1">Average AQL</div>
          <div className="text-2xl">1.12</div>
          <div className="text-xs text-slate-600 mt-1">Across all active plans</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-1">Phase Escalations</div>
          <div className="text-2xl">3</div>
          <div className="text-xs text-slate-600 mt-1">In reporting period</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-1">Lots Inspected</div>
          <div className="text-2xl">127</div>
          <div className="text-xs text-slate-600 mt-1">Total in period</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-500 mb-1">Overall Pass Rate</div>
          <div className="text-2xl text-green-600">98.4%</div>
          <div className="text-xs text-slate-600 mt-1">Above target (95%)</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control Chart */}
        <Card className="p-6">
          <h3 className="mb-4">Control Chart (X̄) - Overall Length</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={controlChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sample" label={{ value: 'Sample Number', position: 'insideBottom', offset: -5 }} />
              <YAxis domain={[449, 451]} label={{ value: 'Measurement (mm)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ucl" stroke="#ef4444" strokeDasharray="5 5" name="UCL" dot={false} />
              <Line type="monotone" dataKey="center" stroke="#3b82f6" strokeDasharray="3 3" name="Center" dot={false} />
              <Line type="monotone" dataKey="lcl" stroke="#ef4444" strokeDasharray="5 5" name="LCL" dot={false} />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="Measured" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-slate-600">
            <p>✓ Process in control - no special cause variation detected</p>
            <p>✓ All points within control limits</p>
          </div>
        </Card>

        {/* Defect Rate Trend */}
        <Card className="p-6">
          <h3 className="mb-4">Defect Rate Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={defectTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Defect Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} name="Defect Rate %" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-slate-600">
            <p>↓ Trending downward - improvement observed</p>
            <p>Current rate: 0.6% (below threshold of 1.5%)</p>
          </div>
        </Card>

        {/* Capability Indices */}
        <Card className="p-6">
          <h3 className="mb-4">Process Capability Indices (Cp, Cpk)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={capabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="characteristic" />
              <YAxis domain={[0, 2]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="cp" fill="#3b82f6" name="Cp" />
              <Bar dataKey="cpk" fill="#10b981" name="Cpk" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-slate-600">
            <p>✓ All characteristics meet minimum Cpk ≥ 1.33</p>
            <p>Target: Cpk ≥ 1.67 for critical dimensions</p>
          </div>
        </Card>

        {/* Phase Distribution */}
        <Card className="p-6">
          <h3 className="mb-4">Time in Phase Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>PPAP</span>
                <span>12 days (Target: 14 days)</span>
              </div>
              <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '86%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Safe Launch</span>
                <span>28 days (Target: 30 days)</span>
              </div>
              <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '93%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Production</span>
                <span>45 days (Ongoing)</span>
              </div>
              <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Reduced Inspection</span>
                <span>Not yet achieved</span>
              </div>
              <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-600">
            <p>Current phase: Production (Normal sampling)</p>
            <p>10 consecutive lots required to advance to Reduced</p>
          </div>
        </Card>
      </div>

      {/* Top Root Causes */}
      <Card className="p-6">
        <h3 className="mb-4">Top 5 Root Causes by Frequency</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { cause: "Fixture Wear", count: 12, percent: 25.5 },
            { cause: "Material Variation", count: 9, percent: 19.1 },
            { cause: "Operator Error", count: 7, percent: 14.9 },
            { cause: "Tooling Setup", count: 6, percent: 12.8 },
            { cause: "Measurement Error", count: 5, percent: 10.6 },
          ].map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="text-2xl mb-1">#{idx + 1}</div>
              <div className="font-medium text-sm mb-1">{item.cause}</div>
              <div className="text-xs text-slate-600">{item.count} occurrences ({item.percent}%)</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Report List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Saved Reports</h3>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Generated</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-mono text-sm">{report.id}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.format}</Badge>
                  </TableCell>
                  <TableCell>{report.owner}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleReportDownload(report)}>
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}