import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Share2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { CapabilityConfig } from "../../lib/capability-types";
import { toast } from "sonner@2.0.3";

type ApplyToDialogProps = {
  config: CapabilityConfig;
};

export function ApplyToDialog({ config }: ApplyToDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [settingsToPropagate, setSettingsToPropagate] = useState({
    estimators: true,
    nonNormal: true,
    bootstrap: true,
    rolling: true,
    outliers: false,
    ciLevel: true,
    i18n: false,
    a11y: false
  });
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  
  // Mock target options (in production, fetch from API)
  const availableTargets = [
    { id: "plant-a-line1-widgetx", label: "Plant A → Line 1 → Widget-X Pro → Diameter" },
    { id: "plant-a-line1-widgety", label: "Plant A → Line 1 → Widget-Y → Length" },
    { id: "plant-a-line2-widgetx", label: "Plant A → Line 2 → Widget-X Pro → Diameter" },
    { id: "plant-b-line1-widgetx", label: "Plant B → Line 1 → Widget-X Pro → Diameter" },
    { id: "plant-b-line3-widgetx", label: "Plant B → Line 3 → Widget-X Std → Thickness" },
  ];
  
  const handleApply = () => {
    if (selectedTargets.length === 0) {
      toast.error("Please select at least one target");
      return;
    }
    
    // In production, this would call an API
    toast.success(`Settings propagated to ${selectedTargets.length} target(s)`);
    setOpen(false);
  };
  
  const canApply = config.rbac?.canApplyToOthers ?? false;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Share2 className="h-4 w-4 mr-2" />
          Apply to…
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Propagate Settings to Other Analyses</DialogTitle>
          <DialogDescription>
            Apply current configuration (estimators, methods, thresholds) to other products, lines, or sites.
            This ensures consistency across your quality system.
          </DialogDescription>
        </DialogHeader>
        
        {!canApply && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900">
              Your role ({config.rbac?.role || "viewer"}) does not have permission to propagate settings.
              Contact an administrator to request access.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {/* Target Selection */}
          <div>
            <h3 className="font-medium mb-3">Select Targets</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {availableTargets.map((target) => (
                <div key={target.id} className="flex items-center gap-2">
                  <Checkbox
                    id={target.id}
                    checked={selectedTargets.includes(target.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTargets([...selectedTargets, target.id]);
                      } else {
                        setSelectedTargets(selectedTargets.filter(id => id !== target.id));
                      }
                    }}
                    disabled={!canApply}
                  />
                  <Label htmlFor={target.id} className="text-sm cursor-pointer">
                    {target.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {selectedTargets.length} target(s) selected
            </p>
          </div>
          
          <Separator />
          
          {/* Settings Selection */}
          <div>
            <h3 className="font-medium mb-3">Settings to Propagate</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prop-estimators"
                  checked={settingsToPropagate.estimators}
                  onCheckedChange={(checked) => 
                    setSettingsToPropagate({...settingsToPropagate, estimators: !!checked})
                  }
                  disabled={!canApply}
                />
                <Label htmlFor="prop-estimators" className="text-sm cursor-pointer">
                  Estimators (σ̂ methods)
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prop-nonnormal"
                  checked={settingsToPropagate.nonNormal}
                  onCheckedChange={(checked) => 
                    setSettingsToPropagate({...settingsToPropagate, nonNormal: !!checked})
                  }
                  disabled={!canApply}
                />
                <Label htmlFor="prop-nonnormal" className="text-sm cursor-pointer">
                  Non-Normal Strategy
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prop-bootstrap"
                  checked={settingsToPropagate.bootstrap}
                  onCheckedChange={(checked) => 
                    setSettingsToPropagate({...settingsToPropagate, bootstrap: !!checked})
                  }
                  disabled={!canApply}
                />
                <Label htmlFor="prop-bootstrap" className="text-sm cursor-pointer">
                  Bootstrap Settings
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prop-rolling"
                  checked={settingsToPropagate.rolling}
                  onCheckedChange={(checked) => 
                    setSettingsToPropagate({...settingsToPropagate, rolling: !!checked})
                  }
                  disabled={!canApply}
                />
                <Label htmlFor="prop-rolling" className="text-sm cursor-pointer">
                  Rolling Window Settings
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prop-outliers"
                  checked={settingsToPropagate.outliers}
                  onCheckedChange={(checked) => 
                    setSettingsToPropagate({...settingsToPropagate, outliers: !!checked})
                  }
                  disabled={!canApply}
                />
                <Label htmlFor="prop-outliers" className="text-sm cursor-pointer">
                  Outlier Detection Method
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prop-cilevel"
                  checked={settingsToPropagate.ciLevel}
                  onCheckedChange={(checked) => 
                    setSettingsToPropagate({...settingsToPropagate, ciLevel: !!checked})
                  }
                  disabled={!canApply}
                />
                <Label htmlFor="prop-cilevel" className="text-sm cursor-pointer">
                  CI Level (90%/95%/99%)
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prop-i18n"
                  checked={settingsToPropagate.i18n}
                  onCheckedChange={(checked) => 
                    setSettingsToPropagate({...settingsToPropagate, i18n: !!checked})
                  }
                  disabled={!canApply}
                />
                <Label htmlFor="prop-i18n" className="text-sm cursor-pointer">
                  Number Format & Locale
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prop-a11y"
                  checked={settingsToPropagate.a11y}
                  onCheckedChange={(checked) => 
                    setSettingsToPropagate({...settingsToPropagate, a11y: !!checked})
                  }
                  disabled={!canApply}
                />
                <Label htmlFor="prop-a11y" className="text-sm cursor-pointer">
                  Accessibility Preferences
                </Label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Options */}
          <div>
            <h3 className="font-medium mb-3">Options</h3>
            <div className="flex items-center gap-2">
              <Checkbox
                id="overwrite"
                checked={overwriteExisting}
                onCheckedChange={(checked) => setOverwriteExisting(!!checked)}
                disabled={!canApply}
              />
              <Label htmlFor="overwrite" className="text-sm cursor-pointer">
                Overwrite existing settings (if unchecked, only apply to newly created analyses)
              </Label>
            </div>
          </div>
          
          {/* Preview */}
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <p className="font-medium mb-1">Preview of changes:</p>
              <div className="text-xs space-y-1">
                <p>• {selectedTargets.length} target analysis/analyses</p>
                <p>• {Object.values(settingsToPropagate).filter(Boolean).length} setting categories</p>
                <p>• {overwriteExisting ? "Will overwrite" : "Will not overwrite"} existing configurations</p>
              </div>
            </AlertDescription>
          </Alert>
          
          {config.rbac?.requireJustification && (
            <div>
              <Label htmlFor="justification">Justification (Required)</Label>
              <textarea
                id="justification"
                className="w-full border rounded-md p-2 text-sm mt-1"
                rows={3}
                placeholder="Explain why these settings should be propagated..."
                disabled={!canApply}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!canApply || selectedTargets.length === 0}>
            <Share2 className="h-4 w-4 mr-2" />
            Apply to {selectedTargets.length} Target{selectedTargets.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
