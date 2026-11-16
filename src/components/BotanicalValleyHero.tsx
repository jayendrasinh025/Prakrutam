import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ArrowRight, ArrowDown, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { PageRoute } from '../types';
import {
  CameraKinematicState,
  computeValleyTerrainHeight,
  resolveBotanicalRenderConfig,
  stepCameraKinematics,
} from '../three/botanicalConfig';

interface BotanicalValleyHeroProps {
  onNavigate: (page: PageRoute, productSlug?: string) => void;
  onScrollToPhilosophy: () => void;
}

// Pre-allocated module-scope math helpers to avoid GC in the render loop
const _dummyObj = new THREE.Object3D();
const _pointerNdc = new THREE.Vector2(0, 0);
const _raycaster = new THREE.Raycaster();
const _interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -8);
const _pointerWorldTarget = new THREE.Vector3(0, 1, 8);
const _pointerWorldCurrent = new THREE.Vector3(0, 1, 8);

function detectWebGLAndSoftwareMode(): {
  webglAvailable: boolean;
  isSoftwareGl: boolean;
} {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) {
      return { webglAvailable: false, isSoftwareGl: true };
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl =
      /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { webglAvailable: true, isSoftwareGl };
  } catch {
    return { webglAvailable: false, isSoftwareGl: true };
  }
}

function createProceduralBumpTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 900; i++) {
      const x = (i * 73) % 128;
      const y = (i * 41) % 128;
      const shade = 100 + ((i * 29) % 55);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

export const BotanicalValleyHero: React.FC<BotanicalValleyHeroProps> = ({
  onNavigate,
  onScrollToPhilosophy,
}) => {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return false;
    }
    return true;
  });
  const [webglFallback, setWebglFallback] = useState<boolean>(false);
  const [deviceTier, setDeviceTier] = useState<'desktop' | 'mobile'>('desktop');
  const [particleTotal, setParticleTotal] = useState<number>(4840);
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);
  const [atmospherePreset, setAtmospherePreset] = useState<'sanctuary' | 'golden' | 'emerald'>('sanctuary');

  const atmosphereRef = useRef<'sanctuary' | 'golden' | 'emerald'>('sanctuary');
  useEffect(() => {
    atmosphereRef.current = atmospherePreset;
  }, [atmospherePreset]);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    const sectionEl = heroSectionRef.current;
    if (!mountEl || !sectionEl) return;

    const { webglAvailable, isSoftwareGl } = detectWebGLAndSoftwareMode();
    if (!webglAvailable) {
      setWebglFallback(true);
      setIsLoading(false);
      return;
    }

    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const initialConfig = resolveBotanicalRenderConfig({
      viewportWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio || 1,
      isSoftwareGl,
      reducedMotion,
      hardwareConcurrency: navigator.hardwareConcurrency || 8,
    });

    setDeviceTier(initialConfig.deviceTier);
    setParticleTotal(
      initialConfig.particleCount + initialConfig.flowerParticleCount
    );

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(resource: T): T => {
      disposables.push(resource);
      return resource;
    };

    const width = mountEl.clientWidth || window.innerWidth;
    const height = mountEl.clientHeight || window.innerHeight;

    // 1. Renderer Setup (Three.js r160+ & Software-WebGL Guard)
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(initialConfig.maxPixelRatio);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl && initialConfig.deviceTier === 'desktop';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'pan-y';

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    // 2. Scene, Horizon Fog & Studio Environment Reflection
    const scene = new THREE.Scene();
    const bgHex = 0x030e08;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, initialConfig.fogDensity);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    track(envTarget);
    pmremGenerator.dispose();

    // 3. Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 140);
    const camState: CameraKinematicState = {
      posX: 0,
      posY: 0.85,
      posZ: 18.5,
      lookX: 0,
      lookY: 0.2,
      lookZ: 4.5,
    };
    camera.position.set(camState.posX, camState.posY, camState.posZ);
    camera.lookAt(camState.lookX, camState.lookY, camState.lookZ);

    // 4. Balanced 3-Point Warm/Cool Botanical Night Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x1b5e3c, 0x030a06, 0.9);
    scene.add(hemiLight);

    const moonKeyLight = new THREE.DirectionalLight(0xe8c56b, 1.85);
    moonKeyLight.position.set(8, 18, 6);
    if (renderer.shadowMap.enabled) {
      moonKeyLight.castShadow = true;
      moonKeyLight.shadow.mapSize.set(1024, 1024);
      moonKeyLight.shadow.camera.near = 1;
      moonKeyLight.shadow.camera.far = 48;
      const d = 18;
      moonKeyLight.shadow.camera.left = -d;
      moonKeyLight.shadow.camera.right = d;
      moonKeyLight.shadow.camera.top = d;
      moonKeyLight.shadow.camera.bottom = -d;
      moonKeyLight.shadow.bias = -0.0005;
      moonKeyLight.shadow.normalBias = 0.02;
    }
    scene.add(moonKeyLight);

    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 0.95);
    rimLight.position.set(-12, 9, -14);
    scene.add(rimLight);

    const sanctuaryGlowLight = new THREE.PointLight(0xd4af37, 3.2, 22, 1.5);
    sanctuaryGlowLight.position.set(0, 0.5, -7.5);
    scene.add(sanctuaryGlowLight);

    const gladeEmeraldLight1 = new THREE.PointLight(0x10b981, 2.2, 18, 1.6);
    gladeEmeraldLight1.position.set(-5.5, -0.5, 4.0);
    scene.add(gladeEmeraldLight1);

    const gladeEmeraldLight2 = new THREE.PointLight(0x34d399, 2.0, 18, 1.6);
    gladeEmeraldLight2.position.set(5.5, -0.4, 1.5);
    scene.add(gladeEmeraldLight2);

    // 5. Undulating Nighttime Botanical Valley Terrain
    const bumpTex = track(createProceduralBumpTexture(renderer));
    const terrainGeo = track(new THREE.PlaneGeometry(80, 90, 48, 48));
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    const terrainColors = new Float32Array(posAttr.count * 3);
    const colorLow = new THREE.Color(0x051a10);
    const colorHigh = new THREE.Color(0x0c3420);
    const tempColor = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const vy = computeValleyTerrainHeight(vx, vz);
      posAttr.setY(i, vy);

      const t = THREE.MathUtils.clamp((vy + 3.0) / 6.0, 0, 1);
      tempColor.lerpColors(colorLow, colorHigh, t);
      terrainColors[i * 3] = tempColor.r;
      terrainColors[i * 3 + 1] = tempColor.g;
      terrainColors[i * 3 + 2] = tempColor.b;
    }
    terrainGeo.setAttribute(
      'color',
      new THREE.BufferAttribute(terrainColors, 3)
    );
    terrainGeo.computeVertexNormals();

    const terrainMat = track(
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.88,
        metalness: 0.08,
        bumpMap: bumpTex,
        bumpScale: 0.08,
      })
    );
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // 6. Central Ayurvedic Botanical Sanctuary Landmark (Composite 8-Part THREE.Group)
    const sanctuaryGroup = new THREE.Group();
    const sanctuaryZ = -7.5;
    const sanctuaryY = computeValleyTerrainHeight(0, sanctuaryZ);
    sanctuaryGroup.position.set(0, sanctuaryY, sanctuaryZ);

    const carvedStoneMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x153726,
        roughness: 0.78,
        metalness: 0.12,
        bumpMap: bumpTex,
        bumpScale: 0.04,
      })
    );
    const brushedGoldMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0xc9a34a,
        roughness: 0.22,
        metalness: 0.92,
        clearcoat: 0.4,
      })
    );
    const glowingCoreMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xf6d87a,
        emissive: 0xc9a34a,
        emissiveIntensity: 1.8,
        roughness: 0.2,
      })
    );

    // Part 1: Soft radial contact shadow disc grounded on terrain
    const shadowDiscGeo = track(new THREE.CircleGeometry(3.8, 32));
    shadowDiscGeo.rotateX(-Math.PI / 2);
    const shadowDiscMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x010503,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      })
    );
    const shadowDisc = new THREE.Mesh(shadowDiscGeo, shadowDiscMat);
    shadowDisc.position.y = 0.03;
    sanctuaryGroup.add(shadowDisc);

    // Part 2: Lower Octagonal Stone Plinth
    const lowerPlinthGeo = track(new THREE.CylinderGeometry(2.6, 2.9, 0.36, 8));
    const lowerPlinth = new THREE.Mesh(lowerPlinthGeo, carvedStoneMat);
    lowerPlinth.position.y = 0.18;
    lowerPlinth.receiveShadow = true;
    sanctuaryGroup.add(lowerPlinth);

    // Part 3: Upper Stepped Stone Pedestal
    const upperPlinthGeo = track(new THREE.CylinderGeometry(1.85, 2.15, 0.34, 8));
    const upperPlinth = new THREE.Mesh(upperPlinthGeo, carvedStoneMat);
    upperPlinth.position.y = 0.53;
    upperPlinth.receiveShadow = true;
    sanctuaryGroup.add(upperPlinth);

    // Part 4: 4 Fluted Sanctuary Pillars framing the botanical altar
    const pillarGeo = track(new THREE.CylinderGeometry(0.14, 0.18, 3.2, 12));
    const pillarOffsets = [
      [-1.35, -1.0],
      [1.35, -1.0],
      [-1.35, 1.0],
      [1.35, 1.0],
    ];
    for (const [px, pz] of pillarOffsets) {
      const pillar = new THREE.Mesh(pillarGeo, carvedStoneMat);
      pillar.position.set(px, 2.25, pz);
      pillar.castShadow = true;
      sanctuaryGroup.add(pillar);
    }

    // Part 5: Sculpted Torana Canopy Arch
    const archTorusGeo = track(
      new THREE.TorusGeometry(1.55, 0.12, 12, 32, Math.PI)
    );
    const archMesh = new THREE.Mesh(archTorusGeo, brushedGoldMat);
    archMesh.position.set(0, 3.8, 0);
    sanctuaryGroup.add(archMesh);

    // Part 6: Central Lathe-Sculpted Brass Apothecary Kalash / Mortar
    const kalashPoints = [
      new THREE.Vector2(0.01, 0),
      new THREE.Vector2(0.48, 0.05),
      new THREE.Vector2(0.35, 0.25),
      new THREE.Vector2(0.68, 0.72),
      new THREE.Vector2(0.55, 1.15),
      new THREE.Vector2(0.32, 1.38),
      new THREE.Vector2(0.46, 1.52),
    ];
    const kalashGeo = track(new THREE.LatheGeometry(kalashPoints, 28));
    const kalashMesh = new THREE.Mesh(kalashGeo, brushedGoldMat);
    kalashMesh.position.set(0, 0.7, 0);
    kalashMesh.castShadow = true;
    sanctuaryGroup.add(kalashMesh);

    // Part 7 & 8: Floating Golden Botanical Lotus Core & Halo Ring
    const coreOrbGeo = track(new THREE.IcosahedronGeometry(0.32, 2));
    const coreOrbMesh = new THREE.Mesh(coreOrbGeo, glowingCoreMat);
    coreOrbMesh.position.set(0, 2.65, 0);
    sanctuaryGroup.add(coreOrbMesh);

    const haloRingGeo = track(new THREE.TorusGeometry(0.68, 0.022, 12, 48));
    const haloRingMesh = new THREE.Mesh(haloRingGeo, brushedGoldMat);
    haloRingMesh.position.set(0, 2.65, 0);
    sanctuaryGroup.add(haloRingMesh);

    scene.add(sanctuaryGroup);

    // 7. Distant & Mid-Ground Multi-Part Botanical Tree Silhouettes (THREE.Group per tree)
    const trunkGeo = track(new THREE.CylinderGeometry(0.16, 0.34, 3.6, 7));
    const branchGeo = track(new THREE.CylinderGeometry(0.06, 0.14, 1.9, 6));
    const canopyGeo1 = track(new THREE.DodecahedronGeometry(1.45, 1));
    const canopyGeo2 = track(new THREE.DodecahedronGeometry(1.05, 1));

    const trunkMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x091d13,
        roughness: 0.92,
        metalness: 0.05,
      })
    );
    const canopyMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x0e3521,
        roughness: 0.65,
        metalness: 0.1,
      })
    );

    const treeCount = initialConfig.valleyTreeCount;
    for (let i = 0; i < treeCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const tx = side * (8.2 + (row % 3) * 3.8 + Math.sin(i * 2.1) * 1.4);
      const tz = 11.0 - row * 2.6;
      const ty = computeValleyTerrainHeight(tx, tz);

      const treeGroup = new THREE.Group();
      const scale = 0.8 + ((i * 17) % 40) * 0.01;
      treeGroup.position.set(tx, ty, tz);
      treeGroup.scale.setScalar(scale);
      treeGroup.rotation.y = i * 1.1;

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.75;
      treeGroup.add(trunk);

      const leftBranch = new THREE.Mesh(branchGeo, trunkMat);
      leftBranch.position.set(-0.55, 2.9, 0.1);
      leftBranch.rotation.z = 0.55;
      treeGroup.add(leftBranch);

      const rightBranch = new THREE.Mesh(branchGeo, trunkMat);
      rightBranch.position.set(0.5, 3.1, -0.15);
      rightBranch.rotation.z = -0.5;
      treeGroup.add(rightBranch);

      const mainCanopy = new THREE.Mesh(canopyGeo1, canopyMat);
      mainCanopy.position.set(0, 3.9, 0);
      mainCanopy.scale.set(1.25, 0.82, 1.15);
      treeGroup.add(mainCanopy);

      const subCanopy = new THREE.Mesh(canopyGeo2, canopyMat);
      subCanopy.position.set(-0.85, 3.55, 0.2);
      subCanopy.scale.set(1.1, 0.75, 1.0);
      treeGroup.add(subCanopy);

      scene.add(treeGroup);
    }

    // 8. THREE.InstancedMesh: Delicate Floating Botanical Leaves
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.16, 0.2, 0.07, 0.48);
    leafShape.quadraticCurveTo(0, 0.62, 0, 0.68);
    leafShape.quadraticCurveTo(0, 0.62, -0.07, 0.48);
    leafShape.quadraticCurveTo(-0.16, 0.2, 0, 0);

    const leafGeo = track(
      new THREE.ExtrudeGeometry(leafShape, {
        steps: 1,
        depth: 0.012,
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.005,
        bevelSegments: 2,
      })
    );
    leafGeo.center();

    const leafMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.42,
        metalness: 0.15,
        side: THREE.DoubleSide,
      })
    );

    const leafCount = initialConfig.leafInstanceCount;
    const leafInstancedMesh = new THREE.InstancedMesh(
      leafGeo,
      leafMat,
      leafCount
    );
    leafInstancedMesh.frustumCulled = false;

    const leafBasePositions = new Float32Array(leafCount * 3);
    const leafPhases = new Float32Array(leafCount * 3);
    const leafScales = new Float32Array(leafCount);
    const leafPalette = [
      new THREE.Color(0x1f6f46),
      new THREE.Color(0x2ea066),
      new THREE.Color(0xc9a34a),
      new THREE.Color(0x145334),
    ];

    for (let i = 0; i < leafCount; i++) {
      const lx = ((i * 53) % 240) / 10 - 12.0;
      const lz = ((i * 71) % 220) / 10 - 11.0; // Kept between z=-11 and z=+11 away from lens
      const groundY = computeValleyTerrainHeight(lx, lz);
      const ly = groundY + 0.45 + ((i * 37) % 55) / 10;

      leafBasePositions[i * 3] = lx;
      leafBasePositions[i * 3 + 1] = ly;
      leafBasePositions[i * 3 + 2] = lz;

      leafPhases[i * 3] = (i * 0.73) % (Math.PI * 2);
      leafPhases[i * 3 + 1] = 0.6 + ((i * 19) % 10) * 0.08;
      leafPhases[i * 3 + 2] = (i * 1.17) % (Math.PI * 2);

      const s = 0.24 + ((i * 23) % 20) * 0.01;
      leafScales[i] = s;

      _dummyObj.position.set(lx, ly, lz);
      _dummyObj.rotation.set(
        leafPhases[i * 3],
        leafPhases[i * 3 + 2],
        leafPhases[i * 3] * 0.5
      );
      _dummyObj.scale.setScalar(s);
      _dummyObj.updateMatrix();
      leafInstancedMesh.setMatrixAt(i, _dummyObj.matrix);
      leafInstancedMesh.setColorAt(i, leafPalette[i % leafPalette.length]);
    }
    leafInstancedMesh.instanceMatrix.needsUpdate = true;
    if (leafInstancedMesh.instanceColor) {
      leafInstancedMesh.instanceColor.needsUpdate = true;
    }
    leafInstancedMesh.computeBoundingSphere();
    scene.add(leafInstancedMesh);

    // 9. THREE.Points Population 1: Thousands of Bioluminescent Botanical Particles (Custom GLSL Shader)
    const pCount = initialConfig.particleCount;
    const particleGeo = track(new THREE.BufferGeometry());
    const pPositions = new Float32Array(pCount * 3);
    const pScales = new Float32Array(pCount);
    const pPhases = new Float32Array(pCount);
    const pColorMix = new Float32Array(pCount);

    for (let i = 0; i < pCount; i++) {
      const px = (Math.random() - 0.5) * 34;
      const pz = (Math.random() - 0.5) * 36 - 1;
      const floorY = computeValleyTerrainHeight(px, pz);
      // 65% form a rich glowing botanical carpet near the valley floor; 35% drift upward
      const isGroundCarpet = i % 3 !== 0;
      const py = isGroundCarpet
        ? floorY + 0.08 + Math.random() * 1.15
        : floorY + 1.2 + Math.pow(Math.random(), 1.3) * 7.5;

      pPositions[i * 3] = px;
      pPositions[i * 3 + 1] = py;
      pPositions[i * 3 + 2] = pz;

      pScales[i] = 0.65 + Math.random() * 1.85;
      pPhases[i] = Math.random() * Math.PI * 2;
      pColorMix[i] = Math.random();
    }

    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(pPositions, 3)
    );
    particleGeo.setAttribute('aScale', new THREE.BufferAttribute(pScales, 1));
    particleGeo.setAttribute('aPhase', new THREE.BufferAttribute(pPhases, 1));
    particleGeo.setAttribute(
      'aColorMix',
      new THREE.BufferAttribute(pColorMix, 1)
    );

    const sporeShaderMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPointerWorld: { value: new THREE.Vector3(0, 1, 8) },
          uPixelRatio: { value: initialConfig.maxPixelRatio },
          uColorGold: { value: new THREE.Color(0xe8c464) },
          uColorEmerald: { value: new THREE.Color(0x34d399) },
        },
        vertexShader: `
          attribute float aScale;
          attribute float aPhase;
          attribute float aColorMix;

          uniform float uTime;
          uniform vec3 uPointerWorld;
          uniform float uPixelRatio;

          varying float vAlpha;
          varying float vColorMix;
          varying float vProximityBoost;

          void main() {
            vColorMix = aColorMix;

            vec3 pos = position;
            pos.x += sin(uTime * 0.55 + aPhase) * 0.32;
            pos.y += cos(uTime * 0.42 + aPhase * 1.3) * 0.24;
            pos.z += sin(uTime * 0.38 + aPhase * 0.7) * 0.22;

            // Gentle cursor repulsion and glow brightening near pointer
            vec3 toParticle = pos - uPointerWorld;
            float dist = length(toParticle);
            float influenceRadius = 4.8;
            float proximity = clamp(1.0 - dist / influenceRadius, 0.0, 1.0);
            float smoothProx = proximity * proximity * (3.0 - 2.0 * proximity);

            vec3 pushDir = dist > 0.001 ? normalize(toParticle) : vec3(0.0, 1.0, 0.0);
            pos += pushDir * smoothProx * 1.65;
            pos.y += smoothProx * 0.45;

            vProximityBoost = smoothProx;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            float depthDist = max(1.8, -mvPosition.z);
            gl_PointSize = (28.0 * aScale * uPixelRatio * (1.0 + smoothProx * 0.85)) / depthDist;

            float pulse = 0.62 + 0.38 * sin(uTime * 1.6 + aPhase * 2.0);
            float distanceFade = smoothstep(38.0, 5.0, depthDist);
            vAlpha = clamp(pulse * distanceFade + smoothProx * 0.55, 0.12, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColorGold;
          uniform vec3 uColorEmerald;

          varying float vAlpha;
          varying float vColorMix;
          varying float vProximityBoost;

          void main() {
            vec2 uv = gl_PointCoord - vec2(0.5);
            float d = length(uv);
            if (d > 0.5) discard;

            float core = smoothstep(0.5, 0.04, d);
            float halo = smoothstep(0.5, 0.0, d);

            vec3 baseTint = mix(uColorEmerald, uColorGold, vColorMix);
            vec3 finalColor = mix(baseTint, vec3(1.0, 0.96, 0.82), core * 0.6 + vProximityBoost * 0.4);

            float alpha = (core * 0.82 + halo * 0.38) * vAlpha;
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
      })
    );

    const sporePoints = new THREE.Points(particleGeo, sporeShaderMat);
    scene.add(sporePoints);

    // 10. THREE.Points Population 2: Glowing Night-Blooming Flower Particles (Custom Petal Corolla Shader)
    const fCount = initialConfig.flowerParticleCount;
    const flowerGeo = track(new THREE.BufferGeometry());
    const fPositions = new Float32Array(fCount * 3);
    const fScales = new Float32Array(fCount);
    const fPhases = new Float32Array(fCount);

    for (let i = 0; i < fCount; i++) {
      const fx = (Math.random() - 0.5) * 28;
      const fz = (Math.random() - 0.5) * 30;
      const groundY = computeValleyTerrainHeight(fx, fz);
      const fy = groundY + 0.1 + Math.random() * 0.95;

      fPositions[i * 3] = fx;
      fPositions[i * 3 + 1] = fy;
      fPositions[i * 3 + 2] = fz;

      fScales[i] = 0.9 + Math.random() * 1.45;
      fPhases[i] = Math.random() * Math.PI * 2;
    }

    flowerGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(fPositions, 3)
    );
    flowerGeo.setAttribute('aScale', new THREE.BufferAttribute(fScales, 1));
    flowerGeo.setAttribute('aPhase', new THREE.BufferAttribute(fPhases, 1));

    const flowerShaderMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPointerWorld: { value: new THREE.Vector3(0, 1, 8) },
          uPixelRatio: { value: initialConfig.maxPixelRatio },
        },
        vertexShader: `
          attribute float aScale;
          attribute float aPhase;

          uniform float uTime;
          uniform vec3 uPointerWorld;
          uniform float uPixelRatio;

          varying float vPhase;
          varying float vProximity;

          void main() {
            vPhase = aPhase;
            vec3 pos = position;

            float gentleFloat = sin(uTime * 0.9 + aPhase) * 0.12;
            pos.y += gentleFloat;

            vec3 diff = pos - uPointerWorld;
            float dist = length(diff);
            float prox = clamp(1.0 - dist / 4.2, 0.0, 1.0);
            vProximity = prox;

            vec3 push = dist > 0.001 ? normalize(diff) : vec3(0.0, 1.0, 0.0);
            pos += push * prox * 0.95;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            float depth = max(2.0, -mvPosition.z);
            float pulseScale = 1.0 + 0.18 * sin(uTime * 1.8 + aPhase) + prox * 0.65;
            gl_PointSize = (48.0 * aScale * pulseScale * uPixelRatio) / depth;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying float vPhase;
          varying float vProximity;

          void main() {
            vec2 uv = gl_PointCoord - vec2(0.5);
            float r = length(uv) * 2.0;
            if (r > 1.0) discard;

            float angle = atan(uv.y, uv.x) + vPhase + uTime * 0.15;
            // 5-petal botanical blossom silhouette
            float petals = 0.68 + 0.32 * cos(angle * 5.0);
            float blossomMask = smoothstep(petals, petals - 0.38, r);
            float stamenCore = smoothstep(0.32, 0.0, r);

            vec3 petalColor = mix(vec3(0.18, 0.82, 0.55), vec3(0.9, 0.72, 0.3), fract(vPhase));
            vec3 coreColor = vec3(1.0, 0.94, 0.72);

            vec3 col = mix(petalColor, coreColor, stamenCore + vProximity * 0.35);
            float pulse = 0.72 + 0.28 * sin(uTime * 2.1 + vPhase);
            float alpha = blossomMask * pulse * (0.8 + vProximity * 0.2);

            gl_FragColor = vec4(col, alpha);
          }
        `,
      })
    );

    const flowerPoints = new THREE.Points(flowerGeo, flowerShaderMat);
    scene.add(flowerPoints);

    // 11. Optional Post-Processing Bloom (Desktop GPUs only)
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (initialConfig.enableBloom) {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        initialConfig.bloomStrength,
        initialConfig.bloomRadius,
        initialConfig.bloomThreshold
      );
      composer.addPass(bloomPass);
    }

    // Pre-compile shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Input state tracking (Mouse, Touch & Scroll)
    let scrollProgress = 0;
    let isTabHidden = document.hidden;

    const updatePointerFromClient = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      _pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_pointerNdc, camera);
      _raycaster.ray.intersectPlane(_interactionPlane, _pointerWorldTarget);
    };

    const onMouseMove = (e: MouseEvent) => {
      updatePointerFromClient(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerFromClient(touch.clientX, touch.clientY);
      }
    };

    const onScroll = () => {
      if (!sectionEl) return;
      const rect = sectionEl.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const raw = -rect.top / Math.max(1, vh * 0.95);
      scrollProgress = THREE.MathUtils.clamp(raw, 0, 1);
    };

    const onResize = () => {
      if (!mountEl) return;
      const newW = mountEl.clientWidth || window.innerWidth;
      const newH = mountEl.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      if (composer) {
        composer.setSize(newW, newH);
      }
      setDeviceTier(newW < 768 ? 'mobile' : 'desktop');
    };

    const onVisibilityChange = () => {
      isTabHidden = document.hidden;
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFallback(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    // Software-WebGL fenceSync Pacing Loop
    let frameId = 0;
    let isDisposed = false;
    let lastTimestamp = performance.now();
    let elapsedTotal = 0;

    function afterDraw(cb: () => void) {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    let firstFrameRendered = false;

    function tick() {
      if (isDisposed) return;

      if (isTabHidden) {
        lastTimestamp = performance.now();
        frameId = window.setTimeout(tick, 250);
        return;
      }

      const now = performance.now();
      const delta = Math.min(Math.max((now - lastTimestamp) / 1000, 0.001), 0.1);
      lastTimestamp = now;
      elapsedTotal += delta;
      const elapsed = elapsedTotal;

      // Smoothly damp 3D pointer world coordinate
      const ptrSmooth = 1 - Math.exp(-6.0 * delta);
      _pointerWorldCurrent.lerp(_pointerWorldTarget, ptrSmooth);

      // Update shader uniforms
      sporeShaderMat.uniforms.uTime.value = elapsed;
      sporeShaderMat.uniforms.uPointerWorld.value.copy(_pointerWorldCurrent);
      flowerShaderMat.uniforms.uTime.value = elapsed;
      flowerShaderMat.uniforms.uPointerWorld.value.copy(_pointerWorldCurrent);

      // Apply atmosphere preset tint
      const preset = atmosphereRef.current;
      if (preset === 'golden') {
        sporeShaderMat.uniforms.uColorGold.value.setHex(0xf3c65f);
        sporeShaderMat.uniforms.uColorEmerald.value.setHex(0xd4af37);
      } else if (preset === 'emerald') {
        sporeShaderMat.uniforms.uColorGold.value.setHex(0x34d399);
        sporeShaderMat.uniforms.uColorEmerald.value.setHex(0x10b981);
      } else {
        sporeShaderMat.uniforms.uColorGold.value.setHex(0xe8c464);
        sporeShaderMat.uniforms.uColorEmerald.value.setHex(0x34d399);
      }

      // Gently animate sanctuary centerpiece
      coreOrbMesh.position.y = 2.65 + Math.sin(elapsed * 1.4) * 0.12;
      coreOrbMesh.rotation.y = elapsed * 0.45;
      haloRingMesh.rotation.y = -elapsed * 0.35;
      haloRingMesh.rotation.x = Math.sin(elapsed * 0.6) * 0.35;

      // Update InstancedMesh floating botanical leaves
      if (!reducedMotion) {
        for (let i = 0; i < leafCount; i++) {
          const bx = leafBasePositions[i * 3];
          const by = leafBasePositions[i * 3 + 1];
          const bz = leafBasePositions[i * 3 + 2];

          const phase = leafPhases[i * 3];
          const speed = leafPhases[i * 3 + 1];
          const rotOffset = leafPhases[i * 3 + 2];

          let lx = bx + Math.sin(elapsed * speed + phase) * 0.38;
          let ly = by + Math.cos(elapsed * speed * 0.8 + phase) * 0.22;
          const lz = bz;

          // Subtle leaf dispersion near pointer
          const dx = lx - _pointerWorldCurrent.x;
          const dy = ly - _pointerWorldCurrent.y;
          const dz = lz - _pointerWorldCurrent.z;
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq < 14.0 && distSq > 0.001) {
            const dist = Math.sqrt(distSq);
            const push = (1.0 - dist / 3.74) * 0.65;
            lx += (dx / dist) * push;
            ly += (dy / dist) * push;
          }

          _dummyObj.position.set(lx, ly, lz);
          _dummyObj.rotation.set(
            phase + elapsed * 0.35,
            rotOffset + elapsed * 0.25,
            Math.sin(elapsed * speed + phase) * 0.4
          );
          _dummyObj.scale.setScalar(leafScales[i]);
          _dummyObj.updateMatrix();
          leafInstancedMesh.setMatrixAt(i, _dummyObj.matrix);
        }
        leafInstancedMesh.instanceMatrix.needsUpdate = true;
      }

      // Update Camera Kinematics (Mouse/Touch + Scroll Depth + Idle Drift)
      const nextCam = stepCameraKinematics(camState, {
        pointerNdcX: _pointerNdc.x,
        pointerNdcY: _pointerNdc.y,
        scrollProgress,
        elapsedTime: elapsed,
        deltaSeconds: delta,
        reducedMotion,
        isMobile: initialConfig.deviceTier === 'mobile',
      });
      camState.posX = nextCam.posX;
      camState.posY = nextCam.posY;
      camState.posZ = nextCam.posZ;
      camState.lookX = nextCam.lookX;
      camState.lookY = nextCam.lookY;
      camState.lookZ = nextCam.lookZ;

      camera.position.set(camState.posX, camState.posY, camState.posZ);
      camera.lookAt(camState.lookX, camState.lookY, camState.lookZ);

      // Render Scene
      if (composer && !isSoftwareGl) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      if (!firstFrameRendered) {
        firstFrameRendered = true;
        window.setTimeout(() => {
          if (!isDisposed) setIsLoading(false);
        }, 280);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);

      if (composer) {
        composer.dispose();
      }
      for (const item of disposables) {
        item.dispose();
      }
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={heroSectionRef}
      aria-label="Interactive 3D Nighttime Botanical Valley Hero"
      data-testid="botanical-3d-hero"
      data-state={isLoading ? 'loading' : 'ready'}
      data-device-tier={deviceTier}
      data-particle-count={particleTotal}
      className="relative w-full min-h-[86vh] h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] max-h-[1040px] bg-[#030E08] text-[#F8F6ED] overflow-hidden select-none border-b border-[#C9A34A]/30"
    >
      {/* 1. Dedicated WebGL Mount Container (Outside React HUD Siblings) */}
      <div
        ref={canvasMountRef}
        data-testid="botanical-webgl-mount"
        className="absolute inset-0 w-full h-full z-0"
      />

      {/* Elegant Static Fallback if WebGL is Unavailable */}
      {webglFallback && (
        <div
          className="absolute inset-0 z-0 bg-gradient-to-b from-[#030E08] via-[#092719] to-[#123D27] flex items-center justify-center"
          role="img"
          aria-label="Nighttime Ayurvedic Botanical Sanctuary"
        />
      )}

      {/* Subtle Vignette Gradient Scrim for 4.5:1+ Text Contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#030E08]/90 via-[#030E08]/25 to-[#030E08]/60"
      />

      {/* 2. Initial Black Botanical Loading Screen */}
      <div
        aria-hidden={!isLoading}
        data-testid="botanical-loader"
        className={`absolute inset-0 z-30 bg-[#020805] flex flex-col items-center justify-center transition-opacity duration-700 ${
          isLoading
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="relative flex items-center justify-center w-20 h-20 mb-5">
          <div className="w-12 h-12 rounded-full border border-[#C9A34A]/45 flex items-center justify-center bg-[#092719]">
            <Sparkles className="w-5 h-5 text-[#C9A34A]" />
          </div>
        </div>
        <p className="text-xs tracking-[0.28em] text-[#C9A34A] font-medium">
          PRAKRUTAM AYURVEDA
        </p>
        <p className="mt-2 font-serif-display italic text-lg text-[#F8F6ED]/75">
          Entering the Night Botanical Sanctuary...
        </p>
      </div>

      {/* 3. Hero Editorial Interface Overlay */}
      <div className="relative z-20 h-full max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col justify-between py-6 sm:py-10 pointer-events-none">
        {/* Top Minimal Brand Kicker */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs sm:text-sm tracking-[0.26em] text-[#C9A34A] font-medium">
            PRAKRUTAM AYURVEDA
          </p>
          <span className="hidden sm:inline-block text-xs font-mono-tabular text-[#F8F6ED]/70">
            Night Botanical Sanctuary · Interactive 3D
          </span>
        </div>

        {/* Center Visually Dominant Hero Typography & Actions */}
        <div className="my-auto max-w-2xl space-y-4 sm:space-y-5 pointer-events-auto">
          <h1
            className="font-serif-display font-semibold text-[#F8F6ED] leading-[1.03] tracking-tight text-balance"
            style={{ fontSize: 'clamp(3rem, 6.8vw, 6rem)' }}
          >
            Rooted in Nature.
          </h1>

          <p className="text-lg sm:text-2xl font-serif-display italic text-[#F8F6ED]/90 tracking-wide max-w-xl">
            Discover the wisdom of botanical skincare.
          </p>

          <p className="text-xs sm:text-sm text-[#F8F6ED]/75 max-w-lg leading-relaxed">
            Move through our nocturnal Ayurvedic valley—where glowing botanical
            spores, sacred neem foliage, and traditional formulations meet.
          </p>

          {/* Primary CTA + Circular Arrow Button + Secondary CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <div className="inline-flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="inline-flex items-center justify-center gap-3 px-6 sm:px-7 py-3.5 sm:py-4 bg-[#C9A34A] text-[#092719] text-sm font-semibold tracking-wide hover:bg-[#d8b45c] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Circular Arrow Button with Subtle Hover Animation */}
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                aria-label="Enter Prakrutam Ayurveda Collection"
                className="group w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#C9A34A]/65 bg-[#092719]/90 text-[#C9A34A] flex items-center justify-center hover:bg-[#C9A34A] hover:text-[#092719] transition-all duration-200 cursor-pointer shrink-0"
              >
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onScrollToPhilosophy}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 border border-[#F8F6ED]/35 bg-[#04120B]/85 text-[#F8F6ED] text-sm font-medium hover:border-[#C9A34A] hover:text-[#C9A34A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Our Philosophy</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#C9A34A]" />
            </button>
          </div>
        </div>

        {/* 4. Unified Collapsible Bottom Dock (Zero Viewport Occlusion) */}
        <div className="pointer-events-auto flex flex-col items-center w-full">
          <button
            type="button"
            onClick={() => setHudCollapsed((prev) => !prev)}
            aria-expanded={!hudCollapsed}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#05180F] border border-[#C9A34A]/35 text-[11px] font-medium text-[#C9A34A] hover:text-[#F8F6ED] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {hudCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Valley Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Valley Controls</span>
              </>
            )}
          </button>

          {!hudCollapsed && (
            <div className="mt-1.5 w-full max-w-3xl bg-[#05180F]/95 border border-[#C9A34A]/30 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[#F8F6ED]/70 hidden sm:inline">Valley Atmosphere:</span>
                {(
                  [
                    { id: 'sanctuary', label: 'Night Sanctuary' },
                    { id: 'golden', label: 'Golden Elixir' },
                    { id: 'emerald', label: 'Neem Canopy' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setAtmospherePreset(mode.id)}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      atmospherePreset === mode.id
                        ? 'bg-[#C9A34A] text-[#092719] font-semibold'
                        : 'text-[#F8F6ED]/75 hover:text-[#C9A34A]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-3 text-[#F8F6ED]/75">
                <button
                  type="button"
                  onClick={() => onNavigate('product', 'gandhak-malam')}
                  className="hover:text-[#C9A34A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Gandhak Malam · <span className="font-mono-tabular">₹199</span>
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onNavigate('product', 'neem-sabun')}
                  className="hover:text-[#C9A34A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Neem Sabun · <span className="font-mono-tabular">₹50</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
