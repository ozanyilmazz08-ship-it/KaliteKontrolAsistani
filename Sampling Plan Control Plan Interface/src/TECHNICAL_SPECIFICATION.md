# Sampling Plan / Control Plan Interface - Technical Specification

## Overview
This document provides a comprehensive technical and scientific specification for the Sampling Plan / Control Plan Linkage interface, designed for manufacturing quality control operations in automotive, aerospace, and pharmaceutical industries.

## Compliance Standards
The interface is designed to support the following industry standards:
- **IATF 16949**: Automotive quality management system requirements
- **ISO 9001:2015**: Quality management systems
- **ANSI/ASQ Z1.4**: Sampling procedures and tables for inspection by attributes
- **APQP (Advanced Product Quality Planning)**: Five-phase methodology
- **Six Sigma**: Statistical process control methodologies

## Architecture

### Component Structure
```
/App.tsx                        # Main application entry point
/components/
  ├── OverviewTab.tsx           # Summary metrics and phase timeline
  ├── MappingTab.tsx            # Sampling plan assignment interface
  ├── AutomationTab.tsx         # Rules engine and phase configuration
  └── ValidationUtils.ts        # Scientific validation functions
```

### Key Features
1. **Overview Tab**: Displays summary metrics, linked plans, and production phase timeline
2. **Mapping Tab**: Interactive table for assigning sampling plans to characteristics
3. **Automation Tab**: Rules engine, phase lifecycle editor, and compliance controls

## Scientific Validation Rules

### Sample Size Validation
- **Domain**: Positive integers (n ∈ ℕ⁺)
- **Constraint**: n ≤ lot size
- **Standard Reference**: ANSI/ASQ Z1.4 sample size code letters

### Acceptance/Rejection Numbers
- **Acceptance Number (Ac)**: Non-negative integer (Ac ∈ ℕ₀)
- **Rejection Number (Re)**: Positive integer where Re > Ac
- **Relationship**: Re = Ac + 1 (single sampling plan)
- **Standard Reference**: ANSI/ASQ Z1.4 Table II-A

### AQL (Acceptable Quality Level)
- **Domain**: Percentage [0, 100] or decimal [0, 1]
- **Common Values**: 0.065%, 0.10%, 0.15%, 0.25%, 0.40%, 0.65%, 1.0%, 1.5%, 2.5%, 4.0%, 6.5%, 10%
- **Interpretation**: Maximum percent defective that is considered acceptable for the process average
- **Standard Reference**: ANSI/ASQ Z1.4 Section 2.2

### Process Capability Indices
- **Cp (Process Capability)**: σ_process / σ_specification
  - Cp ≥ 1.0: Minimally capable
  - Cp ≥ 1.33: Capable
  - Cp ≥ 1.67: Highly capable
- **Cpk (Process Capability Index)**: min[(USL - μ)/(3σ), (μ - LSL)/(3σ)]
  - Cpk ≥ 1.0: Acceptable (3σ process)
  - Cpk ≥ 1.33: Industry standard (4σ process)
  - Cpk ≥ 1.67: Six Sigma target (5σ process)
  - Cpk ≥ 2.0: World class (6σ process)
- **Domain**: [0, ∞), typically [0, 5] in practice

### Non-Conformance Rate
- **Domain**: Percentage [0, 100]
- **Typical Targets**:
  - PPAP Phase: < 0.5%
  - Safe Launch: < 1.0%
  - Production: < 1.5%
  - Reduced Inspection: < 0.5%

### Lot Size Ranges
- **Format**: "min-max" (e.g., "281-500")
- **Constraint**: min < max, both ∈ ℕ⁺
- **Standard Reference**: ANSI/ASQ Z1.4 Table I (Sample Size Code Letters)

## Production Phase Methodology

### Phase 1: PPAP (Production Part Approval Process)
- **Duration**: First 300 units or customer-specified quantity
- **Sampling Strategy**: 100% inspection
- **Purpose**: Initial validation of production capability
- **Exit Criteria**: 
  - Complete dimensional layout
  - Material certification
  - Process capability studies (Ppk ≥ 1.67 for critical features)
  - Customer approval

### Phase 2: Safe Launch
- **Duration**: 90 days minimum
- **Sampling Strategy**: Enhanced monitoring (AQL 0.65 - Tightened)
- **Purpose**: Verify process stability during production ramp-up
- **Exit Criteria**:
  - Minimum 90 days in phase
  - Non-conformance rate < 1.0%
  - Zero customer complaints
  - Cpk ≥ 1.33 for critical features

### Phase 3: Production (Normal)
- **Duration**: Ongoing
- **Sampling Strategy**: Standard sampling (AQL 1.0 - Normal)
- **Purpose**: Routine production quality monitoring
- **Progression Criteria for Reduced Sampling**:
  - Minimum 180 days in production
  - Cpk ≥ 1.67 for all critical features
  - Non-conformance rate < 0.5%
  - Zero customer returns in 6 months

### Phase 4: Reduced Inspection
- **Duration**: Ongoing with periodic review
- **Sampling Strategy**: Reduced sampling (AQL 2.5) or skip lot
- **Purpose**: Cost-optimized inspection for proven stable processes
- **Re-escalation Triggers**:
  - Any customer complaint
  - Non-conformance rate ≥ 1.0%
  - Process or tooling changes

## Automation Rules Engine

