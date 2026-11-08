# Handoff Report: Survey of 3D Scene Architecture, Placeholder Mannequins, and Studio Lighting

**Agent**: Explorer 2 (Survey - 3D Scene, Mannequins & Studio Lighting)  
**Date**: 2026-11-08T18:22:30Z  
**Target File**: `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_survey_2/handoff.md`

---

## 1. Observation

### 1.1 Codebase Structure & Dependencies
- **Three.js Version & Import Map**:
  - `index.html` lines 10-17:
    ```html
    <script type="importmap">
      {
        "imports": {
          "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/",
          "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js",
          "gsap/ScrollTrigger": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js"
        }
      }
    </script>
    ```
  - `js/three-scene.js` lines 1-2:
    ```javascript
    import * as THREE from "three";
    import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
    ```
  - Modern Three.js r170 ESM build is available, along with `three/addons/` supporting loaders (`GLTFLoader`), environment utilities (`PMREMGenerator`), and controls.

### 1.2 `js/three-scene.js`: Scene Setup, Camera, Renderer, Animation & Interaction

#### Scene Setup (lines 172-178, 191-198):
- Scene instance: `const scene = new THREE.Scene();`
- Root group: `const modelRoot = new THREE.Group(); scene.add(modelRoot);`
- Floor disk:
  ```javascript
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(1.45, 40),
    new THREE.MeshBasicMaterial({ color: 0x030303, transparent: true, opacity: 0.74 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.scale.set(1, 0.23, 1);
  floor.position.set(0, 0.015, 0.1);
  scene.add(floor);
  ```
  This is a static oval 2D flat disk rendered with unlit `MeshBasicMaterial`, which cannot receive Three.js shadow maps or respond to directional illumination.

#### Camera Positioning & Projection (lines 173, 240-251):
- `const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);`
- Vertical Field of View (FOV) is 36° (portrait focal length ~55mm equivalent on 35mm sensor, minimizing wide-angle perspective distortion).
- Responsive camera positioning in `resize()`:
  - **Desktop** (width ≥ 600px): `camera.position.set(0, 1.45, 4.9); camera.lookAt(0, 1.48, 0);`
  - **Mobile** (width < 600px): `camera.position.set(0, 1.55, 6.4); camera.lookAt(0, 1.48, 0);`
  - Aspect ratio: `camera.aspect = bounds.width / bounds.height; camera.updateProjectionMatrix();`

#### Renderer Configuration (lines 158-170, 235-239, 248-249):
- Instantiation:
  ```javascript
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: window.devicePixelRatio < 1.5,
    powerPreference: "high-performance"
  });
  ```
- Color Management & Tone Mapping:
  ```javascript
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  ```
- Viewport & Pixel Ratio:
  ```javascript
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5));
  renderer.setSize(bounds.width, bounds.height, false);
  ```
- **Crucial Renderer Defect Observed**:
  - `renderer.shadowMap.enabled` is **NEVER set to `true`**!
  - `renderer.shadowMap.type` is **NOT configured** (e.g., `THREE.PCFSoftShadowMap`).
  - While meshes and `keyLight` have `castShadow = true`, the WebGL renderer has shadows disabled globally.
  - `scene.environment` is **null** (no PMREM or environment map is attached).

#### Animation Loop & Frame Throttling (lines 265-296):
- Hybrid on-demand and auto-rotate animation loop:
  ```javascript
  function canAnimate() {
    return inView &&
      document.visibilityState === "visible" &&
      !reduceMotion.matches;
  }
  ```
- In `animate()`:
  ```javascript
  const delta = Math.min(clock.getDelta(), 0.05);
  if (performance.now() > interactionUntil && activePointer === null) {
    modelRoot.rotation.y += delta * 0.12;
  }
  draw();
  frame = window.requestAnimationFrame(animate);
  ```
- Auto-rotates at ~0.12 rad/s (~6.88°/s) when not interacted with.
- Interaction lock: user drag sets `interactionUntil = performance.now() + 2200` (pausing auto-rotation for 2.2 seconds).
- `syncMotion()` halts `requestAnimationFrame` when the stage leaves viewport, tab is hidden, or `prefers-reduced-motion` is active.

#### Interaction Handlers (lines 298-343):
- **Pointer Events on Canvas**:
  - `pointerdown`: calls `canvas.setPointerCapture(event.pointerId)`, stores `lastPointerX`, `lastPointerY`.
  - `pointermove`:
    - `modelRoot.rotation.y += (event.clientX - lastPointerX) * 0.009;` (horizontal turntable rotation)
    - `modelRoot.rotation.x = THREE.MathUtils.clamp(modelRoot.rotation.x + (event.clientY - lastPointerY) * 0.004, -0.12, 0.12);` (vertical tilt clamped to ±0.12 rad / ~±6.8°)
  - `pointerup` / `pointercancel`: releases pointer lock.
  - `wheel`: calls `setZoom(event.deltaY > 0 ? -0.35 : 0.35)`.
