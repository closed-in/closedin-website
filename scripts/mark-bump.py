"""The ripple and glitter texture of the dark hero mark (assets/img/mark-bump-v1.webp, 512x512, bump and roughness map).
Same algorithm mark-dark.js ran on every visit until 20-10 (value-noise fbm ripple plus about 230 glitter flakes per tile);
computing it once here took about 0.8 s of main-thread work off a throttled phone. Run from the repo root: python3 scripts/mark-bump.py"""
import numpy as np
from PIL import Image

rng = np.random.default_rng(20261020)
perm = rng.random(256)


def vnoise(x, y):
    xi = np.floor(x).astype(np.int64); yi = np.floor(y).astype(np.int64); fx = x - xi; fy = y - yi
    r = lambda a, b: perm[(((a & 255) * 31) + (b & 255)) & 255]
    sx = fx * fx * (3 - 2 * fx); sy = fy * fy * (3 - 2 * fy)
    return (r(xi, yi) * (1 - sx) + r(xi + 1, yi) * sx) * (1 - sy) + (r(xi, yi + 1) * (1 - sx) + r(xi + 1, yi + 1) * sx) * sy


def fbm(x, y):
    return vnoise(x, y) * .5 + vnoise(x * 2, y * 2) * .25 + vnoise(x * 4, y * 4) * .125 + vnoise(x * 8, y * 8) * .0625


n = 512
Y, X = np.mgrid[0:n, 0:n].astype(np.float64)
v = np.clip(128 + np.sin(fbm(X * 0.012, Y * 0.012) * 14 + X * 0.02) * 60 + (fbm(X * 0.05, Y * 0.05) - 0.5) * 60, 0, 255)
FLAKES, FLAKE_H = 1 / 1150, 135   # glitter: small domes about 2 screen pixels wide (Max 19-10: more and brighter)
for _ in range(round(n * n * FLAKES)):
    cx, cy = rng.random() * n, rng.random() * n; r = 2.5 + rng.random() * 2; R = int(np.ceil(r * 2))
    for yy in range(int(cy) - R, int(cy) + R + 1):
        for xx in range(int(cx) - R, int(cx) + R + 1):
            dd = ((xx - cx) ** 2 + (yy - cy) ** 2) / (r * r)
            if dd <= 4: v[yy % n, xx % n] = min(255, v[yy % n, xx % n] + FLAKE_H * np.exp(-dd))
Image.fromarray(np.round(v).astype(np.uint8)).save("case-study-showcase/assets/img/mark-bump-v1.webp", format="WEBP", quality=92, method=6)
print("written case-study-showcase/assets/img/mark-bump-v1.webp")
