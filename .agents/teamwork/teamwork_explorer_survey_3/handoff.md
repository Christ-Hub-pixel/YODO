# Handoff Report: Survey of Streetwear Visual Assets, Feasibility, and Responsive Integration

**Agent**: Explorer 3 (Survey - Streetwear Visual Assets & Responsive Integration)  
**Date**: 2026-11-08T18:24:00Z  
**State Folder**: `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_survey_3`  
**Target File**: `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_survey_3/handoff.md`  

---

## 1. Observation

### 1.1 Repository Structure and Asset Inventory
A full scan of the project root directory and subdirectories was conducted:
- `find . -not -path '*/.*'`:
  ```
  .
  ./index.html
  ./js/site-header.js
  ./js/page-transitions.js
  ./js/products.js
  ./js/favorites.js
  ./js/cart-store.js
  ./js/catalog-page.js
  ./js/three-scene.js
  ./js/three-bootstrap.js
  ./js/animations.js
  ./js/home-page.js
  ./js/cart-page.js
  ./js/product-page.js
  ./README.md
  ./style.css
  ./logo.jpeg
  ./assets/images/cargo-pants.svg
  ./assets/images/tshirt.svg
  ./assets/images/hoodie.svg
  ./assets/images/overshirt.svg
  ./assets/images/cap.svg
  ./assets/images/products.svg
  ./assets/images/urban-jacket.svg
  ./pages/boutique.html
  ./pages/panier.html
  ./pages/femme.html
  ./pages/homme.html
  ./pages/produit.html
  ./pages/streetwear.html
  ```

#### Detailed Findings on Available Assets:
1. **Existing Graphics (`assets/images/`)**:
   - Contains only 2D vector illustrations (SVGs) for product representations: `hoodie.svg`, `urban-jacket.svg`, `overshirt.svg`, `cargo-pants.svg`, `tshirt.svg`, `cap.svg`, and `products.svg`.
   - Root raster image: `logo.jpeg` (YODO branding logo).
2. **Missing 3D and Texture Directories**:
   - `assets/models3d/` does NOT exist.
   - `assets/textures/` does NOT exist.
   - No `.glb`, `.gltf`, `.obj`, `.bin`, `.png`, or `.jpg` 3D model or texture files exist anywhere in the repository.
3. **Network & Sandbox Constraints**:
   - The development environment has no outbound internet connectivity (`socket.gaierror: [Errno -3] Temporary failure in name resolution` during test requests).
   - Python 3.14 does not have 3D mesh processing packages (`trimesh` or `pygltflib`) installed.
   - External CDN runtime dependencies (`three@0.170.0`, `gsap@3.12.5`) are loaded in the browser via native ESM `<script type="importmap">` in `index.html`.

---

### 1.2 `index.html` Hero Section & Demonstration Mentions
Inspecting `index.html` lines 111-137 revealed hardcoded demonstration text and primitive mannequin labels:

```html
111:         <div class="hero-stage" id="hero-stage">
112:           <canvas class="hero-canvas" id="hero-canvas" aria-hidden="true"></canvas>
113:           <div class="stage-orbit orbit-one"></div>
114:           <div class="stage-orbit orbit-two"></div>
115:           <span class="stage-index">SÉLECTION YODO / 01</span>
116:           <div class="stage-caption"><span>VISUEL DE DÉMONSTRATION</span><span>360°</span></div>
117:           <div class="garment-turntable" id="garment-turntable" role="img" aria-label="Illustration de démonstration d’un hoodie. Faites glisser pour le faire pivoter. Elle remplace la scène 3D si WebGL est indisponible.">
...
125:           <div class="stage-controls">
126:             <button type="button" id="rotate-left" aria-label="Faire pivoter les mannequins vers la gauche">←</button>
127:             <span>FAITES GLISSER</span>
128:             <button type="button" id="rotate-right" aria-label="Faire pivoter les mannequins vers la droite">→</button>
129:           </div>
130:           <div class="zoom-controls" aria-label="Zoomer sur les mannequins">
131:             <button type="button" data-zoom="in" aria-label="Zoomer">+</button>
132:             <button type="button" data-zoom="out" aria-label="Dézoomer">−</button>
133:           </div>
134:           <span class="stage-side-note">GLISSER POUR TOURNER</span>
135:           <p class="stage-status" id="scene-status" role="status" aria-live="polite">Visuel de démonstration affiché ; la scène 3D se charge à l’approche.</p>
136:         </div>
```
- Line 116: `VISUEL DE DÉMONSTRATION` in `.stage-caption`.
- Line 117: `aria-label="Illustration de démonstration d’un hoodie..."`.
- Lines 126, 128, 130: `aria-label` refers specifically to "les mannequins".
- Line 135: Text status announces "Visuel de démonstration affiché ; la scène 3D se charge à l’approche."

