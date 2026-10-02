import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { OceanRegion, VariableType } from '../types/nasa';
import { OCEAN_REGIONS } from '../data/oceanRegions';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Layers, Navigation, Compass } from 'lucide-react';

interface OceanMapProps {
  selectedRegion: OceanRegion;
  onSelectRegion: (region: OceanRegion) => void;
  selectedVariable: VariableType;
  onSelectVariable?: (variable: VariableType) => void;
  interactive?: boolean;
  compact?: boolean;
}

// Low-resolution GeoJSON-style world land polygons for pristine rendering without external tile lag
const WORLD_LAND_PATHS = [
  // North America
  'M 120 70 L 160 50 L 220 50 L 260 70 L 290 110 L 280 150 L 250 180 L 230 200 L 220 230 L 205 210 L 180 180 L 150 160 L 120 120 Z',
  // South America
  'M 230 220 L 260 230 L 290 270 L 280 340 L 260 380 L 235 410 L 230 350 L 220 280 Z',
  // Eurasia
  'M 420 60 L 520 50 L 640 60 L 720 80 L 760 120 L 730 170 L 680 170 L 640 200 L 590 190 L 560 210 L 510 180 L 460 170 L 430 140 L 410 100 Z',
  // Africa
  'M 420 180 L 470 180 L 510 230 L 510 280 L 480 340 L 450 350 L 420 290 L 400 230 Z',
  // India
  'M 580 195 L 610 205 L 600 250 L 585 240 Z',
  // Australia
  'M 690 280 L 750 280 L 770 330 L 740 360 L 690 350 L 670 310 Z',
  // Greenland
  'M 310 40 L 350 35 L 360 65 L 320 80 Z',
  // Southeast Asia / Maritime
  'M 630 220 L 670 230 L 660 260 L 625 240 Z',
  // Antarctica
  'M 100 460 L 800 460 L 800 480 L 100 480 Z',
];

