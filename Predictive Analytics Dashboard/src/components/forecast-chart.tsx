import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Scatter, ComposedChart } from 'recharts';
import { Card } from './ui/card';
import { DataPoint, ForecastPoint, SpecLimits } from '@/lib/mock-data';

interface ForecastChartProps {
  historicalData: DataPoint[];
  forecastData: ForecastPoint[];
  specLimits: SpecLimits;
  onAnomalyClick?: (anomaly: DataPoint) => void;
}

export function ForecastChart({ historicalData, forecastData, specLimits, onAnomalyClick }: ForecastChartProps) {
  // Combine historical and forecast data for the chart
  const combinedData = [
    ...historicalData.map(d => ({
      timestamp: d.timestamp.getTime(),
      value: d.value,
      isHistorical: true,
      isAnomaly: d.isAnomaly,
      anomalySeverity: d.anomalySeverity,
      anomalyReason: d.anomalyReason
    })),
    ...forecastData.map(f => ({
      timestamp: f.timestamp.getTime(),
      median: f.median,
      lower80: f.lower80,
      upper80: f.upper80,
      lower95: f.lower95,
      upper95: f.upper95,
      isForecast: true
    }))
  ];

  // Anomalies for scatter overlay
  const anomalies = historicalData
    .filter(d => d.isAnomaly)
    .map(d => ({
      timestamp: d.timestamp.getTime(),
      value: d.value,
      severity: d.anomalySeverity
    }));

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="text-sm mb-2">{formatTime(data.timestamp)}</p>
        {data.isHistorical && (
          <>
            <p className="text-sm">Value: <span className="font-semibold">{data.value?.toFixed(2)}</span></p>
            {data.isAnomaly && (
              <p className="text-sm text-orange-600">⚠ Anomaly: {data.anomalyReason}</p>
            )}
          </>
        )}
        {data.isForecast && (
          <>
            <p className="text-sm">Median: <span className="font-semibold">{data.median?.toFixed(2)}</span></p>
            <p className="text-sm text-muted-foreground">95% PI: [{data.lower95?.toFixed(2)}, {data.upper95?.toFixed(2)}]</p>
            <p className="text-sm text-muted-foreground">80% PI: [{data.lower80?.toFixed(2)}, {data.upper80?.toFixed(2)}]</p>
          </>
        )}
      </div>
    );
  };

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-gray-900">Time Series & Forecast</h3>
        <p className="text-sm text-muted-foreground">Historical measurements with anomalies and probabilistic forecast bands</p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatTime}
            type="number"
            domain={['dataMin', 'dataMax']}
            scale="time"
          />
          <YAxis domain={[40, 60]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Spec limits */}
          <ReferenceLine y={specLimits.USL} stroke="#ef4444" strokeDasharray="5 5" label="USL" />
          <ReferenceLine y={specLimits.Target} stroke="#22c55e" strokeDasharray="3 3" label="Target" />
          <ReferenceLine y={specLimits.LSL} stroke="#ef4444" strokeDasharray="5 5" label="LSL" />
          
          {/* 95% forecast band */}
          <Area
            type="monotone"
            dataKey="upper95"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.1}
            name="95% PI Upper"
          />
          <Area
            type="monotone"
            dataKey="lower95"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.1}
            name="95% PI Lower"
          />
          
          {/* 80% forecast band */}
          <Area
            type="monotone"
            dataKey="upper80"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.2}
            name="80% PI Upper"
          />
          <Area
            type="monotone"
            dataKey="lower80"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.2}
            name="80% PI Lower"
          />
          
          {/* Historical values */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1f2937"
            strokeWidth={1.5}
            dot={false}
            name="Historical"
            connectNulls={false}
          />
          
          {/* Forecast median */}
          <Line
            type="monotone"
            dataKey="median"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Forecast"
            connectNulls={false}
          />
          
          {/* Anomaly markers */}
          <Scatter
            data={anomalies}
            dataKey="value"
            fill="#f59e0b"
            shape="circle"
            name="Anomalies"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Anomaly Detected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-blue-500 opacity-20"></div>
          <span>Forecast Uncertainty Bands</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-red-500"></div>
          <span>Specification Limits</span>
        </div>
      </div>
    </Card>
  );
}
