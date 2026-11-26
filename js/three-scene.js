import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const stage = document.querySelector("#hero-stage");
const canvas = document.querySelector("#hero-canvas");
const status = document.querySelector("#scene-status");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/**
 * Helper to build a rounded rectangle THREE.Shape or THREE.Path.
 */
function addRoundedRect(target, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  target.moveTo(x + radius, y);
  target.lineTo(x + w - radius, y);
  target.quadraticCurveTo(x + w, y, x + w, y + radius);
  target.lineTo(x + w, y + h - radius);
  target.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  target.lineTo(x + radius, y + h);
  target.quadraticCurveTo(x, y + h, x, y + h - radius);
  target.lineTo(x, y + radius);
  target.quadraticCurveTo(x, y, x + radius, y);
  target.closePath();
}

/**
 * Creates the beveled 3D Y2K wide-italic letter "Y".
 */
function createLetterYShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.56, 0.44);
  s.lineTo(-0.22, 0.44);
  s.lineTo(0.02, 0.08);
  s.lineTo(0.28, 0.44);
  s.lineTo(0.60, 0.44);
  s.lineTo(0.16, -0.06);
  s.lineTo(0.12, -0.44);
  s.lineTo(-0.18, -0.44);
  s.lineTo(-0.14, -0.06);
  s.closePath();
  return s;
}

/**
 * Creates the beveled 3D Y2K wide rounded-rectangular letter "O".
 */
function createLetterOShape() {
  const s = new THREE.Shape();
  addRoundedRect(s, -0.52, -0.44, 1.04, 0.88, 0.28);
  const hole = new THREE.Path();
  addRoundedRect(hole, -0.24, -0.19, 0.48, 0.38, 0.12);
  s.holes.push(hole);
  return s;
}

/**
 * Creates the beveled 3D Y2K wide letter "D".
 */
function createLetterDShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.50, -0.44);
  s.lineTo(0.20, -0.44);
  s.quadraticCurveTo(0.54, -0.44, 0.54, -0.12);
  s.lineTo(0.54, 0.12);
  s.quadraticCurveTo(0.54, 0.44, 0.20, 0.44);
  s.lineTo(-0.50, 0.44);
  s.closePath();

  const hole = new THREE.Path();
  hole.moveTo(-0.22, -0.20);
  hole.lineTo(0.10, -0.20);
  hole.quadraticCurveTo(0.26, -0.20, 0.26, -0.06);
  hole.lineTo(0.26, 0.06);
  hole.quadraticCurveTo(0.26, 0.20, 0.10, 0.20);
  hole.lineTo(-0.22, 0.20);
  hole.closePath();
  s.holes.push(hole);
  return s;
}

/**
 * Creates a crisp chrome subtitle texture ("CLOTHING BRAND") for the floating 3D plate.
 */
