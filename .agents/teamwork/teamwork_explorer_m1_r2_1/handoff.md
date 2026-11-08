# Explorer 1 Handoff Report: Decals 3D Spatial Clearance Fix Strategy (Iteration 2)

**Agent**: Explorer 1 (`teamwork_explorer_m1_r2_1`)  
**Role**: Teamwork Explorer (Read-only Investigation & Strategy Blueprint)  
**Milestone**: Milestone 1, Iteration 2 (Hero 3D Streetwear Visual, Studio Lighting & UI Integration)  
**Date**: 2026-11-08T19:07:00Z  
**State Folder**: `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_1`  
**Patch File**: `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_1/decals_clearance.patch`  

---

## 1. Observation

### 1.1 Verbatim Code Defect in `js/three-scene.js`
In `js/three-scene.js` lines 414–439:
```javascript
  // ----------------------------------------------------
  // 4. Branding Decals (Front Insignia & Back Typo Panel)
  // ----------------------------------------------------
  const frontDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.09),
    new THREE.MeshBasicMaterial({
      map: frontDecalMap,
      transparent: true,
      opacity: 0.94,
      depthWrite: false
    })
  );
  frontDecal.position.set(-0.16, 1.70, 0.332);
  frontDecal.rotation.y = 0.12;
  root.add(frontDecal);

  const backDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.42),
    new THREE.MeshBasicMaterial({
      map: backDecalMap,
      transparent: true,
      opacity: 0.90,
      depthWrite: false
    })
  );
  backDecal.position.set(0, 1.62, -0.332);
  backDecal.rotation.y = Math.PI;
  root.add(backDecal);
```

### 1.2 Torso Geometry & Surface Analytical Model
In `js/three-scene.js` lines 333–341:
```javascript
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.41, 0.86, 36, 12),
    hoodieFabricMaterial
  );
  torso.position.set(0, 1.49, 0);
  torso.scale.set(1.18, 1.0, 0.80);
```
- Torso center $y_c = 1.49\text{ m}$, height $H = 0.86\text{ m}$, bottom $y_{\min} = 1.06\text{ m}$, top $y_{\max} = 1.92\text{ m}$.
- Radii: $r_{\text{bot}} = 0.41\text{ m}$, $r_{\text{top}} = 0.46\text{ m}$.
- Scaling: $s_x = 1.18$, $s_z = 0.80$.
- For any height $y \in [1.06, 1.92]$:
  $$r(y) = 0.41 + \frac{y - 1.06}{0.86} (0.46 - 0.41)$$
  $$a(y) = 1.18 \cdot r(y), \quad b(y) = 0.80 \cdot r(y)$$
- The torso surface profile equation in the horizontal cross-section is the ellipse:
  $$\frac{x^2}{a(y)^2} + \frac{z^2}{b(y)^2} = 1 \implies z_{\text{surface}}(x, y) = b(y) \sqrt{\max\left(0, 1 - \frac{x^2}{a(y)^2}\right)}$$
  with front surface $z_{\text{front}} = +z_{\text{surface}}$ and rear surface $z_{\text{rear}} = -z_{\text{surface}}$.

