/**
 * @file indicatorRegistry.ts
 * @description Unified NASA Earth System Indicator Registry for GlobTraceX.
 * Contains definitive metadata, sensors, baseline periods, classification thresholds,
 * impact pathways, and adaptive recommendation profiles for all indicators.
 */

export type IndicatorId =
  | 'lst'
  | 'rainfall'
  | 'ndvi'
  | 'tws'
  | 'solar'
  | 'sst'
  | 'chlorophyll'
  | 'ssh_anomaly'
  | 'hot_humid';

export type SituationClassification =
  | 'improving'
  | 'relatively_stable'
  | 'worsening'
  | 'mixed_signals'
  | 'unusual_change'
  | 'insufficient_evidence';

export interface IndicatorMetadata {
  id: IndicatorId;
  name: string;
  shortName: string;
  category: 'Land Surface' | 'Atmosphere / Hydrology' | 'Biosphere' | 'Ocean System' | 'Human Bioclimatology';
  units: string;
  symbol: string;
  sensor: string;
  mission: string;
  productId: string;
  doi: string;
  provider: string;
  baselinePeriod: string;
  formula: string;
  minObservationsForTrend: number;
  minCoveragePct: number;
  
  // Deterministic Thresholds (per decade for slope, or absolute anomaly)
  thresholds: {
    stableThreshold: number; // |slope| < stableThreshold => stable
    moderateThreshold: number;
    severeThreshold: number;
    // Directionality: does higher value mean worsening or improving?
    // 'higher_is_worsening': e.g., LST, SST, Hot Humid
    // 'higher_is_improving': e.g., NDVI, TWS (usually positive storage recovery is improving)
    // 'bidirectional_stress': e.g., rainfall (too high = flooding/storms, too low = drought)
    desirability: 'higher_is_worsening' | 'higher_is_improving' | 'bidirectional_stress';
  };

  // Environmental Impact Pathway
  impactPathway: {
    biophysicalMechanism: string;
    environmentalImpact: string;
    humanVulnerability: string;
  };

  // Structured Adaptive Recommendations
  recommendations: {
    immediate: string[]; // 0–6 months
    mediumTerm: string[]; // 6–24 months
    longTerm: string[]; // 2–5+ years
    whatToMonitor: string[]; // leading indicators & triggers
    whatToAvoid: string[]; // maladaptations & premature actions
    stakeholders: Array<{
      role: string;
      title: string;
      actionFocus: string;
    }>;
  };
}

