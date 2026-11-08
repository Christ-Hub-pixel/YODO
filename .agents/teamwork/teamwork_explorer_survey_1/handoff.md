# Handoff Report: Survey of HTML Hero Section, Bootstrap Pipeline, Dependencies & Requirements R1-R3

**Agent**: Explorer 1 (Survey - HTML & Bootstrap Pipeline)  
**Date**: 2026-11-08T18:24:00Z  
**Target File**: `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_survey_1/handoff.md`  
**Working Directory**: `/home/christ77/Documents/YODO`  

---

## 1. Observation

### 1.1 Hero Section Structure & DOM Architecture (`index.html`)

Direct inspection of `/home/christ77/Documents/YODO/index.html` lines 102–138 reveals the complete structure of the hero section:

```html
102:      <section class="hero" aria-labelledby="hero-title">
103:        <div class="hero-copy">
104:          <p class="season-note"><span></span> Homme · Femme · Streetwear</p>
105:          <h1 id="hero-title">Les marques.<br><span>Votre style.</span></h1>
106:          <p class="hero-intro">Les pièces de marques streetwear et premium que vous aimez, réunies dans une seule boutique.</p>
107:          <a class="button hero-cta" href="pages/boutique.html">Découvrir la boutique <span aria-hidden="true">↘</span></a>
108:          <p class="hero-footnote">Plusieurs marques. Un seul endroit.</p>
109:        </div>
110:
111:        <div class="hero-stage" id="hero-stage">
112:          <canvas class="hero-canvas" id="hero-canvas" aria-hidden="true"></canvas>
113:          <div class="stage-orbit orbit-one"></div>
114:          <div class="stage-orbit orbit-two"></div>
115:          <span class="stage-index">SÉLECTION YODO / 01</span>
116:          <div class="stage-caption"><span>VISUEL DE DÉMONSTRATION</span><span>360°</span></div>
117:          <div class="garment-turntable" id="garment-turntable" role="img" aria-label="Illustration de démonstration d’un hoodie. Faites glisser pour le faire pivoter. Elle remplace la scène 3D si WebGL est indisponible.">
118:            <div class="garment-model" aria-hidden="true">
119:              <div class="garment-depth"></div>
120:              <svg class="hero-garment garment-front" viewBox="0 0 440 500"><use href="#hoodie-art"></use></svg>
121:              <svg class="hero-garment garment-back" viewBox="0 0 440 500"><use href="#hoodie-back"></use></svg>
122:              <span class="garment-side" aria-hidden="true"></span>
123:            </div>
124:          </div>
125:          <div class="stage-controls">
126:            <button type="button" id="rotate-left" aria-label="Faire pivoter les mannequins vers la gauche">←</button>
127:            <span>FAITES GLISSER</span>
128:            <button type="button" id="rotate-right" aria-label="Faire pivoter les mannequins vers la droite">→</button>
129:          </div>
130:          <div class="zoom-controls" aria-label="Zoomer sur les mannequins">
131:            <button type="button" data-zoom="in" aria-label="Zoomer">+</button>
132:            <button type="button" data-zoom="out" aria-label="Dézoomer">−</button>
133:          </div>
134:          <span class="stage-side-note">GLISSER POUR TOURNER</span>
135:          <p class="stage-status" id="scene-status" role="status" aria-live="polite">Visuel de démonstration affiché ; la scène 3D se charge à l’approche.</p>
136:        </div>
137:        <div class="hero-edge-note" aria-hidden="true">YODO / 2026</div>
138:      </section>
```

#### Detailed Breakdown of Elements in `#hero-stage`:
1. **`<canvas class="hero-canvas" id="hero-canvas" aria-hidden="true"></canvas>` (line 112)**:
   - Target mount point for the Three.js WebGL canvas.
   - Initial CSS state (`style.css:229-237`): `position: absolute; inset: 0; width: 100%; height: 100%; display: block; opacity: 0; pointer-events: none; transition: opacity .35s ease;`.
   - Rendered CSS state (`style.css:239`): `.hero-stage.is-rendered .hero-canvas { opacity: 1; pointer-events: auto; touch-action: none; }`.
   - Accessible state: `aria-hidden="true"` (the interactive status and controls handle screen reader accessibility).
2. **Decorative Orbits (`.stage-orbit.orbit-one`, `.orbit-two`, lines 113-114)**:
   - Elliptical CSS borders rotating around the central axis (`orbit-drift` animation).
   - Paused when `prefers-reduced-motion` is active or stage is offscreen.
