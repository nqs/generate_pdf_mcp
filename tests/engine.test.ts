import { describe, it, expect, beforeEach } from "vitest";
import { PDFLayoutEngine } from "../src/pdf/engine";
import { DEFAULT_STYLE, resolveStyle, getPageDimensions } from "../src/pdf/themes";

describe("PDFLayoutEngine", () => {
  let engine: PDFLayoutEngine;

  beforeEach(async () => {
    engine = new PDFLayoutEngine({ pageSize: "Letter" });
    await engine.initialize();
  });

  it("creates a PDF document with one page", () => {
    expect(engine.getDoc()).toBeDefined();
    expect(engine.getPageCount()).toBe(1);
    expect(engine.getCurrentPage()).toBeDefined();
  });

  it("initializes cursor at pageHeight - margins.top", () => {
    const [, height] = getPageDimensions("Letter");
    expect(engine.getCursorY()).toBe(height - DEFAULT_STYLE.margins.top);
  });

  it("tracks cursor position when moving", () => {
    const startY = engine.getCursorY();
    engine.moveCursor(50);
    expect(engine.getCursorY()).toBe(startY - 50);
  });

  it("calculates contentWidth correctly", () => {
    const [width] = getPageDimensions("Letter");
    expect(engine.contentWidth).toBe(width - DEFAULT_STYLE.margins.left - DEFAULT_STYLE.margins.right);
  });

  it("calculates remainingSpace correctly", () => {
    const [, height] = getPageDimensions("Letter");
    const expectedRemaining = height - DEFAULT_STYLE.margins.top - DEFAULT_STYLE.margins.bottom;
    expect(engine.remainingSpace).toBe(expectedRemaining);
  });

  it("adds a new page and resets cursor", () => {
    engine.moveCursor(200);
    const cursorBefore = engine.getCursorY();
    engine.addPage();
    expect(engine.getPageCount()).toBe(2);
    expect(engine.getCursorY()).toBeGreaterThan(cursorBefore);
  });

  it("ensureSpace triggers new page when not enough room", () => {
    const [, height] = getPageDimensions("Letter");
    const usableHeight = height - DEFAULT_STYLE.margins.top - DEFAULT_STYLE.margins.bottom;
    engine.moveCursor(usableHeight - 10); // only 10pt left
    expect(engine.getPageCount()).toBe(1);

    engine.ensureSpace(50); // needs 50pt, only 10pt available
    expect(engine.getPageCount()).toBe(2);
    expect(engine.getCursorY()).toBe(height - DEFAULT_STYLE.margins.top);
  });

  it("ensureSpace does NOT add page when enough room", () => {
    engine.ensureSpace(50);
    expect(engine.getPageCount()).toBe(1);
  });

  it("multi-page generation produces correct page count", () => {
    const [, height] = getPageDimensions("Letter");
    const usableHeight = height - DEFAULT_STYLE.margins.top - DEFAULT_STYLE.margins.bottom;

    for (let i = 0; i < 5; i++) {
      engine.ensureSpace(20);
      engine.moveCursor(usableHeight);
    }
    expect(engine.getPageCount()).toBe(5);
  });

  it("embeds fonts from theme", () => {
    expect(engine.getFont()).toBeDefined();
    expect(engine.getBoldFont()).toBeDefined();
  });

  it("returns theme configuration with default style", () => {
    const theme = engine.getTheme();
    expect(theme.fontSize.body).toBe(11);
    expect(theme.colors.accent).toBe("#2563eb");
  });

  it("accepts style overrides", async () => {
    const customEngine = new PDFLayoutEngine({
      pageSize: "Letter",
      style: { fontFamily: "Courier", lineHeight: 1.8 },
    });
    await customEngine.initialize();
    const theme = customEngine.getTheme();
    expect(theme.lineHeight).toBe(1.8);
    // font family should be resolved to StandardFonts.Courier
    expect(theme.fontSize.body).toBe(11); // default preserved
  });

  it("saves PDF as Uint8Array", async () => {
    const bytes = await engine.save();
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
  });
});

describe("resolveStyle", () => {
  it("returns default style when no partial provided", () => {
    const theme = resolveStyle();
    expect(theme.fontSize.body).toBe(DEFAULT_STYLE.fontSize.body);
    expect(theme.colors.accent).toBe(DEFAULT_STYLE.colors.accent);
  });

  it("deep-merges partial style with defaults", () => {
    const theme = resolveStyle({ fontSize: { title: 40 }, lineHeight: 2.0 });
    expect(theme.fontSize.title).toBe(40);
    expect(theme.fontSize.body).toBe(11); // default preserved
    expect(theme.lineHeight).toBe(2.0);
  });

  it("returns correct page dimensions", () => {
    expect(getPageDimensions("A4")).toEqual([595.28, 841.89]);
    expect(getPageDimensions("Letter")).toEqual([612, 792]);
    expect(getPageDimensions("Legal")).toEqual([612, 1008]);
  });

  it("defaults to Letter for unknown page size", () => {
    expect(getPageDimensions("unknown")).toEqual([612, 792]);
  });
});

