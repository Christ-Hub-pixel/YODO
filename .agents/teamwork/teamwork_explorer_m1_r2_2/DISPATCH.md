# Task Assignment: Explorer 2 (Iteration 2 - Drawstrings, Aglets & Hood Lining Fix Strategy)

Working directory: /home/christ77/Documents/YODO
State folder: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_2
Original request file: /home/christ77/Documents/YODO/.agents/teamwork/ORIGINAL_REQUEST.md
Scope document: /home/christ77/Documents/YODO/.agents/teamwork/PROJECT.md
Reviewer 2 failure report: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_reviewer_m1_2/handoff.md
Geometry audit tool: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_reviewer_m1_2/geometry_audit.py

## Objective
Read ORIGINAL_REQUEST.md, PROJECT.md, and Reviewer 2's handoff report.
Iteration 1 Gate failed on 3D spatial clearance defects.
Your task: Formulate the exact fix strategy and code diffs for Drawstrings, Aglets, and Hood Lining in `js/three-scene.js`:
1. Drawstrings & Metallic Aglets:
   - Adjust Catmull-Rom cord control points (`leftCordCurve`, `rightCordCurve`) so they drape smoothly over the chest ($z \ge 0.370$) and kangaroo pocket ($z \ge 0.405$), eliminating any chest penetration.
   - Position `leftAglet` and `rightAglet` outside the kangaroo pocket wall ($z = 0.405$), fully visible in front of the pocket.
2. Hood Inner Lining:
   - Configure `innerLiningMaterial` with `side: THREE.BackSide` (or `THREE.DoubleSide`) in `js/three-scene.js:264-268` so the inner sphere dome renders properly and is not backface culled when looking into the hood.

Write your full findings and code blueprint to `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_2/handoff.md`.
Send a message when done with summary and report path.