3. **Turntable Fallback (`#garment-turntable`, lines 117-124)**:
   - 2.5D CSS perspective mock-up of a hoodie using SVG vector symbols `#hoodie-art` and `#hoodie-back`.
   - Scripted in `js/home-page.js` to respond to drag and click gestures.
   - Hidden when WebGL initializes via `.hero-stage.is-rendered .garment-turntable { display: none; }` (`style.css:240`).
4. **Stage Controls (`.stage-controls`, lines 125-129)**:
   - Contains `#rotate-left` and `#rotate-right` buttons plus central indicator `FAITES GLISSER`.
   - Styled at `z-index: 3; bottom: 29px; left: 50%; transform: translateX(-50%);`.
5. **Zoom Controls (`.zoom-controls`, lines 130-133)**:
   - Contains `[data-zoom="in"]` (`+`) and `[data-zoom="out"]` (`−`).
   - Styled at `z-index: 3; left: 18px; bottom: 27px;`.
6. **Live Region Status (`#scene-status`, line 135)**:
   - `<p class="stage-status" id="scene-status" role="status" aria-live="polite">`.
   - Displays real-time loading/operational feedback to screen readers and visitors.

---

### 1.2 Inventory of Demo Text and Mannequin References to Remove

Direct audit identifies 6 distinct locations in `index.html` and 6 locations in JavaScript containing obsolete "démonstration" or "mannequin" text:

| Location | Line(s) | Current Exact Text / Attribute | Required Modification |
|---|---|---|---|
| `index.html` | 116 | `<span>VISUEL DE DÉMONSTRATION</span>` | Replace with branded production caption, e.g., `<span>COLLECTION STREETWEAR</span>` or `<span>STUDIO 3D</span>`. |
| `index.html` | 117 | `aria-label="Illustration de démonstration d’un hoodie. Faites glisser pour le faire pivoter. Elle remplace la scène 3D si WebGL est indisponible."` | Remove "de démonstration": `aria-label="Aperçu 3D interactif d’un hoodie streetwear YODO. Faites glisser pour le faire pivoter. Solution de repli si WebGL est indisponible."` |
| `index.html` | 126 | `aria-label="Faire pivoter les mannequins vers la gauche"` | Replace "les mannequins" with singular garment piece: `aria-label="Faire pivoter la pièce streetwear vers la gauche"` |
| `index.html` | 128 | `aria-label="Faire pivoter les mannequins vers la droite"` | Replace "les mannequins" with singular garment piece: `aria-label="Faire pivoter la pièce streetwear vers la droite"` |
| `index.html` | 130 | `<div class="zoom-controls" aria-label="Zoomer sur les mannequins">` | Replace "les mannequins": `aria-label="Zoomer sur la pièce streetwear"` |
| `index.html` | 135 | `<p class="stage-status" id="scene-status" role="status" aria-live="polite">Visuel de démonstration affiché ; la scène 3D se charge à l’approche.</p>` | Remove "Visuel de démonstration": `Scène 3D streetwear en cours de chargement...` |
| `js/three-scene.js` | 211 | `status.textContent = "Mannequins 3D de démonstration. Les modèles définitifs se chargent à l’ouverture du hero.";` | Remove mannequin reference: `Scène 3D streetwear active.` |
| `js/three-scene.js` | 226 | `status.textContent = "Mannequins 3D de démonstration. Ajoutez les fichiers GLB pour afficher les modèles définitifs.";` | Remove entirely when procedural/embedded 3D asset is integrated. |
| `js/three-scene.js` | 228 | `status.textContent = "Un modèle GLB manque ; un mannequin 3D de démonstration le remplace.";` | Remove entirely (no missing asset fallbacks). |
| `js/three-scene.js` | 352 | `status.textContent = "Mannequins de démonstration affichés : le chargement des modèles a échoué.";` | Replace with clean neutral fallback notice: `Aperçu interactif affiché.` |
| `js/three-scene.js` | 150 | `console.warn("Chargement du modèle ${path} impossible ; mannequin de démonstration utilisé.", error);` | Eliminate warning and missing GLB slot calls. |
| `js/three-scene.js` | 23-123 | `function makeMannequin({ feminine }) { ... }` | Completely delete primitive mannequin constructor. |

---

### 1.3 `js/three-bootstrap.js` Pipeline Analysis

Full inspection of `/home/christ77/Documents/YODO/js/three-bootstrap.js` (lines 1–30):

