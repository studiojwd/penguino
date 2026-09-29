export interface ToolSeoContent {
  heading: string
  intro: string[]
  sections: Array<{ heading: string; paragraphs: string[] }>
  steps: string[]
  faqs: Array<{ question: string; answer: string }>
}

export const toolSeoContent = {
  text: {
    heading: 'Create branded text graphics online',
    intro: [
      'Make clean, text-only graphics for newsletters, websites and social content using your own brand colours and Google Fonts. Penguino gives you a focused alternative to opening a full design application when the job is simply to turn a short message into a polished image.',
      'Set an exact pixel width, adjust font size, weight, alignment, spacing and padding, then preview the result at the same proportions used for export. Reusable brand presets keep colours and typography consistent across regular campaigns.'
    ],
    sections: [
      { heading: 'Text graphics for newsletters and websites', paragraphs: ['Text saved as an image can be useful for campaign headings, promotional callouts, quote graphics and branded dividers where you need a consistent visual treatment. Export as PNG for transparency, JPEG for broad compatibility or WebP for a smaller modern web image.'] },
      { heading: 'Save reusable brand styles', paragraphs: ['Create separate presets for clients, publications or projects. Each preset can remember its Google Font, font weight, colour swatches, default text and background colours, spacing and export preferences, making repeated production work quicker and less error-prone.'] }
    ],
    steps: ['Choose or create a brand preset, then enter as many lines of text as you need.', 'Set the font, colours, exact pixel size, alignment, spacing and padding while checking the live preview.', 'Choose PNG, JPEG or WebP and download the finished graphic at the displayed canvas dimensions.'],
    faqs: [
      { question: 'Can I export a text graphic with a transparent background?', answer: 'Yes. Enable transparency and export as PNG or WebP. JPEG does not support transparency, so Penguino uses a solid background for JPEG downloads.' },
      { question: 'Will the downloaded graphic keep the selected font weight?', answer: 'Yes. Penguino waits for the selected Google Font and supported weight to load before drawing the export, helping the downloaded image match the preview.' },
      { question: 'Where are my brand presets stored?', answer: 'Brand presets and recent editor settings are stored in local browser storage on this device. They are not uploaded to a Penguino account or backend.' }
    ]
  },
  resize: {
    heading: 'Resize an image to exact pixel dimensions',
    intro: [
      'Resize a PNG, JPEG or WebP image by width, height or exact dimensions. This is useful when a website, email platform, marketplace or social channel requires a particular image size and the original file is too large.',
      'Choose one dimension and let Penguino calculate the other to preserve the original proportions, or use exact mode when both dimensions must be fixed. The processed image stays on your device.'
    ],
    sections: [
      { heading: 'Resize by width or height without distortion', paragraphs: ['Width mode calculates the height automatically, while height mode calculates the width. This preserves the source aspect ratio and avoids stretching. Exact mode is available for requirements where a fixed width and height matter more than preserving proportions.'] },
      { heading: 'Choose the right image format and quality', paragraphs: ['PNG is well suited to graphics, screenshots and transparency. JPEG is a practical choice for photographs and wide compatibility. WebP can provide smaller web images at comparable visual quality. JPEG and WebP quality can be adjusted before download.'] }
    ],
    steps: ['Add a PNG, JPEG or WebP image from your device.', 'Choose width, height or exact mode and enter the required pixel dimensions.', 'Select the output format and quality, add an optional filename prefix, then resize and download.'],
    faqs: [
      { question: 'How do I resize an image to 600 pixels wide?', answer: 'Choose Width mode and enter 600. Penguino calculates the matching height from the original aspect ratio so the image is not stretched.' },
      { question: 'Can Penguino prevent small images from being enlarged?', answer: 'Yes. Keep the do-not-enlarge option enabled to avoid increasing images beyond their original dimensions in proportional resize modes.' },
      { question: 'Does image resizing upload my file?', answer: 'No. Image decoding, resizing and export happen locally in the browser.' }
    ]
  },
  convert: {
    heading: 'Convert images between PNG, JPEG and WebP',
    intro: [
      'Change an image file to the format you need for a website, newsletter, presentation or everyday design task. Penguino converts PNG, JPEG and WebP images directly in the browser without a server upload.',
      'The preview helps confirm you selected the correct source, while format and quality controls keep the conversion straightforward. The converted file receives a clear filename so the original remains untouched.'
    ],
    sections: [
      { heading: 'When to use PNG, JPEG or WebP', paragraphs: ['Use PNG for logos, interface graphics, screenshots and images that require transparency. JPEG remains widely supported and works well for photographs. WebP is designed for efficient web delivery and often produces a smaller file than JPEG or PNG.'] },
      { heading: 'Convert images privately in your browser', paragraphs: ['Local conversion is useful for client work, unpublished campaigns and personal images because the source file does not need to leave your device. There is no account, upload queue or remote conversion service involved.'] }
    ],
    steps: ['Choose a PNG, JPEG or WebP image.', 'Select the destination format and adjust quality for JPEG or WebP.', 'Convert and download the new file while keeping the original unchanged.'],
    faqs: [
      { question: 'What happens to transparency when converting to JPEG?', answer: 'JPEG cannot store transparency. Transparent areas are placed on a solid white background during JPEG conversion.' },
      { question: 'Is WebP suitable for websites?', answer: 'Yes. Modern browsers support WebP, and it is often a good choice when reducing image transfer size is important.' },
      { question: 'Can I convert several images together?', answer: 'The File Converter handles one image at a time. For shared resizing and format settings across multiple images, use the Bulk Image Resizer.' }
    ]
  },
  optimise: {
    heading: 'Compress images for faster websites',
    intro: [
      'Reduce PNG, JPEG and WebP file sizes while comparing the original and optimised image before downloading. Smaller images can improve website loading times, reduce bandwidth and make email or document attachments easier to share.',
      'A draggable before-and-after comparison and 100% zoom option help you inspect fine detail instead of judging compression from a small thumbnail. You remain in control of the quality setting and output format.'
    ],
    sections: [
      { heading: 'Balance image quality and file size', paragraphs: ['Lower quality settings can create a smaller download but may introduce visible softness or compression artefacts. Start with a moderate setting, inspect detailed areas such as text, faces and edges, and adjust until the saving is worthwhile without harming the image.'] },
      { heading: 'Optimise images before publishing', paragraphs: ['Large photographs and graphics can slow landing pages, articles, portfolios and ecommerce listings. Optimising an image before uploading it to a content management system helps avoid sending unnecessarily large source files to every visitor.'] }
    ],
    steps: ['Add a PNG, JPEG or WebP image and review its original size.', 'Choose the output format and quality, then compare the before and after views at fitted or 100% zoom.', 'Download the optimised image when the visual quality and file-size saving meet your needs.'],
    faqs: [
      { question: 'Will image compression always make a file smaller?', answer: 'Not always. A source may already be highly optimised, and PNG export can be larger for photographic content. Penguino shows the resulting size so you can decide whether to download it.' },
      { question: 'Which format usually creates the smallest web image?', answer: 'WebP often performs well for web use, but the best result depends on the image. Compare formats and quality levels rather than relying on one setting for every file.' },
      { question: 'Can I inspect the compressed image at full size?', answer: 'Yes. Switch to 100% zoom and scroll around the comparison to inspect actual image pixels and compression detail.' }
    ]
  },
  'remove-background': {
    heading: 'Remove simple image backgrounds in your browser',
    intro: [
      'Create a transparent PNG by removing a connected solid or simple background from an image. The tool is designed for clean product shots, icons, illustrations and graphics where the background colour is reasonably consistent.',
      'Penguino detects the starting background colour, lets you adjust tolerance and edge softness, and shows the result over a transparency grid before download. Processing stays in your browser.'
    ],
    sections: [
      { heading: 'Best results with clear, consistent backgrounds', paragraphs: ['A plain studio backdrop, white canvas or flat colour is easier to remove than a detailed scene. Increase tolerance when shades vary slightly, but check that similar colours inside the subject are not removed. Edge softness can help reduce a hard or jagged cutout.'] },
      { heading: 'Create transparent images for design work', paragraphs: ['Transparent PNG files are useful for product listings, presentations, website compositions, thumbnails and social graphics because the subject can be placed over a new colour or layout without its original rectangle.'] }
    ],
    steps: ['Add a PNG, JPEG or WebP image with a simple background.', 'Adjust background tolerance and edge softness while reviewing the transparent preview.', 'Download the result as a transparent PNG and check detailed edges before publishing.'],
    faqs: [
      { question: 'Does this work like an AI background remover?', answer: 'No. It removes connected colours based on the selected background and tolerance. It works best with solid or simple backgrounds rather than complex scenes or fine hair.' },
      { question: 'Why is part of my subject becoming transparent?', answer: 'The subject probably contains colours close to the selected background. Reduce the tolerance until those areas remain visible.' },
      { question: 'Are uploaded images sent to a server?', answer: 'No. Background processing and transparent PNG export happen locally in the browser.' }
    ]
  },
  favicon: {
    heading: 'Create a complete favicon package',
    intro: [
      'Turn one logo or icon into the common favicon sizes used by browser tabs, bookmarks, Apple devices and Android home screens. A consistent favicon helps people recognise a website when several tabs or saved links are open.',
      'Penguino creates multiple PNG sizes and packages them with a web app manifest and ready-to-use HTML link markup. Everything is downloaded together as a ZIP file.'
    ],
    sections: [
      { heading: 'Prepare a logo for small favicon sizes', paragraphs: ['Simple, high-contrast artwork usually remains clearer at 16 or 32 pixels than detailed text or thin lines. Use the live size previews to check whether the mark is recognisable, and adjust the background colour or internal padding when the design feels cramped.'] },
      { heading: 'Favicon files included in the download', paragraphs: ['The generated package includes 16, 32 and 48-pixel browser icons, a 180-pixel Apple Touch icon, 192 and 512-pixel Android icons, a site.webmanifest file and an HTML snippet showing how to reference the files.'] }
    ],
    steps: ['Add a square or near-square PNG, JPEG or WebP logo.', 'Choose a background colour and padding while checking the small icon previews.', 'Download the favicon ZIP and place its files at the matching paths on your website.'],
    faqs: [
      { question: 'What image should I use for a favicon?', answer: 'Use a simple square logo or symbol with clear shapes and strong contrast. Avoid long words because favicon sizes are very small.' },
      { question: 'Does the package include Apple and Android icons?', answer: 'Yes. It includes an Apple Touch icon, two Android icon sizes and a web app manifest alongside standard browser favicons.' },
      { question: 'Where should favicon files be uploaded?', answer: 'The included markup expects the files at the root of your website. You can use another folder, but update the paths in the markup and manifest to match.' }
    ]
  },
  'bulk-resize': {
    heading: 'Resize up to 10 images at once',
    intro: [
      'Apply the same width, height, format and quality settings to a batch of PNG, JPEG or WebP images. Bulk resizing is helpful when preparing a set of article images, product photos, team portraits or campaign assets for one destination.',
      'Each image keeps its own proportions in width or height mode, while exact mode creates one fixed canvas size. Finished files are bundled into a single ZIP download.'
    ],
    sections: [
      { heading: 'Give every image a consistent maximum dimension', paragraphs: ['Choose Width when every image must fit a content column, or Height when consistent vertical space matters. The other dimension is calculated separately for each source, so landscape and portrait images can be processed together without distortion.'] },
      { heading: 'Rename and convert a batch of images', paragraphs: ['Add an optional filename prefix for easier organisation, then select PNG, JPEG or WebP as the shared output. JPEG and WebP include a quality control, and the do-not-enlarge option protects smaller source images from unnecessary scaling.'] }
    ],
    steps: ['Add up to 10 PNG, JPEG or WebP images.', 'Choose width, height or exact mode, then set format, quality and an optional filename prefix.', 'Resize the batch and download all completed images in one ZIP archive.'],
    faqs: [
      { question: 'Can images with different proportions be resized together?', answer: 'Yes. Width and height modes calculate the other dimension independently for every image, preserving each original aspect ratio.' },
      { question: 'What is the batch limit?', answer: 'You can process up to 10 images in one batch. This limit helps keep local browser memory use predictable.' },
      { question: 'Will exact mode crop my images?', answer: 'No. Exact mode stretches each source to the requested width and height. Use proportional width or height mode when avoiding distortion is more important.' }
    ]
  },
  'pdf-compress': {
    heading: 'Compress PDF files without uploading them',
    intro: [
      'Reduce the size of a PDF directly in your browser using a choice of compression levels. A smaller PDF can be easier to email, upload to a portal or store when the original document contains large scanned pages or images.',
      'Penguino processes the document locally and reports the original and compressed sizes. The current method rebuilds pages as images, so it is best suited to visual documents where selectable text and interactive features are not required.'
    ],
    sections: [
      { heading: 'Choose a PDF compression level', paragraphs: ['Light compression retains more page detail and may produce a modest saving. Balanced compression is a practical starting point for many documents. Strong compression prioritises a smaller download and may be appropriate for quick reference copies or image-heavy scans.'] },
      { heading: 'Understand what changes in the compressed PDF', paragraphs: ['Because each page is rendered as an image, selectable text, search, links, forms, layers and accessibility structure are flattened. Always keep the original PDF and inspect the compressed copy before sending it to clients, printers or official services.'] }
    ],
    steps: ['Choose a PDF and review its original file size.', 'Select light, balanced or strong compression based on the intended use.', 'Compress, compare the resulting size and download the new PDF after checking its pages.'],
    faqs: [
      { question: 'Does PDF compression happen online?', answer: 'The document is processed locally in your browser and is not uploaded to a Penguino server.' },
      { question: 'Will text remain selectable after compression?', answer: 'No. The current compressor rebuilds pages as images, which removes selectable text, links, forms and document accessibility structure.' },
      { question: 'Why did my PDF not become much smaller?', answer: 'The source may already be compressed or contain content that does not benefit from the selected settings. Try another level, but keep quality requirements in mind.' }
    ]
  },
  metadata: {
    heading: 'Remove EXIF and location metadata from images',
    intro: [
      'Inspect readable camera, date, software, copyright and GPS information embedded in a PNG, JPEG or WebP image before removing it. Metadata can be useful during production, but it may reveal details you do not intend to share publicly.',
      'Penguino displays the fields it can identify, creates a fresh image from the visible pixels and scans the result again. The clean copy receives a new filename while your original stays unchanged.'
    ],
    sections: [
      { heading: 'What image metadata can reveal', paragraphs: ['Depending on the camera and editing workflow, metadata may include device make and model, lens, capture date, editing software, creator, copyright, comments, exposure settings and geographic coordinates. Not every image contains these fields, and many platforms remove some metadata automatically.'] },
      { heading: 'Create a clean copy before sharing', paragraphs: ['Removing embedded metadata can be useful before publishing personal photographs, delivering client assets, uploading marketplace images or sharing files outside a production team. Penguino re-exports the image, so review visual quality and retain the original archival file separately.'] }
    ],
    steps: ['Add a PNG, JPEG or WebP image and review the readable metadata fields found.', 'Choose the clean-copy format and quality, then remove the metadata.', 'Confirm the verified status and download the newly generated image.'],
    faqs: [
      { question: 'Can the tool show what metadata will be removed?', answer: 'Yes. It lists readable EXIF, GPS, IPTC and XMP details such as camera, date, software, copyright and location before creating the clean copy.' },
      { question: 'Does removing metadata change the image?', answer: 'The image is decoded and re-exported, so pixels are preserved at the same dimensions but lossy formats may change slightly according to the selected quality.' },
      { question: 'Is every possible metadata format detected?', answer: 'Penguino checks common EXIF, GPS, IPTC and XMP fields. Specialised proprietary data may not appear in the readable list, which is why the clean copy is rebuilt from pixels rather than only deleting named tags.' }
    ]
  },
  pack: {
    heading: 'Create a ZIP archive in your browser',
    intro: [
      'Bundle documents, images and other files into one tidy ZIP download without uploading them to an online storage service. A ZIP archive is useful when several related files need to be transferred, attached or stored together.',
      'Penguino accepts up to 50 files or 500 MB in one package. You can choose the archive name and add an optional prefix to every packed filename before creating the download locally.'
    ],
    sections: [
      { heading: 'Organise files into one convenient download', paragraphs: ['Use File Packer for project handovers, campaign assets, document bundles, image collections or any small group of files that should stay together. The file queue shows names and sizes, and individual items can be removed before the ZIP is created.'] },
      { heading: 'Pack files locally for greater privacy', paragraphs: ['The selected files are read and compressed by your browser. They are not transferred to Penguino or held in cloud storage, which is helpful for confidential work and avoids waiting for uploads before an archive can be generated.'] }
    ],
    steps: ['Choose or drag in up to 50 files with a combined size of no more than 500 MB.', 'Enter a useful ZIP filename and optionally add a prefix to the files inside it.', 'Create and download the archive, then open it to confirm all expected files are included.'],
    faqs: [
      { question: 'What file types can be added to the ZIP?', answer: 'Any file type can be packed, including images, PDFs, documents and project assets, provided the browser can read the local file.' },
      { question: 'Does creating a ZIP reduce image or document quality?', answer: 'No. ZIP compression stores the original file bytes and does not resize images or alter document content.' },
      { question: 'What are the File Packer limits?', answer: 'One archive can contain up to 50 files or 500 MB in total. Very large archives may also depend on the memory available to your browser and device.' }
    ]
  },
  palette: {
    heading: 'Extract a colour palette from any image',
    intro: [
      'Find the strongest colours in a PNG, JPEG or WebP image and turn them into a practical four, six or eight-colour palette. This can provide a useful starting point for a website theme, presentation, campaign or supporting graphic.',
      'Penguino analyses the image locally, groups similar pixel colours and presents distinct HEX swatches. Copy individual values with one click or download the complete palette as a CSS file.'
    ],
    sections: [
      { heading: 'Build a colour palette from a photo or design', paragraphs: ['A smaller four-colour set is useful for a focused visual direction, while six or eight colours capture more variety from detailed artwork. Extracted colours reflect dominant image pixels, so consider how they will work for text contrast, accessibility and interface states before using them as a complete brand system.'] },
      { heading: 'Use extracted HEX colours in CSS', paragraphs: ['The downloaded file defines each colour as a CSS custom property. Add it to a stylesheet or copy the values into design software, presentation themes and brand documentation. Clear numbered variables make the palette easy to rename around its eventual purpose.'] }
    ],
    steps: ['Add a PNG, JPEG or WebP image that contains the colours you want to explore.', 'Choose four, six or eight colours and review the generated swatches.', 'Click a swatch to copy its HEX code or download the palette as a CSS file.'],
    faqs: [
      { question: 'How does Penguino choose colours from an image?', answer: 'It samples image pixels, groups nearby RGB values and selects prominent colours that are visually distinct from one another.' },
      { question: 'Can I copy individual HEX values?', answer: 'Yes. Select any displayed swatch to copy its HEX colour to the clipboard.' },
      { question: 'Does the downloaded palette work in a website stylesheet?', answer: 'Yes. The CSS download contains custom properties inside a root selector, ready to paste into a stylesheet and rename if needed.' }
    ]
  },
  'social-resize': {
    heading: 'Resize images for Instagram and social media',
    intro: ['Prepare one image for common Instagram, Facebook, LinkedIn, X, YouTube and Pinterest dimensions without looking up pixel sizes each time. Choose a preset and see the final proportions before downloading.', 'Fill mode crops the edges to cover the complete canvas, while Fit mode preserves the entire image and adds a background colour where the proportions differ. All resizing happens locally in your browser.'],
    sections: [
      { heading: 'Accurate social media image sizes', paragraphs: ['Use square, portrait, story, landscape, thumbnail and pin presets for everyday publishing workflows. Each exported file uses the exact dimensions displayed in the interface.'] },
      { heading: 'Choose between cropping and fitting', paragraphs: ['Fill is useful when edge-to-edge artwork matters and a small crop is acceptable. Fit is safer for logos, text and compositions that must remain fully visible, with a selectable colour filling the unused space.'] }
    ],
    steps: ['Add a PNG, JPEG or WebP image.', 'Choose a social platform preset and select Fill or Fit.', 'Pick the output format and quality, then download the correctly sized image.'],
    faqs: [
      { question: 'Which social media sizes are included?', answer: 'Presets include Instagram square and portrait, stories and reels, Facebook and LinkedIn posts, X posts, YouTube thumbnails and Pinterest pins.' },
      { question: 'Will Fill mode stretch my image?', answer: 'No. Fill preserves the aspect ratio and crops overflow from the centre rather than stretching the source.' },
      { question: 'Are social images uploaded?', answer: 'No. Resizing and export are completed locally in your browser.' }
    ]
  },
  'pdf-merge': {
    heading: 'Merge PDF files or extract selected pages',
    intro: ['Combine up to ten PDF documents into one file, arrange their order and download a single merged PDF. This is useful for assembling reports, applications, handovers and document packs.', 'Extractor mode creates a new PDF from selected pages or ranges such as 1-3, 5 and 8. The source documents are processed locally and are not uploaded to Penguino.'],
    sections: [
      { heading: 'Combine PDFs in the right order', paragraphs: ['Add multiple documents and move them up or down in the queue before merging. Every page from each source is copied into the output without flattening the original document into images.'] },
      { heading: 'Extract only the pages you need', paragraphs: ['Select one source PDF and enter individual page numbers, ranges or a mixture of both. You can also enter a descending range when pages need to appear in reverse order.'] }
    ],
    steps: ['Add one or more PDF files and choose Merge or Extract.', 'Arrange complete documents or select a source and enter page ranges.', 'Choose an output name and download the newly created PDF.'],
    faqs: [
      { question: 'Can I change the merge order?', answer: 'Yes. Use the up and down controls beside each document before creating the merged PDF.' },
      { question: 'How do I enter page ranges?', answer: 'Use commas between selections, for example 1-3, 5, 8. Page numbers start at one, matching the pages shown in normal PDF viewers.' },
      { question: 'Do PDF files leave my device?', answer: 'No. Merging and extraction use browser memory and local file downloads.' }
    ]
  },
  qr: {
    heading: 'Generate a QR code as PNG or SVG',
    intro: ['Turn a website address, contact link, short message or other text into a scannable QR code. The preview updates automatically as you edit the content, colours and quiet zone.', 'Download a high-resolution PNG for documents and graphics or a scalable SVG for print and flexible design work. No content is sent to a QR code service.'],
    sections: [
      { heading: 'Customise QR code colours and resilience', paragraphs: ['Choose foreground and background colours with enough contrast for reliable scanning. Error correction controls how much of a damaged or obscured code may still be recoverable, with higher levels producing a denser pattern.'] },
      { heading: 'Export QR codes for print and web', paragraphs: ['PNG exports are available at several pixel sizes. SVG remains sharp at any scale and is often the best option for professional layout or print software.'] }
    ],
    steps: ['Enter the URL or text the QR code should contain.', 'Choose colours, quiet-zone margin, error correction and PNG size.', 'Test the preview with a phone, then download PNG or SVG.'],
    faqs: [
      { question: 'Do Penguino QR codes expire?', answer: 'No. The destination is encoded directly into the image, so there is no Penguino redirect or subscription. The destination itself must remain available.' },
      { question: 'Which export should I use for print?', answer: 'SVG is usually best for print because it scales without becoming pixelated. Always test the finished printed code.' },
      { question: 'Is my QR content tracked?', answer: 'No. The code is generated locally and Penguino does not create a tracking redirect.' }
    ]
  },
  'svg-optimise': {
    heading: 'Optimise SVG files and remove unnecessary code',
    intro: ['Reduce SVG file size by cleaning editor metadata, redundant attributes, unnecessary groups and inefficient path data. Smaller SVG files can improve website delivery while remaining resolution independent.', 'Compare the original and optimised artwork before downloading. Multipass mode searches for additional savings, while readable output keeps the resulting markup easier to inspect.'],
    sections: [
      { heading: 'Smaller vector assets for websites', paragraphs: ['Design applications often save production metadata and verbose markup that browsers do not need. SVG optimisation simplifies this code while preserving the rendered vector artwork.'] },
      { heading: 'Review every optimised SVG', paragraphs: ['The visual comparison helps catch unusual files that depend on editor-specific markup. Keep the original source and verify complex filters, animation, embedded fonts and scripts before replacing a production asset.'] }
    ],
    steps: ['Choose an SVG file up to 5 MB.', 'Select multipass optimisation and readable code preferences.', 'Optimise, compare both previews and download the smaller SVG.'],
    faqs: [
      { question: 'Does SVG optimisation change image dimensions?', answer: 'It is designed to simplify markup without rasterising or resizing the vector artwork.' },
      { question: 'Why should I keep the original SVG?', answer: 'Complex SVG features can depend on specific markup. The original remains the safest editable source even when the optimised copy looks identical.' },
      { question: 'Is SVG code uploaded?', answer: 'No. The source is read and optimised inside your browser.' }
    ]
  },
  watermark: {
    heading: 'Add a custom text watermark to an image',
    intro: ['Place a copyright notice, account name, project label or other text over an image before sharing it. Adjust position, colour, size and opacity or repeat the watermark across the complete image.', 'The watermark is rendered into a new PNG, JPEG or WebP file at the original image dimensions. Your untouched source stays on your device.'],
    sections: [
      { heading: 'Create a visible but balanced watermark', paragraphs: ['A corner watermark can identify ownership without dominating the image. Repeated watermarks provide broader coverage for proofs and preview assets, while opacity helps keep underlying details visible.'] },
      { heading: 'Export at the original image size', paragraphs: ['Penguino draws the watermark over the full-resolution source rather than exporting the smaller preview shown on screen. Choose PNG for lossless graphics or JPEG and WebP for adjustable file size.'] }
    ],
    steps: ['Add a PNG, JPEG or WebP image.', 'Enter watermark text and choose position, size, colour, opacity or repeat mode.', 'Select an output format and download the full-resolution watermarked copy.'],
    faqs: [
      { question: 'Does the watermark resize my image?', answer: 'No. The downloaded image keeps the original pixel dimensions.' },
      { question: 'Can I repeat the watermark?', answer: 'Yes. Repeat mode covers the image with a diagonal text pattern and disables the single-position control.' },
      { question: 'Is watermarking a replacement for copyright protection?', answer: 'No. It can identify or discourage casual reuse, but it does not provide technical access control or legal advice.' }
    ]
  },
  split: {
    heading: 'Split an image into rows and columns',
    intro: ['Divide one image into an equal grid of up to six rows and six columns. The numbered preview makes each tile clear before the individual files are packaged into one ZIP download.', 'Image splitting is useful for social media grids, carousels, puzzles, print layouts, presentation panels and large artwork that needs to be divided into manageable sections.'],
    sections: [
      { heading: 'Create accurate image tiles', paragraphs: ['Penguino calculates every crop boundary from the source dimensions and preserves all pixels, including when a width or height does not divide evenly by the selected grid.'] },
      { heading: 'Download the complete grid as a ZIP', paragraphs: ['Tiles are named by row and column so they remain easy to arrange. Choose PNG, JPEG or WebP and add a filename prefix before processing the image locally.'] }
    ],
    steps: ['Add a PNG, JPEG or WebP image.', 'Choose the number of rows and columns and review the numbered grid.', 'Select a format and download every tile together as a ZIP.'],
    faqs: [
      { question: 'How many tiles can I create?', answer: 'Choose between one and six rows and one and six columns, for a maximum of 36 tiles.' },
      { question: 'Will any pixels be lost?', answer: 'No. Tile boundaries are rounded from the original dimensions so the full source is covered without gaps.' },
      { question: 'How are split images named?', answer: 'Each filename includes its row and column number, such as tile_r1_c2.png.' }
    ]
  }
} as const satisfies Record<string, ToolSeoContent>

export type ToolPage = keyof typeof toolSeoContent
