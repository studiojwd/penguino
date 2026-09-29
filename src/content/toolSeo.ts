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
  }
} as const satisfies Record<string, ToolSeoContent>

export type ToolPage = keyof typeof toolSeoContent
