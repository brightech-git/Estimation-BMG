// fonts.js
export const FONTS = {
  // Font A (default) - 12x24
  FONT_A: '\x1B\x4D\x00',
  // Font B (small) - 9x17
  FONT_B: '\x1B\x4D\x01',
  // Double height
  DOUBLE_HEIGHT: '\x1B\x21\x10',
  // Double width
  DOUBLE_WIDTH: '\x1B\x21\x20',
  // Bold on
  BOLD_ON: '\x1B\x21\x08',
  // Bold off
  BOLD_OFF: '\x1B\x21\x00',
  // Underline on
  UNDERLINE_ON: '\x1B\x21\x80',
  // Underline off
  UNDERLINE_OFF: '\x1B\x21\x00',
  // Left align
  ALIGN_LEFT: '\x1B\x61\x00',
  // Center align
  ALIGN_CENTER: '\x1B\x61\x01',
  // Right align
  ALIGN_RIGHT: '\x1B\x61\x02',
  // Normal text
  NORMAL: '\x1B\x21\x00',
  // Large text (double height + width)
  LARGE: '\x1B\x21\x30',
};

export const PRINTER_COMMANDS = {
  INIT: '\x1B\x40', // Initialize printer
  CUT: '\x1D\x56\x00', // Partial cut
  FEED_LINE: '\x0A', // Line feed
  FEED_LINES: (lines) => `\x1B\x64${String.fromCharCode(lines)}`, // Feed n lines
};