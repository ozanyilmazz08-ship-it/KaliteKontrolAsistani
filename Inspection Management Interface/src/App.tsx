import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Header } from "./components/Header";
import { ActionBar } from "./components/ActionBar";
import { PlansTab } from "./components/PlansTab";
import { ExecutionTab } from "./components/ExecutionTab";
import { DefectTrackingTab } from "./components/DefectTrackingTab";
import { ReportsTab } from "./components/ReportsTab";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [activeTab, setActiveTab] = useState("plans");
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSave = (isDraft: boolean = false) => {
    if (validationErrors.length > 0) {
      toast.error("Cannot save with validation errors");
      return;
    }
    
    setLastSaved(new Date());
    setHasChanges(false);
    
    if (isDraft) {
      toast.success("Configuration saved as draft");
    } else {
      toast.success("Configuration saved and applied successfully");
    }
  };

  const handleDiscard = () => {
    setHasChanges(false);
    toast.info("Changes discarded");
  };

  const handleReset = () => {
    setHasChanges(false);
    toast.info("Reset to default configuration");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
            <div className="container mx-auto px-6">
              <TabsList className="w-full justify-start h-14 bg-transparent border-b-0">
                <TabsTrigger 
                  value="plans" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-6"
                >
                  Plans & Sampling
                </TabsTrigger>
                <TabsTrigger 
                  value="execution"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-6"
                >
                  Execution
                </TabsTrigger>
                <TabsTrigger 
                  value="defects"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-6"
                >
                  Defect Tracking
                </TabsTrigger>
                <TabsTrigger 
                  value="reports"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-6"
                >
                  Reports
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="container mx-auto px-6 py-6">
            <TabsContent value="plans" className="mt-0">
              <PlansTab 
                onChangeDetected={() => setHasChanges(true)}
                onValidationChange={(errors) => setValidationErrors(errors)}
              />
            </TabsContent>
            
            <TabsContent value="execution" className="mt-0">
              <ExecutionTab />
            </TabsContent>
            
            <TabsContent value="defects" className="mt-0">
              <DefectTrackingTab />
            </TabsContent>
            
            <TabsContent value="reports" className="mt-0">
              <ReportsTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <ActionBar 
        hasChanges={hasChanges}
        validationErrors={validationErrors}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onReset={handleReset}
      />
      <Toaster />
    </div>
  );
}