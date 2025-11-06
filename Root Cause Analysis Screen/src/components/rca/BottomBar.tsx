import { CheckCircle2, Clock, AlertCircle, Database } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useRCA } from '../../contexts/RCAContext';

export function BottomBar() {
  const { project } = useRCA();

  const lastSaved = new Date(project.updatedAt);
  const timeSince = Math.floor((Date.now() - lastSaved.getTime()) / 1000 / 60);

  const getStatusColor = () => {
    if (timeSince < 1) return 'text-green-500';
    if (timeSince < 5) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  const getStatusText = () => {
    if (timeSince < 1) return 'Saved just now';
    if (timeSince === 1) return 'Saved 1 minute ago';
    if (timeSince < 60) return `Saved ${timeSince} minutes ago`;
    const hours = Math.floor(timeSince / 60);
    if (hours === 1) return 'Saved 1 hour ago';
    return `Saved ${hours} hours ago`;
  };

  const openActions = project.actions.filter(a => a.status === 'open' || a.status === 'in-progress').length;
  const totalEvidence = project.evidence.length;

  return (
    <div className="border-t bg-background px-6 py-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 ${getStatusColor()}`}>
            <CheckCircle2 className="h-4 w-4" />
            <span>{getStatusText()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {lastSaved.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {openActions > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">
                {openActions} open action{openActions !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {totalEvidence} evidence item{totalEvidence !== 1 ? 's' : ''}
            </span>
          </div>

          <Badge variant="outline">
            {project.createdBy}
          </Badge>
        </div>
      </div>
    </div>
  );
}