```javascript
1: const status = document.querySelector("#scene-status");
2: const stage = document.querySelector("#hero-stage");
3: 
4: async function loadScene() {
5:   try {
6:     const { initThreeScene } = await import("./three-scene.js");
7:     await initThreeScene();
8:   } catch (error) {
9:     console.error("La scène Three.js n’a pas pu être chargée.", error);
10:     status.textContent = "Aperçu illustré affiché : le moteur 3D n’est pas disponible.";
11:   }
12: }
13: 
14: function observeStage() {
15:   if (!stage || !status) return;
16:   const bounds = stage.getBoundingClientRect();
17:   const nearViewport = bounds.top < window.innerHeight + 240 && bounds.bottom > -240;
18:   if (nearViewport || !("IntersectionObserver" in window)) {
19:     void loadScene();
20:   } else {
21:     const observer = new IntersectionObserver((entries) => {
22:       if (!entries.some((entry) => entry.isIntersecting)) return;
23:       observer.disconnect();
24:       void loadScene();
25:     }, { rootMargin: "240px 0px" });
26:     observer.observe(stage);
27:   }
28: }
29: 
30: window.setTimeout(observeStage, 100);
```

#### Bootstrap Characteristics:
1. **Separation of Concerns**:
   - `three-bootstrap.js` contains **0 bytes of Three.js code**. It acts as a lightweight gatekeeper (~640 bytes).
   - Three.js (~600KB uncompressed) is never evaluated unless the hero container enters within 240px of the viewport.
2. **Container & Canvas Mounting**:
   - `three-bootstrap.js` does NOT construct DOM elements. The `<canvas id="hero-canvas">` is pre-rendered in HTML.
   - When `loadScene()` executes `await initThreeScene()`, `three-scene.js` attaches directly to the static `#hero-canvas` element.
   - Once initialized, `stage.classList.add("is-rendered")` triggers the CSS transition (`opacity: 0 -> 1`) and hides the turntable fallback.
3. **Event Listener Hierarchy & UI Disconnect**:
   - `three-bootstrap.js` manages only the lazy-loading `IntersectionObserver`.
   - `three-scene.js` registers event listeners for:
     * Custom events on `stage`: `"yodo:rotate"`, `"yodo:zoom"`, `"yodo:scroll-progress"`.
     * Pointer interaction on `canvas`: `"pointerdown"`, `"pointermove"`, `"pointerup"`, `"pointercancel"`, `"wheel"`.
     * Lifecycle & Performance: `ResizeObserver(stage)`, `IntersectionObserver(stage, 0.05)`, `"visibilitychange"`, and `"change"` on `prefers-reduced-motion`.
   - **Observed Control Disconnect Bug**:
     In `js/home-page.js` lines 28–35:
     ```javascript
     document.querySelector("#rotate-left")?.addEventListener("click", () => setAngle(angle - 35));
     document.querySelector("#rotate-right")?.addEventListener("click", () => setAngle(angle + 35));
     document.querySelectorAll("[data-zoom]").forEach((button) => {
       button.addEventListener("click", () => {
         zoom = Math.min(1.3, Math.max(0.75, zoom + (button.dataset.zoom === "in" ? 0.1 : -0.1)));
         renderModel();
       });
     });
     ```
     These UI buttons only mutate the 2D SVG fallback. They **never dispatch `"yodo:rotate"` or `"yodo:zoom"` to `#hero-stage`**. Once WebGL is loaded (`is-rendered`), clicking `←`, `→`, `+`, or `−` has no effect on the 3D scene!
4. **Canvas Sizing and Responsive Geometry**:
   - Handled via `ResizeObserver(resize)` in `three-scene.js:240-251`:
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
   - **Breakpoint Asymmetry**: `style.css` changes grid layout at `1000px` and switches to mobile sizing at `760px` (`height: 112vw; min-height: 410px`). However, `three-scene.js` uses an arbitrary `bounds.width < 600` check, creating an unoptimized camera zoom gap between 600px and 760px.

---

### 1.4 Dependencies & Scripts Audit (`index.html`)

Direct inspection of `index.html` lines 10–19 and 254–258:

#### Import Map:
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

#### Loaded Modules and Scripts:
```html
254: <script type="module" src="js/home-page.js"></script>
255: <script type="module" src="js/site-header.js"></script>
256: <script type="module" src="js/three-bootstrap.js"></script>
257: <script type="module" src="js/animations.js"></script>
258: <script src="js/page-transitions.js"></script>
```

