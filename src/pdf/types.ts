// ---------------------------------------------------------------------------
// PDF content model — TypeScript types
// ---------------------------------------------------------------------------

/** Supported page sizes for PDF generation. */
export type PageSize = "A4" | "Letter" | "Legal";

/** Built-in visual themes. */
export type ThemeName = "professional" | "minimal" | "academic";

/** List rendering style. */
export type ListStyle = "bullet" | "numbered";

/** Supported inline image formats. */
export type ImageFormat = "png" | "jpg";

/** Font families available in the standard PDF fonts. */
export type FontFamily = "Helvetica" | "TimesRoman" | "Courier";

// ---------------------------------------------------------------------------
// Page-size dimensions (in PDF points, 72 pts = 1 inch)
// ---------------------------------------------------------------------------

/** Width × height in points for each supported page size. */
export const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};

// ---------------------------------------------------------------------------
// RGB colour helper
// ---------------------------------------------------------------------------

/** An RGB colour expressed as values in the 0–1 range. */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

// ---------------------------------------------------------------------------
// Theme configuration
// ---------------------------------------------------------------------------

/** Full theme configuration controlling fonts, sizes, colours and margins. */
export interface ThemeConfig {
  titleSize: number;
  h1Size: number;
  h2Size: number;
  h3Size: number;
  bodySize: number;
  lineHeight: number;
  margins: { top: number; right: number; bottom: number; left: number };
  colors: { title: RGB; heading: RGB; body: RGB; accent: RGB };
  fontFamily: FontFamily;
}

// ---------------------------------------------------------------------------
// Content element types (discriminated union on `type`)
// ---------------------------------------------------------------------------

/** Document title element. */
export interface TitleElement {
  type: "title";
  text: string;
}

/** Level-1 heading. */
export interface H1Element {
  type: "h1";
  text: string;
}

/** Level-2 heading. */
export interface H2Element {
  type: "h2";
  text: string;
}

/** Level-3 heading. */
export interface H3Element {
  type: "h3";
  text: string;
}

/** Body paragraph. */
export interface ParagraphElement {
  type: "paragraph";
  text: string;
}

/** Inline base-64 image. */
export interface ImageElement {
  type: "image";
  /** Base-64 encoded image data. */
  data: string;
  /** Image format (defaults to "png"). */
  format?: ImageFormat;
  /** Optional caption rendered below the image. */
  caption?: string;
  /** Display width as a ratio of the available page width (0–1). */
  width?: number;
}

/** Remote image referenced by URL. */
export interface ImageUrlElement {
  type: "image_url";
  /** Absolute URL of the image to embed. */
  url: string;
  /** Optional caption rendered below the image. */
  caption?: string;
  /** Display width as a ratio of the available page width (0–1). */
  width?: number;
}

/** Bullet or numbered list. */
export interface ListElement {
  type: "list";
  style: ListStyle;
  items: string[];
}

/** Data table with headers and rows. */
export interface TableElement {
  type: "table";
  headers: string[];
  rows: string[][];
}

/** Explicit page break. */
export interface PageBreakElement {
  type: "page_break";
}

/** Block quotation. */
export interface BlockquoteElement {
  type: "blockquote";
  text: string;
}

/** Horizontal divider / rule. */
export interface DividerElement {
  type: "divider";
}

/** Union of every supported content element (discriminated on `type`). */
export type ContentElement =
  | TitleElement
  | H1Element
  | H2Element
  | H3Element
  | ParagraphElement
  | ImageElement
  | ImageUrlElement
  | ListElement
  | TableElement
  | PageBreakElement
  | BlockquoteElement
  | DividerElement;

// ---------------------------------------------------------------------------
// Top-level tool input / output
// ---------------------------------------------------------------------------

/** Input to the `generate_pdf` MCP tool. */
export interface GeneratePDFInput {
  /** Output filename (will be used as the R2 key). */
  filename: string;
  /** Visual theme (defaults to "professional"). */
  theme?: ThemeName;
  /** Page size (defaults to "A4"). */
  pageSize?: PageSize;
  /** Ordered list of content elements to render. */
  content: ContentElement[];
}

/** Successful response from the `generate_pdf` tool. */
export interface GeneratePDFOutput {
  success: boolean;
  filename: string;
  download_url: string;
  expires_in: number;
  size_bytes: number;
  pages: number;
}

