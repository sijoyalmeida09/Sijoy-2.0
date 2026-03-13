"""
Crop and export JoSho + GoHaven logos for site use.
- Trims dark background, keeps logo content.
- Exports: card-sized logos, square icons, optional og-image.
Requires: pip install Pillow
"""
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("Install Pillow: pip install Pillow")
    raise

ASSETS = Path(__file__).resolve().parent
DARK_THRESHOLD = 30   # Pixels darker than this are treated as background
MIN_PADDING_PX = 16   # Padding after trim
CARD_MAX_WIDTH = 380  # Max width for project card
ICON_SIZE = 256       # Square icon (favicon / app icon)
OG_SIZE = (1200, 630) # Open Graph / title image


def trim_dark(img: Image.Image, threshold: int = DARK_THRESHOLD) -> Image.Image:
    """Crop to content by removing dark borders (works on RGB or RGBA)."""
    if img.mode == "RGBA":
        # Use alpha or luminance: crop where not (very dark and opaque)
        gray = img.convert("L")
        alpha = img.split()[3]
        # Treat as background: dark and (opaque or no alpha)
        bg = (gray.point(lambda x: 0 if x <= threshold else 255, "1"))
        bbox = bg.getbbox()
    else:
        img_rgb = img.convert("RGB")
        gray = ImageOps.grayscale(img_rgb)
        bg = gray.point(lambda x: 0 if x <= threshold else 255, "1")
        bbox = bg.getbbox()
    if not bbox:
        return img
    left, top, right, bottom = bbox
    # Add padding
    w, h = img.size
    left = max(0, left - MIN_PADDING_PX)
    top = max(0, top - MIN_PADDING_PX)
    right = min(w, right + MIN_PADDING_PX)
    bottom = min(h, bottom + MIN_PADDING_PX)
    return img.crop((left, top, right, bottom))


def resize_max_width(img: Image.Image, max_w: int) -> Image.Image:
    if img.width <= max_w:
        return img
    ratio = max_w / img.width
    new_h = max(1, int(img.height * ratio))
    return img.resize((max_w, new_h), Image.Resampling.LANCZOS)


def export_card_and_icon(src_path: Path, name: str) -> None:
    img = Image.open(src_path).convert("RGBA")
    trimmed = trim_dark(img)
    # Card: max width, keep aspect
    card = resize_max_width(trimmed, CARD_MAX_WIDTH)
    card_path = ASSETS / f"{name}-logo.png"
    card.save(card_path, "PNG", optimize=True)
    print(f"  {card_path.name} ({card.width}x{card.height})")
    # Icon: square, centered
    icon = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    scaled = resize_max_width(trimmed, ICON_SIZE)
    if scaled.height > ICON_SIZE:
        scaled = scaled.resize((int(ICON_SIZE * scaled.width / scaled.height), ICON_SIZE), Image.Resampling.LANCZOS)
    x = (ICON_SIZE - scaled.width) // 2
    y = (ICON_SIZE - scaled.height) // 2
    icon.paste(scaled, (x, y), scaled.split()[3] if scaled.mode == "RGBA" else None)
    icon_path = ASSETS / f"{name}-icon.png"
    icon.save(icon_path, "PNG", optimize=True)
    print(f"  {icon_path.name} ({ICON_SIZE}x{ICON_SIZE})")


def build_og_image() -> None:
    """Create 1200x630 og-image: dark bg + JoSho logo + optional text area."""
    josho_path = ASSETS / "josho-logo.png"
    if not josho_path.exists():
        return
    bg = Image.new("RGB", OG_SIZE, (7, 7, 13))  # --bg #07070D
    logo = Image.open(josho_path).convert("RGBA")
    # Scale logo to fit with margin
    max_logo_w, max_logo_h = 600, 200
    r = min(max_logo_w / logo.width, max_logo_h / logo.height, 1.0)
    w, h = int(logo.width * r), int(logo.height * r)
    logo_small = logo.resize((w, h), Image.Resampling.LANCZOS)
    x = (OG_SIZE[0] - w) // 2
    y = (OG_SIZE[1] - h) // 2
    bg.paste(logo_small, (x, y), logo_small.split()[3])
    og_path = ASSETS / "og-image.png"
    bg.save(og_path, "PNG", optimize=True)
    print(f"  {og_path.name} ({OG_SIZE[0]}x{OG_SIZE[1]})")


def main() -> None:
    print("Preparing logos...")
    for label, filename in [("JoSho", "josho-logo-source.png"), ("GoHaven", "gohaven-logo-source.png")]:
        path = ASSETS / filename
        if not path.exists():
            print(f"  Skip {filename} (not found)")
            continue
        print(f"  {label}:")
        export_card_and_icon(path, filename.replace("-logo-source.png", "").replace("-source.png", ""))
    print("  OG/title image:")
    build_og_image()
    print("Done.")


if __name__ == "__main__":
    main()