- **Zoom Logic**:
  - `camera.position.z = THREE.MathUtils.clamp(camera.position.z - delta, 3.6, 8);`
- **Custom Stage Events**:
  - `stage.addEventListener("yodo:rotate", (event) => ...)`
  - `stage.addEventListener("yodo:zoom", (event) => ...)`
  - `stage.addEventListener("yodo:scroll-progress", (event) => { modelRoot.rotation.z = (event.detail.progress - 0.5) * 0.12; })`
- **Observed Control Disconnect**:
  - In `index.html` (lines 126-133), HTML buttons `#rotate-left`, `#rotate-right`, `[data-zoom="in"]`, and `[data-zoom="out"]` exist.
  - In `js/home-page.js` (lines 28-35), these buttons only manipulate the 2D CSS SVG fallback `#garment-turntable`.
  - They DO NOT dispatch `yodo:rotate` or `yodo:zoom` to `#hero-stage`.
  - When Three.js initializes, `heroStage.classList.add("is-rendered")` is added, which applies `style.css:240` (`.hero-stage.is-rendered .garment-turntable { display: none; }`).
  - As a result, clicking the HTML UI buttons does nothing to the 3D model once WebGL is rendered.

---

### 1.3 Identification of Rudimentary Placeholder Mannequins (Code to Remove)

#### Functions and Geometries in `js/three-scene.js`:
1. **`makeCapsuleBetween(start, end, radius, material)`** (lines 9-21):
   - Generates capsule meshes between coordinate endpoints using `THREE.CapsuleGeometry(radius, Math.max(length - radius * 2, 0.01), 5, 12)` and quaternion alignment.
2. **`makeMannequin({ feminine })`** (lines 23-123):
   - Line 25-41: Four flat materials:
     - `bodyMaterial`: `MeshStandardMaterial` (`roughness: 0.72`, color `0x686868` / `0xe0e0e0`)
     - `trousersMaterial`: `MeshStandardMaterial` (`roughness: 0.82`, color `0x202020` / `0x444444`)
     - `mannequinMaterial`: `MeshStandardMaterial` (`roughness: 0.56`, `metalness: 0.08`, color `0xb7b7b7`)
     - `accentMaterial`: `MeshStandardMaterial` (`roughness: 0.5`, color `0xe52335`)
   - Line 45-52: Torso primitive: `CapsuleGeometry(torsoWidth, 0.66, 6, 18)`
   - Line 54-60: Hips primitive: `CylinderGeometry(0.35, 0.4, 0.38, 20)`
   - Line 62-67: Neck primitive: `CylinderGeometry(0.095, 0.12, 0.2, 16)`
   - Line 69-76: Head primitive: `SphereGeometry(0.235, 24, 18)` scaled `(0.88, 1.12, 0.92)`
   - Line 78-98: Arm capsules (2 per arm), leg capsules (1 per leg), sphere hands (`SphereGeometry(0.11, 12, 10)`).
   - Line 99-105: Shoes: `BoxGeometry(0.27, 0.13, 0.42)`
   - Line 108-120: Shirt chest panel (`BoxGeometry(0.12, 0.52, 0.025)`) and hem accent (`BoxGeometry(0.48, 0.035, 0.025)`).
3. **Slot Definition & Missing Asset Loading** (lines 200-233):
   - Hardcoded slots array:
     ```javascript
     const slots = [
       { id: "homme", path: "./assets/models3d/mannequin-homme.glb", feminine: false, x: -0.72 },
       { id: "femme", path: "./assets/models3d/mannequin-femme.glb", feminine: true, x: 0.72 }
     ];
     ```
   - Files `./assets/models3d/mannequin-homme.glb` and `./assets/models3d/mannequin-femme.glb` do not exist in the repository (directory `assets/models3d` is completely absent).
   - `loadModels()` catches 404 network errors, logs warnings, and leaves the two primitive mannequins permanently visible side-by-side.
4. **Temporary Demo Text in Code and HTML**:
   - `js/three-scene.js:211`:
     `status.textContent = "Mannequins 3D de démonstration. Les modèles définitifs se chargent à l’ouverture du hero.";`
   - `js/three-scene.js:226`:
     `status.textContent = "Mannequins 3D de démonstration. Ajoutez les fichiers GLB pour afficher les modèles définitifs.";`
   - `index.html:116`:
     `<div class="stage-caption"><span>VISUEL DE DÉMONSTRATION</span><span>360°</span></div>`
   - `index.html:135`:
     `<p class="stage-status" id="scene-status" role="status" aria-live="polite">Visuel de démonstration affiché ; la scène 3D se charge à l’approche.</p>`

