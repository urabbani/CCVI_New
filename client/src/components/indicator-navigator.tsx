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
  selectedAreaClassification: string;
  onAreaClassificationChange: (classification: string) => void;
}

export default function IndicatorNavigator({
  selectedIndicator,
  onIndicatorSelect,
  selectedBoundary,
  onBoundaryChange,
  selectedYear,
  onYearChange,
  selectedAreaClassification,
  onAreaClassificationChange,
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
              >
                <div
                  onClick={() => toggleCategory("vulnerability")}
                  className="flex items-center"
                >
                  {expandedCategories.has("vulnerability") ? (
                    <ChevronDown className="h-3 w-3 text-gray-500 mr-1" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-gray-500 mr-1" />
                  )}
                </div>
                <div 
                  className={`w-3 h-3 mr-2 ${getIndicatorColor("vulnerability")}`}
                  onClick={() => onIndicatorSelect("vulnerability")}
                />
                <span 
                  className={`text-xs font-medium ${selectedIndicator === "vulnerability" ? "font-semibold" : ""}`}
                  onClick={() => onIndicatorSelect("vulnerability")}
                >
                  Climate Vulnerability
                </span>
              </div>
              {expandedCategories.has("vulnerability") && (
                <div className="ml-5 space-y-1">
                  {/* Exposure - Expandable */}
                  <div>
                    <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded">
                      <div
                        onClick={() => toggleCategory("exposure")}
                        className="flex items-center"
                      >
                        {expandedCategories.has("exposure") ? (
                          <ChevronDown className="h-3 w-3 text-gray-500 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-gray-500 mr-1" />
                        )}
                      </div>
                      <div 
                        className={`w-3 h-3 mr-2 ${getIndicatorColor("exposure")}`}
                        onClick={() => onIndicatorSelect("exposure")}
                      />
                      <span 
                        className={`text-xs ${selectedIndicator === "exposure" ? "font-semibold" : ""}`}
                        onClick={() => onIndicatorSelect("exposure")}
                      >
                        Exposure
                      </span>
                    </div>
                    {expandedCategories.has("exposure") && (
                      <div className="ml-5 space-y-1">
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("avg-precipitation")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("avg-precipitation")}`} />
                          <span className={`text-xs ${selectedIndicator === "avg-precipitation" ? "font-semibold" : ""}`}>Average Level of Precipitation</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("avg-temp")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("avg-temp")}`} />
                          <span className={`text-xs ${selectedIndicator === "avg-temp" ? "font-semibold" : ""}`}>Average Level of Min and Max Temperature</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("water-level-depth")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("water-level-depth")}`} />
                          <span className={`text-xs ${selectedIndicator === "water-level-depth" ? "font-semibold" : ""}`}>Water Level Depth</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("electrical-conductivity")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("electrical-conductivity")}`} />
                          <span className={`text-xs ${selectedIndicator === "electrical-conductivity" ? "font-semibold" : ""}`}>Electrical Conductivity</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("total-dissolved-solids")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("total-dissolved-solids")}`} />
                          <span className={`text-xs ${selectedIndicator === "total-dissolved-solids" ? "font-semibold" : ""}`}>Total Dissolved Solids</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("residual-sodium-bicarbonate")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("residual-sodium-bicarbonate")}`} />
                          <span className={`text-xs ${selectedIndicator === "residual-sodium-bicarbonate" ? "font-semibold" : ""}`}>Residual Sodium Bicarbonate</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("sodium-absorption-ratio")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("sodium-absorption-ratio")}`} />
                          <span className={`text-xs ${selectedIndicator === "sodium-absorption-ratio" ? "font-semibold" : ""}`}>Sodium Absorption Ratio</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("wind-speed")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("wind-speed")}`} />
                          <span className={`text-xs ${selectedIndicator === "wind-speed" ? "font-semibold" : ""}`}>Wind Speed</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("surface-pressure")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("surface-pressure")}`} />
                          <span className={`text-xs ${selectedIndicator === "surface-pressure" ? "font-semibold" : ""}`}>Surface Pressure</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sensitivity - Expandable */}
                  <div>
                    <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded">
                      <div
                        onClick={() => toggleCategory("sensitivity")}
                        className="flex items-center"
                      >
                        {expandedCategories.has("sensitivity") ? (
                          <ChevronDown className="h-3 w-3 text-gray-500 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-gray-500 mr-1" />
                        )}
                      </div>
                      <div 
                        className={`w-3 h-3 mr-2 ${getIndicatorColor("sensitivity")}`}
                        onClick={() => onIndicatorSelect("sensitivity")}
                      />
                      <span 
                        className={`text-xs ${selectedIndicator === "sensitivity" ? "font-semibold" : ""}`}
                        onClick={() => onIndicatorSelect("sensitivity")}
                      >
                        Sensitivity
                      </span>
                    </div>
                    {expandedCategories.has("sensitivity") && (
                      <div className="ml-5 space-y-1">
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("cooking-material")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("cooking-material")}`} />
                          <span className={`text-xs ${selectedIndicator === "cooking-material" ? "font-semibold" : ""}`}>Material used for burning during cooking</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("drinking-water-source")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("drinking-water-source")}`} />
                          <span className={`text-xs ${selectedIndicator === "drinking-water-source" ? "font-semibold" : ""}`}>Source used for Drinking Water</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("residence-type")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("residence-type")}`} />
                          <span className={`text-xs ${selectedIndicator === "residence-type" ? "font-semibold" : ""}`}>Type of Residence</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("house-walls-material")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("house-walls-material")}`} />
                          <span className={`text-xs ${selectedIndicator === "house-walls-material" ? "font-semibold" : ""}`}>Material used to build house walls</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("house-roof-material")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("house-roof-material")}`} />
                          <span className={`text-xs ${selectedIndicator === "house-roof-material" ? "font-semibold" : ""}`}>Material used to build house roof</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("toilet-facility")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("toilet-facility")}`} />
                          <span className={`text-xs ${selectedIndicator === "toilet-facility" ? "font-semibold" : ""}`}>Type of toilet facility in the household</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("temporary-migration")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("temporary-migration")}`} />
                          <span className={`text-xs ${selectedIndicator === "temporary-migration" ? "font-semibold" : ""}`}>Households who have seen temporary migration</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("elderly-individuals")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("elderly-individuals")}`} />
                          <span className={`text-xs ${selectedIndicator === "elderly-individuals" ? "font-semibold" : ""}`}>Individuals above 65 years of age</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("chronic-ill-patients")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("chronic-ill-patients")}`} />
                          <span className={`text-xs ${selectedIndicator === "chronic-ill-patients" ? "font-semibold" : ""}`}>Households with Chronic Ill Patients</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("households-pwds")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("households-pwds")}`} />
                          <span className={`text-xs ${selectedIndicator === "households-pwds" ? "font-semibold" : ""}`}>Households with PWDs*</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("infant-deaths")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("infant-deaths")}`} />
                          <span className={`text-xs ${selectedIndicator === "infant-deaths" ? "font-semibold" : ""}`}>Households with Infant deaths in last 12 months</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Adaptive Capacity - Expandable */}
                  <div>
                    <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded">
                      <div
                        onClick={() => toggleCategory("adaptive-capacity")}
                        className="flex items-center"
                      >
                        {expandedCategories.has("adaptive-capacity") ? (
                          <ChevronDown className="h-3 w-3 text-gray-500 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-gray-500 mr-1" />
                        )}
                      </div>
                      <div 
                        className={`w-3 h-3 mr-2 ${getIndicatorColor("adaptive-capacity")}`}
                        onClick={() => onIndicatorSelect("adaptive-capacity")}
                      />
                      <span 
                        className={`text-xs ${selectedIndicator === "adaptive-capacity" ? "font-semibold" : ""}`}
                        onClick={() => onIndicatorSelect("adaptive-capacity")}
                      >
                        Adaptive Capacity
                      </span>
                    </div>
                    {expandedCategories.has("adaptive-capacity") && (
                      <div className="ml-5 space-y-1">
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("educated-individuals")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("educated-individuals")}`} />
                          <span className={`text-xs ${selectedIndicator === "educated-individuals" ? "font-semibold" : ""}`}>Educated Individuals</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("employed-individuals")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("employed-individuals")}`} />
                          <span className={`text-xs ${selectedIndicator === "employed-individuals" ? "font-semibold" : ""}`}>Employed Individuals</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("home-appliances")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("home-appliances")}`} />
                          <span className={`text-xs ${selectedIndicator === "home-appliances" ? "font-semibold" : ""}`}>Households owning Home Appliances</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("agricultural-land")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("agricultural-land")}`} />
                          <span className={`text-xs ${selectedIndicator === "agricultural-land" ? "font-semibold" : ""}`}>Household owning Agricultural Land</span>
                        </div>
                        <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded" onClick={() => onIndicatorSelect("livestock")}>
                          <div className={`w-3 h-3 mr-2 ${getIndicatorColor("livestock")}`} />
                          <span className={`text-xs ${selectedIndicator === "livestock" ? "font-semibold" : ""}`}>Household owning Livestock</span>
                        </div>
                      </div>
                    )}
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
              <span className="font-medium">Level:</span> {selectedBoundary === "districts" ? "Districts" : "Tehsils"}
            </div>
            <div className="text-xs">
              <span className="font-medium">Area:</span> {selectedAreaClassification === "all" ? "All Areas" : (selectedAreaClassification || "All").charAt(0).toUpperCase() + (selectedAreaClassification || "All").slice(1)}
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
          
          {/* Area Classification Selector */}
          <div className="mt-3">
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Area Classification
            </label>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant={selectedAreaClassification === "all" ? "default" : "outline"}
                onClick={() => onAreaClassificationChange("all")}
                className="text-xs h-6 px-2 flex-1"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={selectedAreaClassification === "rural" ? "default" : "outline"}
                onClick={() => onAreaClassificationChange("rural")}
                className="text-xs h-6 px-2 flex-1"
              >
                Rural
              </Button>
              <Button
                size="sm"
                variant={selectedAreaClassification === "urban" ? "default" : "outline"}
                onClick={() => onAreaClassificationChange("urban")}
                className="text-xs h-6 px-2 flex-1"
              >
                Urban
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
