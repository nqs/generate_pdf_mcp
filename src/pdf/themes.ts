import { StandardFonts } from "pdf-lib";
import type { FontFamily, PageSize, StyleSheet } from "./types";

export interface ThemeConfig {
  fontFamily: StandardFonts;
  boldFontFamily: StandardFonts;
  fontSize: {
    title: number;
    h1: number;
    h2: number;
    h3: number;
    body: number;
  };
  colors: {
    title: string;
    heading: string;
    body: string;
    accent: string;
  };
  margins: { top: number; right: number; bottom: number; left: number };
  lineHeight: number;
}

export const DEFAULT_STYLE: ThemeConfig = {
  fontFamily: StandardFonts.Helvetica,
  boldFontFamily: StandardFonts.HelveticaBold,
  fontSize: { title: 28, h1: 22, h2: 18, h3: 15, body: 11 },
  colors: {
    title: "#1a1a2e",
    heading: "#1a1a2e",
    body: "#333333",
    accent: "#2563eb",
  },
  margins: { top: 60, right: 60, bottom: 60, left: 60 },
  lineHeight: 1.4,
};

const fontMap: Record<FontFamily, { regular: StandardFonts; bold: StandardFonts }> = {
  Helvetica: { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold },
  TimesRoman: { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold },
  Courier: { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold },
};

export function resolveStyle(partial?: StyleSheet): ThemeConfig {
  if (!partial) {
    return { ...DEFAULT_STYLE };
  }

  const fonts = partial.fontFamily
    ? fontMap[partial.fontFamily]
    : { regular: DEFAULT_STYLE.fontFamily, bold: DEFAULT_STYLE.boldFontFamily };

  return {
    fontFamily: fonts.regular,
    boldFontFamily: fonts.bold,
    fontSize: {
      ...DEFAULT_STYLE.fontSize,
      ...partial.fontSize,
    },
    colors: {
      ...DEFAULT_STYLE.colors,
      ...partial.colors,
    },
    margins: {
      ...DEFAULT_STYLE.margins,
      ...partial.margins,
    },
    lineHeight: partial.lineHeight ?? DEFAULT_STYLE.lineHeight,
  };
}

const pageDimensions: Record<PageSize, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  Legal: [612, 1008],
};

export function getPageDimensions(size: string): [number, number] {
  const dims = pageDimensions[size as PageSize];
  if (!dims) {
    return pageDimensions.Letter;
  }
  return dims;
}

