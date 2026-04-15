import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  GeneratePDFInputSchema,
  ContentElementSchema,
  validateGeneratePdfInput,
} from "../src/pdf/schemas.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validMinimalInput = {
  filename: "report.pdf",
  content: [{ type: "paragraph", text: "Hello world" }],
};

const validFullInput = {
  filename: "report.pdf",
  theme: "academic",
  pageSize: "Letter",
  content: [
    { type: "title", text: "My Report" },
    { type: "h1", text: "Introduction" },
    { type: "h2", text: "Background" },
    { type: "h3", text: "Details" },
    { type: "paragraph", text: "Some body text." },
    { type: "image", data: "aGVsbG8=", format: "png", caption: "Fig 1", width: 0.5 },
    { type: "image_url", url: "https://example.com/img.png", caption: "Fig 2", width: 1 },
    { type: "list", style: "bullet", items: ["one", "two"] },
    { type: "list", style: "numbered", items: ["first"] },
    { type: "table", headers: ["A", "B"], rows: [["1", "2"]] },
    { type: "page_break" },
    { type: "blockquote", text: "A wise quote." },
    { type: "divider" },
  ],
};

// ---------------------------------------------------------------------------
// Valid payloads
// ---------------------------------------------------------------------------

describe("GeneratePDFInputSchema — valid payloads", () => {
  it("accepts minimal input and applies defaults", () => {
    const result = GeneratePDFInputSchema.parse(validMinimalInput);
    expect(result.theme).toBe("professional");
    expect(result.pageSize).toBe("A4");
    expect(result.content).toHaveLength(1);
  });

  it("accepts a full input with all element types", () => {
    const result = GeneratePDFInputSchema.parse(validFullInput);
    expect(result.filename).toBe("report.pdf");
    expect(result.theme).toBe("academic");
    expect(result.content).toHaveLength(13);
  });
});

// ---------------------------------------------------------------------------
// Invalid payloads — top-level
// ---------------------------------------------------------------------------

describe("GeneratePDFInputSchema — invalid top-level", () => {
  it("rejects missing filename", () => {
    expect(() =>
      GeneratePDFInputSchema.parse({ content: [{ type: "divider" }] })
    ).toThrow();
  });

  it("rejects empty filename", () => {
    expect(() =>
      GeneratePDFInputSchema.parse({ filename: "", content: [{ type: "divider" }] })
    ).toThrow();
  });

  it("rejects empty content array", () => {
    expect(() =>
      GeneratePDFInputSchema.parse({ filename: "a.pdf", content: [] })
    ).toThrow();
  });

  it("rejects invalid theme", () => {
    expect(() =>
      GeneratePDFInputSchema.parse({
        filename: "a.pdf",
        theme: "fancy",
        content: [{ type: "divider" }],
      })
    ).toThrow();
  });

  it("rejects invalid pageSize", () => {
    expect(() =>
      GeneratePDFInputSchema.parse({
        filename: "a.pdf",
        pageSize: "Tabloid",
        content: [{ type: "divider" }],
      })
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Invalid payloads — content elements
// ---------------------------------------------------------------------------

describe("ContentElementSchema — invalid elements", () => {
  it("rejects unknown element type", () => {
    expect(() => ContentElementSchema.parse({ type: "video" })).toThrow();
  });

  it("rejects paragraph with missing text", () => {
    expect(() => ContentElementSchema.parse({ type: "paragraph" })).toThrow();
  });

  it("rejects image with missing data", () => {
    expect(() => ContentElementSchema.parse({ type: "image" })).toThrow();
  });

  it("rejects image with invalid format", () => {
    expect(() =>
      ContentElementSchema.parse({ type: "image", data: "abc", format: "gif" })
    ).toThrow();
  });

  it("rejects image width out of range", () => {
    expect(() =>
      ContentElementSchema.parse({ type: "image", data: "abc", width: 1.5 })
    ).toThrow();
    expect(() =>
      ContentElementSchema.parse({ type: "image", data: "abc", width: 0 })
    ).toThrow();
  });

  it("rejects image_url with invalid url", () => {
    expect(() =>
      ContentElementSchema.parse({ type: "image_url", url: "not-a-url" })
    ).toThrow();
  });

  it("rejects list with empty items", () => {
    expect(() =>
      ContentElementSchema.parse({ type: "list", style: "bullet", items: [] })
    ).toThrow();
  });

  it("rejects list with invalid style", () => {
    expect(() =>
      ContentElementSchema.parse({ type: "list", style: "dashed", items: ["a"] })
    ).toThrow();
  });

  it("rejects table with empty headers", () => {
    expect(() =>
      ContentElementSchema.parse({ type: "table", headers: [], rows: [["a"]] })
    ).toThrow();
  });

  it("rejects table with empty rows", () => {
    expect(() =>
      ContentElementSchema.parse({ type: "table", headers: ["A"], rows: [] })
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// validateGeneratePdfInput helper
// ---------------------------------------------------------------------------

describe("validateGeneratePdfInput", () => {
  it("returns typed result for valid input", () => {
    const result = validateGeneratePdfInput(validMinimalInput);
    expect(result.filename).toBe("report.pdf");
  });

  it("throws ZodError for invalid input", () => {
    expect(() => validateGeneratePdfInput({})).toThrow();
  });
});

