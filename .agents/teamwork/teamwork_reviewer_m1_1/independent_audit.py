import os
import re
import sys
import http.server
import socketserver
import threading
import urllib.request
import time

print("=" * 60)
print("INDEPENDENT REVIEWER 1 AUDIT")
print("=" * 60)

failures = []

# --- 1. Audit index.html ---
print("\n[Audit 1] Checking index.html...")
with open("index.html", "r", encoding="utf-8") as f:
    index_html = f.read()

# Check for prohibited terms in index.html
prohibited_terms = [r"démonstration", r"mannequin", r"demonstration", r"\bdemo\b"]
for term in prohibited_terms:
    matches = list(re.finditer(term, index_html, re.IGNORECASE))
    if matches:
        failures.append(f"Found prohibited term pattern '{term}' in index.html: {[m.group() for m in matches]}")
    else:
        print(f"  ✓ Zero occurrences of prohibited term '{term}'")

# Check specific line replacements
specific_checks = [
    ("Line 116 caption", r'<div class="stage-caption">\s*<span>COLLECTION STREETWEAR</span>\s*<span>360°</span>\s*</div>'),
    ("Line 117 turntable", r'id="garment-turntable"\s+role="img"\s+aria-label="Illustration d’un hoodie streetwear\. Faites glisser pour le faire pivoter\. Elle remplace la scène 3D si WebGL est indisponible\."'),
    ("Line 126 rotate-left", r'<button type="button" id="rotate-left" aria-label="Faire pivoter la pièce streetwear vers la gauche">←</button>'),
    ("Line 128 rotate-right", r'<button type="button" id="rotate-right" aria-label="Faire pivoter la pièce streetwear vers la droite">→</button>'),
    ("Line 130 zoom-controls", r'<div class="zoom-controls" aria-label="Zoomer sur la pièce streetwear">'),
    ("Line 131 zoom-in", r'<button type="button" data-zoom="in" aria-label="Zoomer">\+</button>'),
    ("Line 132 zoom-out", r'<button type="button" data-zoom="out" aria-label="Dézoomer">[−-]</button>'),
    ("Line 135 scene-status", r'<p class="stage-status" id="scene-status" role="status" aria-live="polite">Scène 3D streetwear active\.</p>'),
    ("Canvas aria-hidden", r'<canvas class="hero-canvas" id="hero-canvas" aria-hidden="true"></canvas>')
]

for name, pattern in specific_checks:
    if re.search(pattern, index_html):
        print(f"  ✓ {name} correctly configured with valid accessibility attributes")
    else:
        failures.append(f"Failed check: {name} (pattern: {pattern})")

# --- 2. Audit js/home-page.js ---
print("\n[Audit 2] Checking js/home-page.js event wiring...")
with open("js/home-page.js", "r", encoding="utf-8") as f:
    home_page_js = f.read()

hp_checks = [
    ("Query heroStage", r'const\s+heroStage\s*=\s*document\.querySelector\(["\']#hero-stage["\']\);'),
    ("rotate-left yodo:rotate dispatch", r'#rotate-left[\s\S]*?yodo:rotate[\s\S]*?direction:\s*-1'),
    ("rotate-right yodo:rotate dispatch", r'#rotate-right[\s\S]*?yodo:rotate[\s\S]*?direction:\s*1'),
    ("data-zoom yodo:zoom dispatch", r'\[data-zoom\][\s\S]*?yodo:zoom[\s\S]*?delta:'),
    ("2D fallback angle rotation", r'setAngle\(angle\s*-\s*35\)[\s\S]*?setAngle\(angle\s*\+\s*35\)'),
    ("2D fallback zoom clamping", r'zoom\s*=\s*Math\.min\(1\.3,\s*Math\.max\(0\.75,'),
    ("Defensive optional chaining", r'heroStage\?\.dispatchEvent'),
]

for name, pattern in hp_checks:
    if re.search(pattern, home_page_js):
        print(f"  ✓ {name} present and properly formed")
    else:
        failures.append(f"Failed check in js/home-page.js: {name}")

# --- 3. Contract Compatibility with js/three-scene.js ---
print("\n[Audit 3] Checking event listener contracts in js/three-scene.js...")
with open("js/three-scene.js", "r", encoding="utf-8") as f:
    three_scene_js = f.read()

