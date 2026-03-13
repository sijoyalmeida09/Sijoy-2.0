# Site assets

## Logos (in use)

| File | Purpose |
|------|--------|
| **josho-logo.png** | JoSho IT Solutions — project card and branding |
| **gohaven-logo.png** | GoHaven — project card |

These are used in `index.html` for the JoSho IT and GoHaven project cards. Source files: `josho-logo-source.png`, `gohaven-logo-source.png`.

**Optional — cropped/icon variants:** If you have Python and Pillow installed, run from this folder:
```bash
pip install Pillow
python prepare_logos.py
```
This generates trimmed card logos, 256×256 icons (`josho-icon.png`, `gohaven-icon.png`), and **og-image.png** (1200×630) for link previews. You can then replace `josho-logo.png` / `gohaven-logo.png` with the trimmed versions if you prefer.

---

## Other assets

| File | Required | Purpose |
|------|----------|--------|
| **sijoy-resume.pdf** | Yes | Resume download (nav "Resume ↓" and hero "Download Resume") |
| **og-image.png** | No | 1200×630 px — link preview when shared (LinkedIn, etc.). Generate with `prepare_logos.py` or create manually. |
| **favicon.ico** | No | Browser tab icon (e.g. 32×32). You can use `josho-icon.png` resized in an editor. |

After adding or changing files, push to `main` and the GitHub Actions deploy will include them.
