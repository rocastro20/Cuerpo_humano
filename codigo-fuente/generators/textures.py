"""
Generador de texturas procedurales — «Cuerpo adentro».

Produce texturas por código (sin fotografías ni recursos de terceros) y las
incrusta en un script clásico (src/generated/textures.js) para que el sitio
funcione también abierto con doble clic (file://).

Uso:  python3 generators/textures.py
"""
import base64
import io
import json
import os

import numpy as np
from PIL import Image, ImageFilter

RNG = np.random.default_rng(20261110)
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "generated")
GALLERY_DIR = os.path.join(os.path.dirname(__file__), "..", "generated-preview")


def worley_tileable(size=512, points=70, seed=1):
    """Ruido celular (Worley) que se repite sin costuras: parece tejido."""
    rng = np.random.default_rng(seed)
    pts = rng.random((points, 2)) * size
    # Copias desplazadas para que el patrón sea continuo en los bordes.
    offs = np.array([[dx, dy] for dx in (-size, 0, size) for dy in (-size, 0, size)])
    allpts = (pts[None, :, :] + offs[:, None, :]).reshape(-1, 2)
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    f1 = np.full((size, size), 1e9, np.float32)
    f2 = np.full((size, size), 1e9, np.float32)
    for px, py in allpts:
        d = np.hypot(xx - px, yy - py)
        f2 = np.where(d < f1, f1, np.minimum(f2, d))
        f1 = np.minimum(f1, d)
    edge = f2 - f1  # bordes de las células
    edge = edge / edge.max()
    return edge


def value_noise(size=512, cells=8, seed=2, octaves=4):
    rng = np.random.default_rng(seed)
    out = np.zeros((size, size), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        n = cells * (2 ** o)
        grid = rng.random((n, n)).astype(np.float32)
        img = Image.fromarray((grid * 255).astype(np.uint8)).resize((size, size), Image.BICUBIC)
        img = img.filter(ImageFilter.GaussianBlur(max(1.0, size / n * 0.35)))
        out += np.asarray(img, np.float32) / 255.0 * amp
        total += amp
        amp *= 0.5
    return out / total


def to_png_bytes(arr, mode="L"):
    img = Image.fromarray(arr, mode)
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue(), img


def tejido():
    cel = worley_tileable(512, 70, seed=7)
    noise = value_noise(512, 6, seed=3)
    v = 0.65 * np.clip(cel * 1.6, 0, 1) + 0.35 * noise
    v = (np.clip(v, 0, 1) * 255).astype(np.uint8)
    return to_png_bytes(v, "L")


def brillo():
    s = 128
    yy, xx = np.mgrid[0:s, 0:s].astype(np.float32)
    r = np.hypot(xx - s / 2 + 0.5, yy - s / 2 + 0.5) / (s / 2)
    a = np.clip(1 - r, 0, 1) ** 2.2
    rgba = np.zeros((s, s, 4), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = (a * 255).astype(np.uint8)
    return to_png_bytes(rgba, "RGBA")


def arepa():
    """Cara de una arepa asada: masa de maíz con tostados irregulares."""
    s = 512
    yy, xx = np.mgrid[0:s, 0:s].astype(np.float32)
    r = np.hypot(xx - s / 2, yy - s / 2) / (s / 2)
    base = np.array([236, 205, 128], np.float32)
    tost = np.array([150, 92, 38], np.float32)
    quem = np.array([84, 50, 22], np.float32)
    n1 = value_noise(s, 5, seed=11, octaves=5)
    n2 = value_noise(s, 14, seed=12, octaves=3)
    spots = np.clip((n1 - 0.52) * 4.0, 0, 1)
    burn = np.clip((n2 - 0.70) * 5.0, 0, 1) * spots
    edge = np.clip((r - 0.78) * 4.5, 0, 1)  # borde más tostado
    t = np.clip(spots * 0.75 + edge * 0.6, 0, 1)
    col = base[None, None, :] * (1 - t[..., None]) + tost[None, None, :] * t[..., None]
    col = col * (1 - burn[..., None] * 0.8) + quem[None, None, :] * burn[..., None] * 0.8
    g = RNG.normal(0, 1, (s, s)).astype(np.float32)
    g = np.asarray(Image.fromarray(((g * 0.18 + 0.5).clip(0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1)), np.float32) / 255 - 0.5
    col = np.clip(col + g[..., None] * 60, 0, 255).astype(np.uint8)
    img = Image.fromarray(col, "RGB").filter(ImageFilter.GaussianBlur(0.6))
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue(), img


def grano():
    s = 256
    n = RNG.normal(0.5, 0.18, (s, s))
    v = (np.clip(n, 0, 1) * 255).astype(np.uint8)
    img = Image.fromarray(v, "L").filter(ImageFilter.GaussianBlur(0.35))
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue(), img


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(GALLERY_DIR, exist_ok=True)
    texturas = {}
    for name, fn in [("tejido", tejido), ("brillo", brillo), ("arepa", arepa), ("grano", grano)]:
        data, img = fn()
        texturas[name] = "data:image/png;base64," + base64.b64encode(data).decode()
        img.save(os.path.join(GALLERY_DIR, f"textura-{name}.png"))
        print(f"{name}: {len(data)/1024:.0f} KB")
    js = (
        "/* Texturas procedurales generadas por generators/textures.py.\n"
        "   Script clásico (no módulo) para que funcione al abrir index.html con doble clic. */\n"
        "window.TEXTURAS = " + json.dumps(texturas) + ";\n"
    )
    with open(os.path.join(OUT_DIR, "textures.js"), "w") as f:
        f.write(js)
    print("ok ->", os.path.join(OUT_DIR, "textures.js"))


if __name__ == "__main__":
    main()
