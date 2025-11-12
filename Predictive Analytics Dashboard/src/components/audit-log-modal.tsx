import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Download, Search, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';
import { AuditLogEntry } from '@/lib/export-utils';
import { format } from 'date-fns';
import { useState } from 'react';

interface AuditLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: AuditLogEntry[];
  onExport: () => void;
}

export function AuditLogModal({ open, onOpenChange, entries, onExport }: AuditLogModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.modelVersion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterAction === 'all' || entry.action === filterAction;
    
    return matchesSearch && matchesFilter;
  });

  const actionTypes = Array.from(new Set(entries.map(e => e.action)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>AI Actions Audit Log</DialogTitle>
          <DialogDescription>
            Complete history of AI model actions, configuration changes, and approvals.
            All entries are immutable and timestamped for compliance.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filter */}
        <div className="flex items-center gap-2 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, action, or model version..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              aria-label="Search audit log"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            aria-label="Export audit log"
          >
            <Download className="size-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="size-4 text-muted-foreground" />
          <Button
            variant={filterAction === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterAction('all')}
          >
            All ({entries.length})
          </Button>
          {actionTypes.map(action => (
            <Button
              key={action}
              variant={filterAction === action ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterAction(action)}
            >
              {action} ({entries.filter(e => e.action === action).length})
            </Button>
          ))}
        </div>

        {/* Audit Entries */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No audit entries found matching your criteria.
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{entry.action}</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.modelVersion}
                        </Badge>
                        {entry.approved ? (
                          <Badge variant="default" className="text-xs bg-green-600">
                            <CheckCircle className="size-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="size-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        by <span className="font-medium">{entry.user}</span>
                        {' · '}
                        {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </div>
                    </div>
                  </div>

                  {/* Settings Details */}
                  {Object.keys(entry.settings).length > 0 && (
                    <div className="mt-3 bg-gray-50 rounded p-2 text-xs font-mono">
                      <p className="text-muted-foreground mb-1">Settings:</p>
                      <pre className="text-gray-700 overflow-x-auto">
                        {JSON.stringify(entry.settings, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* State Changes */}
                  {entry.beforeState && entry.afterState && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-red-50 rounded p-2">
                        <p className="text-red-700 font-semibold mb-1">Before:</p>
                        <pre className="text-red-900 overflow-x-auto">
                          {JSON.stringify(entry.beforeState, null, 2)}
                        </pre>
                      </div>
                      <div className="bg-green-50 rounded p-2">
                        <p className="text-green-700 font-semibold mb-1">After:</p>
                        <pre className="text-green-900 overflow-x-auto">
                          {JSON.stringify(entry.afterState, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Approval Info */}
                  {entry.approved && entry.approver && entry.approvalTimestamp && (
                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                      Approved by <span className="font-medium">{entry.approver}</span>
                      {' on '}
                      {format(new Date(entry.approvalTimestamp), 'MMM d, yyyy HH:mm')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Summary Stats */}
        <div className="border-t pt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Entries</p>
            <p className="text-xl font-semibold">{entries.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Approved</p>
            <p className="text-xl font-semibold text-green-600">
              {entries.filter(e => e.approved).length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Pending</p>
            <p className="text-xl font-semibold text-amber-600">
              {entries.filter(e => !e.approved).length}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
