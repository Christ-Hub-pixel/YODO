#!/usr/bin/env python3
import math
import os
import re
import sys

# Add Explorer 3 verifier directory to path
sys.path.insert(0, "/home/christ77/Documents/YODO/.agents/teamwork/teamwork_explorer_m1_r2_3")
import test_spatial_geometry as tsg

with open("js/three-scene.js", "r") as f:
    src = f.read()

# Apply innerLiningMaterial fix
src_fix = re.sub(
    r"const innerLiningMaterial = new THREE\.MeshStandardMaterial\(\{\s+color: 0x0f0f10,\s+roughness: 0\.92,\s+metalness: 0\.0\s+\}\);",
    """const innerLiningMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f0f10,
    roughness: 0.92,
    metalness: 0.0,
    side: THREE.DoubleSide
  });""",
    src
)

# Apply cord and aglet fix
src_fix = src_fix.replace(
"""  const leftCordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.085, 1.94, 0.26),
    new THREE.Vector3(-0.11, 1.78, 0.32),
    new THREE.Vector3(-0.13, 1.58, 0.35),
    new THREE.Vector3(-0.10, 1.42, 0.34),
    new THREE.Vector3(-0.12, 1.28, 0.32)
  ]);""",
"""  const leftCordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.085, 1.94, 0.26),
    new THREE.Vector3(-0.11, 1.78, 0.375),
    new THREE.Vector3(-0.13, 1.58, 0.370),
    new THREE.Vector3(-0.10, 1.42, 0.375),
    new THREE.Vector3(-0.12, 1.28, 0.405)
  ]);"""
)

src_fix = src_fix.replace(
"""  const rightCordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.085, 1.94, 0.26),
    new THREE.Vector3(0.11, 1.76, 0.32),
    new THREE.Vector3(0.14, 1.56, 0.35),
    new THREE.Vector3(0.12, 1.40, 0.34),
    new THREE.Vector3(0.13, 1.24, 0.32)
  ]);""",
"""  const rightCordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.085, 1.94, 0.26),
    new THREE.Vector3(0.11, 1.76, 0.375),
    new THREE.Vector3(0.14, 1.56, 0.370),
    new THREE.Vector3(0.12, 1.40, 0.375),
    new THREE.Vector3(0.13, 1.24, 0.405)
  ]);"""
)

src_fix = src_fix.replace(
"""  const leftAglet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.013, 0.065, 16),
    metallicHardwareMaterial
  );
  leftAglet.position.set(-0.12, 1.25, 0.32);
  leftAglet.rotation.z = 0.12;
  root.add(leftAglet);

  const rightAglet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.013, 0.065, 16),
    metallicHardwareMaterial
  );
  rightAglet.position.set(0.13, 1.21, 0.32);
  rightAglet.rotation.z = -0.10;
  root.add(rightAglet);""",
"""  const leftAglet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.013, 0.065, 16),
    metallicHardwareMaterial
  );
  leftAglet.position.set(-0.12, 1.25, 0.405);
  leftAglet.rotation.z = 0.12;
  leftAglet.castShadow = true;
  root.add(leftAglet);

  const rightAglet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.013, 0.065, 16),
    metallicHardwareMaterial
  );
  rightAglet.position.set(0.13, 1.21, 0.405);
  rightAglet.rotation.z = -0.10;
  rightAglet.castShadow = true;
  root.add(rightAglet);"""
)

torso = tsg.torso_model()
pocket = tsg.pocket_model()

print("==================================================")
print("TESTING PROPOSED FIX AGAINST EXPLORER 3 TEST SUITE")
print("==================================================")

# 1. Aglets
print("\n--- 1. Metallic Aglets Clearance ---")
la_pos = tsg.parse_position_set(src_fix, "leftAglet")
ra_pos = tsg.parse_position_set(src_fix, "rightAglet")

for name, (ax, ay, az) in [("Left Aglet", la_pos), ("Right Aglet", ra_pos)]:
    pz = pocket["front_z"](ax, ay)
    cl = (az - pz) * 1000.0
    status = "PASS" if cl > 0 else "FAIL"
    print(f"  [{status}] {name:12s} at ({ax:+.3f}, {ay:.3f}, {az:.4f}) vs pocket_z={pz:.4f} -> clearance={cl:+.2f}mm")

