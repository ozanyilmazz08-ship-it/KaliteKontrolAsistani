import { useState } from 'react';
import { Plus, FileText, Image, Link as LinkIcon, FileEdit, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Separator } from '../ui/separator';
import { useRCA } from '../../contexts/RCAContext';
import type { Evidence } from '../../types/rca';

const evidenceIcons = {
  'file': FileText,
  'image': Image,
  'link': LinkIcon,
  'note': FileEdit
};

export function EvidencePanel() {
  const { project, selectedNodeId, addEvidence, setSelectedNodeId } = useRCA();
  const [isAddingEvidence, setIsAddingEvidence] = useState(false);
  const [newEvidence, setNewEvidence] = useState<Partial<Evidence>>({
    type: 'file',
    title: '',
    description: ''
  });

  // Get the selected node/item details
  const getSelectedDetails = () => {
    if (!selectedNodeId) return null;

    // Check 5 Whys
    for (const tree of project.fiveWhyTrees) {
      const node = tree.nodes.find(n => n.id === selectedNodeId);
      if (node) return { type: '5whys', data: node };
    }

    // Check Fishbone
    for (const diagram of project.fishboneDiagrams) {
      if (diagram.nodes) {
        const node = diagram.nodes.find(n => n.id === selectedNodeId);
        if (node) return { type: 'fishbone', data: node };
      }
      // Old structure compatibility
      for (const category of diagram.categories) {
        const cause = (category as any).children?.find((c: any) => c.id === selectedNodeId);
        if (cause) return { type: 'fishbone', data: cause };
      }
    }

    // Check FMEA
    for (const analysis of project.fmeaAnalyses) {
      const item = analysis.items.find(i => i.id === selectedNodeId);
      if (item) return { type: 'fmea', data: item };
    }

    // Check FTA
    for (const tree of project.faultTrees) {
      const event = tree.events.find(e => e.id === selectedNodeId);
      if (event) return { type: 'fta', data: event };
    }

    return null;
  };

  const selectedDetails = getSelectedDetails();
  const linkedEvidence = project.evidence.filter(e => 
    selectedNodeId && e.linkedTo.includes(selectedNodeId)
  );

  const handleAddEvidence = () => {
    if (!newEvidence.title || !selectedNodeId) return;

    const evidence: Evidence = {
      id: `ev-${Date.now()}`,
      type: newEvidence.type as Evidence['type'],
      title: newEvidence.title,
      description: newEvidence.description,
      uri: newEvidence.uri,
      linkedTo: [selectedNodeId],
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };

    addEvidence(evidence);
    setNewEvidence({ type: 'file', title: '', description: '' });
    setIsAddingEvidence(false);
  };

  const isOpen = !!selectedNodeId;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && setSelectedNodeId(null)} modal={false}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Details & Evidence</SheetTitle>
          <SheetDescription>
            Attach data or documents that substantiate this cause.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6 pr-4">
            {/* Node/Item Details */}
            {selectedDetails && (
              <div>
                <Label className="mb-2">Selected Item</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <Badge variant="outline" className="mb-2">
                    {selectedDetails.type}
                  </Badge>
                  <p className="text-sm">
                    {selectedDetails.data.text || selectedDetails.data.failureMode || selectedDetails.data.name || selectedDetails.data.step || 'Untitled'}
                  </p>
                </div>

                {selectedDetails.type === '5whys' && (
                  <div className="mt-3 space-y-2">
                    <div>
                      <Label>Validation Status</Label>
                      <Select
                        value={selectedDetails.data.status}
                        onValueChange={(value) => {
                          // Update logic would go here
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="validated">Validated</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="requires-evidence">Requires Evidence</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedDetails.data.causeCategory && (
                      <div>
                        <Label>Cause Category</Label>
                        <Input value={selectedDetails.data.causeCategory} readOnly />
                      </div>
                    )}
                  </div>
                )}

                {selectedDetails.type === 'fishbone' && (
                  <div className="mt-3 space-y-2">
                    {selectedDetails.data.severityTag && selectedDetails.data.severityTag !== 'none' && (
                      <div>
                        <Label>Severity</Label>
                        <Badge variant="outline">{selectedDetails.data.severityTag}</Badge>
                      </div>
                    )}
                    {selectedDetails.data.owner && (
                      <div>
                        <Label>Owner</Label>
                        <Input value={selectedDetails.data.owner} readOnly />
                      </div>
                    )}
                  </div>
                )}

                {selectedDetails.type === 'fmea' && (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>Severity</Label>
                        <Input value={selectedDetails.data.severity} readOnly />
                      </div>
                      <div>
                        <Label>Occurrence</Label>
                        <Input value={selectedDetails.data.occurrence} readOnly />
                      </div>
                      <div>
                        <Label>Detection</Label>
                        <Input value={selectedDetails.data.detection} readOnly />
                      </div>
                    </div>
                    <div>
                      <Label>RPN</Label>
                      <Input value={selectedDetails.data.rpn} readOnly className="font-bold" />
                    </div>
                  </div>
                )}

                {selectedDetails.type === 'fta' && selectedDetails.data.probability && (
                  <div className="mt-3">
                    <Label>Probability</Label>
                    <Input value={selectedDetails.data.probability} readOnly />
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Evidence Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Evidence ({linkedEvidence.length})</Label>
                <Dialog open={isAddingEvidence} onOpenChange={setIsAddingEvidence}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Evidence</DialogTitle>
                      <DialogDescription>
                        Attach supporting evidence to this item
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={newEvidence.type}
                          onValueChange={(value) => setNewEvidence({ ...newEvidence, type: value as Evidence['type'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="file">File</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="link">Link</SelectItem>
                            <SelectItem value="note">Note</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={newEvidence.title}
                          onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                          placeholder="Evidence title..."
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newEvidence.description}
                          onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                          placeholder="Describe the evidence..."
                          rows={3}
                        />
                      </div>
                      {(newEvidence.type === 'link' || newEvidence.type === 'file') && (
                        <div>
                          <Label>URL/Path</Label>
                          <Input
                            value={newEvidence.uri}
                            onChange={(e) => setNewEvidence({ ...newEvidence, uri: e.target.value })}
                            placeholder={newEvidence.type === 'link' ? 'https://...' : 'File path...'}
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingEvidence(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddEvidence}>
                        Add Evidence
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {linkedEvidence.length > 0 ? (
                <div className="space-y-2">
                  {linkedEvidence.map(evidence => {
                    const Icon = evidenceIcons[evidence.type];
                    return (
                      <div
                        key={evidence.id}
                        className="p-3 border rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{evidence.title}</p>
                            {evidence.description && (
                              <p className="text-xs text-muted-foreground mt-1">{evidence.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(evidence.createdAt).toLocaleDateString()} • {evidence.createdBy}
                            </p>
                          </div>
                          {evidence.uri && (
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No evidence attached yet
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}