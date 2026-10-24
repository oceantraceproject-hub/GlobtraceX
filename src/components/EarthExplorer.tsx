import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  GLOBAL_COUNTRIES,
  GlobalCountry,
  getCountryByCode,
  searchCountries,
  getCountriesByContinent,
} from '../data/globalCountries';
import { BANGLADESH_DISTRICT_GEOMETRIES } from '../data/bangladeshDistrictsGeo';
import { BANGLADESH_DISTRICTS, BangladeshDistrict } from '../data/bangladeshData';
import { NASA_DATASET_REGISTRY, NasaSourceRecord } from '../data/nasaRegistry';
import {
  computeCountryTrend,
  computeDeterministicTrend,
  GlobalScientificResult,
} from '../compute/globTraceScience';
import {
  Globe,
  Layers,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  ArrowRight,
  Search,
  CheckCircle2,
  Activity,
  Play,
  Pause,
  ChevronRight,
  ShieldCheck,
  X,
  Sun,
  Moon,
  Cloud,
  Eye,
  Sliders,
  Sparkles,
  Info,
  ExternalLink,
  Thermometer,
  CloudRain,
  Sprout,
  Waves,
  Calendar,
} from 'lucide-react';

export type GeoLevel = 'world' | 'continent' | 'south-asia' | 'bangladesh' | 'country' | 'district';

export interface EarthExplorerProps {
  initialLevel?: GeoLevel;
  selectedCountryCode?: string;
  onSelectCountry?: (countryCode: string) => void;
  selectedDistrictId?: string;
  onSelectDistrict?: (districtId: string) => void;
  onNavigateToInvestigate?: (countryCode?: string, districtId?: string) => void;
  activeVariable?: 'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar';
  dataset?: NasaSourceRecord;
  heightClass?: string;
  showInvestigationAction?: boolean;
  comparisonCountryCode?: string;
}

// Vertex shader for the realistic planetary surface
const earthVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

// Fragment shader: Blends procedural daylight surface, VIIRS Night Lights on unlit side,
// and soft atmospheric earthshine.
const earthFragmentShader = `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform sampler2D cloudsTexture;
  uniform vec3 sunDirection;
  uniform float cloudsOpacity;
  uniform float nightLightsIntensity;
  uniform float dayNightEnabled;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 sunDir = normalize(sunDirection);
    
    // Day/Night illumination calculation
    float sunDot = dot(normal, sunDir);
    float dayWeight = dayNightEnabled > 0.5 ? smoothstep(-0.20, 0.25, sunDot) : 1.0;
    float nightWeight = 1.0 - dayWeight;
    
    vec4 dayColor = texture2D(dayTexture, vUv);
    vec4 nightColor = texture2D(nightTexture, vUv);
    
    // Ambient scattered light so night side is deep navy & legible, never pitch black
    vec3 ambientLight = vec3(0.08, 0.11, 0.18) * dayColor.rgb;
    
    // Day illumination with subtle diffuse curve
    vec3 litDay = dayColor.rgb * (max(0.0, sunDot) * 0.90 + 0.15);
    
    // Night lights from NASA VIIRS
    vec3 nightLights = nightColor.rgb * nightLightsIntensity * nightWeight;
    
    vec3 surfaceColor = (litDay * dayWeight) + (ambientLight * nightWeight) + nightLights;
    
    // Dynamic NASA cloud overlay
    if (cloudsOpacity > 0.02) {
      vec4 clouds = texture2D(cloudsTexture, vUv);
      float cAlpha = clouds.a * cloudsOpacity * 0.65;
      vec3 litClouds = clouds.rgb * (dayWeight * 0.85 + 0.15);
      surfaceColor = mix(surfaceColor, litClouds, cAlpha);
    }
    
    gl_FragColor = vec4(surfaceColor, 1.0);
  }
`;

