// Mock data for RCA demonstration

import type { RCAProject, FiveWhyTree, FishboneDiagram, ParetoAnalysis, FMEAAnalysis, FaultTree, AffinityDiagram, ScatterAnalysis } from '../types/rca';

export const mockFiveWhyTree: FiveWhyTree = {
  id: '5w-1',
  name: 'Production Line Stoppage Analysis',
  nodes: [
    {
      id: 'root',
      parentId: null,
      text: 'Production line stopped for 4 hours',
      status: 'validated',
      evidenceRefs: ['ev-1'],
      depth: 0
    },
    {
      id: 'why1-a',
      parentId: 'root',
      text: 'Conveyor belt motor overheated',
      status: 'validated',
      evidenceRefs: ['ev-2'],
      depth: 1,
      causeCategory: 'machine'
    },
    {
      id: 'why2-a',
      parentId: 'why1-a',
      text: 'Cooling system failed',
      status: 'validated',
      evidenceRefs: ['ev-3'],
      depth: 2,
      causeCategory: 'machine'
    },
    {
      id: 'why3-a',
      parentId: 'why2-a',
      text: 'Coolant level was low',
      status: 'validated',
      evidenceRefs: ['ev-4'],
      depth: 3,
      causeCategory: 'material'
    },
    {
      id: 'why4-a',
      parentId: 'why3-a',
      text: 'Maintenance check was skipped',
      status: 'validated',
      evidenceRefs: [],
      depth: 4,
      causeCategory: 'method'
    },
    {
      id: 'why5-a',
      parentId: 'why4-a',
      text: 'Maintenance schedule not enforced',
      status: 'validated',
      evidenceRefs: [],
      depth: 5,
      causeCategory: 'people'
    }
  ]
};

export const mockFishbone: FishboneDiagram = {
  id: 'fb-1',
  name: 'Defect Rate Increase',
  problem: 'Product defect rate increased from 2% to 8%',
  templateId: '6M',
  categories: [
    { id: 'cat-people', name: 'People (Man)', order: 0, color: '#ef4444' },
    { id: 'cat-machine', name: 'Machine', order: 1, color: '#3b82f6' },
    { id: 'cat-method', name: 'Method', order: 2, color: '#10b981' },
    { id: 'cat-material', name: 'Material', order: 3, color: '#f59e0b' },
    { id: 'cat-measurement', name: 'Measurement', order: 4, color: '#8b5cf6' },
    { id: 'cat-environment', name: 'Environment (Mother Nature)', order: 5, color: '#06b6d4' }
  ],
  nodes: [
    { id: 'p1', categoryId: 'cat-people', text: 'Inadequate training', evidenceRefs: ['ev-5'], severityTag: 'high', owner: 'HR Manager' },
    { id: 'p2', categoryId: 'cat-people', text: 'High turnover rate', evidenceRefs: ['ev-6'], severityTag: 'medium' },
    { id: 'm1', categoryId: 'cat-machine', text: 'Equipment wear and tear', evidenceRefs: ['ev-7'], severityTag: 'high', owner: 'Maintenance Lead' },
    { id: 'm2', categoryId: 'cat-machine', text: 'Calibration drift', evidenceRefs: ['ev-8'], severityTag: 'high' },
    { id: 'mt1', categoryId: 'cat-method', text: 'Process documentation outdated', evidenceRefs: [], severityTag: 'medium' },
    { id: 'mt2', categoryId: 'cat-method', text: 'Quality checks insufficient', evidenceRefs: ['ev-9'], severityTag: 'high', owner: 'QA Manager' },
    { id: 'mat1', categoryId: 'cat-material', text: 'Raw material variability', evidenceRefs: ['ev-10'], severityTag: 'medium' },
    { id: 'mat2', categoryId: 'cat-material', text: 'Supplier quality issues', evidenceRefs: ['ev-11'], severityTag: 'high', owner: 'Procurement' },
    { id: 'ms1', categoryId: 'cat-measurement', text: 'Inspection tools accuracy', evidenceRefs: ['ev-12'], severityTag: 'medium' },
    { id: 'e1', categoryId: 'cat-environment', text: 'Temperature fluctuations', evidenceRefs: ['ev-13'], severityTag: 'low' }
  ],
  createdBy: 'Quality Manager',
  createdAt: '2025-10-15T10:00:00Z',
  version: 1
};

