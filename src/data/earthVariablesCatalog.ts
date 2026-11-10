export interface EarthVariableDetail {
  id: string;
  category: EarthCategory;
  name: string;
  shortName: string;
  units: string;
  sensor: string;
  satelliteMission: string;
  resolution: string;
  temporalCoverage: string;
  updateFrequency: string;
  daacOrProvider: string;
  description: string;
  significanceRule: string;
  methodology: string;
  uncertaintyNotes: string;
  recommendedUse: string;
  nasaDataUrl: string;
}

export type EarthCategory =
  | 'Atmosphere'
  | 'Temperature'
  | 'Water & Hydrology'
  | 'Precipitation'
  | 'Vegetation & Biosphere'
  | 'Land Surface'
  | 'Ocean System'
  | 'Cryosphere'
  | 'Atmospheric Composition';

export const EARTH_CATEGORIES: { id: EarthCategory; description: string; icon: string }[] = [
  {
    id: 'Temperature',
    description: 'Surface skin temperature, 2-meter air temperature, and thermodynamic energy anomalies across terrestrial and marine boundaries.',
    icon: 'Thermometer',
  },
  {
    id: 'Precipitation',
    description: 'High-resolution multi-satellite rainfall rates, storm accumulation totals, and monsoon variability.',
    icon: 'CloudRain',
  },
  {
    id: 'Water & Hydrology',
    description: 'Terrestrial water storage anomalies, groundwater depletion tracking, root-zone moisture, and river runoff.',
    icon: 'Droplets',
  },
  {
    id: 'Vegetation & Biosphere',
    description: 'Photosynthetic canopy vitality, greening/browning trajectories, Enhanced Vegetation Index, and carbon flux proxies.',
    icon: 'Sprout',
  },
  {
    id: 'Land Surface',
    description: 'Surface albedo, soil thermal emissivity, evapotranspiration flux, and land-use land-cover transitions.',
    icon: 'Mountain',
  },
  {
    id: 'Ocean System',
    description: 'Sea surface temperatures (SST), marine heatwave duration, ocean color chlorophyll-a, and sea height anomalies.',
    icon: 'Waves',
  },
  {
    id: 'Cryosphere',
    description: 'Glacial mass balance, polar ice-sheet volume loss, perennial snowpack extent, and sea-ice concentration.',
    icon: 'Snowflake',
  },
  {
    id: 'Atmospheric Composition',
    description: 'Columnar aerosols (AOD), carbon monoxide (CO), sulfur dioxide, nitrogen dioxide (NO2), and methane (CH4) dispersion.',
    icon: 'Wind',
  },
  {
    id: 'Atmosphere',
    description: 'Top-of-atmosphere radiative balance, solar irradiance (GHI/DNI), cloud optical thickness, and planetary boundary height.',
    icon: 'Sun',
  },
];