#### Key Findings on Dependencies:
1. **Three.js Core**: Modern Release 0.170.0 (late 2024 ESM build). Native modern WebGL2 features, color space management (`THREE.SRGBColorSpace`), and physical materials (`MeshPhysicalMaterial`) are fully supported.
2. **Three.js Add-ons**: The mapping `"three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"` allows dynamic imports of official Three.js add-ons, including:
   - `three/addons/loaders/GLTFLoader.js` (currently imported in `three-scene.js:2`).
   - `three/addons/environments/RoomEnvironment.js` (standard studio HDR environment generator without external asset fetch).
   - `three/addons/controls/OrbitControls.js`.
   - `three/addons/loaders/DRACOLoader.js`.
3. **GSAP 3.12.5**: Loaded and used in `js/animations.js`. Lines 73–83 configure ScrollTrigger on `.hero` to dispatch `yodo:scroll-progress`, providing reactive scroll tilt.
4. **Build Tooling / Bundler**: None. Pure vanilla modern ES modules. No `package.json`, `npm`, or bundler build step required.

---

## 2. Logic Chain

1. **Premise 1 (R1 Mandate)**: Requirement R1 explicitly commands removing the basic primitive mannequins (spheres, cylinders, capsules) and all demonstration text from `index.html` and `js/three-scene.js`.
2. **Observation 1.2** catalogs 6 occurrences of "démonstration" and "mannequin" text in `index.html` (lines 116, 117, 126, 128, 130, 135) and 6 occurrences in `js/three-scene.js` (lines 23, 150, 201-202, 211, 226, 228, 352).
3. **Inference 1**: Modifying `index.html` to update the stage caption, button ARIA labels, and live region status is strictly necessary to satisfy R1 acceptance criteria ("Les mannequins en primitives basiques et la mention temporaire de démonstration sont totalement retirés du hero").
4. **Premise 2 (Zero 404 & No Missing Assets)**: Acceptance Criteria states: "Aucun asset 3D ou texture manquant (aucune erreur 404)".
5. **Observation 1.3 & Filesystem Check**: The directory `assets/models3d/` does not exist on disk. `three-scene.js` lines 201-202 attempt to fetch `./assets/models3d/mannequin-homme.glb` and `./assets/models3d/mannequin-femme.glb`, resulting in 404 HTTP errors. In a sandboxed runtime with no outbound internet access, downloading external assets is blocked.
6. **Inference 2**: The 3D streetwear centerpiece (hoodie or jacket) must be built either through sophisticated procedural Three.js modeling with PBR materials and procedural canvas textures, or using locally verified self-contained assets. Procedural PBR modeling guarantees 100% immunity to 404 errors, zero network latency, and pristine visual control.
7. **Premise 3 (R2 Studio Lighting & Pipeline Integration)**: Requirement R2 demands studio lighting (shadows, reflections, material highlights) and seamless integration into `js/three-scene.js` and `js/three-bootstrap.js`.
8. **Observation 1.3 & Explorer 2 Findings**: Current `three-scene.js` has `renderer.shadowMap.enabled` omitted (false), floor as unlit `MeshBasicMaterial`, and an uncalibrated lighting setup (overexposed KeyLight, flat HemisphereLight, isolated red point light). Furthermore, the stage control buttons (`#rotate-left`, `#rotate-right`, `[data-zoom]`) in `home-page.js` do not dispatch events to `#hero-stage`.
9. **Inference 3**: To fulfill R2, the implementation must:
   - Keep the clean lazy-loading architecture in `three-bootstrap.js`.
   - Update `home-page.js` to dispatch `"yodo:rotate"` and `"yodo:zoom"` to `#hero-stage` so UI buttons operate the 3D scene.
   - Enable `renderer.shadowMap.enabled = true` with `PCFSoftShadowMap` in `three-scene.js`.
   - Implement three-point studio lighting (Warm Key, Cool Fill Reflector, brand Red Rim Kicker, Top Softbox) and a studio environment map (via `RoomEnvironment`).
10. **Premise 4 (R3 Responsive & Performance)**: Requirement R3 mandates fluid 60 FPS performance without visual distortion across mobile, tablet, and desktop.
11. **Observation 1.3**: Camera framing in `three-scene.js` currently uses an abrupt binary switch (`bounds.width < 600`), conflicting with CSS responsive breakpoints at 760px and 1000px.
12. **Inference 4**: Dynamic camera distance adjustment based on stage aspect ratio and bounding box ensures that the streetwear garment remains perfectly framed on all screen sizes (320px mobile to 2560px ultra-wide) without overflowing or distorting.

