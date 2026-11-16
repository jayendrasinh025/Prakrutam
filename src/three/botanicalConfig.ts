export interface BotanicalRenderConfig {
  deviceTier: 'desktop' | 'mobile';
  isSoftwareGl: boolean;
  reducedMotion: boolean;
  particleCount: number;
  flowerParticleCount: number;
  leafInstanceCount: number;
  valleyTreeCount: number;
  maxPixelRatio: number;
  enableBloom: boolean;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  fogDensity: number;
}

export interface CameraKinematicState {
  posX: number;
  posY: number;
  posZ: number;
  lookX: number;
  lookY: number;
  lookZ: number;
}

export function resolveBotanicalRenderConfig(params: {
  viewportWidth: number;
  devicePixelRatio: number;
  isSoftwareGl: boolean;
  reducedMotion: boolean;
  hardwareConcurrency?: number;
}): BotanicalRenderConfig {
  const {
    viewportWidth,
    devicePixelRatio,
    isSoftwareGl,
    reducedMotion,
    hardwareConcurrency = 8,
  } = params;

  const isMobile = viewportWidth < 768;
  const isLowEndCpu = hardwareConcurrency <= 4;

  if (isMobile) {
    const scaleFactor = isSoftwareGl || isLowEndCpu ? 0.65 : 1;
    return {
      deviceTier: 'mobile',
      isSoftwareGl,
      reducedMotion,
      particleCount: Math.round(1500 * scaleFactor),
      flowerParticleCount: Math.round(240 * scaleFactor),
      leafInstanceCount: Math.round(60 * scaleFactor),
      valleyTreeCount: 16,
      maxPixelRatio: isSoftwareGl ? 1 : Math.min(devicePixelRatio || 1, 1.35),
      enableBloom: false,
      bloomStrength: 0,
      bloomRadius: 0,
      bloomThreshold: 1,
      fogDensity: 0.026,
    };
  }

  const desktopScale = isSoftwareGl ? 0.75 : isLowEndCpu ? 0.85 : 1;
  return {
    deviceTier: 'desktop',
    isSoftwareGl,
    reducedMotion,
    particleCount: Math.round(4200 * desktopScale),
    flowerParticleCount: Math.round(640 * desktopScale),
    leafInstanceCount: Math.round(150 * desktopScale),
    valleyTreeCount: 28,
    maxPixelRatio: isSoftwareGl ? 1 : Math.min(devicePixelRatio || 1, 2),
    enableBloom: !isSoftwareGl && !reducedMotion,
    bloomStrength: 0.55,
    bloomRadius: 0.45,
    bloomThreshold: 0.72,
    fogDensity: 0.024,
  };
}

/**
 * Computes the height of the nighttime botanical valley floor at (x, z).
 * Creates a natural central glade pathway that rises gently on the left and right flanks.
 */
export function computeValleyTerrainHeight(x: number, z: number): number {
  const valleyWalls = Math.pow(Math.abs(x) * 0.075, 1.85) * 2.4;
  const rollingHills =
    Math.sin(x * 0.18 + z * 0.12) * 0.45 +
    Math.cos(z * 0.15 - x * 0.1) * 0.35;
  return -2.8 + valleyWalls + rollingHills;
}

/**
 * Frame-rate independent exponential damping for smooth camera movement
 * in response to mouse/touch parallax, scroll depth, and idle drift.
 */
export function stepCameraKinematics(
  current: CameraKinematicState,
  input: {
    pointerNdcX: number;
    pointerNdcY: number;
    scrollProgress: number;
    elapsedTime: number;
    deltaSeconds: number;
    reducedMotion: boolean;
    isMobile: boolean;
  }
): CameraKinematicState {
  const dt = Math.min(Math.max(input.deltaSeconds, 0.001), 0.1);
  const smoothFactor = 1 - Math.exp(-3.8 * dt);

  const clampedScroll = Math.max(0, Math.min(1, input.scrollProgress));
  const idleMotionScale = input.reducedMotion ? 0.1 : 1.0;

  const idleDriftX =
    Math.sin(input.elapsedTime * 0.32) * 0.55 * idleMotionScale;
  const idleDriftY =
    Math.cos(input.elapsedTime * 0.24) * 0.25 * idleMotionScale;

  const parallaxRangeX = input.isMobile ? 1.4 : 2.35;
  const parallaxRangeY = input.isMobile ? 0.75 : 1.15;

  // Scrolling moves the camera deeper into the botanical valley (from z=18.5 down to z=5.5)
  const targetZ = 18.5 - clampedScroll * 13.0;
  const targetX =
    input.pointerNdcX * parallaxRangeX +
    idleDriftX +
    Math.sin(clampedScroll * Math.PI) * 0.8;
  const targetY =
    0.85 +
    input.pointerNdcY * parallaxRangeY +
    idleDriftY +
    clampedScroll * 0.55;

  const targetLookX = input.pointerNdcX * 1.65 + idleDriftX * 0.4;
  const targetLookY = 0.2 + input.pointerNdcY * 0.85 + clampedScroll * 0.25;
  const targetLookZ = targetZ - 14.0;

  return {
    posX: current.posX + (targetX - current.posX) * smoothFactor,
    posY: current.posY + (targetY - current.posY) * smoothFactor,
    posZ: current.posZ + (targetZ - current.posZ) * smoothFactor,
    lookX: current.lookX + (targetLookX - current.lookX) * smoothFactor,
    lookY: current.lookY + (targetLookY - current.lookY) * smoothFactor,
    lookZ: current.lookZ + (targetLookZ - current.lookZ) * smoothFactor,
  };
}
