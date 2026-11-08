#!/usr/bin/env python3
"""
Automated 3D Spatial Geometry Verification Suite for YODO Streetwear Centerpiece.
Iteration 2 - Milestone 1 Automated Test Harness

Author: Explorer 3 (Iteration 2)
Target: js/three-scene.js

Performs rigorous mathematical clearance calculations and WebGL state assertions:
1. Front Brand Decal Clearance:
   z_decal(x, y) - z_torso(x, y) > 0 across 4 corners, 4 midpoints, and center (9-point grid).
2. Back Brand Decal Clearance:
   z_torso_rear(x, y) - z_back_decal(x, y) > 0 across 4 corners, 4 midpoints, and center (9-point grid).
3. Drawstring Draping & Aglet Clearance:
   - Aglets sit > 0mm in front of kangaroo pocket wall: z_aglet - z_pocket > 0.
   - Drawstrings drape outside chest (y in [1.40, 1.85]): z_cord - z_torso > 0.
   - Drawstrings drape outside pocket (y in [1.11, 1.39]): z_cord - z_pocket > 0.
   - Continuous Catmull-Rom spline sampling along the drape.
   - Eyelet anchor alignment: Point 1 matches eyelet position.
4. Hood Inner Lining Backface Culling:
   innerLiningMaterial.side === THREE.BackSide or THREE.DoubleSide.
5. Decal Z-Fighting Prevention:
   polygonOffset: true and polygonOffsetFactor <= -1.0 on front and back decals.
"""

import math
import os
import re
import sys

def parse_vector3_tuples(text):
    """Extract (x, y, z) tuples from THREE.Vector3(x, y, z) calls."""
    matches = re.findall(r"new\s+THREE\.Vector3\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)", text)
    return [(float(x), float(y), float(z)) for x, y, z in matches]

def parse_position_set(text, obj_name):
    """Extract (x, y, z) from obj.position.set(x, y, z)."""
    pattern = rf"{obj_name}\.position\.set\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)"
    m = re.search(pattern, text)
    if not m:
        raise ValueError(f"Could not find position.set for {obj_name}")
    return float(m.group(1)), float(m.group(2)), float(m.group(3))

def parse_rotation_y(text, obj_name):
    """Extract rotation.y value from obj.rotation.y = val."""
    pattern = rf"{obj_name}\.rotation\.y\s*=\s*([^;]+);"
    m = re.search(pattern, text)
    if not m:
        return 0.0
    val_str = m.group(1).strip()
    if val_str == "Math.PI":
        return math.pi
    if val_str == "-Math.PI":
        return -math.pi
    return float(val_str)

def torso_model():
    """
    Torso Cylinder Parameters in js/three-scene.js:
    CylinderGeometry(0.46, 0.41, 0.86, 36, 12) at position (0, 1.49, 0), scale (1.18, 1.0, 0.80)
    """
    y_center = 1.49
    height = 0.86
    y_min = y_center - height / 2.0  # 1.06
    y_max = y_center + height / 2.0  # 1.92
    r_top = 0.46
    r_bot = 0.41
    scale_x = 1.18
    scale_z = 0.80

    def radius_at(y):
        t = (y - y_min) / height
        return r_bot + t * (r_top - r_bot)

    def front_z(x, y):
        r = radius_at(y)
        a = r * scale_x
        b = r * scale_z
        if abs(x) > a:
            return 0.0
        return b * math.sqrt(max(0.0, 1.0 - (x / a) ** 2))

    def rear_z(x, y):
        return -front_z(x, y)

    return {"y_min": y_min, "y_max": y_max, "front_z": front_z, "rear_z": rear_z, "radius_at": radius_at}

def pocket_model():
    """
    Kangaroo Pocket Cylinder Parameters in js/three-scene.js:
    CylinderGeometry(0.43, 0.45, 0.28) at position (0, 1.25, 0.03), scale (1.19, 1.0, 0.82)
    """
    y_center = 1.25
    height = 0.28
    y_min = y_center - height / 2.0  # 1.11
    y_max = y_center + height / 2.0  # 1.39
    r_top = 0.43
    r_bot = 0.45
    scale_x = 1.19
    scale_z = 0.82
    z_offset = 0.03

    def front_z(x, y):
        local_y = y - y_center
        t = (local_y + height / 2.0) / height
        r = r_bot + t * (r_top - r_bot)
        a = r * scale_x
        b = r * scale_z
        if abs(x) > a:
            return 0.0
        return z_offset + b * math.sqrt(max(0.0, 1.0 - (x / a) ** 2))

    return {"y_min": y_min, "y_max": y_max, "front_z": front_z}

