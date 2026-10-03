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
import { NasaSourceRecord } from '../data/nasaRegistry';
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
} from 'lucide-react';

export type GeoLevel = 'world' | 'continent' | 'south-asia' | 'bangladesh' | 'country' | 'district';

interface EarthExplorerProps {
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
}

export const EarthExplorer: React.FC<EarthExplorerProps> = ({
  initialLevel = 'world',
  selectedCountryCode = 'BD',
  onSelectCountry,
  selectedDistrictId = 'coxs-bazar',
  onSelectDistrict,
  onNavigateToInvestigate,
  activeVariable = 'lst',
  dataset,
  heightClass = 'h-[480px] sm:h-[560px] lg:h-[620px]',
  showInvestigationAction = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);

  // Geographic Hierarchy State
  const [geoLevel, setGeoLevel] = useState<GeoLevel>(initialLevel);
  const [activeCountryCode, setActiveCountryCode] = useState<string>(selectedCountryCode);
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [activeDistrictIdState, setActiveDistrictIdState] = useState<string>(selectedDistrictId);
  const [hoveredCountry, setHoveredCountry] = useState<GlobalCountry | null>(null);
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Sync external props
  useEffect(() => {
    if (selectedCountryCode && selectedCountryCode !== activeCountryCode) {
      setActiveCountryCode(selectedCountryCode);
    }
  }, [selectedCountryCode]);

  useEffect(() => {
    if (selectedDistrictId && selectedDistrictId !== activeDistrictIdState) {
      setActiveDistrictIdState(selectedDistrictId);
    }
  }, [selectedDistrictId]);

  // Current active country object
  const currentCountry = useMemo(() => {
    return getCountryByCode(activeCountryCode) || GLOBAL_COUNTRIES[0];
  }, [activeCountryCode]);

  // Filtered countries for search & pins
  const searchResults = useMemo(() => {
    return searchCountries(searchQuery).slice(0, 8);
  }, [searchQuery]);

  const continentFilteredCountries = useMemo(() => {
    return getCountriesByContinent(selectedContinent);
  }, [selectedContinent]);

  // Target Camera State
  const targetZ = useRef<number>(initialLevel === 'world' ? 4.8 : initialLevel === 'continent' ? 3.5 : 2.35);
  const targetRotX = useRef<number>(0.35);
  const targetRotY = useRef<number>(-1.57);
  const isInteracting = useRef<boolean>(false);

  // Helper to convert geographic [lon, lat] to 3D Cartesian coordinates on sphere
  const latLonToVector3 = useCallback((lon: number, lat: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

  // Center camera on a specific country
  const focusCountry = useCallback(
    (country: GlobalCountry, level: GeoLevel = 'country') => {
      setActiveCountryCode(country.code);
      onSelectCountry?.(country.code);
      setGeoLevel(level);

      const [lon, lat] = country.coordinates;
      const latRad = (lat * Math.PI) / 180;
      const lonRad = (lon * Math.PI) / 180;

      targetRotX.current = latRad;
      targetRotY.current = -lonRad;

      if (level === 'world') {
        targetZ.current = 4.8;
      } else if (level === 'continent') {
        targetZ.current = 3.5;
      } else if (level === 'district') {
        targetZ.current = 1.95;
      } else {
        // Country level zoom adjusted by area
        targetZ.current = country.areaSqKm > 3000000 ? 2.8 : country.areaSqKm > 500000 ? 2.45 : 2.2;
      }
    },
    [onSelectCountry]
  );

  // Navigate geographic scale
  const navigateToLevel = useCallback(
    (level: GeoLevel, countryCode?: string, districtId?: string) => {
      setGeoLevel(level);
      const countryToUse = countryCode ? getCountryByCode(countryCode) || currentCountry : currentCountry;

      if (countryCode && countryCode !== activeCountryCode) {
        setActiveCountryCode(countryCode);
        onSelectCountry?.(countryCode);
      }

      if (districtId) {
        setActiveDistrictIdState(districtId);
        onSelectDistrict?.(districtId);
      }

      if (level === 'world') {
        targetZ.current = 4.8;
        targetRotX.current = 0.2;
      } else if (level === 'continent' || level === 'south-asia') {
        targetZ.current = 3.5;
        const [lon, lat] = level === 'south-asia' ? [90.356, 23.685] : countryToUse.coordinates;
        targetRotX.current = (lat * Math.PI) / 180;
        targetRotY.current = -((lon * Math.PI) / 180);
      } else if (level === 'country' || level === 'bangladesh') {
        focusCountry(level === 'bangladesh' ? getCountryByCode('BD') || countryToUse : countryToUse, 'country');
      } else if (level === 'district') {
        targetZ.current = 1.95;
        const d = BANGLADESH_DISTRICT_GEOMETRIES.find((item) => item.id === (districtId || activeDistrictIdState));
        if (d) {
          targetRotX.current = (d.center[1] * Math.PI) / 180;
          targetRotY.current = -((d.center[0] * Math.PI) / 180);
        }
      }
    },
    [activeCountryCode, activeDistrictIdState, currentCountry, focusCountry, onSelectCountry, onSelectDistrict]
  );

  // When active country changes externally, center view
  useEffect(() => {
    const c = getCountryByCode(activeCountryCode);
    if (c && geoLevel !== 'world') {
      const [lon, lat] = c.coordinates;
      targetRotX.current = (lat * Math.PI) / 180;
      targetRotY.current = -((lon * Math.PI) / 180);
    }
  }, [activeCountryCode, geoLevel]);

  // Three.js WebGL Scene Initialization
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, targetZ.current);
    cameraRef.current = camera;

    // 3. Renderer with high-performance antialiasing
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Photorealistic Lighting
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 1.0);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(6, 4, 5);
    scene.add(sunLight);

    // Subtle planetary rim backlight with deep violet scattering
    const atmosphericRim = new THREE.DirectionalLight(0x8b5cf6, 1.25);
    atmosphericRim.position.set(-6, -2, -4);
    scene.add(atmosphericRim);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    globeGroup.rotation.x = targetRotX.current;
    globeGroup.rotation.y = targetRotY.current;

    // 6. High-Definition Texture Map Canvas (2048x1024)
    const earthRadius = 1.25;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // A. Deep Oceanic Blue Marble Bathymetry
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#061326');
    oceanGrad.addColorStop(0.25, '#0a1e3d');
    oceanGrad.addColorStop(0.5, '#081730');
    oceanGrad.addColorStop(0.75, '#0a1e3d');
    oceanGrad.addColorStop(1, '#061326');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Coordinate conversion helper
    const toCanvas = (lon: number, lat: number): [number, number] => [
      ((lon + 180) / 360) * 2048,
      ((90 - lat) / 180) * 1024,
    ];

    // Continental Drawing Routine
    const drawLandmass = (coords: [number, number][], fillColor: string, strokeColor = '#1e1b4b') => {
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
      ctx.lineWidth = 1.0;
      ctx.stroke();
    };

    // Realistic Biome Palettes
    const forestGreen = '#1e462d';
    const temperateGreen = '#345e3b';
    const savannaOlive = '#617042';
    const desertOchre = '#ab8b5e';
    const alpineSnow = '#f1f5f9';

    // Base Global Landmasses
    drawLandmass(
      [
        [-9, 36], [0, 44], [10, 54], [25, 71], [60, 75], [100, 77], [140, 72], [170, 66],
        [180, 64], [170, 60], [142, 50], [130, 40], [122, 30], [115, 22], [108, 12], [100, 4],
        [98, 10], [92, 16], [92, 21], [88, 22], [85, 20], [80, 10], [77, 8], [73, 16], [68, 24],
        [60, 25], [55, 28], [50, 30], [36, 31], [26, 36], [15, 38], [5, 36], [-9, 36],
      ],
      temperateGreen
    );
    drawLandmass(
      [[73, 16], [77, 8], [80, 10], [88, 22], [92, 21], [98, 10], [104, 11], [108, 16], [106, 21], [98, 23], [90, 24], [82, 23], [75, 20]],
      forestGreen
    );
    drawLandmass(
      [[75, 37], [85, 36], [95, 35], [102, 32], [96, 28], [88, 28], [82, 29], [76, 33]],
      savannaOlive
    );
    drawLandmass(
      [[77, 33], [82, 30], [86, 28.5], [89, 28], [93, 29], [90, 29], [84, 31], [78, 34]],
      alpineSnow
    );
    drawLandmass(
      [[-17, 30], [10, 37], [32, 31], [50, 30], [58, 24], [55, 15], [44, 12], [35, 15], [32, 22], [15, 22], [-17, 21], [-17, 30]],
      desertOchre
    );
    drawLandmass(
      [[-17, 15], [10, 5], [42, 10], [51, 11], [40, -10], [35, -25], [30, -32], [18, -34], [12, -15], [0, 5], [-15, 12], [-17, 15]],
      forestGreen
    );
    drawLandmass(
      [[-168, 65], [-140, 70], [-100, 72], [-65, 60], [-55, 48], [-70, 42], [-80, 25], [-90, 18], [-105, 20], [-115, 32], [-124, 48], [-150, 60], [-168, 65]],
      forestGreen
    );
    drawLandmass(
      [[-78, 10], [-60, 8], [-35, -5], [-40, -22], [-55, -40], [-68, -55], [-75, -45], [-72, -18], [-80, -2], [-78, 10]],
      forestGreen
    );
    drawLandmass([[114, -22], [125, -15], [135, -12], [148, -20], [152, -35], [138, -38], [120, -35], [114, -25]], desertOchre);
    drawLandmass([[-180, -70], [180, -70], [180, -90], [-180, -90]], alpineSnow);

    // Draw authoritative country boundary polygons on the globe
    GLOBAL_COUNTRIES.forEach((c) => {
      if (c.polygon && c.polygon.length > 2) {
        ctx.beginPath();
        c.polygon.forEach(([lon, lat], i) => {
          const [x, y] = toCanvas(lon, lat);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.strokeStyle = c.code === activeCountryCode ? '#a855f7' : 'rgba(192, 132, 252, 0.45)';
        ctx.lineWidth = c.code === activeCountryCode ? 2.5 : 0.8;
        ctx.stroke();

        if (c.code === activeCountryCode) {
          ctx.fillStyle = 'rgba(147, 51, 234, 0.28)';
          ctx.fill();
        }
      }
    });

    // Scientific Graticule Overlay
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.22)';
    ctx.lineWidth = 0.8;
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

    // Equator (0°)
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.6)';
    ctx.lineWidth = 1.6;
    const yEquator = (90 / 180) * 1024;
    ctx.beginPath();
    ctx.moveTo(0, yEquator);
    ctx.lineTo(2048, yEquator);
    ctx.stroke();

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    // 7. Earth Mesh
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.08,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 8. Outer Atmospheric Rayleigh Glow Mesh
    const atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.03, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.72, 0.58, 0.98, 1.0) * intensity * 0.95;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 9. Interactive 3D Country Pins Group
    const pinsGroup = new THREE.Group();
    globeGroup.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    GLOBAL_COUNTRIES.forEach((country) => {
      const pinPos = latLonToVector3(country.coordinates[0], country.coordinates[1], earthRadius * 1.015);
      const isSelected = country.code === activeCountryCode;

      // Small 3D Pin Dot
      const dotGeo = new THREE.SphereGeometry(isSelected ? 0.032 : 0.016, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xd946ef : 0xc084fc,
      });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.copy(pinPos);
      dotMesh.userData = { countryCode: country.code, countryName: country.name };
      pinsGroup.add(dotMesh);

      if (isSelected) {
        // Pulsing Reticle Ring for selected country
        const ringGeo = new THREE.RingGeometry(0.045, 0.065, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xe879f9,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pinPos);
        ringMesh.lookAt(pinPos.clone().multiplyScalar(2));
        ringMesh.name = 'activeCountryRing';
        pinsGroup.add(ringMesh);
      }
    });

    // 10. Pointer Drag & Touch Zoom Interaction with Inertial Momentum
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let activePointers = new Map<number, { x: number; y: number }>();
    let prevPinchDist = 0;

    const onPointerDown = (e: PointerEvent) => {
      container.setPointerCapture(e.pointerId);
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 1) {
        isDragging = true;
        isInteracting.current = true;
        prevX = e.clientX;
        prevY = e.clientY;
        velocityX = 0;
        velocityY = 0;
      } else if (activePointers.size === 2) {
        isDragging = false;
        isInteracting.current = true;
        const pts = Array.from(activePointers.values());
        prevPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!activePointers.has(e.pointerId)) return;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 1 && isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;

        globeGroup.rotation.y += dx * 0.005;
        globeGroup.rotation.x += dy * 0.005;
        globeGroup.rotation.x = Math.max(-1.15, Math.min(1.15, globeGroup.rotation.x));

        velocityX = dx * 0.005;
        velocityY = dy * 0.005;
      } else if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const pinchDelta = (prevPinchDist - dist) * 0.007;
        prevPinchDist = dist;
        targetZ.current = Math.max(1.8, Math.min(5.5, targetZ.current + pinchDelta));
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
      if (activePointers.size === 0) {
        isDragging = false;
        setTimeout(() => {
          isInteracting.current = false;
        }, 1200);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.0028;
      targetZ.current = Math.max(1.8, Math.min(5.5, targetZ.current + zoomDelta));
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 11. Animation Loop with Slerp & Momentum
    let time = 0;
    const animate = () => {
      time += 0.02;
      animFrameRef.current = requestAnimationFrame(animate);

      // Smooth camera interpolation
      camera.position.z += (targetZ.current - camera.position.z) * 0.085;

      // Handle dragging vs auto-rotation vs target interpolation
      if (!isDragging) {
        globeGroup.rotation.y += velocityX;
        globeGroup.rotation.x += velocityY;
        velocityX *= 0.92;
        velocityY *= 0.92;

        if (isAutoRotating) {
          globeGroup.rotation.y += 0.0018;
        } else if (!isInteracting.current) {
          globeGroup.rotation.y += (targetRotY.current - globeGroup.rotation.y) * 0.045;
          globeGroup.rotation.x += (targetRotX.current - globeGroup.rotation.x) * 0.045;
        }
      }

      // Pulse active ring
      const activeRing = pinsGroup.getObjectByName('activeCountryRing');
      if (activeRing) {
        const s = 1.0 + Math.sin(time * 3.5) * 0.25;
        activeRing.scale.set(s, s, s);
      }

      renderer.render(scene, camera);
    };
    animate();
    setIsLoaded(true);

    // 12. Resize
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
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('wheel', onWheel);

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
    };
  }, [activeCountryCode, isAutoRotating, latLonToVector3]);

  // Bangladesh Sub-District Overlay (Activated when country === 'BD' and geoLevel === 'district')
  const isBangladeshDistrictView = currentCountry.code === 'BD' && geoLevel === 'district';

  const svgW = 680;
  const svgH = 740;
  const minLon = 88.0;
  const maxLon = 92.8;
  const minLat = 20.6;
  const maxLat = 26.6;

  const toGisSvg = (lon: number, lat: number): [number, number] => {
    const x = ((lon - minLon) / (maxLon - minLon)) * (svgW - 120) + 60;
    const y = ((maxLat - lat) / (maxLat - minLat)) * (svgH - 120) + 50;
    return [x, y];
  };

  const currentDistrict = useMemo(() => {
    return BANGLADESH_DISTRICTS.find((d) => d.id === activeDistrictIdState) || BANGLADESH_DISTRICTS[0];
  }, [activeDistrictIdState]);

  const hoveredDistrict = useMemo(() => {
    if (!hoveredDistrictId) return null;
    return BANGLADESH_DISTRICTS.find((d) => d.id === hoveredDistrictId) || null;
  }, [hoveredDistrictId]);

  return (
    <div
      className={`relative w-full ${heightClass} bg-slate-950 rounded-3xl overflow-hidden border border-purple-900/40 shadow-2xl flex flex-col justify-between select-none font-['Manrope']`}
    >
      {/* Top Header: Global Scale Breadcrumb, Continent Selector, and Quick Search */}
      <div className="relative z-20 p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-b border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Scale Breadcrumb */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] uppercase font-bold text-purple-300 font-sans tracking-wider">
            SCALE:
          </span>

          <button
            onClick={() => navigateToLevel('world')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              geoLevel === 'world'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-200 hover:text-white hover:bg-purple-950/60'
            }`}
          >
            World
          </button>

          <span className="text-purple-500 font-bold">›</span>

          <button
            onClick={() => navigateToLevel('continent')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              geoLevel === 'continent'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-200 hover:text-white hover:bg-purple-950/60'
            }`}
          >
            {currentCountry.continent}
          </button>

          <span className="text-purple-500 font-bold">›</span>

          <button
            onClick={() => navigateToLevel('country')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              geoLevel === 'country'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-200 hover:text-white hover:bg-purple-950/60'
            }`}
          >
            {currentCountry.name}
          </button>

          {currentCountry.code === 'BD' && (
            <>
              <span className="text-purple-500 font-bold">›</span>
              <button
                onClick={() => navigateToLevel(geoLevel === 'district' ? 'country' : 'district')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  geoLevel === 'district'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-300 hover:text-white hover:bg-purple-950/60 border border-purple-500/30'
                }`}
              >
                {geoLevel === 'district' ? `District: ${currentDistrict.name}` : 'Districts GIS (64)'}
              </button>
            </>
          )}
        </div>

        {/* Global Country Quick Search & View Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Country Search Dropdown */}
          <div className="relative">
            <div className="flex items-center bg-slate-800/90 border border-purple-500/30 rounded-xl px-2.5 py-1 text-xs">
              <Search className="w-3.5 h-3.5 text-purple-300 mr-1.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search country..."
                className="bg-transparent text-white placeholder-slate-400 focus:outline-none w-24 sm:w-32 text-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white ml-1">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Dropdown Suggestions */}
            {isSearchFocused && searchQuery.length > 0 && (
              <div
                className="absolute right-0 top-full mt-1.5 w-60 bg-slate-900 border border-purple-500/40 rounded-xl shadow-2xl p-1 z-50 max-h-56 overflow-y-auto"
                onMouseLeave={() => setIsSearchFocused(false)}
              >
                {searchResults.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      focusCountry(c, 'country');
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-purple-950/70 text-xs text-white flex items-center justify-between transition-colors"
                  >
                    <span className="font-bold">{c.name}</span>
                    <span className="text-[10px] text-purple-300 font-mono">{c.code} • {c.region}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <button
            onClick={() => setIsAutoRotating((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition-all ${
              isAutoRotating
                ? 'bg-purple-600 border-purple-400 text-white'
                : 'bg-slate-800/90 border-purple-500/30 text-purple-200 hover:bg-purple-900/60'
            }`}
            title={isAutoRotating ? 'Pause Rotation' : 'Auto Rotate Earth'}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              targetZ.current = Math.max(1.8, targetZ.current - 0.45);
            }}
            className="p-1.5 rounded-lg bg-slate-800/90 border border-purple-500/30 text-purple-200 hover:bg-purple-900/60"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              targetZ.current = Math.min(5.5, targetZ.current + 0.45);
            }}
            className="p-1.5 rounded-lg bg-slate-800/90 border border-purple-500/30 text-purple-200 hover:bg-purple-900/60"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => navigateToLevel('world')}
            className="p-1.5 rounded-lg bg-slate-800/90 border border-purple-500/30 text-purple-200 hover:bg-purple-900/60"
            title="Reset to Full World View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Geographic Canvas Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Layer 1: 3D Earth Globe Canvas */}
        <div
          ref={containerRef}
          className={`absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-500 ${
            isBangladeshDistrictView ? 'opacity-25 pointer-events-none' : 'opacity-100'
          }`}
          style={{ touchAction: 'none' }}
        />

        {/* Floating Quick Continent Selector Strip */}
        {!isBangladeshDistrictView && (
          <div className="absolute left-3 top-3 z-10 hidden sm:flex flex-col gap-1 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-purple-500/25 text-[10px] font-mono text-purple-200">
            <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider text-purple-400 font-bold">
              CONTINENTS
            </span>
            {['All', 'Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'].map((cont) => (
              <button
                key={cont}
                onClick={() => {
                  setSelectedContinent(cont);
                  if (cont !== 'All') {
                    const firstCountry = GLOBAL_COUNTRIES.find((c) => c.continent === cont);
                    if (firstCountry) focusCountry(firstCountry, 'continent');
                  } else {
                    navigateToLevel('world');
                  }
                }}
                className={`px-2 py-1 rounded-lg text-left transition-all ${
                  selectedContinent === cont
                    ? 'bg-purple-600 text-white font-bold'
                    : 'hover:bg-purple-950/60 text-slate-300'
                }`}
              >
                {cont}
              </button>
            ))}
          </div>
        )}

        {/* Layer 2: High-Resolution Bangladesh GIS Administrative Boundary Map (When in District View) */}
        {isBangladeshDistrictView && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-300">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full max-h-[560px] filter drop-shadow-xl select-none">
              {/* Graticule Lat/Lon Guidelines */}
              <g opacity="0.3" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3">
                {[21, 22, 23, 24, 25, 26].map((lat) => {
                  const [, y] = toGisSvg(88, lat);
                  return (
                    <g key={`lat-${lat}`}>
                      <line x1="50" y1={y} x2={svgW - 50} y2={y} />
                      <text x="55" y={y - 3} fill="#a78bfa" fontSize="9" fontFamily="monospace">
                        {lat}°N
                      </text>
                    </g>
                  );
                })}
                {[89, 90, 91, 92].map((lon) => {
                  const [x] = toGisSvg(lon, 26.6);
                  return (
                    <g key={`lon-${lon}`}>
                      <line x1={x} y1="50" x2={x} y2={svgH - 50} />
                      <text x={x + 3} y="65" fill="#a78bfa" fontSize="9" fontFamily="monospace">
                        {lon}°E
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Major Transboundary River Corridors */}
              <g stroke="#60a5fa" strokeWidth="2.5" fill="none" opacity="0.75" strokeLinecap="round">
                <path d="M 230 80 Q 260 190 280 300 T 330 410" />
                <path d="M 80 270 Q 190 330 290 370 T 360 430" />
                <path d="M 360 430 Q 410 490 450 570" strokeWidth="4.5" />
              </g>

              {/* Contiguous Real District Polygons */}
              {BANGLADESH_DISTRICT_GEOMETRIES.map((geo) => {
                const districtData = BANGLADESH_DISTRICTS.find((d) => d.id === geo.id);
                if (!districtData) return null;

                const isSelected = geo.id === activeDistrictIdState;
                const isHovered = geo.id === hoveredDistrictId;

                const ptsStr = geo.polygon
                  .map(([lon, lat]) => {
                    const [x, y] = toGisSvg(lon, lat);
                    return `${x},${y}`;
                  })
                  .join(' ');

                const [cx, cy] = toGisSvg(geo.center[0], geo.center[1]);

                return (
                  <g
                    key={geo.id}
                    onClick={() => {
                      navigateToLevel('district', 'BD', geo.id);
                    }}
                    onMouseEnter={() => setHoveredDistrictId(geo.id)}
                    onMouseLeave={() => setHoveredDistrictId(null)}
                    className="cursor-pointer group"
                  >
                    <polygon
                      points={ptsStr}
                      fill={isSelected ? '#7c3aed' : isHovered ? '#c084fc' : '#312e81'}
                      stroke={isSelected ? '#ffffff' : '#6366f1'}
                      strokeWidth={isSelected ? 2.8 : 1.2}
                      className="transition-colors duration-150"
                    />

                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 4.5 : 2.5}
                      fill={isSelected ? '#ffffff' : '#a855f7'}
                      stroke="#ffffff"
                      strokeWidth={1}
                    />

                    <text
                      x={cx + 6}
                      y={cy + 3}
                      fill={isSelected ? '#ffffff' : '#e2e8f0'}
                      fontSize={isSelected ? '11' : '9.5'}
                      fontWeight={isSelected ? '800' : '600'}
                      fontFamily="sans-serif"
                      className="pointer-events-none drop-shadow-sm"
                    >
                      {geo.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Bottom Telemetry HUD Bar & Actions */}
      <div className="relative z-20 p-3 sm:p-4 bg-slate-900/95 backdrop-blur-md border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
          <div className="text-white text-[11px]">
            <span className="font-extrabold text-purple-300 block">
              {isBangladeshDistrictView
                ? `${(hoveredDistrict || currentDistrict).name} District • ${(hoveredDistrict || currentDistrict).divisionName} Division (Bangladesh)`
                : `${currentCountry.name} (${currentCountry.code3}) • ${currentCountry.region}, ${currentCountry.continent}`}
            </span>
            <span className="text-[10px] text-purple-200/80 block">
              {isBangladeshDistrictView
                ? `Elevation: ${(hoveredDistrict || currentDistrict).elevationMeters}m MSL • ${(hoveredDistrict || currentDistrict).isCoastal ? 'Coastal Delta' : 'Inland Basin'}`
                : `Coordinates: ${currentCountry.coordinates[1].toFixed(2)}°N, ${currentCountry.coordinates[0].toFixed(2)}°E • Area: ${currentCountry.areaSqKm.toLocaleString()} km² • Capital: ${currentCountry.capital}`}
            </span>
            <span className="text-[9px] text-purple-300/60 block mt-0.5">
              Derived from NASA dataset using GlobTraceX spatial aggregation.
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {showInvestigationAction && (
            <button
              onClick={() =>
                onNavigateToInvestigate?.(
                  currentCountry.code,
                  isBangladeshDistrictView ? activeDistrictIdState : undefined
                )
              }
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-['Space_Grotesk'] font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 border border-purple-400/40"
            >
              <span>
                Investigate {isBangladeshDistrictView ? currentDistrict.name : currentCountry.name}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