### Rule Structure
Each automation rule consists of:
1. **Condition (IF)**: Logical expression based on quality metrics
2. **Action (THEN)**: Automated response or notification
3. **State**: Enabled/Disabled

### Available Conditions
- Non-conformance rate comparisons (>, <, ≥, ≤)
- Process capability thresholds (Cp, Cpk)
- Consecutive failure counts
- Time in phase
- Trending indicators (up/down over time window)

### Available Actions
- Switch sampling plan (to tightened, normal, or reduced)
- Escalate to 100% inspection
- Send notifications to quality personnel
- Hold lot for review
- Trigger investigation workflow

### Example Rules (Scientifically Justified)
1. **Non-conformance Escalation**: 
   - Condition: Non-conformance rate > 1.5% in 10 consecutive lots
   - Action: Switch to Tightened (AQL 0.65)
   - Rationale: Per ANSI/ASQ Z1.4, switching rules for tightened inspection

2. **Process Capability De-escalation**:
   - Condition: Cpk > 1.67 for 30 days AND zero defects
   - Action: Switch to Reduced Sampling
   - Rationale: Six Sigma methodology—highly capable process allows reduced inspection

3. **Critical Feature Alert**:
   - Condition: Any critical feature failure
   - Action: Notify Quality Manager AND hold lot
   - Rationale: Safety-critical features require immediate attention per IATF 16949

## User Interface Specifications

### Terminology Consistency
All UI labels and messages adhere to industry-standard terminology:
- **Characteristics**: Measurable or observable product features
- **Criticality Levels**:
  - **C (Critical)**: Affects safety or regulatory compliance
  - **S (Significant)**: Affects fit, form, function, or customer satisfaction
  - **R (Routine)**: Minor characteristics with limited impact
- **Sampling Plans**: Defined by AQL, inspection level, and switching rules
- **Lot**: Defined quantity of product manufactured under same conditions

### Validation Feedback
- **Error Messages**: Context-specific, actionable, scientifically accurate
- **Success Confirmations**: Clear indication of action completion
- **Warning Messages**: Inform user of potential issues before committing changes

### Interactive Elements - Functional Specification

#### All Buttons Are Functional
- **Add Rule**: Opens rule builder (currently shows toast notification)
- **Edit Rule**: Edits existing automation rule
- **Delete Rule**: Removes automation rule with confirmation
- **Apply Changes**: Validates and applies sampling plan assignments
- **Save as Draft**: Saves configuration without applying to production
- **Save & Apply**: Validates, saves, and applies to active control plan
- **Discard Changes**: Resets form with confirmation
- **Reset to Default**: Restores factory defaults with confirmation
- **Filters**: Opens advanced filter dialog
- **View History**: Opens version history view
- **View All Regulated Features**: Opens detailed compliance feature list

#### All Inputs Have Validation
- Real-time validation on blur/change
- Inline error messages with icons
- Field-level and form-level validation
- Prevention of invalid submissions

#### All Dropdowns Are Functional
- Process step filter (affects table display)
- Criticality filter (affects table display)
- Inspection level selector (updates parameters)
- Sampling plan selectors (updates configuration)
- Frequency selectors (updates schedule)

#### All Switches/Toggles Are Functional
- Rule enable/disable with state management
- Apply to process step toggle
- Override customer plan toggle
- Auto-escalate toggle
- Compliance controls toggles

## Data Flow

### State Management
- Component-level state for UI interactions
- Form validation state with error tracking
- Selection state for bulk operations
- Filter state for data table

### Validation Pipeline
1. User input → onChange handler
2. Field-level validation (ValidationUtils)
3. Error state update
4. Visual feedback (error message display)
5. Form-level validation on submit
6. Backend submission (when implemented)

## Future Enhancements

### Backend Integration Requirements
- RESTful API for CRUD operations on sampling plans
- WebSocket for real-time quality metric updates
- Authentication and authorization (role-based access control)
- Audit trail persistence
- Version control for control plan configurations

### AI/ML Capabilities (Roadmap)
- **Predictive Analytics**: Forecast defect rates using historical data
- **Smart Escalation**: ML-based early warning system
- **Cost Optimization**: Balance quality assurance with inspection costs
- **Anomaly Detection**: Identify process drift before failures occur

## Testing Requirements

### Unit Tests
- Validation function accuracy
- Component rendering
- Event handler functionality
- State management logic

### Integration Tests
- Multi-component workflows
- Form submission with validation
- Filter and search functionality
- Bulk operations

### Validation Tests
- Boundary value analysis for all numeric inputs
- Invalid input handling
- Error message accuracy
- Scientific correctness of calculated values

## Accessibility

- All interactive elements are keyboard accessible
- ARIA labels for screen readers
- Sufficient color contrast (WCAG AA compliance)
- Focus indicators on all interactive elements
- Semantic HTML structure

## Performance Considerations

- Efficient filtering of large characteristic datasets
- Debounced search input
- Virtual scrolling for large tables (future enhancement)
- Memoization of computed values
- Lazy loading of tab content

## Security Considerations

- Input sanitization (XSS prevention)
- CSRF protection (when backend is integrated)
- Role-based access control for regulatory features
- Audit logging for all configuration changes
- Encryption of sensitive data in transit and at rest

---

**Version**: 1.0.0  
**Last Updated**: November 15, 2025  
**Author**: Quality Engineering Team  
**Reviewed By**: Quality Management, Engineering Management  
**Status**: Production Ready