---

### 1.3 `js/three-scene.js`: Model Loading, 404 Errors, and Primitives
Direct inspection of `js/three-scene.js` lines 200-233 shows how 3D assets are currently handled:

```javascript
200:   const slots = [
201:     { id: "homme", path: "./assets/models3d/mannequin-homme.glb", feminine: false, x: -0.72 },
202:     { id: "femme", path: "./assets/models3d/mannequin-femme.glb", feminine: true, x: 0.72 }
203:   ];
204:   slots.forEach((slot) => {
205:     const fallback = makeMannequin({ feminine: slot.feminine });
206:     fallback.name = `${slot.id}-fallback`;
207:     fallback.position.x = slot.x;
208:     fallback.rotation.y = slot.feminine ? -0.12 : 0.12;
209:     modelRoot.add(fallback);
210:   });
211:   status.textContent = "Mannequins 3D de démonstration. Les modèles définitifs se chargent à l’ouverture du hero.";
212: 
213:   async function loadModels() {
214:     const loaded = await Promise.all(slots.map(async (slot) => {
215:       const model = await loadModel(slot.path, loader);
...
226:       status.textContent = "Mannequins 3D de démonstration. Ajoutez les fichiers GLB pour afficher les modèles définitifs.";
```
- In lines 201-202, `three-scene.js` executes `loader.loadAsync("./assets/models3d/mannequin-homme.glb")` and `loader.loadAsync("./assets/models3d/mannequin-femme.glb")`.
- Because `./assets/models3d/` does not exist, the browser generates two HTTP 404 errors in the console:
  `GET http://localhost:5500/assets/models3d/mannequin-homme.glb 404 (Not Found)`
  `GET http://localhost:5500/assets/models3d/mannequin-femme.glb 404 (Not Found)`
- `loadModel()` catches the errors at lines 149-152:
  `console.warn("Chargement du modèle ./assets/models3d/mannequin-homme.glb impossible ; mannequin de démonstration utilisé.", error);`
- As a fallback, `makeMannequin()` (lines 23-123) creates two geometric primitive mannequins made of capsules, cylinders, spheres, and boxes.
- Status text at line 226 becomes:
  `Mannequins 3D de démonstration. Ajoutez les fichiers GLB pour afficher les modèles définitifs.`

---

### 1.4 Responsive Layout and Canvas Sizing Behavior
Inspecting CSS rules in `style.css` alongside JS logic in `js/three-scene.js`:

#### CSS Media Query Rules (`style.css`):
- **Desktop (≥ 1500px)**:
  - Line 533-534: `.hero { min-height: 710px; } .hero-stage { height: 650px; }`
- **Standard Desktop (> 1000px)**:
  - Line 139-151: `.hero { min-height: min(760px, calc(100svh - 82px)); display: grid; grid-template-columns: .9fr 1.1fr; align-items: center; }`
  - Line 193-195: `.hero-stage { min-height: 555px; height: min(620px, calc(100svh - 160px)); }`
- **Tablet (701px - 1000px)**:
  - Line 540-543: `.hero { grid-template-columns: .95fr 1.05fr; min-height: 570px; } .hero-stage { min-height: 500px; height: 540px; }`
- **Mobile (≤ 700px)**:
  - Line 571: `.hero { width: 100%; min-height: 0; padding: 0; grid-template-columns: 1fr; }` (single stacked column).
  - Line 577: `.hero-stage { min-height: 410px; height: 112vw; max-height: 530px; margin: 0 12px 12px; }`
- **Canvas Sizing**:
  - Line 229-239: `.hero-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; opacity: 0; pointer-events: none; }`
  - `.hero-stage.is-rendered .hero-canvas { opacity: 1; pointer-events: auto; touch-action: none; }`
  - `.hero-stage.is-rendered .garment-turntable { display: none; }`

#### JS Resize and Camera Handling (`js/three-scene.js:240-251`):
```javascript
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
```

