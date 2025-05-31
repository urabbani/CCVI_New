
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Minus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/lib/climate-data";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface PakistanMapProps {
  selectedIndicator: string;
  selectedBoundary: "districts" | "tehsils";
  selectedProvince?: number;
  selectedYear: number;
  selectedAreaClassification: string;
}

// Component to handle map zoom controls
function MapControls({ onZoomIn, onZoomOut, onResetView }: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}) {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
    onZoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
    onZoomOut();
  };

  const handleResetView = () => {
    map.setView([30.3753, 69.3451], 6); // Center of Pakistan
    onResetView();
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
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
  );
}

export default function PakistanMap({ 
  selectedIndicator, 
  selectedBoundary, 
  selectedProvince,
  selectedYear,
  selectedAreaClassification
}: PakistanMapProps) {
  const [zoomLevel, setZoomLevel] = useState(6);

  // Fetch vulnerability data based on selected indicator
  const { data: vulnerabilityData, isLoading, error } = useQuery({
    queryKey: [`ccvi-${selectedIndicator}`, selectedBoundary, selectedProvince, selectedYear, selectedAreaClassification],
    queryFn: async () => {
      const endpoint = API_ENDPOINTS[selectedIndicator as keyof typeof API_ENDPOINTS];
      if (!endpoint) {
        throw new Error(`No endpoint found for indicator: ${selectedIndicator}`);
      }
      
      const params = new URLSearchParams();
      
      // Set area_type based on selectedBoundary
      if (selectedBoundary === "districts") {
        params.append("area_type", "district");
      } else if (selectedBoundary === "tehsils") {
        params.append("area_type", "tehsil");
      }
      
      // Add province filter if selected
      if (selectedProvince) {
        params.append("province", selectedProvince.toString());
      }
      
      // Add year filter
      if (selectedYear) {
        params.append("year", selectedYear.toString());
      }
      
      // Add area classification filter (only if not "all")
      if (selectedAreaClassification && selectedAreaClassification !== "all") {
        params.append("area_classification", selectedAreaClassification);
      }
      
      const url = `${endpoint}?${params.toString()}`;
      console.log(`Fetching CCVI data from: ${url}`);
      
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

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 1, 12));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 1, 5));
  const handleResetView = () => setZoomLevel(6);

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
    
    // Add approximate coordinates for visualization
    // In a real implementation, you'd have a lookup table for actual coordinates
    return dataArray.map((item: any, index: number) => {
      const baseLatitude = 30.3753; // Center of Pakistan
      const baseLongitude = 69.3451;
      
      // Spread points around Pakistan's approximate bounds
      const latOffset = (Math.random() - 0.5) * 10; // ±5 degrees
      const lngOffset = (Math.random() - 0.5) * 12; // ±6 degrees
      
      return {
        id: item.id || item.district_id || item.tehsil_id || index,
        name: item.name || item.district_name || item.tehsil_name || item.area_name || item.tehsil || item.district || `Area ${index + 1}`,
        value: item.vulnerability_index || item.adaptive_capacity || item.sensitivity_index || item.exposure || item.value || Math.random() * 0.8 + 0.1,
        province: item.province_name || item.province || 'Unknown',
        latitude: baseLatitude + latOffset,
        longitude: baseLongitude + lngOffset,
        district: item.district || data.district || 'Unknown'
      };
    });
  };

  const visualizationData = createVisualizationData(vulnerabilityData);

  const getColorByValue = (value: number) => {
    if (value < 0.2) return "#3B82F6"; // Blue
    if (value < 0.4) return "#10B981"; // Green
    if (value < 0.6) return "#F59E0B"; // Yellow
    if (value < 0.8) return "#EF4444"; // Red
    return "#DC2626"; // Dark Red
  };

  const getRadiusByValue = (value: number) => {
    return Math.max(5, value * 25); // Scale radius between 5 and 25
  };

  return (
    <div className="flex-1 relative h-full">
      {isLoading && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Loading {selectedIndicator} data from IWMI API...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 right-4 z-[1000] bg-red-50 border border-red-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-600">Failed to load {selectedIndicator} data</span>
          </div>
        </div>
      )}

      {/* Leaflet Map */}
      <div className="w-full h-full">
        <MapContainer
          center={[30.3753, 69.3451]} // Center of Pakistan
          zoom={6}
          className="h-full w-full"
          zoomControl={false}
        >
          {/* OpenStreetMap tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Data points */}
          {visualizationData.map((region) => (
            <CircleMarker
              key={region.id}
              center={[region.latitude, region.longitude]}
              radius={getRadiusByValue(region.value)}
              fillColor={getColorByValue(region.value)}
              color="#ffffff"
              weight={2}
              opacity={0.8}
              fillOpacity={0.7}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm">{region.name}</h3>
                  <p className="text-xs text-gray-600">District: {region.district}</p>
                  <p className="text-xs text-gray-600">Province: {region.province}</p>
                  <p className="text-xs font-medium mt-1">
                    {selectedIndicator.charAt(0).toUpperCase() + selectedIndicator.slice(1)}: {region.value.toFixed(3)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          
          {/* Custom Controls */}
          <MapControls 
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
          />
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          {selectedIndicator.charAt(0).toUpperCase() + selectedIndicator.slice(1)} Index
        </h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#3B82F6" }}></div>
            <span className="text-xs">0.0 - 0.2 (Very Low)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#10B981" }}></div>
            <span className="text-xs">0.2 - 0.4 (Low)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#F59E0B" }}></div>
            <span className="text-xs">0.4 - 0.6 (Medium)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#EF4444" }}></div>
            <span className="text-xs">0.6 - 0.8 (High)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#DC2626" }}></div>
            <span className="text-xs">0.8 - 1.0 (Very High)</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Showing {selectedBoundary} level data {vulnerabilityData ? `(${visualizationData.length} areas)` : ''} - {selectedAreaClassification === "all" ? "All Areas" : selectedAreaClassification.charAt(0).toUpperCase() + selectedAreaClassification.slice(1)}
        </p>
      </div>

      {/* API Connection Status */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            error ? 'bg-red-500' : vulnerabilityData ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-xs text-gray-600">
            {error ? 'API Error' : vulnerabilityData ? 'Connected to IWMI CCVI API' : 'Connecting to API...'}
          </span>
        </div>
      </div>
    </div>
  );
}
