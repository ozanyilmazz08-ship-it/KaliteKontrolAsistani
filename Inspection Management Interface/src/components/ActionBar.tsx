import { Button } from "./ui/button";
import { AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { toast } from "sonner@2.0.3";

interface ActionBarProps {
  hasChanges: boolean;
  validationErrors: string[];
  onSave: (isDraft?: boolean) => void;
  onDiscard: () => void;
  onReset: () => void;
}

export function ActionBar({ hasChanges, validationErrors, onSave, onDiscard, onReset }: ActionBarProps) {
  const hasErrors = validationErrors.length > 0;

  const handleExportConfig = () => {
    toast.success("Configuration exported successfully");
  };

  const handleExportReports = () => {
    toast.success("Reports exported successfully");
  };

  const handleViewHistory = () => {
    toast.info("Opening change history...");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={!hasChanges}>
                  Discard Changes
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will restore the last approved configuration. All unsaved changes will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDiscard}>Discard</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  Reset to Defaults
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset to Defaults?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reload standard default plans defined by quality engineering.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onReset}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center gap-3">
            {hasErrors ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">
                  {validationErrors.length} validation error{validationErrors.length !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">No unresolved errors</span>
              </div>
            )}

            <Button variant="outline" onClick={() => onSave(true)} disabled={!hasChanges}>
              Save as Draft
            </Button>

            <Button onClick={() => onSave(false)} disabled={hasErrors}>
              Save & Apply
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  More Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportConfig}>Export Configuration</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportReports}>Export Reports</DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewHistory}>View Change History</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}