export interface IndicatorCategory {
  id: string;
  name: string;
  description?: string;
  indicators?: string[];
  hasSubcategories?: boolean;
}

export interface CCVIIndicator {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  isActive: boolean;
  endpoint?: string;
}

export interface Province {
  id: number;
  name: string;
  code: string;
  vulnerabilityScore?: number;
}

export interface District {
  id: number;
  name: string;
  province_id: number;
  vulnerabilityScore?: number;
}

export interface Tehsil {
  id: number;
  name: string;
  district_id: number;
  vulnerabilityScore?: number;
}

export const ccviIndicatorCategories: IndicatorCategory[] = [
  {
    id: "vulnerability",
    name: "Overall Climate Vulnerability",
    description: "Climate Change Vulnerability Index combining adaptive capacity, sensitivity, and exposure indicators.",
  },
  {
    id: "adaptive-capacity",
    name: "Adaptive Capacity",
    description: "The ability of systems, institutions, humans and other organisms to adjust to potential damage, to take advantage of opportunities, or to respond to consequences.",
  },
  {
    id: "sensitivity",
    name: "Sensitivity Index", 
    description: "The degree to which a system is affected, either adversely or beneficially, by climate-related stimuli.",
  },
  {
    id: "exposure",
    name: "Exposure",
    description: "The presence of people, livelihoods, species or ecosystems, environmental functions, services, and resources that could be adversely affected.",
  },
];

export const pakistanProvinces: Province[] = [
  { id: 1, name: "Punjab", code: "PB" },
  { id: 2, name: "Sindh", code: "SD" },
  { id: 3, name: "Khyber Pakhtunkhwa", code: "KP" },
  { id: 4, name: "Balochistan", code: "BL" },
  { id: 5, name: "Gilgit-Baltistan", code: "GB" },
  { id: 6, name: "Azad Jammu & Kashmir", code: "AK" },
  { id: 7, name: "Islamabad Capital Territory", code: "IS" },
];

// IWMI CCVI API endpoints
export const API_BASE_URL = "https://pakwmis.iwmi.org/iwmi-ccvi/backend/api";

export const API_ENDPOINTS = {
  provinces: `${API_BASE_URL}/location/provinces`,
  districts: `${API_BASE_URL}/location/districts`,
  tehsils: `${API_BASE_URL}/location/tehsils`,
  vulnerability: `${API_BASE_URL}/ccvi/vulnerability`,
  adaptiveCapacity: `${API_BASE_URL}/ccvi/adaptive-capacity`,
  sensitivity: `${API_BASE_URL}/ccvi/sensitivity-index`,
  exposure: `${API_BASE_URL}/ccvi/exposure`,
};
