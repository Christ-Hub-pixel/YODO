# Task Assignment: Explorer 3 (Iteration 2 - 3D Spatial Geometry Verification Suite)

Working directory: /home/christ77/Documents/YODO
State folder: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_3
Original request file: /home/christ77/Documents/YODO/.agents/teamwork/ORIGINAL_REQUEST.md
Scope document: /home/christ77/Documents/YODO/.agents/teamwork/PROJECT.md
Reviewer 2 failure report: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_reviewer_m1_2/handoff.md
Geometry audit tool: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_reviewer_m1_2/geometry_audit.py

## Objective
Read ORIGINAL_REQUEST.md, PROJECT.md, Reviewer 2's handoff report, and `geometry_audit.py`.
Iteration 1 Gate failed because previous verification relied on superficial string matching rather than 3D spatial clearance checks.
Your task: Design an automated, rigorous 3D spatial geometry verification suite that the Worker will incorporate into their test harness:
1. Mathematical model of torso curvature ($z(x, y)$), kangaroo pocket wall ($z_{\text{pocket}}(x, y)$), and decal planes.
2. Clearance assertion equations:
   - Front decal: $z_{\text{decal}}(x, y) - z_{\text{torso}}(x, y) > 0$ for all vertices of the decal mesh.
   - Back decal: $z_{\text{torso\_back}}(x, y) - z_{\text{back\_decal}}(x, y) > 0$ for all vertices of the back decal.
   - Drawstring & Aglets: clearance $> 0$ relative to chest and pocket.
   - Hood lining: assert `material.side === THREE.BackSide` or `THREE.DoubleSide`.
3. Provide the complete executable test script specification that proves all clearances are strictly positive (> 0 mm).

Write your full findings and test suite blueprint to `/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_3/handoff.md`.
Send a message when done with summary and report path.
