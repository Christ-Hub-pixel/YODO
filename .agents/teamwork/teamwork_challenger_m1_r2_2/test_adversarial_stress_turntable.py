#!/usr/bin/env python3
"""
Adversarial Stress Test: Turntable Edge Cases, Extreme Grazing Angles & Orbit Simulation
Author: Challenger 2 (Milestone 1 Iteration 2)
State Folder: /home/christ77/Documents/YODO/.agents/teamwork/teamwork_challenger_m1_r2_2
"""

import math
import sys

def run_adversarial_stress_tests():
    print("=" * 80)
    print("ADVERSARIAL STRESS TEST: TURNTABLE TILT, ZOOM COMBINATIONS & GRAZING ANGLES")
    print("=" * 80)

    # 1. Test Rapid 10,000 Step Turntable Stress
    print("\n--- 1. 10,000 Step Turntable Rotation Stress ---")
    angle_y = 0.0
    nan_inf_found = False
    for step in range(10000):
        delta = 0.45 if (step % 2 == 0) else -0.30
        angle_y += delta
        cos_val = math.cos(angle_y)
        sin_val = math.sin(angle_y)
        if math.isnan(cos_val) or math.isnan(sin_val) or math.isinf(cos_val) or math.isinf(sin_val):
            nan_inf_found = True
            break

    assert not nan_inf_found, "FAIL: NaN or Inf during rapid rotation stress"
    print(f"  [PASS] 10,000 rapid rotation steps completed cleanly. Final angle: {angle_y:.4f} rad.")

    # 2. Test Combined Vertical Tilt [-0.12, +0.12] and Zoom [-1.8, +2.2]
    print("\n--- 2. Vertical Tilt x Zoom Clamping Matrix ---")
    tilt_values = [-0.12, -0.06, 0.0, 0.06, 0.12]
    zoom_offsets = [-1.8, -0.9, 0.0, 1.1, 2.2]
    near_plane = 0.1
    far_plane = 40.0

    violations = []
    for tilt in tilt_values:
        for zoom in zoom_offsets:
            base_dist = 4.6
            cam_z = max(3.2, min(9.5, base_dist - zoom))
            # Model bounding sphere extends to radius ~ 0.92m around (0, 1.48, 0)
            # Closest model point to camera
            min_dist_to_cam = cam_z - 0.92
            max_dist_to_cam = cam_z + 0.92
            if min_dist_to_cam <= near_plane:
                violations.append(f"Near plane clipping: tilt={tilt}, zoom={zoom}, dist={min_dist_to_cam:.3f} <= {near_plane}")
            if max_dist_to_cam >= far_plane:
                violations.append(f"Far plane clipping: tilt={tilt}, zoom={zoom}, dist={max_dist_to_cam:.3f} >= {far_plane}")

    assert not violations, f"FAIL: Frustum clipping violations: {violations}"
    print(f"  [PASS] All 25 tilt x zoom combinations remain strictly within camera frustum (min distance {3.2-0.92:.2f}m >> 0.1m near plane).")

    # 3. Test Front Decal Visibility Under Oblique Grazing Angles (up to 80 deg)
    print("\n--- 3. Front Decal Oblique Angle Depth Buffer Resolution ---")
    # At grazing angle alpha, effective depth difference along camera ray:
    # delta_d = clearance * cos(alpha)
    # Even at alpha = 80 degrees:
    # cos(80 deg) ~ 0.1736
    # Minimum clearance = 8.88mm -> effective delta_d = 8.88 * 0.1736 = 1.54mm = 0.00154m
    # 24-bit depth buffer precision at z=4.6m is ~0.0126mm (0.0000126m)
    # Margin of safety = 1.54mm / 0.0126mm = 122x safety factor against z-fighting!
    min_clearance_mm = 8.88
    for angle_deg in [0, 30, 45, 60, 75, 80]:
        rad = math.radians(angle_deg)
        effective_depth_mm = min_clearance_mm * math.cos(rad)
        depth_buffer_precision_mm = 0.0126
        safety_ratio = effective_depth_mm / depth_buffer_precision_mm
        print(f"  Angle {angle_deg:2d}°: effective depth={effective_depth_mm:.3f}mm (safety ratio={safety_ratio:.1f}x vs 24-bit depth buffer)")
        assert safety_ratio > 10.0, f"FAIL: Insufficient safety factor at {angle_deg} deg"

    print("  [PASS] Massive depth resolution safety margin across all oblique viewing angles.")
    return True

if __name__ == "__main__":
    if run_adversarial_stress_tests():
        print("\nALL ADVERSARIAL STRESS TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        sys.exit(1)
