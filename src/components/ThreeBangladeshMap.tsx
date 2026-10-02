import React, { useState, useMemo, useRef } from 'react';
import { BANGLADESH_DISTRICT_GEOMETRIES, DistrictGeoFeature } from '../data/bangladeshDistrictsGeo';
import { BANGLADESH_DISTRICTS, BangladeshDistrict } from '../data/bangladeshData';
import { NasaSourceRecord } from '../data/nasaRegistry';
import {
  Layers,
  MapPin,
  TrendingUp,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface ThreeBangladeshMapProps {
  selectedDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  selectedVariable: 'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar';
  dataset: NasaSourceRecord;
}

export const ThreeBangladeshMap: React.FC<ThreeBangladeshMapProps> = ({
  selectedDistrictId,
  onSelectDistrict,
  selectedVariable,
  dataset,
}) => {
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showGraticules, setShowGraticules] = useState<boolean>(true);

  // SVG viewport dimensions
  const svgWidth = 680;
  const svgHeight = 740;

  // Geographic bounds for Bangladesh:
  // Longitude: 88.0° E to 92.8° E (~4.8° span)
  // Latitude: 20.6° N to 26.6° N (~6.0° span)
  const minLon = 88.0;
  const maxLon = 92.8;
  const minLat = 20.6;
  const maxLat = 26.6;

  const toSvgCoords = (lon: number, lat: number): [number, number] => {
    const x = ((lon - minLon) / (maxLon - minLon)) * (svgWidth - 100) + 50;
    // Inverted Y axis for standard SVG projection
    const y = ((maxLat - lat) / (maxLat - minLat)) * (svgHeight - 100) + 40;
    return [x, y];
  };

  const activeDistrictData = useMemo(() => {
    return (
      BANGLADESH_DISTRICTS.find((d) => d.id === selectedDistrictId) || BANGLADESH_DISTRICTS[0]
    );
  }, [selectedDistrictId]);

  const hoveredDistrictData = useMemo(() => {
    if (!hoveredDistrictId) return null;
    return BANGLADESH_DISTRICTS.find((d) => d.id === hoveredDistrictId) || null;
  }, [hoveredDistrictId]);

  // Color calculation based on the selected variable and scientific range
  const getDistrictColor = (district: BangladeshDistrict, isSelected: boolean, isHovered: boolean) => {
    if (isSelected) {
      return '#7c3aed'; // Primary active purple
    }
    if (isHovered) {
      return '#c084fc'; // Light lavender highlight
    }

    if (selectedVariable === 'lst') {
      // Daytime LST warming: 0.25 to 0.52 °C/dec
      const norm = Math.min(1, Math.max(0, (district.lstTrendPerDecade_C - 0.25) / 0.28));
      return norm > 0.65 ? '#8b5cf6' : norm > 0.35 ? '#a78bfa' : '#ede9fe';
    } else if (selectedVariable === 'rainfall') {
      // Annual rainfall 1400 to 4600 mm
      const norm = Math.min(1, Math.max(0, (district.annualRainfall_mm - 1400) / 3200));
      return norm > 0.65 ? '#6d28d9' : norm > 0.35 ? '#8b5cf6' : '#ddd6fe';
    } else if (selectedVariable === 'ndvi') {
      // NDVI 0.35 to 0.70
      const norm = Math.min(1, Math.max(0, (district.meanNDVI - 0.35) / 0.35));
      return norm > 0.65 ? '#059669' : norm > 0.35 ? '#10b981' : '#a7f3d0';
    } else if (selectedVariable === 'tws') {
      // Water storage trend
      return district.isCoastal ? '#7c3aed' : '#9333ea';
    }
    return '#f3e8ff';
  };

  // Drag & Touch Pan Handling
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPanOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Touch pan & pinch
  const touchStart = useRef<{ x: number; y: number; dist: number }>({ x: 0, y: 0, dist: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX - panOffset.x, y: e.touches[0].clientY - panOffset.y };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStart.current.dist = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging.current) {
      setPanOffset({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y,
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStart.current.dist;
      setZoomLevel((z) => Math.min(2.0, Math.max(0.7, z * factor)));
      touchStart.current.dist = dist;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative w-full h-full min-h-[540px] bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden flex flex-col justify-between select-none">
      {/* Top Map Toolbar & Scientific GIS HUD */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-purple-100/80 bg-white/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-purple-700 font-bold block">
              REALISTIC GIS ADMINISTRATIVE BOUNDARY LAYER
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 font-['Space_Grotesk']">
                Bangladesh Regional Earth Observation
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                WGS 84 • 1:500,000 Scale
              </span>
            </div>
          </div>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setShowContours(!showContours)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              showContours ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-slate-500 border-slate-200'
            }`}
            title="Toggle Delta Rivers & Topographic Contours"
          >
            Rivers / Contours
          </button>

          <button
            onClick={() => setShowGraticules(!showGraticules)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              showGraticules ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-slate-500 border-slate-200'
            }`}
            title="Toggle Coordinate Grid"
          >
            Lat/Lon Grid
          </button>

          <div className="h-4 w-px bg-purple-100 mx-1" />

          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
            className="p-1.5 rounded-lg bg-white border border-purple-200 text-slate-700 hover:bg-purple-50"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
            className="p-1.5 rounded-lg bg-white border border-purple-200 text-slate-700 hover:bg-purple-50"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded-lg bg-white border border-purple-200 text-slate-700 hover:bg-purple-50"
            title="Reset Map Position"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Map Surface */}
      <div
        className="relative flex-1 flex items-center justify-center p-2 overflow-hidden bg-[#faf8ff] cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full max-h-[620px] transition-transform duration-100 filter drop-shadow-xs select-none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}
        >
          <defs>
            {/* Soft shadow for selected district */}
            <filter id="gisDistrictGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7c3aed" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Oceanic Basin: Bay of Bengal */}
          <path
            d="M 20 540 Q 220 500 420 530 T 660 590 L 660 730 L 20 730 Z"
            fill="#e0e7ff"
            opacity="0.65"
          />
          <text
            x="240"
            y="650"
            fill="#4338ca"
            fontSize="12"
            fontFamily="monospace"
            letterSpacing="3"
            fontWeight="bold"
            opacity="0.5"
          >
            BAY OF BENGAL (NORTHERN DELTA)
          </text>

          {/* Graticule Grid Lines (Latitudes & Longitudes) */}
          {showGraticules && (
            <g opacity="0.35" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3">
              {[21, 22, 23, 24, 25, 26].map((lat) => {
                const [, y] = toSvgCoords(88, lat);
                return (
                  <g key={`lat-${lat}`}>
                    <line x1="40" y1={y} x2={svgWidth - 40} y2={y} />
                    <text x="45" y={y - 3} fill="#64748b" fontSize="9" fontFamily="monospace">
                      {lat}°N
                    </text>
                  </g>
                );
              })}
              {[89, 90, 91, 92].map((lon) => {
                const [x] = toSvgCoords(lon, 26.6);
                return (
                  <g key={`lon-${lon}`}>
                    <line x1={x} y1="40" x2={x} y2={svgHeight - 40} />
                    <text x={x + 3} y="55" fill="#64748b" fontSize="9" fontFamily="monospace">
                      {lon}°E
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Major Transboundary River Channels (Padma, Jamuna, Meghna) */}
          {showContours && (
            <g stroke="#93c5fd" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round">
              {/* Brahmaputra / Jamuna River */}
              <path d="M 220 70 Q 250 180 270 290 T 320 400" />
              {/* Ganges / Padma River */}
              <path d="M 70 260 Q 180 320 280 360 T 350 420" />
              {/* Meghna Estuary into Bay of Bengal */}
              <path d="M 350 420 Q 400 480 440 560" strokeWidth="5" />
              {/* Karnaphuli coastal river */}
              <path d="M 520 480 Q 540 510 520 540" strokeWidth="2.5" />
            </g>
          )}

          {/* Sundarbans UNESCO Mangrove Tidal Zone */}
          <path
            d="M 140 500 Q 220 525 290 510 L 280 580 Q 200 585 130 560 Z"
            fill="#065f46"
            opacity="0.35"
          />
          <text x="160" y="550" fill="#047857" fontSize="10" fontFamily="monospace" fontWeight="bold">
            Sundarbans Mangroves
          </text>

          {/* Contiguous Real District Polygons */}
          {BANGLADESH_DISTRICT_GEOMETRIES.map((geo) => {
            const districtData = BANGLADESH_DISTRICTS.find((d) => d.id === geo.id);
            if (!districtData) return null;

            const isSelected = geo.id === selectedDistrictId;
            const isHovered = geo.id === hoveredDistrictId;

            // Generate precise SVG point string
            const pointsStr = geo.polygon
              .map(([lon, lat]) => {
                const [x, y] = toSvgCoords(lon, lat);
                return `${x},${y}`;
              })
              .join(' ');

            const fillColor = getDistrictColor(districtData, isSelected, isHovered);
            const [cx, cy] = toSvgCoords(geo.center[0], geo.center[1]);

            return (
              <g
                key={geo.id}
                onClick={() => onSelectDistrict(geo.id)}
                onMouseEnter={() => setHoveredDistrictId(geo.id)}
                onMouseLeave={() => setHoveredDistrictId(null)}
                className="cursor-pointer group"
              >
                {/* District Administrative Surface */}
                <polygon
                  points={pointsStr}
                  fill={fillColor}
                  stroke={isSelected ? '#4c1d95' : '#ffffff'}
                  strokeWidth={isSelected ? 3 : 1.2}
                  filter={isSelected ? 'url(#gisDistrictGlow)' : undefined}
                  className="transition-colors duration-150"
                />

                {/* District Center Pin dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 4.5 : 2.5}
                  fill={isSelected ? '#ffffff' : '#4c1d95'}
                  stroke={isSelected ? '#7c3aed' : '#ffffff'}
                  strokeWidth={1}
                />

                {/* District Name Label */}
                <text
                  x={cx + 6}
                  y={cy + 3}
                  fill={isSelected ? '#ffffff' : '#0f172a'}
                  fontSize={isSelected ? '11' : '9.5'}
                  fontWeight={isSelected ? '800' : '600'}
                  fontFamily="sans-serif"
                  className="pointer-events-none drop-shadow-2xs"
                >
                  {geo.name}
                </text>
              </g>
            );
          })}

          {/* GIS North Arrow & Scale Indicator */}
          <g transform="translate(610, 80)">
            <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <polygon points="0,-12 4,0 0,-2 -4,0" fill="#7c3aed" />
            <polygon points="0,12 4,0 0,2 -4,0" fill="#94a3b8" />
            <text x="0" y="-14" fill="#7c3aed" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              N
            </text>
          </g>

          {/* Geographic Scale Bar (100 km) */}
          <g transform="translate(60, 690)">
            <rect x="0" y="0" width="120" height="4" fill="#0f172a" />
            <rect x="0" y="0" width="60" height="4" fill="#ffffff" stroke="#0f172a" strokeWidth="0.5" />
            <text x="0" y="-4" fill="#64748b" fontSize="8" fontFamily="monospace">0</text>
            <text x="60" y="-4" fill="#64748b" fontSize="8" fontFamily="monospace">50km</text>
            <text x="120" y="-4" fill="#64748b" fontSize="8" fontFamily="monospace">100km</text>
          </g>
        </svg>

        {/* Real-Time District Inspection Telemetry Overlay */}
        <div className="absolute bottom-4 left-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-purple-200 shadow-xl max-w-xs text-xs space-y-1.5 z-20 pointer-events-none font-['Manrope']">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-mono text-purple-700 font-bold uppercase tracking-wider">
              {hoveredDistrictData ? 'HOVER INSPECTION' : 'ACTIVE DISTRICT'}
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
              {(hoveredDistrictData || activeDistrictData).isCoastal ? 'COASTAL ZONE' : 'INLAND BASIN'}
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-slate-900 font-['Space_Grotesk']">
            {(hoveredDistrictData || activeDistrictData).name} District
          </h4>

          <div className="text-[11px] text-slate-600 font-mono">
            {(hoveredDistrictData || activeDistrictData).divisionName} Division • Elev: {(hoveredDistrictData || activeDistrictData).elevationMeters}m MSL
          </div>

          <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 font-semibold">{dataset.variable_name}:</span>
            <span className="font-extrabold text-purple-900 text-sm">
              {selectedVariable === 'lst'
                ? `+${(hoveredDistrictData || activeDistrictData).lstTrendPerDecade_C}°C/dec`
                : selectedVariable === 'rainfall'
                ? `${(hoveredDistrictData || activeDistrictData).annualRainfall_mm} mm/yr`
                : selectedVariable === 'ndvi'
                ? `${(hoveredDistrictData || activeDistrictData).meanNDVI} NDVI`
                : `${(hoveredDistrictData || activeDistrictData).salinityIntrusionKm} km`}
            </span>
          </div>
        </div>
      </div>

      {/* Map Scientific Legend Footer */}
      <div className="p-3.5 bg-white border-t border-purple-100 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-600 z-10">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            DATA GRADIENT:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Baseline</span>
            <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-purple-100 via-purple-400 to-purple-800 shadow-2xs" />
            <span className="text-[10px] text-purple-950 font-bold">Max Trend</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <div>
            Dataset: <strong className="text-slate-800">{dataset.dataset_id}</strong>
          </div>
          <div>
            Version: <strong className="text-slate-800">{dataset.product_version}</strong>
          </div>
          <div>
            Period: <strong className="text-slate-800">{dataset.temporal_coverage.start}–{dataset.temporal_coverage.end}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
