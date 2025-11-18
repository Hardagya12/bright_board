export function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

export function relativeLuminance([r, g, b]) {
  const srgb = [r, g, b].map((v) => v / 255);
  const adjust = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [R, G, B] = srgb.map(adjust);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(hexA, hexB) {
  const LA = relativeLuminance(hexToRgb(hexA));
  const LB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(LA, LB);
  const darker = Math.min(LA, LB);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isAccessible(hexText, hexBg, level = 'AA', fontSizePx = 16, isBold = false) {
  const ratio = contrastRatio(hexText, hexBg);
  const largeText = fontSizePx >= 18 || (fontSizePx >= 14 && isBold);
  if (level === 'AAA') return largeText ? ratio >= 4.5 : ratio >= 7;
  return largeText ? ratio >= 3 : ratio >= 4.5;
}