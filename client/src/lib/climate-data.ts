
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

export interface YearOption {
  id: number;
  value: string;
  label: string;
}

// IWMI CCVI API endpoints
export const API_BASE_URL = "https://pakwmis.iwmi.org/iwmi-ccvi/backend/api";

export const API_ENDPOINTS = {
  // Location endpoints
  provinces: `${API_BASE_URL}/location/provinces`,
  districts: `${API_BASE_URL}/location/districts`,
  tehsils: `${API_BASE_URL}/location/tehsils`,
  years: `${API_BASE_URL}/location/years`,
  
  // Administrative units for map boundaries
  administrativeUnits: `${API_BASE_URL}/administrative-units`,
  
  // Main CCVI components
  vulnerability: `${API_BASE_URL}/ccvi/vulnerability`,
  "adaptive-capacity": `${API_BASE_URL}/ccvi/adaptive-capacity`,
  sensitivity: `${API_BASE_URL}/ccvi/sensitivity-index`,
  exposure: `${API_BASE_URL}/ccvi/exposure`,
  
  // Exposure indicators
  "avg-precipitation": `${API_BASE_URL}/climate/climate/statistics`,
  "avg-temp": `${API_BASE_URL}/climate/climate/statistics`,
  "water-level-depth": `${API_BASE_URL}/climate/environmental/parameters`,
  "electrical-conductivity": `${API_BASE_URL}/climate/environmental/parameters`,
  "total-dissolved-solids": `${API_BASE_URL}/climate/environmental/parameters`,
  "residual-sodium-bicarbonate": `${API_BASE_URL}/climate/environmental/parameters`,
  "sodium-absorption-ratio": `${API_BASE_URL}/climate/environmental/parameters`,
  "wind-speed": `${API_BASE_URL}/climate/climate/statistics`,
  "surface-pressure": `${API_BASE_URL}/climate/climate/statistics`,
  
  // Sensitivity indicators
  "cooking-material": `${API_BASE_URL}/household/statistics`,
  "drinking-water-source": `${API_BASE_URL}/household/statistics`,
  "residence-type": `${API_BASE_URL}/household/statistics`,
  "house-walls-material": `${API_BASE_URL}/household/statistics`,
  "house-roof-material": `${API_BASE_URL}/household/statistics`,
  "toilet-facility": `${API_BASE_URL}/household/statistics`,
  "temporary-migration": `${API_BASE_URL}/household/statistics`,
  "elderly-individuals": `${API_BASE_URL}/population/age-distribution`,
  "chronic-ill-patients": `${API_BASE_URL}/household/statistics`,
  "households-pwds": `${API_BASE_URL}/household/statistics`,
  "infant-deaths": `${API_BASE_URL}/household/statistics`,
  
  // Adaptive capacity indicators
  "educated-individuals": `${API_BASE_URL}/household/statistics`,
  "employed-individuals": `${API_BASE_URL}/household/statistics`,
  "home-appliances": `${API_BASE_URL}/household/statistics`,
  "agricultural-land": `${API_BASE_URL}/household/statistics`,
  "livestock": `${API_BASE_URL}/household/statistics`,
};

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
  // Exposure sub-indicators
  {
    id: "avg-precipitation",
    name: "Average Level of Precipitation",
    description: "Average precipitation levels indicating climate exposure.",
  },
  {
    id: "avg-temp",
    name: "Average Level of Min and Max Temperature",
    description: "Temperature extremes indicating climate exposure.",
  },
  {
    id: "water-level-depth",
    name: "Water Level Depth",
    description: "Groundwater level measurements.",
  },
  {
    id: "electrical-conductivity",
    name: "Electrical Conductivity",
    description: "Water quality parameter indicating salinity.",
  },
  {
    id: "total-dissolved-solids",
    name: "Total Dissolved Solids",
    description: "Water quality parameter indicating dissolved mineral content.",
  },
  {
    id: "residual-sodium-bicarbonate",
    name: "Residual Sodium Bicarbonate",
    description: "Water quality parameter affecting soil and crop health.",
  },
  {
    id: "sodium-absorption-ratio",
    name: "Sodium Absorption Ratio",
    description: "Water quality parameter affecting soil structure.",
  },
  {
    id: "wind-speed",
    name: "Wind Speed",
    description: "Average wind speed measurements.",
  },
  {
    id: "surface-pressure",
    name: "Surface Pressure",
    description: "Atmospheric pressure measurements.",
  },
  // Sensitivity sub-indicators
  {
    id: "cooking-material",
    name: "Material used for burning during cooking",
    description: "Type of cooking fuel used in households.",
  },
  {
    id: "drinking-water-source",
    name: "Source used for Drinking Water",
    description: "Primary source of drinking water for households.",
  },
  {
    id: "residence-type",
    name: "Type of Residence",
    description: "Housing type and quality indicators.",
  },
  {
    id: "house-walls-material",
    name: "Material used to build house walls",
    description: "Construction materials for house walls.",
  },
  {
    id: "house-roof-material",
    name: "Material used to build house roof",
    description: "Construction materials for house roofs.",
  },
  {
    id: "toilet-facility",
    name: "Type of toilet facility in the household",
    description: "Sanitation facility type and quality.",
  },
  {
    id: "temporary-migration",
    name: "Households who have seen temporary migration",
    description: "Households affected by temporary migration.",
  },
  {
    id: "elderly-individuals",
    name: "Individuals above 65 years of age",
    description: "Proportion of elderly population.",
  },
  {
    id: "chronic-ill-patients",
    name: "Households with Chronic Ill Patients",
    description: "Households with chronically ill members.",
  },
  {
    id: "households-pwds",
    name: "Households with PWDs",
    description: "Households with persons with disabilities.",
  },
  {
    id: "infant-deaths",
    name: "Households with Infant deaths in last 12 months",
    description: "Households with recent infant mortality.",
  },
  // Adaptive capacity sub-indicators
  {
    id: "educated-individuals",
    name: "Educated Individuals",
    description: "Education levels in the population.",
  },
  {
    id: "employed-individuals",
    name: "Employed Individuals",
    description: "Employment rates in the population.",
  },
  {
    id: "home-appliances",
    name: "Households owning Home Appliances",
    description: "Household ownership of home appliances.",
  },
  {
    id: "agricultural-land",
    name: "Household owning Agricultural Land",
    description: "Household ownership of agricultural land.",
  },
  {
    id: "livestock",
    name: "Household owning Livestock",
    description: "Household ownership of livestock.",
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

// Helper function to build API URLs with proper parameters
export function buildApiUrl(indicatorId: string, params: {
  year?: number;
  province?: string;
  district?: string;
  tehsil?: string;
  area_type?: string;
  area_classification?: string;
}): string {
  const endpoint = API_ENDPOINTS[indicatorId as keyof typeof API_ENDPOINTS];
  if (!endpoint) {
    throw new Error(`No endpoint found for indicator: ${indicatorId}`);
  }
  
  const urlParams = new URLSearchParams();
  
  // Add common parameters
  if (params.year) urlParams.append('year', params.year.toString());
  if (params.province) urlParams.append('province', params.province);
  if (params.district) urlParams.append('district', params.district);
  if (params.tehsil) urlParams.append('tehsil', params.tehsil);
  if (params.area_type) urlParams.append('area_type', params.area_type);
  if (params.area_classification && params.area_classification !== 'all') {
    urlParams.append('area_classification', params.area_classification);
  }
  
  // Add specific parameters based on indicator type
  if (indicatorId.includes('precipitation')) {
    urlParams.append('metric', 'precipitation');
  } else if (indicatorId.includes('temp')) {
    urlParams.append('metric', 'temperature');
  } else if (indicatorId.includes('wind-speed')) {
    urlParams.append('metric', 'wind_speed');
  } else if (indicatorId.includes('surface-pressure')) {
    urlParams.append('metric', 'surface_pressure');
  } else if (indicatorId.includes('water-level-depth')) {
    urlParams.append('parameter', 'water_level_depth');
  } else if (indicatorId.includes('electrical-conductivity')) {
    urlParams.append('parameter', 'electrical_conductivity');
  } else if (indicatorId.includes('total-dissolved-solids')) {
    urlParams.append('parameter', 'total_dissolved_solids');
  } else if (indicatorId.includes('residual-sodium-bicarbonate')) {
    urlParams.append('parameter', 'residual_sodium_bicarbonate');
  } else if (indicatorId.includes('sodium-absorption-ratio')) {
    urlParams.append('parameter', 'sodium_absorption_ratio');
  } else if (indicatorId.includes('cooking-material')) {
    urlParams.append('metric', 'cooking_fuel');
  } else if (indicatorId.includes('drinking-water-source')) {
    urlParams.append('metric', 'drinking_water_source');
  } else if (indicatorId.includes('residence-type')) {
    urlParams.append('metric', 'residence_type');
  } else if (indicatorId.includes('house-walls-material')) {
    urlParams.append('metric', 'wall_material');
  } else if (indicatorId.includes('house-roof-material')) {
    urlParams.append('metric', 'roof_material');
  } else if (indicatorId.includes('toilet-facility')) {
    urlParams.append('metric', 'toilet_facility');
  } else if (indicatorId.includes('temporary-migration')) {
    urlParams.append('metric', 'temporary_migration');
  } else if (indicatorId.includes('elderly-individuals')) {
    urlParams.append('age_group', '65_plus');
  } else if (indicatorId.includes('chronic-ill-patients')) {
    urlParams.append('metric', 'chronic_illness');
  } else if (indicatorId.includes('households-pwds')) {
    urlParams.append('metric', 'persons_with_disabilities');
  } else if (indicatorId.includes('infant-deaths')) {
    urlParams.append('metric', 'infant_mortality');
  } else if (indicatorId.includes('educated-individuals')) {
    urlParams.append('metric', 'education_level');
  } else if (indicatorId.includes('employed-individuals')) {
    urlParams.append('metric', 'employment_status');
  } else if (indicatorId.includes('home-appliances')) {
    urlParams.append('metric', 'home_appliances');
  } else if (indicatorId.includes('agricultural-land')) {
    urlParams.append('metric', 'agricultural_land_ownership');
  } else if (indicatorId.includes('livestock')) {
    urlParams.append('metric', 'livestock_ownership');
  }
  
  return `${endpoint}?${urlParams.toString()}`;
}