---

### 1.4 Current Lighting & Shadow Setup in `js/three-scene.js`

| Light / Element | Code Location | Configuration | Flaws / Limitations |
|---|---|---|---|
| **HemisphereLight** | Line 179 | `new THREE.HemisphereLight(0xffffff, 0x292929, 2.1)` | Intensity 2.1 is overpowering. Flattens contrast, washes out textile relief and folds. |
| **DirectionalLight (Key)** | Lines 181-185 | `new THREE.DirectionalLight(0xffffff, 3.4); position(-3.5, 5, 5); castShadow = true; mapSize(512, 512)` | High intensity (3.4). Shadow frustum bounds not configured (defaults to 500 unit box). Shadow map resolution (512x512) is coarse. Crucially, renderer shadow map is disabled. |
| **PointLight (Rim)** | Lines 187-189 | `new THREE.PointLight(0xe52335, 14, 8, 2); position(2.5, 2.4, -1.5)` | Single point light at high intensity (14) placed only on the right. Creates an asymmetrical red hotspot on right mannequin with zero rim illumination on the left. |
| **Fill Light** | None | Absent | No fill light on the right/front. Shadow areas rely solely on the flat hemisphere ambient. |
| **Shadow Maps** | Renderer | `renderer.shadowMap.enabled` = undefined (`false`) | No dynamic shadow maps rendered anywhere in WebGL. |
| **Floor Contact Shadow** | Lines 191-198 | `MeshBasicMaterial({ color: 0x030303, opacity: 0.74 })` | Artificial static black ellipse. Does not react to model silhouette or light directions. |
| **Environment Map (IBL)** | Scene | `scene.environment` = null | Standard/Physical PBR materials lack ambient specular reflection and Fresnel grazing reflections, making fabrics and metals appear plastic and lifeless. |
| **Tone Mapping** | Lines 237-238 | `ACESFilmicToneMapping`, `toneMappingExposure: 1.05` | ACES Filmic is appropriate, but exposure at 1.05 with 3.4 key + 2.1 hemisphere light causes highlight burnout. |

---

## 2. Logic Chain

1. **Observation 1.3** confirms that the hero 3D visual currently consists of two geometric primitive mannequins generated in JavaScript (`makeCapsuleBetween`, `makeMannequin`) with rigid cylinders, capsules, and spheres.
2. **Observation 1.3 (lines 200-233)** proves that the code was originally architected to load GLB files from `./assets/models3d/`, but neither the directory nor the files exist. Therefore, the primitive fallback mannequins are permanently instantiated on stage.
3. **Requirement R1** specifies removing primitive mannequins and demo labels, replacing them with a high-end streetwear 3D visual (hoodie, jacket, or stylized mannequin). To satisfy R1, all code lines 9 to 123 (`makeCapsuleBetween`, `makeMannequin`) and lines 200-233 must be removed or replaced with the dedicated streetwear model pipeline.
4. **Observation 1.4** demonstrates that dynamic shadows are completely non-functional because `renderer.shadowMap.enabled` is missing, shadow map frustum is uncalibrated, and the floor is an unlit `MeshBasicMaterial`.
5. Furthermore, the lighting is unbalanced: an excessive 2.1 HemisphereLight flattens all surface normal variation, the 3.4 KeyLight burns out highlights, a single 14-intensity red PointLight causes an unnatural localized red glare, and there is no FillLight or Environment Map.
6. Streetwear garments (fleece hoodies, technical windbreakers, cargo pants, metallic zippers) depend heavily on:
   - Soft directional light grazing across fabric folds (draping, seams, ribbing).
   - High-contrast edge kickers (rim lights) to carve the garment silhouette from the dark hero background (`#171717` to `#080808`).
   - Micro-surface reflectance (cloth sheen BRDF) enabled by `THREE.MeshPhysicalMaterial` and a neutral studio environment map.
7. Consequently, a dedicated high-end studio lighting rig, proper shadow configuration (`PCFSoftShadowMap`), and PBR material setup must replace lines 179-198 in `js/three-scene.js`.

---

## 3. Recommended Studio Lighting & Material Architecture

To deliver an editorial luxury streetwear aesthetic aligned with YODO's dark palette, the following lighting architecture is recommended for the implementation team:

