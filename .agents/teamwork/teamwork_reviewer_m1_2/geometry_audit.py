#!/usr/bin/env python3
"""
Independent 3D Geometry and Spatial Clearance Audit for Milestone 1
Validates mesh coordinates, occlusion, backface culling, and spatial collisions in js/three-scene.js.
"""

import math
import sys

def audit_three_scene():
    print("=== INDEPENDENT 3D GEOMETRY AUDIT: js/three-scene.js ===")

    # 1. Torso Geometry Parameters
    # CylinderGeometry(0.46, 0.41, 0.86, 36, 12) at position (0, 1.49, 0), scale (1.18, 1.0, 0.80)
    torso_y_center = 1.49
    torso_height = 0.86
    torso_y_min = torso_y_center - torso_height / 2.0  # 1.06
    torso_y_max = torso_y_center + torso_height / 2.0  # 1.92
    r_top = 0.46
    r_bot = 0.41
    scale_x = 1.18
    scale_z = 0.80

    def torso_radius_at(y):
        t = (y - torso_y_min) / torso_height
        return r_bot + t * (r_top - r_bot)

    def torso_surface_z(x, y):
        r = torso_radius_at(y)
        a = r * scale_x
        b = r * scale_z
        if abs(x) > a:
            return 0.0
        return b * math.sqrt(max(0.0, 1.0 - (x / a) ** 2))

    # 2. Audit Front Decal
    # frontDecal: PlaneGeometry(0.18, 0.09) at (-0.16, 1.70, 0.332), rotation.y = 0.12
    print("\n--- 1. Front Brand Decal Clearance ---")
    decal_center_x = -0.16
    decal_center_y = 1.70
    decal_center_z = 0.332
    rot_y = 0.12
    half_w = 0.18 / 2.0  # 0.09
    half_h = 0.09 / 2.0  # 0.045

    front_penetrations = []
    # Test 5 sample points across decal width
    for s in [-1.0, -0.5, 0.0, 0.5, 1.0]:
        local_x = s * half_w
        world_x = decal_center_x + local_x * math.cos(rot_y)
        world_y = decal_center_y
        world_z = decal_center_z - local_x * math.sin(rot_y)
        surface_z = torso_surface_z(world_x, world_y)
        clearance = world_z - surface_z  # positive = in front, negative = buried inside
        if clearance < 0:
            front_penetrations.append((world_x, world_z, surface_z, clearance))
        print(f"  Front Decal (x_offset={local_x:+.3f}m): world_z={world_z:.4f}m vs torso_z={surface_z:.4f}m -> clearance={clearance*1000:+.1f}mm")

    if front_penetrations:
        print(f"  [CRITICAL DEFECT] Front decal penetrates into torso mesh by up to {min(p[3] for p in front_penetrations)*1000:.1f}mm!")
    else:
        print("  [PASS] Front decal is fully in front of torso.")

    # 3. Audit Back Decal
    # backDecal: PlaneGeometry(0.42, 0.42) at (0, 1.62, -0.332), rotation.y = Math.PI
    print("\n--- 2. Back Brand Decal Clearance ---")
    back_center_x = 0.0
    back_center_y = 1.62
    back_center_z = -0.332
    back_half_w = 0.42 / 2.0  # 0.21
    back_half_h = 0.42 / 2.0  # 0.21

    back_penetrations = []
    for sx in [-1.0, 0.0, 1.0]:
        for sy in [-1.0, 0.0, 1.0]:
            world_x = back_center_x + sx * back_half_w
            world_y = back_center_y + sy * back_half_h
            world_z = back_center_z
            surface_z = -torso_surface_z(world_x, world_y)  # negative Z on back
            # When looking from back (negative Z), camera is at -4.6.
            # Point closer to camera has SMALLER (more negative) Z.
            # Decal is at -0.332. Torso is at -0.354.
            # Since -0.354 < -0.332, torso is CLOSER to camera than decal!
            # Clearance = decal_z - surface_z (if > 0, decal is inside torso).
            penetration = world_z - surface_z
            if penetration > 0:
                back_penetrations.append((world_x, world_y, world_z, surface_z, penetration))
            print(f"  Back Decal (dx={sx*back_half_w:+.2f}, dy={sy*back_half_h:+.2f}): world_z={world_z:.4f}m vs torso_back_z={surface_z:.4f}m -> buried by={penetration*1000:+.1f}mm")

    if back_penetrations:
        print(f"  [CRITICAL DEFECT] Back decal is buried inside torso mesh by up to {max(p[4] for p in back_penetrations)*1000:.1f}mm!")
    else:
        print("  [PASS] Back decal is fully behind torso.")

    # 4. Audit Aglets vs Kangaroo Pocket
    # pocket: CylinderGeometry(0.43, 0.45, 0.28) at (0, 1.25, 0.03), scale (1.19, 1.0, 0.82)
    # leftAglet: at (-0.12, 1.25, 0.32)
    # rightAglet: at (0.13, 1.21, 0.32)
    print("\n--- 3. Drawstrings & Metallic Aglets vs Kangaroo Pocket Clearance ---")
    pocket_y_center = 1.25
    pocket_height = 0.28
    pocket_r_top = 0.43
    pocket_r_bot = 0.45
    pocket_scale_x = 1.19
    pocket_scale_z = 0.82
    pocket_z_offset = 0.03

    def pocket_surface_z(x, y):
        local_y = y - pocket_y_center
        t = (local_y + pocket_height / 2.0) / pocket_height
        r = pocket_r_bot + t * (pocket_r_top - pocket_r_bot)
        a = r * pocket_scale_x
        b = r * pocket_scale_z
        if abs(x) > a:
            return 0.0
        return pocket_z_offset + b * math.sqrt(max(0.0, 1.0 - (x / a) ** 2))

    aglet_occlusions = []
    aglets = [("Left Aglet", -0.12, 1.25, 0.32), ("Right Aglet", 0.13, 1.21, 0.32)]
    for name, ax, ay, az in aglets:
        pz = pocket_surface_z(ax, ay)
        clearance = az - pz
        if clearance < 0:
            aglet_occlusions.append((name, ax, ay, az, pz, clearance))
        print(f"  {name} at ({ax:.2f}, {ay:.2f}, {az:.2f}): pocket_front_z={pz:.4f}m -> clearance={clearance*1000:+.1f}mm")

    if aglet_occlusions:
        print(f"  [CRITICAL DEFECT] Aglets are buried behind kangaroo pocket by up to {min(a[5] for a in aglet_occlusions)*1000:.1f}mm!")
    else:
        print("  [PASS] Aglets are positioned in front of kangaroo pocket.")

    # 5. Audit Hood Lining Material Culling
    print("\n--- 4. Hood Interior Material Backface Culling ---")
    with open("js/three-scene.js", "r", encoding="utf-8") as f:
        src = f.read()

    lining_block = src[src.find("innerLiningMaterial ="):src.find("innerLiningMaterial =") + 250]
    has_backside = "THREE.BackSide" in lining_block or "THREE.DoubleSide" in lining_block
    if not has_backside:
        print("  [CRITICAL DEFECT] innerLiningMaterial has default THREE.FrontSide! Interior of hood will be backface-culled and transparent when viewed through face opening.")
    else:
        print("  [PASS] innerLiningMaterial properly specifies BackSide or DoubleSide.")

    # 6. Summary Verdict
    print("\n=== AUDIT SUMMARY ===")
    total_defects = len(front_penetrations) + len(back_penetrations) + len(aglet_occlusions) + (0 if has_backside else 1)
    if total_defects > 0:
        print(f"TOTAL CRITICAL GEOMETRIC DEFECTS FOUND: {total_defects}")
        print("VERDICT: REQUEST_CHANGES (INTEGRITY VIOLATION: Self-certifying claims contradicted by 3D geometry)")
        return False
    else:
        print("All geometric checks passed!")
        return True

if __name__ == "__main__":
    success = audit_three_scene()
    if not success:
        sys.exit(1)
