import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3, FileText, AlertTriangle, GripVertical, ChevronDown, ChevronRight, Search, ChevronLeft, ChevronRight as ChevronRightIcon, X, Calendar, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useRCA } from '../../contexts/RCAContext';
import type { FishboneNode, FishboneCategory, FishboneTemplateType, Evidence } from '../../types/rca';

// Template definitions (academically grounded)
const TEMPLATES = {
  '6M': {
    id: '6M',
    name: '6M (Manufacturing)',
    type: '6M' as FishboneTemplateType,
    categories: ['People (Man)', 'Machine', 'Method', 'Material', 'Measurement', 'Environment (Mother Nature)'],
    description: 'Classic manufacturing template from Ishikawa'
  },
  '4S': {
    id: '4S',
    name: '4S (Service/Office)',
    type: '4S' as FishboneTemplateType,
    categories: ['Surroundings', 'Suppliers', 'Systems', 'Skills'],
    description: 'Service and office environments'
  },
  '8P': {
    id: '8P',
    name: '8P (Marketing/Service)',
    type: '8P' as FishboneTemplateType,
    categories: ['Product', 'Price', 'Place', 'Promotion', 'People', 'Process', 'Physical Evidence', 'Performance'],
    description: 'Marketing and service industries'
  },
  'Custom': {
    id: 'Custom',
    name: 'Custom',
    type: 'Custom' as FishboneTemplateType,
    categories: [],
    description: 'Define your own categories (4-8 recommended)'
  }
};

const CATEGORY_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'
];

