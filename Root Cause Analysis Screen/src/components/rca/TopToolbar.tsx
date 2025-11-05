import { ArrowLeft, Share2, Download, History, Undo, Redo, Database, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Label } from '../ui/label';
import { useRCA } from '../../contexts/RCAContext';
import { useState } from 'react';
import { Badge } from '../ui/badge';

interface TopToolbarProps {
  onExport: () => void;
  onConsistencyReport: () => void;
}

export function TopToolbar({ onExport, onConsistencyReport }: TopToolbarProps) {
  const { project, updateProject, canUndo, canRedo, undo, redo } = useRCA();
  const [isEditingProblem, setIsEditingProblem] = useState(false);

  const handleTitleChange = (title: string) => {
    updateProject({ title });
  };

  const handleProblemChange = (problemStatement: string) => {
    updateProject({ problemStatement });
  };

  const validationIssues = 3; // Mock count

  return (
    <div className="border-b bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <Input
              value={project.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="h-8 border-0 px-2 -ml-2"
              aria-label="Project title"
            />
            <Popover open={isEditingProblem} onOpenChange={setIsEditingProblem}>
              <PopoverTrigger asChild>
                <button className="text-left text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors">
                  {project.problemStatement || 'Click to define problem statement'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96" align="start">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="problem-statement">Problem Statement</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      State the specific, observable problem and its boundaries.
                    </p>
                  </div>
                  <Textarea
                    id="problem-statement"
                    value={project.problemStatement}
                    onChange={(e) => handleProblemChange(e.target.value)}
                    placeholder="Describe the problem clearly and concisely..."
                    rows={4}
                  />
                  <Button onClick={() => setIsEditingProblem(false)} className="w-full">
                    Save
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            Dataset
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Version history">
                <History className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-2 py-1.5">
                <p className="text-sm">Version History</p>
                <p className="text-xs text-muted-foreground">0 saved versions</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                No versions saved yet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={validationIssues > 0 ? "outline" : "ghost"}
            size="sm"
            onClick={onConsistencyReport}
            className={validationIssues > 0 ? "border-orange-500 text-orange-500" : ""}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Consistency
            {validationIssues > 0 && (
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                {validationIssues}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport()}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport()}>
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport()}>
                Export as CSV/XLSX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport()}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
