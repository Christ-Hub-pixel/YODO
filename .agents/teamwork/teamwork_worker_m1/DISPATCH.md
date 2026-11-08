## 2026-11-08T18:34:12Z
You are the Worker implementing Milestone 1: Hero 3D Streetwear Visual, Studio Lighting & UI Integration.

Working directory: /home/christ77/Documents/YODO
Your state folder: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_worker_m1
Original request file: /home/christ77/Documents/YODO/.agents/teamwork/ORIGINAL_REQUEST.md
Scope document: /home/christ77/Documents/YODO/.agents/teamwork/PROJECT.md

## Exclusive Write Ownership
You own exclusive write permissions for:
- `index.html`
- `js/three-scene.js`
- `js/home-page.js`

You MUST NOT modify files outside your write ownership.

## Explorer Blueprints to Read
Before making any changes, thoroughly read:
1. /home/christ77/Documents/YODO/.agents/teamwork/ORIGINAL_REQUEST.md
2. /home/christ77/Documents/YODO/.agents/teamwork/PROJECT.md
3. /home/christ77/Documents/YODO/.agents/teamwork/teamwork_worker_m1/DISPATCH.md
4. /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_1/handoff.md (and patches: `m1_index_html.patch`, `m1_home_page.patch`, `m1_html_ui.patch`)
5. /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_2/handoff.md (complete 3D model, geometries, PBR materials, canvas texture generators)
6. /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_3/handoff.md (studio lighting rig, RoomEnvironment PMREM, shadow maps, responsive camera math)

## Implementation Scope
1. Update `index.html`: cleanse demo terms and mannequin mentions in lines 116, 117, 126, 128, 130, 135.
2. Update `js/home-page.js`: wire `#rotate-left`, `#rotate-right`, and `[data-zoom]` to dispatch `yodo:rotate` and `yodo:zoom` on `#hero-stage`.
3. Update `js/three-scene.js`:
   - Delete obsolete primitive mannequin code and missing `./assets/models3d/*.glb` loader loops.
   - Implement the procedural 3D Streetwear centerpiece (`createStreetwearGarment()`) using `THREE.MeshPhysicalMaterial` with cloth sheen, micro-roughness, technical accents, metallic hardware, and procedural canvas texture bump maps for French terry fleece and rib knit, plus YODO branding decals.
   - Implement the 4-point editorial studio lighting rig (Key light with 2048x2048 PCFSoft shadows, Fill reflector, signature YODO Crimson rim kicker `0xe52335`, Cool Ice silhouette kicker `0xd4e4fc`, Overhead softbox, Ambient).
   - Configure `RoomEnvironment` with `PMREMGenerator` for realistic PBR environment reflections without external image files.
   - Enable `renderer.shadowMap.enabled = true`, `renderer.shadowMap.type = THREE.PCFSoftShadowMap`, and dynamic `ShadowMaterial` ground contact shadow plane.
   - Implement continuous aspect-ratio responsive camera math (`Math.max(4.6, 4.6 / Math.min(1.0, aspect))`).
   - Ensure clean console: zero 404s, zero WebGL warnings/errors.
4. Run builds / tests and empirical verifications:
   - Check that no residual "démonstration" or "mannequin" text remains in `index.html`.
   - Verify JS syntax and runtime integrity.
   - Verify zero missing asset 404s and clean console.
   - Verify responsive resizing logic.
