import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  GLOBAL_COUNTRIES,
  GlobalCountry,
  getCountryByCode,
  searchCountries,
  getCountriesByContinent,
} from '../data/globalCountries';
import { BANGLADESH_DISTRICT_GEOMETRIES } from '../data/bangladeshDistrictsGeo';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshData';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  MapPin,
  Layers,
  Info,
  Compass,
  ArrowRight,
  X,
  Crosshair,
  Sliders,
  Globe,
  Map as MapIcon,
} from 'lucide-react';

export interface WorldMapExplorerProps {
  selectedCountryCode?: string;
  onSelectCountry?: (countryCode: string) => void;
  selectedDistrictId?: string;
  onSelectDistrict?: (districtId: string) => void;
  activeVariable?: 'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar';
  onSelectVariable?: (variable: 'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar') => void;
  onNavigateToInvestigate?: (countryCode?: string, districtId?: string) => void;
  heightClass?: string;
  onToggleViewMode?: () => void;
  onToggle3D?: () => void;
  viewMode?: '2d' | '3d';
}

// Major continental coastline base polygons (Equirectangular coordinates in [lon, lat])
const CONTINENTAL_BASE_POLYGONS: { id: string; name: string; path: [number, number][] }[] = [
  {
    id: 'eurasia',
    name: 'Eurasia',
    path: [
      [-9, 36], [0, 44], [10, 54], [25, 71], [60, 75], [100, 77], [140, 72], [170, 66],
      [180, 64], [170, 60], [142, 50], [130, 40], [122, 30], [115, 22], [108, 12], [100, 4],
      [98, 10], [92, 16], [92, 21], [88, 22], [85, 20], [80, 10], [77, 8], [73, 16], [68, 24],
      [60, 25], [55, 28], [50, 30], [36, 31], [26, 36], [15, 38], [5, 36], [-9, 36],
    ],
  },
  {
    id: 'africa',
    name: 'Africa',
    path: [
      [-17, 30], [10, 37], [32, 31], [50, 30], [51, 11], [40, -10], [35, -25], [30, -32],
      [18, -34], [12, -15], [0, 5], [-15, 12], [-17, 21], [-17, 30],
    ],
  },
  {
    id: 'north_america',
    name: 'North America',
    path: [
      [-168, 65], [-140, 70], [-100, 72], [-65, 60], [-55, 48], [-70, 42], [-80, 25],
      [-90, 18], [-105, 20], [-115, 32], [-124, 48], [-150, 60], [-168, 65],
    ],
  },
  {
    id: 'south_america',
    name: 'South America',
    path: [
      [-78, 10], [-60, 8], [-35, -5], [-40, -22], [-55, -40], [-68, -55], [-75, -45],
      [-72, -18], [-80, -2], [-78, 10],
    ],
  },
  {
    id: 'australia',
    name: 'Australia',
    path: [
      [114, -22], [125, -15], [135, -12], [148, -20], [152, -35], [138, -38], [120, -35], [114, -25], [114, -22],
    ],
  },
  {
    id: 'greenland',
    name: 'Greenland',
    path: [
      [-52, 60], [-40, 65], [-25, 76], [-20, 82], [-45, 83], [-55, 75], [-52, 60],
    ],
  },
  {
    id: 'antarctica',
    name: 'Antarctica',
    path: [
      [-180, -68], [180, -68], [180, -88], [-180, -88], [-180, -68],
    ],
  },
];

