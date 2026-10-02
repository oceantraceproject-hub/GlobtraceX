import React, { useState } from 'react';
import { VariableType } from '../compute/types';
import { analyzeTrend } from '../compute/scienceEngine';
import { MapPin, Crosshair, Layers, Navigation } from 'lucide-react';

interface BangladeshDistrict {
  id: string;
  name: string;
  division: string;
  coordinates: { latMin: number; latMax: number; lonMin: number; lonMax: number };
  center: [number, number]; // [lon, lat]
  area: string;
  zone_type: string;
  svgPath: string;
}

// Calibrated SVG vector boundaries representing Bangladesh divisions and key focus districts
const DISTRICT_POLYGONS: BangladeshDistrict[] = [
  {
    id: 'dhaka',
    name: 'Dhaka',
    division: 'Dhaka',
    coordinates: { latMin: 23.53, latMax: 24.05, lonMin: 90.01, lonMax: 90.58 },
    center: [90.41, 23.81],
    area: '1,463 km²',
    zone_type: 'Megacity Urban Heat Island',
    svgPath: 'M 285 240 L 330 230 L 340 280 L 295 295 L 275 265 Z',
  },
  {
    id: 'chittagong',
    name: 'Chittagong',
    division: 'Chittagong',
    coordinates: { latMin: 21.90, latMax: 22.98, lonMin: 91.45, lonMax: 92.38 },
    center: [91.83, 22.35],
    area: '5,282 km²',
    zone_type: 'Coastal Port & Maritime',
    svgPath: 'M 350 310 L 410 290 L 435 370 L 385 410 L 360 360 Z',
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    division: 'Sylhet',
    coordinates: { latMin: 24.60, latMax: 25.20, lonMin: 91.65, lonMax: 92.50 },
    center: [91.86, 24.89],
    area: '3,490 km²',
    zone_type: 'Northeastern Haor Wetland',
    svgPath: 'M 355 120 L 440 110 L 450 180 L 380 200 L 345 160 Z',
  },
  {
    id: 'khulna',
    name: 'Khulna (Sundarbans)',
    division: 'Khulna',
    coordinates: { latMin: 21.65, latMax: 23.00, lonMin: 89.15, lonMax: 89.95 },
    center: [89.54, 22.84],
    area: '4,394 km²',
    zone_type: 'Coastal Mangrove Delta',
    svgPath: 'M 195 290 L 270 290 L 285 390 L 210 430 L 175 350 Z',
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi (Barind)',
    division: 'Rajshahi',
    coordinates: { latMin: 24.12, latMax: 24.72, lonMin: 88.28, lonMax: 88.98 },
    center: [88.60, 24.37],
    area: '2,407 km²',
    zone_type: 'Northwestern Barind Tract',
    svgPath: 'M 140 180 L 225 170 L 245 240 L 165 260 L 130 210 Z',
  },
  {
    id: 'coxs-bazar',
    name: "Cox's Bazar",
    division: 'Chittagong',
    coordinates: { latMin: 20.65, latMax: 21.75, lonMin: 91.85, lonMax: 92.35 },
    center: [92.00, 21.42],
    area: '2,491 km²',
    zone_type: 'Southern Coastal Beach Corridor',
    svgPath: 'M 385 410 L 440 375 L 460 480 L 415 500 L 390 450 Z',
  },
  {
    id: 'barisal',
    name: 'Barisal',
    division: 'Barisal',
    coordinates: { latMin: 22.45, latMax: 23.08, lonMin: 90.05, lonMax: 90.65 },
    center: [90.36, 22.70],
    area: '2,784 km²',
    zone_type: 'Estuarine Delta Network',
    svgPath: 'M 270 300 L 340 295 L 345 380 L 280 400 Z',
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    division: 'Rangpur',
    coordinates: { latMin: 25.30, latMax: 25.95, lonMin: 88.95, lonMax: 89.45 },
    center: [89.24, 25.74],
    area: '2,308 km²',
    zone_type: 'Northern Teesta Alluvial Plain',
    svgPath: 'M 170 60 L 270 50 L 280 140 L 195 155 L 155 100 Z',
  },
];

interface BangladeshMapProps {
  selectedDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  variable: VariableType;
}

