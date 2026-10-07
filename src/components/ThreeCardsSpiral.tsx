import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import type { ToolDefinition } from '../types';
import { getToolCatalog } from '../lib/toolCatalog';
import { useSettings } from '../context/SettingsContext';
import { soundEngine } from '../lib/audioSynth';
import { createCardTexture } from '../lib/cardTextures';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface ThreeCardsSpiralProps {
  onSelectTool: (tool: ToolDefinition) => void;
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

export const ThreeCardsSpiral: React.FC<ThreeCardsSpiralProps> = ({ onSelectTool }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { soundEnabled, reducedMotion } = useSettings();
  const [catalog, setCatalog] = useState<ToolDefinition[]>(() => getToolCatalog());
  const [hoveredTool, setHoveredTool] = useState<{ tool: ToolDefinition; x: number; y: number } | null>(null);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
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
          focalZ: { value: 3.2 },
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
    let targetScroll = 0;
    let currentScroll = 0;
    let mouseX = 0;
    let mouseY = 0;
    let isDragging = false;
    let startPointerY = 0;
    let startPointerX = 0;
    let dragVelocity = 0;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const dragMultiplierY = isTouch ? 0.018 : 0.006;
    const dragMultiplierX = isTouch ? 0.016 : 0.008;

    const evalClosedLoop = (theta: number) => {
      // Periodic tilted 3D space curve
      // Front focal card sits near theta = 0 at (0, -0.2, 3.2)
      const x = 4.6 * Math.sin(theta) - 0.6 * Math.sin(2.0 * theta);
      const y = -0.2 + 1.8 * Math.cos(theta) + 1.0 * Math.sin(theta);
      const z = 3.2 * Math.cos(theta) - 0.4 * Math.cos(2.0 * theta);

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

        // Subtle inward tilt adjustment
        mesh.rotation.z += 0.06;
      });
    };

    updateSpiralPositions();

    // 5. User Interaction Listeners - Highly Responsive & Sensitive
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // 3x higher sensitivity for effortless scrolling
      targetScroll += e.deltaY * 0.0036;
      dragVelocity = 0;
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragVelocity = 0;
      startPointerX = e.clientX;
      startPointerY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Parallax
      mouseX = (e.clientX / width - 0.5) * 1.5;
      mouseY = (e.clientY / height - 0.5) * 1.5;

      if (isDragging) {
        const deltaX = e.clientX - startPointerX;
        const deltaY = e.clientY - startPointerY;
        const moveDelta = deltaX * dragMultiplierX - deltaY * dragMultiplierY;
        targetScroll += moveDelta;
        dragVelocity = moveDelta * 0.92;
        startPointerX = e.clientX;
        startPointerY = e.clientY;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    mount.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 6. Raycasting for hover & click
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-1000, -1000);
    let currentHoveredMesh: THREE.Mesh | null = null;

    const handleMouseMoveForRaycast = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / height) * 2 + 1;
    };

    const handleClickForRaycast = (e: MouseEvent) => {
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
          onSelectTool(tool);
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
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Render Loop
    let animationFrameId: number;

    const animate = () => {
      // Smooth responsive interpolation for momentum
      currentScroll += (targetScroll - currentScroll) * 0.10;

      // Kinetic inertia momentum on swipe release
      if (!isDragging && Math.abs(dragVelocity) > 0.00008) {
        targetScroll += dragVelocity;
        dragVelocity *= 0.94;
      }

      // Gentle ambient drift when idle
      if (!isDragging && Math.abs(dragVelocity) <= 0.00008 && !reducedMotion) {
        targetScroll += 0.0004;
      }

      // Parallax camera tilt
      camera.position.x += (mouseX * 0.65 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 0.65 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      updateSpiralPositions();

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
      mount.removeEventListener('wheel', handleWheel);
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
  }, [displayTools, soundEnabled, reducedMotion, onSelectTool, catalog.length]);

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none select-none" />

      {/* Floating Pacomepertant-style Cursor Tooltip Tag */}
      {hoveredTool && (
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
    </div>
  );
};