export const OceanMap: React.FC<OceanMapProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedVariable,
  onSelectVariable,
  compact = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lon: number; val: number; anomaly: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Convert Lon/Lat to map coordinate space (800 x 480 Equirectangular Projection)
  const project = useCallback((lon: number, lat: number): [number, number] => {
    const x = ((lon + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 480;
    return [x, y];
  }, []);

  const unproject = useCallback((x: number, y: number): [number, number] => {
    const lon = (x / 800) * 360 - 180;
    const lat = 90 - (y / 480) * 180;
    return [lon, lat];
  }, []);

  // Compute thermal/bio-optical value for any lat/lon
  const sampleOceanData = useCallback(
    (lon: number, lat: number) => {
      const absLat = Math.abs(lat);
      let val = 0;
      let anomaly = 0;

      if (selectedVariable === 'sst') {
        val = Math.max(0, 29.5 - (absLat / 65) * 27.5);
        if (lon > 75 && lon < 100 && lat > 8 && lat < 24) {
          val += 1.4;
          anomaly = +0.48; // Bay of Bengal warm anomaly
        } else if (lon > -160 && lon < -110 && Math.abs(lat) < 10) {
          anomaly = +0.85; // ENSO Equatorial Pacific
        } else if (lon > -5 && lon < 15 && lat > 35 && lat < 45) {
          val += 1.2;
          anomaly = +0.72; // Mediterranean anomaly
        } else {
          anomaly = Math.sin(lon / 20) * 0.32;
        }
      } else if (selectedVariable === 'chlorophyll') {
        val = 0.08 + Math.pow(absLat / 65, 2) * 0.45;
        if (lon > 80 && lon < 95 && lat > 12 && lat < 23) {
          val = 0.54; // Bay of Bengal post-monsoon runoff
          anomaly = +0.06;
        } else {
          anomaly = Math.sin(lat / 15) * 0.04;
        }
      } else {
        val = Math.sin(lon / 30) * 12 + Math.cos(lat / 25) * 6;
        anomaly = val;
      }

      return {
        val: parseFloat(val.toFixed(2)),
        anomaly: parseFloat(anomaly.toFixed(2)),
      };
    },
    [selectedVariable]
  );

  // High-performance Canvas rendering of ocean gridded cells
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    // Ocean deep gradient background
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 450);
    bgGrad.addColorStop(0, '#0b2447');
    bgGrad.addColorStop(1, '#040d1a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Render cells in Canvas (substantially faster than 500+ SVG DOM nodes)
    const step = compact ? 16 : 8;
    for (let lon = -180; lon < 180; lon += step) {
      for (let lat = -70; lat < 70; lat += step) {
        const [x, y2] = project(lon, lat + step);
        const [x2, y] = project(lon + step, lat);
        const cellW = x2 - x;
        const cellH = y - y2;

        const { val, anomaly } = sampleOceanData(lon + step / 2, lat + step / 2);

        let color = '#0284c7';
        if (selectedVariable === 'sst') {
          const norm = Math.min(1, Math.max(0, val / 31));
          if (norm < 0.25) color = 'rgba(30, 58, 138, 0.75)';
          else if (norm < 0.5) color = 'rgba(2, 132, 199, 0.75)';
          else if (norm < 0.75) color = 'rgba(13, 148, 136, 0.75)';
          else if (norm < 0.88) color = 'rgba(234, 179, 8, 0.8)';
          else color = 'rgba(220, 38, 38, 0.85)';
        } else if (selectedVariable === 'chlorophyll') {
          const norm = Math.min(1, Math.max(0, (val - 0.05) / 0.95));
          if (norm < 0.2) color = 'rgba(15, 23, 42, 0.75)';
          else if (norm < 0.4) color = 'rgba(3, 105, 161, 0.75)';
          else if (norm < 0.7) color = 'rgba(5, 150, 105, 0.75)';
          else color = 'rgba(132, 204, 22, 0.85)';
        } else {
          if (anomaly > 8) color = 'rgba(225, 29, 72, 0.8)';
          else if (anomaly > 3) color = 'rgba(251, 146, 60, 0.75)';
          else if (anomaly > -3) color = 'rgba(248, 250, 252, 0.3)';
          else if (anomaly > -8) color = 'rgba(56, 189, 248, 0.75)';
          else color = 'rgba(37, 99, 235, 0.8)';
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y2, cellW + 0.5, cellH + 0.5);
      }
    }
  }, [selectedVariable, compact, project, sampleOceanData]);

  // Pan and zoom actions
  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(4, Math.max(1, prev + delta)));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Inverse projection considering zoom & pan
      const mapX = (clickX - rect.width / 2 - pan.x) / zoom + 400;
      const mapY = (clickY - rect.height / 2 - pan.y) / zoom + 240;

      if (mapX >= 0 && mapX <= 800 && mapY >= 0 && mapY <= 480) {
        const [lon, lat] = unproject(mapX, mapY);
        const { val, anomaly } = sampleOceanData(lon, lat);
        setMouseCoords({
          lat: parseFloat(lat.toFixed(2)),
          lon: parseFloat(lon.toFixed(2)),
          val,
          anomaly,
        });
      } else {
        setMouseCoords(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full bg-[#071326] rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col select-none">
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Selector & Metadata */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/90 shadow-sm text-xs">
          <Layers className="w-3.5 h-3.5 text-cyan-600" />
          <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Layer:</span>
          {onSelectVariable ? (
            <select
              value={selectedVariable}
              onChange={(e) => onSelectVariable(e.target.value as VariableType)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-cyan-500 outline-none cursor-pointer"
            >
              <option value="sst">Sea Surface Temperature (SST) — Aqua MODIS</option>
              <option value="chlorophyll">Chlorophyll-a (CHL-A) — Aqua MODIS</option>
              <option value="ssh_anomaly">Sea Surface Height Anomaly — SWOT KaRIn</option>
            </select>
          ) : (
            <span className="font-medium text-slate-900">
              {selectedVariable === 'sst'
                ? 'SST (°C)'
                : selectedVariable === 'chlorophyll'
                ? 'Chlorophyll-a (mg/m³)'
                : 'SSH Anomaly (cm)'}
            </span>
          )}
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            NASA-Derived
          </span>
        </div>

        {/* Region Badge & Focus Indicator */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/90 shadow-sm text-xs">
          <Crosshair className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-500">Region:</span>
          <span className="font-bold text-slate-900">{selectedRegion.name}</span>
          {selectedRegion.isFeatured && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-amber-200">
              Featured Case
            </span>
          )}
        </div>
      </div>

      {/* Map Interactive Canvas & SVG Overlay */}
      <div
        ref={containerRef}
        className="w-full flex-1 relative cursor-crosshair overflow-hidden bg-[#071326]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setMouseCoords(null);
        }}
      >
        <div
          className="w-full h-full relative"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* HTML5 Canvas Thermal Grid Layer (High Performance) */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* SVG Vector Overlays: Continents, Grid, Regions */}
          <svg
            viewBox="0 0 800 480"
            className="absolute inset-0 w-full h-full object-cover pointer-events-auto"
          >
            {/* World Continents / Coastlines */}
            <g fill="#1e293b" stroke="#334155" strokeWidth="0.8" opacity="0.95">
              {WORLD_LAND_PATHS.map((p, idx) => (
                <path key={idx} d={p} />
              ))}
            </g>

            {/* Equator & Prime Meridian Grid Lines */}
            <line x1="0" y1="240" x2="800" y2="240" stroke="#475569" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4" />
            <line x1="400" y1="0" x2="400" y2="480" stroke="#475569" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4" />

            {/* Ocean Regions Bounding Boxes & Hotspots */}
            {OCEAN_REGIONS.map((region) => {
              const isSelected = region.id === selectedRegion.id;
              const [xMin, yMax] = project(region.coordinates.lonMin, region.coordinates.latMin);
              const [xMax, yMin] = project(region.coordinates.lonMax, region.coordinates.latMax);
              const boxWidth = Math.abs(xMax - xMin);
              const boxHeight = Math.abs(yMax - yMin);
              const [cx, cy] = project(region.center[0], region.center[1]);

              if (region.id === 'global-ocean') return null;

              return (
                <g
                  key={region.id}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRegion(region);
                  }}
                >
                  {/* Bounding Box Outline */}
                  <rect
                    x={Math.min(xMin, xMax)}
                    y={Math.min(yMin, yMax)}
                    width={boxWidth}
                    height={boxHeight}
                    fill={isSelected ? 'rgba(6, 182, 212, 0.18)' : 'rgba(255, 255, 255, 0.04)'}
                    stroke={isSelected ? '#06b6d4' : '#64748b'}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray={isSelected ? 'none' : '4,3'}
                    rx="4"
                    className="transition-all duration-200 group-hover:stroke-cyan-400 group-hover:fill-cyan-500/10"
                  />

                  {/* Regional Center Anchor Marker */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? '#06b6d4' : '#94a3b8'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-transform group-hover:scale-125"
                  />

                  {/* Region Label Tag */}
                  <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize={isSelected ? 10 : 8.5}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="pointer-events-none select-none drop-shadow"
                  >
                    {region.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Coordinate Inspector Tooltip */}
        {mouseCoords && (
          <div className="absolute bottom-16 left-4 z-20 bg-slate-900/90 text-white backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 shadow-xl text-xs font-mono pointer-events-none">
            <div className="flex items-center justify-between gap-4 text-slate-400 border-b border-slate-800 pb-1 mb-1">
              <span>
                {mouseCoords.lat >= 0 ? `${mouseCoords.lat}°N` : `${Math.abs(mouseCoords.lat)}°S`},{' '}
                {mouseCoords.lon >= 0 ? `${mouseCoords.lon}°E` : `${Math.abs(mouseCoords.lon)}°W`}
              </span>
              <span className="text-[10px] text-cyan-400">4km Pixel</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <span className="text-slate-400">Value:</span>
              <span className="font-semibold text-white">
                {mouseCoords.val}{' '}
                {selectedVariable === 'sst' ? '°C' : selectedVariable === 'chlorophyll' ? 'mg/m³' : 'cm'}
              </span>
              <span className="text-slate-400">Anomaly:</span>
              <span
                className={`font-semibold ${
                  mouseCoords.anomaly > 0 ? 'text-amber-400' : 'text-blue-400'
                }`}
              >
                {mouseCoords.anomaly > 0 ? `+${mouseCoords.anomaly}` : mouseCoords.anomaly}
              </span>
            </div>
          </div>
        )}

        {/* Map Control Buttons */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-md">
          <button
            onClick={() => handleZoom(0.3)}
            title="Zoom In"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.3)}
            title="Zoom Out"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset View"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Color Scale Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-md text-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 mb-1">
            <span>
              {selectedVariable === 'sst'
                ? 'Sea Surface Temperature'
                : selectedVariable === 'chlorophyll'
                ? 'Chlorophyll-a'
                : 'SSH Anomaly'}
            </span>
            <span className="font-mono text-slate-500">
              {selectedVariable === 'sst' ? '°C' : selectedVariable === 'chlorophyll' ? 'mg/m³' : 'cm'}
            </span>
          </div>
          <div
            className="w-48 h-2.5 rounded-sm"
            style={{
              background:
                selectedVariable === 'sst'
                  ? 'linear-gradient(to right, #1e3a8a, #0284c7, #0d9488, #eab308, #dc2626)'
                  : selectedVariable === 'chlorophyll'
                  ? 'linear-gradient(to right, #0f172a, #0369a1, #059669, #84cc16)'
                  : 'linear-gradient(to right, #2563eb, #38bdf8, #f8fafc, #fb923c, #e11d48)',
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            {selectedVariable === 'sst' ? (
              <>
                <span>0°C</span>
                <span>15°C</span>
                <span>32°C</span>
              </>
            ) : selectedVariable === 'chlorophyll' ? (
              <>
                <span>0.05</span>
                <span>0.50</span>
                <span>1.5+</span>
              </>
            ) : (
              <>
                <span>-20 cm</span>
                <span>0</span>
                <span>+20 cm</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