export const BangladeshMap: React.FC<BangladeshMapProps> = ({
  selectedDistrictId,
  onSelectDistrict,
  variable,
}) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<BangladeshDistrict | null>(null);

  // Determine district color according to calculated trend direction and magnitude
  const getDistrictColor = (districtId: string) => {
    const res = analyzeTrend(districtId, districtId, variable, 'bangladesh');
    const slope = res.theilSenSlopePerDecade;

    if (variable === 'lst') {
      // Land Surface Temperature: warmer = deeper crimson
      if (slope > 0.25) return '#dc2626';
      if (slope > 0.15) return '#ea580c';
      if (slope > 0.05) return '#d97706';
      return '#0284c7';
    } else if (variable === 'rainfall') {
      // Rainfall: positive = deep blue/emerald, negative = amber/brown
      if (slope > 10) return '#059669';
      if (slope > 0) return '#0284c7';
      if (slope > -10) return '#d97706';
      return '#b91c1c';
    } else {
      // NDVI: green = growing, brown = declining
      if (slope > 0.005) return '#16a34a';
      if (slope > -0.005) return '#0d9488';
      return '#b45309';
    }
  };

  return (
    <div className="relative w-full h-[520px] bg-[#071326] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col select-none">
      {/* HUD Header */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-white">Bangladesh District Map</span>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40">
            MODIS & GPM Extract
          </span>
        </div>

        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Active:</span>
          <span className="font-bold text-white capitalize">{selectedDistrictId}</span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="w-full flex-1 flex items-center justify-center p-4">
        <svg viewBox="100 40 400 480" className="w-full h-full max-h-[460px] object-contain">
          {/* Base Country Outline Glow */}
          <path
            d="M 170 60 L 270 50 L 355 120 L 440 110 L 460 220 L 410 290 L 460 480 L 385 410 L 285 390 L 210 430 L 175 350 L 130 210 Z"
            fill="#030c1b"
            stroke="#1e293b"
            strokeWidth="3"
            strokeDasharray="4,4"
          />

          {/* District Polygons */}
          {DISTRICT_POLYGONS.map((dist) => {
            const isSelected = dist.id === selectedDistrictId;
            const fillColor = getDistrictColor(dist.id);

            return (
              <g
                key={dist.id}
                className="cursor-pointer group"
                onClick={() => onSelectDistrict(dist.id)}
                onMouseEnter={() => setHoveredDistrict(dist)}
                onMouseLeave={() => setHoveredDistrict(null)}
              >
                <path
                  d={dist.svgPath}
                  fill={fillColor}
                  fillOpacity={isSelected ? 0.85 : 0.45}
                  stroke={isSelected ? '#38bdf8' : '#334155'}
                  strokeWidth={isSelected ? 2.5 : 1}
                  className="transition-all duration-150 hover:fill-opacity-80"
                />

                {/* District Center Anchor Pin */}
                <circle
                  cx={dist.svgPath.match(/M\s+(\d+)/)?.[1] || 250}
                  cy={dist.svgPath.match(/M\s+\d+\s+(\d+)/)?.[1] || 250}
                  r={isSelected ? 5 : 3.5}
                  fill={isSelected ? '#38bdf8' : '#cbd5e1'}
                  stroke="#071326"
                  strokeWidth="1"
                />

                <text
                  x={dist.svgPath.match(/M\s+(\d+)/)?.[1] || 250}
                  y={Number(dist.svgPath.match(/M\s+\d+\s+(\d+)/)?.[1] || 250) - 8}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#94a3b8'}
                  fontSize={isSelected ? 11 : 9.5}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  className="pointer-events-none drop-shadow"
                >
                  {dist.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover Inspector Tooltip */}
      {hoveredDistrict && (
        <div className="absolute bottom-14 left-4 z-20 bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-1 font-mono pointer-events-none">
          <div className="font-bold text-cyan-300 text-sm">{hoveredDistrict.name}</div>
          <div className="text-slate-400 text-[11px]">{hoveredDistrict.division} Division • {hoveredDistrict.zone_type}</div>
          <div className="text-slate-300 text-[11px] pt-1 border-t border-slate-800">
            Trend: {analyzeTrend(hoveredDistrict.id, hoveredDistrict.name, variable, 'bangladesh').theilSenSlopePerDecade > 0 ? '+' : ''}
            {analyzeTrend(hoveredDistrict.id, hoveredDistrict.name, variable, 'bangladesh').theilSenSlopePerDecade}{' '}
            {analyzeTrend(hoveredDistrict.id, hoveredDistrict.name, variable, 'bangladesh').units}/dec
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Click any district to inspect multi-decadal time series</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>High Warm / Deficit</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Precip / Biomass</span>
          </span>
        </div>
      </div>
    </div>
  );
};