function createSubtitleTexture(isDarkVariant = false) {
  const texCanvas = document.createElement("canvas");
  texCanvas.width = 1024;
  texCanvas.height = 160;
  const ctx = texCanvas.getContext("2d");
  ctx.clearRect(0, 0, texCanvas.width, texCanvas.height);

  const grad = ctx.createLinearGradient(0, 20, 0, 130);
  if (isDarkVariant) {
    grad.addColorStop(0.0, "#6c6c75");
    grad.addColorStop(0.45, "#b8b8c4");
    grad.addColorStop(0.55, "#42424a");
    grad.addColorStop(1.0, "#90909c");
  } else {
    grad.addColorStop(0.0, "#ffffff");
    grad.addColorStop(0.42, "#d8dce6");
    grad.addColorStop(0.54, "#8a909e");
    grad.addColorStop(0.85, "#f5f7fc");
    grad.addColorStop(1.0, "#b8beca");
  }

  ctx.fillStyle = grad;
  ctx.font = "900 italic 60px 'Arial Black', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
  ctx.shadowBlur = 10;
  ctx.fillText("C L O T H I N G   B R A N D", 512, 82);

  const texture = new THREE.CanvasTexture(texCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Builds the 3D Chrome Metallic YODO Logo sculpture (inspired by S4NT 360° chrome showcase).
 */
function createYodoChromeLogo() {
  const root = new THREE.Group();
  root.name = "yodo-chrome-logo";

  const chromeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xeef2f7,
    metalness: 1.0,
    roughness: 0.07,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.9,
    reflectivity: 1.0
  });

  const swooshMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdce2ec,
    metalness: 1.0,
    roughness: 0.09,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    envMapIntensity: 2.0
  });

  const extrudeSettings = {
    depth: 0.36,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.055,
    bevelOffset: 0,
    bevelSegments: 8,
    curveSegments: 24
  };

  // Wordmark group with subtle Y2K italic slant
  const wordmark = new THREE.Group();
  const letters = [
    { shape: createLetterYShape(), x: -1.78 },
    { shape: createLetterOShape(), x: -0.60 },
    { shape: createLetterDShape(), x: 0.62 },
    { shape: createLetterOShape(), x: 1.84 }
  ];

  letters.forEach(({ shape, x }) => {
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    const mesh = new THREE.Mesh(geom, chromeMaterial);
    mesh.position.set(x, 0.06, 0);
    // Subtle italic skew via matrix
    const skew = new THREE.Matrix4().makeShear(0.14, 0, 0, 0, 0, 0);
    mesh.geometry.applyMatrix4(skew);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    wordmark.add(mesh);
  });
  root.add(wordmark);

  // Signature Y2K orbiting chrome swoosh (upper arc + right wrap + lower left tail)
  const upperSwooshCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.75, 0.56, 0.04),
    new THREE.Vector3(0.40, 0.88, 0.14),
    new THREE.Vector3(1.85, 0.94, 0.06),
    new THREE.Vector3(2.68, 0.62, -0.06),
    new THREE.Vector3(2.58, 0.10, -0.14)
  ]);
  const upperSwooshGeom = new THREE.TubeGeometry(upperSwooshCurve, 64, 0.058, 16, false);
  const upperSwoosh = new THREE.Mesh(upperSwooshGeom, swooshMaterial);
  upperSwoosh.scale.set(1, 0.72, 1.35);
  root.add(upperSwoosh);

  const leftSwooshCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.12, 0.24, -0.10),
    new THREE.Vector3(-2.62, -0.14, 0.08),
    new THREE.Vector3(-2.35, -0.44, 0.14),
    new THREE.Vector3(-1.35, -0.52, 0.06)
  ]);
  const leftSwooshGeom = new THREE.TubeGeometry(leftSwooshCurve, 48, 0.052, 16, false);
  const leftSwoosh = new THREE.Mesh(leftSwooshGeom, swooshMaterial);
  leftSwoosh.scale.set(1, 0.70, 1.35);
  root.add(leftSwoosh);

  // Thin center underline highlight bar
  const underlineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.68, -0.52, 0.08),
    new THREE.Vector3(0.10, -0.48, 0.12),
    new THREE.Vector3(0.85, -0.47, 0.06)
  ]);
  const underlineMesh = new THREE.Mesh(
    new THREE.TubeGeometry(underlineCurve, 32, 0.022, 12, false),
    swooshMaterial
  );
  root.add(underlineMesh);

  // Floating subtitle ("CLOTHING BRAND") visible on front & back
  const subTexLight = createSubtitleTexture(false);
  const subTexDark = createSubtitleTexture(true);
  const subtitleMat = new THREE.MeshBasicMaterial({
    map: subTexLight,
    transparent: true,
    opacity: 0.96,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const subtitlePlane = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.55), subtitleMat);
  subtitlePlane.position.set(0.04, -0.92, 0.05);
  root.add(subtitlePlane);

  root.userData.materials = {
    chromeMaterial,
    swooshMaterial,
    subtitleMat,
    subTexLight,
    subTexDark
  };

  return root;
}

