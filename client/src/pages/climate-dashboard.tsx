import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ClimateHeader from "@/components/climate-header";
import IndicatorNavigator from "@/components/indicator-navigator";
import PakistanMap from "@/components/climate-map";
import GeographicSelector from "@/components/geographic-selector";
import { ccviIndicatorCategories } from "@/lib/climate-data";

export default function ClimateDashboard() {
  const [selectedIndicator, setSelectedIndicator] = useState("vulnerability");
  const [selectedBoundary, setSelectedBoundary] = useState<"districts" | "tehsils">("districts");
  const [selectedProvince, setSelectedProvince] = useState<number>();
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

  const handleProvinceSelect = (provinceId: number) => {
    setSelectedProvince(provinceId);
    toast({
      title: "Province Selected",
      description: `Filtering map for selected province`,
    });
  };

  const handleExportData = async () => {
    try {
      // Create CSV header
      let csvContent = `Province,${selectedBoundary === 'districts' ? 'District' : 'Tehsil'},${selectedIndicator}_Score,Area_Type\n`;
      
      // Sample data structure for export
      const sampleData = [
        { province: "Punjab", area: "Lahore", score: 0.75 },
        { province: "Sindh", area: "Karachi", score: 0.82 },
        { province: "Khyber Pakhtunkhwa", area: "Peshawar", score: 0.68 },
        { province: "Balochistan", area: "Quetta", score: 0.71 }
      ];

      // Add sample data to CSV
      sampleData.forEach(item => {
        csvContent += `${item.province},${item.area},${item.score},${selectedBoundary}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pakistan_${selectedIndicator}_${selectedBoundary}_data.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: `Pakistan ${selectedIndicator} data exported successfully`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
      });
    }
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
                  <span>Generate Business Report</span>
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
        
        <GeographicSelector
          selectedProvince={selectedProvince}
          onProvinceSelect={handleProvinceSelect}
        />
      </div>
    </div>
  );
}
