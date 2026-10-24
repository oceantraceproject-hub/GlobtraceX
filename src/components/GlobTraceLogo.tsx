import React from 'react';

interface GlobTraceLogoProps {
  variant?: 'full' | 'compact' | 'symbol';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GlobTraceLogo: React.FC<GlobTraceLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
}) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;

  // The symbol: A crisp realistic/minimal spherical Earth with land contours,
  // overlaid by an elliptical orbital trajectory line and an active observing satellite with beam
  const Symbol = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-xs"
    >
      <defs>
        {/* Deep space/ocean gradient */}
        <radialGradient id="gtxEarthGrad" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="45%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>

        {/* Orbit track gradient */}
        <linearGradient id="gtxOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
        </linearGradient>

        {/* Atmosphere outer halo */}
        <radialGradient id="gtxHaloGrad" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#a855f7" stopOpacity="0" />
          <stop offset="92%" stopColor="#c084fc" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.75" />
        </radialGradient>
      </defs>

      {/* Atmospheric Rayleigh glow */}
      <circle cx="24" cy="24" r="19.5" fill="url(#gtxHaloGrad)" />

      {/* Earth Sphere Base */}
      <circle cx="24" cy="24" r="17" fill="url(#gtxEarthGrad)" stroke="#6366f1" strokeWidth="0.8" />

      {/* Earth Landmass silhouettes (stylized scientific contours) */}
      <g opacity="0.85">
        {/* Eurasia & South Asia */}
        <path
          d="M 21 13 C 24 12, 29 13, 31 16 C 33 19, 31 23, 28 24 C 26 25, 27 28, 25 29 C 23 28, 23 25, 20 23 C 18 22, 18 17, 21 13 Z"
          fill="#34d399"
          opacity="0.9"
        />
        {/* Africa contour */}
        <path
          d="M 17 19 C 19 20, 20 23, 21 26 C 20 30, 18 33, 16 34 C 14 32, 13 28, 14 24 C 14 21, 16 19, 17 19 Z"
          fill="#10b981"
          opacity="0.85"
        />
        {/* Polar ice cap */}
        <path
          d="M 20 8 C 23 7.5, 26 7.5, 28 8 C 27 9, 23 9.5, 20 8 Z"
          fill="#ffffff"
          opacity="0.9"
        />
      </g>

      {/* Latitude / Longitude Graticule grid arcs */}
      <ellipse cx="24" cy="24" rx="17" ry="6" fill="none" stroke="#a78bfa" strokeWidth="0.6" strokeDasharray="1.5 1.5" opacity="0.45" />
      <path d="M 24 7 C 29 13, 29 35, 24 41" fill="none" stroke="#a78bfa" strokeWidth="0.6" strokeDasharray="1.5 1.5" opacity="0.4" />

      {/* Elliptical Satellite Tracking Orbit Arc (Tilted ~35 deg) */}
      <g transform="rotate(-30 24 24)">
        {/* Main tracking trajectory */}
        <ellipse
          cx="24"
          cy="24"
          rx="21.5"
          ry="8.5"
          fill="none"
          stroke="url(#gtxOrbitGrad)"
          strokeWidth="1.6"
        />

        {/* Orbit pulsing dashes */}
        <ellipse
          cx="24"
          cy="24"
          rx="21.5"
          ry="8.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeDasharray="4 8"
          opacity="0.8"
        />

        {/* Active Satellite Model at Apogee */}
        <g transform="translate(44, 24)">
          {/* Sensor footprint cone beam down towards Earth */}
          <path d="M 0 0 L -8 -3 L -8 3 Z" fill="#c084fc" opacity="0.45" />

          {/* Satellite Central Body */}
          <rect x="-2.5" y="-2" width="5" height="4" rx="1" fill="#f8fafc" stroke="#4c1d95" strokeWidth="0.6" />

          {/* Solar Panel Wings */}
          <rect x="-1.5" y="-5.5" width="3" height="3" rx="0.5" fill="#38bdf8" stroke="#1e1b4b" strokeWidth="0.4" />
          <rect x="-1.5" y="2.5" width="3" height="3" rx="0.5" fill="#38bdf8" stroke="#1e1b4b" strokeWidth="0.4" />

          {/* Telemetry Signal Beacon */}
          <circle cx="2" cy="0" r="1.2" fill="#a855f7" />
          <circle cx="2" cy="0" r="2.5" fill="none" stroke="#e879f9" strokeWidth="0.5" opacity="0.8" />
        </g>
      </g>
    </svg>
  );

  if (variant === 'symbol') {
    return <div className={`inline-flex items-center ${className}`}>{Symbol}</div>;
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {Symbol}
        <span className="font-bold text-base tracking-tight text-slate-900">
          GLOB<span className="text-purple-600">TRACE</span>X
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {Symbol}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-black text-lg tracking-tight text-slate-950">
            GLOB<span className="text-purple-600">TRACE</span>
            <span className="text-purple-800">X</span>
          </span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
            NASA 2026
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-1">
          Earth-System Trend Detective
        </span>
      </div>
    </div>
  );
};
