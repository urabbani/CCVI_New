
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, ChevronRight, ChevronDown } from "lucide-react";
import { ccviIndicatorCategories, API_ENDPOINTS, YearOption } from "@/lib/climate-data";

interface IndicatorNavigatorProps {
  selectedIndicator: string;
  onIndicatorSelect: (indicatorId: string) => void;
  selectedBoundary: "districts" | "tehsils";
  onBoundaryChange: (boundary: "districts" | "tehsils") => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

// Enhanced indicator structure to match the screenshot
const indicatorHierarchy = [
  {
    id: "vulnerability",
    name: "Overall Climate Vulnerability",
    color: "#dc2626",
    subcategories: []
  },
  {
    id: "community-resilience",
    name: "Community Resilience",
    color: "#ea580c",
    subcategories: [
      { id: "social-capital", name: "Social Capital", color: "#f97316" },
      { id: "economic-capacity", name: "Economic Capacity", color: "#fb923c" },
      { id: "institutional-strength", name: "Institutional Strength", color: "#fdba74" }
    ]
  },
  {
    id: "climate-impacts",
    name: "Climate Impacts",
    color: "#dc2626",
    subcategories: [
      { id: "temperature", name: "Temperature", color: "#ef4444" },
      { id: "precipitation", name: "Precipitation", color: "#f87171" },
      { id: "extreme-events", name: "Extreme Events", color: "#fca5a5" }
    ]
  },
  {
    id: "health",
    name: "Health",
    color: "#059669",
    subcategories: [
      { id: "air-quality", name: "Air Quality", color: "#10b981" },
      { id: "water-security", name: "Water Security", color: "#34d399" },
      { id: "disease-risk", name: "Disease Risk", color: "#6ee7b7" }
    ]
  },
  {
    id: "economic",
    name: "Economic",
    color: "#7c3aed",
    subcategories: [
      { id: "agriculture", name: "Agriculture", color: "#8b5cf6" },
      { id: "tourism", name: "Tourism", color: "#a78bfa" },
      { id: "infrastructure", name: "Infrastructure", color: "#c4b5fd" }
    ]
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    color: "#0891b2",
    subcategories: [
      { id: "transportation", name: "Transportation", color: "#0ea5e9" },
      { id: "energy", name: "Energy", color: "#38bdf8" },
      { id: "communications", name: "Communications", color: "#7dd3fc" }
    ]
  },
  {
    id: "extreme-events",
    name: "Extreme Events",
    color: "#b91c1c",
    subcategories: [
      { id: "floods", name: "Floods", color: "#dc2626" },
      { id: "droughts", name: "Droughts", color: "#ef4444" },
      { id: "storms", name: "Storms", color: "#f87171" }
    ]
  }
];

export default function IndicatorNavigator({
  selectedIndicator,
  onIndicatorSelect,
  selectedBoundary,
  onBoundaryChange,
  selectedYear,
  onYearChange,
}: IndicatorNavigatorProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

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
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          The U.S. Climate Vulnerability Index
        </h2>
        <p className="text-sm text-gray-600">
          How a community is vulnerable to environmental and economic disruptions.
        </p>
      </div>

      {/* Year Selector Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Map Boundaries
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
      </div>

      {/* Boundary Type Selection */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Trends
        </h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={selectedBoundary === "districts" ? "default" : "outline"}
            onClick={() => onBoundaryChange("districts")}
            className={selectedBoundary === "districts" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
          >
            Counties
          </Button>
          <Button
            size="sm"
            variant={selectedBoundary === "tehsils" ? "default" : "outline"}
            onClick={() => onBoundaryChange("tehsils")}
            className={selectedBoundary === "tehsils" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
          >
            Tracts
          </Button>
        </div>
      </div>

      {/* Indicator Navigation Section */}
      <div className="p-4 border-b border-gray-200 flex-1">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Indicator Navigation
        </h3>

        <div className="space-y-1">
          {indicatorHierarchy.map((category) => (
            <div key={category.id}>
              <div 
                className={`flex items-center justify-between cursor-pointer p-2 rounded-md transition-colors ${
                  selectedIndicator === category.id 
                    ? "bg-blue-50 border border-blue-200" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  onIndicatorSelect(category.id);
                  if (category.subcategories.length > 0) {
                    toggleCategory(category.id);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {category.name}
                  </span>
                </div>
                {category.subcategories.length > 0 && (
                  <div className="flex-shrink-0">
                    {expandedCategories.includes(category.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Subcategories */}
              {expandedCategories.includes(category.id) && category.subcategories.length > 0 && (
                <div className="ml-6 mt-1 space-y-1">
                  {category.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className={`flex items-center space-x-2 cursor-pointer p-1.5 rounded-md transition-colors ${
                        selectedIndicator === subcategory.id 
                          ? "bg-blue-50 border border-blue-200" 
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => onIndicatorSelect(subcategory.id)}
                    >
                      <div 
                        className="w-2.5 h-2.5 rounded-sm" 
                        style={{ backgroundColor: subcategory.color }}
                      />
                      <span className="text-xs text-gray-700">
                        {subcategory.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Indicator Section */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Selected Indicator
        </h3>
        <div className="bg-orange-100 border border-orange-200 rounded p-2">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-orange-600 rounded-sm" />
            <span className="text-sm font-medium text-gray-900">
              Climate Impacts
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Current indicator selection for map display
          </p>
        </div>
      </div>

      {/* Geographic Context Section */}
      <div className="p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Geographic Context
        </h3>
        <div className="text-xs text-gray-600">
          <div className="flex justify-between items-center mb-1">
            <span>State:</span>
            <span className="font-medium">EPA Region</span>
          </div>
          <div className="text-xs text-gray-500">
            Select an area below to focus the map
          </div>
        </div>
      </div>
    </div>
  );
}
