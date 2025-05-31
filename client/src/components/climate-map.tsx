
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Map, { Source, Layer, NavigationControl } from 'react-map-gl';
import { API_ENDPOINTS } from "@/lib/climate-data";
import type { MapboxGeoJSONFeature } from 'mapbox-gl';

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
  const [viewState, setViewState] = useState({
    longitude: 69.3451,
    latitude: 30.3753,
    zoom: 5.5,
    bearing: 0,
    pitch: 0
  });

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

  // Create GeoJSON data for visualization
  const geoJsonData = useMemo(() => {
    if (!ccviData) return null;

    const features: any[] = [];
    let dataArray = [];

    // Handle different response structures from IWMI API
    if (Array.isArray(ccviData)) {
      dataArray = ccviData;
    } else if (ccviData.data && Array.isArray(ccviData.data)) {
      dataArray = ccviData.data;
    } else if (ccviData.results && Array.isArray(ccviData.results)) {
      dataArray = ccviData.results;
    } else if (ccviData.tehsil_vulnerability) {
      // Handle vulnerability endpoint structure
      dataArray = Object.entries(ccviData.tehsil_vulnerability).map(([tehsilName, tehsilData]: [string, any]) => ({
        name: tehsilName,
        district: ccviData.district,
        vulnerability_index: tehsilData["Vulnerability Index"],
        exposure: tehsilData.Exposure,
        sensitivity: tehsilData.Sensitivity,
        adaptive_capacity: tehsilData["Adaptive Capacity"]
      }));
    } else {
      console.warn('Unexpected data structure:', ccviData);
      return null;
    }

    // Create mock GeoJSON features for demonstration
    // In a real implementation, you would have actual geographical boundaries
    dataArray.forEach((item: any, index: number) => {
      const value = item.vulnerability_index || item.adaptive_capacity || item.sensitivity_index || item.exposure || item.value || Math.random() * 0.8 + 0.1;
      
      // Create mock coordinates around Pakistan
      const baseLng = 69.3451 + (Math.random() - 0.5) * 20;
      const baseLat = 30.3753 + (Math.random() - 0.5) * 15;
      
      features.push({
        type: "Feature",
        properties: {
          id: item.id || item.district_id || item.tehsil_id || index,
          name: item.name || item.district_name || item.tehsil_name || item.area_name || item.tehsil || item.district || `Area ${index + 1}`,
          value: value,
          province: item.province_name || item.province || 'Unknown',
          indicator: selectedIndicator
        },
        geometry: {
          type: "Point",
          coordinates: [baseLng, baseLat]
        }
      });
    });

    return {
      type: "FeatureCollection",
      features: features
    };
  }, [ccviData, selectedIndicator]);

  // Create heat map layer style
  const heatmapLayer = {
    id: 'climate-heatmap',
    type: 'heatmap' as const,
    source: 'climate-data',
    maxzoom: 15,
    paint: {
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['get', 'value'],
        0, 0,
        1, 1
      ],
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 1,
        15, 3
      ],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
      ],
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 2,
        15, 20
      ],
      'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7, 1,
        15, 0
      ]
    }
  };

  // Create circle layer for detailed view
  const circleLayer = {
    id: 'climate-circles',
    type: 'circle' as const,
    source: 'climate-data',
    minzoom: 7,
    paint: {
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'value'],
        0, '#f0f9ff',
        0.2, '#bae6fd',
        0.4, '#7dd3fc',
        0.6, '#38bdf8',
        0.8, '#0284c7',
        1, '#0c4a6e'
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7, 10,
        15, 30
      ],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2,
      'circle-opacity': 0.8
    }
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
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken="pk.eyJ1IjoiY2xpbWF0ZW1hcCIsImEiOiJjbHkwZnJxdGYwbGZyMmpzNWxvbW4yOGprIn0.example" // You'll need to replace this with your actual token
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        
        {geoJsonData && (
          <Source id="climate-data" type="geojson" data={geoJsonData}>
            <Layer {...heatmapLayer} />
            <Layer {...circleLayer} />
          </Source>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-xs">
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
            Showing {selectedBoundary} level data {geoJsonData ? `(${geoJsonData.features.length} areas)` : ''} - {selectedAreaClassification === "all" ? "All Areas" : selectedAreaClassification.charAt(0).toUpperCase() + selectedAreaClassification.slice(1)}
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
      </Map>
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
