import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Info, Lock, AlertTriangle } from 'lucide-react';
import { FormulaTooltip } from './formula-tooltip';

interface ModelConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentConfig: ModelConfig;
  onConfigChange: (config: Partial<ModelConfig>) => void;
  userRole: 'viewer' | 'engineer' | 'admin';
}

export interface ModelConfig {
  modelType: 'auto' | 'arima' | 'ets' | 'gbm' | 'lstm' | 'tft';
  autoSelection: boolean;
  uncertaintyMethod: 'conformal' | 'quantile' | 'bootstrap' | 'native';
  predictionInterval: 80 | 90 | 95 | 99;
  retrainPolicy: 'manual' | 'schedule' | 'drift-trigger';
  retrainThreshold: number; // PSI threshold for auto-retrain
  lastRetrain: string;
  lastBacktest: string;
  backtestWindow: number; // hours
  conformalCalibrationSize: number;
  version: string;
}

export function ModelConfigurationModal({
  open,
  onOpenChange,
  currentConfig,
  onConfigChange,
  userRole
}: ModelConfigurationModalProps) {
  const canEdit = userRole === 'engineer' || userRole === 'admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Model Configuration & Provenance
            {!canEdit && <Lock className="size-4 text-muted-foreground" />}
          </DialogTitle>
          <DialogDescription>
            Configure forecasting model selection, uncertainty quantification, and retraining policies.
            Changes require quality engineer approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Model Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                Model Selection Strategy
                <FormulaTooltip
                  title="Model Selection"
                  formula="Auto: AIC/BIC comparison → Best model"
                  explanation="Automatic selection evaluates ARIMA, ETS, GBM, and deep learning models using information criteria and cross-validation."
                  reference="Hyndman & Athanasopoulos, Ch. 7"
                />
              </Label>
              <Badge variant={currentConfig.autoSelection ? 'default' : 'secondary'}>
                {currentConfig.autoSelection ? 'Auto' : 'Manual'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={currentConfig.autoSelection}
                onCheckedChange={(checked) => onConfigChange({ autoSelection: checked })}
                disabled={!canEdit}
                aria-label="Enable automatic model selection"
              />
              <span className="text-sm text-muted-foreground">Enable automatic model selection</span>
            </div>

            {!currentConfig.autoSelection && (
              <Select
                value={currentConfig.modelType}
                onValueChange={(value) => onConfigChange({ modelType: value as ModelConfig['modelType'] })}
                disabled={!canEdit}
              >
                <SelectTrigger aria-label="Select forecasting model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arima">ARIMA/Seasonal ARIMA</SelectItem>
                  <SelectItem value="ets">Exponential Smoothing (ETS)</SelectItem>
                  <SelectItem value="gbm">Gradient Boosting (XGBoost/LightGBM)</SelectItem>
                  <SelectItem value="lstm">LSTM Recurrent Neural Network</SelectItem>
                  <SelectItem value="tft">Temporal Fusion Transformer</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <Separator />

          {/* Uncertainty Quantification */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              Uncertainty Quantification Method
              <FormulaTooltip
                title="Uncertainty Methods"
                formula="Conformal: C_n(x) = [Q_α/2(R), Q_1-α/2(R)]"
                explanation="Conformal prediction provides distribution-free, finite-sample coverage guarantees. Quantile regression estimates conditional quantiles directly."
                reference="Angelopoulos & Bates (2023); Koenker (2005)"
                assumptions={[
                  'Exchangeability (conformal)',
                  'Calibration set representative of deployment',
                  'No severe concept drift'
                ]}
              />
            </Label>
            <Select
              value={currentConfig.uncertaintyMethod}
              onValueChange={(value) => onConfigChange({ uncertaintyMethod: value as ModelConfig['uncertaintyMethod'] })}
              disabled={!canEdit}
            >
              <SelectTrigger aria-label="Select uncertainty method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conformal">Conformal Prediction (distribution-free)</SelectItem>
                <SelectItem value="quantile">Quantile Regression</SelectItem>
                <SelectItem value="bootstrap">Bootstrap Resampling</SelectItem>
                <SelectItem value="native">Model-Native (Parametric)</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Label>Prediction Interval Level</Label>
              <Select
                value={currentConfig.predictionInterval.toString()}
                onValueChange={(value) => onConfigChange({ predictionInterval: parseInt(value) as ModelConfig['predictionInterval'] })}
                disabled={!canEdit}
              >
                <SelectTrigger aria-label="Select prediction interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80">80% (±1.28σ)</SelectItem>
                  <SelectItem value="90">90% (±1.64σ)</SelectItem>
                  <SelectItem value="95">95% (±1.96σ)</SelectItem>
                  <SelectItem value="99">99% (±2.58σ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentConfig.uncertaintyMethod === 'conformal' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
                <div className="flex items-start gap-2">
                  <Info className="size-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Conformal Calibration</p>
                    <p className="text-blue-700">
                      Calibration set: {currentConfig.conformalCalibrationSize} recent observations
                      <br />
                      Empirical coverage: validated on holdout set
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Retraining Policy */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              Retraining Policy
              <FormulaTooltip
                title="Retraining Triggers"
                formula="Drift trigger: PSI > threshold → Retrain"
                explanation="Automatic retraining maintains model validity under distribution shift. Manual retraining allows expert intervention."
                reference="MLOps best practices; Ribeiro et al. (2016)"
              />
            </Label>
            <Select
              value={currentConfig.retrainPolicy}
              onValueChange={(value) => onConfigChange({ retrainPolicy: value as ModelConfig['retrainPolicy'] })}
              disabled={!canEdit}
            >
              <SelectTrigger aria-label="Select retraining policy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual (on engineer request)</SelectItem>
                <SelectItem value="schedule">Scheduled (e.g., weekly)</SelectItem>
                <SelectItem value="drift-trigger">Drift-Triggered (PSI threshold)</SelectItem>
              </SelectContent>
            </Select>

            {currentConfig.retrainPolicy === 'drift-trigger' && (
              <div className="space-y-2">
                <Label>PSI Threshold for Retrain</Label>
                <Select
                  value={currentConfig.retrainThreshold.toString()}
                  onValueChange={(value) => onConfigChange({ retrainThreshold: parseFloat(value) })}
                  disabled={!canEdit}
                >
                  <SelectTrigger aria-label="Select PSI threshold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">0.1 (Small drift)</SelectItem>
                    <SelectItem value="0.25">0.25 (Moderate drift)</SelectItem>
                    <SelectItem value="0.5">0.5 (Large drift)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          {/* Provenance & Audit */}
          <div className="space-y-3">
            <Label>Model Provenance</Label>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current Version</p>
                <p className="font-mono">{currentConfig.version}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Retrain</p>
                <p>{currentConfig.lastRetrain}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Backtest</p>
                <p>{currentConfig.lastBacktest}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Backtest Window</p>
                <p>{currentConfig.backtestWindow} hours</p>
              </div>
            </div>
          </div>

          {!canEdit && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-900">Restricted Access</p>
                  <p className="text-amber-700">
                    Model configuration changes require Quality Engineer or Administrator role.
                    Contact your system administrator for access.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {canEdit && (
            <Button onClick={() => {
              // Save configuration
              onOpenChange(false);
            }}>
              Save Configuration
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