export const WorldMapExplorer: React.FC<WorldMapExplorerProps> = ({
  selectedCountryCode = 'BD',
  onSelectCountry,
  selectedDistrictId = 'coxs-bazar',
  onSelectDistrict,
  activeVariable = 'lst',
  onSelectVariable,
  onNavigateToInvestigate,
  heightClass = 'h-[500px] sm:h-[580px] lg:h-[640px]',
  onToggleViewMode,
  onToggle3D,
  viewMode = '2d',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<GlobalCountry | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showGraticule, setShowGraticule] = useState<boolean>(true);
  const [selectedContinent, setSelectedContinent] = useState<string>('All');

  // SVG coordinate dimensions
  const MAP_WIDTH = 1200;
  const MAP_HEIGHT = 650;

  // Active country object
  const activeCountry = useMemo(() => {
    return getCountryByCode(selectedCountryCode) || GLOBAL_COUNTRIES[0];
  }, [selectedCountryCode]);

  // Convert Lon/Lat into Equirectangular SVG coordinates
  const project = useCallback((lon: number, lat: number): [number, number] => {
    const x = ((lon + 180) / 360) * MAP_WIDTH;
    const y = ((90 - lat) / 180) * MAP_HEIGHT;
    return [x, y];
  }, [MAP_WIDTH, MAP_HEIGHT]);

  // Convert Lon/Lat polygon to SVG Path string
  const polygonToPath = useCallback(
    (coords: [number, number][]): string => {
      if (!coords || coords.length === 0) return '';
      return coords
        .map(([lon, lat], i) => {
          const [x, y] = project(lon, lat);
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ') + ' Z';
    },
    [project]
  );

  // Variable color coding
  const getCountryFill = useCallback(
    (country: GlobalCountry): string => {
      const isSelected = country.code === activeCountry.code;

      if (activeVariable === 'lst') {
        const v = country.trendLST;
        if (isSelected) return '#7052C8';
        if (v < 0.15) return '#93C5FD'; // Soft blue
        if (v < 0.28) return '#FCD34D'; // Amber
        if (v < 0.38) return '#FB923C'; // Orange
        return '#F87171'; // Warm red
      }
      if (activeVariable === 'rainfall') {
        const v = country.trendRainfall;
        if (isSelected) return '#7052C8';
        if (v < -4.0) return '#D97706'; // Drought
        if (v < 0.0) return '#FBBF24'; // Deficit
        if (v < 4.0) return '#34D399'; // Modest
        return '#38BDF8'; // High
      }
      if (activeVariable === 'ndvi') {
        const v = country.trendNDVI;
        if (isSelected) return '#7052C8';
        if (v < -1.0) return '#B45309';
        if (v < 0.5) return '#A3E635';
        return '#10B981';
      }
      if (activeVariable === 'tws') {
        const v = country.trendTWS;
        if (isSelected) return '#7052C8';
        if (v < -4.0) return '#EF4444';
        if (v < -1.0) return '#FB923C';
        if (v < 1.0) return '#94A3B8';
        return '#3B82F6';
      }
      // Solar
      return isSelected ? '#7052C8' : '#FBBF24';
    },
    [activeVariable, activeCountry.code]
  );

  // Center on Country
  const centerOnCountry = useCallback(
    (country: GlobalCountry) => {
      const [x, y] = project(country.coordinates[0], country.coordinates[1]);
      const newZoom = country.areaSqKm < 300000 ? 3.5 : country.areaSqKm < 2000000 ? 2.2 : 1.6;
      setZoom(newZoom);
      setPan({
        x: MAP_WIDTH / 2 - x * newZoom,
        y: MAP_HEIGHT / 2 - y * newZoom,
      });
    },
    [project, MAP_WIDTH, MAP_HEIGHT]
  );

  // Zoom to fit entire world
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Zoom in / out controls
  const handleZoom = (delta: number) => {
    setZoom((prev) => {
      const next = Math.max(1, Math.min(8, prev + delta));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch pan & pinch zoom handlers
  const touchStartRef = useRef<{ x: number; y: number; dist?: number }>({ x: 0, y: 0 });
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && !touchStartRef.current.dist) {
      setPan({
        x: e.touches[0].clientX - touchStartRef.current.x,
        y: e.touches[0].clientY - touchStartRef.current.y,
      });
    } else if (e.touches.length === 2 && touchStartRef.current.dist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartRef.current.dist;
      setZoom((z) => Math.max(1, Math.min(8, z * (1 + (ratio - 1) * 0.4))));
      touchStartRef.current.dist = dist;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((z) => Math.max(1, Math.min(8, z * zoomFactor)));
  };

  // Filtered countries for search drawer
  const searchResults = useMemo(() => {
    let list = getCountriesByContinent(selectedContinent);
    if (searchQuery.trim()) {
      list = searchCountries(searchQuery);
    }
    return list;
  }, [selectedContinent, searchQuery]);

  const selectCountryHandler = (c: GlobalCountry) => {
    onSelectCountry?.(c.code);
    centerOnCountry(c);
    setSearchOpen(false);
  };

  // Active variable labels
  const variableLabels = {
    lst: { name: 'Land Surface Temp', units: '°C/dec', sensor: 'MODIS Terra' },
    rainfall: { name: 'Precipitation', units: '%/dec', sensor: 'GPM IMERG' },
    ndvi: { name: 'Vegetation Canopy', units: 'NDVI/dec', sensor: 'MODIS Aqua' },
    tws: { name: 'Water Storage Anomaly', units: 'cm/dec', sensor: 'GRACE/GRACE-FO' },
    solar: { name: 'Solar Irradiance', units: 'MJ/m²', sensor: 'NASA POWER' },
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${heightClass} bg-[#0e1222] rounded-3xl overflow-hidden border border-[#E9E4F2] shadow-sm select-none font-sans`}
    >
      {/* SVG Canvas Map */}
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { touchStartRef.current.dist = undefined; }}
        onWheel={handleWheel}
        aria-label="2D Interactive World Map - Click a country to investigate"
      >
        <defs>
          {/* Deep oceanic bathymetry background */}
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1224" />
            <stop offset="50%" stopColor="#0d1830" />
            <stop offset="100%" stopColor="#0a1224" />
          </linearGradient>

          {/* Glowing selected border filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean Background */}
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#oceanGrad)" />

        {/* Scaled & Translated Map Transform Layer */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Graticule Grid Lines */}
          {showGraticule && (
            <g stroke="#ffffff" strokeOpacity="0.07" strokeWidth="0.8" fill="none">
              {[-60, -30, 0, 30, 60].map((lat) => {
                const y = ((90 - lat) / 180) * MAP_HEIGHT;
                return (
                  <line
                    key={`lat-${lat}`}
                    x1="0"
                    y1={y}
                    x2={MAP_WIDTH}
                    y2={y}
                    strokeDasharray={lat === 0 ? undefined : '3 3'}
                    strokeWidth={lat === 0 ? '1.2' : '0.8'}
                    stroke={lat === 0 ? '#7052C8' : '#ffffff'}
                    strokeOpacity={lat === 0 ? '0.45' : '0.07'}
                  />
                );
              })}
              {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => {
                const x = ((lon + 180) / 360) * MAP_WIDTH;
                return (
                  <line
                    key={`lon-${lon}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2={MAP_HEIGHT}
                    strokeDasharray={lon === 0 ? undefined : '3 3'}
                    strokeWidth={lon === 0 ? '1.2' : '0.8'}
                    stroke={lon === 0 ? '#7052C8' : '#ffffff'}
                    strokeOpacity={lon === 0 ? '0.45' : '0.07'}
                  />
                );
              })}
            </g>
          )}

          {/* Continental Base Contours */}
          <g fill="#162038" stroke="#253556" strokeWidth="0.75" opacity="0.9">
            {CONTINENTAL_BASE_POLYGONS.map((c) => (
              <path key={c.id} d={polygonToPath(c.path)} />
            ))}
          </g>

          {/* 73 Sovereign Country Polygons */}
          <g>
            {GLOBAL_COUNTRIES.map((country) => {
              const isSelected = country.code === activeCountry.code;
              const isHovered = hoveredCountry?.code === country.code;
              const pathD = polygonToPath(country.polygon);
              if (!pathD) return null;

              return (
                <path
                  key={country.code}
                  d={pathD}
                  fill={getCountryFill(country)}
                  fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.65}
                  stroke={isSelected ? '#FFFFFF' : isHovered ? '#C4B5FD' : '#3B4D72'}
                  strokeWidth={isSelected ? 2.5 / zoom : isHovered ? 1.5 / zoom : 0.8 / zoom}
                  filter={isSelected ? 'url(#glow)' : undefined}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => onSelectCountry?.(country.code)}
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                />
              );
            })}
          </g>

          {/* Pinpoint Indicator & Pulse for Active Country */}
          {activeCountry && (
            <g transform={`translate(${project(activeCountry.coordinates[0], activeCountry.coordinates[1]).join(',')})`}>
              <circle r={8 / Math.sqrt(zoom)} fill="#7052C8" fillOpacity="0.4" className="animate-ping" />
              <circle r={4 / Math.sqrt(zoom)} fill="#FFFFFF" stroke="#49318F" strokeWidth={1.5 / Math.sqrt(zoom)} />
            </g>
          )}
        </g>
      </svg>

      {/* TOP BAR: Clean NASA-Inspired Header & View Mode Switcher */}
      <div className="absolute top-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Scientific Map Badge & Active Country Chip */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-[#E9E4F2]/20 text-white text-xs font-mono font-bold shadow-md">
            <MapIcon className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">2D SATELLITE CARTOGRAPHY</span>
            <span className="text-slate-500">·</span>
            <span className="text-purple-300 font-extrabold">{activeCountry.name}</span>
            <span className="text-slate-400">({activeCountry.code3})</span>
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-[#E9E4F2]/20 text-slate-200 text-xs font-mono transition-colors flex items-center gap-1.5 shadow-md"
            title="Search Sovereign Nations"
          >
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Find Country</span>
          </button>
        </div>

        {/* Right: View Mode Toggle (2D World Map vs 3D Earth Globe) & Variables */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* 2D / 3D Mode Toggle Switch */}
          {(onToggleViewMode || onToggle3D) && (
            <button
              onClick={() => {
                if (onToggle3D) onToggle3D();
                else if (onToggleViewMode) onToggleViewMode();
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md"
              title="Toggle between 2D Map and 3D Globe"
            >
              {viewMode === '2d' ? (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">3D Earth View</span>
                </>
              ) : (
                <>
                  <MapIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">2D Map View</span>
                </>
              )}
            </button>
          )}

          {/* Graticule Toggle */}
          <button
            onClick={() => setShowGraticule((prev) => !prev)}
            className={`p-1.5 rounded-xl border text-xs font-mono transition-colors ${
              showGraticule
                ? 'bg-slate-800 text-purple-300 border-purple-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-700'
            }`}
            title="Toggle Coordinate Graticule Grid"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* BOTTOM LEFT: Camera Navigation & Zoom Toolbar */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-[#E9E4F2]/20 p-1.5 rounded-2xl shadow-lg pointer-events-auto">
        <button
          onClick={() => centerOnCountry(activeCountry)}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title={`Center on ${activeCountry.name}`}
        >
          <MapPin className="w-3.5 h-3.5 text-purple-400" />
        </button>

        <button
          onClick={resetView}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset to Full World View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
        </button>

        <button
          onClick={() => handleZoom(0.5)}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom(-0.5)}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-700 mx-0.5" />

        <span className="text-[10px] font-mono font-bold text-purple-300 px-1.5">
          {zoom.toFixed(1)}x
        </span>
      </div>

      {/* BOTTOM CENTER: Scientific Map Legend */}
      <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-20 items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-[#E9E4F2]/20 px-3 py-1.5 rounded-2xl shadow-lg pointer-events-auto text-[11px] font-mono text-slate-300">
        <span className="font-bold text-white uppercase text-[10px] tracking-wider">
          {variableLabels[activeVariable].name}:
        </span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
          <span className="text-[10px] text-slate-400">Low / Cooling</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
          <span className="text-[10px] text-slate-400">Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
          <span className="text-[10px] text-slate-400">Elevated Warming</span>
        </div>
        <span className="text-slate-500">·</span>
        <span className="text-purple-300 font-bold">[{variableLabels[activeVariable].units}]</span>
      </div>

      {/* BOTTOM RIGHT: Selected Region Summary & Investigate CTA */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-[#E9E4F2]/20 px-3.5 py-2 rounded-2xl shadow-xl text-white">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-white font-mono">{activeCountry.name}</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Rate:{' '}
              <strong className="text-purple-300">
                {activeVariable === 'lst'
                  ? `+${activeCountry.trendLST}°C/dec`
                  : activeVariable === 'rainfall'
                  ? `${activeCountry.trendRainfall}%/dec`
                  : activeVariable === 'ndvi'
                  ? `${activeCountry.trendNDVI}%/dec`
                  : `${activeCountry.trendTWS} cm/dec`}
              </strong>
            </p>
          </div>

          <button
            onClick={() => onNavigateToInvestigate?.(activeCountry.code)}
            className="ml-2 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-mono font-bold transition-all flex items-center gap-1 shadow-sm shrink-0"
          >
            <span>Investigate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredCountry && (
        <div className="absolute top-16 left-4 z-30 pointer-events-none p-2.5 rounded-xl bg-slate-950/95 backdrop-blur-md border border-purple-500/40 text-white text-xs font-mono shadow-xl space-y-0.5 animate-in fade-in duration-100">
          <div className="font-bold text-purple-200">{hoveredCountry.name} ({hoveredCountry.code3})</div>
          <div className="text-[10px] text-slate-400">Cap: {hoveredCountry.capital} · {hoveredCountry.region}</div>
          <div className="text-[10px] text-emerald-400 pt-0.5 font-bold">
            {variableLabels[activeVariable].name}:{' '}
            {activeVariable === 'lst'
              ? `+${hoveredCountry.trendLST}°C/dec`
              : activeVariable === 'rainfall'
              ? `${hoveredCountry.trendRainfall}%/dec`
              : `${hoveredCountry.trendTWS} cm/dec`}
          </div>
        </div>
      )}

      {/* Country Search Modal Drawer */}
      {searchOpen && (
        <div className="absolute top-14 left-3 sm:left-4 z-30 w-84 max-w-[92vw] bg-slate-950/95 backdrop-blur-xl border border-purple-500/40 rounded-3xl p-4 shadow-2xl text-white space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
              Select Region (73 Sovereign Nations)
            </span>
            <button
              onClick={() => setSearchOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nation or capital..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-1 text-[10px] font-mono">
            {['All', 'Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedContinent(c)}
                className={`px-2 py-0.5 rounded-lg border transition-colors ${
                  selectedContinent === c
                    ? 'bg-purple-600 border-purple-400 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {searchResults.slice(0, 18).map((country) => {
              const isSelected = country.code === activeCountry.code;
              return (
                <button
                  key={country.code}
                  onClick={() => selectCountryHandler(country)}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-purple-900/80 border border-purple-400 text-white font-bold'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold text-slate-100 truncate">{country.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{country.region}</div>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-800 text-purple-300 px-1.5 py-0.5 rounded ml-2">
                    {country.code3}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
