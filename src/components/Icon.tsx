import type { SVGProps } from 'react'

export type IconName =
  | 'home'
  | 'type'
  | 'resize'
  | 'convert'
  | 'upload'
  | 'download'
  | 'arrow'
  | 'menu'
  | 'search'
  | 'sparkles'
  | 'image'
  | 'close'
  | 'settings'
  | 'document'
  | 'favicon'
  | 'layers'
  | 'pdf'
  | 'shield'
  | 'archive'
  | 'palette'
  | 'star'
  | 'social'
  | 'merge'
  | 'qr'
  | 'svg'
  | 'watermark'
  | 'split'

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
}

const paths: Record<IconName, JSX.Element> = {
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
  type: <><path d="M5 5h14"/><path d="M12 5v14"/><path d="M8 19h8"/></>,
  resize: <><path d="M8 3H3v5"/><path d="m3 3 6 6"/><path d="M16 21h5v-5"/><path d="m21 21-6-6"/></>,
  convert: <><path d="M4 7h13"/><path d="m14 4 3 3-3 3"/><path d="M20 17H7"/><path d="m10 14-3 3 3 3"/></>,
  upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 15v5h16v-5"/></>,
  download: <><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/></>,
  arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
  sparkles: <><path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z"/><path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z"/><path d="m5 13 .8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13Z"/></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m3 16 5-4 4 3 3-2 6 5"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  document: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></>,
  favicon: <><path d="m12 3 2.5 5.3 5.5.8-4 4 .9 5.7-4.9-2.7-4.9 2.7.9-5.7-4-4 5.5-.8z"/></>,
  layers: <><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
  pdf: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M8 16v-5h2a1.5 1.5 0 0 1 0 3H8M13 16v-5h1.5a2.5 2.5 0 0 1 0 5H13"/></>,
  shield: <><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
  archive: <><path d="M4 7h16v13H4zM3 3h18v4H3z"/><path d="M9 11h6"/></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18h1.5a1.8 1.8 0 0 0 0-3.6h-1a1.8 1.8 0 0 1 0-3.6H15A6 6 0 0 0 15 3z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="9" cy="6.5" r=".8"/><circle cx="14" cy="6.5" r=".8"/></>,
  star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.3 6.1-.9z"/>,
  social: <><rect x="3" y="5" width="13" height="13" rx="2"/><path d="M8 18v3h13V10h-3M6 14l3-3 3 3 2-2 2 2"/></>,
  merge: <><path d="M5 3h9l4 4v13H5zM14 3v5h5"/><path d="M9 14h6M12 11v6"/></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM18 13v2M13 19h2v2"/></>,
  svg: <><path d="M6 3h8l4 4v14H6zM14 3v5h5"/><path d="m9 13-2 2 2 2M15 13l2 2-2 2M13 12l-2 6"/></>,
  watermark: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 16 5-4 4 3 3-2 6 5M7 9h10"/></>,
  split: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18"/></>
}

const Icon = ({ name, ...props }: IconProps) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" {...props}>
    {paths[name]}
  </svg>
)

export default Icon
