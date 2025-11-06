import { FolderTree, FileText, GitBranch, BarChart3, Table, GitFork, Grid3x3, ScatterChart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useRCA } from '../../contexts/RCAContext';
import type { RCAMethod } from '../../types/rca';

const methodIcons: Record<RCAMethod, any> = {
  '5whys': GitBranch,
  'fishbone': GitFork,
  'pareto': BarChart3,
  'fmea': Table,
  'fta': FolderTree,
  'affinity': Grid3x3,
  'scatter': ScatterChart
};

interface NavigatorProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Navigator({ isCollapsed, onToggleCollapse }: NavigatorProps) {
  const { project, currentMethod } = useRCA();

  const getMethodCount = (method: RCAMethod) => {
    switch (method) {
      case '5whys':
        return project.fiveWhyTrees.length;
      case 'fishbone':
        return project.fishboneDiagrams.length;
      case 'pareto':
        return project.paretoAnalyses.length;
      case 'fmea':
        return project.fmeaAnalyses.length;
      case 'fta':
        return project.faultTrees.length;
      case 'affinity':
        return project.affinityDiagrams.length;
      case 'scatter':
        return project.scatterAnalyses.length;
      default:
        return 0;
    }
  };

  const getCurrentItems = () => {
    switch (currentMethod) {
      case '5whys':
        return project.fiveWhyTrees.map(t => ({ id: t.id, name: t.name }));
      case 'fishbone':
        return project.fishboneDiagrams.map(d => ({ id: d.id, name: d.name }));
      case 'pareto':
        return project.paretoAnalyses.map(a => ({ id: a.id, name: a.name }));
      case 'fmea':
        return project.fmeaAnalyses.map(a => ({ id: a.id, name: a.name }));
      case 'fta':
        return project.faultTrees.map(t => ({ id: t.id, name: t.name }));
      case 'affinity':
        return project.affinityDiagrams.map(d => ({ id: d.id, name: d.name }));
      case 'scatter':
        return project.scatterAnalyses.map(a => ({ id: a.id, name: a.name }));
      default:
        return [];
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 flex-shrink-0 border-r bg-background flex flex-col items-center py-4 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 mb-4"
          title="Expand Navigator"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div 
          className="text-xs font-medium text-muted-foreground tracking-wider"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          NAVIGATOR
        </div>
      </div>
    );
  }

  const Icon = methodIcons[currentMethod];
  const items = getCurrentItems();

  return (
    <div className="w-64 flex-shrink-0 border-r bg-background flex flex-col">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h3>Navigator</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
            title="Collapse Navigator"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Browse artifacts and templates</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Current Method Items */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">Current Method</span>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            <div className="space-y-1">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer text-sm"
                >
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 truncate min-w-0">{item.name}</span>
                  <Badge variant="outline" className="flex-shrink-0">{index + 1}</Badge>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">No items yet</p>
              )}
            </div>
          </div>

          <Separator />

          {/* All Methods Summary */}
          <div>
            <span className="text-sm font-medium mb-2 block">All Methods</span>
            <div className="space-y-1">
              {(Object.keys(methodIcons) as RCAMethod[]).map(method => {
                const MethodIcon = methodIcons[method];
                const count = getMethodCount(method);
                return (
                  <div
                    key={method}
                    className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted cursor-pointer text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MethodIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="capitalize truncate">{method === '5whys' ? '5 Whys' : method}</span>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Evidence & Actions */}
          <div>
            <span className="text-sm font-medium mb-2 block">Cross-Method</span>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted cursor-pointer text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">Evidence Vault</span>
                </div>
                <Badge variant="outline" className="flex-shrink-0">{project.evidence.length}</Badge>
              </div>
              <div className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted cursor-pointer text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">CAPA Actions</span>
                </div>
                <Badge variant="outline" className="flex-shrink-0">{project.actions.length}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Templates */}
          <div>
            <span className="text-sm font-medium mb-2 block">Templates</span>
            <div className="space-y-1">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer text-sm">
                <FolderTree className="h-4 w-4 text-muted-foreground" />
                <span>6M Categories</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer text-sm">
                <FolderTree className="h-4 w-4 text-muted-foreground" />
                <span>Standard Gates</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
