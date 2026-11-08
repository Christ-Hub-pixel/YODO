#!/usr/bin/env python3
"""
Stress test script for viewports 320px to 2560px:
- Evaluates CSS layout for #hero-stage across viewport widths [320px ... 2560px]
- Tests camera distance formula, vertical/horizontal visible span
- Tests boundary conditions, extreme zoom levels, extreme aspect ratios
- Verifies clipping avoidance for 3D garment & pedestal
- Analyzes DPR clamping (1.25 mobile vs 1.5 desktop) and DPR handling
"""
import math

# Model geometry parameters from js/three-scene.js
PEDESTAL_RADIUS = 0.92       # CylinderGeometry(0.85, 0.92, 0.06) -> base radius 0.92
PEDESTAL_DIAMETER = PEDESTAL_RADIUS * 2.0 # 1.84m
SLEEVE_HALF_SPAN = 0.66 + 0.155 + 0.022 # Elbow point + torus fold ~ 0.837m
MAX_MODEL_HALF_SPAN = max(PEDESTAL_RADIUS, SLEEVE_HALF_SPAN) # 0.92m
MAX_MODEL_WIDTH = MAX_MODEL_HALF_SPAN * 2.0 # 1.84m

# Vertical geometry
MODEL_BASE_Y = 0.00          # Bottom of pedestal baseDisc
MODEL_HOOD_TOP_Y = 2.14 + (0.38 * 1.06) # Hood cowl center + radius ~ 2.543m
MODEL_HEIGHT = MODEL_HOOD_TOP_Y - MODEL_BASE_Y # ~ 2.543m
CAMERA_TARGET_Y = 1.48

# Camera optical parameters
FOV_DEG = 36.0
FOV_RAD = math.radians(FOV_DEG)
HALF_FOV_RAD = FOV_RAD / 2.0
TAN_HALF_FOV = math.tan(HALF_FOV_RAD) # tan(18 deg) ~ 0.3249196962329063

def compute_stage_layout(viewport_w, viewport_h=800):
    """
    Computes CSS dimensions (width, height) of #hero-stage according to style.css.
    """
    if viewport_w <= 700:
        # @media (max-width: 700px):
        # .hero { padding: 0; grid-template-columns: 1fr; }
        # .hero-stage { min-height: 410px; height: 112vw; max-height: 530px; margin: 0 12px 12px; }
        stage_w = viewport_w - 24.0
        computed_h = 1.12 * viewport_w
        stage_h = min(530.0, max(410.0, computed_h))
    elif viewport_w <= 1000:
        # @media (max-width: 1000px):
        # .hero { padding-inline: 24px; grid-template-columns: .95fr 1.05fr; min-height: 570px; }
        # .hero-stage { min-height: 500px; height: 540px; }
        inner_w = viewport_w - 48.0
        stage_w = inner_w * (1.05 / 2.0)
        stage_h = 540.0
    else:
        # Default desktop:
        # .hero { padding-inline: max(44px, calc((100% - 1440px) / 2)); grid-template-columns: .9fr 1.1fr; }
        # .hero-stage { min-height: 555px; height: min(620px, calc(100svh - 160px)); }
        # @media (min-width: 1500px): .hero-stage { height: 650px; }
        pad = max(44.0, (viewport_w - 1440.0) / 2.0)
        inner_w = viewport_w - 2.0 * pad
        stage_w = inner_w * (1.1 / 2.0)
        if viewport_w >= 1500:
            stage_h = 650.0
        else:
            stage_h = min(620.0, max(555.0, viewport_h - 160.0))
    return stage_w, stage_h

