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

// Procedural Planetary Surface Generation (No external textures or photos)


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

// Fragment shader: Blends NASA Blue Marble daylight satellite photography,
// authentic NASA VIIRS Night Lights on the unlit side, and soft atmospheric earthshine.
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
  heightClass = 'h-[500px] sm:h-[580px] lg:h-[640px]',
  showInvestigationAction = true,
  comparisonCountryCode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const boundariesGroupRef = useRef<THREE.Group | null>(null);
  const highlightGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const earthShaderMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Geographic Selection & Interaction State
  const [activeCountryCode, setActiveCountryCode] = useState<string>(selectedCountryCode);
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [hoveredCountry, setHoveredCountry] = useState<GlobalCountry | null>(null);
  const [currentVariable, setCurrentVariable] = useState<'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar'>(activeVariable);
  
  // Visual Mode Controls
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [isDayNightActive, setIsDayNightActive] = useState<boolean>(true);
  const [isAtmosphereActive, setIsAtmosphereActive] = useState<boolean>(true);
  const [isCloudsActive, setIsCloudsActive] = useState<boolean>(false);
  const [isImageryLoading, setIsImageryLoading] = useState<boolean>(true);
  const [imagerySourceLabel, setImagerySourceLabel] = useState<string>('NASA GIBS Blue Marble');
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(true);

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

  // Comparison country object (if in compare mode)
  const comparisonCountry = useMemo(() => {
    if (!comparisonCountryCode) return null;
    return getCountryByCode(comparisonCountryCode) || null;
  }, [comparisonCountryCode]);

  // Validated GlobTraceX scientific result for active country
  const activeResult: GlobalScientificResult = useMemo(() => {
    return computeCountryTrend(activeCountry.code, currentVariable);
  }, [activeCountry.code, currentVariable]);

  // Validated GlobTraceX scientific result for comparison country
  const comparisonResult: GlobalScientificResult | null = useMemo(() => {
    if (!comparisonCountry) return null;
    return computeCountryTrend(comparisonCountry.code, currentVariable);
  }, [comparisonCountry, currentVariable]);

  // Filtered countries for search
  const filteredCountries = useMemo(() => {
    let list = getCountriesByContinent(selectedContinent);
    if (searchQuery.trim()) {
      list = searchCountries(searchQuery);
    }
    return list;
  }, [selectedContinent, searchQuery]);

  // Camera Navigation Interpolation Targets
  const earthRadius = 1.35;
  const targetCamZ = useRef<number>(initialLevel === 'world' ? 4.6 : 2.5);
  const currentCamZ = useRef<number>(initialLevel === 'world' ? 4.6 : 2.5);
  const targetRotX = useRef<number>(0.35);
  const targetRotY = useRef<number>(-1.57);
  const currentRotX = useRef<number>(0.35);
  const currentRotY = useRef<number>(-1.57);
  const isPointerDown = useRef<boolean>(false);
  const pointerStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerDelta = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartDist = useRef<number | null>(null);

  // Convert geographic [lon, lat] to 3D Cartesian coordinates on sphere
  const latLonToVector3 = useCallback((lon: number, lat: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

  // Smooth camera fly-to a target geographic coordinate
  const flyToCountry = useCallback((country: GlobalCountry) => {
    const [lon, lat] = country.coordinates;
    targetRotY.current = -(lon + 90) * (Math.PI / 180);
    targetRotX.current = lat * (Math.PI / 180);

    // Zoom level tailored to country geographic footprint
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

  // Build the High-Resolution Procedural Planetary Surface (No external image downloads)
  const loadNasaTextures = useCallback(() => {
    const dayCanvas = document.createElement('canvas');
    dayCanvas.width = 2048;
    dayCanvas.height = 1024;
    const dayCtx = dayCanvas.getContext('2d')!;

    const nightCanvas = document.createElement('canvas');
    nightCanvas.width = 2048;
    nightCanvas.height = 1024;
    const nightCtx = nightCanvas.getContext('2d')!;

    const cloudsCanvas = document.createElement('canvas');
    cloudsCanvas.width = 2048;
    cloudsCanvas.height = 1024;
    const cloudsCtx = cloudsCanvas.getContext('2d')!;

    // 1. Procedural Deep Ocean Base with realistic bathymetry
    const oceanGrad = dayCtx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#0a192f'); // Arctic / Polar deeps
    oceanGrad.addColorStop(0.25, '#0c2340'); // Northern temperate
    oceanGrad.addColorStop(0.5, '#091b34'); // Equatorial oceanic trench
    oceanGrad.addColorStop(0.75, '#0c2340'); // Southern temperate
    oceanGrad.addColorStop(1, '#0a192f'); // Antarctic deeps
    dayCtx.fillStyle = oceanGrad;
    dayCtx.fillRect(0, 0, 2048, 1024);

    // Deep space dark ocean on night canvas
    nightCtx.fillStyle = '#020712';
    nightCtx.fillRect(0, 0, 2048, 1024);

    // Equirectangular projection mapping helper
    const toCanvas = (lon: number, lat: number): [number, number] => [
      ((lon + 180) / 360) * 2048,
      ((90 - lat) / 180) * 1024,
    ];

    // Helper to draw filled landmasses with natural biome pigmentation
    const drawLandmass = (coords: [number, number][], fillColor: string, strokeColor = '#1e3a5f', lineWidth = 1.0) => {
      dayCtx.beginPath();
      coords.forEach(([lon, lat], i) => {
        const [x, y] = toCanvas(lon, lat);
        if (i === 0) dayCtx.moveTo(x, y);
        else dayCtx.lineTo(x, y);
      });
      dayCtx.closePath();
      dayCtx.fillStyle = fillColor;
      dayCtx.fill();
      dayCtx.strokeStyle = strokeColor;
      dayCtx.lineWidth = lineWidth;
      dayCtx.stroke();
    };

    // Realistic natural terrain pigmentation
    const terrainGreen = '#2d5a37'; // Tropical and temperate forests
    const terrainSavanna = '#44663e'; // Grassland and savanna
    const terrainArid = '#8d734c'; // Steppe and plateau
    const terrainSahara = '#b8996b'; // Desert belt
    const terrainSnow = '#e2e8f0'; // Polar ice and glaciers

    // Eurasia & South Asia Landmass
    drawLandmass(
      [
        [-9, 36], [0, 44], [10, 54], [25, 71], [60, 75], [100, 77], [140, 72], [170, 66],
        [180, 64], [170, 60], [142, 50], [130, 40], [122, 30], [115, 22], [108, 12], [100, 4],
        [98, 10], [92, 16], [92, 21], [88, 22], [85, 20], [80, 10], [77, 8], [73, 16], [68, 24],
        [60, 25], [55, 28], [50, 30], [36, 31], [26, 36], [15, 38], [5, 36], [-9, 36],
      ],
      terrainGreen
    );

    // Tibetan Plateau / Himalaya Elevation
    drawLandmass(
      [
        [75, 37], [85, 36], [95, 35], [102, 32], [96, 28], [88, 28], [82, 29], [76, 33],
      ],
      terrainArid
    );

    // Himalayan Permanent Snow Cap
    drawLandmass(
      [
        [77, 33], [82, 30], [86, 28.5], [89, 28], [93, 29], [90, 29], [84, 31], [78, 34],
      ],
      terrainSnow
    );

    // Sahara & Arabian Desert Belt
    drawLandmass(
      [
        [-17, 30], [10, 37], [32, 31], [50, 30], [58, 24], [55, 15], [44, 12], [35, 15],
        [32, 22], [15, 22], [-17, 21], [-17, 30],
      ],
      terrainSahara
    );

    // Sub-Saharan Africa
    drawLandmass(
      [
        [-17, 15], [10, 5], [42, 10], [51, 11], [40, -10], [35, -25], [30, -32], [18, -34],
        [12, -15], [0, 5], [-15, 12], [-17, 15],
      ],
      terrainSavanna
    );

    // North America
    drawLandmass(
      [
        [-168, 65], [-140, 70], [-100, 72], [-65, 60], [-55, 48], [-70, 42], [-80, 25],
        [-90, 18], [-105, 20], [-115, 32], [-124, 48], [-150, 60], [-168, 65],
      ],
      terrainGreen
    );

    // South America
    drawLandmass(
      [
        [-78, 10], [-60, 8], [-35, -5], [-40, -22], [-55, -40], [-68, -55], [-75, -45],
        [-72, -18], [-80, -2], [-78, 10],
      ],
      terrainGreen
    );

    // Australia
    drawLandmass(
      [
        [114, -22], [125, -15], [135, -12], [148, -20], [152, -35], [138, -38], [120, -35], [114, -25],
      ],
      terrainSahara
    );

    // Antarctica Ice Shield
    drawLandmass(
      [
        [-180, -70], [180, -70], [180, -90], [-180, -90],
      ],
      terrainSnow
    );

    // Greenland Ice Sheet
    drawLandmass(
      [
        [-52, 60], [-40, 65], [-25, 76], [-20, 82], [-45, 83], [-55, 75], [-52, 60],
      ],
      terrainSnow
    );

    // Render detailed polygons from 73 sovereign nations on day canvas
    GLOBAL_COUNTRIES.forEach((c) => {
      if (c.polygon && c.polygon.length >= 3) {
        dayCtx.beginPath();
        c.polygon.forEach(([lon, lat], i) => {
          const [x, y] = toCanvas(lon, lat);
          if (i === 0) dayCtx.moveTo(x, y);
          else dayCtx.lineTo(x, y);
        });
        dayCtx.closePath();
        dayCtx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        dayCtx.fill();
        dayCtx.strokeStyle = 'rgba(167, 139, 250, 0.25)';
        dayCtx.lineWidth = 0.8;
        dayCtx.stroke();
      }
    });

    // Bangladesh Special Highlight on Daytime Surface
    const bdContour: [number, number][] = [
      [88.05, 26.65], [89.00, 26.30], [89.90, 25.90], [90.50, 25.20],
      [91.80, 25.25], [92.40, 24.80], [92.35, 23.90], [92.65, 22.40],
      [92.30, 21.00], [91.80, 21.60], [91.40, 22.30], [90.50, 22.00],
      [89.10, 21.70], [88.90, 22.80], [88.10, 24.50], [88.05, 26.65],
    ];
    dayCtx.beginPath();
    bdContour.forEach(([lon, lat], i) => {
      const [x, y] = toCanvas(lon, lat);
      if (i === 0) dayCtx.moveTo(x, y);
      else dayCtx.lineTo(x, y);
    });
    dayCtx.closePath();
    dayCtx.fillStyle = '#7c3aed';
    dayCtx.fill();
    dayCtx.strokeStyle = '#ffffff';
    dayCtx.lineWidth = 1.8;
    dayCtx.stroke();

    // Subtle Scientific Coordinate Graticules
    dayCtx.strokeStyle = 'rgba(192, 132, 252, 0.18)';
    dayCtx.lineWidth = 0.75;
    for (let lat = -80; lat <= 80; lat += 20) {
      const y = ((90 - lat) / 180) * 1024;
      dayCtx.beginPath();
      dayCtx.moveTo(0, y);
      dayCtx.lineTo(2048, y);
      dayCtx.stroke();
    }
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * 2048;
      dayCtx.beginPath();
      dayCtx.moveTo(x, 0);
      dayCtx.lineTo(x, 1024);
      dayCtx.stroke();
    }

    // Tropic of Cancer (23.44°N) directly intersecting Bangladesh
    dayCtx.strokeStyle = 'rgba(232, 121, 249, 0.55)';
    dayCtx.lineWidth = 1.2;
    const yTropic = ((90 - 23.436) / 180) * 1024;
    dayCtx.beginPath();
    dayCtx.moveTo(0, yTropic);
    dayCtx.lineTo(2048, yTropic);
    dayCtx.stroke();

    // 2. Procedural Night Lights across Global Metropolitan Clusters
    const globalMetros: [number, number, number][] = [
      [90.41, 23.81, 7], // Dhaka
      [77.20, 28.61, 8], // Delhi
      [72.87, 19.07, 8], // Mumbai
      [88.36, 22.57, 6], // Kolkata
      [139.69, 35.68, 9], // Tokyo
      [121.47, 31.23, 9], // Shanghai
      [116.40, 39.90, 8], // Beijing
      [103.81, 1.35, 6], // Singapore
      [100.50, 13.75, 6], // Bangkok
      [-0.12, 51.50, 8], // London
      [2.35, 48.85, 8], // Paris
      [13.40, 52.52, 6], // Berlin
      [-74.00, 40.71, 9], // New York City
      [-87.62, 41.87, 7], // Chicago
      [-118.24, 34.05, 8], // Los Angeles
      [-99.13, 19.43, 7], // Mexico City
      [-46.63, -23.55, 8], // São Paulo
      [-58.38, -34.60, 6], // Buenos Aires
      [31.23, 30.04, 7], // Cairo
      [3.37, 6.52, 6], // Lagos
      [28.04, -26.20, 6], // Johannesburg
      [151.20, -33.86, 7], // Sydney
      [144.96, -37.81, 6], // Melbourne
      [55.27, 25.20, 7], // Dubai
      [46.71, 24.71, 6], // Riyadh
      [37.61, 55.75, 7], // Moscow
    ];

    globalMetros.forEach(([lon, lat, radius]) => {
      const [x, y] = toCanvas(lon, lat);
      const radGrad = nightCtx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
      radGrad.addColorStop(0, 'rgba(255, 237, 160, 0.95)');
      radGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.7)');
      radGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.25)');
      radGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      nightCtx.fillStyle = radGrad;
      nightCtx.beginPath();
      nightCtx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
      nightCtx.fill();
    });

    // 3. Procedural Dynamic Atmospheric Cloud Swirls
    cloudsCtx.clearRect(0, 0, 2048, 1024);
    for (let i = 0; i < 45; i++) {
      const cx = (i * 47) % 2048;
      const cy = 200 + Math.sin(i * 0.45) * 220 + (i % 3) * 120;
      const cloudGrad = cloudsCtx.createRadialGradient(cx, cy, 10, cx, cy, 140);
      cloudGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      cloudGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      cloudGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      cloudsCtx.fillStyle = cloudGrad;
      cloudsCtx.beginPath();
      cloudsCtx.arc(cx, cy, 140, 0, Math.PI * 2);
      cloudsCtx.fill();
    }

    // Create GPU canvas textures
    const dayTexture = new THREE.CanvasTexture(dayCanvas);
    dayTexture.wrapS = THREE.RepeatWrapping;
    dayTexture.wrapT = THREE.ClampToEdgeWrapping;

    const nightTexture = new THREE.CanvasTexture(nightCanvas);
    nightTexture.wrapS = THREE.RepeatWrapping;
    nightTexture.wrapT = THREE.ClampToEdgeWrapping;

    const cloudsTexture = new THREE.CanvasTexture(cloudsCanvas);
    cloudsTexture.wrapS = THREE.RepeatWrapping;
    cloudsTexture.wrapT = THREE.ClampToEdgeWrapping;

    setIsImageryLoading(false);
    setImagerySourceLabel('Procedural 3D Planetary Surface • WebGL Vector');

    return { dayTexture, nightTexture, cloudsTexture };
  }, []);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 580;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera with depth clipping protection
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, targetCamZ.current);
    cameraRef.current = camera;

    // 3. WebGL Renderer with High-Precision Antialiasing
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Background Starfield
    const starsCount = 2200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 25.0 + Math.random() * 15.0;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const colorTint = Math.random();
      if (colorTint > 0.85) {
        starColors[i * 3] = 0.85; starColors[i * 3 + 1] = 0.90; starColors[i * 3 + 2] = 1.0;
      } else if (colorTint > 0.70) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 0.85;
      } else {
        starColors[i * 3] = 0.92; starColors[i * 3 + 1] = 0.92; starColors[i * 3 + 2] = 0.96;
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    globeGroup.rotation.x = targetRotX.current;
    globeGroup.rotation.y = targetRotY.current;

    // 6. Textures & Earth Shader Surface
    const { dayTexture, nightTexture, cloudsTexture } = loadNasaTextures();

    const sunVector = new THREE.Vector3(5.0, 2.5, 4.0).normalize();

    const earthGeo = new THREE.SphereGeometry(earthRadius, 72, 72);
    const earthShaderMat = new THREE.ShaderMaterial({
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        cloudsTexture: { value: cloudsTexture },
        sunDirection: { value: sunVector },
        cloudsOpacity: { value: 0.0 },
        nightLightsIntensity: { value: 1.4 },
        dayNightEnabled: { value: 1.0 },
      },
    });
    earthShaderMatRef.current = earthShaderMat;

    const earthMesh = new THREE.Mesh(earthGeo, earthShaderMat);
    globeGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 7. Outer Atmospheric Rayleigh Halo
    const atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.026, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        sunDirection: { value: sunVector },
        atmosphereColor: { value: new THREE.Color(0x38bdf8) },
        atmosphereOpacity: { value: 0.85 },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // 8. Boundaries & Highlights Groups
    const boundariesGroup = new THREE.Group();
    globeGroup.add(boundariesGroup);
    boundariesGroupRef.current = boundariesGroup;

    const highlightGroup = new THREE.Group();
    globeGroup.add(highlightGroup);
    highlightGroupRef.current = highlightGroup;

    const pinsGroup = new THREE.Group();
    globeGroup.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    // 9. Coordinate Graticule (Subtle Lat/Lon Grid)
    const graticuleMaterial = new THREE.LineBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.18,
    });

    for (let lat = -60; lat <= 60; lat += 30) {
      const latPoints: THREE.Vector3[] = [];
      for (let lon = -180; lon <= 180; lon += 6) {
        latPoints.push(latLonToVector3(lon, lat, earthRadius * 1.001));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(latPoints);
      const line = new THREE.Line(lineGeo, graticuleMaterial);
      globeGroup.add(line);
    }

    for (let lon = -180; lon < 180; lon += 45) {
      const lonPoints: THREE.Vector3[] = [];
      for (let lat = -80; lat <= 80; lat += 5) {
        lonPoints.push(latLonToVector3(lon, lat, earthRadius * 1.001));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(lonPoints);
      const line = new THREE.Line(lineGeo, graticuleMaterial);
      globeGroup.add(line);
    }

    // 10. Animation Loop with Smooth Inertial Camera
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Smooth camera interpolation
      currentRotX.current += (targetRotX.current - currentRotX.current) * 0.085;
      currentRotY.current += (targetRotY.current - currentRotY.current) * 0.085;
      currentCamZ.current += (targetCamZ.current - currentCamZ.current) * 0.085;

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.x = currentRotX.current;
        globeGroupRef.current.rotation.y = currentRotY.current;

        // Auto-rotation when idle
        if (isAutoRotating && !isPointerDown.current) {
          targetRotY.current += 0.0012;
        }
      }

      if (cameraRef.current) {
        cameraRef.current.position.z = currentCamZ.current;
      }

      // Rotate atmosphere with subtle dynamic limb tracking
      if (atmosphereMeshRef.current && cameraRef.current) {
        atmosphereMeshRef.current.position.copy(cameraRef.current.position).normalize().multiplyScalar(0.02);
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
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [earthRadius, latLonToVector3, loadNasaTextures]);

  // Update Atmosphere and Clouds Shader Uniforms when toggled
  useEffect(() => {
    if (earthShaderMatRef.current) {
      earthShaderMatRef.current.uniforms.cloudsOpacity.value = isCloudsActive ? 0.85 : 0.0;
      earthShaderMatRef.current.uniforms.dayNightEnabled.value = isDayNightActive ? 1.0 : 0.0;
    }
    if (atmosphereMeshRef.current) {
      atmosphereMeshRef.current.visible = isAtmosphereActive;
    }
  }, [isCloudsActive, isDayNightActive, isAtmosphereActive]);

  // Render Country Boundaries and Highlighting
  useEffect(() => {
    if (!boundariesGroupRef.current || !highlightGroupRef.current || !pinsGroupRef.current) return;

    const boundariesGroup = boundariesGroupRef.current;
    const highlightGroup = highlightGroupRef.current;
    const pinsGroup = pinsGroupRef.current;

    // Clear previous geometries
    while (boundariesGroup.children.length > 0) {
      boundariesGroup.remove(boundariesGroup.children[0]);
    }
    while (highlightGroup.children.length > 0) {
      highlightGroup.remove(highlightGroup.children[0]);
    }
    while (pinsGroup.children.length > 0) {
      pinsGroup.remove(pinsGroup.children[0]);
    }

    const defaultBoundaryMat = new THREE.LineBasicMaterial({
      color: 0xc4b5fd,
      transparent: true,
      opacity: 0.35,
    });

    const activeBoundaryMat = new THREE.LineBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.95,
      linewidth: 2,
    });

    const comparisonBoundaryMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      linewidth: 2,
    });

    GLOBAL_COUNTRIES.forEach((country) => {
      if (!country.polygon || country.polygon.length < 3) return;

      const points = country.polygon.map(([lon, lat]) =>
        latLonToVector3(lon, lat, earthRadius * 1.002)
      );

      const isActive = country.code === activeCountryCode;
      const isCompare = comparisonCountryCode && country.code === comparisonCountryCode;

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.LineLoop(
        lineGeo,
        isActive ? activeBoundaryMat : isCompare ? comparisonBoundaryMat : defaultBoundaryMat
      );
      boundariesGroup.add(line);

      // Translucent surface highlight fill for selected country
      if (isActive || isCompare) {
        const [centerLon, centerLat] = country.coordinates;
        const centerVec = latLonToVector3(centerLon, centerLat, earthRadius * 1.003);

        // 3D Pin Beacon
        const pinGeo = new THREE.SphereGeometry(0.022, 16, 16);
        const pinMat = new THREE.MeshBasicMaterial({
          color: isActive ? 0xa855f7 : 0x38bdf8,
        });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.copy(centerVec);
        pinsGroup.add(pinMesh);

        // Pulsing orbital ring around pin
        const ringGeo = new THREE.RingGeometry(0.035, 0.046, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isActive ? 0xc084fc : 0x7dd3fc,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(centerVec);
        ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
        pinsGroup.add(ringMesh);
      }
    });
  }, [activeCountryCode, comparisonCountryCode, earthRadius, latLonToVector3]);

  // Pointer Interaction Handlers (Mouse Drag, Pinch Zoom, Orbit)
  const onPointerDown = (e: React.PointerEvent) => {
    isPointerDown.current = true;
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    const deltaX = e.clientX - pointerStart.current.x;
    const deltaY = e.clientY - pointerStart.current.y;
    pointerStart.current = { x: e.clientX, y: e.clientY };

    targetRotY.current += deltaX * 0.006;
    targetRotX.current = Math.max(-1.35, Math.min(1.35, targetRotX.current + deltaY * 0.006));
  };

  const onPointerUp = () => {
    isPointerDown.current = false;
  };

  // Wheel Zoom with Smooth Exponential Limits
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.0025;
    targetCamZ.current = Math.max(1.75, Math.min(5.5, targetCamZ.current + zoomDelta));
  };

  // Touch Pinch-to-Zoom Support
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (touchStartDist.current !== null) {
        const diff = touchStartDist.current - dist;
        targetCamZ.current = Math.max(1.75, Math.min(5.5, targetCamZ.current + diff * 0.008));
      }
      touchStartDist.current = dist;
    }
  };

  const onTouchEnd = () => {
    touchStartDist.current = null;
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden bg-[#050b14] border border-purple-900/40 select-none shadow-2xl font-sans`}>
      {/* 3D WebGL Canvas Viewport */}
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
      />

      {/* Top Left: Planetary Header & Real NASA Layer Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 max-w-[85vw] sm:max-w-md pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-purple-500/30 text-purple-200 text-xs font-mono font-bold shadow-lg">
            <Globe className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="truncate">REALISTIC EARTH INSTRUMENT</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="truncate">{imagerySourceLabel}</span>
          </div>
        </div>

        {/* Floating Minimal Badge for Selected Country */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-purple-500/40 rounded-2xl p-3 text-white shadow-xl pointer-events-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold block">
              SELECTED OBSERVATION TARGET
            </span>
            <div className="text-sm sm:text-base font-extrabold text-slate-100 flex items-center gap-1.5">
              <span>{activeCountry.name}</span>
              <span className="text-xs font-mono text-purple-300 font-semibold">({activeCountry.code3})</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              {activeResult.variableName} •{' '}
              <strong className={activeResult.trend.direction === 'increasing' ? 'text-amber-400' : 'text-cyan-400'}>
                {activeResult.slope.valuePerDecade > 0 ? '+' : ''}
                {activeResult.slope.valuePerDecade} {activeResult.slope.unit}
              </strong>
            </div>
          </div>

          <button
            onClick={() => onNavigateToInvestigate?.(activeCountry.code)}
            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors text-xs font-mono font-bold flex items-center gap-1 shrink-0 shadow-md"
            title="Launch Full Scientific Lab"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Investigate</span>
          </button>
        </div>
      </div>

      {/* Top Right: Country Search Button & Overlay Switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsSearchOpen((prev) => !prev)}
          className="px-3.5 py-2 rounded-xl bg-slate-950/85 hover:bg-purple-950/90 backdrop-blur-md border border-purple-500/40 text-purple-200 text-xs font-mono font-bold shadow-lg transition-all flex items-center gap-2"
        >
          <Search className="w-3.5 h-3.5 text-purple-400" />
          <span>{isSearchOpen ? 'Close Search' : 'Find Country'}</span>
        </button>

        <button
          onClick={() => setIsDetailsOpen((prev) => !prev)}
          className="p-2 rounded-xl bg-slate-950/85 hover:bg-purple-950/90 backdrop-blur-md border border-purple-500/40 text-purple-200 text-xs shadow-lg transition-all"
          title="Toggle Scientific Information Card"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Country Search Drawer Panel */}
      {isSearchOpen && (
        <div className="absolute top-16 right-4 z-30 w-80 max-w-[90vw] bg-slate-950/95 backdrop-blur-xl border border-purple-500/40 rounded-3xl p-4 shadow-2xl text-white space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
              Global Country Registry (73 Supported)
            </span>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country, code, or capital..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
              autoFocus
            />
          </div>

          {/* Continent Filter Chips */}
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

          {/* Filtered Country Results List */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredCountries.slice(0, 15).map((country) => {
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
                    <div className="font-bold text-slate-100 truncate">
                      {country.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {country.capital} • {country.region}
                    </div>
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

      {/* Floating Scientific Data Card (Section 12 & 26 Specification) */}
      {isDetailsOpen && (
        <div className="absolute bottom-4 right-4 z-20 w-84 max-w-[90vw] bg-slate-950/90 backdrop-blur-xl border border-purple-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold block">
                STATISTICAL EVIDENCE CARD
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
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scientific Variables Tabs */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              VARIABLE OVERLAY (EARTH REMAINS BASE)
            </span>
            <div className="grid grid-cols-5 gap-1 pt-0.5">
              {[
                { id: 'rainfall', label: 'Rain' },
                { id: 'lst', label: 'Temp' },
                { id: 'ndvi', label: 'Plant' },
                { id: 'tws', label: 'Water' },
                { id: 'solar', label: 'Solar' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setCurrentVariable(v.id as any)}
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

          {/* Provenance Trace Action */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <button
              onClick={() => onNavigateToInvestigate?.(activeCountry.code)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Detailed Provenance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Left: Globe Camera & Environment Controls HUD */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-purple-500/30 p-1.5 rounded-2xl shadow-lg">
        {/* Reset View */}
        <button
          onClick={() => flyToCountry(activeCountry)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-purple-950/60 transition-colors"
          title="Center on Target Country"
        >
          <MapPin className="w-4 h-4 text-purple-400" />
        </button>

        {/* Global Overview */}
        <button
          onClick={() => {
            targetCamZ.current = 4.6;
            targetRotX.current = 0.35;
          }}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-purple-950/60 transition-colors"
          title="Planetary Overview"
        >
          <RotateCcw className="w-4 h-4 text-purple-400" />
        </button>

        {/* Zoom In */}
        <button
          onClick={() => {
            targetCamZ.current = Math.max(1.75, targetCamZ.current - 0.4);
          }}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-purple-950/60 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-slate-300" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => {
            targetCamZ.current = Math.min(5.5, targetCamZ.current + 0.4);
          }}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-purple-950/60 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-slate-300" />
        </button>

        <div className="w-px h-5 bg-slate-800 mx-0.5" />

        {/* Auto-Rotation Toggle */}
        <button
          onClick={() => setIsAutoRotating((prev) => !prev)}
          className={`p-2 rounded-xl transition-colors ${
            isAutoRotating ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title={isAutoRotating ? 'Pause Planetary Rotation' : 'Enable Planetary Rotation'}
        >
          {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Day/Night Lighting Toggle */}
        <button
          onClick={() => setIsDayNightActive((prev) => !prev)}
          className={`p-2 rounded-xl transition-colors ${
            isDayNightActive ? 'bg-indigo-900 text-indigo-200' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Toggle Day/Night Orbital Lighting"
        >
          {isDayNightActive ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Atmosphere Halo Toggle */}
        <button
          onClick={() => setIsAtmosphereActive((prev) => !prev)}
          className={`p-2 rounded-xl transition-colors ${
            isAtmosphereActive ? 'bg-sky-950 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Toggle Rayleigh Atmospheric Glow"
        >
          <Eye className="w-4 h-4 text-sky-400" />
        </button>

        {/* NASA Clouds Layer Toggle */}
        <button
          onClick={() => setIsCloudsActive((prev) => !prev)}
          className={`p-2 rounded-xl transition-colors ${
            isCloudsActive ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Toggle NASA MODIS Real-time Cloud Fraction"
        >
          <Cloud className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Subtle Loading Indicator for Progressive Tiles */}
      {isImageryLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-purple-500/40 text-purple-200 text-xs font-mono font-bold shadow-xl flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
          <span>Streaming NASA GIBS Earth Observation Tiles...</span>
        </div>
      )}
    </div>
  );
};
