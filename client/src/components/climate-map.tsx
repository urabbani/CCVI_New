import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Minus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/lib/climate-data";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoibXVtYWlyciIsImEiOiJjbTljbjAyd2EwNW90MmtyN3FpODVqbHI0In0.S4BxDCnbkvlj6ECKBXdWcw";

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
  selectedAreaClassification,
}: PakistanMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // API base URL for administrative boundaries
  const API_BASE_URL = "https://pakwmis.iwmi.org/iwmi-ccvi/backend/api";

  // Fetch CCVI data using the correct specific endpoints
  const {
    data: ccviData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "ccvi-data",
      selectedIndicator,
      selectedYear,
      selectedAreaClassification,
    ],
    queryFn: async () => {
      // Map indicator to correct API endpoint
      const endpointMap = {
        vulnerability:
          "https://pakwmis.iwmi.org/iwmi-ccvi/backend/api/ccvi/vulnerability",
        "adaptive-capacity":
          "https://pakwmis.iwmi.org/iwmi-ccvi/backend/api/ccvi/adaptive-capacity",
        sensitivity:
          "https://pakwmis.iwmi.org/iwmi-ccvi/backend/api/ccvi/sensitivity-index",
        exposure:
          "https://pakwmis.iwmi.org/iwmi-ccvi/backend/api/ccvi/exposure",
      };

      const endpoint =
        endpointMap[selectedIndicator as keyof typeof endpointMap];
      if (!endpoint) {
        throw new Error(
          `No endpoint found for indicator: ${selectedIndicator}`
        );
      }

      const params = new URLSearchParams({
        year: selectedYear.toString(),
        area_type: "tehsil", // Always tehsil for Rahim Yar Khan
        district: "RAHIM YAR KHAN", // Fixed district - use + encoding for spaces
      });

      // Add area classification filter if not "all"
      if (selectedAreaClassification !== "all") {
        params.append("area_classification", selectedAreaClassification);
      }

      const url = `${endpoint}?${params}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Failed to fetch ${selectedIndicator} data`
        );
      }

      const data = await response.json();
      return data;
    },
    enabled: !!selectedIndicator,
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch tehsils of Rahim Yar Khan District specifically (ID: 120)
  const {
    data: boundaryData,
    isLoading: boundaryLoading,
    error: boundaryError,
  } = useQuery({
    queryKey: ["rahim-yar-khan-tehsils"],
    queryFn: async () => {
      // Fetch tehsils of Rahim Yar Khan District using parent_id=120
      const url = `${API_BASE_URL}/administrative-units/tehsil?parent_id=120`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Failed to fetch Rahim Yar Khan tehsils`
        );
      }

      const data = await response.json();
      return data;
    },
    retry: 2,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Initialize Mapbox map with delayed retry
  useEffect(() => {
    const initializeMap = () => {
      // Check if map already exists
      if (map.current) return;

      // Check if container is ready
      if (!mapContainer.current) {
        setTimeout(initializeMap, 100);
        return;
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [69.3451, 30.3753],
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
      });

      map.current.on("load", () => {
        setMapLoaded(true);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-left");
    };

    // Start the initialization process
    initializeMap();

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, []); // Empty dependency array - runs only once

  // Get color based on CCVI value - Red scale from high to low
  const getColorByValue = (value: number) => {
    // Red color scale: High values = Dark Red, Low values = Light Red/Pink
    if (value >= 0.8) return "#7f1d1d"; // Very dark red
    if (value >= 0.6) return "#dc2626"; // Dark red
    if (value >= 0.4) return "#ef4444"; // Medium red
    if (value >= 0.2) return "#f87171"; // Light red
    return "#fecaca"; // Very light red/pink
  };

  // Create visualization data mapping for Rahim Yar Khan tehsils
  const createVisualizationData = (ccviData: any) => {
    if (!ccviData) return new Map();

    const dataMap = new Map();

    if (ccviData.tehsil_vulnerability) {
      // Handle vulnerability endpoint structure
      Object.entries(ccviData.tehsil_vulnerability).forEach(
        ([tehsilName, tehsilData]: [string, any]) => {
          const value = getIndicatorValue(tehsilData, selectedIndicator);
          dataMap.set(tehsilName.toUpperCase(), {
            name: tehsilName,
            district: ccviData.district,
            vulnerability_index: tehsilData["Vulnerability Index"],
            exposure: tehsilData.Exposure,
            sensitivity: tehsilData.Sensitivity,
            adaptive_capacity: tehsilData["Adaptive Capacity"],
            value: value,
          });
        }
      );
    } else if (Array.isArray(ccviData)) {
      ccviData.forEach((item: any) => {
        const name =
          item.name ||
          item.district_name ||
          item.tehsil_name ||
          item.area_name ||
          item.tehsil;
        if (name) {
          const value = getIndicatorValue(item, selectedIndicator);
          dataMap.set(name.toUpperCase(), {
            ...item,
            value: value,
          });
        }
      });
    } else if (ccviData.data && Array.isArray(ccviData.data)) {
      ccviData.data.forEach((item: any) => {
        const name =
          item.name || item.district_name || item.tehsil_name || item.area_name;
        if (name) {
          const value = getIndicatorValue(item, selectedIndicator);
          dataMap.set(name.toUpperCase(), {
            ...item,
            value: value,
          });
        }
      });
    }

    return dataMap;
  };

  // Helper function to get the correct value based on selected indicator
  const getIndicatorValue = (data: any, indicator: string): number => {
    switch (indicator) {
      case "vulnerability":
        return data["Vulnerability Index"] || data.vulnerability_index || 0;
      case "exposure":
        return data.Exposure || data.exposure || 0;
      case "sensitivity":
        return (
          data.Sensitivity || data.sensitivity || data.sensitivity_index || 0
        );
      case "adaptive-capacity":
        return data["Adaptive Capacity"] || data.adaptive_capacity || 0;
      default:
        return data.value || 0;
    }
  };

  const visualizationDataMap = createVisualizationData(ccviData);

  // Add boundary layers to map when data changes
  useEffect(() => {
    if (
      !map.current ||
      !mapLoaded ||
      !boundaryData?.success ||
      !boundaryData?.units
    )
      return;

    const addBoundariesToMap = () => {
      if (!map.current || !map.current.isStyleLoaded()) {
        return;
      }

      // Remove existing boundary layers
      const layersToRemove = [
        "boundary-fill",
        "boundary-line",
        "boundary-labels",
      ];
      layersToRemove.forEach((layerId) => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
      });

      if (map.current.getSource("boundary-data")) {
        map.current.removeSource("boundary-data");
      }

      // Filter units that have geometry
      const unitsWithGeometry = boundaryData.units.filter(
        (unit: any) => unit.geometry
      );

      if (unitsWithGeometry.length === 0) {
        return;
      }

      // Create GeoJSON features
      const features = unitsWithGeometry.map((unit: any) => {
        const unitName = unit.name.toUpperCase();
        const ccviValue = visualizationDataMap.get(unitName);
        const value = ccviValue?.value || 0;

        return {
          type: "Feature",
          properties: {
            id: unit.id,
            name: unit.name,
            value: value,
            indicator: selectedIndicator,
            // Add all CCVI data if available
            ...(ccviValue || {}),
          },
          geometry: unit.geometry,
        };
      });

      const geojson = {
        type: "FeatureCollection",
        features: features,
      };

      try {
        // Add source
        map.current.addSource("boundary-data", {
          type: "geojson",
          data: geojson as any,
        });

        // Add fill layer with red color scale
        map.current.addLayer({
          id: "boundary-fill",
          type: "fill",
          source: "boundary-data",
          paint: {
            "fill-color": [
              "case",
              ["has", "value"],
              [
                "interpolate",
                ["linear"],
                ["get", "value"],
                0,
                "#fecaca", // Very light red/pink for lowest values
                0.2,
                "#f87171", // Light red
                0.4,
                "#ef4444", // Medium red
                0.6,
                "#dc2626", // Dark red
                0.8,
                "#b91c1c", // Darker red
                1,
                "#7f1d1d", // Very dark red for highest values
              ],
              "#e5e7eb", // Gray for areas without data
            ],
            "fill-opacity": 0.7,
          },
        });

        // Add border layer
        map.current.addLayer({
          id: "boundary-line",
          type: "line",
          source: "boundary-data",
          paint: {
            "line-color": "#374151",
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4,
              1,
              8,
              2,
              12,
              3,
            ],
            "line-opacity": 0.8,
          },
        });

        // Add labels layer
        map.current.addLayer({
          id: "boundary-labels",
          type: "symbol",
          source: "boundary-data",
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4,
              10,
              8,
              12,
              12,
              14,
            ],
            "text-anchor": "center",
            "text-offset": [0, 0],
          },
          paint: {
            "text-color": "#1f2937",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1,
          },
        });

        // Add click events
        map.current.on("click", "boundary-fill", (e) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            const properties = feature.properties;

            let popupContent = `
              <div class="p-3">
                <h3 class="font-semibold text-lg">${properties?.name}</h3>
                <p class="text-sm text-gray-600 mb-2">Tehsil (Rahim Yar Khan District)</p>
            `;

            // Add CCVI data if available
            if (properties?.value !== undefined) {
              popupContent += `
                <div class="border-t pt-2 mt-2">
                  <h4 class="font-medium text-sm mb-1">CCVI Indicators:</h4>
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between">
                      <span>${
                        selectedIndicator.charAt(0).toUpperCase() +
                        selectedIndicator.slice(1)
                      }:</span>
                      <span class="font-medium">${properties.value.toFixed(
                        3
                      )}</span>
                    </div>
              `;

              if (properties.vulnerability_index !== undefined) {
                popupContent += `
                    <div class="flex justify-between">
                      <span>Vulnerability:</span>
                      <span class="font-medium">${properties.vulnerability_index.toFixed(
                        3
                      )}</span>
                    </div>
                `;
              }

              if (properties.exposure !== undefined) {
                popupContent += `
                    <div class="flex justify-between">
                      <span>Exposure:</span>
                      <span class="font-medium">${properties.exposure.toFixed(
                        3
                      )}</span>
                    </div>
                `;
              }

              if (properties.sensitivity !== undefined) {
                popupContent += `
                    <div class="flex justify-between">
                      <span>Sensitivity:</span>
                      <span class="font-medium">${properties.sensitivity.toFixed(
                        3
                      )}</span>
                    </div>
                `;
              }

              if (properties.adaptive_capacity !== undefined) {
                popupContent += `
                    <div class="flex justify-between">
                      <span>Adaptive Capacity:</span>
                      <span class="font-medium">${properties.adaptive_capacity.toFixed(
                        3
                      )}</span>
                    </div>
                `;
              }

              popupContent += `
                  </div>
                </div>
              `;
            }

            popupContent += `</div>`;

            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(popupContent)
              .addTo(map.current!);
          }
        });

        // Change cursor on hover
        map.current.on("mouseenter", "boundary-fill", () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });

        map.current.on("mouseleave", "boundary-fill", () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });

        // Fit map to boundaries
        if (features.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          features.forEach((feature: any) => {
            if (feature.geometry.type === "Polygon") {
              feature.geometry.coordinates[0].forEach(
                (coord: [number, number]) => {
                  bounds.extend(coord);
                }
              );
            } else if (feature.geometry.type === "MultiPolygon") {
              feature.geometry.coordinates.forEach((polygon: any) => {
                polygon[0].forEach((coord: [number, number]) => {
                  bounds.extend(coord);
                });
              });
            }
          });

          if (!bounds.isEmpty()) {
            map.current.fitBounds(bounds, { padding: 20 });
          }
        }
      } catch (error) {
        console.error("Error adding boundary layers:", error);
      }
    };

    // Check if style is loaded, if not wait for it
    if (map.current.isStyleLoaded()) {
      addBoundariesToMap();
    } else {
      map.current.once("styledata", addBoundariesToMap);
    }
  }, [mapLoaded, boundaryData, visualizationDataMap, selectedIndicator]);

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
        zoom: 5,
      });
    }
  };

  if (isLoading || boundaryLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">
            Loading {isLoading ? `${selectedIndicator} data` : "boundary data"}
            ...
          </span>
        </div>
      </div>
    );
  }

  if (error || boundaryError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Failed to load data</div>
          <div className="text-sm text-gray-600">
            {error?.message || boundaryError?.message}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Indicator: {selectedIndicator} | Year: {selectedYear} | District:
            Rahim Yar Khan
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 relative"
      style={{ height: "100%", minHeight: "500px" }}
    >
      {/* Mapbox container */}
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: "500px" }}
      />

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

      {/* Legend with Red Color Scale */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          {selectedIndicator.charAt(0).toUpperCase() +
            selectedIndicator.slice(1)}{" "}
          Index
        </h4>
        <div className="flex items-center space-x-1 mb-2">
          <div className="w-full h-4 bg-gradient-to-r from-red-100 via-red-400 to-red-900 rounded"></div>
        </div>
        <div className="flex justify-between w-full text-xs text-gray-600 mb-2">
          <span>0.0</span>
          <span>0.5</span>
          <span>1.0</span>
        </div>
        <div className="text-xs text-gray-500 mb-2">
          <div className="flex justify-between">
            <span>Low Risk</span>
            <span>High Risk</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Showing Rahim Yar Khan District ({boundaryData?.units?.length || 0}{" "}
          tehsils) -{" "}
          {selectedAreaClassification === "all"
            ? "All Areas"
            : selectedAreaClassification.charAt(0).toUpperCase() +
              selectedAreaClassification.slice(1)}
        </p>
      </div>
    </div>
  );
}
