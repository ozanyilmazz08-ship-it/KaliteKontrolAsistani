import { Search, Download, Share2, FileText, RefreshCw, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { format } from 'date-fns';
import { useState } from 'react';

interface PredictiveHeaderProps {
  site: string;
  line: string;
  product: string;
  feature: string;
  shift: string;
  horizonHours: number;
  onSiteChange: (value: string) => void;
  onLineChange: (value: string) => void;
  onProductChange: (value: string) => void;
  onFeatureChange: (value: string) => void;
  onShiftChange: (value: string) => void;
  onHorizonChange: (value: number[]) => void;
  onRecompute: () => void;
  onExport: () => void;
}

export function PredictiveHeader({
  site,
  line,
  product,
  feature,
  shift,
  horizonHours,
  onSiteChange,
  onLineChange,
  onProductChange,
  onFeatureChange,
  onShiftChange,
  onHorizonChange,
  onRecompute,
  onExport
}: PredictiveHeaderProps) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  return (
    <div className="border-b bg-background p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Predictive Analytics & AI Insights</h1>
          <p className="text-muted-foreground">Forward-looking forecasts, anomaly detection, and prescriptive actions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRecompute}>
            <RefreshCw className="size-4 mr-2" />
            Recompute
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="size-4 mr-2" />
            Export AI Report
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="size-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="size-4 mr-2" />
            Audit AI Actions
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-muted-foreground text-sm">Site:</label>
          <Select value={site} onValueChange={onSiteChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Austin-TX">Austin-TX</SelectItem>
              <SelectItem value="Detroit-MI">Detroit-MI</SelectItem>
              <SelectItem value="Phoenix-AZ">Phoenix-AZ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-muted-foreground text-sm">Line:</label>
          <Select value={line} onValueChange={onLineChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Line-A">Line-A</SelectItem>
              <SelectItem value="Line-B">Line-B</SelectItem>
              <SelectItem value="Line-C">Line-C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-muted-foreground text-sm">Product:</label>
          <Select value={product} onValueChange={onProductChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SKU-8472">SKU-8472</SelectItem>
              <SelectItem value="SKU-8473">SKU-8473</SelectItem>
              <SelectItem value="SKU-8474">SKU-8474</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-muted-foreground text-sm">Feature:</label>
          <Select value={feature} onValueChange={onFeatureChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Thickness (mm)">Thickness (mm)</SelectItem>
              <SelectItem value="Hardness (HRC)">Hardness (HRC)</SelectItem>
              <SelectItem value="Surface Finish (Ra)">Surface Finish (Ra)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-muted-foreground text-sm">Shift:</label>
          <Select value={shift} onValueChange={onShiftChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Day">Day</SelectItem>
              <SelectItem value="Night">Night</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-muted-foreground text-sm">Date Range:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-[220px] justify-start">
                <Calendar className="size-4 mr-2" />
                {dateRange.from && dateRange.to ? (
                  <>
                    {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                  </>
                ) : (
                  <span>Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 text-sm text-muted-foreground">
                Historical data window: Last 30 days
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <label className="text-muted-foreground text-sm">Forecast Horizon:</label>
          <div className="flex items-center gap-2">
            <Slider 
              value={[horizonHours]} 
              onValueChange={onHorizonChange}
              min={8}
              max={168}
              step={8}
              className="w-[140px]"
            />
            <Badge variant="secondary">{horizonHours}h</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}