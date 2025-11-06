import { useState } from 'react';
import { ChevronRight, Plus, Trash2, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useRCA } from '../../contexts/RCAContext';
import type { FiveWhyNode, ValidationStatus, CauseCategory } from '../../types/rca';

const statusConfig = {
  'validated': { 
    icon: CheckCircle2, 
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: 'Validated'
  },
  'rejected': { 
    icon: XCircle, 
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Rejected'
  },
  'requires-evidence': { 
    icon: AlertCircle, 
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    label: 'Needs Evidence'
  },
  'pending': { 
    icon: AlertCircle, 
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    label: 'Pending'
  }
};

const categoryColors: Record<CauseCategory, string> = {
  people: 'bg-red-100 text-red-800 border-red-200',
  machine: 'bg-blue-100 text-blue-800 border-blue-200',
  method: 'bg-green-100 text-green-800 border-green-200',
  material: 'bg-amber-100 text-amber-800 border-amber-200',
  measurement: 'bg-purple-100 text-purple-800 border-purple-200',
  environment: 'bg-cyan-100 text-cyan-800 border-cyan-200'
};

const depthColors = [
  'bg-slate-50 border-l-slate-400',
  'bg-blue-50 border-l-blue-500',
  'bg-indigo-50 border-l-indigo-500',
  'bg-violet-50 border-l-violet-500',
  'bg-purple-50 border-l-purple-500',
  'bg-fuchsia-50 border-l-fuchsia-500',
];

interface TreeNodeProps {
  node: FiveWhyNode;
  allNodes: FiveWhyNode[];
  onUpdate: (id: string, updates: Partial<FiveWhyNode>) => void;
  onAdd: (parentId: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  depth: number;
}

function TreeNode({ node, allNodes, onUpdate, onAdd, onDelete, onSelect, isSelected, depth }: TreeNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const children = allNodes.filter(n => n.parentId === node.id);
  const hasChildren = children.length > 0;
  const statusInfo = statusConfig[node.status];
  const StatusIcon = statusInfo.icon;
  const depthColor = depthColors[Math.min(depth, depthColors.length - 1)];

  return (
    <div className="relative max-w-full">
      {/* Connection line to parent */}
      {depth > 0 && (
        <div className="absolute -left-6 top-0 bottom-0 w-px bg-border" />
      )}
      
      <Card 
        className={`
          mb-3 overflow-hidden transition-all border-l-4 cursor-pointer max-w-full
          ${depthColor}
          ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'}
          ${statusInfo.bg}
        `}
        onClick={() => onSelect(node.id)}
      >
        <div className="p-4 max-w-full">
          {/* Header Row */}
          <div className="flex items-start gap-3 mb-3 max-w-full">
            {/* Depth Indicator */}
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-white border-2 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">Why</div>
                <div className="font-bold text-xl">{depth}</div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <Input
                  value={node.text}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdate(node.id, { text: e.target.value });
                  }}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') setIsEditing(false);
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="text-sm"
                  placeholder="Describe why this happened..."
                />
              ) : (
                <div 
                  className="text-sm leading-relaxed min-h-[2.5rem] flex items-center"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  {node.text || <span className="text-muted-foreground italic">Click to add cause...</span>}
                </div>
              )}

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {/* Status Badge */}
                <Badge variant="outline" className={`${statusInfo.color} ${statusInfo.border} gap-1.5`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusInfo.label}
                </Badge>

                {/* Category Badge */}
                {node.causeCategory && (
                  <Badge variant="outline" className={categoryColors[node.causeCategory]}>
                    {node.causeCategory}
                  </Badge>
                )}

                {/* Evidence Badge */}
                {node.evidenceRefs.length > 0 && (
                  <Badge variant="outline" className="gap-1.5">
                    <FileText className="h-3 w-3" />
                    {node.evidenceRefs.length}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(node.id);
                }}
                className="h-8 w-8 p-0"
                title="Add deeper why"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {node.parentId && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Children */}
      {hasChildren && (
        <div className="ml-12 relative max-w-full overflow-hidden">
          {/* Vertical line for children */}
          <div className="absolute -left-6 top-0 bottom-0 w-px bg-border" />
          
          {children.map((child, idx) => (
            <div key={child.id} className="relative max-w-full">
              {/* Horizontal connector */}
              <div className="absolute -left-6 top-6 w-6 h-px bg-border" />
              
              <TreeNode
                node={child}
                allNodes={allNodes}
                onUpdate={onUpdate}
                onAdd={onAdd}
                onDelete={onDelete}
                onSelect={onSelect}
                isSelected={isSelected}
                depth={depth + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FiveWhysEditor() {
  const { project, updateProject, selectedNodeId, setSelectedNodeId } = useRCA();
  const currentTree = project.fiveWhyTrees[0];

  const handleNodeUpdate = (id: string, updates: Partial<FiveWhyNode>) => {
    const updatedNodes = currentTree.nodes.map(n =>
      n.id === id ? { ...n, ...updates } : n
    );
    updateProject({
      fiveWhyTrees: [{ ...currentTree, nodes: updatedNodes }]
    });
  };

  const handleAddNode = (parentId: string) => {
    const parent = currentTree.nodes.find(n => n.id === parentId);
    if (!parent) return;

    const newNode: FiveWhyNode = {
      id: `why-${Date.now()}`,
      parentId,
      text: '',
      status: 'pending',
      evidenceRefs: [],
      depth: parent.depth + 1
    };

    updateProject({
      fiveWhyTrees: [{
        ...currentTree,
        nodes: [...currentTree.nodes, newNode]
      }]
    });
    
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (id: string) => {
    const deleteRecursive = (nodeId: string): string[] => {
      const children = currentTree.nodes.filter(n => n.parentId === nodeId);
      return [nodeId, ...children.flatMap(c => deleteRecursive(c.id))];
    };

    const toDelete = deleteRecursive(id);
    const updatedNodes = currentTree.nodes.filter(n => !toDelete.includes(n.id));

    updateProject({
      fiveWhyTrees: [{ ...currentTree, nodes: updatedNodes }]
    });

    if (selectedNodeId && toDelete.includes(selectedNodeId)) {
      setSelectedNodeId(null);
    }
  };

  const rootNode = currentTree.nodes.find(n => n.parentId === null);
  if (!rootNode) return <div>No root node found</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm p-4 flex-shrink-0">
        <h2 className="mb-1.5">{currentTree.name}</h2>
        <p className="text-sm text-muted-foreground">
          The 5 Whys technique helps identify root causes by iteratively asking "why" to peel back layers of symptoms. 
          Click <Plus className="inline h-3 w-3 mx-1" /> to dig deeper, double-click text to edit.
        </p>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-6 max-w-full">
          <TreeNode
            node={rootNode}
            allNodes={currentTree.nodes}
            onUpdate={handleNodeUpdate}
            onAdd={handleAddNode}
            onDelete={handleDeleteNode}
            onSelect={setSelectedNodeId}
            isSelected={selectedNodeId === rootNode.id}
            depth={0}
          />
        </div>
      </div>
    </div>
  );
}