def compute_camera_optics(stage_w, stage_h, zoom_offset=0.0):
    """
    Executes the three-scene.js updateCamera() logic.
    """
    aspect = stage_w / stage_h
    baseDistance = max(4.6, 4.6 / min(1.0, aspect))
    z = min(9.5, max(3.2, baseDistance - zoom_offset))

    # Visible spans at target distance z (since camera is at (0, 1.48, z) and target is (0, 1.48, 0))
    v_span = 2.0 * z * TAN_HALF_FOV
    h_span = v_span * aspect

    # Distance from target Y to top and bottom of model
    top_dist = MODEL_HOOD_TOP_Y - CAMERA_TARGET_Y   # 2.543 - 1.48 = 1.063m
    bottom_dist = CAMERA_TARGET_Y - MODEL_BASE_Y   # 1.48 - 0.00 = 1.480m
    max_half_v = max(top_dist, bottom_dist)         # 1.480m

    half_v_span = v_span / 2.0
    half_h_span = h_span / 2.0

    v_margin = half_v_span - max_half_v
    h_margin = half_h_span - MAX_MODEL_HALF_SPAN

    is_v_clipped = v_margin < 0
    is_h_clipped = h_margin < 0

    return {
        "aspect": aspect,
        "baseDistance": baseDistance,
        "z": z,
        "v_span": v_span,
        "h_span": h_span,
        "half_v_span": half_v_span,
        "half_h_span": half_h_span,
        "v_margin": v_margin,
        "h_margin": h_margin,
        "is_clipped": is_v_clipped or is_h_clipped,
        "is_v_clipped": is_v_clipped,
        "is_h_clipped": is_h_clipped,
    }

def compute_dpr_clamping(stage_w, dpr=2.0):
    is_mobile = stage_w < 600.0
    clamp_limit = 1.25 if is_mobile else 1.5
    effective_dpr = min(dpr, clamp_limit)
    return is_mobile, clamp_limit, effective_dpr

