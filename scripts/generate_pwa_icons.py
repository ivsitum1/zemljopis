"""Generate PNG PWA icons from the brand SVG colors (no SVG rasterizer needed)."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "icons"
BG = (31, 111, 91, 255)
FG = (238, 244, 239, 255)
DOT = (201, 226, 101, 255)


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = max(2, size // 5)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=BG)

    cx = cy = size / 2
    ring = size * 0.28
    stroke = max(2, size // 22)
    bbox = (cx - ring, cy - ring, cx + ring, cy + ring)
    draw.ellipse(bbox, outline=FG, width=stroke)

    oval = (cx - ring * 0.45, cy - ring, cx + ring * 0.45, cy + ring)
    draw.ellipse(oval, outline=FG, width=max(1, stroke - 1))

    draw.line((cx - ring, cy, cx + ring, cy), fill=FG, width=max(1, stroke - 1))
    draw.line((cx, cy - ring, cx, cy + ring), fill=FG, width=max(1, stroke - 1))

    dot_r = max(2, size // 20)
    draw.ellipse(
        (cx + ring * 0.35 - dot_r, cy - ring * 0.4 - dot_r, cx + ring * 0.35 + dot_r, cy - ring * 0.4 + dot_r),
        fill=DOT,
    )
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for size in (192, 512):
        path = OUT / f"icon-{size}.png"
        draw_icon(size).save(path, format="PNG")
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
