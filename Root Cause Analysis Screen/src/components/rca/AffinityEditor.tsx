import { useState, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { useRCA } from '../../contexts/RCAContext';
import type { AffinityNote, AffinityCluster } from '../../types/rca';

const noteColors = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFD9BA', '#E0BBE4'];

export function AffinityEditor() {
  const { project, updateProject } = useRCA();
  const currentDiagram = project.affinityDiagrams[0];
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
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

    const newCluster: AffinityCluster = {
      id: `cluster-${Date.now()}`,
      name: `Cluster ${currentDiagram.clusters.length + 1}`,
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="mb-1">{currentDiagram.name}</h2>
            <p className="text-sm text-muted-foreground">
              Organize ideas into themes and patterns. Drag notes to reposition, select multiple to create clusters.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddNote}>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
            <Button
              onClick={handleCreateCluster}
              disabled={selectedNotes.length === 0}
              variant="outline"
            >
              Create Cluster ({selectedNotes.length})
            </Button>
          </div>
        </div>

        {currentDiagram.clusters.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {currentDiagram.clusters.map(cluster => (
              <Badge
                key={cluster.id}
                style={{ backgroundColor: cluster.color }}
                className="text-black"
              >
                {cluster.name} ({cluster.noteIds.length})
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <div
          ref={canvasRef}
          className="relative w-full h-full bg-gray-50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ minHeight: '600px' }}
        >
          {currentDiagram.notes.map(note => (
            <Card
              key={note.id}
              draggable
              onDragStart={(e) => handleDragStart(e, note.id)}
              className={`absolute p-3 cursor-move shadow-md transition-all ${
                selectedNotes.includes(note.id) ? 'ring-2 ring-primary scale-105' : ''
              }`}
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                backgroundColor: note.color,
                width: '200px',
                minHeight: '100px'
              }}
              onClick={() => toggleNoteSelection(note.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <Textarea
                    value={note.text}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleUpdateNote(note.id, { text: e.target.value });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="min-h-[60px] bg-white/50 border-0 resize-none"
                    placeholder="Enter idea..."
                    rows={3}
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 -mr-1 -mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              {note.clusterId && (
                <Badge variant="outline" className="text-xs">
                  {currentDiagram.clusters.find(c => c.id === note.clusterId)?.name}
                </Badge>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div className="p-4 border-t bg-muted">
        <p className="text-sm">
          💡 <strong>Tip:</strong> Select multiple notes (click while holding) and create clusters to group related ideas.
          Convert clusters to Fishbone branches or Pareto categories for structured analysis.
        </p>
      </div>
    </div>
  );
}
