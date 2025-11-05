import { Card, CardContent } from "../ui/card";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Info } from "lucide-react";
import { useState } from "react";

export type BasisType = "short-term" | "long-term" | "both";

type BasisSelectorProps = {
  value: BasisType;
  onChange: (value: BasisType) => void;
  withinEstimator: string;
  showTooltip?: boolean;
};

export function BasisSelector({ 
  value, 
  onChange, 
  withinEstimator,
  showTooltip = true 
}: BasisSelectorProps) {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-900">Analysis Basis</h3>
            {showTooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-slate-500 cursor-help hover:text-slate-700" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <div className="space-y-2">
                      <p className="font-medium">Short-term vs Long-term Basis</p>
                      <p className="text-xs">
                        <strong>Short-term (Within):</strong> Uses σ̂<sub>within</sub> estimated from {withinEstimator.toUpperCase()}. 
                        Isolates random variation within rational subgroups. Represents "what the process is capable of" 
                        if perfectly controlled.
                      </p>
                      <p className="text-xs">
                        <strong>Long-term (Overall):</strong> Uses σ̂<sub>overall</sub> from total sample variation. 
                        Includes drift, shifts, and between-subgroup variation. Represents "actual performance over time."
                      </p>
                      <p className="text-xs mt-2 pt-2 border-t">
                        Both bases are computed; toggle to emphasize one or compare both side-by-side.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <ToggleGroup 
            type="single" 
            value={value} 
            onValueChange={(newValue) => newValue && onChange(newValue as BasisType)}
            className="bg-slate-100 rounded-lg p-1 border border-slate-200"
          >
            <ToggleGroupItem 
              value="short-term" 
              className="gap-2 data-[state=on]:bg-slate-900 data-[state=on]:text-white hover:bg-slate-200"
            >
              Short-term
              <Badge variant="outline" className="text-xs border-current">Cp/Cpk</Badge>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="long-term" 
              className="gap-2 data-[state=on]:bg-slate-900 data-[state=on]:text-white hover:bg-slate-200"
            >
              Long-term
              <Badge variant="outline" className="text-xs border-current">Pp/Ppk</Badge>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="both" 
              className="gap-2 data-[state=on]:bg-slate-900 data-[state=on]:text-white hover:bg-slate-200"
            >
              Both
              <Badge variant="outline" className="text-xs border-current">Compare</Badge>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Explanation chips */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <p className="font-medium text-slate-700">σ̂<sub>within</sub></p>
            <p className="text-slate-600">Estimator: {withinEstimator.toUpperCase()}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <p className="font-medium text-slate-700">σ̂<sub>overall</sub></p>
            <p className="text-slate-600">Total sample std dev</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
