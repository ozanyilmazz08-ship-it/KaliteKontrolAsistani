import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

type MSAStatus = "passed" | "warning" | "failed" | "unknown";

type MSAPrerequisiteCardProps = {
  gageRRPercent?: number;
  bias?: number;
  discrimination?: number;
  lastMSADate?: string;
};

export function MSAPrerequisiteCard({ 
  gageRRPercent = 15.2, 
  bias = 0.03,
  discrimination = 5,
  lastMSADate = "2024-09-15"
}: MSAPrerequisiteCardProps) {
  
  const getGageRRStatus = (percent: number): MSAStatus => {
    if (percent < 10) return "passed";
    if (percent < 30) return "warning";
    return "failed";
  };

  const gageRRStatus = getGageRRStatus(gageRRPercent);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Measurement System Analysis (MSA) Prerequisites</CardTitle>
        <CardDescription>
          Ensure gage R&R and bias are acceptable before capability analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
          <div>
            <p className="text-sm font-medium">Gage R&R</p>
            <p className="text-xs text-slate-600">% of tolerance or process variation</p>
          </div>
          <div className="text-right flex items-center gap-2">
            <span className="text-sm">{gageRRPercent.toFixed(1)}%</span>
            {gageRRStatus === "passed" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            {gageRRStatus === "warning" && <AlertCircle className="h-4 w-4 text-amber-600" />}
            {gageRRStatus === "failed" && <XCircle className="h-4 w-4 text-red-600" />}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
          <div>
            <p className="text-sm font-medium">Bias</p>
            <p className="text-xs text-slate-600">Systematic offset from reference</p>
          </div>
          <div className="text-right flex items-center gap-2">
            <span className="text-sm">{bias.toFixed(3)}</span>
            {Math.abs(bias) < 0.1 ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
          <div>
            <p className="text-sm font-medium">Discrimination</p>
            <p className="text-xs text-slate-600">Distinct categories (≥ 5 recommended)</p>
          </div>
          <div className="text-right flex items-center gap-2">
            <span className="text-sm">{discrimination}</span>
            {discrimination >= 5 ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            )}
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-600">Last MSA Study:</p>
            <p className="text-xs font-medium">{lastMSADate}</p>
          </div>
          <Button variant="link" size="sm" className="w-full p-0 h-auto">
            View MSA Report
          </Button>
        </div>

        {gageRRStatus === "warning" && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-900">
              Gage R&R is {gageRRPercent.toFixed(1)}% (10-30% range). Measurement system is marginal. 
              Capability indices may be inflated by measurement error.
            </AlertDescription>
          </Alert>
        )}

        {gageRRStatus === "failed" && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-xs text-red-900">
              Gage R&R exceeds 30%. Measurement system is not acceptable for capability analysis. 
              Improve measurement system before proceeding.
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-3 border-t">
          <p className="text-xs text-slate-600">
            <strong>Acceptance criteria:</strong> Gage R&R &lt; 10% (excellent), 10-30% (marginal), &gt;30% (unacceptable). 
            Per AIAG MSA guidelines.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
