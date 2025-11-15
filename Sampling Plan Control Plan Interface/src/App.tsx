import { useState } from 'react';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { HelpCircle, History } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { OverviewTab } from './components/OverviewTab';
import { MappingTab } from './components/MappingTab';
import { AutomationTab } from './components/AutomationTab';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleDiscardChanges = () => {
    if (confirm('Are you sure you want to discard all changes? This action cannot be undone.')) {
      toast.info('Changes discarded');
      // In production, this would reset the form state
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Reset all configurations to default values? This will override any custom settings.')) {
      toast.success('Configuration reset to defaults');
      // In production, this would restore default values
    }
  };

  const handleSaveAsDraft = () => {
    toast.success('Changes saved as draft');
    // In production, this would save to backend with draft status
  };

  const handleSaveAndApply = () => {
    toast.success('Changes saved and applied to control plan');
    // In production, this would validate and save to backend, then apply to production
  };

  const handleViewHistory = () => {
    toast.info('Opening version history');
    // In production, this would open a history dialog or navigate to history view
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header Bar */}
      <div className="border-b bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h2 className="mb-1">Sampling Plan / Control Plan Linkage</h2>
            <p className="text-slate-600">Engine Block Assembly • Line A3 • Customer: Premium Auto Corp</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Link sampling inspection strategies with control plans to ensure quality compliance and traceability.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleViewHistory}>
                    <History className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View version history</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active Control Plan v5.2
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            IATF 16949
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            ISO 9001:2015
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            APQP Phase: Production
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b bg-slate-50 px-6">
          <TabsList className="bg-transparent h-12">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="mapping" className="data-[state=active]:bg-white">
              Sampling Plan Mapping
            </TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-white">
              Advanced Rules & Automation
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="overview" className="m-0 p-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="mapping" className="m-0 p-0 h-full">
            <MappingTab />
          </TabsContent>

          <TabsContent value="automation" className="m-0 p-6">
            <AutomationTab />
          </TabsContent>
        </div>
      </Tabs>

      {/* Bottom Action Bar */}
      <div className="border-t bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleDiscardChanges}>
            Discard Changes
          </Button>
          <Button variant="outline" onClick={handleResetToDefault}>
            Reset to Default
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveAsDraft}>
            Save as Draft
          </Button>
          <Button onClick={handleSaveAndApply}>
            Save & Apply
          </Button>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}