export const mockPareto: ParetoAnalysis = {
  id: 'pareto-1',
  name: 'Defect Types Analysis',
  categoryField: 'defectType',
  valueField: 'occurrences',
  threshold: 80,
  data: [
    { category: 'Dimensional defects', value: 145, percentage: 41.4, cumulative: 41.4 },
    { category: 'Surface finish', value: 98, percentage: 28.0, cumulative: 69.4 },
    { category: 'Material cracks', value: 52, percentage: 14.9, cumulative: 84.3 },
    { category: 'Assembly errors', value: 35, percentage: 10.0, cumulative: 94.3 },
    { category: 'Color mismatch', value: 12, percentage: 3.4, cumulative: 97.7 },
    { category: 'Other', value: 8, percentage: 2.3, cumulative: 100.0 }
  ]
};

export const mockFMEA: FMEAAnalysis = {
  id: 'fmea-1',
  name: 'Assembly Process FMEA',
  type: 'process',
  items: [
    {
      id: 'fmea-item-1',
      step: 'Component alignment',
      function: 'Ensure proper part positioning',
      failureMode: 'Misalignment of components',
      effect: 'Assembly rejection, rework required',
      severity: 8,
      cause: 'Worn alignment jig',
      occurrence: 6,
      currentControlsPrev: 'Visual inspection',
      currentControlsDet: 'Final dimensional check',
      detection: 4,
      rpn: 192,
      recommendedActions: 'Replace alignment jig, implement automated vision system',
      actionOwner: 'Manufacturing Engineer',
      targetDate: '2025-12-15',
      status: 'in-progress',
      evidenceRefs: ['ev-14']
    },
    {
      id: 'fmea-item-2',
      step: 'Torque application',
      function: 'Apply specified torque to fasteners',
      failureMode: 'Under-torqued fasteners',
      effect: 'Joint failure in field',
      severity: 9,
      cause: 'Torque wrench calibration drift',
      occurrence: 4,
      currentControlsPrev: 'Quarterly calibration',
      currentControlsDet: 'Torque audit sampling',
      detection: 5,
      rpn: 180,
      recommendedActions: 'Monthly calibration, torque verification every shift',
      actionOwner: 'Quality Engineer',
      targetDate: '2025-11-30',
      status: 'completed',
      postSeverity: 9,
      postOccurrence: 2,
      postDetection: 3,
      postRpn: 54,
      evidenceRefs: ['ev-15']
    },
    {
      id: 'fmea-item-3',
      step: 'Adhesive application',
      function: 'Bond components',
      failureMode: 'Insufficient adhesive coverage',
      effect: 'Bond failure',
      severity: 7,
      cause: 'Applicator nozzle clogging',
      occurrence: 5,
      currentControlsPrev: 'Daily nozzle check',
      currentControlsDet: 'Visual inspection',
      detection: 6,
      rpn: 210,
      recommendedActions: 'Automated dispensing system with flow monitoring',
      actionOwner: 'Process Engineer',
      targetDate: '2025-12-31',
      status: 'open',
      evidenceRefs: []
    }
  ]
};

