import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar } from "lucide-react";
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

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Year Selector Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Data Year
        </h3>
        {yearsLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Loading years...</span>
          </div>
        ) : (
          <Select 
            value={selectedYear?.toString() || "2023"} 
            onValueChange={(value) => onYearChange(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Select year" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {years?.map((year) => (
                <SelectItem key={year.id} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <p className="text-xs text-gray-500 mt-2">Select year for CCVI data analysis</p>
      </div>

      {/* Map Boundaries Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Map Boundaries
        </h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={selectedBoundary === "districts" ? "default" : "outline"}
            onClick={() => onBoundaryChange("districts")}
            className={selectedBoundary === "districts" ? "climate-blue-500 hover:climate-blue-600 text-white" : ""}
          >
            Districts
          </Button>
          <Button
            size="sm"
            variant={selectedBoundary === "tehsils" ? "default" : "outline"}
            onClick={() => onBoundaryChange("tehsils")}
            className={selectedBoundary === "tehsils" ? "climate-blue-500 hover:climate-blue-600 text-white" : ""}
          >
            Tehsils
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Select a boundary type to update the map</p>
      </div>

      {/* Indicator Navigation Section */}
      <div className="p-4 border-b border-gray-200 flex-1">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Indicator Navigation
        </h3>

        <div className="space-y-3">
          {ccviIndicatorCategories.map((category) => (
            <div key={category.id}>
              <div 
                className={`flex items-center space-x-2 cursor-pointer p-2 rounded-md transition-colors ${
                  selectedIndicator === category.id 
                    ? "bg-blue-50 border border-blue-200" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => onIndicatorSelect(category.id)}
              >
                <div className={`w-4 h-4 rounded-sm ${
                  selectedIndicator === category.id 
                    ? "climate-blue-900" 
                    : "bg-gray-300"
                }`} />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {category.name}
                  </span>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Indicator */}
      <div className="p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Selected Indicator
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 climate-blue-900 rounded-sm" />
          <span className="text-sm font-medium text-gray-900">
            {ccviIndicatorCategories.find(cat => cat.id === selectedIndicator)?.name || 
             "Overall Climate Vulnerability"}
          </span>
        </div>
      </div>
    </div>
  );
}