---

## 3. Caveats

1. **CSS Turntable Fallback**: The 2D CSS SVG fallback (`#garment-turntable`) is currently preserved for devices without WebGL. Its ARIA label in `index.html:117` mentions "démonstration" and must be updated to maintain accessibility compliance without breaking the CSS fallback mechanism.
2. **Web Sandbox Network Policy**: Since outbound internet fetches are restricted in sandboxed environments, any approach relying on external CDN downloads for GLB models will trigger network failures. The procedural PBR streetwear modeling strategy is the most robust and fault-tolerant architecture for this project.
3. **No Caveats on DOM Integrity**: All element IDs (`#hero-stage`, `#hero-canvas`, `#scene-status`, `#rotate-left`, `#rotate-right`) and class names are verified and must remain stable to avoid breaking GSAP triggers and DOM queries across scripts.

---

## 4. Conclusion

The codebase survey provides a clear, actionable roadmap for upgrading the YODO 3D hero:
1. **HTML Updates (`index.html`)**:
   - Cleanse all placeholder and demonstration wording in `#hero-stage`:
     * Line 116: Change `VISUEL DE DÉMONSTRATION` to `COLLECTION STREETWEAR`.
     * Line 117: Update `#garment-turntable` `aria-label` to remove "démonstration".
     * Lines 126 & 128: Update `#rotate-left` and `#rotate-right` `aria-label` from "les mannequins" to "la pièce streetwear".
     * Line 130: Update `.zoom-controls` `aria-label` from "les mannequins" to "la pièce streetwear".
     * Line 135: Update `#scene-status` initial text to `Scène 3D streetwear active.`
2. **Bootstrap Architecture (`js/three-bootstrap.js`)**:
   - Retain the existing lazy-loading `IntersectionObserver` logic (240px rootMargin) and dynamic `import("./three-scene.js")`. It is lightweight, performant, and correctly structured.
3. **Event Dispatch Wiring (`js/home-page.js`)**:
   - Add dispatch calls for `yodo:rotate` and `yodo:zoom` on `#hero-stage` in `#rotate-left`, `#rotate-right`, and `[data-zoom]` event handlers, harmonizing 2D fallback and 3D interactions.
4. **Three.js Pipeline (`js/three-scene.js`)**:
   - Completely delete `makeMannequin()`, `makeCapsuleBetween()`, and the 404-inducing `slots` loading `./assets/models3d/mannequin-*.glb`.
   - Integrate the high-end streetwear 3D model (hoodie/jacket) with PBR materials (`MeshPhysicalMaterial`), soft studio shadows, brand rim lighting, and smooth responsive camera framing.

---

## 5. Verification Method

To independently verify the survey findings and ensure regression-free implementation:

1. **HTML Demo Text Verification**:
   Run the following Python script from the project root to ensure zero occurrences of "démonstration" or "mannequins" remain in `index.html`:
   ```bash
   python3 -c "
   with open('index.html', 'r', encoding='utf-8') as f:
       content = f.read()
   import re
   matches = re.findall(r'(démonstration|mannequin)', content, re.IGNORECASE)
   print('Hero occurrences found:', len(matches))
   assert len(matches) == 0, f'Found {len(matches)} residual demo terms!'
   "
   ```
2. **404 Network & Console Error Verification**:
   Serve the project locally and inspect browser network traffic:
   ```bash
   python3 -m http.server 8000
   ```
   Open `http://localhost:8000/index.html` in Chrome/Firefox:
   - Check Console: Ensure zero 404 errors, zero WebGL warnings.
   - Check Network tab: Verify that no requests to `./assets/models3d/mannequin-homme.glb` or `mannequin-femme.glb` are made.
3. **DOM & Canvas Mounting Verification**:
   Inspect `#hero-stage`:
   - Verify `#hero-canvas` receives class `.is-rendered` on `#hero-stage`.
   - Verify canvas opacity is 1 and `#garment-turntable` is `display: none`.
   - Test `#rotate-left`, `#rotate-right`, `+`, `−` buttons and mouse drag to confirm smooth model rotation and zoom.
4. **Responsive Layout Check**:
   Test viewport widths: 320px, 375px, 600px, 768px, 1024px, 1440px:
   - Verify camera aspect ratio updates without horizontal overflow or model clipping.
