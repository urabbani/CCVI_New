# CCVI API Endpoints Analysis

## Overview
The CCVI (Climate Change Vulnerability Index) API provides access to IWMI (International Water Management Institute) survey data related to climate change vulnerability in Pakistan. The API is organized into several functional categories including location data, household information, climate statistics, CCVI indices, and administrative units.

## API Structure and Endpoints

### Location Endpoints
The location endpoints provide geographical reference data that serves as a foundation for filtering other data in the API. These endpoints allow users to retrieve hierarchical location information from provinces down to tehsil level, as well as area classifications.

- `/api/location/years`: Retrieves available years for which data is collected. This endpoint serves as a temporal filter for other data queries, allowing users to specify which survey year's data they want to access.

- `/api/location/provinces`: Provides a list of provinces in Pakistan covered by the survey data. This serves as the highest level geographical filter for narrowing down data queries.

- `/api/location/districts`: Returns district-level information, which can be filtered by province. Districts represent the second level in the geographical hierarchy used in the API.

- `/api/location/tehsils`: Offers tehsil-level data, which can be filtered by both province and district. Tehsils are administrative subdivisions of districts and represent the most granular geographical unit in the standard hierarchy.

- `/api/location/area-types`: Provides classification of areas (likely urban/rural or other categorizations) that can be used as an additional filter for data queries.

### Household Endpoints
These endpoints focus on household-level data collected through surveys, providing demographic and socioeconomic information.

- `/api/household/summary`: Delivers aggregated household information, which can be filtered by location parameters. This endpoint likely provides high-level statistics about households in specified areas.

- `/api/household/statistics`: Returns detailed household statistics for generating charts, with optional location filters. As seen in the documentation, this endpoint accepts parameters for year, province, district, tehsil, and area classification, allowing for highly specific data queries.

### Population Endpoints
These endpoints provide demographic data about the population in surveyed areas.

- `/api/population/summary`: Offers aggregated population statistics that can be filtered by location parameters, providing an overview of population characteristics.

- `/api/population/age-distribution`: Returns age distribution data for the population, which can be filtered by location parameters. This endpoint is useful for demographic analysis and understanding the age structure of communities.

### Climate Endpoints
These endpoints focus on climate-related data and environmental parameters.

- `/api/climate/climate/statistics`: Provides climate statistics that can be filtered by location parameters. This likely includes temperature, precipitation, and other climate metrics.

- `/api/climate/environmental/parameters`: Returns environmental parameters data, which can be filtered by location. This may include information about natural resources, land use, or environmental conditions affecting vulnerability.

### CCVI (Climate Change Vulnerability Index) Endpoints
These endpoints provide access to various components and calculations of the Climate Change Vulnerability Index.

- `/api/ccvi/adaptive-capacity`: Returns data on adaptive capacity, which measures the ability of communities to adapt to climate change impacts. This can be filtered by location parameters.

- `/api/ccvi/exposure`: Provides exposure data, which quantifies the degree to which communities are exposed to climate hazards. This can be filtered by location parameters.

- `/api/ccvi/sensitivity-index`: Returns sensitivity index data, which measures how susceptible communities are to climate impacts. This can be filtered by location parameters.

- `/api/ccvi/vulnerability`: Provides the overall vulnerability index, which combines exposure, sensitivity, and adaptive capacity to give a comprehensive measure of climate change vulnerability. This can be filtered by location parameters.

### Administrative Units Endpoints
These endpoints provide access to administrative unit data and hierarchical relationships.

- `/api/administrative-units/{unit_type}`: Returns administrative units of the specified type. The unit_type parameter likely accepts values like "province", "district", or "tehsil".

- `/api/administrative-units/{unit_type}/{parent_id}`: Returns child administrative units under a specified parent unit. For example, retrieving all districts within a specific province.

- `/api/administrative-units/lookup/{unit_type}/{name}`: Allows looking up administrative units by name, facilitating searches for specific geographical areas.

### Utility Endpoints
These endpoints provide basic API functionality and health checks.

- `/`: Root endpoint that likely returns basic API information or documentation.

- `/health`: Health check endpoint to verify that the API is operational.

## Parameter Patterns
Most endpoints follow a consistent parameter pattern, accepting filters for:
- Year (temporal filter)
- Province (geographical filter)
- District (geographical filter)
- Tehsil (geographical filter)
- Area classification (categorical filter)

These parameters are typically optional and can be provided as arrays to filter for multiple values simultaneously, offering flexible query capabilities.
