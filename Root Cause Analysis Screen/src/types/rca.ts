// Root Cause Analysis Type Definitions

export type RCAMethod = '5whys' | 'fishbone' | 'pareto' | 'fmea' | 'fta' | 'affinity' | 'scatter';

export type ValidationStatus = 'validated' | 'rejected' | 'requires-evidence' | 'pending';

export type CauseCategory = 'people' | 'machine' | 'method' | 'material' | 'measurement' | 'environment';

// 5 Whys Types
export interface FiveWhyNode {
  id: string;
  parentId: string | null;
  text: string;
  status: ValidationStatus;
  evidenceRefs: string[];
  causeCategory?: CauseCategory;
  depth: number;
}

export interface FiveWhyTree {
  id: string;
  name: string;
  nodes: FiveWhyNode[];
}

// Fishbone Types
export type FishboneTemplateType = '6M' | '4S' | '8P' | 'Custom' | 'Org';

export interface FishboneTemplate {
  id: string;
  name: string;
  type: FishboneTemplateType;
  categories: string[];
  description?: string;
}

export interface FishboneCategory {
  id: string;
  name: string;
  order: number;
  color: string;
}

export interface FishboneNode {
  id: string;
  categoryId: string;
  parentId?: string;
  text: string;
  notes?: string;
  evidenceRefs: string[];
  owner?: string;
  dueDate?: string;
  severityTag?: 'none' | 'low' | 'medium' | 'high';
  children?: FishboneNode[];
  links?: { type: 'CAPA' | '5Why' | 'FMEA' | 'FTA'; refId: string }[];
}

export interface FishboneDiagram {
  id: string;
  name: string;
  problem: string;
  templateId: string;
  categories: FishboneCategory[];
  nodes: FishboneNode[];
  createdBy: string;
  createdAt: string;
  version: number;
}

// Pareto Types
export interface ParetoData {
  category: string;
  value: number;
  percentage?: number;
  cumulative?: number;
}

export interface ParetoAnalysis {
  id: string;
  name: string;
  data: ParetoData[];
  threshold: number;
  categoryField: string;
  valueField: string;
}

// FMEA Types
export interface FMEAItem {
  id: string;
  step: string;
  function: string;
  failureMode: string;
  effect: string;
  severity: number; // 1-10
  cause: string;
  occurrence: number; // 1-10
  currentControlsPrev: string;
  currentControlsDet: string;
  detection: number; // 1-10
  rpn: number; // S × O × D
  recommendedActions: string;
  actionOwner: string;
  targetDate: string;
  status: 'open' | 'in-progress' | 'completed' | 'verified';
  postSeverity?: number;
  postOccurrence?: number;
  postDetection?: number;
  postRpn?: number;
  evidenceRefs: string[];
}

export interface FMEAAnalysis {
  id: string;
  name: string;
  type: 'design' | 'process';
  items: FMEAItem[];
}

// Fault Tree Types
export type FTAGateType = 'AND' | 'OR' | 'INHIBIT';
export type FTAEventType = 'basic' | 'gate' | 'conditional';

export interface FTAEvent {
  id: string;
  type: FTAEventType;
  name: string;
  description: string;
  gateType?: FTAGateType;
  probability?: number;
  children: string[];
  evidenceRefs: string[];
  parentId?: string;
}

export interface FaultTree {
  id: string;
  name: string;
  topEvent: string;
  events: FTAEvent[];
  minimalCutSets?: string[][];
}

// Affinity Types
export interface AffinityNote {
  id: string;
  text: string;
  clusterId?: string;
  x: number;
  y: number;
  color: string;
}

export interface AffinityCluster {
  id: string;
  name: string;
  color: string;
  noteIds: string[];
}

export interface AffinityDiagram {
  id: string;
  name: string;
  notes: AffinityNote[];
  clusters: AffinityCluster[];
}

// Scatter Types
export interface ScatterDataPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  subgroup?: string;
  isOutlier?: boolean;
}

export interface ScatterAnalysis {
  id: string;
  name: string;
  xVar: string;
  yVar: string;
  data: ScatterDataPoint[];
  r?: number; // correlation coefficient
  r2?: number; // R-squared
  p?: number; // p-value
  regressionLine?: { slope: number; intercept: number };
}

// Evidence Types
export interface Evidence {
  id: string;
  type: 'file' | 'image' | 'link' | 'note';
  title: string;
  description?: string;
  uri?: string;
  hash?: string;
  linkedTo: string[]; // IDs of nodes/items this evidence supports
  createdAt: string;
  createdBy: string;
}

// CAPA Types
export interface CAPAAction {
  id: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'completed' | 'verified';
  linkedTo: { method: RCAMethod; nodeId: string }[];
  effectivenessCheck?: string;
  createdAt: string;
}

// Project Types
export interface RCAVersion {
  id: string;
  timestamp: string;
  author: string;
  description: string;
  snapshot: string; // JSON serialized project state
}

export interface RCAProject {
  id: string;
  title: string;
  problemStatement: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  currentMethod: RCAMethod;
  
  // Method artifacts
  fiveWhyTrees: FiveWhyTree[];
  fishboneDiagrams: FishboneDiagram[];
  paretoAnalyses: ParetoAnalysis[];
  fmeaAnalyses: FMEAAnalysis[];
  faultTrees: FaultTree[];
  affinityDiagrams: AffinityDiagram[];
  scatterAnalyses: ScatterAnalysis[];
  
  // Cross-method features
  evidence: Evidence[];
  actions: CAPAAction[];
  versions: RCAVersion[];
  
  // Settings
  datasetId?: string;
  locale?: string;
}