### 1.3 Audit Tool Execution & Verbatim Failure Output
Running Reviewer 2's geometry audit tool:
```bash
python3 /home/christ77/Documents/YODO/.agents/teamwork/teamwork_reviewer_m1_2/geometry_audit.py
```
Direct output:
```
--- 1. Front Brand Decal Clearance ---
  Front Decal (x_offset=-0.090m): world_z=0.3428m vs torso_z=0.3153m -> clearance=+27.5mm
  Front Decal (x_offset=-0.045m): world_z=0.3374m vs torso_z=0.3298m -> clearance=+7.6mm
  Front Decal (x_offset=+0.000m): world_z=0.3320m vs torso_z=0.3409m -> clearance=-8.9mm
  Front Decal (x_offset=+0.045m): world_z=0.3266m vs torso_z=0.3491m -> clearance=-22.5mm
  Front Decal (x_offset=+0.090m): world_z=0.3212m vs torso_z=0.3545m -> clearance=-33.3mm
  [CRITICAL DEFECT] Front decal penetrates into torso mesh by up to -33.3mm!

--- 2. Back Brand Decal Clearance ---
  Back Decal (dx=-0.21, dy=-0.21): world_z=-0.3320m vs torso_back_z=-0.3135m -> buried by=-18.5mm
  Back Decal (dx=-0.21, dy=+0.00): world_z=-0.3320m vs torso_back_z=-0.3242m -> buried by=-7.8mm
  Back Decal (dx=-0.21, dy=+0.21): world_z=-0.3320m vs torso_back_z=-0.3348m -> buried by=+2.8mm
  Back Decal (dx=+0.00, dy=-0.21): world_z=-0.3320m vs torso_back_z=-0.3443m -> buried by=+12.3mm
  Back Decal (dx=+0.00, dy=+0.00): world_z=-0.3320m vs torso_back_z=-0.3540m -> buried by=+22.0mm
  Back Decal (dx=+0.00, dy=+0.21): world_z=-0.3320m vs torso_back_z=-0.3638m -> buried by=+31.8mm
  Back Decal (dx=+0.21, dy=-0.21): world_z=-0.3320m vs torso_back_z=-0.3135m -> buried by=-18.5mm
  Back Decal (dx=+0.21, dy=+0.00): world_z=-0.3320m vs torso_back_z=-0.3242m -> buried by=-7.8mm
  Back Decal (dx=+0.21, dy=+0.21): world_z=-0.3320m vs torso_back_z=-0.3348m -> buried by=+2.8mm
  [CRITICAL DEFECT] Back decal is buried inside torso mesh by up to 31.8mm!
```

---

## 2. Logic Chain

### 2.1 Front Decal Root Cause & Tangent Angle Derivation
1. **Position mismatch**: At $y = 1.70\text{ m}$, $r(1.70) = 0.4472\text{ m}$, semi-major axis $a = 0.5277\text{ m}$, semi-minor axis $b = 0.3578\text{ m}$. At $x = -0.16\text{ m}$, the torso front surface is:
   $$z_{\text{front}}(-0.16, 1.70) = 0.357767 \sqrt{1 - \left(\frac{-0.16}{0.527707}\right)^2} = 0.34093\text{ m}$$
   The current code placed `frontDecal.position.z = 0.332\text{ m}`, which is $8.9\text{ mm}$ inside the torso mesh at the decal center point.
2. **Inverted rotation error**: The torso ellipse gradient vector $\nabla F(x, z) = \left(\frac{2x}{a^2}, \frac{2z}{b^2}\right)$ at $(-0.16, 0.3409)$ has outward normal components:
   $$n_x = \frac{-0.16}{0.27848} = -0.5746, \quad n_z = \frac{0.34093}{0.12800} = +2.6636$$
   $$\tan(\theta_{\text{normal}}) = \frac{n_x}{n_z} = -0.2157 \implies \theta_{\text{normal}} \approx -0.216\text{ rad} \approx -12.36^\circ$$
3. In Three.js, a plane's default outward normal is $(0, 0, 1)$. Rotating by $\theta$ around $Y$ rotates the normal to $(\sin\theta, 0, \cos\theta)$.
   - In Iteration 1, the code assigned `rotation.y = +0.12`, which directed the normal towards positive $x$ (right), rotating the right edge of the plane ($x_{\text{local}} = +0.09$) backwards into negative $z$:
     $$z_{\text{world}} = 0.332 - (0.09)\sin(0.12) = 0.3212\text{ m}$$
     Meanwhile, the torso surface moved forward towards $z = 0.3545\text{ m}$. This produced a severe penetration of $-33.3\text{ mm}$ on the right edge.
