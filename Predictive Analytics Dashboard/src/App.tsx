import { useState, useEffect } from 'react';
import { PredictiveHeader } from './components/predictive-header';
import { KPICards } from './components/kpi-cards';
import { ForecastChart } from './components/forecast-chart';
import { ScenarioSimulator } from './components/scenario-simulator';
import { InsightsDrawer } from './components/insights-drawer';
import { Toaster } from './components/ui/sonner';
import {
  generateHistoricalData,
  generateForecast,
  specLimits,
  generateShapValues,
  getAnomalyDetails,
  generateDriftMetrics,
  calculateRisk,
  type DataPoint,
  type ForecastPoint,
  type RiskMetrics
} from './lib/mock-data';
import { 
  downloadJSON, 
  downloadCSV, 
  exportRiskCSV, 
  generatePDFSummary,
  createAuditEntry,
  type AIReportData,
  type AuditLogEntry
} from './lib/export-utils';
import { toast } from 'sonner';

export default function App() {
  // Context state
  const [site, setSite] = useState('Austin-TX');
  const [line, setLine] = useState('Line-A');
  const [product, setProduct] = useState('SKU-8472');
  const [feature, setFeature] = useState('Thickness (mm)');
  const [shift, setShift] = useState('All');
  const [horizonHours, setHorizonHours] = useState(24);

  // Data state
  const [historicalData, setHistoricalData] = useState<DataPoint[]>([]);
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Audit log
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'risk' | 'mean' | 'variability' | 'condition' | 'anomaly' | null>(null);

  // AI insights
  const shapValues = generateShapValues();
  const driftMetrics = generateDriftMetrics();
  const [aiCondition, setAiCondition] = useState<'Normal' | 'Warning' | 'Alert'>('Warning');
  const [aiReasons, setAiReasons] = useState<string[]>(['Moderate drift detected', 'Tool age approaching threshold']);

  // Initialize data
  useEffect(() => {
    recomputeData();
  }, []);

  const recomputeData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const historical = generateHistoricalData(200);
      const forecast = generateForecast(horizonHours);
      const risk = calculateRisk(forecast, specLimits);

      setHistoricalData(historical);
      setForecastData(forecast);
      setRiskMetrics(risk);
      setIsLoading(false);

      // Determine AI condition based on risk
      if (risk.expectedPPM > 2000) {
        setAiCondition('Alert');
        setAiReasons(['High PPM risk detected', 'Trend shift identified', 'Moderate drift detected']);
      } else if (risk.expectedPPM > 1000) {
        setAiCondition('Warning');
        setAiReasons(['Moderate drift detected', 'Tool age approaching threshold']);
      } else {
        setAiCondition('Normal');
        setAiReasons(['All systems nominal']);
      }
    }, 800);
  };

  const handleCardClick = (cardType: 'risk' | 'mean' | 'variability' | 'condition') => {
    setDrawerType(cardType);
    setDrawerOpen(true);
  };

  const handleAnomalyClick = (anomaly: DataPoint) => {
    setDrawerType('anomaly');
    setDrawerOpen(true);
  };

  const handleSimulate = (deltaTarget: number, sigmaReduction: number) => {
    console.log('Running simulation with:', { deltaTarget, sigmaReduction });
    // In a real app, this would trigger a new forecast calculation
  };

  const handleExport = () => {
    if (!riskMetrics) return;
    
    // Build complete AI report data
    const reportData: AIReportData = {
      config: {
        site,
        line,
        product,
        feature,
        shift,
        dateRange: {
          start: historicalData[0]?.timestamp.toISOString() || new Date().toISOString(),
          end: historicalData[historicalData.length - 1]?.timestamp.toISOString() || new Date().toISOString()
        },
        horizonHours,
        modelType: 'Temporal Fusion Transformer (TFT)',
        modelVersion: 'v2.3.1',
        lastTrained: '2025-11-05 14:32 UTC',
        trainingWindow: 500,
        predictionInterval: 95,
        uncertaintyMethod: 'Conformal Prediction + Quantile Regression',
        ewmaLambda: 0.2,
        cusumK: 0.5,
        cusumH: 5,
        isolationForestContamination: 0.05,
        psiThresholds: { small: 0.1, moderate: 0.25, large: 0.5 },
        ksSignificance: 0.05,
        user: 'Current User',
        timestamp: new Date().toISOString(),
        approvals: []
      },
      riskMetrics: {
        probabilityLSL: riskMetrics.probabilityLSL,
        probabilityUSL: riskMetrics.probabilityUSL,
        expectedPPM: riskMetrics.expectedPPM,
        forecastedYield: riskMetrics.forecastedYield,
        zRisk: riskMetrics.zRisk,
        projectedCpk: riskMetrics.projectedCpk
      },
      forecast: {
        horizon: horizonHours,
        predictedMean: forecastData[0]?.median || 50,
        predictedSigma: 1.2,
        piLevel: 95,
        lowerBound: forecastData[0]?.lower95 || 0,
        upperBound: forecastData[0]?.upper95 || 0
      },
      performance: {
        rmse: 0.82,
        mae: 0.65,
        mape: 3.2,
        smape: 3.1,
        mase: 0.76,
        calibrationScore: 0.94,
        empiricalCoverage: 0.948
      },
      drift: {
        psi: driftMetrics.psi,
        ksStatistic: driftMetrics.ksStatistic,
        conceptDrift: driftMetrics.conceptDrift,
        dataQualityScore: driftMetrics.dataQualityScore
      },
      anomalies: {
        count: anomalyDetails.length,
        highSeverity: anomalyDetails.filter(a => a.severity === 'high').length,
        mediumSeverity: anomalyDetails.filter(a => a.severity === 'medium').length,
        lowSeverity: anomalyDetails.filter(a => a.severity === 'low').length,
        detectionMethods: ['EWMA', 'CUSUM', 'Isolation Forest', 'Autoencoder']
      },
      topDrivers: shapValues.slice(0, 5)
    };
    
    // Export JSON
    downloadJSON(reportData, `ai-report-${site}-${line}-${new Date().toISOString().split('T')[0]}.json`);
    
    // Create audit entry
    const auditEntry = createAuditEntry(
      'Current User',
      'Export AI Report',
      'v2.3.1',
      { site, line, product, feature, horizonHours }
    );
    setAuditLog([...auditLog, auditEntry]);
    
    toast.success('AI report exported successfully!');
  };

  const anomalyDetails = historicalData.length > 0 ? getAnomalyDetails(historicalData) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PredictiveHeader
        site={site}
        line={line}
        product={product}
        feature={feature}
        shift={shift}
        horizonHours={horizonHours}
        onSiteChange={setSite}
        onLineChange={setLine}
        onProductChange={setProduct}
        onFeatureChange={setFeature}
        onShiftChange={setShift}
        onHorizonChange={(value) => setHorizonHours(value[0])}
        onRecompute={recomputeData}
        onExport={handleExport}
      />

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Computing forecasts and AI insights...</p>
            </div>
          </div>
        ) : (
          <>
            {riskMetrics && (
              <KPICards
                riskMetrics={riskMetrics}
                predictedMean={forecastData.length > 0 ? forecastData[0].median : 50}
                predictedSigma={1.2}
                aiCondition={aiCondition}
                aiReasons={aiReasons}
                onCardClick={handleCardClick}
              />
            )}

            <ForecastChart
              historicalData={historicalData}
              forecastData={forecastData}
              specLimits={specLimits}
              onAnomalyClick={handleAnomalyClick}
            />

            {riskMetrics && (
              <ScenarioSimulator
                currentRisk={riskMetrics}
                onSimulate={handleSimulate}
                onReset={() => console.log('Reset scenario')}
              />
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-100 rounded">
                    <svg className="size-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm">Predictive Maintenance</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tool RUL (Remaining Useful Life)</span>
                    <span>153 hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Failure Risk (next 24h)</span>
                    <span className="text-orange-600">8.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recommended Maintenance</span>
                    <span className="text-blue-600">Nov 12, 02:00</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    Weibull analysis suggests scheduling maintenance during the next planned downtime to minimize OOS risk.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-100 rounded">
                    <svg className="size-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-sm">Causal Insights</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Intervention Impact:</span>
                    <div className="mt-2 space-y-2">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="flex justify-between">
                          <span>Coolant temp -2°C</span>
                          <span className="text-green-600">-180 PPM</span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="flex justify-between">
                          <span>Supplier change (B→A)</span>
                          <span className="text-green-600">-120 PPM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 p-2 bg-green-50 rounded border border-green-200">
                    Propensity score matching indicates coolant optimization has highest expected uplift with 95% confidence.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <svg className="size-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Governance & Compliance</p>
                  <p>
                    All AI predictions and recommendations are logged for audit. Model version v2.3.1 (TFT) validated per SOP-QA-147. 
                    MSA R&R study current (Gage ID: G-847, Cg/Cgk &gt; 1.33). Projected Cpk values are informational only and require 
                    QE approval before process changes. Links: 
                    <button className="text-blue-600 underline ml-1">View Control Chart</button> | 
                    <button className="text-blue-600 underline ml-1">Open Capability Analysis</button> | 
                    <button className="text-blue-600 underline ml-1">Audit Log</button>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <InsightsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        drawerType={drawerType}
        shapValues={shapValues}
        anomalyDetails={anomalyDetails}
        driftMetrics={driftMetrics}
      />

      <Toaster />
    </div>
  );
}