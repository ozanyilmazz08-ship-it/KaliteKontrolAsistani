import { useState, useRef } from 'react';
import { Plus, Trash2, Grid3x3, Download, Wand2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useRCA } from '../../contexts/RCAContext';
import type { AffinityNote, AffinityCluster } from '../../types/rca';

const noteColors = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFD9BA', '#E0BBE4'];

export function AffinityEditor() {
  const { project, updateProject } = useRCA();
  const currentDiagram = project.affinityDiagrams[0];
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState(false);
  const [newClusterName, setNewClusterName] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleAddNote = () => {
    const newNote: AffinityNote = {
      id: `note-${Date.now()}`,
      text: '',
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      color: noteColors[Math.floor(Math.random() * noteColors.length)]
    };

    updateProject({
      affinityDiagrams: [{
        ...currentDiagram,
        notes: [...currentDiagram.notes, newNote]
      }]
    });
  };

  const handleUpdateNote = (id: string, updates: Partial<AffinityNote>) => {
    const updatedNotes = currentDiagram.notes.map(n =>
      n.id === id ? { ...n, ...updates } : n
    );

    updateProject({
      affinityDiagrams: [{
        ...currentDiagram,
        notes: updatedNotes
      }]
    });
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = currentDiagram.notes.filter(n => n.id !== id);
    const updatedClusters = currentDiagram.clusters.map(c => ({
      ...c,
      noteIds: c.noteIds.filter(nid => nid !== id)
    }));

    updateProject({
      affinityDiagrams: [{
        ...currentDiagram,
        notes: updatedNotes,
        clusters: updatedClusters
      }]
    });
  };

  const handleCreateCluster = () => {
    if (selectedNotes.length === 0) return;

    const clusterName = newClusterName || `Cluster ${currentDiagram.clusters.length + 1}`;
    const newCluster: AffinityCluster = {
      id: `cluster-${Date.now()}`,
      name: clusterName,
      color: noteColors[currentDiagram.clusters.length % noteColors.length],
      noteIds: selectedNotes
    };

    // Update notes to be in this cluster
    const updatedNotes = currentDiagram.notes.map(n =>
      selectedNotes.includes(n.id) ? { ...n, clusterId: newCluster.id, color: newCluster.color } : n
    );

    updateProject({
      affinityDiagrams: [{
        ...currentDiagram,
        notes: updatedNotes,
        clusters: [...currentDiagram.clusters, newCluster]
      }]
    });

    setSelectedNotes([]);
    setNewClusterName('');
  };

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    setDraggedNote(noteId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNote || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    handleUpdateNote(draggedNote, { x, y });
    setDraggedNote(null);
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const unclusteredNotes = currentDiagram.notes.filter(n => !n.clusterId);
  const clusteredNotes = currentDiagram.notes.filter(n => n.clusterId);

  return (
    <div className="h-full flex bg-slate-50/50">
      {/* Left Panel - Clusters & Controls */}
      {isNavigatorCollapsed ? (
        <div className="w-12 flex-shrink-0 border-r bg-white flex flex-col items-center py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNavigatorCollapsed(false)}
            className="h-8 w-8 p-0 mb-4"
            title="Expand Clusters"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div 
            className="text-xs font-medium text-muted-foreground tracking-wider"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            CLUSTERS
          </div>
        </div>
      ) : (
        <div className="w-80 border-r flex flex-col bg-white">
          <div className="p-5 border-b bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-600">Clusters & Tools</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNavigatorCollapsed(true)}
                className="h-8 w-8 p-0"
                title="Collapse Clusters"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-4">
              {/* Statistics */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                      <Grid3x3 className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Overview</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 rounded-lg bg-white border">
                    <div className="font-semibold text-blue-700">{currentDiagram.notes.length}</div>
                    <div className="text-xs text-muted-foreground">Notes</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white border">
                    <div className="font-semibold text-purple-700">{currentDiagram.clusters.length}</div>
                    <div className="text-xs text-muted-foreground">Clusters</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white border">
                    <div className="font-semibold text-green-700">{clusteredNotes.length}</div>
                    <div className="text-xs text-muted-foreground">Grouped</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white border">
                    <div className="font-semibold text-slate-700">{unclusteredNotes.length}</div>
                    <div className="text-xs text-muted-foreground">Ungrouped</div>
                  </div>
                </div>
              </div>

              {/* Create Cluster */}
              {selectedNotes.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 shadow-sm">
                  <h4 className="font-medium mb-3">Create Cluster</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Cluster Name</Label>
                      <Input
                        value={newClusterName}
                        onChange={(e) => setNewClusterName(e.target.value)}
                        placeholder={`Cluster ${currentDiagram.clusters.length + 1}`}
                        className="h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Selected Notes</Label>
                      <Badge className="mt-1 bg-purple-100 text-purple-700 hover:bg-purple-100">
                        {selectedNotes.length} notes
                      </Badge>
                    </div>
                    <Button 
                      onClick={handleCreateCluster} 
                      className="w-full shadow-sm bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Cluster
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              {/* Existing Clusters */}
              <div>
                <h4 className="font-medium mb-3 flex items-center justify-between">
                  <span>Clusters</span>
                  <Badge variant="outline">{currentDiagram.clusters.length}</Badge>
                </h4>
                {currentDiagram.clusters.length > 0 ? (
                  <div className="space-y-2">
                    {currentDiagram.clusters.map(cluster => (
                      <div
                        key={cluster.id}
                        className="p-3 rounded-lg border-2 transition-all hover:shadow-md"
                        style={{ 
                          backgroundColor: cluster.color + '30',
                          borderColor: cluster.color
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{cluster.name}</span>
                          <Badge 
                            style={{ 
                              backgroundColor: cluster.color,
                              color: '#000'
                            }}
                          >
                            {cluster.noteIds.length}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {cluster.noteIds.length} {cluster.noteIds.length === 1 ? 'note' : 'notes'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No clusters yet. Select notes to create clusters.
                  </p>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">Export Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Convert to Fishbone
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Convert to Pareto
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Center - Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0 bg-gradient-to-b from-white to-slate-50/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl">{currentDiagram.name}</h2>
                <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                  Affinity Diagram
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Organize ideas into themes and patterns. Drag notes to reposition, click to select multiple.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNote} className="shadow-sm bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
              <Button variant="outline" size="sm" className="shadow-sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Active Clusters Bar */}
          {currentDiagram.clusters.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {currentDiagram.clusters.map(cluster => (
                <Badge
                  key={cluster.id}
                  style={{ backgroundColor: cluster.color }}
                  className="text-black px-3 py-1.5 shadow-sm"
                >
                  {cluster.name} ({cluster.noteIds.length})
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={canvasRef}
            className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ minHeight: '600px' }}
          >
            {/* Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Notes */}
            {currentDiagram.notes.map(note => {
              const isSelected = selectedNotes.includes(note.id);
              const cluster = currentDiagram.clusters.find(c => c.id === note.clusterId);
              
              return (
                <div
                  key={note.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, note.id)}
                  className={`absolute p-4 cursor-move shadow-lg transition-all rounded-xl border-2 ${
                    isSelected 
                      ? 'ring-4 ring-primary/50 scale-105 shadow-2xl z-10' 
                      : 'hover:shadow-xl hover:scale-[1.02]'
                  }`}
                  style={{
                    left: `${note.x}px`,
                    top: `${note.y}px`,
                    backgroundColor: note.color,
                    borderColor: cluster ? cluster.color : note.color,
                    width: '220px',
                    minHeight: '120px'
                  }}
                  onClick={() => toggleNoteSelection(note.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    {cluster && (
                      <Badge 
                        variant="outline" 
                        className="text-xs mb-2"
                        style={{ 
                          backgroundColor: 'white',
                          borderColor: cluster.color,
                          color: '#000'
                        }}
                      >
                        {cluster.name}
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 -mr-1 -mt-1 hover:bg-red-100 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Textarea
                    value={note.text}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleUpdateNote(note.id, { text: e.target.value });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="min-h-[70px] bg-white/80 border-0 resize-none text-sm shadow-sm"
                    placeholder="Enter idea..."
                    rows={4}
                  />
                  {isSelected && (
                    <div className="absolute -top-2 -left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty State */}
            {currentDiagram.notes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center mx-auto mb-4">
                    <Grid3x3 className="h-10 w-10 text-pink-600" />
                  </div>
                  <h3 className="font-semibold mb-2">No notes yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add sticky notes to brainstorm and organize ideas
                  </p>
                  <Button onClick={handleAddNote} className="shadow-sm bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Note
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Hint */}
        <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-purple-50">
          <p className="text-sm flex items-center gap-2">
            <span className="text-xl">💡</span>
            <strong>Tip:</strong> Click notes to select them, then create clusters to group related ideas.
            Convert clusters to Fishbone categories or Pareto analysis for deeper investigation.
          </p>
        </div>
      </div>
    </div>
  );
}