def run_stress_tests():
    print("=" * 80)
    print("EMPIRICAL STRESS TEST SUITE: VIEWPORTS 320px TO 2560px")
    print("=" * 80)

    # Test cases covering key viewports, breakpoints, and extremes
    viewports = [
        320, 360, 375, 390, 414, 480, 540, 599, 600, 601,
        650, 699, 700, 701, 720, 768, 800, 850, 900, 999, 1000, 1001,
        1024, 1100, 1200, 1280, 1366, 1440, 1500, 1600, 1920, 2160, 2560
    ]

    failures = []
    anomalies = []

    print(f"{'V_W':>5} | {'Stage (WxH)':>15} | {'Aspect':>7} | {'baseDist':>8} | {'z':>6} | {'H_Span':>7} | {'V_Span':>7} | {'H_Margin':>8} | {'V_Margin':>8} | {'DPR Clamp':>9} | {'Clipped?'}")
    print("-" * 115)

    for vw in viewports:
        stage_w, stage_h = compute_stage_layout(vw)
        optics = compute_camera_optics(stage_w, stage_h, zoom_offset=0.0)
        is_mobile, clamp_limit, eff_dpr = compute_dpr_clamping(stage_w, dpr=2.0)

        clipped_str = "PASS" if not optics["is_clipped"] else "FAIL (CLIPPED)"
        if optics["is_clipped"]:
            failures.append((vw, "Clipping detected", optics))

        # Check DPR anomaly: does a desktop viewport get labeled as mobile?
        is_desktop_viewport = vw > 700
        if is_desktop_viewport and is_mobile:
            anomalies.append((vw, f"Desktop viewport {vw}px has stage_w={stage_w:.1f}px < 600, so isMobile=True (DPR clamped to 1.25 instead of 1.5)"))
        elif not is_desktop_viewport and not is_mobile:
            anomalies.append((vw, f"Mobile viewport {vw}px has stage_w={stage_w:.1f}px >= 600, so isMobile=False (DPR clamped to 1.5 instead of 1.25)"))

        print(f"{vw:5d} | {stage_w:7.1f}x{stage_h:5.1f} | {optics['aspect']:7.3f} | {optics['baseDistance']:8.3f} | {optics['z']:6.3f} | {optics['h_span']:7.3f} | {optics['v_span']:7.3f} | {optics['h_margin']:+8.3f}m | {optics['v_margin']:+8.3f}m | {clamp_limit:9.2f} | {clipped_str}")

    print("\n" + "=" * 80)
    print("STRESS TEST: CONTINUOUS HORIZONTAL SPAN INVARIANCE (aspect < 1.0)")
    print("=" * 80)
    # Test aspect ratios from 0.40 to 0.99
    portrait_aspects = [0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 0.99]
    h_spans = []
    for asp in portrait_aspects:
        # Fixed height 500
        w = 500.0 * asp
        opt = compute_camera_optics(w, 500.0, zoom_offset=0.0)
        h_spans.append(opt["h_span"])
        print(f"Aspect {asp:.2f}: baseDistance={opt['baseDistance']:.4f}, H_span={opt['h_span']:.5f}m, V_span={opt['v_span']:.5f}m")

    span_spread = max(h_spans) - min(h_spans)
    print(f"\nHorizontal Span Invariance Spread across portrait aspects: {span_spread:.8f}m")
    if span_spread < 1e-6:
        print("  [PASS] Horizontal visible span is mathematically invariant (constant 2.98926m) for all aspect < 1.0!")
    else:
        print(f"  [FAIL] Horizontal span is not invariant: spread={span_spread}")

    print("\n" + "=" * 80)
    print("STRESS TEST: EXTREME ZOOM LEVELS & CLAMPING")
    print("=" * 80)
    # Test zoom offsets from -2.5 to +3.0 across sample viewports (320px, 768px, 1440px)
    zoom_levels = [-2.5, -1.8, -1.0, 0.0, 1.0, 2.0, 2.2, 2.8, 3.5]
    for vw in [320, 768, 1440]:
        stage_w, stage_h = compute_stage_layout(vw)
        print(f"\nViewport {vw}px (stage {stage_w:.1f}x{stage_h:.1f}):")
        for z_off in zoom_levels:
            # Note: in three-scene.js: currentZoomOffset is clamped to [-1.8, 2.2]
            clamped_zoom_off = min(2.2, max(-1.8, z_off))
            opt = compute_camera_optics(stage_w, stage_h, zoom_offset=clamped_zoom_off)
            print(f"  Requested zoom_off={z_off:+4.1f} -> Clamped={clamped_zoom_off:+4.1f} -> z={opt['z']:.3f} (H_span={opt['h_span']:.2f}m, V_span={opt['v_span']:.2f}m, H_margin={opt['h_margin']:+5.2f}m)")

    print("\n" + "=" * 80)
    print("STRESS TEST: DPR CLAMPING MATRIX")
    print("=" * 80)
    dpr_inputs = [0.5, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0]
    test_stages = [("Mobile 320px", 296.0), ("Mobile 650px", 626.0), ("Tablet 768px", 378.0), ("Desktop 1024px", 514.8), ("Desktop 1440px", 743.6)]
    for name, sw in test_stages:
        print(f"\nStage: {name} (width={sw:.1f}px):")
        for dpr in dpr_inputs:
            is_m, clamp_lim, eff = compute_dpr_clamping(sw, dpr)
            print(f"  devicePixelRatio={dpr:4.2f} -> isMobile={str(is_m):<5} (clamp={clamp_lim:.2f}) -> effectivePixelRatio={eff:.2f}")

    print("\n" + "=" * 80)
    print("SUMMARY OF EMPIRICAL FINDINGS")
    print("=" * 80)
    print(f"Total clipping failures: {len(failures)}")
    if failures:
        for f in failures:
            print(f"  FAILED: {f}")
    else:
        print("  [PASS] Zero clipping across all standard viewports [320px ... 2560px] at base zoom!")

    print(f"\nDPR Classification Anomalies: {len(anomalies)}")
    for a in anomalies:
        print(f"  [ANOMALY] {a[1]}")

    return len(failures) == 0

if __name__ == "__main__":
    success = run_stress_tests()
    if not success:
        exit(1)
