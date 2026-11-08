# Task Assignment: Explorer 1 (Iteration 2 - Decals Spatial Clearance Fix Strategy)

Working directory: /home/christ77/Documents/YODO
State folder: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_1
Original request file: /home/christ77/Documents/YODO/.agents/teamwork/ORIGINAL_REQUEST.md
Scope document: /home/christ77/Documents/YODO/.agents/teamwork/PROJECT.md
Reviewer 2 failure report: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_reviewer_m1_2/handoff.md
Geometry audit tool: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_reviewer_m1_2/geometry_audit.py

## Objective
Read ORIGINAL_REQUEST.md, PROJECT.md, and Reviewer 2's handoff report.
Iteration 1 Gate failed on 3D spatial clearance defects.
Your task: Formulate the exact fix strategy and code diffs for Front and Back Decals in `js/three-scene.js`:
1. Front Decal:
   - Position and normal orientation to sit proud of the torso chest ($z > 0.3409\text{m}$) across its full width without clipping.
   - Exact rotation around Y-axis (`rotation.y = -0.21`) matching torso curvature.
   - Material configuration with `polygonOffset = true; polygonOffsetFactor = -1.0;` to eliminate any z-fighting.
2. Back Decal:
   - Position and normal orientation to sit proud of the rear torso ($z < -0.364\text{m}$) so it is fully visible during 360° turntable rotation.
   - Exact position: `backDecal.position.set(0, 1.62, -0.370);`
   - Material configuration with `polygonOffset = true; polygonOffsetFactor = -1.0;`.

Write your full findings and code blueprint to `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_1/handoff.md`.
Send a message when done with summary and report path.