# 2. Cords Control Points
print("\n--- 2. Cord Control Points Clearance ---")
lcc_match = re.search(r"leftCordCurve\s*=\s*new\s+THREE\.CatmullRomCurve3\(\[\s*([\s\S]*?)\]\);", src_fix)
left_pts = tsg.parse_vector3_tuples(lcc_match.group(1))

for idx, (cx, cy, cz) in enumerate(left_pts[1:], 2):
    surf_z = pocket["front_z"](cx, cy) if cy < pocket["y_max"] else torso["front_z"](cx, cy)
    surf_name = "pocket" if cy < pocket["y_max"] else "torso"
    cl = (cz - surf_z) * 1000.0
    status = "PASS" if cl > 0 else "FAIL"
    print(f"  [{status}] Left Cord Pt {idx} ({cx:+.3f}, {cy:.3f}, {cz:.4f}) vs {surf_name}_z={surf_z:.4f} -> clearance={cl:+.2f}mm")

rcc_match = re.search(r"rightCordCurve\s*=\s*new\s+THREE\.CatmullRomCurve3\(\[\s*([\s\S]*?)\]\);", src_fix)
right_pts = tsg.parse_vector3_tuples(rcc_match.group(1))

for idx, (cx, cy, cz) in enumerate(right_pts[1:], 2):
    surf_z = pocket["front_z"](cx, cy) if cy < pocket["y_max"] else torso["front_z"](cx, cy)
    surf_name = "pocket" if cy < pocket["y_max"] else "torso"
    cl = (cz - surf_z) * 1000.0
    status = "PASS" if cl > 0 else "FAIL"
    print(f"  [{status}] Right Cord Pt {idx} ({cx:+.3f}, {cy:.3f}, {cz:.4f}) vs {surf_name}_z={surf_z:.4f} -> clearance={cl:+.2f}mm")

# 3. Continuous Spline Drape
print("\n--- 3. Continuous Spline Drape (Subdivided Catmull-Rom Sampling) ---")
min_cl_left = 999.0
segments = [
    (left_pts[0], left_pts[1], left_pts[2], left_pts[3]),
    (left_pts[1], left_pts[2], left_pts[3], left_pts[4]),
    (left_pts[2], left_pts[3], left_pts[4], left_pts[4]),
]
for p0, p1, p2, p3 in segments:
    for step in range(11):
        t = step / 10.0
        pt = tsg.eval_catmull_rom(p0, p1, p2, p3, t)
        sz = pocket["front_z"](pt[0], pt[1]) if pt[1] < pocket["y_max"] else torso["front_z"](pt[0], pt[1])
        cl = (pt[2] - sz) * 1000.0
        min_cl_left = min(min_cl_left, cl)

status = "PASS" if min_cl_left > 0 else "FAIL"
print(f"  [{status}] Continuous Left Spline Drape: min_clearance={min_cl_left:+.2f}mm")

min_cl_right = 999.0
segments_r = [
    (right_pts[0], right_pts[1], right_pts[2], right_pts[3]),
    (right_pts[1], right_pts[2], right_pts[3], right_pts[4]),
    (right_pts[2], right_pts[3], right_pts[4], right_pts[4]),
]
for p0, p1, p2, p3 in segments_r:
    for step in range(11):
        t = step / 10.0
        pt = tsg.eval_catmull_rom(p0, p1, p2, p3, t)
        sz = pocket["front_z"](pt[0], pt[1]) if pt[1] < pocket["y_max"] else torso["front_z"](pt[0], pt[1])
        cl = (pt[2] - sz) * 1000.0
        min_cl_right = min(min_cl_right, cl)

status = "PASS" if min_cl_right > 0 else "FAIL"
print(f"  [{status}] Continuous Right Spline Drape: min_clearance={min_cl_right:+.2f}mm")

# 4. Hood Inner Lining
print("\n--- 4. Hood Inner Lining Material Culling Mode ---")
lining_match = re.search(r"const\s+innerLiningMaterial\s*=\s*new\s+THREE\.MeshStandardMaterial\(\{\s*([\s\S]*?)\}\);", src_fix)
props = lining_match.group(1)
has_back = ("THREE.BackSide" in props) or ("THREE.DoubleSide" in props)
status = "PASS" if has_back else "FAIL"
print(f"  [{status}] Hood lining back/double side: {has_back}")