```
                      [Top Overhead Softbox]
                           (0, 5.0, 0.4)
                                 │
                                 ▼
   [Rim Kicker B - Cool]                   [Rim Kicker A - YODO Red]
      (-2.8, 3.0, -2.6)                       (2.8, 3.2, -2.6)
              ↘                                       ↙
                ┌───────────────────────────────────┐
                │                                   │
                │     YODO STREETWEAR 3D HERO       │
                │     (Hoodie / Stylized Garment)   │
                │                                   │
                └───────────────────────────────────┘
              ↗                                       ↖
   [Key Light Softbox]                     [Fill Light Soft Reflector]
    (-3.0, 4.5, 3.5)                            (3.0, 2.8, 3.0)
     Warm Neutral 5500K                          Cool Slate Neutral
     PCFSoft Shadow Caster                       Shadowless Fill
```

### 3.1 Studio Light Setup Specifications

1. **Key Light (Main Softbox)**:
   - Type: `THREE.DirectionalLight(0xfff8f0, 2.4)`
   - Position: `(-3.0, 4.5, 3.5)`, target at `(0, 1.4, 0)`
   - Shadow Configuration:
     ```javascript
     keyLight.castShadow = true;
     keyLight.shadow.mapSize.set(2048, 2048);
     keyLight.shadow.camera.near = 1.0;
     keyLight.shadow.camera.far = 12.0;
     keyLight.shadow.camera.left = -2.2;
     keyLight.shadow.camera.right = 2.2;
     keyLight.shadow.camera.top = 3.6;
     keyLight.shadow.camera.bottom = -0.2;
     keyLight.shadow.bias = -0.0005;
     keyLight.shadow.normalBias = 0.025;
     ```
   - Purpose: Defines primary volume, casts soft realistic folds across chest, sleeves, and hood.

2. **Fill Light (Secondary Softbox / Reflector)**:
   - Type: `THREE.DirectionalLight(0xedf2ff, 0.95)`
   - Position: `(3.0, 2.8, 3.0)`, target at `(0, 1.4, 0)`
   - No shadow casting (`castShadow = false`).
   - Purpose: Softens shadows on camera-right side, keeping textile weave visible in darker folds (Key:Fill ratio ~ 2.5:1).

3. **Dual Silhouette Kickers (Rim Lights)**:
   - **Kicker A (Signature YODO Accent)**:
     - Type: `THREE.SpotLight(0xe52335, 4.2, 10, Math.PI / 5, 0.6, 1.5)` or `DirectionalLight(0xe52335, 2.2)`
     - Position: `(2.8, 3.2, -2.6)`, targeting garment center `(0, 1.4, 0)`.
     - Purpose: Creates an electric red rim highlighting shoulder, hood perimeter, and sleeve edge, reinforcing YODO's brand color.
   - **Kicker B (Cool Contour Definition)**:
     - Type: `THREE.DirectionalLight(0xd4e4fc, 1.6)`
     - Position: `(-2.8, 3.0, -2.6)`, targeting garment center.
     - Purpose: Separates left silhouette cleanly from dark background with a crisp editorial silver edge.

4. **Overhead / Crest Softbox**:
   - Type: `THREE.DirectionalLight(0xffffff, 0.7)`
   - Position: `(0, 5.0, 0.4)`, pointing straight down.
   - Purpose: Illuminates hood crown, collar ribbing, and top shoulder seam.

5. **Ambient & Environment Map (IBL via PMREM)**:
   - Base ambient: `new THREE.AmbientLight(0xffffff, 0.35)` or `new THREE.HemisphereLight(0xffffff, 0x141414, 0.45)`.
   - Environment reflection: Generate a neutral studio gradient or studio room environment using `PMREMGenerator`:
     ```javascript
     const pmremGenerator = new THREE.PMREMGenerator(renderer);
     pmremGenerator.compileEquirectangularShader();
     // Set neutral studio environment for PBR sheen and metallic reflections
     ```
   - Purpose: Powers the micro-specular response of cloth, metallic aglets/eyelets, and nylon coatings.

6. **Ground Shadow Floor (Contact Shadow)**:
   - Replace `MeshBasicMaterial` disk with:
     ```javascript
     const shadowPlane = new THREE.Mesh(
       new THREE.PlaneGeometry(6, 6),
       new THREE.ShadowMaterial({ opacity: 0.38 })
     );
     shadowPlane.rotation.x = -Math.PI / 2;
     shadowPlane.position.y = 0.005;
     shadowPlane.receiveShadow = true;
     scene.add(shadowPlane);
     ```
   - Purpose: Real-time, physically grounded contact shadow beneath the garment that scales and moves dynamically with user interaction and rotation.

