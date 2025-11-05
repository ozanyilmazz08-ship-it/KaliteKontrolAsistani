import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card } from "../ui/card";
import { AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "../ui/badge";

type ControlChartModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ControlChartModal({ open, onOpenChange }: ControlChartModalProps) {
  // Mock stability data - in production, this would come from actual control chart analysis
  const violations = [
    { rule: "Rule 1", description: "1 point > 3σ from center", points: [45, 78] },
    { rule: "Rule 2", description: "9 points in a row on same side", points: [12, 13, 14, 15, 16, 17, 18, 19, 20] },
  ];
  
  const isStable = violations.length === 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isStable ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Process is Stable
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Process Shows Instability
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Control chart analysis based on Western Electric / Nelson run rules
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* X̄ Chart */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">X̄ Chart (Subgroup Means)</h3>
            
            {/* Simplified control chart visualization */}
            <div className="relative h-64 bg-slate-50 border border-slate-200 rounded">
              {/* Control limits */}
              <div className="absolute top-4 left-0 right-0 border-t-2 border-red-400 border-dashed">
                <span className="text-xs text-red-600 ml-2">UCL = 102.4</span>
              </div>
              <div className="absolute top-1/2 left-0 right-0 border-t-2 border-blue-600">
                <span className="text-xs text-blue-600 ml-2">CL = 100.0</span>
              </div>
              <div className="absolute bottom-4 left-0 right-0 border-t-2 border-red-400 border-dashed">
                <span className="text-xs text-red-600 ml-2">LCL = 97.6</span>
              </div>
              
              {/* Zone markers */}
              <div className="absolute top-[20%] left-0 right-0 border-t border-orange-300 opacity-40" />
              <div className="absolute top-[35%] left-0 right-0 border-t border-yellow-300 opacity-40" />
              <div className="absolute bottom-[35%] left-0 right-0 border-t border-yellow-300 opacity-40" />
              <div className="absolute bottom-[20%] left-0 right-0 border-t border-orange-300 opacity-40" />
              
              {/* Mock data points */}
              <svg className="absolute inset-0 w-full h-full">
                <polyline
                  points="20,130 40,125 60,135 80,128 100,180 120,132 140,138 160,125 180,122 200,128"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
                {/* Violation markers */}
                <circle cx="100" cy="180" r="5" fill="#dc2626" />
                <circle cx="180" cy="122" r="5" fill="#ea580c" />
              </svg>
            </div>
            
            {!isStable && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-orange-700">Detected Violations:</p>
                {violations.map((v, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs bg-orange-50 p-2 rounded border border-orange-200">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium">{v.rule}: {v.description}</p>
                      <p className="text-slate-600">Points: {v.points.join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          {/* R Chart */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">R Chart (Ranges)</h3>
            
            <div className="relative h-48 bg-slate-50 border border-slate-200 rounded">
              <div className="absolute top-4 left-0 right-0 border-t-2 border-red-400 border-dashed">
                <span className="text-xs text-red-600 ml-2">UCL = 8.2</span>
              </div>
              <div className="absolute top-1/2 left-0 right-0 border-t-2 border-blue-600">
                <span className="text-xs text-blue-600 ml-2">R̄ = 3.8</span>
              </div>
              <div className="absolute bottom-4 left-0 right-0 border-t-2 border-red-400 border-dashed opacity-50">
                <span className="text-xs text-red-600 ml-2">LCL = 0</span>
              </div>
              
              <svg className="absolute inset-0 w-full h-full">
                <polyline
                  points="20,90 40,85 60,95 80,88 100,92 120,82 140,98 160,85 180,82 200,88"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
              </svg>
            </div>
            
            <div className="mt-2 text-xs text-slate-600">
              <CheckCircle2 className="inline h-3 w-3 text-green-600 mr-1" />
              No violations detected in R chart
            </div>
          </Card>
          
          {/* Run rules summary */}
          <Card className="p-4 bg-slate-50">
            <h3 className="font-medium mb-3">Western Electric / Nelson Run Rules</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2">
                <Badge variant={violations.some(v => v.rule === "Rule 1") ? "destructive" : "outline"} className="shrink-0">
                  Rule 1
                </Badge>
                <span>1 point beyond 3σ</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant={violations.some(v => v.rule === "Rule 2") ? "destructive" : "outline"} className="shrink-0">
                  Rule 2
                </Badge>
                <span>9 points in a row on same side</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">Rule 3</Badge>
                <span>6 points in a row trending</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">Rule 4</Badge>
                <span>14 points alternating up/down</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">Rule 5</Badge>
                <span>2 of 3 beyond 2σ</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">Rule 6</Badge>
                <span>4 of 5 beyond 1σ</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">Rule 7</Badge>
                <span>15 points within 1σ</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">Rule 8</Badge>
                <span>8 points beyond 1σ</span>
              </div>
            </div>
          </Card>
          
          {!isStable && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900">Capability Analysis Prerequisite</p>
                  <p className="text-orange-700 mt-1">
                    Process capability indices (Cp, Cpk) assume statistical control. 
                    The detected instabilities indicate special causes are present. 
                    Short-term capability estimates may not be reliable until stability is achieved.
                  </p>
                  <p className="text-orange-700 mt-2">
                    <strong>Recommendation:</strong> Investigate and eliminate special causes before computing capability. 
                    Long-term indices (Pp, Ppk) will reflect actual performance including instability.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
