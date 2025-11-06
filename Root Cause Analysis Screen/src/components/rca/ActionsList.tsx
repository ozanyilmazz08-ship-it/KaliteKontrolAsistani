import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useRCA } from '../../contexts/RCAContext';

const statusColors = {
  'open': 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  'completed': 'bg-green-100 text-green-700',
  'verified': 'bg-purple-100 text-purple-700'
};

const priorityColors = {
  'low': 'bg-gray-100 text-gray-700',
  'medium': 'bg-blue-100 text-blue-700',
  'high': 'bg-orange-100 text-orange-700',
  'critical': 'bg-red-100 text-red-700'
};

export function ActionsList() {
  const { project, updateAction } = useRCA();

  const handleStatusChange = (actionId: string, newStatus: typeof project.actions[0]['status']) => {
    updateAction(actionId, { status: newStatus });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="mb-2">CAPA Actions</h2>
        <p className="text-sm text-muted-foreground">
          Track corrective and preventive actions linked to root causes
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {project.actions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No actions yet</p>
              <p className="text-sm mt-1">Create actions from causes in the analysis methods</p>
            </div>
          ) : (
            project.actions.map(action => (
              <div
                key={action.id}
                className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <Badge className={statusColors[action.status]} variant="secondary">
                    {action.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge className={priorityColors[action.priority]} variant="secondary">
                    {action.priority}
                  </Badge>
                  <Badge variant="outline">{action.owner || 'Unassigned'}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className={isOverdue(action.dueDate) ? 'text-red-500' : ''}>
                      {new Date(action.dueDate).toLocaleDateString()}
                      {isOverdue(action.dueDate) && ' (Overdue)'}
                    </span>
                  </div>
                </div>

                {action.linkedTo.length > 0 && (
                  <div className="text-xs text-muted-foreground mb-3">
                    Linked to: {action.linkedTo.map(l => l.method).join(', ')}
                  </div>
                )}

                {action.effectivenessCheck && (
                  <div className="text-sm p-2 bg-muted rounded mt-2">
                    <strong className="text-xs text-muted-foreground">Effectiveness Check:</strong>
                    <p className="text-sm mt-1">{action.effectivenessCheck}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  {action.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(action.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                  )}
                  {action.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(action.id, 'verified')}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