export const mockFaultTree: FaultTree = {
  id: 'fta-1',
  name: 'System Failure Analysis',
  topEvent: 'top-event',
  events: [
    {
      id: 'top-event',
      type: 'gate',
      name: 'Complete system shutdown',
      description: 'Production system completely stops',
      gateType: 'OR',
      children: ['power-failure', 'control-failure'],
      evidenceRefs: []
    },
    {
      id: 'power-failure',
      type: 'gate',
      name: 'Power system failure',
      description: 'Loss of electrical power',
      gateType: 'OR',
      children: ['grid-failure', 'backup-failure'],
      evidenceRefs: [],
      parentId: 'top-event'
    },
    {
      id: 'grid-failure',
      type: 'basic',
      name: 'Grid power loss',
      description: 'External power grid failure',
      probability: 0.02,
      children: [],
      evidenceRefs: ['ev-16'],
      parentId: 'power-failure'
    },
    {
      id: 'backup-failure',
      type: 'gate',
      name: 'Backup power failure',
      description: 'UPS and generator both fail',
      gateType: 'AND',
      children: ['ups-failure', 'generator-failure'],
      evidenceRefs: [],
      parentId: 'power-failure'
    },
    {
      id: 'ups-failure',
      type: 'basic',
      name: 'UPS failure',
      description: 'Uninterruptible power supply fails',
      probability: 0.05,
      children: [],
      evidenceRefs: ['ev-17'],
      parentId: 'backup-failure'
    },
    {
      id: 'generator-failure',
      type: 'basic',
      name: 'Generator failure',
      description: 'Emergency generator fails to start',
      probability: 0.08,
      children: [],
      evidenceRefs: [],
      parentId: 'backup-failure'
    },
    {
      id: 'control-failure',
      type: 'gate',
      name: 'Control system failure',
      description: 'PLC or control network fails',
      gateType: 'OR',
      children: ['plc-failure', 'network-failure'],
      evidenceRefs: [],
      parentId: 'top-event'
    },
    {
      id: 'plc-failure',
      type: 'basic',
      name: 'PLC malfunction',
      description: 'Programmable Logic Controller fails',
      probability: 0.03,
      children: [],
      evidenceRefs: ['ev-18'],
      parentId: 'control-failure'
    },
    {
      id: 'network-failure',
      type: 'basic',
      name: 'Network communication loss',
      description: 'Control network failure',
      probability: 0.04,
      children: [],
      evidenceRefs: [],
      parentId: 'control-failure'
    }
  ],
  minimalCutSets: [
    ['grid-failure'],
    ['ups-failure', 'generator-failure'],
    ['plc-failure'],
    ['network-failure']
  ]
};

export const mockAffinity: AffinityDiagram = {
  id: 'affinity-1',
  name: 'Quality Issues Brainstorm',
  notes: [
    { id: 'note-1', text: 'Operators not following procedure', clusterId: 'cluster-1', x: 100, y: 100, color: '#FFB3BA' },
    { id: 'note-2', text: 'Training materials outdated', clusterId: 'cluster-1', x: 100, y: 180, color: '#FFB3BA' },
    { id: 'note-3', text: 'New hires lack experience', clusterId: 'cluster-1', x: 100, y: 260, color: '#FFB3BA' },
    { id: 'note-4', text: 'Equipment needs calibration', clusterId: 'cluster-2', x: 350, y: 100, color: '#BAFFC9' },
    { id: 'note-5', text: 'Tool wear exceeds limits', clusterId: 'cluster-2', x: 350, y: 180, color: '#BAFFC9' },
    { id: 'note-6', text: 'Sensor accuracy degraded', clusterId: 'cluster-2', x: 350, y: 260, color: '#BAFFC9' },
    { id: 'note-7', text: 'Raw material variability', clusterId: 'cluster-3', x: 600, y: 100, color: '#BAE1FF' },
    { id: 'note-8', text: 'Supplier changed formulation', clusterId: 'cluster-3', x: 600, y: 180, color: '#BAE1FF' },
    { id: 'note-9', text: 'Temperature control issues', clusterId: null, x: 350, y: 400, color: '#FFFFBA' },
    { id: 'note-10', text: 'Humidity fluctuations', clusterId: null, x: 450, y: 400, color: '#FFFFBA' }
  ],
  clusters: [
    { id: 'cluster-1', name: 'Human Factors', color: '#FFB3BA', noteIds: ['note-1', 'note-2', 'note-3'] },
    { id: 'cluster-2', name: 'Equipment Issues', color: '#BAFFC9', noteIds: ['note-4', 'note-5', 'note-6'] },
    { id: 'cluster-3', name: 'Material Quality', color: '#BAE1FF', noteIds: ['note-7', 'note-8'] }
  ]
};

