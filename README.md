# Penguino

A standalone local creative toolkit with browser-based tools for:

- Brand text graphics with reusable brand presets
- Single and bulk image resizing
- Image optimisation with before-and-after comparison
- Solid and simple background removal with transparent PNG export
- PNG, JPEG, and WebP file conversion
- Favicon package generation
- PDF compression
- Image metadata removal
- ZIP file packing
- Colour palette extraction
- Social media image resizing with platform presets
- PDF merging and page extraction
- QR code generation with PNG and SVG export
- SVG optimisation
- Text watermarking
- Image splitting with ZIP export

Penguino runs entirely in the browser. Images are processed locally and are not uploaded. It uses `localStorage` for brand presets, editor settings, favourites, and recently used tools. There is no backend.

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
- `/metadata-remover` — strip embedded metadata from images
- `/file-packer` — bundle up to 50 files into a ZIP archive
- `/colour-palette-extractor` — extract HEX colours and download palette CSS
- `/social-media-resizer` — resize and crop for common social media dimensions
- `/pdf-merger-extractor` — merge PDFs or extract selected page ranges
- `/qr-code-generator` — create QR codes as PNG or SVG
- `/svg-optimiser` — clean and compress SVG markup
- `/watermark-tool` — apply custom text watermarks to images
- `/image-splitter` — divide images into downloadable grid tiles
- `/settings` — private, locally stored usage statistics
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

The built app is generated in `dist`. The build also:

- creates optimised WebP mascot artwork and unique social sharing images
- pre-renders crawlable HTML, titles, descriptions and canonical URLs for every page
- includes the installable PWA manifest and offline service worker

Page titles, descriptions, headings and social image paths are maintained in `src/content/pageMetadata.json`. Run `npm run assets` after changing source mascot art if you only want to regenerate the optimised artwork and social cards.

## What Is Saved Locally

- Brand/client presets
- Swatches, names, favorites, and lock states
- Default font, weight, colours, text case, spacing, padding, and export preferences
- Recent editor settings
- Saved graphic drafts
- Favourite and recently used tools
- Private usage totals shown on the Settings page

Existing Brand Text Graphic Studio data remains compatible. Its saved data continues to use the original `brand-text-graphic-studio` keys so presets and drafts are not lost during the Penguino upgrade.

## Analytics

Penguino sends privacy-conscious product events to GA4. Events include:

- tool and page opened
- file selection, format, byte size, batch count, and raster dimensions
- completed processing and downloads, including output format, byte size, and dimensions
- broad feature choices such as resize mode, preset, quality band, and PDF operation
- processing failures by error type, without sending error messages
- favourites, navigation search selection, clipboard use, settings export, and PWA installation

Penguino does not send filenames, file contents, entered text, QR destinations, watermark copy, or exact colours. Personal totals on the Settings page are stored only in local storage and can be cleared by the user at any time.

GA4 receives the custom event parameters immediately. To use them in Explorations and reports, register the descriptive fields such as `tool`, `operation`, `output_format`, `resize_mode`, `preset`, `quality_band`, and `error_type` as event-scoped custom dimensions. Register byte sizes, dimensions, file counts, and page counts as custom metrics.

## Mascot Artwork

Source mascot images are stored in `public/assets`. `npm run assets` creates the smaller WebP versions used by the interface and the 1200 × 630 social cards in `public/og`.

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