#### Identified Responsive & Performance Discrepancies:
1. **Breakpoint Mismatch (600px vs 700px)**:
   - CSS triggers mobile single-column layout at `@media (max-width: 700px)`.
   - `three-scene.js` defines `const mobile = bounds.width < 600`.
   - Between 600px and 700px screen width, the hero copy is stacked above the stage, but `bounds.width` is ~650px (> 600), so `mobile` is `false`. The camera remains at `z = 4.9` instead of `6.4`, causing the 3D model to be improperly framed and cropped on smaller tablets/large phones.
2. **Hardcoded Two-Mannequin Camera Framing**:
   - `camera.position.z` (4.9 desktop / 6.4 mobile) was calibrated for two wide-spaced figures at `x = ±0.72` (spanning 1.44m across).
   - For a single iconic centerpiece (streetwear hoodie on display), static z-values leave excess empty space on wide screens or lack responsive adaptation when aspect ratio changes.
3. **DPR Clamping vs Antialiasing**:
   - WebGLRenderer constructor (line 163): `antialias: window.devicePixelRatio < 1.5`.
   - On Retina screens (`dpr = 2` or `3`), `antialias` is `false`, but line 248 clamps `pixelRatio` to `1.5` (desktop) or `1.25` (mobile). Rendering at `1.25` or `1.5` without hardware MSAA produces noticeable staircasing/aliasing on fine edges.
4. **Renderer Shadow State**:
   - `renderer.shadowMap.enabled` is never configured (defaults to `false`). Dynamic shadows are completely inactive.
5. **Control Disconnect**:
   - In `js/home-page.js` lines 28-35:
     ```javascript
     document.querySelector("#rotate-left")?.addEventListener("click", () => setAngle(angle - 35));
     document.querySelector("#rotate-right")?.addEventListener("click", () => setAngle(angle + 35));
     document.querySelectorAll("[data-zoom]").forEach((button) => ...);
     ```
   - These event handlers manipulate only `model.style.transform` on the SVG fallback `#garment-turntable`.
   - When Three.js loads, `stage.classList.add("is-rendered")` is added, which hides `#garment-turntable` via CSS (`display: none`).
   - Consequently, clicking `#rotate-left`, `#rotate-right`, or the zoom buttons does nothing once 3D is active.

---

## 2. Logic Chain

1. **Missing 3D Assets & 404 Prevention (Observations 1.1 & 1.3)**:
   - The repository contains no GLB files and no `assets/models3d/` directory.
   - The current code unconditionally attempts to fetch `./assets/models3d/mannequin-homme.glb` and `./assets/models3d/mannequin-femme.glb`.
   - Acceptance Criteria state: *"Aucun asset 3D ou texture manquant (aucune erreur 404)"* and *"La scène 3D se charge et s'anime sans erreur ni warning critique dans la console du navigateur."*
   - Therefore, any solution that attempts to load non-existent GLB files or relies on external network downloads violates the acceptance criteria.
2. **Procedural Three.js Modeling vs GLB Asset Evaluation**:
   - *Option A (External GLB)*: Downloading external models fails due to lack of outbound network connectivity in the sandbox. Placing an ad-hoc GLB into the repository could trigger CORS errors when opened locally via `file://`.
   - *Option B (Procedural Three.js Modeling)*: Procedural modeling directly within `js/three-scene.js` using Three.js built-in geometries (`CylinderGeometry`, `TorusGeometry`, `ExtrudeGeometry`, `TubeGeometry`, `LatheGeometry`, `CapsuleGeometry`) and custom PBR materials:
     - 100% self-contained in repository JavaScript.
     - 0 HTTP requests, eliminating any 404 risk.
     - Instant synchronous initialization without fetch delays or loading spinners.
     - Complete control over garment geometry, folds, drawstrings, kangaroo pocket, ribbed cuffs, and branding.
   - Therefore, a sophisticated procedural Three.js streetwear model is the most reliable, robust, and high-fidelity approach.
3. **Subject Matter: Iconic Streetwear Centerpiece vs Two Mannequins**:
   - The catalog (`js/products.js:2-19`) establishes product `hoodie-01` ("Hoodie oversize", Molleton épais · Gris graphite / Noir, 48 500 F CFA) as YODO's quintessential flagship streetwear product.
   - In `index.html`, the fallback already represents an iconic hoodie (`hoodie-art`).
   - Presenting a single iconic streetwear piece (e.g., an Oversize Streetwear Hoodie on a minimalist exhibition pedestal / studio bust):
     - Focuses visual hierarchy directly on streetwear fashion rather than generic mannequins.
     - Fits harmoniously within the circular orbit animations (`.stage-orbit`).
     - Scales seamlessly from desktop to mobile screens without horizontal crowding.
   - Requirement R1 explicitly authorizes: *"mannequin stylisé ou vêtement streetwear emblématique tel qu'un hoodie ou une veste"*.