export async function initThreeScene() {
  if (!stage || !canvas || !status) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
  } catch (error) {
    console.warn("WebGL n’est pas disponible ; l’illustration de remplacement reste affichée.", error);
    status.textContent = "Aperçu logo affiché : WebGL n’est pas disponible sur cet appareil.";
    return;
  }

  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  const modelRoot = new THREE.Group();
  modelRoot.name = "model-root";
  scene.add(modelRoot);

  const clock = new THREE.Clock();

  // High-contrast studio environment map for liquid chrome specular reflections
  try {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv, 0.02).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 1.45;
    roomEnv.dispose();
    pmremGenerator.dispose();
  } catch (envError) {
    console.warn("RoomEnvironment IBL initialisation fallback:", envError);
  }

  // Dramatic Noir / Blanc / Bleu + subtle Rouge Chrome Studio Lighting
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
  keyLight.position.set(-2.5, 3.8, 4.5);
  scene.add(keyLight);

  const rimLightRight = new THREE.DirectionalLight(0x1652f0, 3.4);
  rimLightRight.position.set(4.0, 2.2, -2.5);
  scene.add(rimLightRight);

  const rimLightLeft = new THREE.DirectionalLight(0xe51f35, 1.5);
  rimLightLeft.position.set(-4.2, -1.5, -2.2);
  scene.add(rimLightLeft);

  const accentGlowLight = new THREE.PointLight(0x6ea0ff, 2.6, 10);
  accentGlowLight.position.set(0.2, 0.8, 3.2);
  scene.add(accentGlowLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambientLight);

  const yodoLogo = createYodoChromeLogo();
  modelRoot.add(yodoLogo);

  status.textContent = "Logo 3D Chrome YODO actif · Glissez pour faire pivoter.";

  let currentZoomOffset = 0;

  function updateCamera() {
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const aspect = bounds.width / bounds.height;
    const baseDistance = aspect < 1 ? 8.8 / Math.max(aspect, 0.65) : 7.4;
    const z = THREE.MathUtils.clamp(baseDistance - currentZoomOffset, 4.0, 14.0);

    camera.aspect = aspect;
    camera.position.set(0, 0.0, z);
    camera.lookAt(0, -0.05, 0);
    camera.updateProjectionMatrix();

    const isMobile = bounds.width < 600;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0));
    renderer.setSize(bounds.width, bounds.height, false);
  }

  function resize() {
    updateCamera();
    draw();
  }

  function setZoom(delta) {
    currentZoomOffset = THREE.MathUtils.clamp(currentZoomOffset + delta, -2.5, 3.0);
    updateCamera();
    draw();
  }

  function draw() {
    renderer.render(scene, camera);
  }

  let inView = false;
  let frame = 0;
  let activePointer = null;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let interactionUntil = 0;
  let autoRotationSpeed = 0.72;
  let elapsed = 0;

  function canAnimate() {
    return inView &&
      document.visibilityState === "visible" &&
      !reduceMotion.matches;
  }

  function stopFrames() {
    if (!frame) return;
    window.cancelAnimationFrame(frame);
    frame = 0;
  }

  function animate() {
    frame = 0;
    if (!canAnimate()) return;

    const delta = Math.min(clock.getDelta(), 0.05);
    elapsed += delta;

    if (performance.now() > interactionUntil && activePointer === null) {
      modelRoot.rotation.y += delta * autoRotationSpeed;
      // Subtle cinematic tilt & hover float like the S4NT 3D showcase
      modelRoot.rotation.x = Math.sin(elapsed * 0.9) * 0.09;
      modelRoot.position.y = Math.sin(elapsed * 1.4) * 0.06;
    }

    draw();
    frame = window.requestAnimationFrame(animate);
  }

  function syncMotion() {
    if (canAnimate()) {
      if (!frame) frame = window.requestAnimationFrame(animate);
    } else {
      stopFrames();
      draw();
    }
  }

  // Event Wiring: UI Controls & Interactions
  stage.addEventListener("yodo:rotate", (event) => {
    let delta = 0;
    if (typeof event.detail?.direction === "number") {
      delta = event.detail.direction * 0.55;
    } else if (typeof event.detail?.degrees === "number") {
      delta = THREE.MathUtils.degToRad(event.detail.degrees);
    } else {
      delta = 0.55;
    }
    modelRoot.rotation.y += delta;
    interactionUntil = performance.now() + 2200;
    draw();
  });

  stage.addEventListener("yodo:zoom", (event) => {
    const delta = typeof event.detail?.delta === "number" ? event.detail.delta : 0.5;
    setZoom(delta);
  });

  stage.addEventListener("yodo:colorway", (event) => {
    const mats = yodoLogo.userData?.materials;
    if (!mats) return;
    const variant = event.detail?.variant || "noir-rouge";
    if (variant === "blanc-rouge") {
      // Obsidian Dark Chrome (like S4NT black liquid metal)
      mats.chromeMaterial.color.setHex(0x282a30);
      mats.chromeMaterial.roughness = 0.09;
      mats.chromeMaterial.envMapIntensity = 2.1;
      mats.swooshMaterial.color.setHex(0x1f2128);
      mats.subtitleMat.map = mats.subTexDark;
      mats.subtitleMat.needsUpdate = true;
    } else {
      // Mirror Silver Chrome (official YODO chrome logo)
      mats.chromeMaterial.color.setHex(0xeef2f7);
      mats.chromeMaterial.roughness = 0.07;
      mats.chromeMaterial.envMapIntensity = 1.9;
      mats.swooshMaterial.color.setHex(0xdce2ec);
      mats.subtitleMat.map = mats.subTexLight;
      mats.subtitleMat.needsUpdate = true;
    }
    draw();
  });

  stage.addEventListener("yodo:led", (event) => {
    const raw = typeof event.detail?.intensity === "number" ? event.detail.intensity : 95;
    const factor = THREE.MathUtils.clamp(raw / 100, 0.25, 1.6);
    keyLight.intensity = 3.6 * factor;
    accentGlowLight.intensity = 2.6 * factor;
    scene.environmentIntensity = 1.45 * factor;
    draw();
  });

  stage.addEventListener("yodo:speed", (event) => {
    const raw = typeof event.detail?.speed === "number" ? event.detail.speed : 35;
    autoRotationSpeed = THREE.MathUtils.clamp((raw / 100) * 1.8, 0, 2.2);
  });

  stage.addEventListener("yodo:scroll-progress", (event) => {
    if (typeof event.detail?.progress === "number") {
      modelRoot.rotation.z = (event.detail.progress - 0.5) * 0.12;
      draw();
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    activePointer = event.pointerId;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activePointer) return;
    modelRoot.rotation.y += (event.clientX - lastPointerX) * 0.011;
    modelRoot.rotation.x = THREE.MathUtils.clamp(
      modelRoot.rotation.x + (event.clientY - lastPointerY) * 0.006,
      -0.35,
      0.35
    );
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    interactionUntil = performance.now() + 2200;
    draw();
  });

  const releasePointer = (event) => {
    if (event.pointerId === activePointer) activePointer = null;
  };
  canvas.addEventListener("pointerup", releasePointer);
  canvas.addEventListener("pointercancel", releasePointer);

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    setZoom(event.deltaY > 0 ? -0.45 : 0.45);
  }, { passive: false });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);

  const visibilityObserver = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    syncMotion();
  }, { threshold: 0.05 });
  visibilityObserver.observe(stage);

  document.addEventListener("visibilitychange", syncMotion);
  reduceMotion.addEventListener("change", syncMotion);

  resize();
  stage.classList.add("is-rendered");
  syncMotion();
}
