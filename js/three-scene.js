import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const stage = document.querySelector("#hero-stage");
const canvas = document.querySelector("#hero-canvas");
const status = document.querySelector("#scene-status");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/**
 * Generates a 512x512 procedural canvas bump map representing
 * a heavyweight French terry / diagonal cotton twill micro-weave.
 */
function createFabricBumpTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Neutral mid-gray base
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  // Micro-weave cell grid
  const cellSize = 8;
  for (let y = 0; y < size; y += cellSize) {
    for (let x = 0; x < size; x += cellSize) {
      const isWarp = ((x + y) / cellSize) % 2 === 0;
      const shade = isWarp ? 152 : 104;
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

      // Micro-thread yarn ridge
      ctx.fillStyle = isWarp ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";
      ctx.fillRect(x + 2, y + 2, cellSize - 4, (cellSize - 4) / 2);
    }
  }

  // Organic yarn fiber noise
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(28, 28);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

/**
 * Generates a 256x256 procedural canvas bump map representing
 * 1x1 elastic rib knit wales for waistband and sleeve cuffs.
 */
function createRibKnitTexture() {
  const width = 256;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#707070";
  ctx.fillRect(0, 0, width, height);

  // Chunky vertical rib ridges
  const ribPeriod = 16;
  for (let x = 0; x < width; x++) {
    const wave = Math.sin((x / ribPeriod) * Math.PI * 2);
    const shade = Math.floor(128 + wave * 72);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.fillRect(x, 0, 1, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 2);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

/**
 * Generates crisp YODO typographic brand graphics:
 * - Front: Minimalist chest emblem with YODO insignia and edition info.
 * - Back: Bold streetwear typographical statement block (visible during 360° turntable rotation).
 */
function createBrandDecalTexture(isBack = false, isLightGarment = false) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const primaryFg = isLightGarment ? "#080808" : "#ffffff";
  const secondaryFg = isLightGarment ? "#2a2a2e" : "#d8d8de";
  const mutedFg = isLightGarment ? "#55555c" : "#888888";

  if (!isBack) {
    canvas.width = 512;
    canvas.height = 256;
    ctx.clearRect(0, 0, 512, 256);

    // Monochrome YODO CLOTHING BRAND chest logo (respecting official black/white logo)
    ctx.fillStyle = primaryFg;
    ctx.fillRect(40, 48, 6, 96);

    // YODO brandmark (wide geometric monochrome lettering)
    ctx.save();
    ctx.fillStyle = primaryFg;
    ctx.font = "900 66px 'Arial Black', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textBaseline = "top";
    ctx.scale(1.22, 1.0);
    ctx.fillText("YODO", 50, 42);
    ctx.restore();

    // Official subtitle: CLOTHING BRAND
    ctx.fillStyle = secondaryFg;
    ctx.font = "700 18px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("C L O T H I N G   B R A N D", 62, 118);

    // Monochrome spec note
    ctx.fillStyle = mutedFg;
    ctx.font = "600 13px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("PARIS · TOKYO · ABIDJAN · 520 GSM", 62, 148);
  } else {
    canvas.width = 1024;
    canvas.height = 1024;
    ctx.clearRect(0, 0, 1024, 1024);

    // Monochrome frame border
    ctx.strokeStyle = isLightGarment ? "rgba(8, 8, 8, 0.55)" : "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 904, 904);

    // Monochrome top rule
    ctx.fillStyle = primaryFg;
    ctx.fillRect(90, 90, 844, 4);

    // Bold monochrome YODO logo
    ctx.save();
    ctx.fillStyle = primaryFg;
    ctx.textAlign = "center";
    ctx.font = "900 136px 'Arial Black', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.scale(1.18, 1.0);
    ctx.fillText("YODO", 512 / 1.18, 240);
    ctx.restore();

    // Official subtitle: CLOTHING BRAND
    ctx.fillStyle = secondaryFg;
    ctx.textAlign = "center";
    ctx.font = "700 32px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("C L O T H I N G   B R A N D", 512, 305);

    // Monochrome divider bar
    ctx.fillStyle = primaryFg;
    ctx.fillRect(362, 336, 300, 5);

    // Subtitle
    ctx.fillStyle = secondaryFg;
    ctx.font = "700 34px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("OVERSIZED FLEECE / 01", 512, 410);

    ctx.fillStyle = mutedFg;
    ctx.font = "600 24px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("HAUTE QUALITÉ · MOLLETON ÉPAIS", 512, 458);
    ctx.fillText("PARIS  ·  TOKYO  ·  ABIDJAN", 512, 502);

    // Monochrome graphic info panel
    ctx.fillStyle = isLightGarment ? "rgba(8, 8, 8, 0.06)" : "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(140, 560, 744, 280);

    ctx.fillStyle = primaryFg;
    ctx.font = "700 28px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("LIMITED EDITION 2026", 512, 630);

    ctx.fillStyle = mutedFg;
    ctx.font = "500 20px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("100% COTTON FRENCH TERRY — WATER REPELLENT COATING", 512, 680);
    ctx.fillText("ALL RIGHTS RESERVED © YODO CLOTHING BRAND", 512, 730);

    ctx.fillStyle = primaryFg;
    ctx.fillRect(462, 780, 100, 5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Helper to create an oriented cylinder segment between two 3D points.
 */
function createOrientedCylinder(start, end, radiusTop, radiusBottom, material, segments = 24) {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  const geom = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, segments);
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Builds the high-end YODO Oversize Streetwear Hoodie centerpiece.
 * Self-contained procedural Three.js construction with zero external HTTP requests.
 */
function createStreetwearGarment() {
  const root = new THREE.Group();
  root.name = "yodo-streetwear-garment";

  // Procedural textures
  const fabricBump = createFabricBumpTexture();
  const ribKnitBump = createRibKnitTexture();
  const frontDecalMapDark = createBrandDecalTexture(false, false);
  const backDecalMapDark = createBrandDecalTexture(true, false);
  const frontDecalMapLight = createBrandDecalTexture(false, true);
  const backDecalMapLight = createBrandDecalTexture(true, true);

  // Materials palette
  const hoodieFabricMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x181819,              // Deep YODO charcoal graphite
    roughness: 0.84,
    metalness: 0.02,
    sheen: 0.90,                  // Micro-fiber backscatter for realistic cloth sheen
    sheenRoughness: 0.50,
    sheenColor: new THREE.Color(0x76767c),
    bumpMap: fabricBump,
    bumpScale: 0.007,
    clearcoat: 0.0
  });

  const ribKnitMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x141415,
    roughness: 0.88,
    metalness: 0.02,
    sheen: 0.82,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(0x68686e),
    bumpMap: ribKnitBump,
    bumpScale: 0.016
  });

  const technicalNylonMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1b1b1d,
    roughness: 0.42,
    metalness: 0.08,
    clearcoat: 0.25,
    clearcoatRoughness: 0.30
  });

  const metallicHardwareMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8d8de,
    roughness: 0.18,
    metalness: 0.96
  });

  const cordMaterial = new THREE.MeshStandardMaterial({
    color: 0x222224,
    roughness: 0.72,
    metalness: 0.04
  });

  const pedestalMaterial = new THREE.MeshStandardMaterial({
    color: 0x08080a,              // Ultra-matte obsidian
    roughness: 0.45,
    metalness: 0.35
  });

  const chromePodiumMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd8d8e2,              // Brushed showroom chrome
    roughness: 0.16,
    metalness: 0.96,
    clearcoat: 0.45,
    clearcoatRoughness: 0.14
  });

  const podiumTopMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0b0b0e,              // Polished dark obsidian mirror top
    roughness: 0.14,
    metalness: 0.82,
    clearcoat: 0.90,
    clearcoatRoughness: 0.10
  });

  const yodoAccentMaterial = new THREE.MeshStandardMaterial({
    color: 0xe52335,              // Brand crimson (#E51F35 / #E52335)
    emissive: 0xe51f35,
    emissiveIntensity: 0.28,
    roughness: 0.32,
    metalness: 0.22
  });

  const ledHaloMaterial = new THREE.MeshStandardMaterial({
    color: 0xe51f35,
    emissive: 0xe51f35,
    emissiveIntensity: 3.2,
    roughness: 0.15,
    metalness: 0.10
  });

  const innerLiningMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f0f10,
    roughness: 0.92,
    metalness: 0.0,
    side: THREE.DoubleSide
  });

  // ----------------------------------------------------
  // 1. Luxury Chrome Showroom Podium & Red LED Halo
  // ----------------------------------------------------
  const baseDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.88, 0.92, 0.04, 64),
    pedestalMaterial
  );
  baseDisc.position.set(0, 0.02, 0);
  baseDisc.receiveShadow = true;
  root.add(baseDisc);

  // Main brushed-chrome circular showroom podium drum
  const podiumDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.90, 0.90, 0.20, 64),
    chromePodiumMaterial
  );
  podiumDrum.position.set(0, 0.14, 0);
  podiumDrum.castShadow = true;
  podiumDrum.receiveShadow = true;
  root.add(podiumDrum);

  // Dark obsidian reflective top plate of the podium
  const podiumTopPlate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.885, 0.885, 0.016, 64),
    podiumTopMaterial
  );
  podiumTopPlate.position.set(0, 0.246, 0);
  podiumTopPlate.receiveShadow = true;
  root.add(podiumTopPlate);

  // Upper chrome bevel ring
  const topBevelRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.892, 0.010, 16, 64),
    chromePodiumMaterial
  );
  topBevelRing.position.set(0, 0.242, 0);
  topBevelRing.rotation.x = Math.PI / 2;
  root.add(topBevelRing);

  // Glowing Red LED Underglow Halo Ring at podium base
  const accentRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.906, 0.015, 16, 64),
    ledHaloMaterial
  );
  accentRing.position.set(0, 0.036, 0);
  accentRing.rotation.x = Math.PI / 2;
  root.add(accentRing);

  // Secondary upper crimson trim line on podium
  const upperLedTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.902, 0.005, 12, 64),
    ledHaloMaterial
  );
  upperLedTrim.position.set(0, 0.232, 0);
  upperLedTrim.rotation.x = Math.PI / 2;
  root.add(upperLedTrim);

  // Radial Red LED floor reflection halo canvas texture
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 256;
  glowCanvas.height = 256;
  const glowCtx = glowCanvas.getContext("2d");
  const grad = glowCtx.createRadialGradient(128, 128, 48, 128, 128, 126);
  grad.addColorStop(0.0, "rgba(229, 31, 53, 0.0)");
  grad.addColorStop(0.58, "rgba(229, 31, 53, 0.55)");
  grad.addColorStop(0.72, "rgba(229, 31, 53, 0.28)");
  grad.addColorStop(1.0, "rgba(229, 31, 53, 0.0)");
  glowCtx.fillStyle = grad;
  glowCtx.fillRect(0, 0, 256, 256);
  const glowTex = new THREE.CanvasTexture(glowCanvas);
  glowTex.colorSpace = THREE.SRGBColorSpace;

  const floorGlowMaterial = new THREE.MeshBasicMaterial({
    map: glowTex,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const floorGlowDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(2.55, 2.55),
    floorGlowMaterial
  );
  floorGlowDisc.rotation.x = -Math.PI / 2;
  floorGlowDisc.position.set(0, 0.003, 0);
  root.add(floorGlowDisc);

  const riserColumn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.045, 0.76, 32),
    pedestalMaterial
  );
  riserColumn.position.set(0, 0.62, 0);
  riserColumn.castShadow = true;
  riserColumn.receiveShadow = true;
  root.add(riserColumn);

  // Exhibition inner bust (supports garment from within)
  const bustBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.26, 0.72, 32),
    pedestalMaterial
  );
  bustBody.position.set(0, 1.48, 0);
  bustBody.castShadow = true;
  root.add(bustBody);

  const bustNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.10, 0.12, 0.28, 24),
    pedestalMaterial
  );
  bustNeck.position.set(0, 2.05, 0);
  root.add(bustNeck);

  const neckCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.10, 0.10, 0.02, 24),
    metallicHardwareMaterial
  );
  neckCap.position.set(0, 2.19, 0);
  root.add(neckCap);

  // ----------------------------------------------------
  // 2. Torso: Oversized Heavyweight Molleton Body
  // ----------------------------------------------------
  const waistband = new THREE.Mesh(
    new THREE.CylinderGeometry(0.39, 0.395, 0.12, 36),
    ribKnitMaterial
  );
  waistband.position.set(0, 1.02, 0);
  waistband.scale.set(1.08, 1.0, 0.78);
  waistband.castShadow = true;
  waistband.receiveShadow = true;
  root.add(waistband);

  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.41, 0.86, 36, 12),
    hoodieFabricMaterial
  );
  torso.position.set(0, 1.49, 0);
  torso.scale.set(1.18, 1.0, 0.80);
  torso.castShadow = true;
  torso.receiveShadow = true;
  root.add(torso);

  // Dropped shoulder transitions & side welts
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 0.22, 6, 18),
      hoodieFabricMaterial
    );
    shoulder.position.set(side * 0.36, 1.86, 0);
    shoulder.rotation.z = side * -0.32;
    shoulder.scale.set(1.0, 1.0, 0.82);
    shoulder.castShadow = true;
    shoulder.receiveShadow = true;
    root.add(shoulder);

    const sideSeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.82, 12),
      technicalNylonMaterial
    );
    sideSeam.position.set(side * 0.49, 1.48, 0);
    root.add(sideSeam);
  }

  // Top shoulder overlock seam bead
  const topSeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.010, 0.010, 0.98, 16),
    technicalNylonMaterial
  );
  topSeam.position.set(0, 1.90, 0);
  topSeam.rotation.z = Math.PI / 2;
  root.add(topSeam);

  // ----------------------------------------------------
  // 3. Front Kangaroo Cargo Pocket
  // ----------------------------------------------------
  const pocket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.43, 0.45, 0.28, 28, 4, false, -Math.PI * 0.28, Math.PI * 0.56),
    hoodieFabricMaterial
  );
  pocket.position.set(0, 1.25, 0.03);
  pocket.scale.set(1.19, 1.0, 0.82);
  pocket.castShadow = true;
  pocket.receiveShadow = true;
  root.add(pocket);

  const pocketTopWelt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.44, 16),
    technicalNylonMaterial
  );
  pocketTopWelt.position.set(0, 1.39, 0.33);
  pocketTopWelt.rotation.z = Math.PI / 2;
  root.add(pocketTopWelt);

  for (const side of [-1, 1]) {
    const entryWelt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.22, 16),
      technicalNylonMaterial
    );
    entryWelt.position.set(side * 0.24, 1.26, 0.30);
    entryWelt.rotation.z = side * -0.42;
    root.add(entryWelt);
  }

  const pocketLabel = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.035, 0.024),
    yodoAccentMaterial
  );
  pocketLabel.position.set(0.25, 1.28, 0.31);
  root.add(pocketLabel);

  // ----------------------------------------------------
  // 4. Branding Decals (Front Insignia & Back Typo Panel)
  // ----------------------------------------------------
  const frontDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.09),
    new THREE.MeshBasicMaterial({
      map: frontDecalMapDark,
      transparent: true,
      opacity: 0.94,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
      polygonOffsetUnits: -1.0
    })
  );
  frontDecal.position.set(-0.16, 1.70, 0.352);
  frontDecal.rotation.y = -0.21;
  frontDecal.renderOrder = 2;
  root.add(frontDecal);

  const backDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.42),
    new THREE.MeshBasicMaterial({
      map: backDecalMapDark,
      transparent: true,
      opacity: 0.90,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
      polygonOffsetUnits: -1.0
    })
  );
  backDecal.position.set(0, 1.62, -0.370);
  backDecal.rotation.y = Math.PI;
  backDecal.renderOrder = 2;
  root.add(backDecal);

  // ----------------------------------------------------
  // 5. Articulated Draped Sleeves & Ribbed Cuffs
  // ----------------------------------------------------
  for (const side of [-1, 1]) {
    const shoulderPt = new THREE.Vector3(side * 0.46, 1.84, 0.0);
    const elbowPt = new THREE.Vector3(side * 0.66, 1.48, 0.04);
    const wristPt = new THREE.Vector3(side * 0.58, 1.08, 0.10);
    const cuffEndPt = new THREE.Vector3(side * 0.56, 0.98, 0.12);

    const upperSleeveAxis = new THREE.Vector3().subVectors(elbowPt, shoulderPt).normalize();
    const forearmAxis = new THREE.Vector3().subVectors(wristPt, elbowPt).normalize();
    const elbowBisectorAxis = new THREE.Vector3().addVectors(upperSleeveAxis, forearmAxis).normalize();

    // Upper sleeve
    root.add(createOrientedCylinder(shoulderPt, elbowPt, 0.18, 0.15, hoodieFabricMaterial));

    // Signature YODO red dropped-shoulder sleeve piping (orthogonal to upperSleeveAxis)
    const pipingPt = new THREE.Vector3().lerpVectors(shoulderPt, elbowPt, 0.36);
    const sleevePiping = new THREE.Mesh(
      new THREE.TorusGeometry(0.171, 0.0075, 12, 32),
      yodoAccentMaterial
    );
    sleevePiping.position.copy(pipingPt);
    sleevePiping.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), upperSleeveAxis);
    root.add(sleevePiping);

    // Elbow gathering crease fold ring (orthogonal to elbow bisector axis)
    const elbowFold = new THREE.Mesh(
      new THREE.TorusGeometry(0.155, 0.022, 12, 24),
      hoodieFabricMaterial
    );
    elbowFold.position.copy(elbowPt);
    elbowFold.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), elbowBisectorAxis);
    elbowFold.castShadow = true;
    root.add(elbowFold);

    // Forearm
    root.add(createOrientedCylinder(elbowPt, wristPt, 0.15, 0.125, hoodieFabricMaterial));

    // 1x1 Ribbed knit wrist cuff
    root.add(createOrientedCylinder(wristPt, cuffEndPt, 0.115, 0.110, ribKnitMaterial));

    // Cuff opening interior disc
    const cuffOpening = new THREE.Mesh(
      new THREE.CircleGeometry(0.10, 18),
      innerLiningMaterial
    );
    cuffOpening.position.copy(cuffEndPt);
    cuffOpening.rotation.x = Math.PI / 2;
    root.add(cuffOpening);
  }

  // ----------------------------------------------------
  // 6. Volumetric Oversized Hood
  // ----------------------------------------------------
  const hoodCowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.72),
    hoodieFabricMaterial
  );
  hoodCowl.position.set(0, 2.14, -0.06);
  hoodCowl.scale.set(0.92, 1.06, 1.02);
  hoodCowl.castShadow = true;
  hoodCowl.receiveShadow = true;
  root.add(hoodCowl);

  const faceHem = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.042, 16, 32, Math.PI * 1.55),
    hoodieFabricMaterial
  );
  faceHem.position.set(0, 2.15, 0.14);
  faceHem.rotation.x = 0.28;
  faceHem.castShadow = true;
  root.add(faceHem);

  const backDrape = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 24, 16),
    hoodieFabricMaterial
  );
  backDrape.position.set(0, 1.96, -0.22);
  backDrape.scale.set(1.24, 0.72, 0.82);
  backDrape.castShadow = true;
  root.add(backDrape);

  const innerHood = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.68),
    innerLiningMaterial
  );
  innerHood.position.set(0, 2.14, -0.05);
  innerHood.scale.set(0.89, 1.03, 0.99);
  root.add(innerHood);

  // ----------------------------------------------------
  // 7. Eyelets, Braided Drawstrings & Metallic Aglets
  // ----------------------------------------------------
  for (const side of [-1, 1]) {
    const eyelet = new THREE.Mesh(
      new THREE.TorusGeometry(0.022, 0.007, 12, 24),
      metallicHardwareMaterial
    );
    eyelet.position.set(side * 0.085, 1.94, 0.26);
    eyelet.rotation.y = side * -0.22;
    eyelet.rotation.x = 0.30;
    root.add(eyelet);
  }

  const leftCordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.085, 1.94, 0.26),
    new THREE.Vector3(-0.11, 1.78, 0.375),
    new THREE.Vector3(-0.13, 1.58, 0.370),
    new THREE.Vector3(-0.10, 1.42, 0.375),
    new THREE.Vector3(-0.12, 1.28, 0.405)
  ]);
  const leftCord = new THREE.Mesh(
    new THREE.TubeGeometry(leftCordCurve, 32, 0.010, 12, false),
    cordMaterial
  );
  leftCord.castShadow = true;
  root.add(leftCord);

  const rightCordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.085, 1.94, 0.26),
    new THREE.Vector3(0.11, 1.76, 0.375),
    new THREE.Vector3(0.14, 1.56, 0.370),
    new THREE.Vector3(0.12, 1.40, 0.375),
    new THREE.Vector3(0.13, 1.24, 0.405)
  ]);
  const rightCord = new THREE.Mesh(
    new THREE.TubeGeometry(rightCordCurve, 32, 0.010, 12, false),
    cordMaterial
  );
  rightCord.castShadow = true;
  root.add(rightCord);

  const leftAglet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.013, 0.065, 16),
    metallicHardwareMaterial
  );
  leftAglet.position.set(-0.12, 1.25, 0.405);
  leftAglet.rotation.z = 0.12;
  root.add(leftAglet);

  const rightAglet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.013, 0.065, 16),
    metallicHardwareMaterial
  );
  rightAglet.position.set(0.13, 1.21, 0.405);
  rightAglet.rotation.z = -0.10;
  root.add(rightAglet);

  root.userData.materials = {
    hoodieFabricMaterial,
    ribKnitMaterial,
    cordMaterial,
    ledHaloMaterial,
    floorGlowMaterial,
    yodoAccentMaterial,
    frontDecalMaterial: frontDecal.material,
    backDecalMaterial: backDecal.material,
    frontDecalMapDark,
    backDecalMapDark,
    frontDecalMapLight,
    backDecalMapLight
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
      antialias: window.devicePixelRatio < 1.75,
      powerPreference: "high-performance"
    });
  } catch (error) {
    console.warn("WebGL n’est pas disponible ; l’illustration de remplacement reste affichée.", error);
    status.textContent = "Aperçu illustré affiché : WebGL n’est pas disponible sur cet appareil.";
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
  const modelRoot = new THREE.Group();
  modelRoot.name = "model-root";
  scene.add(modelRoot);

  const clock = new THREE.Clock();

  // ----------------------------------------------------
  // RoomEnvironment IBL for PBR sheen & reflections
  // ----------------------------------------------------
  try {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envTexture = pmremGenerator.fromScene(roomEnv).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.85;
    roomEnv.dispose();
    pmremGenerator.dispose();
  } catch (envError) {
    console.warn("RoomEnvironment IBL initialisation fallback:", envError);
  }

  // ----------------------------------------------------
  // 4-Point Editorial Studio Lighting Rig
  // ----------------------------------------------------
  // 1. Warm Key Softbox (Main sculptural light with soft PCF shadows)
  const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.4);
  keyLight.position.set(-3.2, 4.8, 3.8);
  keyLight.target.position.set(0, 1.48, 0);
  scene.add(keyLight.target);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1.0;
  keyLight.shadow.camera.far = 14.0;
  keyLight.shadow.camera.left = -2.4;
  keyLight.shadow.camera.right = 2.4;
  keyLight.shadow.camera.top = 2.5;
  keyLight.shadow.camera.bottom = -2.2;
  keyLight.shadow.bias = -0.0003;
  keyLight.shadow.normalBias = 0.025;
  keyLight.shadow.radius = 2.8;
  scene.add(keyLight);

  // 2. Cool Fill Reflector (Softens shadows, 2.5:1 ratio)
  const fillLight = new THREE.DirectionalLight(0xedf2ff, 0.95);
  fillLight.position.set(3.0, 2.8, 3.0);
  fillLight.target.position.set(0, 1.48, 0);
  scene.add(fillLight.target);
  scene.add(fillLight);

  // 3. Signature YODO Crimson Rim Kicker (Brand edge highlight)
  const rimKickerRed = new THREE.DirectionalLight(0xe52335, 2.2);
  rimKickerRed.position.set(2.8, 3.2, -2.6);
  rimKickerRed.target.position.set(0, 1.48, 0);
  scene.add(rimKickerRed.target);
  scene.add(rimKickerRed);

  // 4. Cool Ice Silhouette Kicker (Crisp edge separation on left flank)
  const rimKickerCool = new THREE.DirectionalLight(0xd4e4fc, 1.6);
  rimKickerCool.position.set(-2.8, 3.0, -2.6);
  rimKickerCool.target.position.set(0, 1.48, 0);
  scene.add(rimKickerCool.target);
  scene.add(rimKickerCool);

  // 5. Overhead Softbox (Top-down sheen on hood crest and shoulders)
  const topLight = new THREE.DirectionalLight(0xffffff, 0.7);
  topLight.position.set(0, 5.0, 0.4);
  topLight.target.position.set(0, 1.48, 0);
  scene.add(topLight.target);
  scene.add(topLight);

  // 6. Base Ambient Light (Universal low-end lift)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambientLight);

  // 7. Showroom Podium Red LED Underglow Point Lights (#E51F35)
  const podiumRedLightFront = new THREE.PointLight(0xe51f35, 2.2, 4.2);
  podiumRedLightFront.position.set(0.35, 0.18, 0.95);
  scene.add(podiumRedLightFront);

  const podiumRedLightSide = new THREE.PointLight(0xe51f35, 2.4, 4.5);
  podiumRedLightSide.position.set(0.95, 0.35, -0.35);
  scene.add(podiumRedLightSide);

  // ----------------------------------------------------
  // Dynamic Contact Shadow Ground Plane
  // ----------------------------------------------------
  const groundGeometry = new THREE.PlaneGeometry(10, 10);
  const groundMaterial = new THREE.ShadowMaterial({
    opacity: 0.38,
    transparent: true
  });
  const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.y = 0.001;
  groundPlane.receiveShadow = true;
  scene.add(groundPlane);

  // ----------------------------------------------------
  // Mount 3D Streetwear Garment Centerpiece
  // ----------------------------------------------------
  const streetwearGarment = createStreetwearGarment();
  modelRoot.add(streetwearGarment);

  status.textContent = "Scène 3D streetwear active.";

  // ----------------------------------------------------
  // Responsive Camera Framing Mathematics
  // ----------------------------------------------------
  let currentZoomOffset = 0;

  function updateCamera() {
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const aspect = bounds.width / bounds.height;
    const baseDistance = Math.max(4.6, 4.6 / Math.min(1.0, aspect));
    const z = THREE.MathUtils.clamp(baseDistance - currentZoomOffset, 3.2, 9.5);

    camera.aspect = aspect;
    camera.position.set(0, 1.48, z);
    camera.lookAt(0, 1.48, 0);
    camera.updateProjectionMatrix();

    const isMobile = bounds.width < 600;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5));
    renderer.setSize(bounds.width, bounds.height, false);
  }

  function resize() {
    updateCamera();
    draw();
  }

  function setZoom(delta) {
    currentZoomOffset = THREE.MathUtils.clamp(currentZoomOffset + delta, -1.8, 2.2);
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
  let autoRotationSpeed = 0.16;

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
    if (performance.now() > interactionUntil && activePointer === null) {
      modelRoot.rotation.y += delta * autoRotationSpeed;
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

  // ----------------------------------------------------
  // Event Wiring: UI Controls & Interactions
  // ----------------------------------------------------
  stage.addEventListener("yodo:rotate", (event) => {
    let delta = 0;
    if (typeof event.detail?.direction === "number") {
      delta = event.detail.direction * 0.45;
    } else if (typeof event.detail?.degrees === "number") {
      delta = THREE.MathUtils.degToRad(event.detail.degrees);
    } else {
      delta = 0.45;
    }
    modelRoot.rotation.y += delta;
    interactionUntil = performance.now() + 2500;
    draw();
  });

  stage.addEventListener("yodo:zoom", (event) => {
    const delta = typeof event.detail?.delta === "number" ? event.detail.delta : 0.35;
    setZoom(delta);
  });

  stage.addEventListener("yodo:colorway", (event) => {
    const mats = streetwearGarment.userData?.materials;
    if (!mats) return;
    const variant = event.detail?.variant || "noir-rouge";
    if (variant === "blanc-rouge") {
      mats.hoodieFabricMaterial.color.setHex(0xe8e8ed);
      mats.hoodieFabricMaterial.sheenColor.setHex(0xffffff);
      mats.ribKnitMaterial.color.setHex(0xdcdce2);
      mats.ribKnitMaterial.sheenColor.setHex(0xf4f4f8);
      if (mats.cordMaterial) mats.cordMaterial.color.setHex(0x18181c);
      if (mats.frontDecalMaterial && mats.frontDecalMapLight) {
        mats.frontDecalMaterial.map = mats.frontDecalMapLight;
        mats.frontDecalMaterial.needsUpdate = true;
      }
      if (mats.backDecalMaterial && mats.backDecalMapLight) {
        mats.backDecalMaterial.map = mats.backDecalMapLight;
        mats.backDecalMaterial.needsUpdate = true;
      }
    } else {
      mats.hoodieFabricMaterial.color.setHex(0x181819);
      mats.hoodieFabricMaterial.sheenColor.setHex(0x76767c);
      mats.ribKnitMaterial.color.setHex(0x141415);
      mats.ribKnitMaterial.sheenColor.setHex(0x68686e);
      if (mats.cordMaterial) mats.cordMaterial.color.setHex(0x222224);
      if (mats.frontDecalMaterial && mats.frontDecalMapDark) {
        mats.frontDecalMaterial.map = mats.frontDecalMapDark;
        mats.frontDecalMaterial.needsUpdate = true;
      }
      if (mats.backDecalMaterial && mats.backDecalMapDark) {
        mats.backDecalMaterial.map = mats.backDecalMapDark;
        mats.backDecalMaterial.needsUpdate = true;
      }
    }
    draw();
  });

  stage.addEventListener("yodo:led", (event) => {
    const mats = streetwearGarment.userData?.materials;
    const raw = typeof event.detail?.intensity === "number" ? event.detail.intensity : 85;
    const factor = THREE.MathUtils.clamp(raw / 100, 0.15, 1.5);
    if (mats?.ledHaloMaterial) {
      mats.ledHaloMaterial.emissiveIntensity = 3.6 * factor;
    }
    if (mats?.floorGlowMaterial) {
      mats.floorGlowMaterial.opacity = THREE.MathUtils.clamp(0.95 * factor, 0.2, 1.0);
    }
    rimKickerRed.intensity = 2.6 * factor;
    podiumRedLightFront.intensity = 2.4 * factor;
    podiumRedLightSide.intensity = 2.6 * factor;
    draw();
  });

  stage.addEventListener("yodo:speed", (event) => {
    const raw = typeof event.detail?.speed === "number" ? event.detail.speed : 35;
    autoRotationSpeed = THREE.MathUtils.clamp((raw / 100) * 0.45, 0, 0.6);
  });

  stage.addEventListener("yodo:scroll-progress", (event) => {
    if (typeof event.detail?.progress === "number") {
      modelRoot.rotation.z = (event.detail.progress - 0.5) * 0.10;
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
    modelRoot.rotation.y += (event.clientX - lastPointerX) * 0.009;
    modelRoot.rotation.x = THREE.MathUtils.clamp(
      modelRoot.rotation.x + (event.clientY - lastPointerY) * 0.004,
      -0.12,
      0.12
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
    setZoom(event.deltaY > 0 ? -0.35 : 0.35);
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