7. **Renderer Settings Update**:
   ```javascript
   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.PCFSoftShadowMap;
   renderer.outputColorSpace = THREE.SRGBColorSpace;
   renderer.toneMapping = THREE.ACESFilmicToneMapping;
   renderer.toneMappingExposure = 1.0;
   ```

### 3.2 Streetwear Material Shader Strategy (`MeshPhysicalMaterial`)

For realistic streetwear rendering (cotton fleece, technical shell, metallic hardware):

```javascript
// Cotton French Terry / Fleece (Hoodie / Sweatshirt body)
const hoodieCottonMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x161616,          // Deep YODO charcoal/black
  roughness: 0.84,
  metalness: 0.02,
  sheen: 0.9,               // Micro-fiber cloth scattering
  sheenRoughness: 0.5,
  sheenColor: new THREE.Color(0x777777),
  clearcoat: 0.0
});

// Technical Streetwear Accents (Nylon overlays / pocket flaps)
const technicalNylonMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x1c1c1e,
  roughness: 0.42,
  metalness: 0.08,
  clearcoat: 0.25,
  clearcoatRoughness: 0.3
});

// Metallic Hardware (Eyelets, drawcord aglets, zipper teeth)
const metalHardwareMaterial = new THREE.MeshStandardMaterial({
  color: 0xd8d8d8,
  roughness: 0.22,
  metalness: 0.95
});
```

---

## 4. Caveats

1. **Asset Source Selection**: The decision of whether the new 3D visual will be a dedicated single centerpiece (e.g., high-fidelity 3D streetwear hoodie/jacket) or loaded from an external GLB is being surveyed concurrently by Explorer 3. Our lighting architecture is designed to support both a high-poly GLTF/GLB asset and a procedural Three.js model with custom PBR materials.
2. **Device Performance**: PCFSoftShadowMap with a 2048x2048 map is optimal for desktop and modern tablets. On low-end mobile devices (where `mobile = bounds.width < 600`), the shadow map size can dynamically scale to 1024x1024 to preserve 60 FPS.
3. **HTML Button Dispatching**: The disconnect between `#rotate-left` / `#rotate-right` / `[data-zoom]` in `index.html` and `yodo:rotate` / `yodo:zoom` in `js/three-scene.js` should be unified during the implementation phase so that both pointer drag and UI buttons operate seamlessly on the 3D scene.

---

## 5. Conclusion

1. **Current State**: `js/three-scene.js` currently renders two rudimentary geometric primitive mannequins built from capsules, spheres, and boxes because `./assets/models3d/*.glb` assets do not exist.
2. **Current Lighting Flaws**: WebGL shadow maps are completely disabled on the renderer (`renderer.shadowMap.enabled` missing), the HemisphereLight at 2.1 washes out depth, the KeyLight at 3.4 creates burnt highlights, the single PointLight at 14 creates an unbalanced red glare, and no environment map or fill light exists.
3. **Actionable Roadmap**:
   - Strip primitive generator functions (`makeCapsuleBetween`, `makeMannequin`) and hardcoded demo slot warnings.
   - Activate `renderer.shadowMap.enabled = true` with `THREE.PCFSoftShadowMap`.
   - Implement the balanced 4-point studio rig (Key softbox, Fill softbox, Dual YODO Red + Cool silhouette kickers, Top softbox) and PMREM environment map.
   - Replace the fake black circle with a `ShadowMaterial` contact plane.
   - Configure `MeshPhysicalMaterial` cloth shaders with `sheen` and micro-roughness to showcase streetwear cotton and technical fabric textures.

---

## 6. Verification Method

To verify these observations independently:

1. **Verify Primitive Mannequin Code**:
   - Inspect `js/three-scene.js` lines 9-123 (`makeCapsuleBetween`, `makeMannequin`).
   - Inspect lines 200-233 to confirm the hardcoded missing GLB slot paths and fallback assignment.
2. **Verify Missing ShadowMap Configuration**:
   - Run grep in workspace:
     ```bash
     grep -rn "shadowMap" js/
     ```
     Result confirms `shadowMap.mapSize` is configured on `keyLight`, but `renderer.shadowMap.enabled` is never invoked in the codebase.
3. **Verify Demo Text Elements**:
   - Run grep in workspace:
     ```bash
     grep -rn "démonstration" index.html js/
     ```
     Confirms lines in `index.html:116`, `index.html:135`, and `js/three-scene.js:211, 226`.
4. **Verify UI Control Disconnect**:
   - Inspect `js/home-page.js:28-35` and compare against `js/three-scene.js:304-313`. Confirm that clicking `#rotate-left` does not trigger `yodo:rotate`.
