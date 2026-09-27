# Penguino

A standalone local creative toolkit with browser-based tools for:

- Brand text graphics with reusable brand presets
- Single and bulk image resizing
- Image optimisation with before-and-after comparison
- Solid and simple background removal with transparent PNG export
- PNG, JPEG, and WebP file conversion
- Favicon package generation
- PDF compression

Penguino runs entirely in the browser. Images are processed locally and are not uploaded. It uses `localStorage` for brand presets, editor settings, saved drafts, and the most recently opened tool. There is no backend.

## Page URLs

- `/` — dashboard
- `/text-graphic` — text graphic editor
- `/image-resizer` — image resizer
- `/file-converter` — image converter
- `/image-optimiser` — image compression with before-and-after comparison
- `/background-remover` — local removal of solid and simple image backgrounds
- `/favicon-generator` — favicon package generator
- `/bulk-image-resizer` — multi-file image resizer
- `/pdf-compressor` — browser-side PDF compressor
- `/settings` — settings placeholder
- `/about` — about Penguino and its creator
- `/terms` — terms and conditions

These are real browser paths rather than hash fragments. The included `public/_redirects` file provides the single-page-app fallback on compatible static hosts. Configure an equivalent fallback to `index.html` if another hosting provider is used.

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints, usually:

```bash
http://127.0.0.1:5173/
```

To run on the same port used during testing:

```bash
npm run dev -- --host 127.0.0.1 --port 4175
```

## Build

```bash
npm run build
```

The built app is generated in `dist`.

## What Is Saved Locally

- Brand/client presets
- Swatches, names, favorites, and lock states
- Default font, weight, colours, text case, spacing, padding, and export preferences
- Recent editor settings
- Saved graphic drafts

Existing Brand Text Graphic Studio data remains compatible. Its saved data continues to use the original `brand-text-graphic-studio` keys so presets and drafts are not lost during the Penguino upgrade.

## Mascot Artwork

The shared waving mascot is stored at `public/assets/penguino-wave.png` and rendered through `src/components/PenguinMascot.tsx`. Tool-specific artwork is stored alongside it as `penguino-text.png`, `penguino-resize.png`, and `penguino-convert.png`.

## Font Size Values

The active font size is now a direct pixel number, controlled by `fontSizePx` in the editor state.

The default value is defined in:

```ts
src/constants.ts
```

Look for:

```ts
export const DEFAULT_FONT_SIZE_PX = 72
```

Older Small/Medium/Large saved presets are still migrated using:

```ts
export const LEGACY_FONT_SIZE_PRESET_PX = {
  small: 48,
  medium: 72,
  large: 108
} as const
```

You can change those migration values if you need old saved presets to map differently.

## Export Notes

- PNG preserves transparency when transparent background is enabled.
- JPEG automatically uses a solid background because JPEG does not support transparency.
- WebP supports transparency in modern browsers.
- Exports are rendered through a canvas at the selected export scale for crisp text.
- Google Fonts are loaded dynamically before preview and export so downloaded files keep the selected font and supported font weight.
- The resizer and converter currently accept PNG, JPEG, and WebP source images supported by the browser.

## File Names

If the graphic has text, filenames use the copy first:

```text
hello_world_310826.webp
```

If there is no copy, filenames fall back to brand, width, format, scale, transparency, and date.
