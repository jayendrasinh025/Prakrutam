import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveBotanicalRenderConfig,
  computeValleyTerrainHeight,
  stepCameraKinematics,
} from './botanicalConfig';

test('resolveBotanicalRenderConfig differentiates desktop and mobile configurations', () => {
  const desktopCfg = resolveBotanicalRenderConfig({
    viewportWidth: 1440,
    devicePixelRatio: 2,
    isSoftwareGl: false,
    reducedMotion: false,
    hardwareConcurrency: 8,
  });

  const mobileCfg = resolveBotanicalRenderConfig({
    viewportWidth: 390,
    devicePixelRatio: 3,
    isSoftwareGl: false,
    reducedMotion: false,
    hardwareConcurrency: 6,
  });

  assert.equal(desktopCfg.deviceTier, 'desktop');
  assert.equal(mobileCfg.deviceTier, 'mobile');
  assert.ok(desktopCfg.particleCount > mobileCfg.particleCount);
  assert.ok(desktopCfg.leafInstanceCount > mobileCfg.leafInstanceCount);
  assert.equal(desktopCfg.enableBloom, true);
  assert.equal(mobileCfg.enableBloom, false);
  assert.ok(mobileCfg.maxPixelRatio <= 1.35);
});

test('resolveBotanicalRenderConfig disables bloom and caps pixelRatio on software WebGL', () => {
  const swCfg = resolveBotanicalRenderConfig({
    viewportWidth: 1440,
    devicePixelRatio: 2,
    isSoftwareGl: true,
    reducedMotion: false,
  });

  assert.equal(swCfg.enableBloom, false);
  assert.equal(swCfg.maxPixelRatio, 1);
});

test('computeValleyTerrainHeight forms a valley with higher flanks than center glade', () => {
  const centerHeight = computeValleyTerrainHeight(0, 0);
  const leftFlankHeight = computeValleyTerrainHeight(-18, 0);
  const rightFlankHeight = computeValleyTerrainHeight(18, 0);

  assert.ok(leftFlankHeight > centerHeight);
  assert.ok(rightFlankHeight > centerHeight);
});

test('stepCameraKinematics moves camera deeper into valley as scrollProgress increases', () => {
  const initial = {
    posX: 0,
    posY: 0.85,
    posZ: 18.5,
    lookX: 0,
    lookY: 0.2,
    lookZ: 4.5,
  };

  const stepped = stepCameraKinematics(initial, {
    pointerNdcX: 0.5,
    pointerNdcY: 0.2,
    scrollProgress: 0.8,
    elapsedTime: 2.0,
    deltaSeconds: 0.05,
    reducedMotion: false,
    isMobile: false,
  });

  assert.ok(stepped.posZ < initial.posZ, 'Camera should move deeper (-Z) on scroll');
  assert.ok(stepped.posX > initial.posX, 'Camera should respond to positive pointerNdcX');
});
