ANC Branding Assets - Requirements

Place branding assets in this folder using exactly the file names below so the PDF and frontend templates can pick them up automatically.

Required files:
- `logo.svg` — Primary logo (vector) — scale-friendly
- `logo.png` — Fallback raster version (512x512)
- `colors.json` — JSON object listing brand colors, e.g.,
  {
    "primary": "#003D82",
    "secondary": "#1e293b",
    "accent": "#3b82f6"
  }
- `fonts/` — Optional custom fonts (ttf/otf) — include license info

Notes:
- If `logo.svg` is missing, the system will use `assets/branding/placeholder_logo.svg`.
- Keep file names exact for automated template picks.
