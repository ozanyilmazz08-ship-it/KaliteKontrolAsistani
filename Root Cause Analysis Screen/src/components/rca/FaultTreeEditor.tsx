import { useState } from 'react';
import { Plus, Trash2, Circle, Square, Triangle, ChevronLeft, ChevronRight, AlertTriangle, Zap, Download, Upload, Settings2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useRCA } from '../../contexts/RCAContext';
import type { FTAEvent, FTAGateType } from '../../types/rca';

const gateColors = {
  'AND': 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300',
  'OR': 'bg-gradient-to-br from-green-50 to-green-100 border-green-300',
  'INHIBIT': 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300'
};

const gateIconColors = {
  'AND': 'from-blue-500 to-blue-600',
  'OR': 'from-green-500 to-green-600',
  'INHIBIT': 'from-purple-500 to-purple-600'
};

const eventTypeIcons = {
  'basic': Circle,
  'gate': Square,
  'conditional': Triangle
};

interface TreeNodeProps {
  event: FTAEvent;
  allEvents: FTAEvent[];
  onUpdate: (id: string, updates: Partial<FTAEvent>) => void;
  onAdd: (parentId: string, type: 'basic' | 'gate') => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  depth: number;
}

function TreeNode({ event, allEvents, onUpdate, onAdd, onDelete, onSelect, isSelected, depth }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const children = allEvents.filter(e => event.children.includes(e.id));
  const Icon = eventTypeIcons[event.type];

  const computeProbability = () => {
    if (event.type === 'basic') {
      return event.probability || 0;
    }
    if (event.type === 'gate' && children.length > 0) {
      const childProbs = children.map(c => {
        if (c.type === 'basic') return c.probability || 0;
        return 0; // Simplified - would need recursive calculation
      });

      if (event.gateType === 'AND') {
        return childProbs.reduce((acc, p) => acc * p, 1);
      } else if (event.gateType === 'OR') {
        return 1 - childProbs.reduce((acc, p) => acc * (1 - p), 1);
      }
    }
    return 0;
  };

  const probability = computeProbability();

  return (
    <div className="ml-8">
      <Card
        className={`p-4 mb-3 cursor-pointer transition-all border-2 hover:shadow-md $
          isSelected ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : 'hover:shadow-sm'
        } ${event.type === 'gate' && event.gateType ? gateColors[event.gateType] : 'bg-white'}`}
        onClick={() => onSelect(event.id)}
      >
        <div className="flex items-start gap-3">
          {event.type === 'gate' && event.gateType ? (
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gateIconColors[event.gateType]} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
              <Square className="h-5 w-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Circle className="h-5 w-5" />
            </div>
          )}
          
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <Input
                value={event.name}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdate(event.id, { name: e.target.value });
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-9 font-medium"
                placeholder="Event name..."
              />
              
              {event.type === 'gate' && (
                <Select
                  value={event.gateType}
                  onValueChange={(value) => onUpdate(event.id, { gateType: value as FTAGateType })}
                >
                  <SelectTrigger className="w-32 h-9" onClick={(e) => e.stopPropagation()}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND Gate</SelectItem>
                    <SelectItem value="OR">OR Gate</SelectItem>
                    <SelectItem value="INHIBIT">INHIBIT</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <Input
              value={event.description}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate(event.id, { description: e.target.value });
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-8 text-sm"
              placeholder="Description..."
            />

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="capitalize">
                {event.type}
              </Badge>
              
              {event.type === 'gate' && event.gateType && (
                <Badge className={`
                  ${event.gateType === 'AND' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
                  ${event.gateType === 'OR' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                  ${event.gateType === 'INHIBIT' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : ''}
                `}>
                  {event.gateType} Gate
                </Badge>
              )}
              
              {probability > 0 && (
                <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 hover:from-orange-100 hover:to-red-100">
                  P = {(probability * 100).toFixed(2)}%
                </Badge>
              )}
              
              {event.evidenceRefs.length > 0 && (
                <Badge variant="outline">
                  {event.evidenceRefs.length} evidence
                </Badge>
              )}
            </div>

            {event.type === 'basic' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm text-muted-foreground">Probability:</span>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={event.probability || 0}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdate(event.id, { probability: parseFloat(e.target.value) || 0 });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-28"
                />
                <span className="text-sm text-muted-foreground">
                  ({((event.probability || 0) * 100).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-1 flex-shrink-0">
            {event.type === 'gate' && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(event.id, 'basic');
                  }}
                  title="Add basic event"
                >
                  <Circle className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(event.id, 'gate');
                  }}
                  title="Add gate"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </>
            )}
            {event.id !== 'top-event' && (
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {isExpanded && children.length > 0 && (
        <div className="border-l-2 border-muted ml-6 pl-4">
          {children.map(child => (
            <TreeNode
              key={child.id}
              event={child}
              allEvents={allEvents}
              onUpdate={onUpdate}
              onAdd={onAdd}
              onDelete={onDelete}
              onSelect={onSelect}
              isSelected={isSelected}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FaultTreeEditor() {
  const { project, updateProject, selectedNodeId, setSelectedNodeId } = useRCA();
  const currentTree = project.faultTrees[0];
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState(false);

  const handleUpdateEvent = (id: string, updates: Partial<FTAEvent>) => {
    const updatedEvents = currentTree.events.map(e =>
      e.id === id ? { ...e, ...updates } : e
    );

    updateProject({
      faultTrees: [{
        ...currentTree,
        events: updatedEvents
      }]
    });
  };

  const handleAddEvent = (parentId: string, type: 'basic' | 'gate') => {
    const newEvent: FTAEvent = {
      id: `event-${Date.now()}`,
      type,
      name: '',
      description: '',
      gateType: type === 'gate' ? 'OR' : undefined,
      probability: type === 'basic' ? 0.01 : undefined,
      children: [],
      evidenceRefs: [],
      parentId
    };

    const updatedEvents = currentTree.events.map(e =>
      e.id === parentId
        ? { ...e, children: [...e.children, newEvent.id] }
        : e
    );

    updateProject({
      faultTrees: [{
        ...currentTree,
        events: [...updatedEvents, newEvent]
      }]
    });
  };

  const handleDeleteEvent = (id: string) => {
    // Remove from parent's children
    const updatedEvents = currentTree.events
      .filter(e => e.id !== id)
      .map(e => ({
        ...e,
        children: e.children.filter(c => c !== id)
      }));

    updateProject({
      faultTrees: [{
        ...currentTree,
        events: updatedEvents
      }]
    });

    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  };

  const topEvent = currentTree.events.find(e => e.id === currentTree.topEvent);
  if (!topEvent) return <div>No top event found</div>;

  // Calculate statistics
  const basicEvents = currentTree.events.filter(e => e.type === 'basic');
  const gates = currentTree.events.filter(e => e.type === 'gate');
  const andGates = gates.filter(e => e.gateType === 'AND');
  const orGates = gates.filter(e => e.gateType === 'OR');

  return (
    <div className="h-full flex bg-slate-50/50">
      {/* Left Panel - Tree Statistics */}
      {isNavigatorCollapsed ? (
        <div className="w-12 flex-shrink-0 border-r bg-white flex flex-col items-center py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNavigatorCollapsed(false)}
            className="h-8 w-8 p-0 mb-4"
            title="Expand Tree Statistics"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div 
            className="text-xs font-medium text-muted-foreground tracking-wider"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            STATISTICS
          </div>
        </div>
      ) : (
        <div className="w-72 border-r flex flex-col bg-white">
          <div className="p-5 border-b bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600">Tree Statistics</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNavigatorCollapsed(true)}
                className="h-8 w-8 p-0"
                title="Collapse Statistics"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-3">
              {/* Events Overview */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                      <Zap className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Events</span>
                  </div>
                  <Badge variant="secondary" className="px-2.5 py-0.5">
                    {currentTree.events.length}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Events</span>
                    <Badge variant="outline">{basicEvents.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gates</span>
                    <Badge variant="outline">{gates.length}</Badge>
                  </div>
                </div>
              </div>

              {/* Gates Breakdown */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Square className="h-4 w-4 text-slate-600" />
                  Gate Types
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">AND Gates</span>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {andGates.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">OR Gates</span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      {orGates.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">INHIBIT Gates</span>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      {gates.filter(e => e.gateType === 'INHIBIT').length}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Minimal Cut Sets */}
              {currentTree.minimalCutSets && currentTree.minimalCutSets.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-white border border-orange-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Minimal Cut Sets</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Total Sets</span>
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                      {currentTree.minimalCutSets.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Combinations of basic events that cause the top event
                  </p>
                </div>
              )}

              {/* Gate Logic Reference */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">Gate Logic</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                    <strong>AND:</strong> P(out) = ∏ P(i)
                  </div>
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <strong>OR:</strong> P(out) = 1 − ∏ (1 − P(i))
                  </div>
                  <p className="text-muted-foreground pt-1">
                    Assumes independence between events
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Center - Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0 bg-gradient-to-b from-white to-slate-50/30">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl">{currentTree.name}</h2>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Fault Tree Analysis
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Logical analysis of failure combinations using gates and basic events
              </p>
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
              <Button variant="outline" size="sm" className="shadow-sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>

          {/* Guidance */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              <strong>FTA Guidance:</strong> Use AND gates when all inputs are required for the event; 
              use OR gates when any input can cause the event. 
              Define probabilities for basic events to compute the top event probability.
            </AlertDescription>
          </Alert>
        </div>

        {/* Tree Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 min-h-full">
            <TreeNode
              event={topEvent}
              allEvents={currentTree.events}
              onUpdate={handleUpdateEvent}
              onAdd={handleAddEvent}
              onDelete={handleDeleteEvent}
              onSelect={setSelectedNodeId}
              isSelected={selectedNodeId === topEvent.id}
              depth={0}
            />

            {/* Minimal Cut Sets Display */}
            {currentTree.minimalCutSets && currentTree.minimalCutSets.length > 0 && (
              <Card className="mt-6 p-5 bg-gradient-to-br from-orange-50 to-white border-orange-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">Minimal Cut Sets</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Combinations of basic events that, if all occur, will cause the top event:
                </p>
                <div className="space-y-2">
                  {currentTree.minimalCutSets.map((cutSet, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                      <Badge variant="outline" className="flex-shrink-0">{index + 1}</Badge>
                      <span className="text-sm flex-1">
                        {cutSet.map(eventId => 
                          currentTree.events.find(e => e.id === eventId)?.name || eventId
                        ).join(' AND ')}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
