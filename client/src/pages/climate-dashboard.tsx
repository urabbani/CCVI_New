import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ClimateHeader from "@/components/climate-header";
import IndicatorNavigator from "@/components/indicator-navigator";
import ClimateMap from "@/components/climate-map";
import GeographicSelector from "@/components/geographic-selector";
import { indicatorCategories } from "@/lib/climate-data";

export default function ClimateDashboard() {
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState("overall");
  const [selectedState, setSelectedState] = useState<string>();
  const { toast } = useToast();

  const handleIndicatorChange = (indicatorId: string, checked: boolean) => {
    if (checked) {
      setSelectedIndicators(prev => [...prev, indicatorId]);
    } else {
      setSelectedIndicators(prev => prev.filter(id => id !== indicatorId));
    }
  };

  const handleIndicatorSelect = (indicatorId: string) => {
    setSelectedIndicator(indicatorId);
  };

  const handleStateSelect = (stateCode: string) => {
    setSelectedState(stateCode);
    toast({
      title: "State Selected",
      description: `Filtering map for ${stateCode}`,
    });
  };

  const handleExportData = () => {
    // Generate CSV content
    const csvContent = `State,County,Vulnerability_Score,Indicator
CA,Los Angeles,85,Overall Climate Vulnerability
TX,Harris,72,Overall Climate Vulnerability
FL,Miami-Dade,91,Overall Climate Vulnerability
NY,New York,78,Overall Climate Vulnerability
WA,King,65,Overall Climate Vulnerability`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'climate_vulnerability_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Climate vulnerability data exported successfully",
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generation",
      description: "Professional climate vulnerability report would be generated here. This would include data analysis, risk assessments, and business recommendations.",
    });
  };

  const currentIndicator = indicatorCategories.find(cat => cat.id === selectedIndicator);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ClimateHeader />
      
      <div className="flex flex-1">
        <IndicatorNavigator
          selectedIndicators={selectedIndicators}
          onIndicatorChange={handleIndicatorChange}
          selectedIndicator={selectedIndicator}
          onIndicatorSelect={handleIndicatorSelect}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentIndicator?.name || "Overall Climate Vulnerability"}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentIndicator?.description || 
                   "Score combining environmental, social, economic, and infrastructure effects on neighborhood-level stability."}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleExportData}
                  className="flex items-center space-x-2 climate-blue-500 hover:climate-blue-600 text-white"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </Button>
                <Button
                  onClick={handleGenerateReport}
                  className="flex items-center space-x-2 climate-green-500 hover:climate-green-600 text-white"
                >
                  <FileText className="h-4 w-4" />
                  <span>Generate Report</span>
                </Button>
              </div>
            </div>
          </div>

          <ClimateMap selectedIndicator={selectedIndicator} />
        </div>
        
        <GeographicSelector
          selectedState={selectedState}
          onStateSelect={handleStateSelect}
        />
      </div>
    </div>
  );
}
