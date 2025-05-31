import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { pakistanProvinces, API_ENDPOINTS } from "@/lib/climate-data";

interface GeographicSelectorProps {
  selectedProvince?: number;
  onProvinceSelect: (provinceId: number) => void;
}

export default function GeographicSelector({ selectedProvince, onProvinceSelect }: GeographicSelectorProps) {
  const [geographicMode, setGeographicMode] = useState<"province" | "district">("province");

  // Fetch provinces from IWMI API
  const { data: provinces, isLoading: provincesLoading } = useQuery({
    queryKey: ['/api/location/provinces'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.provinces);
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      return response.json();
    },
  });

  // Fetch districts if needed
  const { data: districts, isLoading: districtsLoading } = useQuery({
    queryKey: ['/api/location/districts', selectedProvince],
    queryFn: async () => {
      if (!selectedProvince) return [];
      const response = await fetch(`${API_ENDPOINTS.districts}?province_id=${selectedProvince}`);
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      return response.json();
    },
    enabled: !!selectedProvince && geographicMode === "district",
  });

  const displayProvinces = provinces || pakistanProvinces;

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
      {/* Geographic Context */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Geographic Context
        </h3>
        <p className="text-xs text-gray-500 mb-3">Select an area below to focus the map</p>
        
        <div className="space-y-2">
          <Button
            variant={geographicMode === "province" ? "default" : "outline"}
            className={`w-full justify-start ${
              geographicMode === "province" 
                ? "climate-blue-500 hover:climate-blue-600 text-white" 
                : "hover:bg-gray-200"
            }`}
            onClick={() => setGeographicMode("province")}
          >
            Province
          </Button>
          <Button
            variant={geographicMode === "district" ? "default" : "outline"}
            className={`w-full justify-start ${
              geographicMode === "district" 
                ? "climate-blue-500 hover:climate-blue-600 text-white" 
                : "hover:bg-gray-200"
            }`}
            onClick={() => setGeographicMode("district")}
          >
            District
          </Button>
        </div>
      </div>

      {/* Province/District Grid */}
      <div className="p-4 flex-1">
        {provincesLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Loading provinces...</span>
          </div>
        )}

        {geographicMode === "province" && !provincesLoading && (
          <div className="space-y-2">
            {displayProvinces.map((province: any) => (
              <Button
                key={province.id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-left font-medium transition-colors ${
                  selectedProvince === province.id
                    ? "climate-blue-500 text-white hover:climate-blue-600"
                    : "text-gray-700 hover:climate-blue-100"
                }`}
                onClick={() => onProvinceSelect(province.id)}
              >
                <div>
                  <div className="font-medium">{province.name}</div>
                  <div className="text-xs opacity-75">{province.code || province.id}</div>
                </div>
              </Button>
            ))}
          </div>
        )}

        {geographicMode === "district" && (
          <div className="space-y-2">
            {districtsLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Loading districts...</span>
              </div>
            )}
            
            {!districtsLoading && districts && districts.map((district: any) => (
              <Button
                key={district.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left text-gray-700 hover:climate-blue-100"
              >
                <div>
                  <div className="font-medium">{district.name}</div>
                  <div className="text-xs opacity-75">District</div>
                </div>
              </Button>
            ))}

            {!districtsLoading && (!districts || districts.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                {selectedProvince ? "No districts found" : "Select a province to view districts"}
              </p>
            )}
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Province values represent aggregated data for all districts within that province</p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${provinces ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">
            {provinces ? 'Connected to IWMI API' : 'Loading data...'}
          </span>
        </div>
      </div>
    </div>
  );
}