4. Correcting the rotation to `rotation.y = -0.21` directs the plane normal towards negative $x$ ($\sin(-0.21) = -0.2085$), precisely matching the curvature of the left chest:
   - For the right edge ($x_{\text{local}} = +0.09$): $z_{\text{world}} = z_c - (0.09)\sin(-0.21) = z_c + 0.0188\text{ m}$ (slopes forward, tracking the chest's forward protrusion).
   - For the left edge ($x_{\text{local}} = -0.09$): $z_{\text{world}} = z_c - (-0.09)\sin(-0.21) = z_c - 0.0188\text{ m}$ (slopes backward, tracking the shoulder curvature).
5. Setting `position.set(-0.16, 1.70, 0.352)` positions the center proud of the surface by $+11.07\text{ mm}$, yielding strictly positive clearance across all 9 boundary sample points:
   - Center: $+11.07\text{ mm}$
   - Top-Center ($y = 1.745$): $+8.88\text{ mm}$
   - Bottom-Center ($y = 1.655$): $+13.27\text{ mm}$
   - Mid-Left: $+17.45\text{ mm}$
   - Mid-Right: $+16.34\text{ mm}$
   - Top-Left: $+15.08\text{ mm}$
   - Top-Right: $+14.22\text{ mm}$
   - Bottom-Left: $+19.82\text{ mm}$
   - Bottom-Right: $+18.45\text{ mm}$
   Clearance is uniformly maintained between $+8.88\text{ mm}$ and $+19.82\text{ mm}$, completely eliminating mesh penetration.

### 2.2 Back Decal Root Cause & Occlusion Analysis
1. **Depth occlusion in rear view**: The back decal has dimensions $0.42\text{ m} \times 0.42\text{ m}$ centered at $(0, 1.62)$, spanning $x \in [-0.21, +0.21]$ and $y \in [1.41, 1.83]$.
2. The torso's rear surface coordinates are negative:
   - At $(x=0, y=1.62)$, $z_{\text{rear}} = -0.3540\text{ m}$.
   - At $(x=0, y=1.83)$ (top edge), $z_{\text{rear}} = -0.3638\text{ m}$.
3. In Iteration 1, `backDecal.position.z` was set to $-0.332\text{ m}$.
   When viewed from the rear (camera at negative $z$), a point is in front of the torso only if its $z$ coordinate is more negative than the torso surface ($z_{\text{decal}} < z_{\text{rear}}$). Because $-0.332 > -0.3638$, the decal was placed $18.5\text{ mm}$ to $31.8\text{ mm}$ deep inside the opaque torso volume.
4. Setting `backDecal.position.set(0, 1.62, -0.370)` places the decal plane at $z = -0.370\text{ m}$.
   - At the most protruding point $(x=0, y=1.83)$, torso rear is $-0.3638\text{ m}$. Clearance:
     $$z_{\text{rear}} - z_{\text{decal}} = -0.3638 - (-0.3700) = +0.00619\text{ m} = +6.19\text{ mm}$$
   - At $(x=0, y=1.62)$, torso rear is $-0.3540\text{ m}$. Clearance: $+15.95\text{ mm}$.
   - At $(x=\pm 0.21, y=1.83)$, torso rear is $-0.3348\text{ m}$. Clearance: $+35.20\text{ mm}$.
   - At $(x=\pm 0.21, y=1.41)$, torso rear is $-0.3135\text{ m}$. Clearance: $+56.54\text{ mm}$.
5. The decal sits entirely proud of the rear torso surface across its full extent, ensuring 100% visibility during 360° turntable rotation.

### 2.3 Depth-Buffer Precision & Z-Fighting Mitigation (`polygonOffset`)
1. In WebGL, fragments with near-coplanar depth values can exhibit z-fighting (moire artifacts / pixel flickering) when viewed at acute glancing angles (e.g., during 45°–85° turntable rotation) due to non-linear depth buffer quantization.
2. Configuring `MeshBasicMaterial` with:
   ```javascript
   polygonOffset: true,
   polygonOffsetFactor: -1.0,
   polygonOffsetUnits: -1.0
   ```
   instructs the GPU via `gl.polygonOffset(-1.0, -1.0)` to apply a negative depth bias to the decal fragments during rasterization. This guarantees that the decal fragments always test closer to the near plane than the underlying torso mesh fragments.
3. Adding `renderOrder = 2` ensures transparent sorting priority after the opaque body geometry.

---

## 3. Caveats

- **No Caveats**. All coordinates, trigonometric normal angles, depth clearances, and WebGL polygon offset parameters were mathematically verified across 9-point grids and tested against both `geometry_audit.py` and `test_spatial_geometry.py`.
- Drawstrings, aglets, and hood lining are investigated by peer agents (`teamwork_explorer_m1_r2_2` and `r2_3`), and do not interfere with the decal boundaries.

---

## 4. Conclusion & Required Code Blueprint

### 4.1 Summary of Prescribed Fixes
1. **Front Decal (`frontDecal`)**:
   - `position.set(-0.16, 1.70, 0.352)`
   - `rotation.y = -0.21`
   - Material parameters: `polygonOffset: true`, `polygonOffsetFactor: -1.0`, `polygonOffsetUnits: -1.0`
   - Render order: `frontDecal.renderOrder = 2;`
2. **Back Decal (`backDecal`)**:
   - `position.set(0, 1.62, -0.370)`
   - `rotation.y = Math.PI`
   - Material parameters: `polygonOffset: true`, `polygonOffsetFactor: -1.0`, `polygonOffsetUnits: -1.0`
   - Render order: `backDecal.renderOrder = 2;`

### 4.2 Exact Code Snippet (Before vs. After in `js/three-scene.js:414-439`)

#### Before:
```javascript
  const frontDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.09),
    new THREE.MeshBasicMaterial({
      map: frontDecalMap,
      transparent: true,
      opacity: 0.94,
      depthWrite: false
    })
  );
  frontDecal.position.set(-0.16, 1.70, 0.332);
  frontDecal.rotation.y = 0.12;
  root.add(frontDecal);

  const backDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.42),
    new THREE.MeshBasicMaterial({
      map: backDecalMap,
      transparent: true,
      opacity: 0.90,
      depthWrite: false
    })
  );
  backDecal.position.set(0, 1.62, -0.332);
  backDecal.rotation.y = Math.PI;
  root.add(backDecal);
```

#### After:
```javascript
  const frontDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.09),
    new THREE.MeshBasicMaterial({
      map: frontDecalMap,
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
      map: backDecalMap,
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
```

### 4.3 Machine-Applicable Patch
The validated patch is stored at:
`/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_1/decals_clearance.patch`
It has been validated via `git apply --check` with 0 conflicts.

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Dry-run Patch Validation**:
   ```bash
   git apply --check /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_1/decals_clearance.patch
   ```
   *Expected outcome*: Return code 0 with zero errors.

2. **Run 3D Spatial Clearance Suites**:
   - Explorer 3 Suite:
     ```bash
     python3 /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_3/test_spatial_geometry.py
     ```
     *Expected outcome on decals*: All 9 sample points for `frontDecal` pass with clearance $\ge +8.88\text{mm}$, all 9 sample points for `backDecal` pass with clearance $\ge +6.19\text{mm}$, and `polygonOffset` checks pass for both.
   - Reviewer 2 Audit Suite:
     ```bash
     python3 /home/christ77/Documents/YODO/.agents/teamwork/teamwork_reviewer_m1_2/geometry_audit.py
     ```
     *Expected outcome on decals*: Front Decal and Back Decal report 0 critical defects.

3. **Invalidation Conditions**:
   - `frontDecal.position.z <= 0.3409` or `frontDecal.rotation.y >= 0.0`.
   - `backDecal.position.z >= -0.3638`.
   - Decal materials lack `polygonOffset: true` and `polygonOffsetFactor: -1.0`.
