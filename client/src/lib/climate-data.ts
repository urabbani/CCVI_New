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
  // Exposure sub-indicators
  {
    id: "avg-precipitation",
    name: "Average Level of Precipitation",
    description: "Average precipitation levels indicating water availability and flood risk.",
  },
  {
    id: "avg-temp",
    name: "Average Level of Min and Max Temperature",
    description: "Temperature extremes affecting agriculture and human health.",
  },
  {
    id: "water-level-depth",
    name: "Water Level Depth",
    description: "Groundwater depth indicating water resource availability.",
  },
  {
    id: "electrical-conductivity",
    name: "Electrical Conductivity",
    description: "Water quality indicator affecting agricultural productivity.",
  },
  {
    id: "total-dissolved-solids",
    name: "Total Dissolved Solids",
    description: "Water quality parameter indicating salinity levels.",
  },
  {
    id: "residual-sodium-bicarbonate",
    name: "Residual Sodium Bicarbonate",
    description: "Soil and water quality indicator for agricultural suitability.",
  },
  {
    id: "sodium-absorption-ratio",
    name: "Sodium Absorption Ratio",
    description: "Soil quality indicator for agricultural productivity.",
  },
  {
    id: "wind-speed",
    name: "Wind Speed",
    description: "Wind patterns affecting weather extremes and agriculture.",
  },
  {
    id: "surface-pressure",
    name: "Surface Pressure",
    description: "Atmospheric pressure patterns influencing weather systems.",
  },
  // Sensitivity sub-indicators
  {
    id: "cooking-material",
    name: "Material used for burning during cooking",
    description: "Cooking fuel types indicating energy vulnerability.",
  },
  {
    id: "drinking-water-source",
    name: "Source used for Drinking Water",
    description: "Water source types affecting health and resilience.",
  },
  {
    id: "residence-type",
    name: "Type of Residence",
    description: "Housing types indicating structural vulnerability.",
  },
  {
    id: "house-walls-material",
    name: "Material used to build house walls",
    description: "Construction materials affecting climate resilience.",
  },
  {
    id: "house-roof-material",
    name: "Material used to build house roof",
    description: "Roof materials affecting protection from weather extremes.",
  },
  {
    id: "toilet-facility",
    name: "Type of toilet facility in the household",
    description: "Sanitation facilities affecting health vulnerability.",
  },
  {
    id: "temporary-migration",
    name: "Households who have seen temporary migration",
    description: "Migration patterns indicating livelihood vulnerability.",
  },
  {
    id: "elderly-individuals",
    name: "Individuals above 65 years of age",
    description: "Elderly population vulnerable to climate extremes.",
  },
  {
    id: "chronic-ill-patients",
    name: "Households with Chronic Ill Patients",
    description: "Health vulnerabilities affecting climate resilience.",
  },
  {
    id: "households-pwds",
    name: "Households with PWDs*",
    description: "Households with persons with disabilities requiring special support.",
  },
  {
    id: "infant-deaths",
    name: "Households with Infant deaths in last 12 months",
    description: "Child mortality indicating health system vulnerabilities.",
  },
  // Adaptive capacity sub-indicators
  {
    id: "educated-individuals",
    name: "Educated Individuals",
    description: "Education levels affecting adaptive capacity.",
  },
  {
    id: "employed-individuals",
    name: "Employed Individuals",
    description: "Employment rates indicating economic resilience.",
  },
  {
    id: "home-appliances",
    name: "Households owning Home Appliances",
    description: "Asset ownership indicating economic capacity.",
  },
  {
    id: "agricultural-land",
    name: "Household owning Agricultural Land",
    description: "Land ownership providing livelihood security.",
  },
  {
    id: "livestock",
    name: "Household owning Livestock",
    description: "Livestock ownership providing livelihood diversification.",
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

export interface YearOption {
  id: number;
  value: string;
  label: string;
}

// IWMI CCVI API endpoints
export const API_BASE_URL = "https://pakwmis.iwmi.org/iwmi-ccvi/backend/api";

export const API_ENDPOINTS = {
  provinces: `${API_BASE_URL}/location/provinces`,
  districts: `${API_BASE_URL}/location/districts`,
  tehsils: `${API_BASE_URL}/location/tehsils`,
  years: `${API_BASE_URL}/location/years`,
  vulnerability: `${API_BASE_URL}/ccvi/vulnerability`,
  "adaptive-capacity": `${API_BASE_URL}/ccvi/adaptive-capacity`,
  sensitivity: `${API_BASE_URL}/ccvi/sensitivity-index`,
  exposure: `${API_BASE_URL}/ccvi/exposure`,
  
  // Climate/Environmental endpoints for exposure indicators
  "avg-precipitation": `${API_BASE_URL}/climate/climate/statistics`,
  "avg-temp": `${API_BASE_URL}/climate/climate/statistics`,
  "water-level-depth": `${API_BASE_URL}/climate/environmental/parameters`,
  "electrical-conductivity": `${API_BASE_URL}/climate/environmental/parameters`,
  "total-dissolved-solids": `${API_BASE_URL}/climate/environmental/parameters`,
  "residual-sodium-bicarbonate": `${API_BASE_URL}/climate/environmental/parameters`,
  "sodium-absorption-ratio": `${API_BASE_URL}/climate/environmental/parameters`,
  "wind-speed": `${API_BASE_URL}/climate/climate/statistics`,
  "surface-pressure": `${API_BASE_URL}/climate/climate/statistics`,
  
  // Household statistics endpoints for sensitivity indicators
  "cooking-material": `${API_BASE_URL}/household/statistics`,
  "drinking-water-source": `${API_BASE_URL}/household/statistics`,
  "residence-type": `${API_BASE_URL}/household/statistics`,
  "house-walls-material": `${API_BASE_URL}/household/statistics`,
  "house-roof-material": `${API_BASE_URL}/household/statistics`,
  "toilet-facility": `${API_BASE_URL}/household/statistics`,
  "temporary-migration": `${API_BASE_URL}/household/statistics`,
  "chronic-ill-patients": `${API_BASE_URL}/household/statistics`,
  "households-pwds": `${API_BASE_URL}/household/statistics`,
  "infant-deaths": `${API_BASE_URL}/household/statistics`,
  
  // Population endpoint for age distribution
  "elderly-individuals": `${API_BASE_URL}/population/age-distribution`,
  
  // Household/Population endpoints for adaptive capacity indicators
  "educated-individuals": `${API_BASE_URL}/household/statistics`,
  "employed-individuals": `${API_BASE_URL}/household/statistics`,
  "home-appliances": `${API_BASE_URL}/household/statistics`,
  "agricultural-land": `${API_BASE_URL}/household/statistics`,
  "livestock": `${API_BASE_URL}/household/statistics`,
};

// Parameter mappings for specific indicator API calls
export const INDICATOR_PARAMS = {
  // Climate statistics parameters
  "avg-precipitation": { metric: "precipitation" },
  "avg-temp": { metric: "temperature" },
  "wind-speed": { metric: "wind_speed" },
  "surface-pressure": { metric: "surface_pressure" },
  
  // Environmental parameters
  "water-level-depth": { parameter: "water_level_depth" },
  "electrical-conductivity": { parameter: "electrical_conductivity" },
  "total-dissolved-solids": { parameter: "total_dissolved_solids" },
  "residual-sodium-bicarbonate": { parameter: "residual_sodium_bicarbonate" },
  "sodium-absorption-ratio": { parameter: "sodium_absorption_ratio" },
  
  // Household statistics parameters
  "cooking-material": { metric: "cooking_fuel" },
  "drinking-water-source": { metric: "drinking_water_source" },
  "residence-type": { metric: "residence_type" },
  "house-walls-material": { metric: "wall_material" },
  "house-roof-material": { metric: "roof_material" },
  "toilet-facility": { metric: "toilet_facility" },
  "temporary-migration": { metric: "temporary_migration" },
  "chronic-ill-patients": { metric: "chronic_illness" },
  "households-pwds": { metric: "persons_with_disabilities" },
  "infant-deaths": { metric: "infant_mortality" },
  
  // Population parameters
  "elderly-individuals": { age_group: "65_plus" },
  
  // Adaptive capacity parameters
  "educated-individuals": { metric: "education_level" },
  "employed-individuals": { metric: "employment_status" },
  "home-appliances": { metric: "home_appliances" },
  "agricultural-land": { metric: "agricultural_land_ownership" },
  "livestock": { metric: "livestock_ownership" },
};
