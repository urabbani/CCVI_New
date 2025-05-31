import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, ChevronRight, ChevronDown, Square } from "lucide-react";
import { ccviIndicatorCategories, API_ENDPOINTS, YearOption } from "@/lib/climate-data";

interface IndicatorNavigatorProps {
  selectedIndicator: string;
  onIndicatorSelect: (indicatorId: string) => void;
  selectedBoundary: "districts" | "tehsils";
  onBoundaryChange: (boundary: "districts" | "tehsils") => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export default function IndicatorNavigator({
  selectedIndicator,
  onIndicatorSelect,
  selectedBoundary,
  onBoundaryChange,
  selectedYear,
  onYearChange,
}: IndicatorNavigatorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["vulnerability"]));

  // Fetch available years from IWMI API
  const { data: years, isLoading: yearsLoading } = useQuery({
    queryKey: ['/api/location/years'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.years);
      if (!response.ok) {
        throw new Error('Failed to fetch years');
      }
      return response.json() as YearOption[];
    },
  });

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getIndicatorColor = (indicatorId: string) => {
    if (selectedIndicator === indicatorId) {
      return "bg-red-600"; // Selected indicator (red square)
    }
    return "bg-gray-300"; // Unselected indicator
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col text-sm">
      {/* Map Scorecard Section */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
          Map Scorecard
        </h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Counties</span>
            <span className="font-medium">Trends</span>
          </div>
        </div>
      </div>

      {/* Year Selector */}
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
          Data Year
        </h3>
        {yearsLoading ? (
          <div className="flex items-center py-1">
            <Loader2 className="h-3 w-3 animate-spin text-blue-600 mr-2" />
            <span className="text-xs text-gray-600">Loading...</span>
          </div>
        ) : (
          <Select 
            value={selectedYear?.toString() || "2023"} 
            onValueChange={(value) => onYearChange(parseInt(value))}
          >
            <SelectTrigger className="w-full h-7 text-xs">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years?.map((year) => (
                <SelectItem key={year.id} value={year.value} className="text-xs">
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Indicator Navigation */}
      <div className="flex-1">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
            Indicator Navigation
          </h3>

          <div className="space-y-1">
            {/* Climate Vulnerability - Parent with three children */}
            <div>
              <div 
                className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded"
                onClick={() => toggleCategory("vulnerability")}
              >
                {expandedCategories.has("vulnerability") ? (
                  <ChevronDown className="h-3 w-3 text-gray-500 mr-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-gray-500 mr-1" />
                )}
                <div 
                  className={`w-3 h-3 mr-2 ${getIndicatorColor("vulnerability")}`}
                />
                <span className={`text-xs font-medium ${selectedIndicator === "vulnerability" ? "font-semibold" : ""}`}>
                  Climate Vulnerability
                </span>
              </div>
              {expandedCategories.has("vulnerability") && (
                <div className="ml-5 space-y-1">
                  <div 
                    className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded"
                    onClick={() => onIndicatorSelect("exposure")}
                  >
                    <div 
                      className={`w-3 h-3 mr-2 ${getIndicatorColor("exposure")}`}
                    />
                    <span className={`text-xs ${selectedIndicator === "exposure" ? "font-semibold" : ""}`}>
                      Exposure
                    </span>
                  </div>
                  <div 
                    className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded"
                    onClick={() => onIndicatorSelect("sensitivity")}
                  >
                    <div 
                      className={`w-3 h-3 mr-2 ${getIndicatorColor("sensitivity")}`}
                    />
                    <span className={`text-xs ${selectedIndicator === "sensitivity" ? "font-semibold" : ""}`}>
                      Sensitivity
                    </span>
                  </div>
                  <div 
                    className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded"
                    onClick={() => onIndicatorSelect("adaptive-capacity")}
                  >
                    <div 
                      className={`w-3 h-3 mr-2 ${getIndicatorColor("adaptive-capacity")}`}
                    />
                    <span className={`text-xs ${selectedIndicator === "adaptive-capacity" ? "font-semibold" : ""}`}>
                      Adaptive Capacity
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Indicator Box */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Selected Indicator
          </h3>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 mr-2" />
            <span className="text-xs font-medium">
              {ccviIndicatorCategories.find(cat => cat.id === selectedIndicator)?.name || 
               "Overall Climate Vulnerability"}
            </span>
          </div>
        </div>

        {/* Geographic Context */}
        <div className="p-3 border-t border-gray-200">
          <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Geographic Context
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            Select an area below to focus the map
          </p>
          <div className="space-y-1">
            <div className="text-xs">
              <span className="font-medium">State:</span> {selectedBoundary === "districts" ? "Districts" : "Tehsils"}
            </div>
          </div>
          <div className="flex space-x-1 mt-2">
            <Button
              size="sm"
              variant={selectedBoundary === "districts" ? "default" : "outline"}
              onClick={() => onBoundaryChange("districts")}
              className="text-xs h-6 px-2"
            >
              Districts
            </Button>
            <Button
              size="sm"
              variant={selectedBoundary === "tehsils" ? "default" : "outline"}
              onClick={() => onBoundaryChange("tehsils")}
              className="text-xs h-6 px-2"
            >
              Tehsils
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