export const mockScatter: ScatterAnalysis = {
  id: 'scatter-1',
  name: 'Temperature vs Defect Rate',
  xVar: 'Process Temperature (°C)',
  yVar: 'Defect Rate (%)',
  r: 0.78,
  r2: 0.61,
  p: 0.003,
  regressionLine: { slope: 0.15, intercept: -2.5 },
  data: [
    { id: 'dp-1', x: 85, y: 2.1, label: 'Batch 1', subgroup: 'Shift A' },
    { id: 'dp-2', x: 88, y: 2.8, label: 'Batch 2', subgroup: 'Shift A' },
    { id: 'dp-3', x: 90, y: 3.2, label: 'Batch 3', subgroup: 'Shift B' },
    { id: 'dp-4', x: 92, y: 3.9, label: 'Batch 4', subgroup: 'Shift A' },
    { id: 'dp-5', x: 87, y: 2.5, label: 'Batch 5', subgroup: 'Shift B' },
    { id: 'dp-6', x: 95, y: 4.5, label: 'Batch 6', subgroup: 'Shift A' },
    { id: 'dp-7', x: 89, y: 3.1, label: 'Batch 7', subgroup: 'Shift B' },
    { id: 'dp-8', x: 91, y: 3.6, label: 'Batch 8', subgroup: 'Shift A' },
    { id: 'dp-9', x: 93, y: 4.2, label: 'Batch 9', subgroup: 'Shift B' },
    { id: 'dp-10', x: 86, y: 2.3, label: 'Batch 10', subgroup: 'Shift A' },
    { id: 'dp-11', x: 94, y: 4.8, label: 'Batch 11', subgroup: 'Shift B', isOutlier: true },
    { id: 'dp-12', x: 88, y: 2.9, label: 'Batch 12', subgroup: 'Shift A' },
    { id: 'dp-13', x: 96, y: 5.1, label: 'Batch 13', subgroup: 'Shift B' },
    { id: 'dp-14', x: 90, y: 3.4, label: 'Batch 14', subgroup: 'Shift A' },
    { id: 'dp-15', x: 92, y: 4.0, label: 'Batch 15', subgroup: 'Shift B' }
  ]
};

export const mockEvidence = [
  { id: 'ev-1', type: 'file' as const, title: 'Production log 2025-11-01', description: '4-hour stoppage recorded', linkedTo: ['root'], createdAt: '2025-11-01T14:30:00Z', createdBy: 'John Doe' },
  { id: 'ev-2', type: 'image' as const, title: 'Motor temperature readings', description: 'Thermal imaging showing 95°C', linkedTo: ['why1-a'], createdAt: '2025-11-01T15:00:00Z', createdBy: 'Jane Smith' },
  { id: 'ev-3', type: 'file' as const, title: 'Cooling system diagnostic', linkedTo: ['why2-a'], createdAt: '2025-11-01T16:00:00Z', createdBy: 'John Doe' },
  { id: 'ev-4', type: 'note' as const, title: 'Coolant measurement', description: 'Level at 35% (min required: 50%)', linkedTo: ['why3-a'], createdAt: '2025-11-01T16:30:00Z', createdBy: 'Maintenance Team' },
  { id: 'ev-5', type: 'file' as const, title: 'Training completion records', linkedTo: ['p1'], createdAt: '2025-10-15T10:00:00Z', createdBy: 'HR Manager' },
  { id: 'ev-6', type: 'file' as const, title: 'Turnover analysis Q3', linkedTo: ['p2'], createdAt: '2025-10-01T09:00:00Z', createdBy: 'HR Manager' },
  { id: 'ev-7', type: 'image' as const, title: 'Equipment wear photos', linkedTo: ['m1'], createdAt: '2025-10-20T14:00:00Z', createdBy: 'Maintenance Lead' },
  { id: 'ev-8', type: 'file' as const, title: 'Calibration drift report', linkedTo: ['m2'], createdAt: '2025-10-25T11:00:00Z', createdBy: 'Quality Engineer' },
  { id: 'ev-9', type: 'file' as const, title: 'Quality audit findings', linkedTo: ['mt2'], createdAt: '2025-10-18T13:00:00Z', createdBy: 'QA Manager' },
  { id: 'ev-10', type: 'file' as const, title: 'Material inspection data', linkedTo: ['mat1'], createdAt: '2025-10-22T08:00:00Z', createdBy: 'QC Inspector' },
  { id: 'ev-11', type: 'file' as const, title: 'Supplier quality metrics', linkedTo: ['mat2'], createdAt: '2025-10-19T12:00:00Z', createdBy: 'Procurement' },
  { id: 'ev-12', type: 'file' as const, title: 'Gage R&R study', linkedTo: ['ms1'], createdAt: '2025-10-21T10:00:00Z', createdBy: 'Metrology Lab' },
  { id: 'ev-13', type: 'file' as const, title: 'Environmental monitoring log', linkedTo: ['e1'], createdAt: '2025-10-23T15:00:00Z', createdBy: 'Facilities' },
  { id: 'ev-14', type: 'image' as const, title: 'Jig wear measurement', linkedTo: ['fmea-item-1'], createdAt: '2025-10-28T14:00:00Z', createdBy: 'Manufacturing Engineer' },
  { id: 'ev-15', type: 'file' as const, title: 'Torque audit data', linkedTo: ['fmea-item-2'], createdAt: '2025-10-29T09:00:00Z', createdBy: 'Quality Engineer' },
  { id: 'ev-16', type: 'file' as const, title: 'Power outage log', linkedTo: ['grid-failure'], createdAt: '2025-10-16T16:00:00Z', createdBy: 'Facilities' },
  { id: 'ev-17', type: 'file' as const, title: 'UPS maintenance records', linkedTo: ['ups-failure'], createdAt: '2025-10-17T11:00:00Z', createdBy: 'Electrical Team' },
  { id: 'ev-18', type: 'file' as const, title: 'PLC diagnostic log', linkedTo: ['plc-failure'], createdAt: '2025-10-24T13:00:00Z', createdBy: 'Controls Engineer' }
];