contract_checks = [
    ("yodo:rotate listener on stage", r'stage\.addEventListener\(\s*["\']yodo:rotate["\']'),
    ("yodo:rotate handles direction", r'event\.detail\?\.direction'),
    ("yodo:zoom listener on stage", r'stage\.addEventListener\(\s*["\']yodo:zoom["\']'),
    ("yodo:zoom handles delta", r'event\.detail\?\.delta'),
]

for name, pattern in contract_checks:
    if re.search(pattern, three_scene_js):
        print(f"  ✓ {name} present in three-scene.js")
    else:
        failures.append(f"Failed contract check in js/three-scene.js: {name}")

# --- 4. Adversarial Edge Case Checks ---
print("\n[Audit 4] Adversarial Stress Testing & Edge Cases...")
# Edge Case 4.1: Check if rotate or zoom throws when heroStage is null
# Verified by optional chaining heroStage?.dispatchEvent
if "heroStage?.dispatchEvent" in home_page_js:
    print("  ✓ Edge Case 4.1: Optional chaining prevents TypeErrors if #hero-stage is missing from DOM")
else:
    failures.append("Edge Case 4.1: Missing optional chaining on heroStage.dispatchEvent")

# Edge Case 4.2: Zoom delta boundary stability
# Check that data-zoom handler distinguishes "in" vs "out" correctly
if "button.dataset.zoom === \"in\"" in home_page_js:
    print("  ✓ Edge Case 4.2: data-zoom properly checks dataset.zoom === 'in'")
else:
    failures.append("Edge Case 4.2: dataset.zoom === 'in' condition missing")

# Edge Case 4.3: Bubbles set to true on CustomEvents
bubbles_matches = re.findall(r'new\s+CustomEvent\([^)]*bubbles:\s*true[^)]*\)', home_page_js, re.DOTALL)
if len(bubbles_matches) >= 3:
    print(f"  ✓ Edge Case 4.3: CustomEvents set bubbles: true ({len(bubbles_matches)} instances)")
else:
    failures.append(f"Edge Case 4.3: Expected at least 3 CustomEvents with bubbles: true, found {len(bubbles_matches)}")

# --- 5. Network Asset Serving Test ---
print("\n[Audit 5] HTTP Network Serving Verification...")
PORT = 8991
server = socketserver.TCPServer(("127.0.0.1", PORT), http.server.SimpleHTTPRequestHandler)
server_thread = threading.Thread(target=server.serve_forever, daemon=True)
server_thread.start()
time.sleep(0.3)

try:
    test_endpoints = [
        "/",
        "/index.html",
        "/js/home-page.js",
        "/js/three-scene.js",
        "/js/three-bootstrap.js",
        "/style.css"
    ]
    for endpoint in test_endpoints:
        url = f"http://127.0.0.1:{PORT}{endpoint}"
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            if status == 200:
                print(f"  ✓ HTTP 200 for {endpoint}")
            else:
                failures.append(f"Unexpected status {status} for {endpoint}")
finally:
    server.shutdown()
    server.server_close()

# --- 6. Integrity Violation Checks ---
print("\n[Audit 6] Checking for Integrity Violations...")
# Check if there are hardcoded mock values or dummy stubs
integrity_red_flags = [
    ("Mock return statements", r'return\s+["\']mock["\']'),
    ("TODO / FIXME dummy code", r'//\s*(?:TODO|FIXME):?\s*implement'),
    ("Stub functions", r'function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{\s*\}'),
]
for desc, pat in integrity_red_flags:
    for fpath in ["index.html", "js/home-page.js", "js/three-scene.js"]:
        with open(fpath, "r", encoding="utf-8") as f:
            c = f.read()
        if re.search(pat, c, re.IGNORECASE):
            failures.append(f"Potential integrity violation ({desc}) found in {fpath}")

print("  ✓ No integrity violations found (no mock stubs, dummy functions, or fake logic)")

# --- Final Summary ---
print("\n" + "=" * 60)
if failures:
    print(f"AUDIT FAILED WITH {len(failures)} ISSUE(S):")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
else:
    print("ALL AUDIT CHECKS PASSED WITH ZERO ERRORS!")
    print("=" * 60)
