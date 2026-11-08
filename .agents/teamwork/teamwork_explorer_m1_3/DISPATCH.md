# Task Assignment: Explorer 3 (Milestone 1 - Studio Lighting, Shadows, Environment & Responsive Math)

Working directory: /home/christ77/Documents/YODO
State folder: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_3
Original request file: /home/christ77/Documents/YODO/.agents/teamwork/ORIGINAL_REQUEST.md
Scope document: /home/christ77/Documents/YODO/.agents/teamwork/PROJECT.md

## Objective
Read ORIGINAL_REQUEST.md and PROJECT.md.
Design the studio lighting, shadows, environment map, and responsive camera pipeline in `js/three-scene.js`:
1. Studio Lighting Rig:
   - Key Softbox: `DirectionalLight(0xfff8f0, 2.4)` with tuned shadow camera frustum, `PCFSoftShadowMap`.
   - Fill Reflector: `DirectionalLight(0xedf2ff, 0.95)` at `(3.0, 2.8, 3.0)` to eliminate pitch-black shadows.
   - Signature Rim Kicker: `DirectionalLight(0xe52335, 2.2)` at `(2.8, 3.2, -2.6)` for YODO crimson edge highlight.
   - Cool Silhouette Kicker: `DirectionalLight(0xd4e4fc, 1.6)` at `(-2.8, 3.0, -2.6)` for crisp edge separation.
   - Overhead Softbox: `DirectionalLight(0xffffff, 0.7)` at `(0, 5.0, 0.4)`.
   - Base Ambient: `AmbientLight(0xffffff, 0.35)`.
2. Environment Map:
   - Use `RoomEnvironment` from `three/addons/environments/RoomEnvironment.js` with `PMREMGenerator` to supply studio IBL reflections for PBR sheen and metallic hardware without any external image files.
3. Ground Plane & Shadows:
   - Enable `renderer.shadowMap.enabled = true` and `renderer.shadowMap.type = THREE.PCFSoftShadowMap`.
   - Add a `ShadowMaterial({ opacity: 0.38 })` ground plane receiving dynamic contact shadows, replacing the unlit static circle.
4. Responsive Camera Math & Interaction:
   - Update `resize()` to calculate camera distance dynamically based on aspect ratio:
     `const targetDistance = Math.max(4.6, 4.6 / Math.min(1.0, bounds.width / bounds.height));`
     ensuring perfect framing across 320px to 2560px without cropping or distortion.
   - Ensure `draw()` and `animate()` operate cleanly without 404s or WebGL warnings.

Write your exact implementation specifications, code snippets, and integration points to:
`/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_3/handoff.md`.
Send a message when done with summary and report path.


## 2026-11-08T18:26:22Z
You are Explorer 3 formulating the Studio Lighting, Shadows, Environment and Responsive pipeline strategy for Milestone 1.

Working directory: /home/christ77/Documents/YODO
Your state folder: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_3
Original request file: /home/christ77/Documents/YODO/.agents/teamwork/ORIGINAL_REQUEST.md
Scope document: /home/christ77/Documents/YODO/.agents/teamwork/PROJECT.md

Read /home/christ77/Documents/YODO/.agents/teamwork/ORIGINAL_REQUEST.md, /home/christ77/Documents/YODO/.agents/teamwork/PROJECT.md, and /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_3/DISPATCH.md before starting work.

Your task:
Formulate exact implementation architecture for `js/three-scene.js`:
1. 4-point editorial studio lighting rig (Key softbox with PCFSoft shadows, Fill reflector, signature YODO Red rim kicker, Cool Ice silhouette kicker, Top softbox, subtle ambient).
2. Studio environment map using `RoomEnvironment` and `PMREMGenerator` for realistic PBR reflections without external image files.
3. Enabling `renderer.shadowMap.enabled = true`, `PCFSoftShadowMap`, and `ShadowMaterial` ground plane contact shadow.
4. Smooth responsive camera positioning math based on viewport aspect ratio across mobile, tablet, and desktop (320px to 2560px).

Write your full findings and handoff report to:
`/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_3/handoff.md`.
Update progress.md in your state folder.
Send a message when done with summary and report path.
