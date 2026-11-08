import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const stage = document.querySelector("#hero-stage");
const canvas = document.querySelector("#hero-canvas");
const status = document.querySelector("#scene-status");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function makeCapsuleBetween(start, end, radius, material) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, Math.max(length - radius * 2, 0.01), 5, 12),
    material
  );
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeMannequin({ feminine }) {
  const root = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: feminine ? 0x686868 : 0xe0e0e0,
    roughness: 0.72
  });
  const trousersMaterial = new THREE.MeshStandardMaterial({
    color: feminine ? 0x202020 : 0x444444,
    roughness: 0.82
  });
  const mannequinMaterial = new THREE.MeshStandardMaterial({
    color: 0xb7b7b7,
    roughness: 0.56,
    metalness: 0.08
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xe52335,
    roughness: 0.5
  });
  const torsoWidth = feminine ? 0.35 : 0.4;
  const shoulderWidth = feminine ? 0.43 : 0.49;

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(torsoWidth, 0.66, 6, 18),
    bodyMaterial
  );
  torso.position.y = 1.78;
  torso.scale.z = 0.76;
  torso.castShadow = true;
  root.add(torso);

  const hips = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.4, 0.38, 20),
    trousersMaterial
  );
  hips.position.y = 1.19;
  hips.castShadow = true;
  root.add(hips);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.12, 0.2, 16),
    mannequinMaterial
  );
  neck.position.y = 2.38;
  root.add(neck);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.235, 24, 18),
    mannequinMaterial
  );
  head.position.y = 2.68;
  head.scale.set(0.88, 1.12, 0.92);
  head.castShadow = true;
  root.add(head);

  const upperShoulder = new THREE.Vector3(shoulderWidth, 2.05, 0);
  for (const side of [-1, 1]) {
    const upperArm = new THREE.Vector3(side * (shoulderWidth + 0.08), 1.68, 0);
    const wrist = new THREE.Vector3(side * (shoulderWidth + 0.17), 1.04, 0.025);
    root.add(makeCapsuleBetween(
      new THREE.Vector3(side * upperShoulder.x, upperShoulder.y, 0),
      upperArm,
      0.135,
      bodyMaterial
    ));
    root.add(makeCapsuleBetween(upperArm, wrist, 0.105, bodyMaterial));

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), mannequinMaterial);
    hand.position.copy(wrist).setY(0.91);
    hand.scale.set(0.72, 1.25, 0.62);
    root.add(hand);

    const hip = new THREE.Vector3(side * 0.2, 0.97, 0);
    const ankle = new THREE.Vector3(side * 0.23, 0.16, 0.015);
    root.add(makeCapsuleBetween(hip, ankle, feminine ? 0.145 : 0.16, trousersMaterial));

    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.27, 0.13, 0.42),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.55 })
    );
    shoe.position.set(side * 0.23, 0.07, 0.11);
    shoe.castShadow = true;
    root.add(shoe);
  }

  const shirtPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.52, 0.025),
    feminine ? accentMaterial : mannequinMaterial
  );
  shirtPanel.position.set(0, 1.78, 0.295);
  root.add(shirtPanel);

  const hem = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.035, 0.025),
    accentMaterial
  );
  hem.position.set(0, 1.38, 0.285);
  root.add(hem);

  return root;
}

function normalizeModel(model) {
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y <= 0) {
    throw new Error("Le modèle GLB ne contient pas de géométrie visible.");
  }

  const center = bounds.getCenter(new THREE.Vector3());
  const scale = 2.85 / size.y;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  model.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  return model;
}

async function loadModel(path, loader) {
  try {
    const gltf = await loader.loadAsync(path);
    return normalizeModel(gltf.scene);
  } catch (error) {
    console.warn(`Chargement du modèle ${path} impossible ; mannequin de démonstration utilisé.`, error);
    return null;
  }
}

