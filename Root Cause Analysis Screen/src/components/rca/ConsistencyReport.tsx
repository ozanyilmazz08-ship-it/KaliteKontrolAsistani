import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { useRCA } from '../../contexts/RCAContext';

interface ConsistencyReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Issue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  location: string;
}

export function ConsistencyReport({ open, onOpenChange }: ConsistencyReportProps) {
  const { project } = useRCA();

  const issues: Issue[] = [];

  // Check for validation issues
  project.fiveWhyTrees.forEach(tree => {
    tree.nodes.forEach(node => {
      if (node.status === 'requires-evidence' && node.evidenceRefs.length === 0) {
        issues.push({
          severity: 'warning',
          category: '5 Whys',
          message: `Node "${node.text || 'Untitled'}" requires evidence but none attached`,
          location: tree.name
        });
      }
    });
  });

  // Check for missing owners in Fishbone
  project.fishboneDiagrams.forEach(diagram => {
    diagram.categories.forEach(category => {
      category.children?.forEach(cause => {
        if (cause.severityTag === 'critical' && !cause.owner) {
          issues.push({
            severity: 'error',
            category: 'Fishbone',
            message: `Critical cause "${cause.text || 'Untitled'}" has no owner assigned`,
            location: diagram.name
          });
        }
      });
    });
  });

  // Check for high RPN items without actions in FMEA
  project.fmeaAnalyses.forEach(analysis => {
    analysis.items.forEach(item => {
      if (item.rpn >= 200 && !item.recommendedActions) {
        issues.push({
          severity: 'error',
          category: 'FMEA',
          message: `High RPN (${item.rpn}) failure mode "${item.failureMode}" has no recommended actions`,
          location: analysis.name
        });
      }
      if (item.status === 'open' && item.targetDate) {
        const targetDate = new Date(item.targetDate);
        if (targetDate < new Date()) {
          issues.push({
            severity: 'warning',
            category: 'FMEA',
            message: `Action for "${item.failureMode}" is overdue`,
            location: analysis.name
          });
        }
      }
    });
  });

  // Check for actions without owners
  project.actions.forEach(action => {
    if (!action.owner) {
      issues.push({
        severity: 'warning',
        category: 'CAPA',
        message: `Action "${action.title}" has no owner assigned`,
        location: 'Actions List'
      });
    }
  });

  // Check for unvalidated hypotheses
  const unvalidatedCount = project.fiveWhyTrees.reduce((count, tree) => {
    return count + tree.nodes.filter(n => n.status === 'pending').length;
  }, 0);

  if (unvalidatedCount > 0) {
    issues.push({
      severity: 'info',
      category: '5 Whys',
      message: `${unvalidatedCount} hypothesis/es not yet validated`,
      location: 'Multiple trees'
    });
  }

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  const getIcon = (severity: Issue['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: Issue['severity']) => {
    switch (severity) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-700">Warning</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Consistency Report</DialogTitle>
          <DialogDescription>
            Review validation issues and gaps across all RCA methods
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-2xl">{errors.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Errors</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-2xl">{warnings.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span className="text-2xl">{infos.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Info</p>
          </div>
        </div>

        {issues.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="font-medium mb-1">All Clear!</p>
            <p className="text-sm text-muted-foreground">
              No validation issues found. Your RCA project is ready for export.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-4">
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getIcon(issue.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityBadge(issue.severity)}
                        <Badge variant="outline">{issue.category}</Badge>
                      </div>
                      <p className="text-sm mb-1">{issue.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Location: {issue.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Some items need attention before export. 
            Address errors and warnings to ensure complete and auditable RCA documentation.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
