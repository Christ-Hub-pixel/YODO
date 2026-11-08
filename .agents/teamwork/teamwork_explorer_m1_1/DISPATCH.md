# Task Assignment: Explorer 1 (Milestone 1 - HTML & UI Controls Strategy)

Working directory: /home/christ77/Documents/YODO
State folder: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_1
Original request file: /home/christ77/Documents/YODO/.agents/teamwork/ORIGINAL_REQUEST.md
Scope document: /home/christ77/Documents/YODO/.agents/teamwork/PROJECT.md

## Objective
Read ORIGINAL_REQUEST.md and PROJECT.md.
Formulate the exact implementation plan for:
1. `index.html`:
   - Line 116: Replace `VISUEL DE DÉMONSTRATION` with `COLLECTION STREETWEAR`.
   - Line 117: Cleanse `aria-label` of `#garment-turntable` (remove "de démonstration").
   - Lines 126 & 128: Cleanse `aria-label` of `#rotate-left` and `#rotate-right` (replace "les mannequins" with "la pièce streetwear").
   - Line 130: Cleanse `aria-label` of `.zoom-controls` (replace "les mannequins" with "la pièce streetwear").
   - Line 135: Cleanse initial text of `#scene-status` to `Scène 3D streetwear active.`
2. `js/home-page.js`:
   - In event listeners for `#rotate-left` and `#rotate-right`, dispatch custom event `yodo:rotate` with `{ detail: { direction: -1 } }` or `{ detail: { direction: 1 } }` on `#hero-stage`.
   - In event listeners for `[data-zoom]`, dispatch custom event `yodo:zoom` with `{ detail: { delta: button.dataset.zoom === "in" ? 0.35 : -0.35 } }` on `#hero-stage`.
   - Ensure these listeners gracefully operate whether WebGL is rendered or in fallback mode.

Write your exact recommended diffs and implementation steps to:
`/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_1/handoff.md`.
Send a message when done with summary and report path.


## 2026-11-08T18:26:09Z
You are Explorer 1 formulating the HTML & UI controls implementation strategy for Milestone 1.

Working directory: /home/christ77/Documents/YODO
Your state folder: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_1
Original request file: /home/christ77/Documents/YODO/.agents/teamwork/ORIGINAL_REQUEST.md
Scope document: /home/christ77/Documents/YODO/.agents/teamwork/PROJECT.md

Read /home/christ77/Documents/YODO/.agents/teamwork/ORIGINAL_REQUEST.md, /home/christ77/Documents/YODO/.agents/teamwork/PROJECT.md, and /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_1/DISPATCH.md before starting work.

Your task:
Formulate exact implementation diffs and steps for:
1. `index.html`: Cleanse demo terms and mannequin references in lines 116, 117, 126, 128, 130, 135.
2. `js/home-page.js`: Wire up `#rotate-left`, `#rotate-right`, and `[data-zoom]` buttons to dispatch custom events `yodo:rotate` and `yodo:zoom` on `#hero-stage`.

Write your full findings and handoff report to:
`/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_1/handoff.md`.
Update progress.md in your state folder.
Send a message when done with summary and report path.
