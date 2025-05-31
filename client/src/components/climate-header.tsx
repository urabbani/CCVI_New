import { Building2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClimateHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">
            The U.S. Climate Vulnerability Index
          </h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 climate-green-500 rounded flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm text-gray-600 font-medium">Environmental Protection Agency</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">TA&M</span>
            </div>
            <span className="text-sm text-gray-600 font-medium">TEXAS A&M</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 climate-blue-500 rounded flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm text-gray-600 font-medium">DASHBOARD</span>
          </div>
        </div>
      </div>
    </header>
  );
}
