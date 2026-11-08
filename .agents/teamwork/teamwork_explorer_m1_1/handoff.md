# Handoff Report: Milestone 1 — HTML & UI Controls Strategy

**Agent**: Explorer 1  
**Milestone**: Milestone 1 (Hero 3D Streetwear Visual, Studio Lighting & UI Integration)  
**Scope**: `index.html` demo cleansing & `js/home-page.js` custom event dispatching  
**State Folder**: `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_1`

---

## 1. Observation

### 1.1 `index.html` Demo Terms & Mannequin References
Direct inspection of `/home/christ77/Documents/YODO/index.html` lines 112–136 revealed 6 specific locations where demo terminology and rudimentary mannequin references remain:

- **Line 116**:
  ```html
  <div class="stage-caption"><span>VISUEL DE DÉMONSTRATION</span><span>360°</span></div>
  ```
- **Line 117**:
  ```html
  <div class="garment-turntable" id="garment-turntable" role="img" aria-label="Illustration de démonstration d’un hoodie. Faites glisser pour le faire pivoter. Elle remplace la scène 3D si WebGL est indisponible.">
  ```
- **Line 126**:
  ```html
  <button type="button" id="rotate-left" aria-label="Faire pivoter les mannequins vers la gauche">←</button>
  ```
- **Line 128**:
  ```html
  <button type="button" id="rotate-right" aria-label="Faire pivoter les mannequins vers la droite">→</button>
  ```
- **Line 130**:
  ```html
  <div class="zoom-controls" aria-label="Zoomer sur les mannequins">
  ```
- **Line 135**:
  ```html
  <p class="stage-status" id="scene-status" role="status" aria-live="polite">Visuel de démonstration affiché ; la scène 3D se charge à l’approche.</p>
  ```

Global regex scan (`grep -inE "démonstration|mannequin|demonstration|DEMO" index.html`) verified that no other occurrences exist within `index.html`.

### 1.2 `js/home-page.js` Control Handlers
Direct inspection of `/home/christ77/Documents/YODO/js/home-page.js` lines 28–35 showed that button event listeners only modify internal 2D variables (`angle`, `zoom`) and apply 2D CSS transforms to `.garment-model`:

```javascript
28:  document.querySelector("#rotate-left")?.addEventListener("click", () => setAngle(angle - 35));
29:  document.querySelector("#rotate-right")?.addEventListener("click", () => setAngle(angle + 35));
30:  document.querySelectorAll("[data-zoom]").forEach((button) => {
31:    button.addEventListener("click", () => {
32:      zoom = Math.min(1.3, Math.max(0.75, zoom + (button.dataset.zoom === "in" ? 0.1 : -0.1)));
33:      renderModel();
34:    });
35:  });
```

These listeners currently do NOT communicate with `#hero-stage` or `js/three-scene.js`.

### 1.3 `js/three-scene.js` Event Listeners & Contract
Direct inspection of `/home/christ77/Documents/YODO/js/three-scene.js` lines 298–310 confirmed how the 3D scene receives UI events:

```javascript
298:  function setZoom(delta) {
299:    camera.position.z = THREE.MathUtils.clamp(camera.position.z - delta, 3.6, 8);
300:    camera.updateProjectionMatrix();
301:    draw();
302:  }
303:
304:  stage.addEventListener("yodo:rotate", (event) => {
305:    modelRoot.rotation.y += THREE.MathUtils.degToRad(event.detail.degrees);
306:    interactionUntil = performance.now() + 2200;
307:    draw();
308:  });
309:  stage.addEventListener("yodo:zoom", (event) => setZoom(event.detail.delta));
```

Contract requirements in `ORIGINAL_REQUEST.md`, `PROJECT.md` (lines 40–42), and `DISPATCH.md`:
- `yodo:rotate`: expects `{ detail: { direction: -1 } }` (left) or `{ detail: { direction: 1 } }` (right).
- `yodo:zoom`: expects `{ detail: { delta: button.dataset.zoom === "in" ? 0.35 : -0.35 } }`.

### 1.4 CSS Layout & Render State
Inspection of `style.css` lines 239–240:
```css
.hero-stage.is-rendered .hero-canvas { opacity: 1; pointer-events: auto; touch-action: none; }
.hero-stage.is-rendered .garment-turntable { display: none; }
```
`#rotate-left`, `#rotate-right`, and `[data-zoom]` are placed in `#hero-stage` outside `#garment-turntable`, so they remain visible and clickable whether WebGL is active (`.is-rendered`) or in fallback turntable mode.

---

## 2. Logic Chain

