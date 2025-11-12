import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Download, FileJson, FileText, FileImage, Table } from 'lucide-react';
import { useState } from 'react';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: ExportOptions) => void;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'png';
  includeChart: boolean;
  includeKPIs: boolean;
  includeAnomalies: boolean;
  includeModelConfig: boolean;
  includeAuditLog: boolean;
  includeDriftMetrics: boolean;
  includeExplainability: boolean;
  includeScenario: boolean;
}

export function ExportModal({ open, onOpenChange, onExport }: ExportModalProps) {
  const [format, setFormat] = useState<ExportOptions['format']>('json');
  const [options, setOptions] = useState<Omit<ExportOptions, 'format'>>({
    includeChart: true,
    includeKPIs: true,
    includeAnomalies: true,
    includeModelConfig: true,
    includeAuditLog: false,
    includeDriftMetrics: true,
    includeExplainability: true,
    includeScenario: false
  });

  const handleExport = () => {
    onExport({ format, ...options });
    onOpenChange(false);
  };

  const toggleOption = (key: keyof Omit<ExportOptions, 'format'>) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export AI Report</DialogTitle>
          <DialogDescription>
            Select format and components to include in your export.
            All exports include timestamp and full provenance for reproducibility.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={format === 'json' ? 'default' : 'outline'}
                onClick={() => setFormat('json')}
                className="justify-start"
                aria-label="Export as JSON"
              >
                <FileJson className="size-4 mr-2" />
                JSON
                <span className="ml-auto text-xs text-muted-foreground">Full data</span>
              </Button>
              <Button
                variant={format === 'csv' ? 'default' : 'outline'}
                onClick={() => setFormat('csv')}
                className="justify-start"
                aria-label="Export as CSV"
              >
                <Table className="size-4 mr-2" />
                CSV
                <span className="ml-auto text-xs text-muted-foreground">Tabular</span>
              </Button>
              <Button
                variant={format === 'pdf' ? 'default' : 'outline'}
                onClick={() => setFormat('pdf')}
                className="justify-start"
                aria-label="Export as PDF"
              >
                <FileText className="size-4 mr-2" />
                PDF
                <span className="ml-auto text-xs text-muted-foreground">Report</span>
              </Button>
              <Button
                variant={format === 'png' ? 'default' : 'outline'}
                onClick={() => setFormat('png')}
                className="justify-start"
                aria-label="Export as PNG"
              >
                <FileImage className="size-4 mr-2" />
                PNG
                <span className="ml-auto text-xs text-muted-foreground">Image</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Component Selection */}
          <div className="space-y-3">
            <Label>Include Components</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="chart"
                  checked={options.includeChart}
                  onCheckedChange={() => toggleOption('includeChart')}
                  disabled={format === 'png'}
                  aria-label="Include forecast chart"
                />
                <Label htmlFor="chart" className="cursor-pointer font-normal">
                  Forecast Chart with Anomalies
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="kpis"
                  checked={options.includeKPIs}
                  onCheckedChange={() => toggleOption('includeKPIs')}
                  aria-label="Include KPI metrics"
                />
                <Label htmlFor="kpis" className="cursor-pointer font-normal">
                  KPI Metrics (Risk, Mean, Sigma, Condition)
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="modelConfig"
                  checked={options.includeModelConfig}
                  onCheckedChange={() => toggleOption('includeModelConfig')}
                  aria-label="Include model configuration"
                />
                <Label htmlFor="modelConfig" className="cursor-pointer font-normal">
                  Model Configuration & Provenance
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="explainability"
                  checked={options.includeExplainability}
                  onCheckedChange={() => toggleOption('includeExplainability')}
                  disabled={format === 'png'}
                  aria-label="Include explainability"
                />
                <Label htmlFor="explainability" className="cursor-pointer font-normal">
                  Explainability (SHAP values & drivers)
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="anomalies"
                  checked={options.includeAnomalies}
                  onCheckedChange={() => toggleOption('includeAnomalies')}
                  aria-label="Include anomalies"
                />
                <Label htmlFor="anomalies" className="cursor-pointer font-normal">
                  Anomaly Detection Results
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="drift"
                  checked={options.includeDriftMetrics}
                  onCheckedChange={() => toggleOption('includeDriftMetrics')}
                  aria-label="Include drift metrics"
                />
                <Label htmlFor="drift" className="cursor-pointer font-normal">
                  Drift & Data Quality Metrics
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="scenario"
                  checked={options.includeScenario}
                  onCheckedChange={() => toggleOption('includeScenario')}
                  disabled={format === 'csv'}
                  aria-label="Include scenario simulation"
                />
                <Label htmlFor="scenario" className="cursor-pointer font-normal">
                  Scenario Simulation Settings
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="audit"
                  checked={options.includeAuditLog}
                  onCheckedChange={() => toggleOption('includeAuditLog')}
                  disabled={format === 'png'}
                  aria-label="Include audit log"
                />
                <Label htmlFor="audit" className="cursor-pointer font-normal">
                  Audit Log (Governance)
                </Label>
              </div>
            </div>
          </div>

          {/* Format-specific notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
            {format === 'json' && (
              <p className="text-blue-900">
                <strong>JSON:</strong> Complete machine-readable export with all metadata,
                settings, and provenance for full reproducibility and audit compliance.
              </p>
            )}
            {format === 'csv' && (
              <p className="text-blue-900">
                <strong>CSV:</strong> Tabular forecast and risk data by horizon.
                Suitable for Excel, statistical software, or database import.
              </p>
            )}
            {format === 'pdf' && (
              <p className="text-blue-900">
                <strong>PDF:</strong> Executive report with charts, metrics, and insights.
                Includes signatures block for approval workflows.
              </p>
            )}
            {format === 'png' && (
              <p className="text-blue-900">
                <strong>PNG:</strong> High-resolution chart image for presentations
                and documentation. Includes timestamp and spec limits.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="size-4 mr-2" />
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
