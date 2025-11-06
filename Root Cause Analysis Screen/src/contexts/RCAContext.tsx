import React, { createContext, useContext, useState, useCallback } from 'react';
import type { RCAProject, RCAMethod, Evidence, CAPAAction } from '../types/rca';
import { mockProject } from '../lib/rca-mock-data';

interface RCAContextType {
  project: RCAProject;
  updateProject: (updates: Partial<RCAProject>) => void;
  currentMethod: RCAMethod;
  setCurrentMethod: (method: RCAMethod) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  addEvidence: (evidence: Evidence) => void;
  addAction: (action: CAPAAction) => void;
  updateAction: (id: string, updates: Partial<CAPAAction>) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const RCAContext = createContext<RCAContextType | undefined>(undefined);

export function RCAProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<RCAProject>(mockProject);
  const [currentMethod, setCurrentMethod] = useState<RCAMethod>(project.currentMethod);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<RCAProject[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const updateProject = useCallback((updates: Partial<RCAProject>) => {
    setProject(prev => {
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      // Add to history
      setHistory(h => [...h.slice(0, historyIndex + 1), prev]);
      setHistoryIndex(i => i + 1);
      return updated;
    });
  }, [historyIndex]);

  const addEvidence = useCallback((evidence: Evidence) => {
    updateProject({
      evidence: [...project.evidence, evidence]
    });
  }, [project.evidence, updateProject]);

  const addAction = useCallback((action: CAPAAction) => {
    updateProject({
      actions: [...project.actions, action]
    });
  }, [project.actions, updateProject]);

  const updateAction = useCallback((id: string, updates: Partial<CAPAAction>) => {
    updateProject({
      actions: project.actions.map(a => a.id === id ? { ...a, ...updates } : a)
    });
  }, [project.actions, updateProject]);

  const undo = useCallback(() => {
    if (historyIndex >= 0) {
      setProject(history[historyIndex]);
      setHistoryIndex(i => i - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setProject(history[historyIndex + 1]);
      setHistoryIndex(i => i + 1);
    }
  }, [history, historyIndex]);

  return (
    <RCAContext.Provider value={{
      project,
      updateProject,
      currentMethod,
      setCurrentMethod,
      selectedNodeId,
      setSelectedNodeId,
      addEvidence,
      addAction,
      updateAction,
      canUndo: historyIndex >= 0,
      canRedo: historyIndex < history.length - 1,
      undo,
      redo
    }}>
      {children}
    </RCAContext.Provider>
  );
}

export function useRCA() {
  const context = useContext(RCAContext);
  if (!context) {
    throw new Error('useRCA must be used within RCAProvider');
  }
  return context;
}
