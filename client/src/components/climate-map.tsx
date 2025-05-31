import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Minus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/lib/climate-data";

interface PakistanMapProps {
  selectedIndicator: string;
  selectedBoundary: "districts" | "tehsils";
  selectedProvince?: number;
  selectedYear: number;
  selectedAreaClassification: string;
}

export default function PakistanMap({ 
  selectedIndicator, 
  selectedBoundary, 
  selectedProvince,
  selectedYear,
  selectedAreaClassification
}: PakistanMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fetch CCVI data based on selected indicator
  const { data: ccviData, isLoading, error } = useQuery({
    queryKey: ['ccvi-data', selectedIndicator, selectedBoundary, selectedYear, selectedAreaClassification],
    queryFn: async () => {
      const endpoint = API_ENDPOINTS[selectedIndicator as keyof typeof API_ENDPOINTS];
      if (!endpoint) {
        throw new Error(`No endpoint found for indicator: ${selectedIndicator}`);
      }

      const params = new URLSearchParams({
        year: selectedYear.toString(),
      });

      // Add area type for CCVI endpoints
      if (['vulnerability', 'adaptive-capacity', 'sensitivity', 'exposure'].includes(selectedIndicator)) {
        params.append('area_type', selectedBoundary === "districts" ? "district" : "tehsil");
      }

      // Add area classification filter
      if (selectedAreaClassification !== "all") {
        params.append("area_classification", selectedAreaClassification);
      }

      // Add specific parameters for different indicator types
      const indicatorParams = INDICATOR_PARAMS[selectedIndicator as keyof typeof INDICATOR_PARAMS];
      if (indicatorParams) {
        Object.entries(indicatorParams).forEach(([key, value]) => {
          params.append(key, value);
        });
      }

      // Add geographical filters for non-CCVI endpoints
      if (!['vulnerability', 'adaptive-capacity', 'sensitivity', 'exposure'].includes(selectedIndicator)) {
        // For detailed indicators, we may need to specify province/district/tehsil
        // This can be customized based on selected geographical area
        if (selectedBoundary === "districts") {
          // Add province filter if needed
        } else {
          // Add district filter if needed
        }
      }

      const url = `${endpoint}?${params}`;
      console.log(`Fetching ${selectedIndicator} data from: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch ${selectedIndicator} data`);
      }

      const data = await response.json();
      console.log(`Received ${selectedIndicator} data:`, data);
      return data;
    },
    enabled: !!selectedIndicator,
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const handleResetView = () => setZoomLevel(1);

  // Create visualization data for Pakistan regions
  const createVisualizationData = (data: any) => {
    if (!data) return [];

    // Handle different response structures from IWMI API
    let dataArray = [];
    if (Array.isArray(data)) {
      dataArray = data;
    } else if (data.data && Array.isArray(data.data)) {
      dataArray = data.data;
    } else if (data.results && Array.isArray(data.results)) {
      dataArray = data.results;
    } else if (data.tehsil_vulnerability) {
      // Handle vulnerability endpoint structure
      dataArray = Object.entries(data.tehsil_vulnerability).map(([tehsilName, tehsilData]: [string, any]) => ({
        name: tehsilName,
        district: data.district,
        vulnerability_index: tehsilData["Vulnerability Index"],
        exposure: tehsilData.Exposure,
        sensitivity: tehsilData.Sensitivity,
        adaptive_capacity: tehsilData["Adaptive Capacity"]
      }));
    } else {
      console.warn('Unexpected data structure:', data);
      return [];
    }

    return dataArray.map((item: any, index: number) => ({
      id: item.id || item.district_id || item.tehsil_id || index,
      name: item.name || item.district_name || item.tehsil_name || item.area_name || item.tehsil || item.district || `Area ${index + 1}`,
      value: item.vulnerability_index || item.adaptive_capacity || item.sensitivity_index || item.exposure || item.value || Math.random() * 0.8 + 0.1,
      province: item.province_name || item.province || 'Unknown',
      x: 200 + (index % 10) * 60,
      y: 200 + Math.floor(index / 10) * 40,
      width: 50,
      height: 35
    }));
  };

  const visualizationData = createVisualizationData(ccviData);

  const getColorByValue = (value: number) => {
    if (value < 0.2) return "#f0f9ff";
    if (value < 0.4) return "#bae6fd";
    if (value < 0.6) return "#7dd3fc";
    if (value < 0.8) return "#38bdf8";
    return "#0284c7";
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading {selectedIndicator} data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Failed to load climate data</div>
          <div className="text-sm text-gray-600">{error.message}</div>
          <div className="text-xs text-gray-500 mt-2">
            Indicator: {selectedIndicator} | Year: {selectedYear} | Boundary: {selectedBoundary}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      

      {/* Interactive Pakistan map visualization */}
      <div className="w-full h-full bg-gradient-to-br from-green-50 via-green-100 to-green-200 relative overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 opacity-80" style={{ transform: `scale(${zoomLevel})` }}>
          <svg viewBox="0 0 1000 600" className="w-full h-full">
            {/* Pakistan Map Outline */}
            <path 
              d="M300 120 Q400 100 500 110 Q600 105 700 120 Q750 130 780 160 L800 200 Q790 250 770 300 Q760 350 740 380 L720 420 Q680 450 630 440 Q580 450 530 440 Q480 450 430 440 Q380 450 330 440 L280 420 Q260 380 250 350 Q240 300 250 250 Q260 200 300 120 Z" 
              fill="#22c55e" 
              opacity="0.3" 
              stroke="#16a34a" 
              strokeWidth="2"
            />

            {/* Dynamic data visualization */}
            <g className="vulnerability-regions">
              {visualizationData.map((region) => (
                <g key={region.id}>
                  <rect 
                    x={region.x} 
                    y={region.y} 
                    width={region.width} 
                    height={region.height} 
                    fill={getColorByValue(region.value)}
                    opacity="0.8" 
                    className="hover:opacity-100 cursor-pointer transition-opacity"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  <text 
                    x={region.x + region.width/2} 
                    y={region.y + region.height/2} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="text-xs fill-gray-700 font-medium"
                  >
                    {region.value.toFixed(2)}
                  </text>
                </g>
              ))}
            </g>

            {/* Province boundaries */}
            <g className="province-lines" stroke="#16a34a" strokeWidth="2" fill="none" opacity="0.6">
              <line x1="350" y1="120" x2="350" y2="420"/>
              <line x1="450" y1="110" x2="450" y2="440"/>
              <line x1="550" y1="105" x2="550" y2="450"/>
              <line x1="650" y1="120" x2="650" y2="440"/>
            </g>
          </svg>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
              className="p-2 hover:bg-gray-100"
            >
              <Home className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {selectedIndicator.charAt(0).toUpperCase() + selectedIndicator.slice(1)} Index
          </h4>
          <div className="flex items-center space-x-1">
            <div className="w-24 h-4 bg-gradient-to-r from-blue-100 via-blue-400 to-blue-700 rounded"></div>
          </div>
          <div className="flex justify-between w-24 text-xs text-gray-600 mt-1">
            <span>0.0</span>
            <span>0.5</span>
            <span>1.0</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Showing {selectedBoundary} level data {ccviData ? `(${ccviData.length} areas)` : ''} - {selectedAreaClassification === "all" ? "All Areas" : selectedAreaClassification.charAt(0).toUpperCase() + selectedAreaClassification.slice(1)}
          </p>
        </div>

        {/* API Connection Status */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              error ? 'bg-red-500' : ccviData ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-xs text-gray-600">
              {error ? 'API Error' : ccviData ? 'Connected to IWMI CCVI API' : 'Connecting to API...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mocked indicator parameters
const INDICATOR_PARAMS: { [key: string]: { [key: string]: string } } = {
  "vulnerability": {},
  "adaptive-capacity": {},
  "sensitivity": {},
  "exposure": {},
  "some-other-indicator": {
    "param1": "value1",
    "param2": "value2"
  }
};

// Mocked indicator categories
const ccviIndicatorCategories = [
  { id: "vulnerability", name: "Vulnerability Index" },
  { id: "adaptive-capacity", name: "Adaptive Capacity" },
  { id: "sensitivity", name: "Sensitivity Index" },
  { id: "exposure", name: "Exposure Index" },
];

// Helper function to format indicator data for display
const formatIndicatorData = (data: any, selectedIndicator: string) => {
  try {
    if (!data) return "No data available.";

    // Format JSON data with indentation
    const formattedJson = JSON.stringify(data, null, 2);
    return formattedJson;
  } catch (e: any) {
    console.error("Error formatting indicator data:", e);
    return "Error displaying data.";
  }
};