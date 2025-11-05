import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Download, FileText, Image, FileSpreadsheet, FileJson, Check } from "lucide-react";
import { Badge } from "../ui/badge";
import { CapabilityConfig } from "../../lib/capability-types";
import { toast } from "sonner@2.0.3";

type ExportDialogProps = {
  config: CapabilityConfig;
};

export function ExportDialog({ config }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("Capability Analysis Report");
  const [selectedSections, setSelectedSections] = useState({
    summary: true,
    distribution: true,
    indices: true,
    nonNormal: false,
    rolling: false,
    attribute: false,
    settings: true
  });

  const [exportFormats, setExportFormats] = useState({
    pdf: true,
    png: false,
    csv: true,
    json: false
  });

  const handleExportPDF = () => {
    // In a real implementation, this would generate a PDF using a library like jsPDF or react-pdf
    console.log("Exporting PDF with sections:", selectedSections);
    toast.success("PDF export initiated. Report will download shortly.");
    
    // Mock download
    const fileName = `capability-report-${new Date().toISOString().split('T')[0]}.pdf`;
    console.log("Would download:", fileName);
  };

  const handleExportPNG = () => {
    console.log("Exporting PNG charts");
    toast.success("Chart images export initiated. Files will download as ZIP.");
  };

  const handleExportCSV = () => {
    // In a real implementation, this would compile all metrics into CSV format
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `capability-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("CSV file downloaded successfully.");
  };

  const handleExportJSON = () => {
    const jsonConfig = {
      exportDate: new Date().toISOString(),
      reportTitle,
      configuration: config,
      metadata: {
        version: "1.0.0",
        analyst: "Current User",
        dataWindow: "2024-11-01 to 2024-11-30",
        nSamples: 150
      }
    };

    const blob = new Blob([JSON.stringify(jsonConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `capability-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("JSON configuration downloaded successfully.");
  };

  const generateCSV = (): string => {
    // Mock CSV generation
    const rows = [
      ["Metric", "Value", "Lower CI", "Upper CI", "Unit"],
      ["Cp", "1.45", "1.38", "1.52", config.specifications.unit],
      ["Cpk", "1.33", "1.25", "1.41", config.specifications.unit],
      ["Pp", "1.22", "1.15", "1.29", config.specifications.unit],
      ["Ppk", "1.15", "1.08", "1.22", config.specifications.unit],
      ["Zst", "3.99", "3.75", "4.23", "sigma"],
      ["Zlt", "3.45", "3.24", "3.66", "sigma"],
      ["PPM Total", "3000", "2200", "4100", "ppm"],
      ["Yield", "99.70", "99.59", "99.78", "%"]
    ];
    return rows.map(row => row.join(",")).join("\n");
  };

  const handleExportAll = () => {
    if (exportFormats.pdf) handleExportPDF();
    if (exportFormats.png) handleExportPNG();
    if (exportFormats.csv) handleExportCSV();
    if (exportFormats.json) handleExportJSON();
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Capability Analysis</DialogTitle>
          <DialogDescription>
            Configure export options for reports, charts, metrics, and settings. 
            All exports include timestamp and configuration for traceability.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Title */}
          <div>
            <Label htmlFor="report-title">Report Title</Label>
            <Input
              id="report-title"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Enter report title"
              className="mt-1"
            />
          </div>

          <Separator />

          {/* Export Formats */}
          <div>
            <h4 className="font-medium mb-3">Export Formats</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="format-pdf"
                  checked={exportFormats.pdf}
                  onCheckedChange={(checked) => 
                    setExportFormats({ ...exportFormats, pdf: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="format-pdf" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </Label>
                  <p className="text-xs text-slate-600 mt-1">
                    Complete report with selected charts, tables, and interpretations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="format-png"
                  checked={exportFormats.png}
                  onCheckedChange={(checked) => 
                    setExportFormats({ ...exportFormats, png: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="format-png" className="flex items-center gap-2 cursor-pointer">
                    <Image className="h-4 w-4" />
                    PNG Images (ZIP)
                  </Label>
                  <p className="text-xs text-slate-600 mt-1">
                    High-resolution chart images for presentations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="format-csv"
                  checked={exportFormats.csv}
                  onCheckedChange={(checked) => 
                    setExportFormats({ ...exportFormats, csv: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="format-csv" className="flex items-center gap-2 cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV Metrics & CI
                  </Label>
                  <p className="text-xs text-slate-600 mt-1">
                    All capability indices, confidence intervals, and statistics
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="format-json"
                  checked={exportFormats.json}
                  onCheckedChange={(checked) => 
                    setExportFormats({ ...exportFormats, json: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="format-json" className="flex items-center gap-2 cursor-pointer">
                    <FileJson className="h-4 w-4" />
                    JSON Configuration
                  </Label>
                  <p className="text-xs text-slate-600 mt-1">
                    Complete settings for reproducibility (specs, estimators, thresholds)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section Selection (for PDF) */}
          {exportFormats.pdf && (
            <div>
              <h4 className="font-medium mb-3">PDF Sections to Include</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="section-summary"
                    checked={selectedSections.summary}
                    onCheckedChange={(checked) =>
                      setSelectedSections({ ...selectedSections, summary: checked as boolean })
                    }
                  />
                  <Label htmlFor="section-summary" className="cursor-pointer">
                    Summary
                    <Badge variant="outline" className="ml-2 text-xs">Required</Badge>
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="section-distribution"
                    checked={selectedSections.distribution}
                    onCheckedChange={(checked) =>
                      setSelectedSections({ ...selectedSections, distribution: checked as boolean })
                    }
                  />
                  <Label htmlFor="section-distribution" className="cursor-pointer">Distribution Fit</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="section-indices"
                    checked={selectedSections.indices}
                    onCheckedChange={(checked) =>
                      setSelectedSections({ ...selectedSections, indices: checked as boolean })
                    }
                  />
                  <Label htmlFor="section-indices" className="cursor-pointer">Indices & CI</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="section-nonnormal"
                    checked={selectedSections.nonNormal}
                    onCheckedChange={(checked) =>
                      setSelectedSections({ ...selectedSections, nonNormal: checked as boolean })
                    }
                  />
                  <Label htmlFor="section-nonnormal" className="cursor-pointer">Non-Normal</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="section-rolling"
                    checked={selectedSections.rolling}
                    onCheckedChange={(checked) =>
                      setSelectedSections({ ...selectedSections, rolling: checked as boolean })
                    }
                  />
                  <Label htmlFor="section-rolling" className="cursor-pointer">Rolling Capability</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="section-settings"
                    checked={selectedSections.settings}
                    onCheckedChange={(checked) =>
                      setSelectedSections({ ...selectedSections, settings: checked as boolean })
                    }
                  />
                  <Label htmlFor="section-settings" className="cursor-pointer">Settings & Methods</Label>
                </div>
              </div>
            </div>
          )}

          {/* Export Info */}
          <div className="p-3 bg-blue-50 rounded border border-blue-200 text-xs text-blue-900">
            <p className="font-medium mb-1">Export Metadata Included:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Timestamp: {new Date().toISOString()}</li>
              <li>Configuration: LSL={config.specifications.lsl}, USL={config.specifications.usl}, 
                Target={config.specifications.target}</li>
              <li>Estimators: {config.estimators.withinEstimator}, CI={config.ciLevel * 100}%</li>
              <li>Data window, sample size, and analysis version</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExportAll}>
            <Check className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
