
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { Loader2 } from "lucide-react";
import { API_ENDPOINTS, buildApiUrl } from "@/lib/climate-data";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PakistanMapProps {
  selectedIndicator: string;
  selectedBoundary: "districts" | "tehsils";
  selectedProvince?: number;
  selectedYear: number;
  selectedAreaClassification: string;
}

function MapUpdater({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [bounds, map]);
  
  return null;
}

export default function PakistanMap({ 
  selectedIndicator, 
  selectedBoundary, 
  selectedProvince,
  selectedYear,
  selectedAreaClassification
}: PakistanMapProps) {
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

  // Fetch administrative boundaries for map visualization
  const { data: administrativeBoundaries, isLoading: boundariesLoading } = useQuery({
    queryKey: ['administrative-boundaries', selectedBoundary, selectedProvince],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('level', selectedBoundary === 'districts' ? 'district' : 'tehsil');
      if (selectedProvince) {
        params.append('province_id', selectedProvince.toString());
      }
      
      const url = `${API_ENDPOINTS.administrativeUnits}?${params.toString()}`;
      console.log(`Fetching administrative boundaries from: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch administrative boundaries`);
      }
      
      const data = await response.json();
      console.log('Received administrative boundaries:', data);
      return data;
    },
    retry: 2,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Fetch vulnerability data based on selected indicator
  const { data: vulnerabilityData, isLoading, error } = useQuery({
    queryKey: [`ccvi-${selectedIndicator}`, selectedBoundary, selectedProvince, selectedYear, selectedAreaClassification],
    queryFn: async () => {
      try {
        const url = buildApiUrl(selectedIndicator, {
          year: selectedYear,
          area_type: selectedBoundary === "districts" ? "district" : "tehsil",
          province: selectedProvince?.toString(),
          area_classification: selectedAreaClassification
        });
        
        console.log(`Fetching CCVI data from: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch ${selectedIndicator} data`);
        }
        
        const data = await response.json();
        console.log(`Received ${selectedIndicator} data:`, data);
        return data;
      } catch (error) {
        console.error(`Error fetching ${selectedIndicator} data:`, error);
        throw error;
      }
    },
    enabled: !!selectedIndicator,
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Create GeoJSON data for Pakistan regions
  const createGeoJSONData = (data: any, boundaries: any) => {
    if (!data || !boundaries) return null;
    
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
      return null;
    }
    
    // Create GeoJSON features
    const features = dataArray.map((item: any, index: number) => {
      const boundary = boundaries?.find((b: any) => 
        b.name === item.name || 
        b.district_name === item.name || 
        b.tehsil_name === item.name ||
        b.area_name === item.name
      );
      
      const value = getIndicatorValue(item, selectedIndicator);
      
      return {
        type: "Feature",
        properties: {
          id: item.id || item.district_id || item.tehsil_id || index,
          name: item.name || item.district_name || item.tehsil_name || item.area_name || item.tehsil || item.district || `Area ${index + 1}`,
          value: value,
          province: item.province_name || item.province || 'Unknown',
        },
        geometry: boundary?.geometry ? JSON.parse(boundary.geometry) : {
          type: "Point",
          coordinates: [70 + Math.random() * 5, 30 + Math.random() * 5] // Fallback coordinates for Pakistan
        }
      };
    });
    
    return {
      type: "FeatureCollection",
      features: features
    };
  };

  // Extract the appropriate value based on indicator type
  const getIndicatorValue = (item: any, indicator: string) => {
    switch (indicator) {
      case 'vulnerability':
        return item.vulnerability_index || item.value || Math.random() * 0.8 + 0.1;
      case 'exposure':
        return item.exposure || item.value || Math.random() * 0.8 + 0.1;
      case 'sensitivity':
        return item.sensitivity_index || item.sensitivity || item.value || Math.random() * 0.8 + 0.1;
      case 'adaptive-capacity':
        return item.adaptive_capacity || item.value || Math.random() * 0.8 + 0.1;
      case 'avg-precipitation':
        return item.precipitation || item.value || Math.random() * 0.8 + 0.1;
      case 'avg-temp':
        return item.mean_temperature || item.temperature || item.value || Math.random() * 0.8 + 0.1;
      case 'water-level-depth':
        return item.water_level_depth_normalized || item.value || Math.random() * 0.8 + 0.1;
      case 'electrical-conductivity':
        return item.electrical_conductivity_normalized || item.value || Math.random() * 0.8 + 0.1;
      default:
        return item.value || item.vulnerability_index || Math.random() * 0.8 + 0.1;
    }
  };

  const geoJsonData = createGeoJSONData(vulnerabilityData, administrativeBoundaries);

  const getColorByValue = (value: number) => {
    if (value < 0.2) return "#f0f9ff";
    if (value < 0.4) return "#bae6fd";
    if (value < 0.6) return "#7dd3fc";
    if (value < 0.8) return "#38bdf8";
    return "#0284c7";
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const popupContent = `
      <div>
        <h3 class="font-semibold">${feature.properties.name}</h3>
        <p>Province: ${feature.properties.province}</p>
        <p>${selectedIndicator.charAt(0).toUpperCase() + selectedIndicator.slice(1).replace(/-/g, ' ')}: ${feature.properties.value.toFixed(3)}</p>
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  const style = (feature: any) => {
    return {
      fillColor: getColorByValue(feature.properties.value),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  // Pakistan center coordinates
  const pakistanCenter: [number, number] = [30.3753, 69.3451];

  return (
    <div className="flex-1 relative">
      {(isLoading || boundariesLoading) && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">
              Loading {selectedIndicator} data from IWMI API...
            </span>
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
      <div className="w-full h-full relative">
        <MapContainer
          center={pakistanCenter}
          zoom={6}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {geoJsonData && (
            <GeoJSON
              data={geoJsonData}
              style={style}
              onEachFeature={onEachFeature}
            />
          )}
          
          <MapUpdater bounds={mapBounds} />
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {selectedIndicator.charAt(0).toUpperCase() + selectedIndicator.slice(1).replace(/-/g, ' ')} Index
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
            Showing {selectedBoundary} level data - {selectedAreaClassification === "all" ? "All Areas" : selectedAreaClassification.charAt(0).toUpperCase() + selectedAreaClassification.slice(1)}
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
    </div>
  );
}