export async function initThreeScene() {
  if (!stage || !canvas || !status) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: window.devicePixelRatio < 1.5,
      powerPreference: "high-performance"
    });
  } catch (error) {
    console.warn("WebGL n’est pas disponible ; l’illustration de remplacement reste affichée.", error);
    status.textContent = "Aperçu illustré affiché : WebGL n’est pas disponible sur cet appareil.";
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
  const modelRoot = new THREE.Group();
  const loader = new GLTFLoader();
  const clock = new THREE.Clock();

  scene.add(modelRoot);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x292929, 2.1));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
  keyLight.position.set(-3.5, 5, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(512, 512);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xe52335, 14, 8, 2);
  rimLight.position.set(2.5, 2.4, -1.5);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(1.45, 40),
    new THREE.MeshBasicMaterial({ color: 0x030303, transparent: true, opacity: 0.74 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.scale.set(1, 0.23, 1);
  floor.position.set(0, 0.015, 0.1);
  scene.add(floor);

  const slots = [
    { id: "homme", path: "./assets/models3d/mannequin-homme.glb", feminine: false, x: -0.72 },
    { id: "femme", path: "./assets/models3d/mannequin-femme.glb", feminine: true, x: 0.72 }
  ];
  slots.forEach((slot) => {
    const fallback = makeMannequin({ feminine: slot.feminine });
    fallback.name = `${slot.id}-fallback`;
    fallback.position.x = slot.x;
    fallback.rotation.y = slot.feminine ? -0.12 : 0.12;
    modelRoot.add(fallback);
  });
  status.textContent = "Mannequins 3D de démonstration. Les modèles définitifs se chargent à l’ouverture du hero.";

  async function loadModels() {
    const loaded = await Promise.all(slots.map(async (slot) => {
      const model = await loadModel(slot.path, loader);
      if (!model) return false;
      const fallback = modelRoot.getObjectByName(`${slot.id}-fallback`);
      if (fallback) modelRoot.remove(fallback);
      model.position.x += slot.x;
      model.rotation.y = slot.feminine ? -0.12 : 0.12;
      modelRoot.add(model);
      return true;
    }));
    const missing = loaded.filter((success) => !success).length;
    if (missing === slots.length) {
      status.textContent = "Mannequins 3D de démonstration. Ajoutez les fichiers GLB pour afficher les modèles définitifs.";
    } else if (missing > 0) {
      status.textContent = "Un modèle GLB manque ; un mannequin 3D de démonstration le remplace.";
    } else {
      status.textContent = "Modèles 3D chargés.";
    }
    draw();
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  function resize() {
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const mobile = bounds.width < 600;
    camera.aspect = bounds.width / bounds.height;
    camera.position.set(0, mobile ? 1.55 : 1.45, mobile ? 6.4 : 4.9);
    camera.lookAt(0, 1.48, 0);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5));
    renderer.setSize(bounds.width, bounds.height, false);
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
  let modelLoadStarted = false;

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
      modelRoot.rotation.y += delta * 0.12;
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

  function setZoom(delta) {
    camera.position.z = THREE.MathUtils.clamp(camera.position.z - delta, 3.6, 8);
    camera.updateProjectionMatrix();
    draw();
  }

  stage.addEventListener("yodo:rotate", (event) => {
    modelRoot.rotation.y += THREE.MathUtils.degToRad(event.detail.degrees);
    interactionUntil = performance.now() + 2200;
    draw();
  });
  stage.addEventListener("yodo:zoom", (event) => setZoom(event.detail.delta));
  stage.addEventListener("yodo:scroll-progress", (event) => {
    modelRoot.rotation.z = (event.detail.progress - 0.5) * 0.12;
    draw();
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
    if (inView && !modelLoadStarted) {
      modelLoadStarted = true;
      loadModels().catch((error) => {
        console.error("Le chargement des mannequins a échoué.", error);
        status.textContent = "Mannequins de démonstration affichés : le chargement des modèles a échoué.";
      });
    }
    syncMotion();
  }, { threshold: 0.05 });
  visibilityObserver.observe(stage);
  document.addEventListener("visibilitychange", syncMotion);
  reduceMotion.addEventListener("change", syncMotion);

  resize();
  stage.classList.add("is-rendered");
  syncMotion();
}
