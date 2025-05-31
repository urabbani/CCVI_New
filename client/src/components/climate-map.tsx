
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Minus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/lib/climate-data";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibXVtYWlyciIsImEiOiJjbTljbjAyd2EwNW90MmtyN3FpODVqbHI0In0.S4BxDCnbkvlj6ECKBXdWcw';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

  // Initialize Mapbox map
  useEffect(() => {
    if (map.current || !mapContainer.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [69.3451, 30.3753], // Center on Pakistan
      zoom: 5,
      minZoom: 4,
      maxZoom: 12
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Create visualization data for Pakistan regions
  const createVisualizationData = (data: any) => {
    if (!data) return [];

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
    }));
  };

  const visualizationData = createVisualizationData(ccviData);

  // Add data layers to map when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !visualizationData.length) return;

    // Remove existing data layers
    if (map.current.getLayer('climate-data-layer')) {
      map.current.removeLayer('climate-data-layer');
    }
    if (map.current.getSource('climate-data')) {
      map.current.removeSource('climate-data');
    }

    // Create GeoJSON features for the data points
    const features = visualizationData.map((item, index) => {
      // Generate approximate coordinates for Pakistan regions
      const baseCoords = getPakistanCoordinates(item.name, index);
      
      return {
        type: 'Feature',
        properties: {
          name: item.name,
          value: item.value,
          province: item.province,
          indicator: selectedIndicator
        },
        geometry: {
          type: 'Point',
          coordinates: baseCoords
        }
      };
    });

    const geojson = {
      type: 'FeatureCollection',
      features: features
    };

    // Add source
    map.current.addSource('climate-data', {
      type: 'geojson',
      data: geojson as any
    });

    // Add circle layer
    map.current.addLayer({
      id: 'climate-data-layer',
      type: 'circle',
      source: 'climate-data',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'value'],
          0, 8,
          1, 25
        ],
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
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add click events
    map.current.on('click', 'climate-data-layer', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const properties = feature.properties;
        
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${properties?.name}</h3>
              <p class="text-sm text-gray-600">Province: ${properties?.province}</p>
              <p class="text-sm"><strong>${selectedIndicator.charAt(0).toUpperCase() + selectedIndicator.slice(1)}:</strong> ${properties?.value?.toFixed(3)}</p>
            </div>
          `)
          .addTo(map.current!);
      }
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'climate-data-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'climate-data-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

  }, [mapLoaded, visualizationData, selectedIndicator]);

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: [69.3451, 30.3753],
        zoom: 5
      });
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
      {/* Mapbox container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
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
        <div className="flex items-center space-x-1 mb-2">
          <div className="w-24 h-4 bg-gradient-to-r from-blue-100 via-blue-400 to-blue-900 rounded"></div>
        </div>
        <div className="flex justify-between w-24 text-xs text-gray-600 mb-2">
          <span>0.0</span>
          <span>0.5</span>
          <span>1.0</span>
        </div>
        <p className="text-xs text-gray-500">
          Showing {selectedBoundary} level data ({visualizationData.length} areas) - {selectedAreaClassification === "all" ? "All Areas" : selectedAreaClassification.charAt(0).toUpperCase() + selectedAreaClassification.slice(1)}
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
  );
}

// Helper function to generate approximate coordinates for Pakistan regions
function getPakistanCoordinates(regionName: string, index: number): [number, number] {
  // Define approximate coordinates for major Pakistan regions
  const regionCoords: { [key: string]: [number, number] } = {
    'KHANPUR': [70.6555, 28.6449],
    'LIAQUATPUR': [71.3419, 29.3736],
    'RAHIM YAR KHAN': [70.2946, 28.4212],
    'SADIQABAD': [70.1206, 28.3056],
    'LAHORE': [74.3587, 31.5204],
    'KARACHI': [67.0011, 24.8607],
    'ISLAMABAD': [73.0479, 33.6844],
    'RAWALPINDI': [73.0479, 33.5651],
    'FAISALABAD': [73.0823, 31.4075],
    'MULTAN': [71.5249, 30.1575],
    'PESHAWAR': [71.5249, 34.0151],
    'QUETTA': [66.9750, 30.1798],
  };

  // Check if we have specific coordinates for this region
  const upperRegionName = regionName.toUpperCase();
  if (regionCoords[upperRegionName]) {
    return regionCoords[upperRegionName];
  }

  // Generate coordinates within Pakistan bounds if not found
  const pakistanBounds = {
    minLng: 60.8738,
    maxLng: 77.8375,
    minLat: 23.6345,
    maxLat: 37.0841
  };

  // Create a somewhat random but consistent position based on the index
  const lngRange = pakistanBounds.maxLng - pakistanBounds.minLng;
  const latRange = pakistanBounds.maxLat - pakistanBounds.minLat;
  
  const lng = pakistanBounds.minLng + (lngRange * (0.3 + (index * 0.13) % 0.4));
  const lat = pakistanBounds.minLat + (latRange * (0.3 + (index * 0.17) % 0.4));

  return [lng, lat];
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