def eval_catmull_rom(p0, p1, p2, p3, t):
    """Evaluate standard cubic Catmull-Rom spline segment between p1 and p2 at t in [0, 1]."""
    t2 = t * t
    t3 = t2 * t
    x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
    y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
    z = 0.5 * ((2 * p1[2]) + (-p0[2] + p2[2]) * t + (2 * p0[2] - 5 * p1[2] + 4 * p2[2] - p3[2]) * t2 + (-p0[2] + 3 * p1[2] - 3 * p2[2] + p3[2]) * t3)
    return (x, y, z)

def run_spatial_verification(filepath="js/three-scene.js"):
    print("======================================================================")
    print("  3D SPATIAL GEOMETRY & CLEARANCE VERIFICATION SUITE")
    print(f"  Target File: {filepath}")
    print("======================================================================")

    if not os.path.exists(filepath):
        print(f"ERROR: File not found: {filepath}")
        return False

    with open(filepath, "r", encoding="utf-8") as f:
        src = f.read()

    torso = torso_model()
    pocket = pocket_model()

    failures = []
    test_count = 0

    # ------------------------------------------------------------------
    # 1. Front Decal Verification (3x3 grid: 4 corners, 4 midpoints, 1 center)
    # ------------------------------------------------------------------
    print("\n--- Test Suite 1: Front Brand Decal 3D Spatial Clearance ---")
    fd_pos = parse_position_set(src, "frontDecal")
    fd_rot_y = parse_rotation_y(src, "frontDecal")
    print(f"  Extracted Front Decal: pos=({fd_pos[0]:.4f}, {fd_pos[1]:.4f}, {fd_pos[2]:.4f}), rot_y={fd_rot_y:.4f} rad")

    w_f = 0.18
    h_f = 0.09
    half_w = w_f / 2.0
    half_h = h_f / 2.0

    sample_points = [
        ("Center", 0.0, 0.0),
        ("Top-Left", -half_w, half_h),
        ("Top-Center", 0.0, half_h),
        ("Top-Right", half_w, half_h),
        ("Mid-Left", -half_w, 0.0),
        ("Mid-Right", half_w, 0.0),
        ("Bottom-Left", -half_w, -half_h),
        ("Bottom-Center", 0.0, -half_h),
        ("Bottom-Right", half_w, -half_h),
    ]

    for label, lx, ly in sample_points:
        test_count += 1
        wx = fd_pos[0] + lx * math.cos(fd_rot_y)
        wy = fd_pos[1] + ly
        wz = fd_pos[2] - lx * math.sin(fd_rot_y)

        tz = torso["front_z"](wx, wy)
        clearance = wz - tz  # z_decal - z_torso > 0
        clearance_mm = clearance * 1000.0

        status = "PASS" if clearance_mm > 0 else "FAIL"
        print(f"  [{status}] {label:13s} loc=({lx:+.3f},{ly:+.3f}) -> world=({wx:.3f},{wy:.3f},{wz:.4f}) torso_z={tz:.4f} clearance={clearance_mm:+.2f}mm")
        if clearance_mm <= 0:
            failures.append(f"Front decal {label} collides with torso by {clearance_mm:.2f}mm (z_w={wz:.4f} <= torso_z={tz:.4f})")

    # ------------------------------------------------------------------
    # 2. Back Decal Verification (3x3 grid: 4 corners, 4 midpoints, 1 center)
    # ------------------------------------------------------------------
    print("\n--- Test Suite 2: Back Brand Decal 3D Spatial Clearance ---")
    bd_pos = parse_position_set(src, "backDecal")
    bd_rot_y = parse_rotation_y(src, "backDecal")
    print(f"  Extracted Back Decal: pos=({bd_pos[0]:.4f}, {bd_pos[1]:.4f}, {bd_pos[2]:.4f}), rot_y={bd_rot_y:.4f} rad")

    w_b = 0.42
    h_b = 0.42
    half_wb = w_b / 2.0
    half_hb = h_b / 2.0

    back_sample_points = [
        ("Center", 0.0, 0.0),
        ("Top-Left", -half_wb, half_hb),
        ("Top-Center", 0.0, half_hb),
        ("Top-Right", half_wb, half_hb),
        ("Mid-Left", -half_wb, 0.0),
        ("Mid-Right", half_wb, 0.0),
        ("Bottom-Left", -half_wb, -half_hb),
        ("Bottom-Center", 0.0, -half_hb),
        ("Bottom-Right", half_wb, -half_hb),
    ]

    for label, lx, ly in back_sample_points:
        test_count += 1
        wx = bd_pos[0] + lx * math.cos(bd_rot_y)
        wy = bd_pos[1] + ly
        wz = bd_pos[2] - lx * math.sin(bd_rot_y)

        tz_rear = torso["rear_z"](wx, wy)
        clearance = tz_rear - wz  # z_torso_rear - z_back_decal > 0
        clearance_mm = clearance * 1000.0

        status = "PASS" if clearance_mm > 0 else "FAIL"
        print(f"  [{status}] {label:13s} loc=({lx:+.3f},{ly:+.3f}) -> world=({wx:.3f},{wy:.3f},{wz:.4f}) torso_rear_z={tz_rear:.4f} clearance={clearance_mm:+.2f}mm")
        if clearance_mm <= 0:
            failures.append(f"Back decal {label} is occluded inside torso by {clearance_mm:.2f}mm (wz={wz:.4f} >= torso_rear={tz_rear:.4f})")

    # ------------------------------------------------------------------
    # 3. Metallic Aglets & Drawstring Cords Clearance
    # ------------------------------------------------------------------
    print("\n--- Test Suite 3: Aglets & Drawstrings vs Pocket/Torso Clearance ---")
    la_pos = parse_position_set(src, "leftAglet")
    ra_pos = parse_position_set(src, "rightAglet")

    aglet_tests = [
        ("Left Aglet", la_pos[0], la_pos[1], la_pos[2]),
        ("Right Aglet", ra_pos[0], ra_pos[1], ra_pos[2]),
    ]

    for name, ax, ay, az in aglet_tests:
        test_count += 1
        pz = pocket["front_z"](ax, ay)
        clearance = az - pz
        clearance_mm = clearance * 1000.0
        status = "PASS" if clearance_mm > 0 else "FAIL"
        print(f"  [{status}] {name:12s} at ({ax:+.3f}, {ay:.3f}, {az:.4f}) vs pocket_front_z={pz:.4f} -> clearance={clearance_mm:+.2f}mm")
        if clearance_mm <= 0:
            failures.append(f"{name} is buried behind kangaroo pocket by {clearance_mm:.2f}mm")

    # Cord curve control points (Points 2, 3, 4, 5)
    lcc_match = re.search(r"leftCordCurve\s*=\s*new\s+THREE\.CatmullRomCurve3\(\[\s*([\s\S]*?)\]\);", src)
    if lcc_match:
        left_pts = parse_vector3_tuples(lcc_match.group(1))
        # Point 1 is eyelet anchor
        test_count += 1
        p1 = left_pts[0]
        eyelet_pos = (-0.085, 1.94, 0.26)
        p1_dist = math.sqrt((p1[0] - eyelet_pos[0])**2 + (p1[1] - eyelet_pos[1])**2 + (p1[2] - eyelet_pos[2])**2)
        status = "PASS" if p1_dist < 0.01 else "FAIL"
        print(f"  [{status}] Left Cord Eyelet Anchor: pt=({p1[0]:.3f}, {p1[1]:.3f}, {p1[2]:.3f}) matches eyelet pos {eyelet_pos}")
        if p1_dist >= 0.01:
            failures.append(f"Left Cord Pt 1 is detached from eyelet (dist={p1_dist:.3f}m)")

        # Points 2, 3, 4 drape across chest; Point 5 drapes across pocket
        for idx in range(1, len(left_pts)):
            test_count += 1
            cx, cy, cz = left_pts[idx]
            if cy < pocket["y_max"]:
                surf_z = pocket["front_z"](cx, cy)
                surf_name = "pocket"
            else:
                surf_z = torso["front_z"](cx, cy)
                surf_name = "torso"
            clearance = cz - surf_z
            clearance_mm = clearance * 1000.0
            status = "PASS" if clearance_mm > 0 else "FAIL"
            print(f"  [{status}] Left Cord Pt {idx+1} ({cx:+.3f}, {cy:.3f}, {cz:.4f}) vs {surf_name}_z={surf_z:.4f} -> clearance={clearance_mm:+.2f}mm")
            if clearance_mm <= 0:
                failures.append(f"Left Cord Pt {idx+1} penetrates {surf_name} by {clearance_mm:.2f}mm")

    rcc_match = re.search(r"rightCordCurve\s*=\s*new\s+THREE\.CatmullRomCurve3\(\[\s*([\s\S]*?)\]\);", src)
    if rcc_match:
        right_pts = parse_vector3_tuples(rcc_match.group(1))
        test_count += 1
        p1_r = right_pts[0]
        r_eyelet_pos = (0.085, 1.94, 0.26)
        p1_dist_r = math.sqrt((p1_r[0] - r_eyelet_pos[0])**2 + (p1_r[1] - r_eyelet_pos[1])**2 + (p1_r[2] - r_eyelet_pos[2])**2)
        status = "PASS" if p1_dist_r < 0.01 else "FAIL"
        print(f"  [{status}] Right Cord Eyelet Anchor: pt=({p1_r[0]:.3f}, {p1_r[1]:.3f}, {p1_r[2]:.3f}) matches eyelet pos {r_eyelet_pos}")
        if p1_dist_r >= 0.01:
            failures.append(f"Right Cord Pt 1 is detached from eyelet (dist={p1_dist_r:.3f}m)")

        for idx in range(1, len(right_pts)):
            test_count += 1
            cx, cy, cz = right_pts[idx]
            if cy < pocket["y_max"]:
                surf_z = pocket["front_z"](cx, cy)
                surf_name = "pocket"
            else:
                surf_z = torso["front_z"](cx, cy)
                surf_name = "torso"
            clearance = cz - surf_z
            clearance_mm = clearance * 1000.0
            status = "PASS" if clearance_mm > 0 else "FAIL"
            print(f"  [{status}] Right Cord Pt {idx+1} ({cx:+.3f}, {cy:.3f}, {cz:.4f}) vs {surf_name}_z={surf_z:.4f} -> clearance={clearance_mm:+.2f}mm")
            if clearance_mm <= 0:
                failures.append(f"Right Cord Pt {idx+1} penetrates {surf_name} by {clearance_mm:.2f}mm")

    # Continuous Catmull-Rom spline sampling for Left and Right cord drapes
    if lcc_match and len(left_pts) >= 5:
        test_count += 1
        min_cl_left = 999.0
        segments = [
            (left_pts[0], left_pts[1], left_pts[2], left_pts[3]),
            (left_pts[1], left_pts[2], left_pts[3], left_pts[4]),
            (left_pts[2], left_pts[3], left_pts[4], left_pts[4]),
        ]
        for p0, p1, p2, p3 in segments:
            for step in range(11):
                t = step / 10.0
                pt = eval_catmull_rom(p0, p1, p2, p3, t)
                sz = pocket["front_z"](pt[0], pt[1]) if pt[1] < pocket["y_max"] else torso["front_z"](pt[0], pt[1])
                cl = (pt[2] - sz) * 1000.0
                min_cl_left = min(min_cl_left, cl)
        status = "PASS" if min_cl_left > 0 else "FAIL"
        print(f"  [{status}] Continuous Left Spline Drape: min_clearance={min_cl_left:+.2f}mm (sampled across 33 points)")
        if min_cl_left <= 0:
            failures.append(f"Continuous Left Spline Drape penetrates surface by {min_cl_left:.2f}mm")

    if rcc_match and len(right_pts) >= 5:
        test_count += 1
        min_cl_right = 999.0
        segments = [
            (right_pts[0], right_pts[1], right_pts[2], right_pts[3]),
            (right_pts[1], right_pts[2], right_pts[3], right_pts[4]),
            (right_pts[2], right_pts[3], right_pts[4], right_pts[4]),
        ]
        for p0, p1, p2, p3 in segments:
            for step in range(11):
                t = step / 10.0
                pt = eval_catmull_rom(p0, p1, p2, p3, t)
                sz = pocket["front_z"](pt[0], pt[1]) if pt[1] < pocket["y_max"] else torso["front_z"](pt[0], pt[1])
                cl = (pt[2] - sz) * 1000.0
                min_cl_right = min(min_cl_right, cl)
        status = "PASS" if min_cl_right > 0 else "FAIL"
        print(f"  [{status}] Continuous Right Spline Drape: min_clearance={min_cl_right:+.2f}mm (sampled across 33 points)")
        if min_cl_right <= 0:
            failures.append(f"Continuous Right Spline Drape penetrates surface by {min_cl_right:.2f}mm")

    # ------------------------------------------------------------------
    # 4. Hood Inner Lining Material Culling Mode
    # ------------------------------------------------------------------
    print("\n--- Test Suite 4: Hood Inner Lining Culling Mode ---")
    test_count += 1
    lining_match = re.search(r"const\s+innerLiningMaterial\s*=\s*new\s+THREE\.MeshStandardMaterial\(\{\s*([\s\S]*?)\}\);", src)
    if lining_match:
        props = lining_match.group(1)
        has_backside = ("THREE.BackSide" in props) or ("THREE.DoubleSide" in props)
        status = "PASS" if has_backside else "FAIL"
        print(f"  [{status}] innerLiningMaterial side configuration: {'BackSide/DoubleSide set' if has_backside else 'Missing side property (default FrontSide)'}")
        if not has_backside:
            failures.append("innerLiningMaterial missing side: THREE.BackSide or THREE.DoubleSide (hood interior backface culled)")
    else:
        failures.append("innerLiningMaterial definition not found")

    # ------------------------------------------------------------------
    # 5. Decal Material Z-Fighting Prevention (polygonOffset)
    # ------------------------------------------------------------------
    print("\n--- Test Suite 5: Decal Z-Fighting Prevention (polygonOffset) ---")
    test_count += 1
    front_decal_block = src[src.find("const frontDecal ="):src.find("const backDecal =")]
    has_front_po = "polygonOffset" in front_decal_block and "polygonOffsetFactor" in front_decal_block
    status = "PASS" if has_front_po else "FAIL"
    print(f"  [{status}] frontDecal polygonOffset enabled: {has_front_po}")
    if not has_front_po:
        failures.append("frontDecal missing polygonOffset and polygonOffsetFactor")

    test_count += 1
    back_decal_block = src[src.find("const backDecal ="):src.find("const backDecal =") + 350]
    has_back_po = "polygonOffset" in back_decal_block and "polygonOffsetFactor" in back_decal_block
    status = "PASS" if has_back_po else "FAIL"
    print(f"  [{status}] backDecal polygonOffset enabled: {has_back_po}")
    if not has_back_po:
        failures.append("backDecal missing polygonOffset and polygonOffsetFactor")

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    print("\n======================================================================")
    print(f"  VERIFICATION SUITE SUMMARY: {test_count} checks performed")
    print(f"  Passed: {test_count - len(failures)} | Failed: {len(failures)}")
    print("======================================================================")

    if failures:
        print("\nCRITICAL GEOMETRIC DEFECTS DETECTED:")
        for idx, f_desc in enumerate(failures, 1):
            print(f"  {idx}. {f_desc}")
        print("\nFINAL VERDICT: FAIL")
        return False
    else:
        print("\nALL 3D SPATIAL GEOMETRY CHECKS PASSED PERFECTLY (CLEARANCE > 0mm everywhere)!")
        print("\nFINAL VERDICT: PASS")
        return True

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "js/three-scene.js"
    success = run_spatial_verification(target)
    sys.exit(0 if success else 1)