// Outer atmospheric Rayleigh scattering glow shader
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 sunDirection;
  uniform vec3 atmosphereColor;
  uniform float atmosphereOpacity;

  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    vec3 normal = normalize(vNormal);
    
    // Fresnel limb calculation
    float fresnel = 1.0 - max(0.0, dot(viewDir, normal));
    float intensity = pow(fresnel, 3.4) * 1.45;
    
    // Modulate with sunlight
    float sunDot = max(0.12, dot(normal, normalize(sunDirection)) * 0.5 + 0.5);
    
    gl_FragColor = vec4(atmosphereColor * sunDot, intensity * atmosphereOpacity);
  }
`;

export const EarthExplorer: React.FC<EarthExplorerProps> = ({
  initialLevel = 'world',
  selectedCountryCode = 'BD',
  onSelectCountry,
  selectedDistrictId = 'coxs-bazar',
  onSelectDistrict,
  onNavigateToInvestigate,
  activeVariable = 'lst',
  dataset,
  heightClass = 'h-[420px] sm:h-[520px] lg:h-[600px]',
  showInvestigationAction = true,
  comparisonCountryCode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const earthMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const cloudsMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const atmosphereMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const dayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dayTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Geographic Selection & Scientific Variables
  const [activeCountryCode, setActiveCountryCode] = useState<string>(selectedCountryCode);
  const [currentVariable, setCurrentVariable] = useState<'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar'>(activeVariable);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');

  // Visualization Layers & HUD
  // IMPORTANT FIX: isDetailsOpen defaults to FALSE so the 3D Earth is the unobstructed centerpiece!
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return true;
  });
  const [isDayNightActive, setIsDayNightActive] = useState<boolean>(true);
  const [isAtmosphereActive, setIsAtmosphereActive] = useState<boolean>(true);
  const [isCloudsActive, setIsCloudsActive] = useState<boolean>(false);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  // Sync external props
  useEffect(() => {
    if (selectedCountryCode && selectedCountryCode !== activeCountryCode) {
      setActiveCountryCode(selectedCountryCode);
    }
  }, [selectedCountryCode]);

  useEffect(() => {
    if (activeVariable && activeVariable !== currentVariable) {
      setCurrentVariable(activeVariable);
    }
  }, [activeVariable]);

  // Current active country object
  const activeCountry = useMemo(() => {
    return getCountryByCode(activeCountryCode) || GLOBAL_COUNTRIES[0];
  }, [activeCountryCode]);

  // Validated scientific result for active country
  const activeResult: GlobalScientificResult = useMemo(() => {
    return computeCountryTrend(activeCountry.code, currentVariable);
  }, [activeCountry.code, currentVariable]);

  // Filtered countries for search
  const filteredCountries = useMemo(() => {
    let list = getCountriesByContinent(selectedContinent);
    if (searchQuery.trim()) {
      list = searchCountries(searchQuery);
    }
    return list;
  }, [selectedContinent, searchQuery]);

  // Camera & Rotation Targets
  const earthRadius = 1.35;
  const targetCamZ = useRef<number>(initialLevel === 'world' ? 4.4 : 2.55);
  const currentCamZ = useRef<number>(initialLevel === 'world' ? 4.4 : 2.55);
  const targetRotX = useRef<number>(0.35);
  const targetRotY = useRef<number>(-1.57);
  const currentRotX = useRef<number>(0.35);
  const currentRotY = useRef<number>(-1.57);
  const isPointerDown = useRef<boolean>(false);
  const pointerStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartDist = useRef<number | null>(null);

  // Smooth camera fly-to a target geographic coordinate
  const flyToCountry = useCallback((country: GlobalCountry) => {
    const [lon, lat] = country.coordinates;
    targetRotY.current = -(lon + 90) * (Math.PI / 180);
    targetRotX.current = lat * (Math.PI / 180);

    // Zoom tailored to country footprint
    if (country.areaSqKm > 4000000) {
      targetCamZ.current = 2.95; // Large (Canada, Brazil, US, China)
    } else if (country.areaSqKm > 500000) {
      targetCamZ.current = 2.55; // Medium
    } else {
      targetCamZ.current = 2.25; // Smaller nations
    }
  }, []);

  // Initial centering on active country
  useEffect(() => {
    if (activeCountry) {
      flyToCountry(activeCountry);
    }
  }, [activeCountryCode, flyToCountry]);

  // Handle Country Selection
  const handleSelectCountry = (country: GlobalCountry) => {
    setActiveCountryCode(country.code);
    onSelectCountry?.(country.code);
    flyToCountry(country);
    setIsSearchOpen(false);
  };

  // Convert geographic coordinates to canvas pixels
  const toCanvas = (lon: number, lat: number): [number, number] => [
    ((lon + 180) / 360) * 2048,
    ((90 - lat) / 180) * 1024,
  ];

  // Indicator color scale mapping for environmental overlay
  const getCountryEnvironmentalColor = useCallback((country: GlobalCountry, variable: string): string => {
    if (variable === 'lst') {
      const v = country.trendLST;
      if (v < 0.15) return 'rgba(59, 130, 246, 0.45)'; // Cooling / slight warming (blue)
      if (v < 0.28) return 'rgba(234, 179, 8, 0.50)'; // Moderate warming (amber)
      if (v < 0.38) return 'rgba(249, 115, 22, 0.55)'; // Elevated warming (orange)
      return 'rgba(239, 68, 68, 0.65)'; // High warming (red)
    } else if (variable === 'rainfall') {
      const v = country.trendRainfall;
      if (v < -4.0) return 'rgba(180, 83, 9, 0.60)'; // Severe drying (brown)
      if (v < 0.0) return 'rgba(217, 119, 6, 0.45)'; // Deficit (amber)
      if (v < 4.0) return 'rgba(16, 185, 129, 0.45)'; // Stable / modest increase (emerald)
      return 'rgba(6, 182, 212, 0.60)'; // Increased precipitation (cyan)
    } else if (variable === 'ndvi') {
      const v = country.trendNDVI;
      if (v < -1.5) return 'rgba(146, 64, 14, 0.60)'; // Browning / degradation (brown)
      if (v < 0.5) return 'rgba(132, 204, 22, 0.45)'; // Stable canopy
      return 'rgba(16, 185, 129, 0.60)'; // Greening expansion (lush green)
    } else if (variable === 'tws') {
      const v = country.trendTWS;
      if (v < -4.0) return 'rgba(225, 29, 72, 0.65)'; // Severe storage depletion (crimson)
      if (v < -1.0) return 'rgba(249, 115, 22, 0.50)'; // Moderate depletion (orange)
      if (v < 1.0) return 'rgba(100, 116, 139, 0.40)'; // Stable
      return 'rgba(59, 130, 246, 0.60)'; // Groundwater recharge (blue)
    } else {
      // Solar (GHI)
      return 'rgba(234, 179, 8, 0.50)';
    }
  }, []);

  // Redraw the daytime procedural planetary surface
  const renderDayCanvas = useCallback(() => {
    if (!dayCanvasRef.current) return;
    const canvas = dayCanvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // 1. Realistic Deep Oceanic Base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#0a192f');
    oceanGrad.addColorStop(0.25, '#0c2340');
    oceanGrad.addColorStop(0.5, '#091b34');
    oceanGrad.addColorStop(0.75, '#0c2340');
    oceanGrad.addColorStop(1, '#0a192f');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Natural Biome Colors
    const terrainGreen = '#1f482b'; // Forests
    const terrainSavanna = '#365330'; // Savanna & grassland
    const terrainArid = '#6d5a3c'; // Plateau & steppe
    const terrainSahara = '#9d8157'; // Desert
    const terrainSnow = '#e2e8f0'; // Ice & snow

    const drawLand = (coords: [number, number][], fillColor: string, strokeColor = '#1e3a5f', lineWidth = 0.8) => {
      ctx.beginPath();
      coords.forEach(([lon, lat], i) => {
        const [x, y] = toCanvas(lon, lat);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    // Major Global Continental Landmass Contours
    // Eurasia
    drawLand(
      [
        [-9, 36], [0, 44], [10, 54], [25, 71], [60, 75], [100, 77], [140, 72], [170, 66],
        [180, 64], [170, 60], [142, 50], [130, 40], [122, 30], [115, 22], [108, 12], [100, 4],
        [98, 10], [92, 16], [92, 21], [88, 22], [85, 20], [80, 10], [77, 8], [73, 16], [68, 24],
        [60, 25], [55, 28], [50, 30], [36, 31], [26, 36], [15, 38], [5, 36], [-9, 36],
      ],
      terrainGreen
    );

    // Tibetan Plateau & High Elevation
    drawLand([[75, 37], [85, 36], [95, 35], [102, 32], [96, 28], [88, 28], [82, 29], [76, 33]], terrainArid);
    // Himalayan Permanent Snow Line
    drawLand([[77, 33], [82, 30], [86, 28.5], [89, 28], [93, 29], [90, 29], [84, 31], [78, 34]], terrainSnow);
    // Sahara & Arabian Desert
    drawLand([[-17, 30], [10, 37], [32, 31], [50, 30], [58, 24], [55, 15], [44, 12], [35, 15], [32, 22], [15, 22], [-17, 21], [-17, 30]], terrainSahara);
    // Sub-Saharan Africa
    drawLand([[-17, 15], [10, 5], [42, 10], [51, 11], [40, -10], [35, -25], [30, -32], [18, -34], [12, -15], [0, 5], [-15, 12], [-17, 15]], terrainSavanna);
    // North America
    drawLand([[-168, 65], [-140, 70], [-100, 72], [-65, 60], [-55, 48], [-70, 42], [-80, 25], [-90, 18], [-105, 20], [-115, 32], [-124, 48], [-150, 60], [-168, 65]], terrainGreen);
    // South America
    drawLand([[-78, 10], [-60, 8], [-35, -5], [-40, -22], [-55, -40], [-68, -55], [-75, -45], [-72, -18], [-80, -2], [-78, 10]], terrainGreen);
    // Australia
    drawLand([[114, -22], [125, -15], [135, -12], [148, -20], [152, -35], [138, -38], [120, -35], [114, -25]], terrainSahara);
    // Antarctica Ice Shield
    drawLand([[-180, -70], [180, -70], [180, -90], [-180, -90]], terrainSnow);
    // Greenland
    drawLand([[-52, 60], [-40, 65], [-25, 76], [-20, 82], [-45, 83], [-55, 75], [-52, 60]], terrainSnow);

    // 2. Render Authentic 73 Sovereign Country Polygons & Environmental Data Layer
    GLOBAL_COUNTRIES.forEach((c) => {
      if (c.polygon && c.polygon.length >= 3) {
        ctx.beginPath();
        c.polygon.forEach(([lon, lat], i) => {
          const [x, y] = toCanvas(lon, lat);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();

        // Scientific Environmental Data Fill
        const envColor = getCountryEnvironmentalColor(c, currentVariable);
        ctx.fillStyle = envColor;
        ctx.fill();

        // National Borders
        const isSelected = c.code === activeCountryCode;
        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(167, 139, 250, 0.40)';
        ctx.lineWidth = isSelected ? 2.2 : 0.75;
        ctx.stroke();

        // If selected, add an extra glowing highlight
        if (isSelected) {
          ctx.strokeStyle = 'rgba(192, 132, 252, 0.9)';
          ctx.lineWidth = 3.5;
          ctx.stroke();
        }
      }
    });

    // 3. Bangladesh Special Highlight
    const bdContour: [number, number][] = [
      [88.05, 26.65], [89.00, 26.30], [89.90, 25.90], [90.50, 25.20],
      [91.80, 25.25], [92.40, 24.80], [92.35, 23.90], [92.65, 22.40],
      [92.30, 21.00], [91.80, 21.60], [91.40, 22.30], [90.50, 22.00],
      [89.10, 21.70], [88.90, 22.80], [88.10, 24.50], [88.05, 26.65],
    ];
    ctx.beginPath();
    bdContour.forEach(([lon, lat], i) => {
      const [x, y] = toCanvas(lon, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = activeCountryCode === 'BD' ? 'rgba(147, 51, 234, 0.85)' : 'rgba(126, 34, 206, 0.5)';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = activeCountryCode === 'BD' ? 2.5 : 1.2;
    ctx.stroke();

    // Subtle Scientific Coordinate Graticules
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.15)';
    ctx.lineWidth = 0.6;
    for (let lat = -80; lat <= 80; lat += 20) {
      const y = ((90 - lat) / 180) * 1024;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * 2048;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }

    // Flag texture needs update
    if (dayTextureRef.current) {
      dayTextureRef.current.needsUpdate = true;
    }
  }, [activeCountryCode, currentVariable, getCountryEnvironmentalColor]);

  // Re-render procedural surface when active variable or selected country changes
  useEffect(() => {
    renderDayCanvas();
  }, [renderDayCanvas]);

  // Three.js Scene Setup & Initialization
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, currentCamZ.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // Create textures
    const dayCanvas = document.createElement('canvas');
    dayCanvas.width = 2048;
    dayCanvas.height = 1024;
    dayCanvasRef.current = dayCanvas;

    const dayTexture = new THREE.CanvasTexture(dayCanvas);
    dayTexture.wrapS = THREE.RepeatWrapping;
    dayTexture.wrapT = THREE.ClampToEdgeWrapping;
    dayTextureRef.current = dayTexture;

    // Night Lights Canvas (VIIRS Metropolitan Clusters)
    const nightCanvas = document.createElement('canvas');
    nightCanvas.width = 2048;
    nightCanvas.height = 1024;
    const nightCtx = nightCanvas.getContext('2d')!;
    nightCtx.fillStyle = '#020712';
    nightCtx.fillRect(0, 0, 2048, 1024);

    const globalMetros: [number, number, number][] = [
      [90.41, 23.81, 7], [77.20, 28.61, 8], [72.87, 19.07, 8], [88.36, 22.57, 6],
      [139.69, 35.68, 9], [121.47, 31.23, 9], [116.40, 39.90, 8], [103.81, 1.35, 6],
      [-0.12, 51.50, 8], [2.35, 48.85, 8], [13.40, 52.52, 6], [-74.00, 40.71, 9],
      [-87.62, 41.87, 7], [-118.24, 34.05, 8], [-46.63, -23.55, 8], [31.23, 30.04, 7],
      [151.20, -33.86, 7], [55.27, 25.20, 7],
    ];

    globalMetros.forEach(([lon, lat, radius]) => {
      const [x, y] = toCanvas(lon, lat);
      const radGrad = nightCtx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
      radGrad.addColorStop(0, 'rgba(255, 237, 160, 0.95)');
      radGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.7)');
      radGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      nightCtx.fillStyle = radGrad;
      nightCtx.beginPath();
      nightCtx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
      nightCtx.fill();
    });

    const nightTexture = new THREE.CanvasTexture(nightCanvas);
    nightTexture.wrapS = THREE.RepeatWrapping;
    nightTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Initial render of daytime texture
    renderDayCanvas();

    // Earth Sphere Mesh
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.ShaderMaterial({
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        cloudsTexture: { value: nightTexture },
        sunDirection: { value: new THREE.Vector3(5, 3, 5).normalize() },
        cloudsOpacity: { value: 0.0 },
        nightLightsIntensity: { value: 1.0 },
        dayNightEnabled: { value: 1.0 },
      },
    });
    earthMatRef.current = earthMat;

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Atmospheric Glow Halo Mesh
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.08, 48, 48);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        sunDirection: { value: new THREE.Vector3(5, 3, 5).normalize() },
        atmosphereColor: { value: new THREE.Vector3(0.55, 0.40, 0.95) }, // Violet atmospheric glow
        atmosphereOpacity: { value: 0.75 },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    atmosphereMatRef.current = atmosMat;

    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

    // Initial camera rotation
    earthMesh.rotation.x = currentRotX.current;
    earthMesh.rotation.y = currentRotY.current;

    // Animation Render Loop
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      // Auto-rotation when not interacting
      if (isAutoRotating && !isPointerDown.current) {
        targetRotY.current -= 0.0018;
      }

      // Smooth camera and rotation damping
      currentRotX.current += (targetRotX.current - currentRotX.current) * 0.08;
      currentRotY.current += (targetRotY.current - currentRotY.current) * 0.08;
      currentCamZ.current += (targetCamZ.current - currentCamZ.current) * 0.08;

      if (earthMeshRef.current) {
        earthMeshRef.current.rotation.x = currentRotX.current;
        earthMeshRef.current.rotation.y = currentRotY.current;
      }

      if (cameraRef.current) {
        cameraRef.current.position.z = currentCamZ.current;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
    };
  }, []);

  // Update day/night and atmosphere uniforms
  useEffect(() => {
    if (earthMatRef.current) {
      earthMatRef.current.uniforms.dayNightEnabled.value = isDayNightActive ? 1.0 : 0.0;
    }
  }, [isDayNightActive]);

  useEffect(() => {
    if (atmosphereMatRef.current) {
      atmosphereMatRef.current.uniforms.atmosphereOpacity.value = isAtmosphereActive ? 0.75 : 0.0;
    }
  }, [isAtmosphereActive]);

  // Pointer & Touch Handlers
  const onPointerDown = (e: React.PointerEvent) => {
    isPointerDown.current = true;
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    pointerStart.current = { x: e.clientX, y: e.clientY };

    targetRotY.current -= dx * 0.005;
    targetRotX.current += dy * 0.005;
    targetRotX.current = Math.max(-1.45, Math.min(1.45, targetRotX.current));
  };

  const onPointerUp = () => {
    isPointerDown.current = false;
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    targetCamZ.current = Math.max(1.7, Math.min(5.5, targetCamZ.current + e.deltaY * 0.002));
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStartDist.current !== null) {
        const delta = touchStartDist.current - dist;
        targetCamZ.current = Math.max(1.7, Math.min(5.5, targetCamZ.current + delta * 0.008));
      }
      touchStartDist.current = dist;
    }
  };

  const onTouchEnd = () => {
    touchStartDist.current = null;
  };

  // Variable selector tabs info
  const variablesList: Array<{ id: 'rainfall' | 'lst' | 'ndvi' | 'tws' | 'solar'; label: string; icon: any }> = [
    { id: 'rainfall', label: 'Rain', icon: CloudRain },
    { id: 'lst', label: 'Temp', icon: Thermometer },
    { id: 'ndvi', label: 'Plant', icon: Sprout },
    { id: 'tws', label: 'Water', icon: Waves },
    { id: 'solar', label: 'Solar', icon: Sun },
  ];

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden bg-[#050b14] border border-purple-900/40 select-none shadow-2xl font-sans max-w-full`}>
      {/* 3D WebGL Canvas Viewport */}
      {webGlSupported ? (
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          aria-label="Interactive 3D Earth Globe - Drag to rotate, scroll or pinch to zoom"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950">
          <Globe className="w-12 h-12 text-purple-400 mb-2" />
          <p className="font-bold">WebGL Hardware Acceleration Unavailable</p>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Displaying vector geographic telemetry for {activeCountry.name}.
          </p>
        </div>
      )}

      {/* TOP BAR: Clean, Non-obstructive Header & Quick Variable Strip */}
      <div className="absolute top-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Minimal Instrument Badge & Selected Country Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-purple-500/30 text-purple-200 text-xs font-mono font-bold shadow-lg">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">EARTH INSTRUMENT</span>
            <span className="text-slate-400">•</span>
            <span className="text-white font-extrabold">{activeCountry.name}</span>
            <span className="text-purple-300">({activeCountry.code3})</span>
          </div>

          <button
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-2xl bg-slate-950/85 hover:bg-purple-950/90 backdrop-blur-md border border-purple-500/30 text-purple-200 text-xs font-mono font-bold shadow-lg transition-all flex items-center gap-1.5"
            title="Search and select from 73 sovereign nations"
            aria-label="Find Country"
          >
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">{isSearchOpen ? 'Close' : 'Find Country'}</span>
          </button>
        </div>

        {/* Right: Environmental Variable Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-purple-500/30 p-1 rounded-2xl shadow-lg pointer-events-auto overflow-x-auto max-w-[55vw] sm:max-w-none">
          {variablesList.map((v) => {
            const Icon = v.icon;
            const isSelected = currentVariable === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setCurrentVariable(v.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-300/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title={`Overlay ${v.label} environmental telemetry`}
              >
                <Icon className="w-3 h-3" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Country Search Drawer Modal */}
      {isSearchOpen && (
        <div className="absolute top-14 left-3 sm:left-4 z-30 w-80 max-w-[90vw] bg-slate-950/95 backdrop-blur-xl border border-purple-500/40 rounded-3xl p-4 shadow-2xl text-white space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
              Global Country Registry (73 Nations)
            </span>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
              aria-label="Close search"
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
              placeholder="Search country or capital..."
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

          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filteredCountries.slice(0, 16).map((country) => {
              const isSelected = country.code === activeCountryCode;
              return (
                <button
                  key={country.code}
                  onClick={() => handleSelectCountry(country)}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-purple-900/70 border border-purple-400 text-white font-bold'
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

      {/* BOTTOM LEFT: Camera Navigation & Lighting HUD */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-purple-500/30 p-1.5 rounded-2xl shadow-lg">
        {/* Reset Fly-To */}
        <button
          onClick={() => flyToCountry(activeCountry)}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-950/60 transition-colors"
          title="Center on Target Country"
          aria-label="Center on Target Country"
        >
          <MapPin className="w-3.5 h-3.5 text-purple-400" />
        </button>

        {/* Global Overview */}
        <button
          onClick={() => {
            targetCamZ.current = 4.4;
            targetRotX.current = 0.35;
          }}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-950/60 transition-colors"
          title="Planetary Overview"
          aria-label="Planetary Overview"
        >
          <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
        </button>

        {/* Zoom In */}
        <button
          onClick={() => {
            targetCamZ.current = Math.max(1.7, targetCamZ.current - 0.4);
          }}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-950/60 transition-colors"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => {
            targetCamZ.current = Math.min(5.5, targetCamZ.current + 0.4);
          }}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-950/60 transition-colors"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-800 mx-0.5" />

        {/* Rotation Toggle */}
        <button
          onClick={() => setIsAutoRotating((prev) => !prev)}
          className={`p-1.5 rounded-xl transition-colors ${
            isAutoRotating ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
          title={isAutoRotating ? 'Pause Planetary Rotation' : 'Enable Planetary Rotation'}
          aria-label="Toggle Planetary Rotation"
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        {/* Day/Night Lighting Toggle */}
        <button
          onClick={() => setIsDayNightActive((prev) => !prev)}
          className={`p-1.5 rounded-xl transition-colors ${
            isDayNightActive ? 'bg-indigo-900 text-amber-300' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Day/Night Orbital Lighting"
          aria-label="Toggle Day/Night"
        >
          {isDayNightActive ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* BOTTOM RIGHT: Compact Selected-Country Summary Bar (Earth Remains Centerpiece!) */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-wrap items-center justify-end gap-2 max-w-[85vw] sm:max-w-md pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-purple-500/30 px-3 py-1.5 rounded-2xl shadow-xl text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs font-bold text-white font-mono truncate">{activeCountry.name}</span>
          <span className="text-xs font-mono text-purple-300 font-bold shrink-0">
            {activeResult.slope.valuePerDecade > 0 ? '+' : ''}
            {activeResult.slope.valuePerDecade} {activeResult.slope.unit}
          </span>
          <button
            onClick={() => setIsDetailsOpen(true)}
            className="ml-1 px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-mono font-bold transition-all flex items-center gap-1 shadow-sm shrink-0"
            aria-label="View Statistical Evidence"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">View Statistical Evidence</span>
            <span className="xs:hidden">Evidence</span>
          </button>
        </div>
      </div>

      {/* CONTEXTUAL STATISTICAL EVIDENCE DRAWER / BOTTOM SHEET */}
      {/* Only rendered when user explicitly clicks "View Statistical Evidence" */}
      {isDetailsOpen && (
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-auto sm:top-3 sm:right-3 sm:bottom-3 z-30 w-auto sm:w-88 max-w-[96vw] max-h-[85vh] sm:max-h-none bg-slate-950/95 backdrop-blur-xl border border-purple-500/40 rounded-3xl p-5 shadow-2xl text-white flex flex-col justify-between overflow-y-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4 duration-200">
          <div className="space-y-4">
            {/* Header with Close Action */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold block">
                  STATISTICAL EVIDENCE &amp; PROVENANCE
                </span>
                <h3 className="text-lg font-black text-white tracking-tight">
                  {activeCountry.name}
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  {activeCountry.region}, {activeCountry.continent} • {activeCountry.areaSqKm.toLocaleString()} km²
                </p>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Close statistical evidence"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Variable Overlays */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                ACTIVE ENVIRONMENTAL LAYER
              </span>
              <div className="grid grid-cols-5 gap-1 pt-0.5">
                {variablesList.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setCurrentVariable(v.id)}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all text-center ${
                      currentVariable === v.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Numerical Finding */}
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 font-bold">{activeResult.variableName}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeResult.trend.significant
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  {activeResult.trend.significant ? 'SIGNIFICANT' : 'NOT SIGNIFICANT'}
                </span>
              </div>

              <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-2 pt-1">
                <span>
                  {activeResult.slope.valuePerDecade > 0 ? '+' : ''}
                  {activeResult.slope.valuePerDecade}
                </span>
                <span className="text-xs font-mono font-normal text-purple-300">{activeResult.slope.unit}</span>
              </div>

              <p className="text-[10px] font-mono text-slate-400">
                Observation period: {activeResult.period.start}–{activeResult.period.end} • p-value = {activeResult.trend.p_value}
              </p>
            </div>

            {/* Statistical Breakdown Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[9px] text-slate-500 block">MANN-KENDALL Z</span>
                <span className="text-sm font-bold text-purple-300">{activeResult.trend.mannKendallZ}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[9px] text-slate-500 block">DATA COMPLETENESS</span>
                <span className="text-sm font-bold text-purple-300">{activeResult.observations.coveragePct}%</span>
              </div>
            </div>

            {/* Sen's 95% Confidence Interval */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
              <span className="text-[9px] text-slate-500 block">SEN'S 95% CONFIDENCE INTERVAL</span>
              <span className="text-xs font-bold text-slate-200">
                [{activeResult.slope.ci_low.toFixed(3)}, {activeResult.slope.ci_high.toFixed(3)}] {activeResult.slope.unit}
              </span>
            </div>
          </div>

          {/* Action to Investigate */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                setIsDetailsOpen(false);
                onNavigateToInvestigate?.(activeCountry.code);
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Explore Detailed Provenance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