export const INDICATOR_REGISTRY: Record<IndicatorId, IndicatorMetadata> = {
  lst: {
    id: 'lst',
    name: 'Daytime Land Surface Temperature',
    shortName: 'Land Surface Temp',
    category: 'Land Surface',
    units: '°C',
    symbol: 'LST',
    sensor: 'MODIS (Moderate Resolution Imaging Spectroradiometer)',
    mission: 'Terra / Aqua (EOS AM-1 / PM-1)',
    productId: 'MOD11C3.061',
    doi: '10.5067/MODIS/MOD11C3.061',
    provider: 'NASA LP DAAC',
    baselinePeriod: '2001–2020 Monthly Climatology',
    formula: 'T_skin = a_0 + a_1*T_31 + a_2*(T_31 - T_32) + (a_3 + a_4*W)*(1 - ε)/ε - (a_5 + a_6*W)*Δε/ε²',
    minObservationsForTrend: 60,
    minCoveragePct: 75,
    thresholds: {
      stableThreshold: 0.12, // ±0.12°C/decade
      moderateThreshold: 0.25,
      severeThreshold: 0.45,
      desirability: 'higher_is_worsening',
    },
    impactPathway: {
      biophysicalMechanism: 'Radiative skin surface warming elevates sensible heat flux and deep soil moisture desiccation.',
      environmentalImpact: 'Accelerates urban heat island microclimates, intensifies agricultural evapotranspiration deficits, and stresses canopy foliage.',
      humanVulnerability: 'Sharp spikes in wet-bulb heat stress for outdoor laborers, heightened cooling energy peak demand, and urban mortality risk.',
    },
    recommendations: {
      immediate: [
        'Establish automated extreme-heat early warnings linked to municipal emergency cooling networks.',
        'Adjust municipal outdoor labor regulations to mandate shaded recovery intervals during peak diurnal solar hours (11:00–15:00).',
        'Deploy mobile thermal hydration and first-response electrolyte stations in dense urban districts.',
      ],
      mediumTerm: [
        'Incentivize retrofitting of reflective cool-roof materials (albedo > 0.65) and porous permeable pavements.',
        'Expand urban tree canopies and green corridor networks in thermally vulnerable sub-districts.',
        'Upgrade electrical substation transformers to withstand sustained nocturnal cooling load spikes.',
      ],
      longTerm: [
        'Enforce bioclimatic building design standards and shaded pedestrian transit architecture.',
        'Transition agricultural zones adjacent to urban perimeters to heat-resilient cropping regimes.',
        'Develop long-term district cooling infrastructure powered by decentralized microgrids.',
      ],
      whatToMonitor: [
        'Nighttime minimum skin temperature anomalies (MODIS MOD11C3 Night).',
        'Consecutive days with canopy temperature exceeding local 95th percentile baseline.',
        'Soil moisture deficit indices (SMAP Level-3).',
      ],
      whatToAvoid: [
        'Do not expand unshaded asphalt parking aprons or clear-cut peri-urban protective woodlots.',
        'Avoid relying solely on residential air conditioning without grid transformer redundancy.',
        'Do not delay heat action activation until hospital admissions spike.',
      ],
      stakeholders: [
        { role: 'Municipal Health Authorities', title: 'Public Health & Heat Response', actionFocus: 'Deploy cooling shelters and activate wet-bulb advisories' },
        { role: 'Urban Planning Agencies', title: 'Zoning & Built Environment', actionFocus: 'Mandate high-albedo cool roofs and shaded vegetative buffers' },
        { role: 'Power Grid Operators', title: 'Electrical Utilities', actionFocus: 'Manage peak HVAC load distribution and transformer thermal limits' },
      ],
    },
  },

  rainfall: {
    id: 'rainfall',
    name: 'Accumulated Monthly Precipitation',
    shortName: 'Precipitation',
    category: 'Atmosphere / Hydrology',
    units: 'mm/month',
    symbol: 'P',
    sensor: 'Dual-frequency Precipitation Radar (DPR) & GMI',
    mission: 'Global Precipitation Measurement (GPM)',
    productId: 'GPM_3IMERGM.07',
    doi: '10.5067/GPM/IMERG/3B-MONTH/07',
    provider: 'NASA GES DISC',
    baselinePeriod: '2001–2020 Multi-Satellite Monthly Climatology',
    formula: 'P_accum = ∑_{t=1}^{N_days} [Kalman_filter(MW_passive, IR_geostationary, Gauge_calibrated)]',
    minObservationsForTrend: 60,
    minCoveragePct: 80,
    thresholds: {
      stableThreshold: 4.0, // ±4.0% per decade
      moderateThreshold: 9.0,
      severeThreshold: 18.0,
      desirability: 'bidirectional_stress',
    },
    impactPathway: {
      biophysicalMechanism: 'Altered tropospheric moisture flux convergence reorganizes convective rainfall intensity and dry-spell duration.',
      environmentalImpact: 'High-precipitation anomalies trigger riverine flash flooding and landslide runoff; deficits prompt severe agronomic drought.',
      humanVulnerability: 'Threatens rainfed staple grain harvests, breaches drainage embankments, and contaminates municipal raw water sources.',
    },
    recommendations: {
      immediate: [
        'Conduct hydrological culvert clearing and dredging along critical river choke points prior to monsoon onset.',
        'Issue targeted seasonal advisory bulletins for planting windows based on precipitation percentile forecasts.',
        'Pre-position modular water purification mobile trailers and flood barrier bladders in low-lying catchments.',
      ],
      mediumTerm: [
        'Construct decentralized rainwater harvesting reservoirs and managed aquifer recharge (MAR) injection wells.',
        'Fortify riparian riverbanks with bioengineered vegetative revetments and rip-rap stone armoring.',
        'Implement crop-yield parametric index insurance for smallholder farming collectives.',
      ],
      longTerm: [
        'Redesign urban storm drainage systems to withstand 50-year return period intensity-duration-frequency (IDF) curves.',
        'Restore natural watershed floodplains and wetland sponge ecosystems to absorb peak storm surges.',
        'Modernize nationwide meteorological radar networks to couple with satellite microwave constellation tracking.',
      ],
      whatToMonitor: [
        'Consecutive dry days (CDD) and extreme 99th-percentile 24-hour storm rainfall volumes.',
        'Upstream river gauge discharge hydrographs and reservoir spillway capacity margins.',
        'Standardized Precipitation Index (SPI-3 and SPI-6).',
      ],
      whatToAvoid: [
        'Avoid permitting residential subdivision developments inside designated natural 100-year flood basins.',
        'Do not rely exclusively on hard concrete seawalls while neglecting upland catchment forest retention.',
        'Avoid promoting water-intensive cash crops in basins showing sustained negative precipitation trends.',
      ],
      stakeholders: [
        { role: 'Hydrological Services & Water Boards', title: 'Water Resource Management', actionFocus: 'Regulate reservoir releases and flood retention basins' },
        { role: 'Agricultural Extension Offices', title: 'Crop Advisory', actionFocus: 'Calibrate planting calendars and drought-tolerant seed distribution' },
        { role: 'Disaster Emergency Units', title: 'Emergency Preparedness', actionFocus: 'Maintain community early warning siren networks and evacuation routes' },
      ],
    },
  },

  ndvi: {
    id: 'ndvi',
    name: 'Normalized Difference Vegetation Index',
    shortName: 'Vegetation Health',
    category: 'Biosphere',
    units: 'NDVI',
    symbol: 'NDVI',
    sensor: 'MODIS Land Surface Reflectance',
    mission: 'Terra / Aqua (EOS)',
    productId: 'MOD13C2.061',
    doi: '10.5067/MODIS/MOD13C2.061',
    provider: 'NASA LP DAAC',
    baselinePeriod: '2001–2020 Bi-monthly Climatology',
    formula: 'NDVI = (NIR_band2 - Red_band1) / (NIR_band2 + Red_band1)',
    minObservationsForTrend: 60,
    minCoveragePct: 75,
    thresholds: {
      stableThreshold: 0.012, // ±0.012 index units per decade
      moderateThreshold: 0.025,
      severeThreshold: 0.05,
      desirability: 'higher_is_improving',
    },
    impactPathway: {
      biophysicalMechanism: 'Photosynthetically active radiation (PAR) absorption fluctuates based on chlorophyll density and leaf area index (LAI).',
      environmentalImpact: 'Canopy degradation induces topsoil erosion, microclimatic drying, and loss of wildlife habitat connectivity.',
      humanVulnerability: 'Reduces staple crop biomass yields, impairs timber/agroforestry revenues, and exacerbates rural dust and air quality degradation.',
    },
    recommendations: {
      immediate: [
        'Deploy drone multispectral ground truthing to distinguish pest/pathogen outbreaks from moisture stress in declining sectors.',
        'Distribute micro-drip irrigation subsidies and organic mulch cover supplies to affected agrarian farming cooperatives.',
        'Impose temporary grazing moratoriums on stressed natural pasture lands showing rapid browning anomalies.',
      ],
      mediumTerm: [
        'Expand indigenous agroforestry systems integrating nitrogen-fixing deep-rooted perennial shrubs.',
        'Establish community seed banks prioritizing indigenous heat- and drought-resistant staple cultivars.',
        'Rehabilitate degraded hillslope forests to prevent catastrophic monsoon landslide washouts.',
      ],
      longTerm: [
        'Institute legal protections for critical biodiversity wildlife corridors and wetland mangrove buffer reserves.',
        'Transition regional agricultural masterplans toward regenerative zero-till soil conservation practices.',
        'Integrate satellite-derived greenness metrics into provincial land tax assessment and conservation credit programs.',
      ],
      whatToMonitor: [
        'Vegetation Condition Index (VCI) anomalies during critical vegetative booting and flowering phenological phases.',
        'Ratio of degraded pixel cluster extent versus regenerating canopy.',
        'Forest fire hotspot alerts (MODIS/VIIRS Active Fire FIRMS).',
      ],
      whatToAvoid: [
        'Do not permit clear-felling or strip cultivation on steep hillside terrain prone to monsoon erosion.',
        'Avoid single-species monoculture reforestation projects susceptible to pest blights.',
        'Do not delay intervention until irreversible root-zone topsoil desertification occurs.',
      ],
      stakeholders: [
        { role: 'Department of Forestry & Wildlife', title: 'Forest Conservation', actionFocus: 'Enforce watershed logging bans and coordinate reforestation' },
        { role: 'Ministry of Agriculture', title: 'Agronomic Research', actionFocus: 'Deploy drought-tolerant crop seeds and soil moisture sensors' },
        { role: 'Farmer Cooperatives', title: 'Local Cultivators', actionFocus: 'Adopt cover cropping, mulch conservation, and micro-drip networks' },
      ],
    },
  },

  tws: {
    id: 'tws',
    name: 'Terrestrial Water Storage Anomaly',
    shortName: 'Water Storage Anomaly',
    category: 'Atmosphere / Hydrology',
    units: 'cm EWT',
    symbol: 'TWS',
    sensor: 'K-Band Ranging & Laser Ranging Interferometer (LRI)',
    mission: 'GRACE / GRACE Follow-On',
    productId: 'TELLUS_GRAC_L3_CSR_RL06_v04',
    doi: '10.5067/TELND-NC004',
    provider: 'NASA PO.DAAC / JPL',
    baselinePeriod: '2004–2009 Gravimetric Mean Reference',
    formula: 'ΔEWT(θ, φ) = (a*ρ_earth / 3*ρ_water) * ∑_{l,m} [(2l+1)/(1+k_l)] * ΔC_lm * Y_lm(θ, φ)',
    minObservationsForTrend: 48,
    minCoveragePct: 70,
    thresholds: {
      stableThreshold: 0.6, // ±0.6 cm EWT / decade
      moderateThreshold: 1.5,
      severeThreshold: 3.0,
      desirability: 'higher_is_improving',
    },
    impactPathway: {
      biophysicalMechanism: 'Total integrated column mass variations capture the sum of groundwater, soil moisture, surface lakes, and canopy water.',
      environmentalImpact: 'Persistent depletion signifies unsustainable aquifer mining, river baseflow collapse, and land subsidence risk.',
      humanVulnerability: 'Threatens potable urban municipal borefields, sparks agricultural water rationing, and degrades irrigation food security.',
    },
    recommendations: {
      immediate: [
        'Mandate volumetric digital metering and extraction caps on deep commercial and industrial groundwater wells.',
        'Issue regional water conservation orders restricting non-essential urban municipal water applications.',
        'Map critical drinking water aquifer zones experiencing severe hydraulic head depression.',
      ],
      mediumTerm: [
        'Construct managed aquifer recharge (MAR) spreading basins and percolation ponds capturing wet-season flood overflow.',
        'Transition agricultural irrigation from flood/furrow pumping to pressurized precision micro-drip delivery.',
        'Install continuous piezometric pressure transducers in representative monitoring boreholes for ground truthing.',
      ],
      longTerm: [
        'Enact comprehensive groundwater licensing and depletion fee frameworks under national water security legislation.',
        'Interconnect regional river surface reservoirs with urban water distribution to reduce deep aquifer dependency.',
        'Implement satellite gravimetry-backed water budgeting across transboundary river basins.',
      ],
      whatToMonitor: [
        'Rate of seasonal groundwater table drawdown in sentinel monitoring wells.',
        'Inter-annual storage deficit recovery during peak wet/monsoon seasons.',
        'Interferometric Synthetic Aperture Radar (InSAR) surface ground subsidence deformation rates.',
      ],
      whatToAvoid: [
        'Do not subsidize unmetered agricultural electricity for unlimited deep tube-well pumping.',
        'Avoid paving over primary permeable recharge floodplains in expanding urban zones.',
        'Do not assume seasonal monsoon rains have restored deep aquifers without gravimetric confirmation.',
      ],
      stakeholders: [
        { role: 'National Groundwater Authority', title: 'Aquifer Management', actionFocus: 'Regulate industrial borehole extraction licenses and enforce depletion caps' },
        { role: 'Municipal Water Supply Utilities', title: 'Urban Water Distribution', actionFocus: 'Repair pipeline leakage and reduce non-revenue water loss' },
        { role: 'Irrigation Engineering Department', title: 'Agricultural Water Infrastructure', actionFocus: 'Modernize canal lining and install pressurized drip systems' },
      ],
    },
  },

  solar: {
    id: 'solar',
    name: 'All-Sky Solar Irradiance (GHI)',
    shortName: 'Solar Irradiance',
    category: 'Atmosphere / Hydrology',
    units: 'MJ/m²',
    symbol: 'GHI',
    sensor: 'CERES / GEOS Satellite Data Assimilation',
    mission: 'NASA POWER / Terra / Aqua',
    productId: 'POWER_Global_Solar_v2.0',
    doi: '10.5067/POWER/GHI_MONTHLY_V2',
    provider: 'NASA Langley Research Center (LaRC)',
    baselinePeriod: '2001–2020 Multi-Year Monthly Mean',
    formula: 'GHI = DNI * cos(θ_z) + DHI (Direct Normal + Diffuse Horizontal Irradiance)',
    minObservationsForTrend: 60,
    minCoveragePct: 80,
    thresholds: {
      stableThreshold: 0.3, // ±0.3 MJ/m²/decade
      moderateThreshold: 0.7,
      severeThreshold: 1.4,
      desirability: 'higher_is_improving',
    },
    impactPathway: {
      biophysicalMechanism: 'Atmospheric aerosol loading, cloud fraction, and water vapor modulate surface broadband solar flux.',
      environmentalImpact: 'Alters surface radiative energy budgets, soil thermal dynamics, and photosynthetic light-use efficiency.',
      humanVulnerability: 'Governs utility-scale photovoltaic electrical generation yield and diurnal evaporative irrigation requirements.',
    },
    recommendations: {
      immediate: [
        'Recalibrate regional utility-scale photovoltaic generation forecasts using observed satellite atmospheric transmittivity trends.',
        'Install soiling and aerosol particulate monitoring sensors at major solar utility installations.',
        'Advise agricultural operators on adjusted crop evapotranspiration coefficients based on altered insolation.',
      ],
      mediumTerm: [
        'Incorporate satellite solar irradiance variability into long-term national renewable energy grid expansion plans.',
        'Deploy automated panel cleaning robotic systems in high-aerosol particulate accumulation corridors.',
        'Optimize tilt angles and bifacial solar panel tracking geometry to capture shifting diffuse light fractions.',
      ],
      longTerm: [
        'Integrate hybrid solar-wind-storage transmission microgrids to compensate for regional cloud cover shifts.',
        'Co-locate agrovoltaic farming beneath elevated photovoltaic arrays to reduce crop heat stress while generating power.',
        'Enforce industrial atmospheric particulate emission reductions to restore clean-sky solar transmission.',
      ],
      whatToMonitor: [
        'Diffuse horizontal irradiance (DHI) to global horizontal irradiance (GHI) ratio.',
        'Aerosol Optical Depth (AOD at 550nm from MODIS MOD04_L2).',
        'Capacity utilization factor (CUF) variances at sentinel solar power stations.',
      ],
      whatToAvoid: [
        'Do not design 25-year solar farm financing models using outdated static historical irradiance tables.',
        'Avoid siting large solar farms downwind of unscrubbed coal power plants or dusty unpaved quarries.',
        'Do not ignore diurnal aerosol peaks when planning scheduled peak power export agreements.',
      ],
      stakeholders: [
        { role: 'Renewable Energy Development Authority', title: 'Clean Energy Policy', actionFocus: 'Calibrate grid feed-in tariffs and solar park zoning' },
        { role: 'Solar Farm Asset Operators', title: 'Power Generation', actionFocus: 'Schedule bifacial tracking optimization and robotic washing cycles' },
        { role: 'National Power Grid Dispatch Center', title: 'Grid Balancing', actionFocus: 'Manage spinning reserve reserves against solar ramp rate variations' },
      ],
    },
  },

  sst: {
    id: 'sst',
    name: 'Sea Surface Temperature',
    shortName: 'Sea Surface Temp',
    category: 'Ocean System',
    units: '°C',
    symbol: 'SST',
    sensor: 'MODIS / VIIRS / AMSR2 Infrared & Microwave Radiometers',
    mission: 'Earth Observing System / PO.DAAC',
    productId: 'GHRSST-MUR-L4-GLOB-v4.1',
    doi: '10.5067/GHGMR-4FJ04',
    provider: 'NASA PO.DAAC',
    baselinePeriod: '2001–2020 High-Resolution Climatology',
    formula: 'SST_skin = c_0 + c_1*T_11 + c_2*(T_11 - T_12)*T_ref + c_3*(sec(θ) - 1)',
    minObservationsForTrend: 60,
    minCoveragePct: 80,
    thresholds: {
      stableThreshold: 0.10, // ±0.10°C/decade
      moderateThreshold: 0.22,
      severeThreshold: 0.40,
      desirability: 'higher_is_worsening',
    },
    impactPathway: {
      biophysicalMechanism: 'Accumulation of ocean heat content intensifies surface stratification and weakens nutrient upwelling.',
      environmentalImpact: 'Drives severe coral bleaching, accelerates marine heatwaves, and alters pelagic fish spawning and migration ranges.',
      humanVulnerability: 'Suppresses coastal fishery catches, jeopardizes mariculture livelihoods, and energizes intensifying tropical cyclones.',
    },
    recommendations: {
      immediate: [
        'Activate marine heatwave surveillance alert protocols for coastal aquaculture and coral reef marine protected areas.',
        'Enforce seasonal fishing moratoria on heat-stressed pelagic breeding grounds during maximum summer temperature peaks.',
        'Deploy in-situ CTD temperature logger arrays on representative coral reefs and mariculture cage facilities.',
      ],
      mediumTerm: [
        'Establish coral reef nursery rehabilitation projects propagating thermally tolerant stony coral genotypes.',
        'Transition coastal fishing communities toward diversified seaweed mariculture and value-added shore processing.',
        'Upgrade coastal storm surge early warning systems as ocean thermal expansion and cyclone intensity escalate.',
      ],
      longTerm: [
        'Design climate-smart Marine Protected Area (MPA) networks that protect deep-water thermal refugia and upwelling zones.',
        'Incorporate dynamic ocean management policies that adjust fisheries quotas in real time based on satellite thermal tracking.',
        'Strengthen coastal mangrove and seagrass blue-carbon ecosystems to attenuate extreme storm wave energy.',
      ],
      whatToMonitor: [
        'Degree Heating Weeks (DHW) accumulation (NOAA Coral Reef Watch / PO.DAAC MUR SST).',
        'Frequency and maximum intensity of Category 3+ Marine Heatwave events.',
        'Thermocline depth and vertical stratification index in coastal fisheries sectors.',
      ],
      whatToAvoid: [
        'Do not permit destructive bottom trawling across coral reefs already experiencing severe thermal bleaching.',
        'Avoid approving massive warm-water industrial cooling effluent discharges near fragile nursery bays.',
        'Do not maintain rigid historical fishing seasons when fish migratory corridors have shifted poleward.',
      ],
      stakeholders: [
        { role: 'Department of Fisheries', title: 'Marine Fisheries Management', actionFocus: 'Implement dynamic seasonal catch quotas and nursery closures' },
        { role: 'Coastal Zone Management Authority', title: 'Coastal Defense & MPAs', actionFocus: 'Safeguard thermal refugia and restore mangrove sea buffers' },
        { role: 'Marine Research Institutes', title: 'Oceanographic Science', actionFocus: 'Monitor thermal stratification and coral reef bleaching survivorship' },
      ],
    },
  },

  chlorophyll: {
    id: 'chlorophyll',
    name: 'Ocean Chlorophyll-a Concentration',
    shortName: 'Ocean Chlorophyll-a',
    category: 'Ocean System',
    units: 'mg/m³',
    symbol: 'Chl-a',
    sensor: 'MODIS Aqua Ocean Color / PACE OCI',
    mission: 'MODIS Aqua / NASA PACE',
    productId: 'MODIS_Aqua_L3m_CHL_9km',
    doi: '10.5067/AQUA/MODIS/L3M/CHL/2018',
    provider: 'NASA Ocean Biology DAAC (OB.DAAC)',
    baselinePeriod: '2002–2020 Ocean Color Multi-Year Climatology',
    formula: 'log10(Chl_a) = a_0 + ∑_{i=1}^{4} a_i * [log10(R_rs(λ_blue) / R_rs(λ_green))]^i (OC4 algorithm)',
    minObservationsForTrend: 60,
    minCoveragePct: 75,
    thresholds: {
      stableThreshold: 0.010, // ±0.010 mg/m³/decade
      moderateThreshold: 0.025,
      severeThreshold: 0.050,
      desirability: 'higher_is_improving',
    },
    impactPathway: {
      biophysicalMechanism: 'Surface ocean warming restricts vertical pycnocline mixing, reducing nitrate/phosphate upwelling required for phytoplankton.',
      environmentalImpact: 'Declining primary productivity collapses zooplankton and larval fish food webs; sudden coastal spikes signal toxic algal blooms (HABs).',
      humanVulnerability: 'Threatens artisanal and commercial fisheries catches; harmful blooms trigger paralytic shellfish toxins and beach closures.',
    },
    recommendations: {
      immediate: [
        'Deploy automated toxic phytoplankton bloom alert networks connecting satellite ocean color alerts with shellfish harvesting inspectors.',
        'Temporarily halt bivalve mariculture harvests in zones exhibiting sudden anomalous chlorophyll spikes indicative of dinoflagellate blooms.',
        'Coordinate emergency hypoxia monitoring in coastal estuaries experiencing organic matter die-offs.',
      ],
      mediumTerm: [
        'Reduce upstream agricultural synthetic fertilizer runoff by mandating vegetative riparian nutrient buffer strips.',
        'Establish continuous in-situ fluorometer and autonomous glider survey routes across key continental shelf upwelling centers.',
        'Implement dynamic satellite-guided sustainable fisheries yield quotas reflecting primary productivity fluctuations.',
      ],
      longTerm: [
        'Protect coastal estuarine seagrass beds and salt marsh filter zones from destructive industrial harbor dredging.',
        'Integrate NASA PACE hyperspectral ocean color diagnostics into national biological carbon pump sequestration assessments.',
        'Form international transboundary ocean basin commissions to manage shared migratory fish stocks facing productivity shifts.',
      ],
      whatToMonitor: [
        'Chlorophyll-a anomaly deviation from 20-year monthly mean baseline.',
        'Particulate Organic Carbon (POC) and Fluorescent Dissolved Organic Matter (FDOM).',
        'Sub-surface dissolved oxygen saturation levels in bottom waters.',
      ],
      whatToAvoid: [
        'Do not ignore sudden coastal green/brown discoloration events without laboratory biotoxin testing.',
        'Avoid permitting untreated municipal wastewater and aquaculture effluent discharge into stagnant coastal lagoons.',
        'Do not assume constant historical fish stock recruitment when primary productivity shows decadal decline.',
      ],
      stakeholders: [
        { role: 'Marine Biotoxin & Food Safety Agency', title: 'Public Health & Seafood Safety', actionFocus: 'Monitor paralytic shellfish toxins and enforce harvesting bans' },
        { role: 'Commercial Fishing Associations', title: 'Fleet Management', actionFocus: 'Align fishing effort with seasonal phytoplankton bloom timing' },
        { role: 'Environmental Protection Department', title: 'Water Quality Enforcement', actionFocus: 'Enforce watershed agricultural nitrogen and phosphorus caps' },
      ],
    },
  },

  ssh_anomaly: {
    id: 'ssh_anomaly',
    name: 'Sea Surface Height Anomaly (Ocean Altimetry)',
    shortName: 'Sea Level Anomaly',
    category: 'Ocean System',
    units: 'cm',
    symbol: 'SSHA',
    sensor: 'Poseidon-4 Radar Altimeter & SWOT KaRIn',
    mission: 'Sentinel-6 Michael Freilich / SWOT / Jason-3',
    productId: 'S6A_P4_2_LR_STD_OST_NTC',
    doi: '10.5067/S6AMF-LRSTD',
    provider: 'NASA PO.DAAC / CNES',
    baselinePeriod: '1993–2012 Mean Sea Surface (MSS)',
    formula: 'SSHA = Altitude - Range - Corrected_Tides - Wet_Troposphere - Dry_Troposphere - Ionosphere - MSS',
    minObservationsForTrend: 36,
    minCoveragePct: 75,
    thresholds: {
      stableThreshold: 0.8, // ±0.8 cm/decade
      moderateThreshold: 2.0,
      severeThreshold: 4.5,
      desirability: 'higher_is_worsening',
    },
    impactPathway: {
      biophysicalMechanism: 'Steric ocean thermal expansion combined with land ice sheet melt elevates coastal sea surface height.',
      environmentalImpact: 'Exacerbates high-tide sunny-day nuisance flooding, intensifies coastal erosion, and salinizes low-lying delta aquifers.',
      humanVulnerability: 'Threatens coastal urban settlements, seaports, protective sea polders, and low-elevation agricultural rice paddies.',
    },
    recommendations: {
      immediate: [
        'Inspect and reinforce tidal sluice gates, coastal embankments, and drainage one-way flap valves in vulnerable delta polders.',
        'Pre-position high-capacity mobile diesel dewatering pumps at critical urban coastal flood choke points.',
        'Update coastal building flood risk disclosures for residential and commercial real estate transactions.',
      ],
      mediumTerm: [
        'Raise height of vulnerable coastal polder dikes and armoring with mangrove foreshore wave dissipation barriers.',
        'Install backflow preventers and automated tide gates on all municipal stormwater discharge outfalls.',
        'Develop salinity-tolerant rice and aquaculture farming practices in saline-intruded coastal aquifers.',
      ],
      longTerm: [
        'Implement managed retreat and planned relocation zoning for repeatedly inundated low-elevation coastal zones.',
        'Design major harbor and seaport infrastructure with adaptive elevated quay walls and flood barrier gates.',
        'Restore natural sediment deposition dynamics by re-engineering delta river flow regimes.',
      ],
      whatToMonitor: [
        'Extreme astronomical spring high tide heights and storm surge additive inundation levels.',
        'Rate of shallow groundwater salinity intrusion (electrical conductivity) in coastal drinking water wells.',
        'Permanent shoreline retreat and beach profile erosion rates.',
      ],
      whatToAvoid: [
        'Do not permit new commercial high-density construction in un-defended 1-meter sea level rise flood zones.',
        'Avoid relying solely on hard sea dikes without addressing internal rainwater drainage backwater effects.',
        'Do not deplete coastal groundwater aquifers which accelerates catastrophic land subsidence.',
      ],
      stakeholders: [
        { role: 'Coastal Embankment & Polder Board', title: 'Flood Defense Infrastructure', actionFocus: 'Elevate sea dikes and maintain drainage sluice gates' },
        { role: 'Port & Maritime Authority', title: 'Harbor Operations', actionFocus: 'Upgrade dock quay elevations and protect navigation channels' },
        { role: 'Urban Resettlement & Housing Ministry', title: 'Long-term Spatial Planning', actionFocus: 'Implement managed coastal setback zones and resilient housing' },
      ],
    },
  },

  hot_humid: {
    id: 'hot_humid',
    name: 'Hot & Humid Heat Stress Index (Wet-Bulb Temp)',
    shortName: 'Heat Stress Index',
    category: 'Human Bioclimatology',
    units: '°C TW',
    symbol: 'TW',
    sensor: 'AIRS / MODIS Atmospheric Sounder & MERRA-2 Reanalysis',
    mission: 'Aqua / NASA GES DISC',
    productId: 'AIRS3STM_v7.0',
    doi: '10.5067/MEASURES/AIRS/AIRS3STM.007',
    provider: 'NASA GES DISC',
    baselinePeriod: '2001–2020 Multi-Decadal Baseline',
    formula: 'TW = T_air * atan[0.151977*(RH + 8.313659)^0.5] + atan(T_air + RH) - atan(RH - 1.676331) + 0.00391838*(RH^1.5)*atan(0.023101*RH) - 4.686035',
    minObservationsForTrend: 60,
    minCoveragePct: 75,
    thresholds: {
      stableThreshold: 0.10, // ±0.10°C TW / decade
      moderateThreshold: 0.22,
      severeThreshold: 0.40,
      desirability: 'higher_is_worsening',
    },
    impactPathway: {
      biophysicalMechanism: 'High ambient humidity impairs the human evaporative cooling mechanism (perspiration) when wet-bulb temperature nears 35°C.',
      environmentalImpact: 'Elevates compound heat-humidity events, night-time thermal stagnation, and livestock metabolic distress.',
      humanVulnerability: 'Dangerous cardiovascular collapse for outdoor manual laborers, elderly citizens, and unconditioned urban populations.',
    },
    recommendations: {
      immediate: [
        'Mandate strict outdoor labor work-rest cycles and shaded hydration breaks when wet-bulb temperature exceeds 29°C.',
        'Establish 24/7 municipal air-conditioned cooling sanctuaries in densely populated informal settlements.',
        'Equip emergency healthcare clinics with ice-bath immersion tubs for rapid heat-stroke resuscitation.',
      ],
      mediumTerm: [
        'Mandate passive ventilation, radiant barrier insulation, and shaded balconies in all municipal housing codes.',
        'Equip outdoor construction and agricultural workers with wearable wet-bulb biometric stress monitors.',
        'Install misting fans and shaded awnings at all public bus transit terminals and open-air markets.',
      ],
      longTerm: [
        'Restructure national working hour frameworks to shift heavy manual industrial tasks to cooler nocturnal/dawn hours.',
        'Implement extensive urban green infrastructure to reduce humidity-trapping microclimates.',
        'Design climate-adapted industrial manufacturing facilities with high-efficiency geothermal heat exchange.',
      ],
      whatToMonitor: [
        'Hourly Wet-Bulb Temperature (TW) and Heat Index values during hot pre-monsoon and monsoon months.',
        'Nocturnal cooling deficit (hours where TW remains above 26°C overnight).',
        'Hospital emergency admission rates for heat exhaustion and acute renal stress.',
      ],
      whatToAvoid: [
        'Do not rely solely on standard dry-bulb thermometer temperature when assessing human physiological hazard.',
        'Avoid locking outdoor construction shifts into fixed midday hours during extreme humidity alerts.',
        'Do not design emergency shelters without dedicated power generators for air circulation and cooling.',
      ],
      stakeholders: [
        { role: 'Ministry of Labor & Employment', title: 'Occupational Health & Safety', actionFocus: 'Enforce mandatory wet-bulb work stoppages and hydration breaks' },
        { role: 'Emergency Medical Services', title: 'Hospital Emergency Networks', actionFocus: 'Stock rapid cooling ice-baths and intravenous rehydration supplies' },
        { role: 'Urban Social Welfare Department', title: 'Community Protection', actionFocus: 'Operate public cooling sanctuaries for vulnerable populations' },
      ],
    },
  },
};

/**
 * Returns metadata for a given indicator ID, defaulting safely to LST if unknown.
 */
export function getIndicatorMetadata(indicatorId: string): IndicatorMetadata {
  const key = indicatorId as IndicatorId;
  return INDICATOR_REGISTRY[key] || INDICATOR_REGISTRY.lst;
}