4. **Lighting and Material Pipeline (Observation 1.4 & Peer Survey)**:
   - To achieve a luxury streetwear editorial aesthetic:
     - Enable `renderer.shadowMap.enabled = true` with `THREE.PCFSoftShadowMap`.
     - Use `THREE.MeshPhysicalMaterial` with `sheen: 0.9` and `sheenColor` to render realistic fleece micro-fiber grazing reflections.
     - Generate procedural canvas bump/normal maps (French terry / molleton fleece weave, ribbed knit hem/cuffs) and high-res typographic vector graphics ("YODO ARCHIVE / 2026").
     - Implement studio lighting: Key light (neutral white, soft PCF shadows), Fill light (cool slate), and YODO Crimson Red rim kicker (`#e52335`) from the rear-right to highlight the shoulder and hood silhouette.
5. **Responsive and Control Cohesion (Observation 1.4)**:
   - Align the mobile JS breakpoint to `window.innerWidth <= 700` (or `bounds.width < 700`) to match CSS.
   - Dynamically compute camera distance based on viewport aspect ratio:
     `const baseZ = 4.6; const distance = aspect < 1 ? baseZ / Math.min(aspect * 0.92, 0.7) : baseZ;`
   - Wire UI buttons (`#rotate-left`, `#rotate-right`, `[data-zoom]`) to dispatch `yodo:rotate` and `yodo:zoom` events or bind them directly in `three-scene.js`.

---

## 3. Caveats

1. **Fallback Turntable Preservation**:
   - The existing SVG `#garment-turntable` in `index.html` serves as a graceful fallback when WebGL is unavailable. It must remain intact in HTML/CSS, but its aria-labels and demo text must be cleaned up to align with the production aesthetic.
2. **GSAP ScrollTrigger Coupling**:
   - `js/animations.js` lines 79-81 dispatches `yodo:scroll-progress` with `{ progress }`. The new 3D model must continue to listen to `yodo:scroll-progress` and apply subtle tilt/yaw to preserve scroll responsiveness.
3. **Mobile GPU Fill-Rate**:
   - While `MeshPhysicalMaterial` provides sheen and clearcoat, complex custom GLSL shaders or multiple render passes are unnecessary and could harm mobile 60 FPS performance. Using standard `MeshPhysicalMaterial` with a single 1024x1024 shadow map ensures 60 FPS on mobile and low-power devices.

---

## 4. Conclusion & Concrete Recommendations

### 4.1 Asset and Architecture Recommendations
1. **Procedural 3D Streetwear Centerpiece in `js/three-scene.js`**:
   - **Model Structure**:
     - Oversize Streetwear Hoodie in heavyweight graphite fleece (`#222224`).
     - Volumetric draping hood with interior cavity.
     - Boxy dropped-shoulder torso with natural fabric folds.
     - Curved articulated sleeves with ribbed knit cuffs.
     - Protruding front kangaroo pocket with angled welts.
     - Realistic braided drawstrings with metallic aglets and eyelets (`metalness: 0.9`, `roughness: 0.15`).
     - Minimalist studio display pedestal (matte dark obsidian cylinder with illuminated red accent ring).
     - Ground contact shadow plane with soft radial opacity.
   - **Procedural Canvas Textures (0 HTTP requests, zero 404s)**:
     - 512x512 procedural canvas generating fabric micro-weave bump map.
     - 256x256 procedural canvas generating 1x1 rib knit bump map for cuffs and waist hem.
     - 1024x1024 procedural canvas generating crisp typographic YODO graphics:
       - Front chest: Minimalist emblem / logo.
       - Back: Bold streetwear typographical block ("YODO / STUDIO ARCHIVE / 2026").
   - **PBR Material**:
     - `THREE.MeshPhysicalMaterial` with `roughness: 0.88`, `metalness: 0.0`, `sheen: 0.95`, `sheenColor: 0x707075`, and `sheenRoughness: 0.45`.

