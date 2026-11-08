import os
import re
import sys

def verify_file(filepath):
    print(f"Verifying {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()

    # Simple bracket matcher
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    in_block_comment = False
    in_str = False
    str_char = ''
    escape = False

    lines = code.split('\n')
    for line_no, line in enumerate(lines, 1):
        i = 0
        while i < len(line):
            ch = line[i]
            if in_block_comment:
                if ch == '*' and i + 1 < len(line) and line[i+1] == '/':
                    in_block_comment = False
                    i += 1
                i += 1
                continue

            if in_str:
                if escape:
                    escape = False
                elif ch == '\\':
                    escape = True
                elif ch == str_char:
                    in_str = False
                i += 1
                continue

            # Not in string or comment
            if ch == '/' and i + 1 < len(line):
                if line[i+1] == '/':
                    # line comment
                    break
                elif line[i+1] == '*':
                    in_block_comment = True
                    i += 2
                    continue

            if ch in ('"', "'", '`'):
                in_str = True
                str_char = ch
                escape = False
            elif ch in ('(', '{', '['):
                stack.append((ch, line_no))
            elif ch in (')', '}', ']'):
                if not stack:
                    print(f"Error: Unmatched closing {ch} at line {line_no}")
                    return False
                top, top_line = stack.pop()
                if top != pairs[ch]:
                    print(f"Error: Mismatched {ch} at line {line_no}, expected closing for {top} from line {top_line}")
                    return False
            i += 1

    if stack:
        print(f"Error: Unclosed delimiters at EOF: {stack[:5]}")
        return False

    print(f"  {filepath}: Syntax brackets balanced successfully.")
    return True

all_good = True
for f in ["js/home-page.js", "js/three-scene.js"]:
    if not verify_file(f):
        all_good = False

# Check index.html for demo / mannequin terms
print("Checking index.html for prohibited terms...")
with open("index.html", "r", encoding="utf-8") as f:
    index_content = f.read()

prohibited = ["démonstration", "mannequin", "demonstration"]
for term in prohibited:
    matches = [m.start() for m in re.finditer(re.escape(term), index_content, re.IGNORECASE)]
    if matches:
        print(f"Error: Found prohibited term '{term}' in index.html at positions {matches}")
        all_good = False
    else:
        print(f"  Zero occurrences of '{term}' in index.html.")

# Verify key items in three-scene.js
print("Checking three-scene.js implementation items...")
with open("js/three-scene.js", "r", encoding="utf-8") as f:
    three_scene = f.read()

checks = [
    ("RoomEnvironment import", "import { RoomEnvironment } from \"three/addons/environments/RoomEnvironment.js\";"),
    ("No GLTFLoader import", "GLTFLoader" not in three_scene),
    ("No makeMannequin", "makeMannequin" not in three_scene),
    ("No models3d reference", "models3d" not in three_scene),
    ("createStreetwearGarment definition", "function createStreetwearGarment()" in three_scene),
    ("createFabricBumpTexture definition", "function createFabricBumpTexture()" in three_scene),
    ("createRibKnitTexture definition", "function createRibKnitTexture()" in three_scene),
    ("createBrandDecalTexture definition", "function createBrandDecalTexture(" in three_scene),
    ("MeshPhysicalMaterial cloth sheen", "sheen: 0.90" in three_scene and "MeshPhysicalMaterial" in three_scene),
    ("PCFSoftShadowMap enabled", "renderer.shadowMap.type = THREE.PCFSoftShadowMap" in three_scene),
    ("Dynamic contact shadow ShadowMaterial", "ShadowMaterial" in three_scene),
    ("Key light 2048x2048 shadow", "keyLight.shadow.mapSize.set(2048, 2048)" in three_scene),
    ("Crimson rim kicker", "0xe52335" in three_scene),
    ("Cool ice silhouette kicker", "0xd4e4fc" in three_scene),
    ("Continuous aspect ratio math", "Math.max(4.6, 4.6 / Math.min(1.0, aspect))" in three_scene),
    ("yodo:rotate handler", 'stage.addEventListener("yodo:rotate"' in three_scene),
    ("yodo:zoom handler", 'stage.addEventListener("yodo:zoom"' in three_scene),
]

for label, cond in checks:
    if cond if isinstance(cond, bool) else (cond in three_scene):
        print(f"  [PASS] {label}")
    else:
        print(f"  [FAIL] {label}")
        all_good = False

# Verify js/home-page.js custom event dispatches
print("Checking js/home-page.js custom event dispatches...")
with open("js/home-page.js", "r", encoding="utf-8") as f:
    home_page = f.read()

hp_checks = [
    ("yodo:rotate dispatch on rotate-left", 'detail: { direction: -1, degrees: -35 }' in home_page),
    ("yodo:rotate dispatch on rotate-right", 'detail: { direction: 1, degrees: 35 }' in home_page),
    ("yodo:zoom dispatch on data-zoom", 'detail: { delta: isZoomIn ? 0.35 : -0.35 }' in home_page),
]

for label, cond in hp_checks:
    if cond:
        print(f"  [PASS] {label}")
    else:
        print(f"  [FAIL] {label}")
        all_good = False

if not all_good:
    print("Verification failed!")
    sys.exit(1)

print("\nALL VERIFICATION CHECKS PASSED PERFECTLY!")
