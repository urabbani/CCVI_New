export interface IndicatorCategory {
  id: string;
  name: string;
  description?: string;
  indicators: string[];
  hasSubcategories?: boolean;
}

export interface ClimateIndicator {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  isActive: boolean;
  ratingCount: number;
}

export interface USState {
  code: string;
  name: string;
  vulnerabilityScore?: number;
}

export const indicatorCategories: IndicatorCategory[] = [
  {
    id: "overall",
    name: "Overall Climate Vulnerability",
    description: "Score combining environmental, social, economic, and infrastructure effects on neighborhood-level stability.",
    indicators: ["overall-vulnerability"],
  },
  {
    id: "community-baseline",
    name: "Community Baseline",
    indicators: ["baseline-1", "baseline-2", "baseline-3", "baseline-4"],
    hasSubcategories: true,
  },
  {
    id: "climate-impacts",
    name: "Climate Impacts", 
    indicators: ["impact-1", "impact-2", "impact-3", "impact-4"],
    hasSubcategories: true,
  },
  {
    id: "health",
    name: "Health",
    indicators: ["health-1", "health-2", "health-3", "health-4"],
    hasSubcategories: true,
  },
  {
    id: "social-economic",
    name: "Social & Economic",
    indicators: ["social-1", "social-2", "social-3", "social-4"],
    hasSubcategories: true,
  },
  {
    id: "environment",
    name: "Environment",
    indicators: ["env-1", "env-2", "env-3", "env-4"],
    hasSubcategories: true,
  },
  {
    id: "extreme-events",
    name: "Extreme Events",
    indicators: ["event-1", "event-2", "event-3", "event-4"],
    hasSubcategories: true,
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    indicators: ["infra-1", "infra-2", "infra-3", "infra-4", "infra-5", "infra-6"],
  },
];

export const usStates: USState[] = [
  { code: "AK", name: "Alaska" },
  { code: "AL", name: "Alabama" },
  { code: "AR", name: "Arkansas" },
  { code: "AZ", name: "Arizona" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "IA", name: "Iowa" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "MA", name: "Massachusetts" },
  { code: "MD", name: "Maryland" },
  { code: "ME", name: "Maine" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MO", name: "Missouri" },
  { code: "MS", name: "Mississippi" },
  { code: "MT", name: "Montana" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "NE", name: "Nebraska" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NV", name: "Nevada" },
  { code: "NY", name: "New York" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VA", name: "Virginia" },
  { code: "VT", name: "Vermont" },
  { code: "WA", name: "Washington" },
  { code: "WI", name: "Wisconsin" },
  { code: "WV", name: "West Virginia" },
  { code: "WY", name: "Wyoming" },
];
