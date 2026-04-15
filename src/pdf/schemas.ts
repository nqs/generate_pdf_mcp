// ---------------------------------------------------------------------------
// PDF content model — Zod validation schemas
// ---------------------------------------------------------------------------

import { z } from "zod";
import type {
  ContentElement,
  GeneratePDFInput,
} from "./types.js";

// ---------------------------------------------------------------------------
// Enums / primitives
// ---------------------------------------------------------------------------

export const PageSizeSchema = z.enum(["A4", "Letter", "Legal"]);
export const ThemeNameSchema = z.enum(["professional", "minimal", "academic"]);
export const ListStyleSchema = z.enum(["bullet", "numbered"]);
export const ImageFormatSchema = z.enum(["png", "jpg"]);

// ---------------------------------------------------------------------------
// Individual content-element schemas
// ---------------------------------------------------------------------------

export const TitleSchema = z.object({
  type: z.literal("title"),
  text: z.string().min(1),
});

export const H1Schema = z.object({
  type: z.literal("h1"),
  text: z.string().min(1),
});

export const H2Schema = z.object({
  type: z.literal("h2"),
  text: z.string().min(1),
});

export const H3Schema = z.object({
  type: z.literal("h3"),
  text: z.string().min(1),
});

export const ParagraphSchema = z.object({
  type: z.literal("paragraph"),
  text: z.string().min(1),
});

export const ImageSchema = z.object({
  type: z.literal("image"),
  data: z.string().min(1),
  format: ImageFormatSchema.optional(),
  caption: z.string().optional(),
  width: z.number().gt(0).lte(1).optional(),
});

export const ImageUrlSchema = z.object({
  type: z.literal("image_url"),
  url: z.string().url(),
  caption: z.string().optional(),
  width: z.number().gt(0).lte(1).optional(),
});

export const ListSchema = z.object({
  type: z.literal("list"),
  style: ListStyleSchema,
  items: z.array(z.string()).min(1),
});

export const TableSchema = z.object({
  type: z.literal("table"),
  headers: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())).min(1),
});

export const PageBreakSchema = z.object({
  type: z.literal("page_break"),
});

export const BlockquoteSchema = z.object({
  type: z.literal("blockquote"),
  text: z.string().min(1),
});

export const DividerSchema = z.object({
  type: z.literal("divider"),
});

// ---------------------------------------------------------------------------
// Discriminated union of all content elements
// ---------------------------------------------------------------------------

export const ContentElementSchema = z.discriminatedUnion("type", [
  TitleSchema,
  H1Schema,
  H2Schema,
  H3Schema,
  ParagraphSchema,
  ImageSchema,
  ImageUrlSchema,
  ListSchema,
  TableSchema,
  PageBreakSchema,
  BlockquoteSchema,
  DividerSchema,
]);

// ---------------------------------------------------------------------------
// Top-level generate_pdf input schema
// ---------------------------------------------------------------------------

export const GeneratePDFInputSchema = z.object({
  filename: z.string().min(1),
  theme: ThemeNameSchema.optional().default("professional"),
  pageSize: PageSizeSchema.optional().default("A4"),
  content: z.array(ContentElementSchema).min(1),
});

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

/**
 * Parse and validate raw input for the `generate_pdf` tool.
 *
 * @returns Fully typed and validated input.
 * @throws {z.ZodError} When the input fails validation.
 */
export function validateGeneratePdfInput(input: unknown): GeneratePDFInput {
  return GeneratePDFInputSchema.parse(input) as GeneratePDFInput;
}

