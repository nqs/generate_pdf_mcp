import { describe, it, expect } from "vitest";
import { shouldReturnInline, toBase64, generateKey } from "../src/storage/r2";

describe("generateKey", () => {
  it("produces keys in pdfs/{uuid}/{filename} format", () => {
    const key = generateKey("report.pdf");
    const parts = key.split("/");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("pdfs");
    // UUID v4 pattern
    expect(parts[1]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(parts[2]).toBe("report.pdf");
  });

  it("generates unique keys for the same filename", () => {
    const key1 = generateKey("doc.pdf");
    const key2 = generateKey("doc.pdf");
    expect(key1).not.toBe(key2);
  });
});

describe("shouldReturnInline", () => {
  it("returns true for files under default threshold (100KB)", () => {
    expect(shouldReturnInline(50000)).toBe(true);
  });

  it("returns false for files at or above default threshold", () => {
    expect(shouldReturnInline(102400)).toBe(false);
    expect(shouldReturnInline(200000)).toBe(false);
  });

  it("returns true for zero-byte files", () => {
    expect(shouldReturnInline(0)).toBe(true);
  });

  it("respects custom threshold", () => {
    expect(shouldReturnInline(5000, 10000)).toBe(true);
    expect(shouldReturnInline(15000, 10000)).toBe(false);
  });

  it("returns false at exact custom threshold", () => {
    expect(shouldReturnInline(10000, 10000)).toBe(false);
  });
});

describe("toBase64", () => {
  it("converts a simple Uint8Array to base64", () => {
    const input = new TextEncoder().encode("Hello, PDF!");
    const result = toBase64(input);
    expect(result).toBe(btoa("Hello, PDF!"));
  });

  it("handles empty input", () => {
    const result = toBase64(new Uint8Array(0));
    expect(result).toBe("");
  });

  it("handles binary data with all byte values", () => {
    const bytes = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      bytes[i] = i;
    }
    const result = toBase64(bytes);
    // Verify round-trip: decode base64 back and compare
    const decoded = atob(result);
    expect(decoded.length).toBe(256);
    for (let i = 0; i < 256; i++) {
      expect(decoded.charCodeAt(i)).toBe(i);
    }
  });
});

