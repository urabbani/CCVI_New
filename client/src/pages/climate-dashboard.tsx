import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ClimateHeader from "@/components/climate-header";
import IndicatorNavigator from "@/components/indicator-navigator";
import PakistanMap from "@/components/climate-map";
import { ccviIndicatorCategories } from "@/lib/climate-data";

export default function ClimateDashboard() {
  const [selectedIndicator, setSelectedIndicator] = useState("vulnerability");
  const [selectedBoundary, setSelectedBoundary] = useState<"districts" | "tehsils">("districts");
  const [selectedProvince, setSelectedProvince] = useState<number>();
  const [selectedYear, setSelectedYear] = useState(2023);
  const { toast } = useToast();

  const handleIndicatorSelect = (indicatorId: string) => {
    setSelectedIndicator(indicatorId);
    toast({
      title: "Indicator Selected",
      description: `Viewing ${ccviIndicatorCategories.find(cat => cat.id === indicatorId)?.name} data`,
    });
  };

  const handleBoundaryChange = (boundary: "districts" | "tehsils") => {
    setSelectedBoundary(boundary);
    toast({
      title: "Boundary Changed",
      description: `Now showing ${boundary} level data`,
    });
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    toast({
      title: "Year Selected",
      description: `Loading ${year} CCVI data from IWMI backend`,
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Business Report Generation",
      description: `Generating professional business proposal for Pakistan ${selectedIndicator} analysis. This would include climate vulnerability assessments, risk management strategies, and investment recommendations for retail operations across ${selectedBoundary}.`,
      duration: 5000,
    });
  };

  const currentIndicator = ccviIndicatorCategories.find(cat => cat.id === selectedIndicator);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ClimateHeader />
      
      <div className="flex flex-1">
        <IndicatorNavigator
          selectedIndicator={selectedIndicator}
          onIndicatorSelect={handleIndicatorSelect}
          selectedBoundary={selectedBoundary}
          onBoundaryChange={handleBoundaryChange}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentIndicator?.name || "Climate Change Vulnerability Index"}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentIndicator?.description || 
                   "Comprehensive climate vulnerability assessment for Pakistan using IWMI CCVI data."}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Displaying {selectedBoundary} level data for business analysis
                </p>
              </div>
              <div className="flex items-center space-x-4">
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

          <PakistanMap 
            selectedIndicator={selectedIndicator}
            selectedBoundary={selectedBoundary}
            selectedProvince={selectedProvince}
          />
        </div>
      </div>
    </div>
  );
}
