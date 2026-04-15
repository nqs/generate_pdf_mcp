// PDF content types — will be fully defined in the types/schema task
export type PageSize = "A4" | "Letter" | "Legal";
export type ThemeName = "professional" | "minimal" | "academic";
export type ListStyle = "bullet" | "numbered";
export type ImageFormat = "png" | "jpg";

export interface ContentElement {
  type: string;
  [key: string]: unknown;
}

export interface GeneratePDFInput {
  filename: string;
  theme?: ThemeName;
  pageSize?: PageSize;
  content: ContentElement[];
}

export interface GeneratePDFOutput {
  success: boolean;
  filename: string;
  download_url: string;
  expires_in: number;
  size_bytes: number;
  pages: number;
}

