import { useState } from 'react';
import { Plus, Trash2, Circle, Square, Triangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
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
  'AND': 'bg-blue-100 border-blue-300',
  'OR': 'bg-green-100 border-green-300',
  'INHIBIT': 'bg-purple-100 border-purple-300'
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
        className={`p-4 mb-2 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'
        } ${event.type === 'gate' && event.gateType ? gateColors[event.gateType] : ''}`}
        onClick={() => onSelect(event.id)}
      >
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-1 flex-shrink-0" />
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={event.name}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdate(event.id, { name: e.target.value });
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-8"
                placeholder="Event name..."
              />
              
              {event.type === 'gate' && (
                <Select
                  value={event.gateType}
                  onValueChange={(value) => onUpdate(event.id, { gateType: value as FTAGateType })}
                >
                  <SelectTrigger className="w-32 h-8" onClick={(e) => e.stopPropagation()}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                    <SelectItem value="INHIBIT">INHIBIT</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {event.type === 'basic' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">P:</span>
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
                    className="h-8 w-24"
                  />
                </div>
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

            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {event.type}
              </Badge>
              {probability > 0 && (
                <Badge variant="secondary">
                  P = {(probability * 100).toFixed(2)}%
                </Badge>
              )}
              {event.evidenceRefs.length > 0 && (
                <Badge variant="outline">
                  {event.evidenceRefs.length} evidence
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-1">
            {event.type === 'gate' && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
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
        <div className="border-l-2 border-muted ml-4 pl-4">
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

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="mb-2">{currentTree.name}</h2>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm mb-2">
              <strong>FTA Guidance:</strong> Use AND gates when all inputs are required for the event to occur; 
              use OR gates when any input can cause the event.
            </p>
            <p className="text-sm text-muted-foreground">
              Define probabilities for basic events to compute the top event probability. 
              Gates combine child probabilities using logical operators.
            </p>
          </div>
        </div>

        <div className="mb-6">
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
        </div>

        {currentTree.minimalCutSets && currentTree.minimalCutSets.length > 0 && (
          <Card className="p-4 bg-orange-50 border-orange-200">
            <h3 className="mb-3">Minimal Cut Sets</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Combinations of basic events that, if all occur, will cause the top event:
            </p>
            <div className="space-y-2">
              {currentTree.minimalCutSets.map((cutSet, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="text-sm">
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
  );
}