1. **Accessibility and Brand Presentation Cleansing (from Obs 1.1)**:
   - Line 116 (`.stage-caption`): Change `VISUEL DE DÉMONSTRATION` to `COLLECTION STREETWEAR`.
   - Line 117 (`#garment-turntable`): Remove "de démonstration" from `aria-label`, changing to `"Illustration d’un hoodie streetwear. Faites glisser pour le faire pivoter. Elle remplace la scène 3D si WebGL est indisponible."`.
   - Lines 126 & 128: Replace `"les mannequins"` with `"la pièce streetwear"` in the ARIA labels of `#rotate-left` and `#rotate-right`.
   - Line 130: Replace `"les mannequins"` with `"la pièce streetwear"` in the ARIA label of `.zoom-controls`.
   - Line 135 (`#scene-status`): Change initial text to `"Scène 3D streetwear active."` to remove all demo wording from screen readers from page load onward.

2. **UI Event Propagation Design (from Obs 1.2, 1.3, 1.4)**:
   - When the user clicks `#rotate-left` or `#rotate-right`:
     - Dispatch `new CustomEvent("yodo:rotate", { detail: { direction: -1, degrees: -35 }, bubbles: true })` (left) or `{ detail: { direction: 1, degrees: 35 }, bubbles: true }` (right) on `#hero-stage`.
     - Providing *both* `direction: -1 | 1` and `degrees: -35 | 35` guarantees dual compatibility: it satisfies the Milestone 1 contract (`direction`) while avoiding `NaN` in current or legacy `three-scene.js` handlers reading `event.detail.degrees`.
     - Keep `setAngle(angle ± 35)` so that if WebGL is unavailable or fails, 2D CSS rotation continues to work seamlessly.
   - When the user clicks `[data-zoom]`:
     - Determine direction: `const isZoomIn = button.dataset.zoom === "in";`.
     - Dispatch `new CustomEvent("yodo:zoom", { detail: { delta: isZoomIn ? 0.35 : -0.35 }, bubbles: true })` on `#hero-stage`.
     - `three-scene.js` calculates `camera.position.z - delta`, so `delta = 0.35` zooms in (camera moves closer) and `delta = -0.35` zooms out (camera moves farther), perfectly matching `setZoom`.
     - Keep `zoom = Math.min(1.3, Math.max(0.75, zoom + (isZoomIn ? 0.1 : -0.1)))` and `renderModel()` for fallback 2D mode.

3. **Validation of Patch Applicability**:
   - Both changes were converted into unified diffs and verified using `git apply --check`. Both applied cleanly with zero warnings or errors.

---

## 3. Caveats

1. **`three-scene.js` Event Contract Alignment**:
   In `js/three-scene.js:305`, the existing implementation reads `event.detail.degrees`. The dispatch provided by Explorer 1 supplies both `{ direction: -1, degrees: -35 }` and `{ direction: 1, degrees: 35 }`. Implementer 1 should ensure `three-scene.js` handles:
   ```javascript
   const deg = event.detail.degrees ?? (event.detail.direction ? event.detail.direction * 35 : 0);
   ```
   This eliminates any risk of regression or incompatibility.
2. **Catalog / Secondary Pages**:
   References to "démonstration" exist on other catalog pages (`pages/boutique.html`, etc.), but per `ORIGINAL_REQUEST.md` and `PROJECT.md`, the scope for Milestone 1 is strictly the hero presentation on `index.html` and its UI controls in `js/home-page.js`.

---

## 4. Conclusion

The exact implementation changes have been verified and packaged into clean patches:
- `index.html`: Cleanses all 6 demo/mannequin occurrences cleanly without modifying layout structure.
- `js/home-page.js`: Dispatches custom events `yodo:rotate` and `yodo:zoom` on `#hero-stage` while preserving full 2D fallback capability.

### 4.1 Exact Code Diffs

