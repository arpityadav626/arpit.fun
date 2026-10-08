import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import type { ToolDefinition } from '../types';
import { getToolCatalog } from '../lib/toolCatalog';
import { useSettings } from '../context/SettingsContext';
import { soundEngine } from '../lib/audioSynth';
import { createCardTexture } from '../lib/cardTextures';
import { ArrowUpRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface ThreeCardsSpiralProps {
  onSelectTool: (tool: ToolDefinition) => void;
  isModalOpen?: boolean;
}

// GLSL Vertex Shader: Computes world position and curvature normals
const cardVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

// GLSL Fragment Shader: Dynamic Depth of Field (DoF) multi-tap Poisson/Gaussian disc blur
// Front card in spotlight is 100% pin-sharp; background/depth cards are smoothly blurred!
const cardFragmentShader = `
  uniform sampler2D map;
  uniform float focalZ;
  uniform float blurStrength;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    // Distance behind the front focal plane (focalZ is ~3.0)
    float depthDist = max(0.0, focalZ - vWorldPosition.z);
    
    // Smooth blur ramp: 0.0 at focal plane, ramps up to 1.0 into background depth
    float blurFactor = smoothstep(0.8, 5.2, depthDist) * blurStrength;

    vec4 color = vec4(0.0);
    if (blurFactor < 0.0006) {
      // 100% Crisp / Razor-sharp when in the front focal zone
      color = texture2D(map, vUv);
    } else {
      // Multi-tap Gaussian disc blur for background depth cards
      vec2 offset = vec2(blurFactor);
      color += texture2D(map, vUv) * 0.22;
      color += texture2D(map, vUv + vec2(offset.x, 0.0)) * 0.13;
      color += texture2D(map, vUv - vec2(offset.x, 0.0)) * 0.13;
      color += texture2D(map, vUv + vec2(0.0, offset.y)) * 0.13;
      color += texture2D(map, vUv - vec2(0.0, offset.y)) * 0.13;
      color += texture2D(map, vUv + vec2(offset.x * 0.707, offset.y * 0.707)) * 0.065;
      color += texture2D(map, vUv - vec2(offset.x * 0.707, offset.y * 0.707)) * 0.065;
      color += texture2D(map, vUv + vec2(-offset.x * 0.707, offset.y * 0.707)) * 0.065;
      color += texture2D(map, vUv + vec2(offset.x * 0.707, -offset.y * 0.707)) * 0.065;
    }

    if (color.a < 0.05) discard;

    // Subtle depth dimming: background cards are gently dimmer so front card pops
    float depthDim = clamp(1.0 - depthDist * 0.075, 0.42, 1.0);
    color.rgb *= depthDim;

    // Specular highlight based on curved surface normal
    vec3 lightDir = normalize(vec3(0.3, 0.8, 1.0));
    float spec = pow(max(dot(vNormal, lightDir), 0.0), 16.0) * 0.15;
    color.rgb += vec3(spec);

    gl_FragColor = color;
  }
`;

export const ThreeCardsSpiral: React.FC<ThreeCardsSpiralProps> = ({ onSelectTool, isModalOpen = false }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { soundEnabled, reducedMotion } = useSettings();
  const [catalog, setCatalog] = useState<ToolDefinition[]>(() => getToolCatalog());
  const [hoveredTool, setHoveredTool] = useState<{ tool: ToolDefinition; x: number; y: number } | null>(null);

  // Active front card tracking (card closest to viewer in focal spotlight)
  const [activeFrontTool, setActiveFrontTool] = useState<ToolDefinition>(() => getToolCatalog()[0]);
  const [activeFrontIndex, setActiveFrontIndex] = useState<number>(0);
  const activeFrontIdRef = useRef<string>(getToolCatalog()[0]?.id || '');
  const targetScrollRef = useRef<number>(0);
  const currentScrollRef = useRef<number>(0);

  // Stable references that never trigger scene recreation
  const onSelectToolRef = useRef(onSelectTool);
  useEffect(() => {
    onSelectToolRef.current = onSelectTool;
  }, [onSelectTool]);

  const isModalOpenRef = useRef(isModalOpen);
  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  // Step 1 card backward along helical loop (snapped)
  const handlePrevCard = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (soundEnabled) soundEngine.playKeyClick();
    const step = (Math.PI * 2) / Math.max(1, catalog.length);
    const currentSnap = Math.round(targetScrollRef.current / step);
    targetScrollRef.current = (currentSnap - 1) * step;
  };

  // Step 1 card forward along helical loop (snapped)
  const handleNextCard = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (soundEngine.isEnabled()) soundEngine.playKeyClick();
    const step = (Math.PI * 2) / Math.max(1, catalog.length);
    const currentSnap = Math.round(targetScrollRef.current / step);
    targetScrollRef.current = (currentSnap + 1) * step;
  };

  // Center spiral onto a specific tool ID (shortest rotational path)
  const centerOnTool = (toolId: string) => {
    const index = catalog.findIndex((t) => t.id === toolId);
    if (index === -1) return;
    const step = (Math.PI * 2) / Math.max(1, catalog.length);
    const currentRotations = Math.round(targetScrollRef.current / (Math.PI * 2));
    let desired = currentRotations * (Math.PI * 2) - index * step;
    while (desired - targetScrollRef.current > Math.PI) desired -= Math.PI * 2;
    while (desired - targetScrollRef.current < -Math.PI) desired += Math.PI * 2;
    targetScrollRef.current = desired;
  };

  useEffect(() => {
    const handleCenterEvent = (e: Event) => {
      const ce = e as CustomEvent<{ toolId: string }>;
      if (ce.detail?.toolId) {
        centerOnTool(ce.detail.toolId);
      }
    };
    window.addEventListener('webhub:center_tool', handleCenterEvent);
    return () => window.removeEventListener('webhub:center_tool', handleCenterEvent);
  }, [catalog]);

  // Sync catalog updates
  useEffect(() => {
    const handleUpdate = () => {
      setCatalog(getToolCatalog());
    };
    window.addEventListener('webhub:catalog_updated', handleUpdate);
    return () => window.removeEventListener('webhub:catalog_updated', handleUpdate);
  }, []);

  const displayTools = useMemo(() => {
    return catalog;
  }, [catalog]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070709, 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 12.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // 2. Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const cyanRimLight = new THREE.PointLight(0x22d3ee, 2.8, 30);
    cyanRimLight.position.set(-6, 5, 8);
    scene.add(cyanRimLight);

    const warmFillLight = new THREE.PointLight(0xa855f7, 2.0, 30);
    warmFillLight.position.set(6, -5, 5);
    scene.add(warmFillLight);

    // 3. Card Meshes with Cylindrical Curvature & Smaller Proportions
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    const meshes: THREE.Mesh[] = [];
    // User requested "chota karo" -> proportional compact size
    const cardWidth = 3.3;
    const cardHeight = 2.1;
    const totalCards = displayTools.length;

    // Cylindrical curved geometry
    const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 32, 1);
    const posAttribute = geometry.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const vx = posAttribute.getX(i);
      const curve = -Math.sin((vx / (cardWidth / 2)) * (Math.PI / 2)) * 0.32;
      posAttribute.setZ(i, curve);
    }
    geometry.computeVertexNormals();

    // Texture cache
    const textureMap = new Map<string, THREE.CanvasTexture>();

    displayTools.forEach((tool, index) => {
      let texture = textureMap.get(tool.id);
      if (!texture) {
        texture = createCardTexture(tool, index);
        textureMap.set(tool.id, texture);
      }

      // ShaderMaterial with dynamic Depth of Field blur
      const material = new THREE.ShaderMaterial({
        vertexShader: cardVertexShader,
        fragmentShader: cardFragmentShader,
        uniforms: {
          map: { value: texture },
          focalZ: { value: 3.4 },
          blurStrength: { value: 0.016 }, // ~16px blur in UV space for background cards
        },
        transparent: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = {
        tool,
        index,
      };

      meshes.push(mesh);
      cardGroup.add(mesh);
    });

    // 4. Closed 3D Helical Loop Formulation (100% Continuous Periodic Loop)
    // Period = 2 * PI. As currentScroll changes, cards circulate forever with zero breaks!
    let currentScroll = currentScrollRef.current;
    let mouseX = 0;
    let mouseY = 0;
    let isDragging = false;
    let startPointerY = 0;
    let startPointerX = 0;
    let dragVelocity = 0;
    let pointerDownPos = { x: 0, y: 0, time: 0 };

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    // Calibrated smooth & controlled multipliers (neither sluggish nor overly fast)
    const dragMultiplierY = isTouch ? 0.0075 : 0.0048;
    const dragMultiplierX = isTouch ? 0.0065 : 0.0048;

    let lastWheelTime = 0;

    const evalClosedLoop = (theta: number) => {
      // Perfectly centered periodic 3D space ribbon
      // Front focal card sits dead-center at theta = 0 at (0, 0, 3.4) - 100% DEAD CENTER & UPRIGHT!
      const x = 4.6 * Math.sin(theta) - 0.5 * Math.sin(2.0 * theta);
      const y = 0.65 - 0.65 * Math.cos(theta); // At theta=0, y=0.0! Background cards rise to 1.3
      const z = 3.4 * Math.cos(theta) - 0.2 * Math.cos(2.0 * theta) + 0.2; // At theta=0, z=3.4!

      return new THREE.Vector3(x, y, z);
    };

    const updateSpiralPositions = () => {
      const step = (Math.PI * 2) / Math.max(1, totalCards);

      meshes.forEach((mesh, index) => {
        // Continuous periodic angle
        const theta = currentScroll + index * step;

        const pos = evalClosedLoop(theta);
        mesh.position.copy(pos);

        // Compute tangent for smooth orientation along the ribbon
        const eps = 0.01;
        const posNext = evalClosedLoop(theta + eps);
        const tangent = posNext.clone().sub(pos).normalize();

        // Normal facing viewer / inward
        const upVec = new THREE.Vector3(0, 1, 0);
        const normal = new THREE.Vector3().crossVectors(tangent, upVec).normalize();

        mesh.lookAt(mesh.position.clone().add(normal));
      });
    };

    updateSpiralPositions();

    // 5. User Interaction Listeners - Smooth, Calibrated & Controlled
    const handleWheel = (e: WheelEvent) => {
      if (isModalOpenRef.current) return;
      e.preventDefault();
      lastWheelTime = Date.now();

      // Normalize delta across mice / trackpads (deltaMode 0: pixels, 1: lines, 2: pages)
      const rawDelta = e.deltaY * (e.deltaMode === 1 ? 28 : e.deltaMode === 2 ? 400 : 1);
      // Fluid, responsive wheel velocity
      const wheelMove = rawDelta * 0.0028;
      targetScrollRef.current += wheelMove;
      // Transfer smooth kinetic momentum on wheel release
      dragVelocity = wheelMove * 0.35;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isModalOpenRef.current) return;
      isDragging = true;
      dragVelocity = 0;
      startPointerX = e.clientX;
      startPointerY = e.clientY;
      pointerDownPos = { x: e.clientX, y: e.clientY, time: Date.now() };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isModalOpenRef.current) return;
      // Parallax
      mouseX = (e.clientX / width - 0.5) * 1.5;
      mouseY = (e.clientY / height - 0.5) * 1.5;

      if (isDragging) {
        const deltaX = e.clientX - startPointerX;
        const deltaY = e.clientY - startPointerY;
        const moveDelta = deltaX * dragMultiplierX - deltaY * dragMultiplierY;
        targetScrollRef.current += moveDelta;
        // Controlled, gentle momentum release
        dragVelocity = moveDelta * 0.45;
        startPointerX = e.clientX;
        startPointerY = e.clientY;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isModalOpenRef.current) {
        isDragging = false;
        return;
      }
      isDragging = false;
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      const elapsed = Date.now() - pointerDownPos.time;

      // Quick tap detection on mobile without dragging (< 10px movement, < 350ms)
      if (dist < 10 && elapsed < 350) {
        const rect = mount.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const tool = hit.userData.tool as ToolDefinition;
          if (tool) {
            soundEngine.playSearchPulse();
            onSelectToolRef.current(tool);
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 6. Raycasting for hover & click
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-1000, -1000);
    let currentHoveredMesh: THREE.Mesh | null = null;

    const handleMouseMoveForRaycast = (e: MouseEvent) => {
      if (isModalOpenRef.current) return;
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / height) * 2 + 1;
    };

    const handleClickForRaycast = (e: MouseEvent) => {
      if (isModalOpenRef.current) return;
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const tool = hit.userData.tool as ToolDefinition;
        if (tool) {
          soundEngine.playSearchPulse();
          onSelectToolRef.current(tool);
        }
      }
    };

    mount.addEventListener('mousemove', handleMouseMoveForRaycast);
    mount.addEventListener('click', handleClickForRaycast);

    // 7. Window Resize
    const handleResize = () => {
      if (!mount) return;
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Render Loop
    let animationFrameId: number;

    const animate = () => {
      // If modal is open, completely freeze inertia & drift, keep scene perfectly still
      if (isModalOpenRef.current) {
        dragVelocity = 0;
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Smooth, weighted interpolation for organic glide
      currentScroll += (targetScrollRef.current - currentScroll) * 0.075;
      currentScrollRef.current = currentScroll;

      // Kinetic inertia momentum on swipe release - smooth natural deceleration
      if (!isDragging && Math.abs(dragVelocity) > 0.00005) {
        targetScrollRef.current += dragVelocity;
        dragVelocity *= 0.85; // Decelerates gracefully within 300-400ms
      }

      // Check if user is actively interacting (dragging or wheeling)
      const isWheeling = Date.now() - lastWheelTime < 280;
      const isUserInteracting = isDragging || isWheeling;

      // Magnetic snap to center: smoothly locks nearest card dead-center ONLY when idle!
      if (!isUserInteracting && Math.abs(dragVelocity) <= 0.0002) {
        const step = (Math.PI * 2) / Math.max(1, totalCards);
        const snapTarget = Math.round(targetScrollRef.current / step) * step;
        targetScrollRef.current += (snapTarget - targetScrollRef.current) * 0.12;
      }

      // Parallax camera tilt
      camera.position.x += (mouseX * 0.65 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 0.65 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      updateSpiralPositions();

      // Detect frontmost card in focus (maximum Z closest to camera)
      let frontMesh: THREE.Mesh | null = null;
      let maxZ = -Infinity;
      for (let i = 0; i < meshes.length; i++) {
        const m = meshes[i];
        if (m.position.z > maxZ) {
          maxZ = m.position.z;
          frontMesh = m;
        }
      }

      if (frontMesh && frontMesh.userData.tool) {
        const fTool = frontMesh.userData.tool as ToolDefinition;
        const fIndex = frontMesh.userData.index as number;
        if (fTool.id !== activeFrontIdRef.current) {
          activeFrontIdRef.current = fTool.id;
          setActiveFrontTool(fTool);
          setActiveFrontIndex(fIndex);
          if (soundEnabled && isDragging) {
            soundEngine.playKeyClick();
          }
        }
      }

      // Raycasting check
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        if (currentHoveredMesh !== hitMesh) {
          if (currentHoveredMesh) {
            currentHoveredMesh.scale.set(1, 1, 1);
          }
          currentHoveredMesh = hitMesh;
          if (soundEnabled) {
            soundEngine.playKeyClick();
          }
        }
        hitMesh.scale.set(1.08, 1.08, 1.08);
        document.body.style.cursor = 'pointer';

        const screenPos = hitMesh.position.clone().project(camera);
        const sx = ((screenPos.x + 1) * width) / 2;
        const sy = ((-screenPos.y + 1) * height) / 2;
        setHoveredTool({
          tool: hitMesh.userData.tool,
          x: sx,
          y: sy,
        });
      } else {
        if (currentHoveredMesh) {
          currentHoveredMesh.scale.set(1, 1, 1);
          currentHoveredMesh = null;
        }
        document.body.style.cursor = 'default';
        setHoveredTool(null);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      mount.removeEventListener('mousemove', handleMouseMoveForRaycast);
      mount.removeEventListener('click', handleClickForRaycast);
      window.removeEventListener('resize', handleResize);
      document.body.style.cursor = 'default';

      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      meshes.forEach((m) => {
        (m.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, [catalog.length, soundEnabled, reducedMotion]);

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none select-none" />

      {/* Floating Pacomepertant-style Cursor Tooltip Tag */}
      {!isModalOpen && hoveredTool && (
        <div
          style={{
            left: `${hoveredTool.x}px`,
            top: `${hoveredTool.y - 65}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="pointer-events-none fixed z-30 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white text-zinc-950 shadow-[0_12px_32px_rgba(0,0,0,0.65)] border border-white/60">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-semibold text-xs tracking-tight">{hoveredTool.tool.name}</span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest pl-1 border-l border-zinc-200">
              LAUNCH
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-950" />
          </div>
          {/* Subtle pointer chevron */}
          <div className="w-2.5 h-2.5 rotate-45 bg-white -mt-1.5 shadow-xs" />
        </div>
      )}

      {/* Mobile-Only Active Front-Card HUD Dock (Hidden on Desktop) */}
      {!isModalOpen && activeFrontTool && (
        <div className="md:hidden fixed bottom-4 left-4 right-[4.5rem] z-30 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative overflow-hidden rounded-2xl bg-[#090b14]/90 backdrop-blur-2xl border border-white/15 p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
            {/* Top Cyan Glow Accent Line */}
            <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

            {/* Header: Index, Category, Prev/Next Arrows */}
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {`0${activeFrontIndex + 1}`.slice(-2)}
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  / {`0${displayTools.length}`.slice(-2)}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                  {activeFrontTool.category}
                </span>
              </div>

              {/* Prev / Next Navigation Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevCard}
                  title="Previous Tool"
                  aria-label="Previous Tool"
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 active:scale-90 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextCard}
                  title="Next Tool"
                  aria-label="Next Tool"
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 active:scale-90 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="mb-2 sm:mb-3">
              <h3 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                {activeFrontTool.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1 mt-0.5">
                {activeFrontTool.tagline}
              </p>
            </div>

            {/* 1-Tap Launch Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playSearchPulse();
                onSelectToolRef.current(activeFrontTool);
              }}
              className="w-full py-2 sm:py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-200" />
              <span className="truncate">Open {activeFrontTool.name.split(' ')[0]}</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
