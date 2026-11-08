# Project: YODO 3D Hero Streetwear Upgrade

## Architecture
- **Presentation & DOM (`index.html`)**: Mounts `#hero-canvas` inside `#hero-stage`, provides accessibility labels, interactive controls (`#rotate-left`, `#rotate-right`, `[data-zoom]`), and live status (`#scene-status`).
- **Bootstrap Pipeline (`js/three-bootstrap.js`)**: Lazy-loads `three-scene.js` when the hero section approaches the viewport (240px margin) via `IntersectionObserver`.
- **3D Engine & Scene (`js/three-scene.js`)**: Three.js r170 WebGL scene containing:
  - 3D Streetwear Visual: High-fidelity stylized streetwear garment (oversized hoodie/jacket with fabric textures, hood, kangaroo pocket, ribbed hems, drawstrings, metallic aglets, and brand insignia).
  - Studio Lighting: Editorial 4-point studio rig (Softbox Key with PCFSoft shadows, Soft Fill reflector, signature YODO Red rim kicker, Cool Ice silhouette kicker, and Top softbox).
  - Environment: `RoomEnvironment` / PMREMGenerator for realistic PBR cloth sheen, micro-roughness, and metallic specular reflections.
  - Contact Shadow: Soft dynamic `ShadowMaterial` ground plane beneath the garment.
  - Interaction & Animation: Smooth turntable drag rotation, subtle vertical tilt, zoom clamp, responsive auto-rotation, and event listener for UI button triggers.
  - Responsive Viewport: Dynamic camera distance formula matching aspect ratio across mobile, tablet, and desktop without clipping or distortion.
- **UI Event Wiring (`js/home-page.js`)**: Connects `#rotate-left`, `#rotate-right`, and `[data-zoom]` buttons to dispatch `yodo:rotate` and `yodo:zoom` custom events on `#hero-stage`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Demo Text Removal | Remove all mentions of "démonstration" and "mannequin" in `index.html` (caption, button ARIA labels, live status). | M1 | Survey (Explorer 1) |
| 2 | Primitive Mannequin Code Deletion | Remove `makeCapsuleBetween()`, `makeMannequin()`, and missing `./assets/models3d/*.glb` slots in `js/three-scene.js`. | M1 | Survey (Explorer 2) |
| 3 | 3D Streetwear Visual Centerpiece | High-end streetwear hoodie/jacket visual with detailed folds, textures, ribbed trim, drawstrings, aglets, and YODO branding. | M1 | Survey (Explorer 2 & 3) |
| 4 | Studio Lighting Rig | 4-point editorial studio lighting (Key, Fill, dual YODO Red + Cool rim kickers, Top softbox) with balanced exposure. | M1 | Survey (Explorer 2) |
| 5 | Dynamic Soft Contact Shadows | Enable `renderer.shadowMap.enabled = true`, `PCFSoftShadowMap`, and `ShadowMaterial` ground plane replacing fake black circle. | M1 | Survey (Explorer 2) |
| 6 | PBR Cloth Materials & Environment | `MeshPhysicalMaterial` with cloth sheen, fabric bump map, metallic hardware, and studio environment map (via `RoomEnvironment`). | M1 | Survey (Explorer 2 & 3) |
| 7 | Responsive Camera & Aspect Ratio | Smooth dynamic camera positioning preventing distortion or clipping across 320px to 2560px screen widths. | M1 | Survey (Explorer 1 & 3) |
| 8 | UI Control Integration | Connect UI buttons (`#rotate-left`, `#rotate-right`, `[data-zoom]`) in `js/home-page.js` to dispatch events to `#hero-stage`. | M1 | Survey (Explorer 1 & 2) |
| 9 | Zero 404s & Clean Console | Ensure zero missing asset 404 network requests and zero WebGL errors or warnings. | M1 | Survey (Explorer 1, 2, 3) |

## Milestones
| # | Name | Scope | Dependencies | Status | Outputs |
|---|------|-------|-------------|--------|---------|
| 1 | Hero 3D Streetwear Visual, Studio Lighting & UI Integration | Features 1 through 9: Cleanse demo text in `index.html`, replace primitive mannequin code with high-end 3D streetwear centerpiece in `js/three-scene.js`, studio lighting & shadows, PBR cloth materials, responsive camera framing, and UI button wiring in `js/home-page.js`. | none | DONE | `index.html`, `js/three-scene.js`, `js/home-page.js` verified (35/35 spatial checks pass, 29/29 HTTP 200, 0 404s, 0 WebGL warnings, dual Reviewer APPROVE, dual Challenger APPROVE, Auditor CLEAN) |

## Interface Contracts
### `index.html` ↔ `js/three-scene.js`
- Mount Target: `#hero-canvas` inside `#hero-stage`
- Status Element: `#scene-status` text content updated on scene load ("Scène 3D streetwear active.")
- Stage Classes: `#hero-stage.is-rendered` added when WebGL rendering starts

### `js/home-page.js` ↔ `js/three-scene.js`
- Custom Events on `#hero-stage`:
  - `yodo:rotate`: `event.detail.direction = -1` (left) or `1` (right), rotates `modelRoot.rotation.y`
  - `yodo:zoom`: `event.detail.delta = 0.35` (in) or `-0.35` (out), clamps camera z between 3.6 and 8.0

## Code Layout
- `index.html`: Hero DOM markup, accessibility attributes, UI control buttons
- `js/three-bootstrap.js`: Lazy-loading entry point (IntersectionObserver)
- `js/three-scene.js`: Three.js scene, streetwear 3D model, lighting, materials, interactions
- `js/home-page.js`: Homepage UI handlers and event dispatchers
