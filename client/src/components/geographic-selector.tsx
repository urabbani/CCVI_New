import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usStates } from "@/lib/climate-data";

interface GeographicSelectorProps {
  selectedState?: string;
  onStateSelect: (stateCode: string) => void;
}

export default function GeographicSelector({ selectedState, onStateSelect }: GeographicSelectorProps) {
  const [geographicMode, setGeographicMode] = useState<"state" | "epa">("state");

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
            variant={geographicMode === "state" ? "default" : "outline"}
            className={`w-full justify-start ${
              geographicMode === "state" 
                ? "climate-blue-500 hover:climate-blue-600 text-white" 
                : "hover:bg-gray-200"
            }`}
            onClick={() => setGeographicMode("state")}
          >
            State
          </Button>
          <Button
            variant={geographicMode === "epa" ? "default" : "outline"}
            className={`w-full justify-start ${
              geographicMode === "epa" 
                ? "climate-blue-500 hover:climate-blue-600 text-white" 
                : "hover:bg-gray-200"
            }`}
            onClick={() => setGeographicMode("epa")}
          >
            EPA Region
          </Button>
        </div>
      </div>

      {/* State Grid */}
      <div className="p-4 flex-1">
        <div className="grid grid-cols-6 gap-1 text-xs">
          {usStates.map((state) => (
            <Button
              key={state.code}
              variant="ghost"
              size="sm"
              className={`p-1 h-8 text-center font-medium transition-colors ${
                selectedState === state.code
                  ? "climate-blue-500 text-white hover:climate-blue-600"
                  : "text-gray-700 hover:climate-blue-100"
              }`}
              onClick={() => onStateSelect(state.code)}
            >
              {state.code}
            </Button>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>State values represent the medians of all tracks within that state</p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">Click scale to filter map</p>
      </div>
    </div>
  );
}