### 4.2 Studio Lighting Rig
- `renderer.shadowMap.enabled = true;`
- `renderer.shadowMap.type = THREE.PCFSoftShadowMap;`
- Key Light: `DirectionalLight(0xfff8f0, 2.4)` at `(-3.0, 4.5, 3.5)` casting shadows (`shadow.mapSize(1024, 1024)`).
- Fill Light: `DirectionalLight(0xedf2ff, 0.9)` at `(3.0, 2.8, 3.0)` without shadow.
- Accent Rim Light: `PointLight(0xe52335, 8.0, 7.0, 1.8)` at `(2.5, 2.8, -2.0)` grazing the right shoulder/hood silhouette.
- Cool Rim Kicker: `DirectionalLight(0x8fa8cf, 1.2)` at `(-2.5, 2.5, -2.5)` separating the left silhouette from the dark background.
- Subtle Hemisphere: `HemisphereLight(0xffffff, 0x141416, 0.9)` to prevent crushed blacks.

### 4.3 Responsive & Performance Configuration
- Set `const mobile = window.innerWidth <= 700 || bounds.width < 700;` to align with CSS.
- Calculate camera distance dynamically:
  ```javascript
  const aspect = bounds.width / bounds.height;
  const baseDistance = 4.6;
  camera.aspect = aspect;
  camera.position.set(0, mobile ? 1.48 : 1.42, aspect < 1 ? baseDistance / Math.min(aspect * 0.95, 0.75) : baseDistance);
  camera.lookAt(0, 1.35, 0);
  camera.updateProjectionMatrix();
  ```
- Pixel ratio: `renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75));`
- Keep `antialias: true` on WebGLRenderer.
- Connect `#rotate-left`, `#rotate-right`, and `[data-zoom]` in `home-page.js` to dispatch `yodo:rotate` and `yodo:zoom` to `#hero-stage`.

### 4.4 DOM & Accessibility Clean-up (`index.html`)
- Line 116: Change `<div class="stage-caption"><span>VISUEL DE DÉMONSTRATION</span><span>360°</span></div>` to:
  `<div class="stage-caption"><span>COLLECTION STREETWEAR</span><span>360° INTERACTIF</span></div>`
- Line 126: Change `aria-label="Faire pivoter les mannequins vers la gauche"` to:
  `aria-label="Faire pivoter la pièce streetwear vers la gauche"`
- Line 128: Change `aria-label="Faire pivoter les mannequins vers la droite"` to:
  `aria-label="Faire pivoter la pièce streetwear vers la droite"`
- Line 130: Change `aria-label="Zoomer sur les mannequins"` to:
  `aria-label="Zoomer sur la pièce streetwear"`
- Line 135: Change `<p class="stage-status" id="scene-status" ...>` text to:
  `Pièce streetwear 3D interactive.`
- Line 117: Change `#garment-turntable` `aria-label` to:
  `Illustration d’un hoodie streetwear. Faites glisser pour le faire pivoter. Elle remplace la scène 3D si WebGL est indisponible.`

---

## 5. Verification Method

### 5.1 Verification Checklist
1. **Asset Integrity and Console Error Check**:
   - Open browser developer tools (Network and Console tabs) on `index.html`.
   - Verify that NO 404 network errors appear (specifically no missing `mannequin-homme.glb` or `mannequin-femme.glb`).
   - Verify that no warnings or errors appear regarding missing models.
2. **Visual & Lighting Quality Verification**:
   - Verify that the primitive capsule/cylinder/sphere mannequins are completely gone.
   - Verify that the oversize streetwear hoodie is rendered with visible fabric micro-texture, ribbed cuffs, drawstrings with metal aglets, and front kangaroo pocket.
   - Verify that dynamic soft shadows are cast onto the pedestal/ground plane.
   - Verify that YODO Crimson Red rim lighting catches the edge of the hoodie silhouette.
3. **Responsive Breakpoint Verification**:
   - Test viewport widths in responsive emulation:
     - `320px` (small mobile): Model fully visible, centered, controls operable.
     - `375px` / `414px` (standard mobile): Model centered, no horizontal scrolling.
     - `700px` (mobile/tablet boundary): Transition matches CSS layout cleanly with no sudden clipping or camera jumps.
     - `768px` / `820px` (tablet): Two-column layout with well-proportioned 3D framing.
     - `1024px` / `1440px` (desktop): Majestic hero presentation with sharp PBR rendering.
4. **Interaction Verification**:
   - Drag mouse/touch on canvas: Turntable rotation responds smoothly with inertia.
   - Click `←` and `→` buttons: 3D model rotates left and right.
   - Click `+` and `−` buttons: 3D camera zooms smoothly.
   - Scroll page: Model gently tilts according to `yodo:scroll-progress`.
   - Check `prefers-reduced-motion`: Animation loop pauses auto-rotation while manual drag remains functional.
