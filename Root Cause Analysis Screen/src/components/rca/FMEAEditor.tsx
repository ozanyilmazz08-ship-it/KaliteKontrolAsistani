import React, { useState } from 'react';
import { Plus, Search, Filter, Settings2, Download, Upload, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, AlertTriangle, Info, Trash2, MoreHorizontal, X, TrendingUp, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { useRCA } from '../../contexts/RCAContext';
import type { FMEAItem, Evidence } from '../../types/rca';

// AP (Action Priority) calculation based on AIAG-VDA
const calculateAP = (severity: number, occurrence: number, detection: number): 'High' | 'Medium' | 'Low' => {
  if (severity >= 9 || (severity >= 7 && occurrence >= 7) || (severity >= 7 && detection >= 7)) {
    return 'High';
  }
  if (severity <= 3 && occurrence <= 3) {
    return 'Low';
  }
  return 'Medium';
};

const getRPNColor = (rpn: number) => {
  if (rpn >= 200) return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm';
  if (rpn >= 100) return 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm';
  if (rpn >= 50) return 'bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 shadow-sm';
  return 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm';
};

const getAPColor = (ap: 'High' | 'Medium' | 'Low') => {
  if (ap === 'High') return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm';
  if (ap === 'Medium') return 'bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 shadow-sm';
  return 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm';
};

const statusConfig = {
  'open': { 
    label: 'Open', 
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Circle,
    dotColor: 'bg-slate-500'
  },
  'in-progress': { 
    label: 'In Progress', 
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: Clock,
    dotColor: 'bg-blue-500'
  },
  'completed': { 
    label: 'Completed', 
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: CheckCircle2,
    dotColor: 'bg-green-500'
  },
  'verified': { 
    label: 'Verified', 
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: CheckCircle2,
    dotColor: 'bg-purple-500'
  }
};

// Rating criteria
const severityCriteria = [
  { value: 10, label: 'Hazardous - without warning', color: 'bg-red-600' },
  { value: 9, label: 'Hazardous - with warning', color: 'bg-red-500' },
  { value: 8, label: 'Very high - loss of primary function', color: 'bg-orange-600' },
  { value: 7, label: 'High - degraded performance', color: 'bg-orange-500' },
  { value: 6, label: 'Moderate - significant deterioration', color: 'bg-amber-500' },
  { value: 5, label: 'Low - some deterioration', color: 'bg-yellow-500' },
  { value: 4, label: 'Very low - minor effect', color: 'bg-lime-500' },
  { value: 3, label: 'Minor - barely noticeable', color: 'bg-green-500' },
  { value: 2, label: 'Very minor - slight inconvenience', color: 'bg-emerald-500' },
  { value: 1, label: 'None - no effect', color: 'bg-teal-500' },
];

const occurrenceCriteria = [
  { value: 10, label: 'Very high - ≥1 in 2', color: 'bg-red-600' },
  { value: 9, label: 'Very high - 1 in 3', color: 'bg-red-500' },
  { value: 8, label: 'High - 1 in 8', color: 'bg-orange-600' },
  { value: 7, label: 'High - 1 in 20', color: 'bg-orange-500' },
  { value: 6, label: 'Moderate - 1 in 80', color: 'bg-amber-500' },
  { value: 5, label: 'Moderate - 1 in 400', color: 'bg-yellow-500' },
  { value: 4, label: 'Low - 1 in 2,000', color: 'bg-lime-500' },
  { value: 3, label: 'Low - 1 in 15,000', color: 'bg-green-500' },
  { value: 2, label: 'Remote - 1 in 150,000', color: 'bg-emerald-500' },
  { value: 1, label: 'Nearly impossible - <1 in 1,500,000', color: 'bg-teal-500' },
];

const detectionCriteria = [
  { value: 10, label: 'Absolute uncertainty - no controls', color: 'bg-red-600' },
  { value: 9, label: 'Very remote - controls unlikely', color: 'bg-red-500' },
  { value: 8, label: 'Remote - weak controls', color: 'bg-orange-600' },
  { value: 7, label: 'Very low - manual inspection', color: 'bg-orange-500' },
  { value: 6, label: 'Low - statistical sampling', color: 'bg-amber-500' },
  { value: 5, label: 'Moderate - process monitoring', color: 'bg-yellow-500' },
  { value: 4, label: 'Moderately high - error proofing', color: 'bg-lime-500' },
  { value: 3, label: 'High - automated detection', color: 'bg-green-500' },
  { value: 2, label: 'Very high - fail-safe design', color: 'bg-emerald-500' },
  { value: 1, label: 'Almost certain - defect prevention', color: 'bg-teal-500' },
];

// Modern Rating Picker with visual indicators
function RatingPicker({ 
  value, 
  onChange, 
  criteria, 
  label,
  type
}: { 
  value: number; 
  onChange: (value: number) => void; 
  criteria: typeof severityCriteria;
  label: string;
  type: 'S' | 'O' | 'D';
}) {
  const [open, setOpen] = useState(false);
  const selectedCriterion = criteria.find(c => c.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          className={`group relative h-10 w-10 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-md ${
            selectedCriterion?.color || 'bg-slate-200'
          } text-white flex items-center justify-center`}
        >
          {value}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-slate-100">
          <h4 className="font-semibold mb-1">{label}</h4>
          <p className="text-xs text-muted-foreground">Select rating based on organizational criteria</p>
        </div>
        <ScrollArea className="max-h-80">
          <div className="p-2">
            {criteria.map((criterion) => (
              <button
                key={criterion.value}
                onClick={() => {
                  onChange(criterion.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all hover:scale-[1.02] ${
                  value === criterion.value 
                    ? 'ring-2 ring-primary ring-offset-2' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${criterion.color} text-white flex items-center justify-center font-semibold shadow-sm`}>
                    {criterion.value}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{criterion.label}</div>
                  </div>
                  {value === criterion.value && (
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Editable Cell Component
function EditableCell({
  value,
  onSave,
  placeholder = 'Enter value...',
  multiline = false
}: {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  if (isEditing) {
    if (multiline) {
      return (
        <Textarea
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditValue(value);
              setIsEditing(false);
            }
          }}
          className="min-h-[60px] text-sm"
          placeholder={placeholder}
        />
      );
    }
    return (
      <Input
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') {
            setEditValue(value);
            setIsEditing(false);
          }
        }}
        className="h-9 text-sm"
        placeholder={placeholder}
      />
    );
  }

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="min-h-9 flex items-center px-2 -mx-2 rounded cursor-text hover:bg-slate-50 transition-colors group"
    >
      {value || <span className="text-muted-foreground italic">{placeholder}</span>}
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <Info className="h-3 w-3 text-muted-foreground" />
      </div>
    </div>
  );
}

export function FMEAEditor() {
  const { project, updateProject, setSelectedNodeId, selectedNodeId, addEvidence } = useRCA();
  const currentAnalysis = project.fmeaAnalyses[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAP, setFilterAP] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('table');
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState(false);
  const [isMatrixFullscreen, setIsMatrixFullscreen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    step: true,
    function: true,
    failureMode: true,
    effect: true,
    severity: true,
    cause: true,
    occurrence: true,
    prevention: true,
    detection: true,
    detectionRating: true,
    rpn: true,
    ap: true,
    actions: true,
    owner: true,
    dueDate: true,
    status: true,
  });

  const itemsWithAP = currentAnalysis.items.map(item => ({
    ...item,
    ap: calculateAP(item.severity, item.occurrence, item.detection)
  }));

  const filteredItems = itemsWithAP.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.failureMode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cause.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesAP = filterAP === 'all' || item.ap === filterAP;
    
    return matchesSearch && matchesStatus && matchesAP;
  });

  const selectedItem = filteredItems.find(item => item.id === selectedNodeId);
  const linkedEvidence = selectedNodeId 
    ? project.evidence.filter(e => e.linkedTo.includes(selectedNodeId))
    : [];

  const handleUpdateItem = (id: string, updates: Partial<FMEAItem>) => {
    const updatedItems = currentAnalysis.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        if ('severity' in updates || 'occurrence' in updates || 'detection' in updates) {
          updated.rpn = updated.severity * updated.occurrence * updated.detection;
        }
        return updated;
      }
      return item;
    });

    updateProject({
      fmeaAnalyses: [{
        ...currentAnalysis,
        items: updatedItems
      }]
    });
  };

  const handleAddItem = () => {
    const newItem: FMEAItem = {
      id: `fmea-item-${Date.now()}`,
      step: '',
      function: '',
      failureMode: 'New Failure Mode',
      effect: '',
      severity: 5,
      cause: '',
      occurrence: 5,
      currentControlsPrev: '',
      currentControlsDet: '',
      detection: 5,
      rpn: 125,
      recommendedActions: '',
      actionOwner: '',
      targetDate: '',
      status: 'open',
      evidenceRefs: []
    };

    updateProject({
      fmeaAnalyses: [{
        ...currentAnalysis,
        items: [...currentAnalysis.items, newItem]
      }]
    });

    setSelectedNodeId(newItem.id);
  };

  const handleDeleteItem = (id: string) => {
    updateProject({
      fmeaAnalyses: [{
        ...currentAnalysis,
        items: currentAnalysis.items.filter(item => item.id !== id)
      }]
    });
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  };

  const actionBoardGroups = {
    open: filteredItems.filter(i => i.status === 'open'),
    'in-progress': filteredItems.filter(i => i.status === 'in-progress'),
    completed: filteredItems.filter(i => i.status === 'completed'),
    verified: filteredItems.filter(i => i.status === 'verified'),
  };

  return (
    <div className="h-full flex bg-slate-50/50">
      {/* Left Panel - Navigator */}
      {isNavigatorCollapsed ? (
        <div className="w-12 flex-shrink-0 border-r bg-white flex flex-col items-center py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNavigatorCollapsed(false)}
            className="h-8 w-8 p-0 mb-4"
            title="Expand Structure"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div 
            className="text-xs font-medium text-muted-foreground tracking-wider"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            STRUCTURE
          </div>
        </div>
      ) : (
        <div className="w-72 border-r flex flex-col bg-white">
          <div className="p-5 border-b bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600">Analysis Structure</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNavigatorCollapsed(true)}
                className="h-8 w-8 p-0"
                title="Collapse Structure"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <Select defaultValue="system">
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Full System</SelectItem>
                <SelectItem value="subsystem1">Subsystem A</SelectItem>
                <SelectItem value="subsystem2">Subsystem B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="font-medium">All Items</span>
                </div>
                <Badge variant="secondary" className="px-2.5 py-0.5">
                  {filteredItems.length}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 rounded-lg bg-red-50 border border-red-100">
                  <div className="font-semibold text-red-700">{filteredItems.filter(i => i.ap === 'High').length}</div>
                  <div className="text-red-600">High</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="font-semibold text-amber-700">{filteredItems.filter(i => i.ap === 'Medium').length}</div>
                  <div className="text-amber-600">Medium</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="font-semibold text-emerald-700">{filteredItems.filter(i => i.ap === 'Low').length}</div>
                  <div className="text-emerald-600">Low</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                Status Overview
              </h4>
              <div className="space-y-2 text-sm">
                {(['open', 'in-progress', 'completed', 'verified'] as const).map(status => {
                  const count = filteredItems.filter(i => i.status === status).length;
                  const StatusIcon = statusConfig[status].icon;
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4 text-slate-500" />
                        <span>{statusConfig[status].label}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{count}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
        </div>
      )}

      {/* Center - Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        {!isMatrixFullscreen && (
        <div className="p-6 border-b flex-shrink-0 bg-gradient-to-b from-white to-slate-50/30">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl">{currentAnalysis.name}</h2>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {currentAnalysis.type === 'design' ? 'DFMEA' : 'PFMEA'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  {filteredItems.length} total items
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  {filteredItems.filter(i => i.ap === 'High').length} high priority
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                  {filteredItems.filter(i => i.rpn >= 100).length} critical RPN
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="shadow-sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" className="shadow-sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleAddItem} className="shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Filters and View Controls */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search failure modes, causes, effects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white shadow-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 bg-white shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAP} onValueChange={setFilterAP}>
              <SelectTrigger className="w-44 bg-white shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High AP</SelectItem>
                <SelectItem value="Medium">Medium AP</SelectItem>
                <SelectItem value="Low">Low AP</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="shadow-sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {Object.entries(visibleColumns).map(([key, visible]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={visible}
                    onCheckedChange={(checked) => 
                      setVisibleColumns(prev => ({ ...prev, [key]: checked }))
                    }
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          if (value !== 'matrix') {
            setIsMatrixFullscreen(false);
          }
        }} className="flex-1 flex flex-col overflow-hidden">
          {!isMatrixFullscreen && (
          <div className="px-6 border-b bg-white">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="table" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Table View
              </TabsTrigger>
              <TabsTrigger value="matrix" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Risk Matrix
              </TabsTrigger>
              <TabsTrigger value="board" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Action Board
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Dashboard
              </TabsTrigger>
            </TabsList>
          </div>
          )}

          {/* Table View */}
          <TabsContent value="table" className="flex-1 overflow-hidden m-0 p-0">
            <div className="h-full w-full overflow-auto relative">
              <div className="p-6 pt-4 min-w-min">
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-slate-50">
                        <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-50 hover:to-slate-100">
                          <TableHead className="w-12 sticky left-0 bg-slate-50 z-20 border-r"></TableHead>
                          {visibleColumns.step && <TableHead className="w-32">Step</TableHead>}
                          {visibleColumns.function && <TableHead className="w-32">Function</TableHead>}
                          {visibleColumns.failureMode && <TableHead className="min-w-[160px]">Failure Mode</TableHead>}
                          {visibleColumns.effect && <TableHead className="w-36">Effects</TableHead>}
                          {visibleColumns.severity && <TableHead className="w-16 text-center">S</TableHead>}
                          {visibleColumns.cause && <TableHead className="w-36">Cause</TableHead>}
                          {visibleColumns.occurrence && <TableHead className="w-16 text-center">O</TableHead>}
                          {visibleColumns.prevention && <TableHead className="w-36">Prevention</TableHead>}
                          {visibleColumns.detectionRating && <TableHead className="w-16 text-center">D</TableHead>}
                          {visibleColumns.rpn && <TableHead className="w-20 text-center">RPN</TableHead>}
                          {visibleColumns.ap && <TableHead className="w-20 text-center">AP</TableHead>}
                          {visibleColumns.actions && <TableHead className="w-40">Actions</TableHead>}
                          {visibleColumns.owner && <TableHead className="w-28">Owner</TableHead>}
                          {visibleColumns.dueDate && <TableHead className="w-28">Due</TableHead>}
                          {visibleColumns.status && <TableHead className="w-32">Status</TableHead>}
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={20} className="h-40 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <AlertTriangle className="h-8 w-8 text-slate-400" />
                              </div>
                              <p className="font-medium">No FMEA items found</p>
                              <p className="text-sm mt-1">Add a new item or adjust your filters</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredItems.map((item, index) => {
                          const itemEvidence = project.evidence.filter(e => e.linkedTo.includes(item.id));
                          const isSelected = selectedNodeId === item.id;
                          return (
                            <TableRow 
                              key={item.id}
                              className={`cursor-pointer transition-all hover:bg-slate-50 ${
                                isSelected 
                                  ? 'bg-blue-50/50 border-l-4 border-l-blue-600' 
                                  : 'border-l-4 border-l-transparent'
                              } ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                              onClick={() => setSelectedNodeId(item.id)}
                            >
                              <TableCell className="sticky left-0 z-10 bg-inherit border-r">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </TableCell>
                              
                              {visibleColumns.step && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <EditableCell
                                    value={item.step}
                                    onSave={(value) => handleUpdateItem(item.id, { step: value })}
                                    placeholder="Enter step..."
                                  />
                                </TableCell>
                              )}
                              
                              {visibleColumns.function && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <EditableCell
                                    value={item.function}
                                    onSave={(value) => handleUpdateItem(item.id, { function: value })}
                                    placeholder="Enter function..."
                                  />
                                </TableCell>
                              )}
                              
                              {visibleColumns.failureMode && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <EditableCell
                                    value={item.failureMode}
                                    onSave={(value) => handleUpdateItem(item.id, { failureMode: value })}
                                    placeholder="Enter failure mode..."
                                  />
                                </TableCell>
                              )}
                              
                              {visibleColumns.effect && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <EditableCell
                                    value={item.effect}
                                    onSave={(value) => handleUpdateItem(item.id, { effect: value })}
                                    placeholder="Enter effect..."
                                    multiline
                                  />
                                </TableCell>
                              )}
                              
                              {visibleColumns.severity && (
                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-center">
                                    <RatingPicker
                                      value={item.severity}
                                      onChange={(value) => handleUpdateItem(item.id, { severity: value })}
                                      criteria={severityCriteria}
                                      label="Severity (S)"
                                      type="S"
                                    />
                                  </div>
                                </TableCell>
                              )}
                              
                              {visibleColumns.cause && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <EditableCell
                                    value={item.cause}
                                    onSave={(value) => handleUpdateItem(item.id, { cause: value })}
                                    placeholder="Enter cause..."
                                    multiline
                                  />
                                </TableCell>
                              )}
                              
                              {visibleColumns.occurrence && (
                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-center">
                                    <RatingPicker
                                      value={item.occurrence}
                                      onChange={(value) => handleUpdateItem(item.id, { occurrence: value })}
                                      criteria={occurrenceCriteria}
                                      label="Occurrence (O)"
                                      type="O"
                                    />
                                  </div>
                                </TableCell>
                              )}
                              
                              {visibleColumns.prevention && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <EditableCell
                                    value={item.currentControlsPrev}
                                    onSave={(value) => handleUpdateItem(item.id, { currentControlsPrev: value })}
                                    placeholder="Enter prevention..."
                                    multiline
                                  />
                                </TableCell>
                              )}
                              
                              {visibleColumns.detectionRating && (
                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-center">
                                    <RatingPicker
                                      value={item.detection}
                                      onChange={(value) => handleUpdateItem(item.id, { detection: value })}
                                      criteria={detectionCriteria}
                                      label="Detection (D)"
                                      type="D"
                                    />
                                  </div>
                                </TableCell>
                              )}
                              
                              {visibleColumns.rpn && (
                                <TableCell className="text-center">
                                  <div className="flex justify-center">
                                    <Badge className={`${getRPNColor(item.rpn)} px-3 py-1.5 font-semibold`}>
                                      {item.rpn}
                                    </Badge>
                                  </div>
                                </TableCell>
                              )}
                              
                              {visibleColumns.ap && (
                                <TableCell className="text-center">
                                  <div className="flex justify-center">
                                    <Badge className={`${getAPColor(item.ap)} px-3 py-1.5 font-semibold`}>
                                      {item.ap}
                                    </Badge>
                                  </div>
                                </TableCell>
                              )}
                              
                              {visibleColumns.actions && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <EditableCell
                                    value={item.recommendedActions}
                                    onSave={(value) => handleUpdateItem(item.id, { recommendedActions: value })}
                                    placeholder="Enter actions..."
                                    multiline
                                  />
                                </TableCell>
                              )}
                              
                              {visibleColumns.owner && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <EditableCell
                                    value={item.actionOwner}
                                    onSave={(value) => handleUpdateItem(item.id, { actionOwner: value })}
                                    placeholder="Assign owner..."
                                  />
                                </TableCell>
                              )}
                              
                              {visibleColumns.dueDate && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    type="date"
                                    value={item.targetDate}
                                    onChange={(e) => handleUpdateItem(item.id, { targetDate: e.target.value })}
                                    className="h-9 text-sm"
                                  />
                                </TableCell>
                              )}
                              
                              {visibleColumns.status && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <Select
                                    value={item.status}
                                    onValueChange={(value) => handleUpdateItem(item.id, { status: value as FMEAItem['status'] })}
                                  >
                                    <SelectTrigger className="h-9 text-sm">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${statusConfig[item.status].dotColor}`}></div>
                                        <SelectValue />
                                      </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(['open', 'in-progress', 'completed', 'verified'] as const).map(status => {
                                        const StatusIcon = statusConfig[status].icon;
                                        return (
                                          <SelectItem key={status} value={status}>
                                            <div className="flex items-center gap-2">
                                              <StatusIcon className="h-3.5 w-3.5" />
                                              {statusConfig[status].label}
                                            </div>
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              )}
                              
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedNodeId(item.id)}>
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => handleDeleteItem(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Risk Matrix View */}
          <TabsContent value="matrix" className="flex-1 overflow-hidden m-0 p-6 relative">
            {/* Fullscreen Toggle Button - Elegant minimal design */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMatrixFullscreen(!isMatrixFullscreen)}
              className="absolute top-8 right-8 z-10 shadow-md bg-white/90 hover:bg-white border border-slate-200 rounded-full px-3 py-2 transition-all hover:shadow-lg backdrop-blur-sm"
              title={isMatrixFullscreen ? "Show header" : "Hide header"}
            >
              {isMatrixFullscreen ? (
                <ChevronDown className="h-4 w-4 text-slate-600" />
              ) : (
                <ChevronUp className="h-4 w-4 text-slate-600" />
              )}
            </Button>
            {!isMatrixFullscreen ? (
              <ScrollArea className="h-full">
                <div className="h-full flex items-center justify-center py-8">
                  <Card className="w-full shadow-lg border-0 max-w-4xl">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                      <CardTitle>Severity × Occurrence Risk Matrix</CardTitle>
                      <CardDescription>Heat map visualization of risk distribution across the analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-11 gap-2">
                    <div></div>
                    {[1,2,3,4,5,6,7,8,9,10].map(o => (
                      <div key={o} className="text-center text-xs font-semibold text-slate-600 p-2">
                        O={o}
                      </div>
                    ))}
                    {[10,9,8,7,6,5,4,3,2,1].map(s => (
                      <React.Fragment key={`row-${s}`}>
                        <div className="text-right text-xs font-semibold text-slate-600 p-2 flex items-center justify-end">
                          S={s}
                        </div>
                        {[1,2,3,4,5,6,7,8,9,10].map(o => {
                          const count = filteredItems.filter(i => i.severity === s && i.occurrence === o).length;
                          const rpn = s * o * 5;
                          return (
                            <div
                              key={`${s}-${o}`}
                              className={`aspect-square rounded-lg flex items-center justify-center font-semibold text-sm transition-transform hover:scale-110 cursor-pointer shadow-sm ${
                                rpn >= 200 ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' :
                                rpn >= 100 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' :
                                rpn >= 50 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950' :
                                'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white'
                              }`}
                            >
                              {count > 0 ? count : ''}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                      <div className="mt-8 flex items-center justify-center gap-8 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-gradient-to-br from-red-500 to-red-600 shadow-sm"></div>
                          <span className="text-sm">Critical (RPN ≥200)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm"></div>
                          <span className="text-sm">High (100-199)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-400 to-amber-500 shadow-sm"></div>
                          <span className="text-sm">Medium (50-99)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-sm"></div>
                          <span className="text-sm">Low (&lt;50)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Card className="w-full shadow-lg border-0 max-w-3xl">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-11 gap-1">
                      <div></div>
                      {[1,2,3,4,5,6,7,8,9,10].map(o => (
                        <div key={o} className="text-center text-xs font-semibold text-slate-600 p-2">
                          O={o}
                        </div>
                      ))}
                      {[10,9,8,7,6,5,4,3,2,1].map(s => (
                        <React.Fragment key={`row-${s}`}>
                          <div className="text-right text-xs font-semibold text-slate-600 p-2 flex items-center justify-end">
                            S={s}
                          </div>
                          {[1,2,3,4,5,6,7,8,9,10].map(o => {
                            const count = filteredItems.filter(i => i.severity === s && i.occurrence === o).length;
                            const rpn = s * o * 5;
                            return (
                              <div
                                key={`${s}-${o}`}
                                className={`aspect-square rounded-lg flex items-center justify-center font-semibold text-sm transition-transform hover:scale-110 cursor-pointer shadow-sm ${
                                  rpn >= 200 ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' :
                                  rpn >= 100 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' :
                                  rpn >= 50 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950' :
                                  'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white'
                                }`}
                              >
                                {count > 0 ? count : ''}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-8 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-red-500 to-red-600 shadow-sm"></div>
                        <span className="text-sm">Critical (RPN ≥200)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm"></div>
                        <span className="text-sm">High (100-199)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-400 to-amber-500 shadow-sm"></div>
                        <span className="text-sm">Medium (50-99)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-sm"></div>
                        <span className="text-sm">Low (&lt;50)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Action Board View */}
          <TabsContent value="board" className="flex-1 overflow-hidden m-0 p-6">
            <div className="h-full grid grid-cols-4 gap-5">
              {(['open', 'in-progress', 'completed', 'verified'] as const).map(status => {
                const StatusIcon = statusConfig[status].icon;
                return (
                  <div key={status} className="flex flex-col min-h-0">
                    <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className="h-5 w-5 text-slate-600" />
                        <h3>{statusConfig[status].label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {actionBoardGroups[status].length} items
                      </p>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="space-y-3 pb-4">
                        {actionBoardGroups[status].map(item => (
                          <Card 
                            key={item.id} 
                            className="cursor-pointer hover:shadow-lg transition-all border-l-4 hover:scale-[1.02]"
                            style={{
                              borderLeftColor: item.ap === 'High' ? 'rgb(239 68 68)' : 
                                               item.ap === 'Medium' ? 'rgb(251 191 36)' : 
                                               'rgb(16 185 129)'
                            }}
                            onClick={() => setSelectedNodeId(item.id)}
                          >
                            <CardHeader className="p-4 pb-3">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <CardTitle className="text-sm line-clamp-2 flex-1">
                                  {item.failureMode}
                                </CardTitle>
                                <Badge className={`${getAPColor(item.ap)} flex-shrink-0 text-xs px-2 py-0.5`}>
                                  {item.ap}
                                </Badge>
                              </div>
                              <CardDescription className="text-xs line-clamp-1 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                {item.step || 'No process step'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                                    {item.actionOwner?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                  {item.actionOwner || 'Unassigned'}
                                </span>
                                <Badge className={`${getRPNColor(item.rpn)} text-xs px-2 py-0.5`}>
                                  {item.rpn}
                                </Badge>
                              </div>
                              {item.targetDate && (
                                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5 bg-slate-50 rounded px-2 py-1">
                                  <Clock className="h-3 w-3" />
                                  Due: {new Date(item.targetDate).toLocaleDateString()}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                        {actionBoardGroups[status].length === 0 && (
                          <div className="text-center py-12 text-muted-foreground">
                            <Circle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No items</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Dashboard View */}
          <TabsContent value="dashboard" className="flex-1 overflow-hidden m-0 p-6">
            <ScrollArea className="h-full">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-4 gap-5 mb-6">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-red-700">High Priority</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-red-600 mb-1">
                        {filteredItems.filter(i => i.ap === 'High').length}
                      </div>
                      <p className="text-xs text-red-600/70">Immediate action required</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-blue-700">Average RPN</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-blue-600 mb-1">
                        {filteredItems.length > 0 
                          ? Math.round(filteredItems.reduce((sum, i) => sum + i.rpn, 0) / filteredItems.length)
                          : 0
                        }
                      </div>
                      <p className="text-xs text-blue-600/70">Risk Priority Number</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-amber-700">Open Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-amber-600 mb-1">
                        {filteredItems.filter(i => i.status === 'open' || i.status === 'in-progress').length}
                      </div>
                      <p className="text-xs text-amber-600/70">Pending completion</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-emerald-700">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-emerald-600 mb-1">
                        {filteredItems.filter(i => i.status === 'completed' || i.status === 'verified').length}
                      </div>
                      <p className="text-xs text-emerald-600/70">Actions closed</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                      <CardTitle>Action Priority Distribution</CardTitle>
                      <CardDescription>Analysis of risk levels across all items</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {(['High', 'Medium', 'Low'] as const).map(ap => {
                          const count = filteredItems.filter(i => i.ap === ap).length;
                          const percentage = filteredItems.length > 0 ? (count / filteredItems.length) * 100 : 0;
                          return (
                            <div key={ap}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{ap} Priority</span>
                                <span className="text-sm text-muted-foreground">
                                  {count} items ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    ap === 'High' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                    ap === 'Medium' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                    'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                      <CardTitle>Status Progress</CardTitle>
                      <CardDescription>Workflow completion tracking</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {(['open', 'in-progress', 'completed', 'verified'] as const).map(status => {
                          const count = filteredItems.filter(i => i.status === status).length;
                          const percentage = filteredItems.length > 0 ? (count / filteredItems.length) * 100 : 0;
                          const StatusIcon = statusConfig[status].icon;
                          return (
                            <div key={status}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <StatusIcon className="h-4 w-4 text-slate-600" />
                                  <span className="font-medium">{statusConfig[status].label}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {count} items ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    status === 'open' ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                                    status === 'in-progress' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                    status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                    'bg-gradient-to-r from-purple-500 to-purple-600'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel - Details & Evidence */}
      {selectedItem && (
        <div className="w-96 border-l flex flex-col bg-white shadow-xl">
          <div className="p-5 border-b bg-gradient-to-b from-white to-slate-50/30">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <h3 className="mb-3 leading-tight">{selectedItem.failureMode}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getAPColor(selectedItem.ap)} px-2.5 py-1`}>
                    {selectedItem.ap} AP
                  </Badge>
                  <Badge className={`${getRPNColor(selectedItem.rpn)} px-2.5 py-1`}>
                    RPN {selectedItem.rpn}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNodeId(null)}
                className="flex-shrink-0 h-8 w-8 p-0 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-5 space-y-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                <Label className="text-xs text-slate-600 mb-2 block">Process Step</Label>
                <p className="text-sm">{selectedItem.step || <span className="text-muted-foreground italic">Not specified</span>}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                <Label className="text-xs text-slate-600 mb-2 block">Function</Label>
                <p className="text-sm">{selectedItem.function || <span className="text-muted-foreground italic">Not specified</span>}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Effect</Label>
                <p className="text-sm leading-relaxed">{selectedItem.effect || <span className="text-muted-foreground italic">Not specified</span>}</p>
              </div>

              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Cause</Label>
                <p className="text-sm leading-relaxed">{selectedItem.cause || <span className="text-muted-foreground italic">Not specified</span>}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border">
                  <div className="text-xs text-muted-foreground mb-1">Severity</div>
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
                    severityCriteria.find(c => c.value === selectedItem.severity)?.color || 'bg-slate-200'
                  } text-white font-bold shadow-sm`}>
                    {selectedItem.severity}
                  </div>
                </div>
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border">
                  <div className="text-xs text-muted-foreground mb-1">Occurrence</div>
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
                    occurrenceCriteria.find(c => c.value === selectedItem.occurrence)?.color || 'bg-slate-200'
                  } text-white font-bold shadow-sm`}>
                    {selectedItem.occurrence}
                  </div>
                </div>
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border">
                  <div className="text-xs text-muted-foreground mb-1">Detection</div>
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
                    detectionCriteria.find(c => c.value === selectedItem.detection)?.color || 'bg-slate-200'
                  } text-white font-bold shadow-sm`}>
                    {selectedItem.detection}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Current Controls (Prevention)</Label>
                <p className="text-sm leading-relaxed">{selectedItem.currentControlsPrev || <span className="text-muted-foreground italic">Not specified</span>}</p>
              </div>

              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Current Controls (Detection)</Label>
                <p className="text-sm leading-relaxed">{selectedItem.currentControlsDet || <span className="text-muted-foreground italic">Not specified</span>}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Recommended Actions</Label>
                <p className="text-sm leading-relaxed">{selectedItem.recommendedActions || <span className="text-muted-foreground italic">Not specified</span>}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Owner</Label>
                  <p className="text-sm">{selectedItem.actionOwner || <span className="text-muted-foreground italic">Unassigned</span>}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Due Date</Label>
                  <p className="text-sm">{selectedItem.targetDate ? new Date(selectedItem.targetDate).toLocaleDateString() : <span className="text-muted-foreground italic">Not set</span>}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Status</Label>
                <Badge className={`${statusConfig[selectedItem.status].color} border px-3 py-1.5`}>
                  {statusConfig[selectedItem.status].label}
                </Badge>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs text-slate-600">Linked Evidence</Label>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {linkedEvidence.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No evidence linked</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {linkedEvidence.map(evidence => (
                      <div key={evidence.id} className="p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow">
                        <div className="text-sm font-medium mb-1">{evidence.title}</div>
                        <div className="text-xs text-muted-foreground">{evidence.type}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
