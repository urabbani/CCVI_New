import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { indicatorCategories } from "@/lib/climate-data";

interface IndicatorNavigatorProps {
  selectedIndicators: string[];
  onIndicatorChange: (indicatorId: string, checked: boolean) => void;
  selectedIndicator: string;
  onIndicatorSelect: (indicatorId: string) => void;
}

export default function IndicatorNavigator({
  selectedIndicators,
  onIndicatorChange,
  selectedIndicator,
  onIndicatorSelect,
}: IndicatorNavigatorProps) {
  const [mapBoundary, setMapBoundary] = useState<"counties" | "tracts">("counties");

  const getRatingBoxes = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <div key={i} className="w-3 h-3 bg-gray-300 rounded-sm" />
    ));
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Map Boundaries Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Map Boundaries
        </h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={mapBoundary === "counties" ? "default" : "outline"}
            onClick={() => setMapBoundary("counties")}
            className={mapBoundary === "counties" ? "climate-blue-500 hover:climate-blue-600 text-white" : ""}
          >
            Counties
          </Button>
          <Button
            size="sm"
            variant={mapBoundary === "tracts" ? "default" : "outline"}
            onClick={() => setMapBoundary("tracts")}
            className={mapBoundary === "tracts" ? "climate-blue-500 hover:climate-blue-600 text-white" : ""}
          >
            Tracts
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Search select a layer to update the map</p>
      </div>

      {/* Indicator Navigation Section */}
      <div className="p-4 border-b border-gray-200 flex-1">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Indicator Navigation
        </h3>

        <div className="space-y-3">
          {indicatorCategories.map((category) => {
            if (category.id === "overall") {
              return (
                <div key={category.id}>
                  <div 
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => onIndicatorSelect(category.id)}
                  >
                    <div className="w-4 h-4 climate-blue-900 rounded-sm" />
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                </div>
              );
            }

            if (category.hasSubcategories) {
              return (
                <div key={category.id} className="ml-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedIndicators.includes(category.id)}
                        onCheckedChange={(checked) => 
                          onIndicatorChange(category.id, checked as boolean)
                        }
                        className="w-4 h-4 text-climate-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </div>
                    
                    {/* Show dual columns for some categories */}
                    {["community-baseline", "health", "social-economic", "environment"].includes(category.id) && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">
                          {category.id === "community-baseline" ? "Climate Impacts" :
                           category.id === "health" ? "Health" :
                           category.id === "social-economic" ? "Social & Economic" :
                           "Extreme Events"}
                        </span>
                        <Checkbox className="w-4 h-4 text-climate-blue-600 border-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-1 mt-1 ml-6">
                    {getRatingBoxes(category.indicators.length)}
                  </div>
                </div>
              );
            }

            return (
              <div key={category.id} className="ml-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedIndicators.includes(category.id)}
                    onCheckedChange={(checked) => 
                      onIndicatorChange(category.id, checked as boolean)
                    }
                    className="w-4 h-4 text-climate-blue-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <div className="flex space-x-1 mt-1 ml-6">
                  {getRatingBoxes(category.indicators.length)}
                </div>
              </div>
            );
          })}
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
            {indicatorCategories.find(cat => cat.id === selectedIndicator)?.name || 
             "Overall Climate Vulnerability"}
          </span>
        </div>
      </div>
    </div>
  );
}
