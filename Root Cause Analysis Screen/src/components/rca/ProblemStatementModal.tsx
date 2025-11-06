import { useState } from 'react';
import { FileText, AlertCircle, Plus, X, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { useRCA } from '../../contexts/RCAContext';

interface ProblemStatementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProblemStatementModal({ open, onOpenChange }: ProblemStatementModalProps) {
  const { project, updateProject } = useRCA();
  
  const [formData, setFormData] = useState({
    title: project.title,
    problemStatement: project.problemStatement,
    scope: '',
    outOfScope: '',
    affectedProduct: '',
    affectedProcess: '',
    location: '',
    baselineMetrics: '',
  });

  const [evidenceLinks, setEvidenceLinks] = useState<string[]>([]);
  const [newEvidenceLink, setNewEvidenceLink] = useState('');

  const handleSave = () => {
    updateProject({
      title: formData.title,
      problemStatement: formData.problemStatement,
    });
    onOpenChange(false);
  };

  const handleAddEvidence = () => {
    if (newEvidenceLink.trim()) {
      setEvidenceLinks([...evidenceLinks, newEvidenceLink.trim()]);
      setNewEvidenceLink('');
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceLinks(evidenceLinks.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <FileText className="h-4 w-4" />
            </div>
            Problem Statement & Scope
          </DialogTitle>
          <DialogDescription>
            Define the specific, measurable problem and its boundaries. This statement will be included in all exports.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Alert Banner */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                A clear, measurable problem statement reduces noise and bias in your RCA. 
                Include what, where, when, and extent of the problem.
              </AlertDescription>
            </Alert>

            {/* Project Title */}
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Production Quality Investigation - Q4 2025"
                className="mt-1"
              />
            </div>

            {/* Problem Statement */}
            <div>
              <Label htmlFor="problem-statement">Measurable Problem Statement *</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                State the specific, observable problem and its extent
              </p>
              <Textarea
                id="problem-statement"
                value={formData.problemStatement}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                placeholder="Example: Product defect rate increased from 2% to 8% over the past month, causing 150 customer complaints and $45,000 in scrap costs."
                rows={4}
                className="resize-none"
              />
            </div>

            <Separator />

            {/* Scope & Boundaries */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                Scope & Boundaries
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="in-scope">In Scope</Label>
                  <Textarea
                    id="in-scope"
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    placeholder="What is included in this analysis..."
                    rows={3}
                    className="resize-none mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="out-scope">Out of Scope</Label>
                  <Textarea
                    id="out-scope"
                    value={formData.outOfScope}
                    onChange={(e) => setFormData({ ...formData, outOfScope: e.target.value })}
                    placeholder="What is explicitly excluded..."
                    rows={3}
                    className="resize-none mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Affected Areas */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                Affected Areas
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product">Product/Process</Label>
                  <Input
                    id="product"
                    value={formData.affectedProduct}
                    onChange={(e) => setFormData({ ...formData, affectedProduct: e.target.value })}
                    placeholder="e.g., Widget Assembly Line 3"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location/Shift</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Plant A, 2nd Shift"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Baseline Metrics */}
            <div>
              <Label htmlFor="metrics">Baseline Metrics</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Quantifiable measures (defect rate, PPM, cost, safety severity, etc.)
              </p>
              <Textarea
                id="metrics"
                value={formData.baselineMetrics}
                onChange={(e) => setFormData({ ...formData, baselineMetrics: e.target.value })}
                placeholder="Example:&#10;- Baseline defect rate: 2.1%&#10;- Current defect rate: 8.3%&#10;- Cost impact: $45,000&#10;- Customer complaints: 150 (up from 12)"
                rows={5}
                className="resize-none font-mono text-sm"
              />
            </div>

            <Separator />

            {/* Evidence Links */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label>Evidence Links</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Attach supporting documents, logs, photos, or reports
                  </p>
                </div>
                <Badge variant="outline">{evidenceLinks.length} linked</Badge>
              </div>

              {evidenceLinks.length > 0 && (
                <div className="space-y-2 mb-3">
                  {evidenceLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm flex-1 truncate">{link}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => handleRemoveEvidence(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newEvidenceLink}
                  onChange={(e) => setNewEvidenceLink(e.target.value)}
                  placeholder="Paste evidence URL or reference..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEvidence();
                    }
                  }}
                />
                <Button onClick={handleAddEvidence} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            Save Problem Statement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