export const mockActions = [
  {
    id: 'action-1',
    title: 'Implement automated coolant monitoring',
    description: 'Install level sensors with alerts when coolant falls below 60%',
    owner: 'Maintenance Lead',
    dueDate: '2025-12-15',
    priority: 'high' as const,
    status: 'in-progress' as const,
    linkedTo: [{ method: '5whys' as const, nodeId: 'why3-a' }],
    effectivenessCheck: 'Monitor for 30 days with no coolant-related stoppages',
    createdAt: '2025-11-02T10:00:00Z'
  },
  {
    id: 'action-2',
    title: 'Revise and enforce maintenance schedule',
    description: 'Update PM schedule and implement digital tracking with mandatory sign-offs',
    owner: 'Operations Manager',
    dueDate: '2025-11-30',
    priority: 'critical' as const,
    status: 'in-progress' as const,
    linkedTo: [{ method: '5whys' as const, nodeId: 'why5-a' }],
    effectivenessCheck: '100% completion rate for 3 consecutive months',
    createdAt: '2025-11-02T10:15:00Z'
  },
  {
    id: 'action-3',
    title: 'Replace alignment jig',
    description: 'Order and install new precision alignment jig with automated verification',
    owner: 'Manufacturing Engineer',
    dueDate: '2025-12-15',
    priority: 'high' as const,
    status: 'in-progress' as const,
    linkedTo: [{ method: 'fmea' as const, nodeId: 'fmea-item-1' }],
    createdAt: '2025-11-02T11:00:00Z'
  },
  {
    id: 'action-4',
    title: 'Monthly torque wrench calibration',
    description: 'Increase calibration frequency from quarterly to monthly',
    owner: 'Quality Engineer',
    dueDate: '2025-11-30',
    priority: 'high' as const,
    status: 'completed' as const,
    linkedTo: [{ method: 'fmea' as const, nodeId: 'fmea-item-2' }],
    effectivenessCheck: 'RPN reduced from 180 to 54',
    createdAt: '2025-11-02T11:30:00Z'
  }
];

export const mockProject: RCAProject = {
  id: 'project-1',
  title: 'Production Quality Investigation - Q4 2025',
  problemStatement: 'Product defect rate increased from 2% to 8% over the past month, causing customer complaints and increased scrap costs.',
  createdBy: 'Quality Manager',
  createdAt: '2025-11-01T08:00:00Z',
  updatedAt: '2025-11-05T14:30:00Z',
  currentMethod: '5whys',
  fiveWhyTrees: [mockFiveWhyTree],
  fishboneDiagrams: [mockFishbone],
  paretoAnalyses: [mockPareto],
  fmeaAnalyses: [mockFMEA],
  faultTrees: [mockFaultTree],
  affinityDiagrams: [mockAffinity],
  scatterAnalyses: [mockScatter],
  evidence: mockEvidence,
  actions: mockActions,
  versions: [],
  locale: 'en-US'
};