import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import { ControlChartModal } from "./ControlChartModal";

type StabilityBannerProps = {
  isStable: boolean;
  violationCount?: number;
  allowCompute?: boolean;
};

export function StabilityBanner({ 
  isStable, 
  violationCount = 0,
  allowCompute = true 
}: StabilityBannerProps) {
  const [showControlChart, setShowControlChart] = useState(false);
  
  if (isStable) {
    return (
      <>
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900">Process is Stable</AlertTitle>
          <AlertDescription className="text-green-700">
            No run rule violations detected. Capability analysis prerequisites are met.
            {" "}
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowControlChart(true)}
              className="h-auto p-0 text-green-700 underline font-medium hover:text-green-900"
            >
              View Control Charts
            </Button>
          </AlertDescription>
        </Alert>
        
        <ControlChartModal 
          open={showControlChart}
          onOpenChange={setShowControlChart}
        />
      </>
    );
  }
  
  return (
    <>
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <AlertTitle className="text-orange-900">
          Process Shows Instability ({violationCount} rule{violationCount !== 1 ? 's' : ''} violated)
        </AlertTitle>
        <AlertDescription className="text-orange-700 space-y-2">
          <p>
            Control chart analysis detected special cause variation. 
            Short-term capability estimates (Cp/Cpk) require statistical control and may not be reliable.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowControlChart(true)}
              className="bg-white border-orange-300 text-orange-700 hover:bg-orange-100 hover:text-orange-900"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Control Charts
            </Button>
            {allowCompute && (
              <span className="text-xs">
                You may proceed with analysis, but indices should be interpreted with caution.
              </span>
            )}
          </div>
        </AlertDescription>
      </Alert>
      
      <ControlChartModal 
        open={showControlChart}
        onOpenChange={setShowControlChart}
      />
    </>
  );
}