interface LeftPanelProps {
  templateId: string;
  categories: FishboneCategory[];
  onTemplateChange: (templateId: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (id: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onReorderCategories: (fromIndex: number, toIndex: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function LeftPanel({
  templateId,
  categories,
  onTemplateChange,
  onAddCategory,
  onRemoveCategory,
  onRenameCategory,
  onReorderCategories,
  searchQuery,
  onSearchChange,
  isCollapsed,
  onToggleCollapse
}: LeftPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const isCustom = templateId === 'Custom';

  if (isCollapsed) {
    return (
      <div className="w-12 flex-shrink-0 border-r bg-white flex flex-col items-center py-4 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 mb-4"
          title="Expand panel"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <div 
          className="text-xs font-medium text-muted-foreground tracking-wider"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          CATEGORIES
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 flex-shrink-0 border-r bg-white flex flex-col">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Category Template</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
            title="Collapse panel"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <RadioGroup value={templateId} onValueChange={onTemplateChange}>
          {Object.values(TEMPLATES).map((template) => (
            <div key={template.id} className="flex items-start space-x-2 mb-2">
              <RadioGroupItem value={template.id} id={template.id} />
              <div className="flex-1">
                <Label htmlFor={template.id} className="cursor-pointer">
                  {template.name}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>

        {isCustom && (
          <Alert className="mt-3 text-xs">
            <AlertDescription>
              💡 Keep 4–8 primary categories for readability (Ishikawa guidance)
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      <div className="p-4 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Primary Categories</h3>
          {categories.length > 10 && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Too many
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {categories.map((category, index) => (
            <Card key={category.id} className="p-2">
              <div className="flex items-center gap-2">
                {isCustom && (
                  <button className="cursor-move p-1 hover:bg-muted rounded">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}

                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />

                {editingId === category.id ? (
                  <Input
                    value={category.name}
                    onChange={(e) => onRenameCategory(category.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="h-7 text-sm flex-1"
                  />
                ) : (
                  <>
                    <span className="flex-1 text-sm truncate">{category.name}</span>
                    {isCustom && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(category.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveCategory(category.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>

        {isCustom && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddCategory}
            className="w-full mt-3 border-dashed"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Primary Category
          </Button>
        )}

        {categories.length === 0 && isCustom && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-3">
              No categories yet. Click below to start.
            </p>
            <Button size="sm" onClick={onAddCategory}>
              <Plus className="h-4 w-4 mr-1" />
              Add Primary Category
            </Button>
          </div>
        )}

        {categories.length > 10 && (
          <Alert variant="destructive" className="mt-3 text-xs">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Diagrams with many primary categories can be hard to interpret. Consider grouping related causes.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

interface RightPanelProps {
  node: FishboneNode | null;
  evidence: Evidence[];
  isOpen: boolean;
  onUpdateNode: (updates: Partial<FishboneNode>) => void;
  onClose: () => void;
}

function RightPanel({ node, evidence, isOpen, onUpdateNode, onClose }: RightPanelProps) {
  const nodeEvidence = node ? evidence.filter(e => node?.evidenceRefs?.includes(e.id)) : [];

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-96 bg-white border-l shadow-2xl flex flex-col transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      data-panel="right"
    >
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Node Details</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            title="Close panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {node && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label className="text-xs">Cause Name</Label>
              <p className="mt-1 text-sm">{node.text || <span className="text-muted-foreground italic">Unnamed</span>}</p>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-xs">Notes</Label>
              <Textarea
                id="notes"
                value={node.notes || ''}
                onChange={(e) => onUpdateNode({ notes: e.target.value })}
                placeholder="Add detailed notes about this cause..."
                className="mt-1 text-sm min-h-20"
              />
            </div>

            <Separator />

            {/* Severity */}
            <div>
              <Label htmlFor="severity" className="text-xs">Severity</Label>
              <Select
                value={node.severityTag || 'none'}
                onValueChange={(value: 'none' | 'low' | 'medium' | 'high') => 
                  onUpdateNode({ severityTag: value })
                }
              >
                <SelectTrigger id="severity" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Owner */}
            <div>
              <Label htmlFor="owner" className="text-xs">Owner</Label>
              <div className="relative mt-1">
                <User className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="owner"
                  value={node.owner || ''}
                  onChange={(e) => onUpdateNode({ owner: e.target.value })}
                  placeholder="Assign owner..."
                  className="pl-8"
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="dueDate" className="text-xs">Due Date</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dueDate"
                  type="date"
                  value={node.dueDate || ''}
                  onChange={(e) => onUpdateNode({ dueDate: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>

            <Separator />

            {/* Evidence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Evidence</Label>
                <Badge variant="outline" className="text-xs">
                  {nodeEvidence.length}
                </Badge>
              </div>

              {nodeEvidence.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No evidence attached</p>
              ) : (
                <div className="space-y-2">
                  {nodeEvidence.map((item) => (
                    <Card key={item.id} className="p-2">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          )}
                          <Badge variant="outline" className="text-[10px] mt-1">
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            {node.links && node.links.length > 0 && (
              <div>
                <Label className="text-xs">Cross-Method Links</Label>
                <div className="space-y-1 mt-2">
                  {node.links.map((link, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {link.type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface NodeItemProps {
  node: FishboneNode;
  allNodes: FishboneNode[];
  color: string;
  level: number;
  onUpdate: (id: string, updates: Partial<FishboneNode>) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

function NodeItem({
  node,
  allNodes,
  color,
  level,
  onUpdate,
  onDelete,
  onAddChild,
  onSelect,
  isSelected
}: NodeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(!node.text);
  const children = allNodes.filter(n => n.parentId === node.id);
  const hasChildren = children.length > 0;

  return (
    <div className="mb-1">
      <div
        className={`
          group p-1.5 rounded border-l-2 transition-all cursor-pointer text-xs
          ${isSelected 
            ? 'bg-blue-50 border-blue-500 shadow-sm' 
            : 'bg-white/90 hover:bg-white border-gray-300 hover:shadow-sm'
          }
        `}
        style={{ 
          borderLeftColor: isSelected ? color : undefined,
          marginLeft: level * 12
        }}
        onClick={() => onSelect(node.id)}
      >
        {isEditing ? (
          <Input
            value={node.text}
            onChange={(e) => {
              e.stopPropagation();
              onUpdate(node.id, { text: e.target.value });
            }}
            onBlur={() => node.text && setIsEditing(false)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && node.text) setIsEditing(false);
              if (e.key === 'Escape') setIsEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            className="h-6 text-xs"
            placeholder={level === 0 ? "Primary cause..." : "Sub-cause..."}
          />
        ) : (
          <>
            <div className="flex items-start gap-1">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="p-0.5 hover:bg-muted rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}
              
              <p 
                className="flex-1 min-w-0 break-words leading-snug"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                {node.text || <span className="text-muted-foreground italic">Empty</span>}
              </p>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(node.id);
                  }}
                  className="h-5 w-5 p-0"
                  title="Add sub-cause"
                >
                  <Plus className="h-2.5 w-2.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="h-5 w-5 p-0"
                >
                  <Edit3 className="h-2.5 w-2.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                  className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>

            {(node.severityTag && node.severityTag !== 'none' || (node.evidenceRefs && node.evidenceRefs.length > 0)) && (
              <div className="flex items-center gap-1 mt-1 ml-4">
                {node.severityTag && node.severityTag !== 'none' && (
                  <Badge variant="outline" className={`text-[10px] h-4 px-1`}>
                    {node.severityTag}
                  </Badge>
                )}
                {node.evidenceRefs && node.evidenceRefs.length > 0 && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1 gap-0.5">
                    <FileText className="h-2 w-2" />
                    {node.evidenceRefs.length}
                  </Badge>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-0.5">
          {children.map(child => (
            <NodeItem
              key={child.id}
              node={child}
              allNodes={allNodes}
              color={color}
              level={level + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onSelect={onSelect}
              isSelected={isSelected}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FishboneEditor() {
  const { project, updateProject, selectedNodeId, setSelectedNodeId } = useRCA();
  const currentDiagram = project.fishboneDiagrams[0];
  
  const [templateId, setTemplateId] = useState<string>(currentDiagram?.templateId || '6M');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize or migrate diagram structure
  const categories: FishboneCategory[] = useMemo(() => {
    if (!currentDiagram?.categories) return [];
    
    // Check if categories are in new format
    if (currentDiagram.categories.length > 0 && 'order' in currentDiagram.categories[0]) {
      return currentDiagram.categories as FishboneCategory[];
    }
    
    // Migrate old format to new format
    const template = TEMPLATES[templateId as keyof typeof TEMPLATES] || TEMPLATES['6M'];
    return template.categories.map((name, index) => ({
      id: `cat-${index}`,
      name,
      order: index,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }));
  }, [currentDiagram, templateId]);

  const nodes: FishboneNode[] = useMemo(() => {
    if (!currentDiagram?.nodes) {
      // Migrate from old structure
      if (currentDiagram?.categories) {
        const migratedNodes: FishboneNode[] = [];
        currentDiagram.categories.forEach((oldCat: any, catIndex) => {
          if (oldCat.children) {
            oldCat.children.forEach((oldNode: any) => {
              migratedNodes.push({
                id: oldNode.id,
                categoryId: `cat-${catIndex}`,
                text: oldNode.text,
                evidenceRefs: oldNode.evidenceRefs || [],
                owner: oldNode.owner,
                severityTag: oldNode.severityTag || 'none',
                notes: '',
                children: []
              });
            });
          }
        });
        return migratedNodes;
      }
      return [];
    }
    return currentDiagram.nodes;
  }, [currentDiagram]);

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) || null : null;
  const isRightPanelOpen = !!selectedNodeId;

  // Close right panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedNodeId) {
        const target = event.target as HTMLElement;
        // Don't close if clicking inside the right panel or on a node
        if (!target.closest('[data-panel="right"]') && !target.closest('[data-node-item]')) {
          if (canvasRef.current?.contains(target) && !target.closest('[data-cause-panel]')) {
            setSelectedNodeId(null);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedNodeId, setSelectedNodeId]);

  const handleTemplateChange = (newTemplateId: string) => {
    const template = TEMPLATES[newTemplateId as keyof typeof TEMPLATES];
    if (!template) return;

    const newCategories: FishboneCategory[] = template.categories.map((name, index) => ({
      id: `cat-${Date.now()}-${index}`,
      name,
      order: index,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }));

    updateProject({
      fishboneDiagrams: [{
        ...currentDiagram,
        templateId: newTemplateId,
        categories: newCategories,
        nodes: newTemplateId === templateId ? nodes : []
      }]
    });

    setTemplateId(newTemplateId);
  };

  const handleAddCategory = () => {
    const newCategory: FishboneCategory = {
      id: `cat-${Date.now()}`,
      name: `Category ${categories.length + 1}`,
      order: categories.length,
      color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]
    };

    updateProject({
      fishboneDiagrams: [{
        ...currentDiagram,
        categories: [...categories, newCategory]
      }]
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    const updatedNodes = nodes.filter(n => n.categoryId !== categoryId);

    updateProject({
      fishboneDiagrams: [{
        ...currentDiagram,
        categories: updatedCategories,
        nodes: updatedNodes
      }]
    });
  };

  const handleRenameCategory = (categoryId: string, name: string) => {
    const updatedCategories = categories.map(c =>
      c.id === categoryId ? { ...c, name } : c
    );

    updateProject({
      fishboneDiagrams: [{
        ...currentDiagram,
        categories: updatedCategories
      }]
    });
  };

  const handleAddNode = (categoryId: string, parentId?: string) => {
    const newNode: FishboneNode = {
      id: `node-${Date.now()}`,
      categoryId,
      parentId,
      text: '',
      evidenceRefs: [],
      severityTag: 'none'
    };

    updateProject({
      fishboneDiagrams: [{
        ...currentDiagram,
        nodes: [...nodes, newNode]
      }]
    });

    setSelectedNodeId(newNode.id);
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<FishboneNode>) => {
    const updatedNodes = nodes.map(n =>
      n.id === nodeId ? { ...n, ...updates } : n
    );

    updateProject({
      fishboneDiagrams: [{
        ...currentDiagram,
        nodes: updatedNodes
      }]
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    const deleteRecursive = (id: string): string[] => {
      const children = nodes.filter(n => n.parentId === id);
      return [id, ...children.flatMap(c => deleteRecursive(c.id))];
    };

    const toDelete = deleteRecursive(nodeId);
    const updatedNodes = nodes.filter(n => !toDelete.includes(n.id));

    updateProject({
      fishboneDiagrams: [{
        ...currentDiagram,
        nodes: updatedNodes
      }]
    });

    if (selectedNodeId && toDelete.includes(selectedNodeId)) {
      setSelectedNodeId(null);
    }
  };

  // SVG dimensions
  const svgWidth = 1400;
  const svgHeight = 700;
  const spineY = svgHeight / 2;
  const spineStartX = 100;
  const spineEndX = 1200;
  const boneLength = 160;
  const boneAngle = 40;
  
  const boneSpacing = categories.length > 0 ? (spineEndX - spineStartX) / (Math.ceil(categories.length / 2) + 1) : 200;
  const topCategories = categories.filter((_, i) => i % 2 === 0);
  const bottomCategories = categories.filter((_, i) => i % 2 === 1);

  if (!currentDiagram) {
    return <div className="h-full flex items-center justify-center">No diagram found</div>;
  }

  return (
    <div className="h-full flex overflow-hidden relative">
      {/* Left Panel */}
      <LeftPanel
        templateId={templateId}
        categories={categories}
        onTemplateChange={handleTemplateChange}
        onAddCategory={handleAddCategory}
        onRemoveCategory={handleRemoveCategory}
        onRenameCategory={handleRenameCategory}
        onReorderCategories={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isCollapsed={isLeftCollapsed}
        onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
      />

      {/* Canvas */}
      <div ref={canvasRef} className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
        {categories.length === 0 && templateId === 'Custom' ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md p-8">
              <h3 className="text-lg font-medium mb-2">No Categories Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add primary categories using the left panel to start building your fishbone diagram.
              </p>
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Primary Category
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative" style={{ width: svgWidth, height: svgHeight, margin: '40px auto' }}>
            <svg width={svgWidth} height={svgHeight} className="absolute inset-0">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
                </marker>
                <linearGradient id="problemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dbeafe" />
                  <stop offset="100%" stopColor="#bfdbfe" />
                </linearGradient>
              </defs>

              {/* Main Spine */}
              <line
                x1={spineStartX}
                y1={spineY}
                x2={spineEndX}
                y2={spineY}
                stroke="#64748b"
                strokeWidth="3"
                markerEnd="url(#arrowhead)"
              />

              {/* Top Bones */}
              {topCategories.map((category, idx) => {
                const x = spineStartX + boneSpacing * (idx + 1);
                const boneEndX = x - boneLength * Math.cos((boneAngle * Math.PI) / 180);
                const boneEndY = spineY - boneLength * Math.sin((boneAngle * Math.PI) / 180);

                return (
                  <g key={category.id}>
                    <line
                      x1={x}
                      y1={spineY}
                      x2={boneEndX}
                      y2={boneEndY}
                      stroke={category.color}
                      strokeWidth="2.5"
                    />
                    <rect
                      x={boneEndX - 60}
                      y={boneEndY - 24}
                      width="120"
                      height="28"
                      rx="6"
                      fill={category.color}
                    />
                    <text
                      x={boneEndX}
                      y={boneEndY - 5}
                      textAnchor="middle"
                      className="text-white font-medium"
                      style={{ fontSize: '12px' }}
                    >
                      {category.name}
                    </text>
                  </g>
                );
              })}

              {/* Bottom Bones */}
              {bottomCategories.map((category, idx) => {
                const x = spineStartX + boneSpacing * (idx + 1);
                const boneEndX = x - boneLength * Math.cos((boneAngle * Math.PI) / 180);
                const boneEndY = spineY + boneLength * Math.sin((boneAngle * Math.PI) / 180);

                return (
                  <g key={category.id}>
                    <line
                      x1={x}
                      y1={spineY}
                      x2={boneEndX}
                      y2={boneEndY}
                      stroke={category.color}
                      strokeWidth="2.5"
                    />
                    <rect
                      x={boneEndX - 60}
                      y={boneEndY - 4}
                      width="120"
                      height="28"
                      rx="6"
                      fill={category.color}
                    />
                    <text
                      x={boneEndX}
                      y={boneEndY + 16}
                      textAnchor="middle"
                      className="text-white font-medium"
                      style={{ fontSize: '12px' }}
                    >
                      {category.name}
                    </text>
                  </g>
                );
              })}

              {/* Problem (Fish Head) */}
              <circle
                cx={spineEndX + 40}
                cy={spineY}
                r="50"
                fill="url(#problemGradient)"
                stroke="#3b82f6"
                strokeWidth="3"
              />

              <text
                x={spineEndX + 40}
                y={spineY - 5}
                textAnchor="middle"
                className="text-muted-foreground"
                style={{ fontSize: '10px' }}
              >
                PROBLEM
              </text>
              <text
                x={spineEndX + 40}
                y={spineY + 8}
                textAnchor="middle"
                className="font-medium"
                style={{ fontSize: '11px' }}
              >
                {currentDiagram.problem.length > 12 
                  ? currentDiagram.problem.substring(0, 12) + '...' 
                  : currentDiagram.problem}
              </text>
            </svg>

            {/* Cause Lists - Top Categories */}
            {topCategories.map((category, idx) => {
              const x = spineStartX + boneSpacing * (idx + 1);
              const boneEndX = x - boneLength * Math.cos((boneAngle * Math.PI) / 180);
              const boneEndY = spineY - boneLength * Math.sin((boneAngle * Math.PI) / 180);
              const categoryNodes = nodes.filter(n => n.categoryId === category.id && !n.parentId);

              return (
                <div
                  key={category.id}
                  data-cause-panel
                  className="absolute bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border-2 p-2"
                  style={{
                    left: boneEndX - 90,
                    top: boneEndY - 200,
                    width: '200px',
                    maxHeight: '170px',
                    borderColor: category.color,
                    overflowY: 'auto'
                  }}
                >
                  <div className="space-y-1">
                    {categoryNodes.map((node) => (
                      <div key={node.id} data-node-item>
                        <NodeItem
                          node={node}
                          allNodes={nodes}
                          color={category.color}
                          level={0}
                          onUpdate={handleUpdateNode}
                          onDelete={handleDeleteNode}
                          onAddChild={(parentId) => handleAddNode(category.id, parentId)}
                          onSelect={setSelectedNodeId}
                          isSelected={selectedNodeId === node.id}
                        />
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddNode(category.id)}
                      className="w-full h-7 text-xs border-dashed"
                      style={{ borderColor: category.color, color: category.color }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Cause
                    </Button>
                    
                    {categoryNodes.length === 0 && (
                      <p className="text-center text-muted-foreground text-[10px] py-2">
                        No causes yet
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Cause Lists - Bottom Categories */}
            {bottomCategories.map((category, idx) => {
              const x = spineStartX + boneSpacing * (idx + 1);
              const boneEndX = x - boneLength * Math.cos((boneAngle * Math.PI) / 180);
              const boneEndY = spineY + boneLength * Math.sin((boneAngle * Math.PI) / 180);
              const categoryNodes = nodes.filter(n => n.categoryId === category.id && !n.parentId);

              return (
                <div
                  key={category.id}
                  data-cause-panel
                  className="absolute bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border-2 p-2"
                  style={{
                    left: boneEndX - 90,
                    top: boneEndY + 30,
                    width: '200px',
                    maxHeight: '170px',
                    borderColor: category.color,
                    overflowY: 'auto'
                  }}
                >
                  <div className="space-y-1">
                    {categoryNodes.map((node) => (
                      <div key={node.id} data-node-item>
                        <NodeItem
                          node={node}
                          allNodes={nodes}
                          color={category.color}
                          level={0}
                          onUpdate={handleUpdateNode}
                          onDelete={handleDeleteNode}
                          onAddChild={(parentId) => handleAddNode(category.id, parentId)}
                          onSelect={setSelectedNodeId}
                          isSelected={selectedNodeId === node.id}
                        />
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddNode(category.id)}
                      className="w-full h-7 text-xs border-dashed"
                      style={{ borderColor: category.color, color: category.color }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Cause
                    </Button>
                    
                    {categoryNodes.length === 0 && (
                      <p className="text-center text-muted-foreground text-[10px] py-2">
                        No causes yet
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Panel - Slides from right */}
      <RightPanel
        node={selectedNode}
        evidence={project.evidence}
        isOpen={isRightPanelOpen}
        onUpdateNode={(updates) => selectedNode && handleUpdateNode(selectedNode.id, updates)}
        onClose={() => setSelectedNodeId(null)}
      />
    </div>
  );
}
