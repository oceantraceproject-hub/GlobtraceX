import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface ThreeEarthGlobeProps {
  onSelectBangladesh?: () => void;
  isZoomedToBangladesh?: boolean;
  onCameraChange?: (mode: 'world' | 'south-asia' | 'bangladesh') => void;
  heightClass?: string;
  showFocusTarget?: boolean;
}

export const ThreeEarthGlobe: React.FC<ThreeEarthGlobeProps> = ({
  onSelectBangladesh,
  isZoomedToBangladesh = false,
  onCameraChange,
  heightClass = 'h-[440px] sm:h-[500px]',
  showFocusTarget = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [currentZoomMode, setCurrentZoomMode] = useState<'world' | 'south-asia' | 'bangladesh'>('south-asia');

  // References for camera interpolation
  const targetCamZ = useRef<number>(3.6);
  const targetRotX = useRef<number>(0.32); // Center on ~23.5°N
  const targetRotY = useRef<number>(-1.57); // Center on ~90°E
  const isInteracting = useRef<boolean>(false);

  // Set zoom view targets
  const setView = useCallback((mode: 'world' | 'south-asia' | 'bangladesh') => {
    setCurrentZoomMode(mode);
    onCameraChange?.(mode);
    if (mode === 'world') {
      targetCamZ.current = 4.8;
      targetRotX.current = 0.2;
    } else if (mode === 'south-asia') {
      targetCamZ.current = 3.6;
      targetRotX.current = 0.35;
      targetRotY.current = -1.57; // ~90.35°E
    } else if (mode === 'bangladesh') {
      targetCamZ.current = 2.45;
      targetRotX.current = 0.41;
      targetRotY.current = -1.577;
    }
  }, [onCameraChange]);

  useEffect(() => {
    if (isZoomedToBangladesh) {
      setView('bangladesh');
    }
  }, [isZoomedToBangladesh, setView]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, targetCamZ.current);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting - Scientific Sun & Ambient Sky
    const ambientLight = new THREE.AmbientLight(0xf1f5f9, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(5, 3.5, 4);
    scene.add(sunLight);

    // Atmospheric rim back-light with soft lavender violet tint
    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 1.2);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Initialize rotation toward South Asia (Bangladesh)
    globeGroup.rotation.x = targetRotX.current;
    globeGroup.rotation.y = targetRotY.current;

    // 6. Realistic Procedural High-Res Earth Texture
    // High-resolution canvas mapping accurate natural terrain and ocean colors
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // A. Deep Oceanic Blue Marble with bathymetry shading
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#0c1b33'); // Polar deeps
    oceanGrad.addColorStop(0.3, '#102a54'); // Temperate ocean
    oceanGrad.addColorStop(0.5, '#0d2042'); // Equatorial ocean
    oceanGrad.addColorStop(0.7, '#102a54');
    oceanGrad.addColorStop(1, '#0c1b33');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Sub-surface shallow continental shelves (lighter cyan-blue around coasts)
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Helper: Equirectangular projection coordinates
    const toCanvas = (lon: number, lat: number): [number, number] => [
      ((lon + 180) / 360) * 2048,
      ((90 - lat) / 180) * 1024,
    ];

    // B. Real geographic boundary coordinate chains for Earth continents
    const drawLandmass = (coords: [number, number][], fillColor: string, strokeColor = '#2e1065') => {
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

    // Realistic natural terrain pigmentation
    const terrainGreen = '#2e5b38'; // Tropical & temperate forest
    const terrainSavanna = '#4a6741'; // Deciduous/subtropical
    const terrainArid = '#967a50'; // Desert/steppe
    const terrainSahara = '#b89868'; // Sahara/Arabian desert
    const terrainSnow = '#e2e8f0'; // Arctic/Himalayan ice

    // Eurasia & South Asia (Rich contiguous landmass)
    drawLandmass(
      [
        [-9, 36], [0, 44], [10, 54], [25, 71], [60, 75], [100, 77], [140, 72], [170, 66],
        [180, 64], [170, 60], [142, 50], [130, 40], [122, 30], [115, 22], [108, 12], [100, 4],
        [98, 10], [92, 16], [92, 21], [88, 22], [85, 20], [80, 10], [77, 8], [73, 16], [68, 24],
        [60, 25], [55, 28], [50, 30], [36, 31], [26, 36], [15, 38], [5, 36], [-9, 36]
      ],
      terrainGreen
    );

    // Tibetan Plateau / Himalaya arid elevation
    drawLandmass(
      [
        [75, 37], [85, 36], [95, 35], [102, 32], [96, 28], [88, 28], [82, 29], [76, 33]
      ],
      terrainArid
    );

    // Himalayan Snow Shield
    drawLandmass(
      [
        [77, 33], [82, 30], [86, 28.5], [89, 28], [93, 29], [90, 29], [84, 31], [78, 34]
      ],
      terrainSnow
    );

    // Middle East & North Africa Desert Belt
    drawLandmass(
      [
        [-17, 30], [10, 37], [32, 31], [50, 30], [58, 24], [55, 15], [44, 12], [35, 15],
        [32, 22], [15, 22], [-17, 21], [-17, 30]
      ],
      terrainSahara
    );

    // Sub-Saharan Africa
    drawLandmass(
      [
        [-17, 15], [10, 5], [42, 10], [51, 11], [40, -10], [35, -25], [30, -32], [18, -34],
        [12, -15], [0, 5], [-15, 12], [-17, 15]
      ],
      terrainSavanna
    );

    // North America
    drawLandmass(
      [
        [-168, 65], [-140, 70], [-100, 72], [-65, 60], [-55, 48], [-70, 42], [-80, 25],
        [-90, 18], [-105, 20], [-115, 32], [-124, 48], [-150, 60], [-168, 65]
      ],
      terrainGreen
    );

    // South America
    drawLandmass(
      [
        [-78, 10], [-60, 8], [-35, -5], [-40, -22], [-55, -40], [-68, -55], [-75, -45],
        [-72, -18], [-80, -2], [-78, 10]
      ],
      terrainGreen
    );

    // Australia
    drawLandmass(
      [
        [114, -22], [125, -15], [135, -12], [148, -20], [152, -35], [138, -38], [120, -35], [114, -25]
      ],
      terrainArid
    );

    // Antarctica Ice Shield
    drawLandmass(
      [
        [-180, -70], [180, -70], [180, -90], [-180, -90]
      ],
      terrainSnow
    );

    // C. Bangladesh Geographic Highlight Contour on the Globe
    const bdContour: [number, number][] = [
      [88.05, 26.65], [89.00, 26.30], [89.90, 25.90], [90.50, 25.20],
      [91.80, 25.25], [92.40, 24.80], [92.35, 23.90], [92.65, 22.40],
      [92.30, 21.00], [91.80, 21.60], [91.40, 22.30], [90.50, 22.00],
      [89.10, 21.70], [88.90, 22.80], [88.10, 24.50], [88.05, 26.65]
    ];

    ctx.beginPath();
    bdContour.forEach(([lon, lat], i) => {
      const [x, y] = toCanvas(lon, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = '#7c3aed'; // Deep brand purple
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // D. Subtle Scientific Graticule Overlay (Latitude & Longitude grid lines)
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.22)';
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

    // Equator & Tropic of Cancer (23.5°N runs directly across Bangladesh!)
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.55)';
    ctx.lineWidth = 1.5;
    const yTropicCancer = ((90 - 23.436) / 180) * 1024;
    ctx.beginPath();
    ctx.moveTo(0, yTropicCancer);
    ctx.lineTo(2048, yTropicCancer);
    ctx.stroke();

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    // 7. Earth Mesh Geometry
    const earthRadius = 1.25;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 8. Realistic Atmospheric Rayleigh Scattering Halo
    const atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.035, 64, 64);
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
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.72, 0.60, 0.98, 1.0) * intensity * 0.9;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 9. Bangladesh Target Indicator Ring & Scientific Crosshair
    const bdLat = 23.68;
    const bdLon = 90.35;
    const latRad = (bdLat * Math.PI) / 180;
    const lonRad = ((bdLon + 180) * Math.PI) / 180;
    const targetR = earthRadius * 1.015;

    const targetX = -targetR * Math.cos(latRad) * Math.cos(lonRad);
    const targetY = targetR * Math.sin(latRad);
    const targetZ = targetR * Math.cos(latRad) * Math.sin(lonRad);

    const targetGroup = new THREE.Group();
    targetGroup.position.set(targetX, targetY, targetZ);

    // Core pulsing dot
    const pinDotGeo = new THREE.SphereGeometry(0.035, 16, 16);
    const pinDotMat = new THREE.MeshBasicMaterial({ color: 0x9333ea });
    const pinDot = new THREE.Mesh(pinDotGeo, pinDotMat);
    targetGroup.add(pinDot);

    // Outer Target Rings
    const ringGeo = new THREE.RingGeometry(0.06, 0.08, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.lookAt(targetGroup.position);
    targetGroup.add(ringMesh);

    globeGroup.add(targetGroup);

    // 10. Multi-Touch Pinch & Desktop Drag Orbit Handling
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let initialPinchDist = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      isInteracting.current = true;
      prevX = e.clientX;
      prevY = e.clientY;
      velocityX = 0;
      velocityY = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      globeGroup.rotation.y += dx * 0.005;
      globeGroup.rotation.x += dy * 0.005;
      globeGroup.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroup.rotation.x));

      velocityX = dx * 0.005;
      velocityY = dy * 0.005;
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => {
        isInteracting.current = false;
      }, 800);
    };

    // Desktop Wheel Zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.0025;
      targetCamZ.current = Math.max(2.1, Math.min(5.5, targetCamZ.current + zoomDelta));
    };

    // Mobile / Tablet Multi-Touch (One-Finger Rotate, Two-Finger Pinch Zoom)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        isInteracting.current = true;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
        velocityX = 0;
        velocityY = 0;
      } else if (e.touches.length === 2) {
        // Pinch zoom start
        isDragging = false;
        isInteracting.current = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - prevX;
        const dy = e.touches[0].clientY - prevY;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;

        globeGroup.rotation.y += dx * 0.006;
        globeGroup.rotation.x += dy * 0.006;
        globeGroup.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroup.rotation.x));

        velocityX = dx * 0.006;
        velocityY = dy * 0.006;
      } else if (e.touches.length === 2) {
        // Pinch zoom move
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = (initialPinchDist - dist) * 0.008;
        initialPinchDist = dist;
        targetCamZ.current = Math.max(2.1, Math.min(5.5, targetCamZ.current + factor));
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      setTimeout(() => {
        isInteracting.current = false;
      }, 800);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 11. Render Animation Loop with Smooth Camera Slerp
    let time = 0;
    const animate = () => {
      time += 0.02;
      animFrameRef.current = requestAnimationFrame(animate);

      // Smooth camera zoom interpolation
      camera.position.z += (targetCamZ.current - camera.position.z) * 0.08;

      // Handle dragging inertia damping
      if (!isDragging) {
        globeGroup.rotation.y += velocityX;
        globeGroup.rotation.x += velocityY;
        velocityX *= 0.92;
        velocityY *= 0.92;

        // If not actively dragged, gently converge toward target camera angles if set
        if (!isInteracting.current) {
          globeGroup.rotation.y += (targetRotY.current - globeGroup.rotation.y) * 0.035;
          globeGroup.rotation.x += (targetRotX.current - globeGroup.rotation.x) * 0.035;
        }
      }

      // Pulse Bangladesh targeting ring
      const ringScale = 1.0 + Math.sin(time * 3.5) * 0.28;
      ringMesh.scale.set(ringScale, ringScale, ringScale);
      ringMat.opacity = Math.max(0.1, 0.9 - (ringScale - 1) * 2.2);

      renderer.render(scene, camera);
    };
    animate();

    // 12. Resize Listener
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full ${heightClass} select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e0924] via-[#140e34] to-[#070414] border border-purple-900/40 shadow-2xl`}>
      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        title="Drag or swipe to rotate. Pinch or scroll to zoom."
      />

      {/* Scientific Geographic Hierarchy Selector Bar (World → South Asia → Bangladesh) */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-purple-500/30 text-xs font-mono shadow-xl z-20">
        <button
          onClick={() => setView('world')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            currentZoomMode === 'world'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-200 hover:text-white hover:bg-purple-950/60'
          }`}
        >
          World
        </button>
        <span className="text-purple-400 font-bold">›</span>
        <button
          onClick={() => setView('south-asia')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            currentZoomMode === 'south-asia'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-200 hover:text-white hover:bg-purple-950/60'
          }`}
        >
          South Asia
        </button>
        <span className="text-purple-400 font-bold">›</span>
        <button
          onClick={() => setView('bangladesh')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            currentZoomMode === 'bangladesh'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-200 hover:text-white hover:bg-purple-950/60'
          }`}
        >
          Bangladesh Focus
        </button>
      </div>

      {/* Scientific Telemetry Badge Overlay */}
      {showFocusTarget && (
        <div className="absolute bottom-4 left-4 p-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-purple-500/30 text-white text-xs font-mono space-y-1 shadow-2xl pointer-events-none z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
            <span className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              EARTH OBSERVATION • BANGLADESH FOCUS
            </span>
          </div>
          <div className="text-[10px] text-purple-200">
            Coordinates: 23.6850° N, 90.3563° E • Tropic of Cancer Convergence
          </div>
        </div>
      )}

      {/* Direct Investigation Jump CTA */}
      {onSelectBangladesh && (
        <button
          onClick={onSelectBangladesh}
          className="absolute bottom-4 right-4 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-['Space_Grotesk'] font-bold text-xs shadow-xl transition-all flex items-center gap-2 active:scale-95 z-20 border border-purple-400/40"
        >
          <span>Launch District Investigation</span>
          <span className="text-sm">→</span>
        </button>
      )}
    </div>
  );
};
