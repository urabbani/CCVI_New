import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Map, { Source, Layer, NavigationControl } from "react-map-gl";
import type { LayerProps } from "react-map-gl";
import { Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/climate-data";

interface PakistanMapProps {
  selectedIndicator: string;
  selectedBoundary: "districts" | "tehsils";
  selectedProvince?: number;
}

// Pakistan bounds for map initialization
const PAKISTAN_BOUNDS: [number, number, number, number] = [60.5, 23.5, 77.5, 37.5];
const PAKISTAN_CENTER: [number, number] = [69.3451, 30.3753];

export default function PakistanMap({ 
  selectedIndicator, 
  selectedBoundary, 
  selectedProvince 
}: PakistanMapProps) {
  const mapRef = useRef<any>();
  const [viewState, setViewState] = useState({
    longitude: PAKISTAN_CENTER[0],
    latitude: PAKISTAN_CENTER[1],
    zoom: 5.5,
  });

  // Fetch vulnerability data based on selected indicator
  const { data: vulnerabilityData, isLoading } = useQuery({
    queryKey: [`/api/ccvi/${selectedIndicator}`, selectedBoundary, selectedProvince],
    queryFn: async () => {
      const endpoint = API_ENDPOINTS[selectedIndicator as keyof typeof API_ENDPOINTS];
      if (!endpoint) return null;
      
      const params = new URLSearchParams();
      if (selectedBoundary === "districts") {
        params.append("area_type", "district");
      } else {
        params.append("area_type", "tehsil");
      }
      if (selectedProvince) {
        params.append("province_id", selectedProvince.toString());
      }
      
      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${selectedIndicator} data`);
      }
      return response.json();
    },
    enabled: !!selectedIndicator,
  });

  // Create GeoJSON from vulnerability data
  const createGeoJSON = (data: any[]) => {
    if (!data) return null;
    
    const features = data.map((item: any) => ({
      type: "Feature",
      properties: {
        id: item.id || item.district_id || item.tehsil_id,
        name: item.name || item.district_name || item.tehsil_name,
        value: item.vulnerability_index || item.value || 0,
        province: item.province_name,
      },
      geometry: {
        type: "Polygon",
        coordinates: item.geometry?.coordinates || [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
      }
    }));

    return {
      type: "FeatureCollection",
      features
    };
  };

  const geoJsonData = createGeoJSON(vulnerabilityData);

  // Layer styles for vulnerability visualization
  const vulnerabilityLayer: LayerProps = {
    id: "vulnerability-layer",
    type: "fill",
    paint: {
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", "value"],
        0, "#f0f9ff",
        0.2, "#bae6fd",
        0.4, "#7dd3fc",
        0.6, "#38bdf8",
        0.8, "#0ea5e9",
        1.0, "#0284c7"
      ],
      "fill-opacity": 0.7,
      "fill-outline-color": "#ffffff"
    }
  };

  const vulnerabilityBorderLayer: LayerProps = {
    id: "vulnerability-border",
    type: "line",
    paint: {
      "line-color": "#374151",
      "line-width": 1,
      "line-opacity": 0.8
    }
  };

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Mapbox token required</p>
          <p className="text-sm text-gray-500">Please configure VITE_MAPBOX_ACCESS_TOKEN</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {isLoading && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Loading data...</span>
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        maxBounds={PAKISTAN_BOUNDS}
        minZoom={4}
        maxZoom={12}
      >
        <NavigationControl position="top-left" />
        
        {geoJsonData && (
          <Source id="vulnerability-source" type="geojson" data={geoJsonData}>
            <Layer {...vulnerabilityLayer} />
            <Layer {...vulnerabilityBorderLayer} />
          </Source>
        )}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          {selectedIndicator.charAt(0).toUpperCase() + selectedIndicator.slice(1)} Index
        </h4>
        <div className="flex items-center space-x-1">
          <div className="w-24 h-4 bg-gradient-to-r from-blue-100 via-blue-400 to-blue-700 rounded"></div>
        </div>
        <div className="flex justify-between w-24 text-xs text-gray-600 mt-1">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Showing {selectedBoundary} level data
        </p>
      </div>
    </div>
  );
}
