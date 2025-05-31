import { useState } from "react";
import { Plus, Minus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClimateMapProps {
  selectedIndicator: string;
}

export default function ClimateMap({ selectedIndicator }: ClimateMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const handleResetView = () => setZoomLevel(1);

  return (
    <div className="flex-1 relative">
      {/* Interactive climate vulnerability map */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 relative overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 opacity-80" style={{ transform: `scale(${zoomLevel})` }}>
          <svg viewBox="0 0 1000 600" className="w-full h-full">
            {/* U.S. Map Outline */}
            <path 
              d="M200 150 Q300 120 400 140 Q500 130 600 150 Q700 140 800 160 L820 200 Q810 250 790 300 Q780 350 760 400 L740 450 Q700 480 650 470 Q600 480 550 470 Q500 480 450 470 Q400 480 350 470 Q300 480 250 470 L200 450 Q180 400 170 350 Q160 300 170 250 Q180 200 200 150 Z" 
              fill="#1e40af" 
              opacity="0.3" 
              stroke="#1e40af" 
              strokeWidth="2"
            />
            
            {/* County-level vulnerability visualization */}
            <g className="counties">
              {/* High vulnerability areas (darker blue) */}
              <rect x="450" y="300" width="40" height="30" fill="#1e3a8a" opacity="0.8" className="hover:opacity-100 cursor-pointer"/>
              <rect x="500" y="320" width="35" height="25" fill="#1e3a8a" opacity="0.8" className="hover:opacity-100 cursor-pointer"/>
              <rect x="380" y="280" width="45" height="35" fill="#1d4ed8" opacity="0.7" className="hover:opacity-100 cursor-pointer"/>
              <rect x="420" y="310" width="30" height="28" fill="#1d4ed8" opacity="0.7" className="hover:opacity-100 cursor-pointer"/>
              
              {/* Medium vulnerability areas */}
              <rect x="350" y="250" width="38" height="32" fill="#3b82f6" opacity="0.6" className="hover:opacity-100 cursor-pointer"/>
              <rect x="550" y="290" width="42" height="30" fill="#3b82f6" opacity="0.6" className="hover:opacity-100 cursor-pointer"/>
              <rect x="320" y="320" width="35" height="25" fill="#60a5fa" opacity="0.5" className="hover:opacity-100 cursor-pointer"/>
              <rect x="580" y="260" width="40" height="35" fill="#60a5fa" opacity="0.5" className="hover:opacity-100 cursor-pointer"/>
              
              {/* Lower vulnerability areas */}
              <rect x="250" y="200" width="45" height="30" fill="#93c5fd" opacity="0.4" className="hover:opacity-100 cursor-pointer"/>
              <rect x="650" y="220" width="50" height="40" fill="#93c5fd" opacity="0.4" className="hover:opacity-100 cursor-pointer"/>
              <rect x="280" y="350" width="35" height="28" fill="#dbeafe" opacity="0.3" className="hover:opacity-100 cursor-pointer"/>
              <rect x="620" y="350" width="40" height="30" fill="#dbeafe" opacity="0.3" className="hover:opacity-100 cursor-pointer"/>
            </g>
            
            {/* State boundaries */}
            <g className="state-lines" stroke="#64748b" strokeWidth="1" fill="none" opacity="0.4">
              <line x1="300" y1="150" x2="300" y2="450"/>
              <line x1="400" y1="140" x2="400" y2="470"/>
              <line x1="500" y1="130" x2="500" y2="480"/>
              <line x1="600" y1="150" x2="600" y2="470"/>
              <line x1="700" y1="140" x2="700" y2="480"/>
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
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">National Vulnerability Scale</h4>
          <div className="flex items-center space-x-1">
            <div className="w-24 h-4 bg-gradient-to-r from-blue-100 to-blue-900 rounded"></div>
          </div>
          <div className="flex justify-between w-24 text-xs text-gray-600 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Click areas to filter map</p>
        </div>
      </div>
    </div>
  );
}