export const EARTH_VARIABLES_CATALOG: EarthVariableDetail[] = [
  // 1. Temperature
  {
    id: 'lst_modis',
    category: 'Temperature',
    name: 'Land Surface Temperature (Daytime & Nighttime)',
    shortName: 'LST',
    units: '°C',
    sensor: 'MODIS (Moderate Resolution Imaging Spectroradiometer)',
    satelliteMission: 'Terra (EOS AM-1) & Aqua (EOS PM-1)',
    resolution: '0.05° spatial resolution (~5.6 km grid)',
    temporalCoverage: 'March 2000 – Present (26-year continuous record)',
    updateFrequency: 'Monthly composite product (MOD11C3 / MYD11C3)',
    daacOrProvider: 'NASA LP DAAC (Land Processes Distributed Active Archive Center)',
    description: 'Thermal radiative skin temperature emitted by the Earth surface, capturing genuine localized thermodynamic heating and urban heat island dynamics.',
    significanceRule: 'Significant trend defined at α = 0.05 via non-parametric Mann-Kendall test with Theil-Sen median slope estimator.',
    methodology: 'Split-window generalized radiometric algorithm across MODIS bands 31 (11.0 µm) and 32 (12.0 µm) corrected for view angle and atmospheric absorption.',
    uncertaintyNotes: 'Persistent cloud cover during monsoon seasons can reduce observation density. GlobTraceX applies data completeness thresholds (≥70% coverage required).',
    recommendedUse: 'Long-term regional warming diagnostics, heat-health vulnerability mapping, and agricultural thermal stress evaluation.',
    nasaDataUrl: 'https://lpdaac.usgs.gov/products/mod11c3v061/',
  },
  {
    id: 't2m_power',
    category: 'Temperature',
    name: '2-Meter Surface Air Temperature',
    shortName: 'T2M',
    units: '°C',
    sensor: 'NASA GEOS-FP & MERRA-2 Atmospheric Reanalysis',
    satelliteMission: 'NASA Earth Observing System assimilated assimilation',
    resolution: '0.5° × 0.625° latitude/longitude grid',
    temporalCoverage: 'January 1981 – Present (45-year continuous reanalysis)',
    updateFrequency: 'Daily and Monthly assimilation cycles',
    daacOrProvider: 'NASA Langley Research Center (NASA POWER Project)',
    description: 'Standard ambient air temperature measured 2 meters above ground level, calibrated against WMO weather station networks worldwide.',
    significanceRule: 'Student’s t-test with pre-whitened Cochrane-Orcutt autocorrelation correction and Theil-Sen slope estimator.',
    methodology: 'Assimilated meteorological model output blending satellite infrared sounders, microwave sounders, radiosondes, and surface stations.',
    uncertaintyNotes: 'Topographically complex regions (e.g., Himalayas, Andes) may have localized microclimate deviations from the reanalysis grid cell mean.',
    recommendedUse: 'Human thermal comfort indices, heating/cooling degree days, and energy consumption projections.',
    nasaDataUrl: 'https://power.larc.nasa.gov/',
  },

  // 2. Precipitation
  {
    id: 'precipitation_gpm',
    category: 'Precipitation',
    name: 'Global Precipitation Measurement Integrated Multi-satellitE Retrievals (IMERG)',
    shortName: 'Precipitation',
    units: 'mm/month',
    sensor: 'DPR (Dual-frequency Precipitation Radar) & GMI (GPM Microwave Imager)',
    satelliteMission: 'GPM Core Observatory + Partner Constellation',
    resolution: '0.1° × 0.1° (~10 km at equator)',
    temporalCoverage: 'June 2000 – Present (Unified TRMM + GPM archive)',
    updateFrequency: 'Final Run Monthly (V07B calibrated)',
    daacOrProvider: 'NASA GES DISC (Goddard Earth Sciences Data and Information Services Center)',
    description: 'Calibrated precipitation estimates combining passive microwave observations from international satellite constellation with infrared geosynchronous imagery and GPCC rain gauges.',
    significanceRule: 'Mann-Kendall monotonic trend test with sen slope expressed in percent change per decade relative to 2000-2020 climatology.',
    methodology: 'Kalman filter Lagrangian motion vector propagation merging passive microwave brightness temperatures and precipitation radar profiles.',
    uncertaintyNotes: 'Light orographic drizzle and solid precipitation (snowfall over frozen surfaces) have higher uncertainty than convective rainfall.',
    recommendedUse: 'Monsoon shift analysis, drought detection, flood hazard characterization, and agricultural water availability planning.',
    nasaDataUrl: 'https://gpm.nasa.gov/data/imerg',
  },

  // 3. Water & Hydrology
  {
    id: 'tws_grace',
    category: 'Water & Hydrology',
    name: 'Terrestrial Water Storage Anomaly (TWS)',
    shortName: 'TWS Anomaly',
    units: 'cm Equivalent Water Thickness (EWT)',
    sensor: 'K-Band Ranging System (KBR) & Laser Ranging Interferometer (LRI)',
    satelliteMission: 'GRACE (2002–2017) and GRACE Follow-On (2018–Present)',
    resolution: '300 km spatial Gaussian smoothing / 0.5° gridded mascon solution',
    temporalCoverage: 'April 2002 – Present (with 11-month inter-mission gap)',
    updateFrequency: 'Monthly spherical harmonic and RL06 mascon solutions',
    daacOrProvider: 'NASA PO.DAAC / Jet Propulsion Laboratory (JPL)',
    description: 'Measures minute variations in Earth’s gravity field to quantify the total column of water stored on and below land, including groundwater aquifers, soil moisture, and surface lakes.',
    significanceRule: 'Non-parametric Theil-Sen slope fit with 11-month gap bridging between GRACE and GRACE-FO using harmonic seasonal decomposition.',
    methodology: 'Satellite-to-satellite microwave and laser tracking of micron-level distance shifts caused by gravitational anomalies of mass movement.',
    uncertaintyNotes: 'GRACE cannot distinguish between deep fossil aquifer loss and surface lake shrinkage without external auxiliary modeling.',
    recommendedUse: 'Regional groundwater overdraft surveillance, transboundary river basin depletion, and multi-year mega-drought monitoring.',
    nasaDataUrl: 'https://podaac.jpl.nasa.gov/GRACE',
  },

  // 4. Vegetation & Biosphere
  {
    id: 'ndvi_modis',
    category: 'Vegetation & Biosphere',
    name: 'Normalized Difference Vegetation Index (NDVI)',
    shortName: 'NDVI',
    units: 'Unitless Index (-0.2 to +1.0)',
    sensor: 'MODIS (Bands 1 Red: 620-670 nm; Band 2 NIR: 841-876 nm)',
    satelliteMission: 'Terra & Aqua Satellites',
    resolution: '0.05° Climate Modeling Grid (~5.6 km)',
    temporalCoverage: 'February 2000 – Present',
    updateFrequency: 'Monthly synthesis product (MOD13C2)',
    daacOrProvider: 'NASA LP DAAC',
    description: 'Ratio calculation (NIR - Red) / (NIR + Red) tracking chlorophyll absorption and leaf mesophyll scattering to monitor photosynthetic density and canopy greenness.',
    significanceRule: 'Pre-whitened Mann-Kendall test to eliminate seasonal phenological autocorrelation.',
    methodology: 'Atmospherically corrected surface reflectance composited over 16-day and monthly cycles using maximum value compositing (MVC) to reject clouds.',
    uncertaintyNotes: 'NDVI saturates over dense tropical rainforests (leaf area index > 3). GlobTraceX cross-references EVI (Enhanced Vegetation Index) for equatorial biomes.',
    recommendedUse: 'Continental greening/browning trends, desertification frontiers, deforestation surveillance, and crop yield forecasting.',
    nasaDataUrl: 'https://lpdaac.usgs.gov/products/mod13c2v061/',
  },

  // 5. Land Surface
  {
    id: 'albedo_modis',
    category: 'Land Surface',
    name: 'Surface Broadband Albedo (Black-Sky & White-Sky)',
    shortName: 'Albedo',
    units: 'Fraction (0.0 to 1.0)',
    sensor: 'MODIS BRDF/Albedo suite',
    satelliteMission: 'Terra & Aqua Satellites',
    resolution: '0.05° spatial grid',
    temporalCoverage: '2000 – Present',
    updateFrequency: 'Daily rolling 16-day composite (MCD43C3)',
    daacOrProvider: 'NASA LP DAAC',
    description: 'Fraction of incoming solar shortwave radiation reflected by the planetary surface back into space, governing local surface radiative equilibrium.',
    significanceRule: 'Theil-Sen slope per decade with cloud-masked QA verification flags.',
    methodology: 'Multi-angle RossThick-LiSparseReciprocal semi-empirical Bidirectional Reflectance Distribution Function (BRDF) inversion.',
    uncertaintyNotes: 'Ephemeral snowfall creates sharp high-albedo spikes; seasonal detrending is essential.',
    recommendedUse: 'Urban albedo tracking, glacial retreat feedback modeling, and land cover transformation assessment.',
    nasaDataUrl: 'https://lpdaac.usgs.gov/products/mcd43c3v061/',
  },

  // 6. Ocean System
  {
    id: 'sst_mur',
    category: 'Ocean System',
    name: 'Multi-scale Ultra-high Resolution (MUR) Sea Surface Temperature',
    shortName: 'MUR SST',
    units: '°C',
    sensor: 'AMSR-E, AMSR-2, MODIS, AVHRR, WindSat, and In-Situ Drifters',
    satelliteMission: 'Multi-satellite constellation blended synthesis',
    resolution: '0.01° grid (~1 km high-fidelity coastal resolution)',
    temporalCoverage: 'June 2002 – Present',
    updateFrequency: 'Daily ultra-high resolution global foundation SST',
    daacOrProvider: 'NASA PO.DAAC (Physical Oceanography Distributed Active Archive Center)',
    description: 'High-resolution foundation SST free from diurnal warming cycle, capturing fine-scale ocean eddies, upwelling zones, coastal currents, and marine heatwave anomalies.',
    significanceRule: 'Linear regression with 95% Wald confidence intervals and Hobart Marine Heatwave category scoring.',
    methodology: 'Multi-scale multi-resolution variational optimum interpolation (OI) blending microwave (cloud-penetrating) and infrared (high-resolution) radiances.',
    uncertaintyNotes: 'Near-shore coastal pixels with tidal mudflats can experience partial land-contamination.',
    recommendedUse: 'Coral bleaching risk forecasting, marine ecosystem resilience, cyclogenesis thermal potential, and fisheries management.',
    nasaDataUrl: 'https://podaac.jpl.nasa.gov/MEaSUREs-MUR',
  },

  // 7. Cryosphere
  {
    id: 'sea_ice_extent',
    category: 'Cryosphere',
    name: 'Polar Sea Ice Index & Ice Sheet Mass Balance',
    shortName: 'Sea Ice Extent',
    units: 'Million km²',
    sensor: 'SSM/I, SSMIS, AMSR2, ICESat-2 (ATLAS LiDAR)',
    satelliteMission: 'DMSP, GCOM-W1, ICESat-2',
    resolution: '25 km polar stereographic grid',
    temporalCoverage: 'November 1978 – Present (47-year benchmark record)',
    updateFrequency: 'Daily and Monthly Antarctic and Arctic composites',
    daacOrProvider: 'NSIDC DAAC (National Snow and Ice Data Center)',
    description: 'Calculates ocean area with at least 15% sea ice concentration to quantify Arctic September minimums and Antarctic winter maximum trajectories.',
    significanceRule: 'Theil-Sen robust slope estimator with decadal percentage loss calculated relative to 1981-2010 reference baseline.',
    methodology: 'NASA Team and Bootstrap passive microwave radiative transfer brightness temperature polarization algorithms.',
    uncertaintyNotes: 'Melt ponds forming on summer ice surface can radiometrically mimic open water to microwave radiometers.',
    recommendedUse: 'Planetary albedo feedback quantification, polar navigation route forecasting, and sea level rise modeling.',
    nasaDataUrl: 'https://nsidc.org/data/seaice_index',
  },

  // 8. Atmospheric Composition
  {
    id: 'aod_modis_viirs',
    category: 'Atmospheric Composition',
    name: 'Aerosol Optical Depth at 550nm (AOD)',
    shortName: 'Aerosol Optical Depth',
    units: 'Unitless (0.0 to 3.0)',
    sensor: 'MODIS Dark Target & Deep Blue, VIIRS',
    satelliteMission: 'Terra, Aqua, Suomi-NPP',
    resolution: '1° × 1° spatial resolution',
    temporalCoverage: 'March 2000 – Present',
    updateFrequency: 'Monthly global composite (MOD08_M3)',
    daacOrProvider: 'NASA GES DISC / LAADS DAAC',
    description: 'Columnar measure of atmospheric extinction of light caused by airborne particulates, including industrial sulfate pollution, wildfire smoke plumes, volcanic ash, and desert dust.',
    significanceRule: 'Non-parametric Seasonal Kendall test accommodating severe seasonal dust and agricultural burning cycles.',
    methodology: 'Dark Target algorithm over dark vegetated surfaces and Deep Blue algorithm over bright arid deserts.',
    uncertaintyNotes: 'High cloud fractions prevent aerosol optical depth retrieval in persistently overcast monsoon zones.',
    recommendedUse: 'Public health air quality burden evaluation, transboundary smoke tracking, and solar irradiance attenuation analysis.',
    nasaDataUrl: 'https://earthdata.nasa.gov/learn/find-data/near-real-time/modis',
  },

  // 9. Atmosphere & Radiation
  {
    id: 'solar_allsky_power',
    category: 'Atmosphere',
    name: 'All-Sky Surface Solar Irradiance (Global Horizontal Irradiance)',
    shortName: 'All-Sky Solar (GHI)',
    units: 'MJ/m²/day (or kWh/m²/day)',
    sensor: 'CERES (Clouds and the Earth\'s Radiant Energy System) & NASA POWER assimilation',
    satelliteMission: 'Terra, Aqua, and NOAA-20',
    resolution: '0.5° × 0.5° grid',
    temporalCoverage: 'July 1983 – Present',
    updateFrequency: 'Monthly climatology and continuous daily archive',
    daacOrProvider: 'NASA Langley Research Center (LaRC)',
    description: 'Total downward solar radiant energy reaching a horizontal terrestrial surface under actual all-sky conditions (accounting for cloud reflectance and aerosol absorption).',
    significanceRule: 'Theil-Sen slope per decade assessing regional solar "dimming" or "brightening" trends.',
    methodology: 'CERES SYN1deg radiative transfer calculations combining satellite cloud properties, atmospheric profiles, and surface albedo.',
    uncertaintyNotes: 'Sub-grid convective cloudiness can create localized discrepancies with ground-based pyranometer stations.',
    recommendedUse: 'Solar photovoltaic energy yield assessment, agricultural photosynthetic potential, and surface evaporation modeling.',
    nasaDataUrl: 'https://power.larc.nasa.gov/',
  },
];

export function getVariablesByCategory(category: EarthCategory): EarthVariableDetail[] {
  return EARTH_VARIABLES_CATALOG.filter((v) => v.category === category);
}

export function getVariableById(id: string): EarthVariableDetail | undefined {
  return EARTH_VARIABLES_CATALOG.find((v) => v.id === id);
}
