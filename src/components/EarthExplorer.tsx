import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { BANGLADESH_DISTRICT_GEOMETRIES, DistrictGeoFeature } from '../data/bangladeshDistrictsGeo';
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
  Maximize2,
  CheckCircle2,
  Activity,
} from 'lucide-react';

export type GeoLevel = 'world' | 'south-asia' | 'bangladesh' | 'district';

interface EarthExplorerProps {
  initialLevel?: GeoLevel;
  selectedDistrictId?: string;
  onSelectDistrict?: (districtId: string) => void;
  onNavigateToInvestigate?: (districtId?: string) => void;
  activeVariable?: 'lst' | 'rainfall' | 'ndvi' | 'tws' | 'solar';
  dataset?: NasaSourceRecord;
  heightClass?: string;
  showInvestigationAction?: boolean;
}

export const EarthExplorer: React.FC<EarthExplorerProps> = ({
  initialLevel = 'south-asia',
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

  // Geographic Hierarchy State
  const [geoLevel, setGeoLevel] = useState<GeoLevel>(initialLevel);
  const [activeDistrictIdState, setActiveDistrictIdState] = useState<string>(selectedDistrictId);
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Sync external district selection
  useEffect(() => {
    if (selectedDistrictId) {
      setActiveDistrictIdState(selectedDistrictId);
    }
  }, [selectedDistrictId]);

  // Target Camera State
  const targetZ = useRef<number>(initialLevel === 'world' ? 4.8 : initialLevel === 'south-asia' ? 3.5 : 2.2);
  const targetRotX = useRef<number>(0.35); // ~23.5°N
  const targetRotY = useRef<number>(-1.57); // ~90.35°E
  const isInteracting = useRef<boolean>(false);

  // Active district data
  const currentDistrict = useMemo(() => {
    return (
      BANGLADESH_DISTRICTS.find((d) => d.id === activeDistrictIdState) ||
      BANGLADESH_DISTRICTS[0]
    );
  }, [activeDistrictIdState]);

  const hoveredDistrict = useMemo(() => {
    if (!hoveredDistrictId) return null;
    return BANGLADESH_DISTRICTS.find((d) => d.id === hoveredDistrictId) || null;
  }, [hoveredDistrictId]);

  // Navigate geographic scale
  const navigateToLevel = useCallback((level: GeoLevel, districtId?: string) => {
    setGeoLevel(level);
    if (districtId) {
      setActiveDistrictIdState(districtId);
      onSelectDistrict?.(districtId);
    }

    if (level === 'world') {
      targetZ.current = 4.8;
      targetRotX.current = 0.2;
    } else if (level === 'south-asia') {
      targetZ.current = 3.5;
      targetRotX.current = 0.35; // 23.5°N
      targetRotY.current = -1.57; // 90°E
    } else if (level === 'bangladesh') {
      targetZ.current = 2.18;
      targetRotX.current = 0.412; // 23.68°N
      targetRotY.current = -1.577; // 90.35°E
    } else if (level === 'district') {
      targetZ.current = 1.95;
      const d = BANGLADESH_DISTRICT_GEOMETRIES.find((item) => item.id === (districtId || activeDistrictIdState));
      if (d) {
        const latRad = (d.center[1] * Math.PI) / 180;
        const lonRad = (d.center[0] * Math.PI) / 180;
        targetRotX.current = latRad;
        targetRotY.current = -lonRad;
      }
    }
  }, [activeDistrictIdState, onSelectDistrict]);

  // WebGL Three.js Initialization
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
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Photorealistic Lighting
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(6, 4, 5);
    scene.add(sunLight);

    // Soft atmospheric rim light with deep violet scattering
    const atmosphericRim = new THREE.DirectionalLight(0x8b5cf6, 1.1);
    atmosphericRim.position.set(-6, -2, -4);
    scene.add(atmosphericRim);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    globeGroup.rotation.x = targetRotX.current;
    globeGroup.rotation.y = targetRotY.current;

    // 6. Photorealistic High-Definition Texture Map Canvas (2048x1024)
    const earthRadius = 1.25;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // A. Deep Oceanic Blue Marble Bathymetry
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#07152b'); // Polar abyssal plain
    oceanGrad.addColorStop(0.25, '#0b2144'); // Sub-polar ocean
    oceanGrad.addColorStop(0.5, '#091c3a'); // Equatorial deep ocean
    oceanGrad.addColorStop(0.75, '#0b2144');
    oceanGrad.addColorStop(1, '#07152b');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Helper: Equirectangular projection coordinates
    const toCanvas = (lon: number, lat: number): [number, number] => [
      ((lon + 180) / 360) * 2048,
      ((90 - lat) / 180) * 1024,
    ];

    // B. Real geographic boundary chains with authentic land biomes
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
    const forestGreen = '#1f482e'; // Lush vegetation / rainforest
    const temperateGreen = '#36613d'; // Temperate plains
    const savannaOlive = '#687747'; // Subtropical savanna
    const desertOchre = '#b59367'; // Arid Sahara / Arabia / Thar
    const alpineSnow = '#f1f5f9'; // Arctic & Himalayan glacial shields

    // Eurasia & South Asia
    drawLandmass(
      [
        [-9, 36], [0, 44], [10, 54], [25, 71], [60, 75], [100, 77], [140, 72], [170, 66],
        [180, 64], [170, 60], [142, 50], [130, 40], [122, 30], [115, 22], [108, 12], [100, 4],
        [98, 10], [92, 16], [92, 21], [88, 22], [85, 20], [80, 10], [77, 8], [73, 16], [68, 24],
        [60, 25], [55, 28], [50, 30], [36, 31], [26, 36], [15, 38], [5, 36], [-9, 36],
      ],
      temperateGreen
    );

    // Tropical Southeast Asia & South Asian River Basins
    drawLandmass(
      [
        [73, 16], [77, 8], [80, 10], [88, 22], [92, 21], [98, 10], [104, 11], [108, 16],
        [106, 21], [98, 23], [90, 24], [82, 23], [75, 20],
      ],
      forestGreen
    );

    // Tibetan Plateau & High Himalayan Glaciers
    drawLandmass(
      [[75, 37], [85, 36], [95, 35], [102, 32], [96, 28], [88, 28], [82, 29], [76, 33]],
      savannaOlive
    );
    drawLandmass(
      [[77, 33], [82, 30], [86, 28.5], [89, 28], [93, 29], [90, 29], [84, 31], [78, 34]],
      alpineSnow
    );

    // Middle East & North Africa Desert Belt
    drawLandmass(
      [[-17, 30], [10, 37], [32, 31], [50, 30], [58, 24], [55, 15], [44, 12], [35, 15], [32, 22], [15, 22], [-17, 21], [-17, 30]],
      desertOchre
    );

    // Sub-Saharan Africa
    drawLandmass(
      [[-17, 15], [10, 5], [42, 10], [51, 11], [40, -10], [35, -25], [30, -32], [18, -34], [12, -15], [0, 5], [-15, 12], [-17, 15]],
      forestGreen
    );

    // North & South Americas
    drawLandmass(
      [[-168, 65], [-140, 70], [-100, 72], [-65, 60], [-55, 48], [-70, 42], [-80, 25], [-90, 18], [-105, 20], [-115, 32], [-124, 48], [-150, 60], [-168, 65]],
      forestGreen
    );
    drawLandmass(
      [[-78, 10], [-60, 8], [-35, -5], [-40, -22], [-55, -40], [-68, -55], [-75, -45], [-72, -18], [-80, -2], [-78, 10]],
      forestGreen
    );

    // Australia & Polar Caps
    drawLandmass([[114, -22], [125, -15], [135, -12], [148, -20], [152, -35], [138, -38], [120, -35], [114, -25]], desertOchre);
    drawLandmass([[-180, -70], [180, -70], [180, -90], [-180, -90]], alpineSnow);

    // C. Genuine Bangladesh Territory Polygon
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
    ctx.fillStyle = '#7c3aed'; // GlobTraceX Brand Purple
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // D. Subtle Scientific Graticule Overlay
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.25)';
    ctx.lineWidth = 1;
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

    // Tropic of Cancer Convergence (23.436° N)
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.6)';
    ctx.lineWidth = 1.5;
    const yTropicCancer = ((90 - 23.436) / 180) * 1024;
    ctx.beginPath();
    ctx.moveTo(0, yTropicCancer);
    ctx.lineTo(2048, yTropicCancer);
    ctx.stroke();

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    // 7. Earth Mesh
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.62,
      metalness: 0.08,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 8. Atmospheric Rayleigh Halo Outer Mesh
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
          gl_FragColor = vec4(0.75, 0.65, 0.98, 1.0) * intensity * 0.95;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 9. Bangladesh 3D Target Reticle Marker
    const bdLat = 23.685;
    const bdLon = 90.356;
    const latRad = (bdLat * Math.PI) / 180;
    const lonRad = ((bdLon + 180) * Math.PI) / 180;
    const targetR = earthRadius * 1.018;

    const targetX = -targetR * Math.cos(latRad) * Math.cos(lonRad);
    const targetY = targetR * Math.sin(latRad);
    const targetZCoord = targetR * Math.cos(latRad) * Math.sin(lonRad);

    const targetMarkerGroup = new THREE.Group();
    targetMarkerGroup.position.set(targetX, targetY, targetZCoord);

    // Core pulsing dot
    const pinDotGeo = new THREE.SphereGeometry(0.038, 16, 16);
    const pinDotMat = new THREE.MeshBasicMaterial({ color: 0x9333ea });
    const pinDot = new THREE.Mesh(pinDotGeo, pinDotMat);
    targetMarkerGroup.add(pinDot);

    // Outer Target Rings
    const ringGeo = new THREE.RingGeometry(0.065, 0.088, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.lookAt(targetMarkerGroup.position);
    targetMarkerGroup.add(ringMesh);

    globeGroup.add(targetMarkerGroup);

    // 10. Pointer-Event Touch and Drag Interaction with Momentum
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
        // Pinch zoom initiation
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
        // Multi-touch pinch zoom
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

    // Desktop Wheel Zoom
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

    // 11. Animation Loop with Smooth Camera Slerp
    let time = 0;
    const animate = () => {
      time += 0.02;
      animFrameRef.current = requestAnimationFrame(animate);

      // Smooth camera interpolation
      camera.position.z += (targetZ.current - camera.position.z) * 0.085;

      // Inertial damping
      if (!isDragging) {
        globeGroup.rotation.y += velocityX;
        globeGroup.rotation.x += velocityY;
        velocityX *= 0.92;
        velocityY *= 0.92;

        // If not actively interacted with, converge toward target camera angles
        if (!isInteracting.current) {
          globeGroup.rotation.y += (targetRotY.current - globeGroup.rotation.y) * 0.04;
          globeGroup.rotation.x += (targetRotX.current - globeGroup.rotation.x) * 0.04;
        }
      }

      // Pulse reticle ring
      const ringScale = 1.0 + Math.sin(time * 3.8) * 0.28;
      ringMesh.scale.set(ringScale, ringScale, ringScale);
      ringMat.opacity = Math.max(0.12, 0.9 - (ringScale - 1) * 2.2);

      renderer.render(scene, camera);
    };
    animate();
    setIsLoaded(true);

    // 12. Responsive Resize
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
  }, []);

  // 13. High-Fidelity SVG Coordinate Mapping for Bangladesh District Overlay (When geoLevel >= 'bangladesh')
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

  const getDistrictFill = (district: BangladeshDistrict, isSelected: boolean, isHovered: boolean) => {
    if (isSelected) return '#7c3aed';
    if (isHovered) return '#c084fc';

    if (activeVariable === 'lst') {
      const norm = Math.min(1, Math.max(0, (district.lstTrendPerDecade_C - 0.25) / 0.28));
      return norm > 0.65 ? '#8b5cf6' : norm > 0.35 ? '#a78bfa' : '#ede9fe';
    } else if (activeVariable === 'rainfall') {
      const norm = Math.min(1, Math.max(0, (district.annualRainfall_mm - 1400) / 3200));
      return norm > 0.65 ? '#6d28d9' : norm > 0.35 ? '#8b5cf6' : '#ddd6fe';
    } else if (activeVariable === 'ndvi') {
      const norm = Math.min(1, Math.max(0, (district.meanNDVI - 0.35) / 0.35));
      return norm > 0.65 ? '#059669' : norm > 0.35 ? '#10b981' : '#a7f3d0';
    }
    return '#f5f3ff';
  };

  const isBangladeshFocused = geoLevel === 'bangladesh' || geoLevel === 'district';

  return (
    <div className={`relative w-full ${heightClass} bg-slate-950 rounded-3xl overflow-hidden border border-purple-900/40 shadow-2xl flex flex-col justify-between select-none`}>
      {/* Top Header: Scientific Geographic Scale Navigation Breadcrumb */}
      <div className="relative z-20 p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-b border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
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
            onClick={() => navigateToLevel('south-asia')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              geoLevel === 'south-asia'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-200 hover:text-white hover:bg-purple-950/60'
            }`}
          >
            South Asia
          </button>

          <span className="text-purple-500 font-bold">›</span>

          <button
            onClick={() => navigateToLevel('bangladesh')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              geoLevel === 'bangladesh'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-200 hover:text-white hover:bg-purple-950/60'
            }`}
          >
            Bangladesh GIS
          </button>

          {geoLevel === 'district' && (
            <>
              <span className="text-purple-500 font-bold">›</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-900/80 text-purple-200 border border-purple-500/40 font-bold">
                {currentDistrict.name}
              </span>
            </>
          )}
        </div>

        {/* View Controls & Reset */}
        <div className="flex items-center gap-1.5 text-xs text-purple-200">
          <button
            onClick={() => {
              targetZ.current = Math.max(1.8, targetZ.current - 0.5);
            }}
            className="p-1.5 rounded-lg bg-slate-800/90 border border-purple-500/30 hover:bg-purple-900/60"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              targetZ.current = Math.min(5.5, targetZ.current + 0.5);
            }}
            className="p-1.5 rounded-lg bg-slate-800/90 border border-purple-500/30 hover:bg-purple-900/60"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigateToLevel(initialLevel)}
            className="p-1.5 rounded-lg bg-slate-800/90 border border-purple-500/30 hover:bg-purple-900/60"
            title="Reset Perspective"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Geographic Canvas Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Layer 1: 3D Earth Globe Canvas (always rendered in background, smoothly interpolated) */}
        <div
          ref={containerRef}
          className={`absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-500 ${
            isBangladeshFocused ? 'opacity-25 pointer-events-none' : 'opacity-100'
          }`}
          style={{ touchAction: 'none' }}
        />

        {/* Layer 2: High-Resolution Bangladesh GIS Administrative Boundary Map (Activates when zoomed into Bangladesh) */}
        {isBangladeshFocused && (
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

                const fillColor = getDistrictFill(districtData, isSelected, isHovered);
                const [cx, cy] = toGisSvg(geo.center[0], geo.center[1]);

                return (
                  <g
                    key={geo.id}
                    onClick={() => {
                      navigateToLevel('district', geo.id);
                    }}
                    onMouseEnter={() => setHoveredDistrictId(geo.id)}
                    onMouseLeave={() => setHoveredDistrictId(null)}
                    className="cursor-pointer group"
                  >
                    <polygon
                      points={ptsStr}
                      fill={fillColor}
                      stroke={isSelected ? '#ffffff' : '#312e81'}
                      strokeWidth={isSelected ? 2.8 : 1.2}
                      className="transition-colors duration-150"
                    />

                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 4.5 : 2.5}
                      fill={isSelected ? '#ffffff' : '#4338ca'}
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
      <div className="relative z-20 p-3 sm:p-4 bg-slate-900/90 backdrop-blur-md border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
          <div className="text-white text-[11px]">
            <span className="font-extrabold text-purple-300 block">
              {isBangladeshFocused
                ? `${(hoveredDistrict || currentDistrict).name} District • ${(hoveredDistrict || currentDistrict).divisionName} Division`
                : 'PLANETARY EARTH • SOUTH ASIA TELEMETRY'}
            </span>
            <span className="text-[10px] text-purple-200/80">
              {isBangladeshFocused
                ? `Elevation: ${(hoveredDistrict || currentDistrict).elevationMeters}m MSL • ${(hoveredDistrict || currentDistrict).isCoastal ? 'Coastal Delta' : 'Inland Basin'}`
                : 'Tropic of Cancer: 23.436° N • Central Coordinates: 23.685° N, 90.356° E'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isBangladeshFocused ? (
            <button
              onClick={() => navigateToLevel('bangladesh')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-['Space_Grotesk'] font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 border border-purple-400/40"
            >
              <span>Focus Bangladesh →</span>
            </button>
          ) : (
            showInvestigationAction && (
              <button
                onClick={() => onNavigateToInvestigate?.(activeDistrictIdState)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-['Space_Grotesk'] font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 border border-purple-400/40"
              >
                <span>Investigate {currentDistrict.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
