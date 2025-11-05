import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Download, Share2, History, PanelRightOpen, PanelRightClose, CalendarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { format } from "date-fns";

type HeaderProps = {
  onTogglePanel: () => void;
  isPanelOpen: boolean;
};

export function Header({ onTogglePanel, isPanelOpen }: HeaderProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(2024, 10, 1),
    to: new Date(2024, 10, 30)
  });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-slate-900 mr-6">Capability & Performance</h1>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select defaultValue="site-1">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="site-1">Plant A</SelectItem>
                <SelectItem value="site-2">Plant B</SelectItem>
                <SelectItem value="site-3">Plant C</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="line-1">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Line" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line-1">Line 1</SelectItem>
                <SelectItem value="line-2">Line 2</SelectItem>
                <SelectItem value="line-3">Line 3</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="product-1">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product-1">Widget-X Pro</SelectItem>
                <SelectItem value="product-2">Widget-X Std</SelectItem>
                <SelectItem value="product-3">Widget-Y</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="part-1">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Part/Feature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="part-1">Diameter (outer)</SelectItem>
                <SelectItem value="part-2">Length</SelectItem>
                <SelectItem value="part-3">Thickness</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-64 justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                  <p className="text-sm text-slate-600 mb-2">Select date range for analysis</p>
                  <Calendar mode="single" />
                </div>
              </PopoverContent>
            </Popover>

            <Select defaultValue="phase-all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phase-all">All data</SelectItem>
                <SelectItem value="phase-1">Phase I baseline</SelectItem>
                <SelectItem value="phase-2">Phase II current</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            Audit History
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onTogglePanel}
          >
            {isPanelOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
