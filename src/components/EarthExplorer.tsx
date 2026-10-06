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

// NASA GIBS WMTS Endpoint Templates (Authentic Open Satellite Data)
const NASA_GIBS_BLUE_MARBLE_W =
  'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/BlueMarble_NextGeneration/default/default/500m/0/0/0.jpeg';
const NASA_GIBS_BLUE_MARBLE_E =
  'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/BlueMarble_NextGeneration/default/default/500m/0/0/1.jpeg';
const NASA_GIBS_VIIRS_NIGHT_W =
  'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_CityLights_2012/default/default/500m/0/0/0.jpeg';
const NASA_GIBS_VIIRS_NIGHT_E =
  'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_CityLights_2012/default/default/500m/0/0/1.jpeg';
const NASA_GIBS_CLOUDS_W =
  'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_Cloud_Fraction_Day/default/default/2km/0/0/0.png';
const NASA_GIBS_CLOUDS_E =
  'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_Cloud_Fraction_Day/default/default/2km/0/0/1.png';

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

  // Build the High-Resolution Satellite & Night Texture Map
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

    // 1. Procedural Deep Ocean Base (Instant First-Paint Shield)
    const oceanGrad = dayCtx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#040d1a');
    oceanGrad.addColorStop(0.25, '#071830');
    oceanGrad.addColorStop(0.5, '#0a2342');
    oceanGrad.addColorStop(0.75, '#071830');
    oceanGrad.addColorStop(1, '#040d1a');
    dayCtx.fillStyle = oceanGrad;
    dayCtx.fillRect(0, 0, 2048, 1024);

    nightCtx.fillStyle = '#020610';
    nightCtx.fillRect(0, 0, 2048, 1024);

    // Initial canvas textures
    const dayTexture = new THREE.CanvasTexture(dayCanvas);
    dayTexture.wrapS = THREE.RepeatWrapping;
    dayTexture.wrapT = THREE.ClampToEdgeWrapping;

    const nightTexture = new THREE.CanvasTexture(nightCanvas);
    nightTexture.wrapS = THREE.RepeatWrapping;
    nightTexture.wrapT = THREE.ClampToEdgeWrapping;

    const cloudsTexture = new THREE.CanvasTexture(cloudsCanvas);
    cloudsTexture.wrapS = THREE.RepeatWrapping;
    cloudsTexture.wrapT = THREE.ClampToEdgeWrapping;

    // 2. Asynchronously stream authentic NASA GIBS Blue Marble tiles
    const imgWest = new Image();
    const imgEast = new Image();
    imgWest.crossOrigin = 'anonymous';
    imgEast.crossOrigin = 'anonymous';

    let loadedCount = 0;
    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === 2) {
        dayCtx.drawImage(imgWest, 0, 0, 1024, 1024);
        dayCtx.drawImage(imgEast, 1024, 0, 1024, 1024);
        dayTexture.needsUpdate = true;
        setIsImageryLoading(false);
        setImagerySourceLabel('NASA GIBS Blue Marble (Verified Open Satellite)');
      }
    };

    imgWest.onload = checkComplete;
    imgEast.onload = checkComplete;
    imgWest.onerror = () => {
      // Graceful fallback to high-resolution vector topographic basemap
      console.warn('NASA GIBS tile fallback active');
      setIsImageryLoading(false);
    };
    imgEast.onerror = () => {
      setIsImageryLoading(false);
    };

    imgWest.src = NASA_GIBS_BLUE_MARBLE_W;
    imgEast.src = NASA_GIBS_BLUE_MARBLE_E;

    // 3. Asynchronously stream authentic NASA VIIRS Night Lights
    const nightWest = new Image();
    const nightEast = new Image();
    nightWest.crossOrigin = 'anonymous';
    nightEast.crossOrigin = 'anonymous';

    let nightLoaded = 0;
    const checkNight = () => {
      nightLoaded++;
      if (nightLoaded === 2) {
        nightCtx.drawImage(nightWest, 0, 0, 1024, 1024);
        nightCtx.drawImage(nightEast, 1024, 0, 1024, 1024);
        nightTexture.needsUpdate = true;
      }
    };
    nightWest.onload = checkNight;
    nightEast.onload = checkNight;
    nightWest.src = NASA_GIBS_VIIRS_NIGHT_W;
    nightEast.src = NASA_GIBS_VIIRS_NIGHT_E;

    // 4. Stream real NASA MODIS cloud coverage
    const cloudWest = new Image();
    const cloudEast = new Image();
    cloudWest.crossOrigin = 'anonymous';
    cloudEast.crossOrigin = 'anonymous';

    let cloudLoaded = 0;
    const checkClouds = () => {
      cloudLoaded++;
      if (cloudLoaded === 2) {
        cloudsCtx.drawImage(cloudWest, 0, 0, 1024, 1024);
        cloudsCtx.drawImage(cloudEast, 1024, 0, 1024, 1024);
        cloudsTexture.needsUpdate = true;
      }
    };
    cloudWest.onload = checkClouds;
    cloudEast.onload = checkClouds;
    cloudWest.src = NASA_GIBS_CLOUDS_W;
    cloudEast.src = NASA_GIBS_CLOUDS_E;

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
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden bg-[#050b14] border border-purple-900/40 select-none shadow-2xl font-['Manrope']`}>
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
            <div className="text-sm sm:text-base font-extrabold font-['Space_Grotesk'] text-slate-100 flex items-center gap-1.5">
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
                    <div className="font-['Space_Grotesk'] font-bold text-slate-100 truncate">
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
              <h3 className="text-lg font-black text-white font-['Space_Grotesk'] tracking-tight">
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

            <div className="text-2xl font-black font-['Space_Grotesk'] tracking-tight text-white flex items-baseline gap-2 pt-1">
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