#### Diff A: `index.html`
```diff
--- a/index.html
+++ b/index.html
@@ -113,8 +113,8 @@
           <div class="stage-orbit orbit-one"></div>
           <div class="stage-orbit orbit-two"></div>
           <span class="stage-index">SÉLECTION YODO / 01</span>
-          <div class="stage-caption"><span>VISUEL DE DÉMONSTRATION</span><span>360°</span></div>
-          <div class="garment-turntable" id="garment-turntable" role="img" aria-label="Illustration de démonstration d’un hoodie. Faites glisser pour le faire pivoter. Elle remplace la scène 3D si WebGL est indisponible.">
+          <div class="stage-caption"><span>COLLECTION STREETWEAR</span><span>360°</span></div>
+          <div class="garment-turntable" id="garment-turntable" role="img" aria-label="Illustration d’un hoodie streetwear. Faites glisser pour le faire pivoter. Elle remplace la scène 3D si WebGL est indisponible.">
             <div class="garment-model" aria-hidden="true">
               <div class="garment-depth"></div>
               <svg class="hero-garment garment-front" viewBox="0 0 440 500"><use href="#hoodie-art"></use></svg>
@@ -123,16 +123,16 @@
             </div>
           </div>
           <div class="stage-controls">
-            <button type="button" id="rotate-left" aria-label="Faire pivoter les mannequins vers la gauche">←</button>
+            <button type="button" id="rotate-left" aria-label="Faire pivoter la pièce streetwear vers la gauche">←</button>
             <span>FAITES GLISSER</span>
-            <button type="button" id="rotate-right" aria-label="Faire pivoter les mannequins vers la droite">→</button>
-          </div>
-          <div class="zoom-controls" aria-label="Zoomer sur les mannequins">
+            <button type="button" id="rotate-right" aria-label="Faire pivoter la pièce streetwear vers la droite">→</button>
+          </div>
+          <div class="zoom-controls" aria-label="Zoomer sur la pièce streetwear">
             <button type="button" data-zoom="in" aria-label="Zoomer">+</button>
             <button type="button" data-zoom="out" aria-label="Dézoomer">−</button>
           </div>
           <span class="stage-side-note">GLISSER POUR TOURNER</span>
-          <p class="stage-status" id="scene-status" role="status" aria-live="polite">Visuel de démonstration affiché ; la scène 3D se charge à l’approche.</p>
+          <p class="stage-status" id="scene-status" role="status" aria-live="polite">Scène 3D streetwear active.</p>
         </div>
         <div class="hero-edge-note" aria-hidden="true">YODO / 2026</div>
       </section>
```

#### Diff B: `js/home-page.js`
```diff
--- a/js/home-page.js
+++ b/js/home-page.js
@@ -25,12 +25,35 @@
   });
   turntable.addEventListener("pointerup", () => { pointerStart = null; });
   turntable.addEventListener("pointercancel", () => { pointerStart = null; });
-  document.querySelector("#rotate-left")?.addEventListener("click", () => setAngle(angle - 35));
-  document.querySelector("#rotate-right")?.addEventListener("click", () => setAngle(angle + 35));
+  document.querySelector("#rotate-left")?.addEventListener("click", () => {
+    setAngle(angle - 35);
+    heroStage?.dispatchEvent(
+      new CustomEvent("yodo:rotate", {
+        detail: { direction: -1, degrees: -35 },
+        bubbles: true,
+      })
+    );
+  });
+  document.querySelector("#rotate-right")?.addEventListener("click", () => {
+    setAngle(angle + 35);
+    heroStage?.dispatchEvent(
+      new CustomEvent("yodo:rotate", {
+        detail: { direction: 1, degrees: 35 },
+        bubbles: true,
+      })
+    );
+  });
   document.querySelectorAll("[data-zoom]").forEach((button) => {
     button.addEventListener("click", () => {
-      zoom = Math.min(1.3, Math.max(0.75, zoom + (button.dataset.zoom === "in" ? 0.1 : -0.1)));
+      const isZoomIn = button.dataset.zoom === "in";
+      zoom = Math.min(1.3, Math.max(0.75, zoom + (isZoomIn ? 0.1 : -0.1)));
       renderModel();
+      heroStage?.dispatchEvent(
+        new CustomEvent("yodo:zoom", {
+          detail: { delta: isZoomIn ? 0.35 : -0.35 },
+          bubbles: true,
+        })
+      );
     });
   });
```

### 4.2 Patch Artifacts Generated in State Directory
- `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_1/m1_index_html.patch`
- `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_1/m1_home_page.patch`
- `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_1/m1_html_ui.patch` (combined)

---

## 5. Verification Method

### 5.1 Patch Dry-Run Verification Command
To verify that the consolidated patch applies cleanly without errors:
```bash
git apply --check /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_1/m1_html_ui.patch
```
Expected output: Return code 0 with zero warnings.

### 5.2 Content & Grep Verification Commands (Post-Apply)
1. Verify no demo or mannequin terms remain in `index.html`:
```bash
grep -inE "démonstration|mannequin|demonstration|DEMO" index.html
```
Expected output: No matches found (exit code 1).

2. Verify custom event dispatch in `js/home-page.js`:
```bash
grep -n "yodo:rotate" js/home-page.js
grep -n "yodo:zoom" js/home-page.js
```
Expected output: Matches found for both custom events.

### 5.3 Invalidation Conditions
- Any changes to `index.html` lines 110–136 that alter indentation or element structure before patch application.
- Renaming `#hero-stage`, `#rotate-left`, `#rotate-right`, or `[data-zoom]` in HTML or CSS.
