// fonts.js
export const FONTS = {
  // Font A (default) - 12x24
  FONT_A: '\x1B\x4D\x00',
  // Font B (small) - 9x17
  FONT_B: '\x1B\x4D\x01',
  
  // Character styles
  NORMAL: '\x1B\x21\x00',
  BOLD_ON: '\x1B\x21\x08',
  BOLD_OFF: '\x1B\x21\x00',
  
  // Size combinations
  DOUBLE_HEIGHT: '\x1B\x21\x10',
  DOUBLE_WIDTH: '\x1B\x21\x20',
  DOUBLE_BOTH: '\x1B\x21\x30', // Double height + width
  
  // Underline
  UNDERLINE_ON: '\x1B\x21\x80',
  UNDERLINE_OFF: '\x1B\x21\x00',
  
  // Alignment
  ALIGN_LEFT: '\x1B\x61\x00',
  ALIGN_CENTER: '\x1B\x61\x01',
  ALIGN_RIGHT: '\x1B\x61\x02',
};

export const PRINTER_COMMANDS = {
  // Basic commands
  INIT: '\x1B\x40', // Initialize printer
  RESET: '\x1B\x3F\x0A\x00', // Reset printer
  
  // Paper handling
  CUT: '\x1D\x56\x00', // Partial cut
  FULL_CUT: '\x1D\x56\x01', // Full cut
  CUT_FEED: '\x1D\x56\x41\x00', // Cut with feed
  
  // Line spacing
  LINE_SPACING_DEFAULT: '\x1B\x32', // Default line spacing (≈30 dots)
  LINE_SPACING: (n) => `\x1B\x33${String.fromCharCode(n)}`, // Set line spacing to n dots
  
  // Feeding
  FEED_LINE: '\x0A', // Line feed
  FEED_LINES: (lines) => `\x1B\x64${String.fromCharCode(lines)}`, // Feed n lines
  FEED_DOTS: (dots) => `\x1B\x4A${String.fromCharCode(dots)}`, // Feed n dots
  
  // *** BITMAP PRINTING COMMANDS FOR LOGO ***
  
  // Bit image mode (for logos)
  BIT_IMAGE_MODE: '\x1B\x2A',
  BIT_IMAGE_MODE_8DOT: '\x1B\x2A\x00', // 8-dot single density
  BIT_IMAGE_MODE_24DOT: '\x1B\x2A\x21', // 24-dot single density (recommended for logos)
  BIT_IMAGE_MODE_DOUBLE_DENSITY: '\x1B\x2A\x01', // 8-dot double density
  BIT_IMAGE_MODE_DOUBLE_DENSITY_24: '\x1B\x2A\x22', // 24-dot double density
  
  // Raster bit image (alternative method)
  RASTER_BIT_IMAGE: '\x1D\x76\x30\x00',
  
  // *** STORED LOGO COMMANDS ***
  // These are for printers that support storing logos in NV memory
  PRINT_STORED_LOGO1: '\x1B\x2A\x01', // Print logo in key code 1
  PRINT_STORED_LOGO2: '\x1B\x2A\x02', // Print logo in key code 2
  STORE_LOGO: '\x1B\x2A', // Store logo command (varies by printer)
  
  // *** GRAPHICS COMMANDS ***
  SELECT_BIT_IMAGE_MODE: '\x1B\x2A\x33',
  SET_LINE_SPACING_24: '\x1B\x33\x18', // Set line spacing to 24 dots (for graphics)
  
  // *** BARCODE COMMANDS ***
  BARCODE_HEIGHT: (height) => `\x1D\x68${String.fromCharCode(height)}`,
  BARCODE_WIDTH: (width) => `\x1D\x77${String.fromCharCode(width)}`,
  BARCODE_TEXT_BELOW: '\x1D\x48\x02', // Print barcode text below
  BARCODE_TEXT_NONE: '\x1D\x48\x00', // Don't print barcode text
  BARCODE_UPC_A: '\x1D\x6B\x00', // UPC-A barcode
  BARCODE_CODE39: '\x1D\x6B\x04', // CODE39 barcode
  
  // *** QR CODE COMMANDS ***
  QR_CODE_MODEL2: '\x1D\x28\x6B\x04\x00\x31\x41\x32\x00', // QR Code Model 2
  QR_CODE_SIZE: (size) => `\x1D\x28\x6B\x03\x00\x31\x43${String.fromCharCode(size)}`, // QR size (1-8)
  QR_CODE_ERROR_CORRECTION: (level) => `\x1D\x28\x6B\x03\x00\x31\x45${String.fromCharCode(level + 48)}`, // Error correction L=0, M=1, Q=2, H=3
  QR_CODE_STORE_DATA: (data) => {
    const len = data.length + 3;
    const pL = len % 256;
    const pH = Math.floor(len / 256);
    return `\x1D\x28\x6B${String.fromCharCode(pL)}${String.fromCharCode(pH)}${String.fromCharCode(0x31)}${String.fromCharCode(0x50)}${String.fromCharCode(0x30)}${data}`;
  },
  QR_CODE_PRINT: '\x1D\x28\x6B\x03\x00\x31\x51\x30', // Print QR code
};

// *** PRE-DEFINED LOGO DATA ***
// Example: Simple 48px wide BMG logo pattern
// You'll need to replace this with your actual converted logo data
export const LOGO_DATA = {
  // Simple diamond pattern (48px wide, 24px high)
  BMG_SIMPLE: [
    [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0x00, 0x01, 0x80, 0x00, 0x00],
    [0x00, 0x00, 0x03, 0xC0, 0x00, 0x00],
    [0x00, 0x00, 0x07, 0xE0, 0x00, 0x00],
    [0x00, 0x00, 0x0F, 0xF0, 0x00, 0x00],
    [0x00, 0x00, 0x1F, 0xF8, 0x00, 0x00],
    [0x00, 0x00, 0x3F, 0xFC, 0x00, 0x00],
    [0x00, 0x00, 0x7F, 0xFE, 0x00, 0x00],
    [0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00],
    [0x00, 0x01, 0xFF, 0xFF, 0x80, 0x00],
    [0x00, 0x03, 0xFF, 0xFF, 0xC0, 0x00],
    [0x00, 0x07, 0xFF, 0xFF, 0xE0, 0x00],
    [0x00, 0x0F, 0xFF, 0xFF, 0xF0, 0x00],
    [0x00, 0x1F, 0xFF, 0xFF, 0xF8, 0x00],
    [0x00, 0x3F, 0xFF, 0xFF, 0xFC, 0x00],
    [0x00, 0x7F, 0xFF, 0xFF, 0xFE, 0x00],
    [0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0x00],
    [0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0x80],
    [0x03, 0xFF, 0xFF, 0xFF, 0xFF, 0xC0],
    [0x07, 0xFF, 0xFF, 0xFF, 0xFF, 0xE0],
    [0x0F, 0xFF, 0xFF, 0xFF, 0xFF, 0xF0],
    [0x1F, 0xFF, 0xFF, 0xFF, 0xFF, 0xF8],
    [0x3F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFC],
    [0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFE],
  ],
  
  // Text-based logo fallback
  BMG_TEXT: "💎 BMG JEWELLERS 💎"
};

// *** HELPER FUNCTIONS FOR LOGO PRINTING ***

// Function to print a bitmap logo
export const printBitmapLogo = (logoArray) => {
  let commands = '';
  
  // Set to bitmap mode
  commands += PRINTER_COMMANDS.BIT_IMAGE_MODE_24DOT;
  
  // Calculate width (each subarray represents a column)
  const width = logoArray[0].length;
  const height = logoArray.length;
  
  // Send width (low byte and high byte)
  const widthLow = width & 0xFF;
  const widthHigh = (width >> 8) & 0xFF;
  
  commands += String.fromCharCode(widthLow) + String.fromCharCode(widthHigh);
  
  // Send bitmap data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      commands += String.fromCharCode(logoArray[y][x]);
    }
  }
  
  return commands;
};

// Function to create simple text logo with styling
export const printTextLogo = () => {
  let commands = '';
  
  commands += FONTS.ALIGN_CENTER;
  commands += FONTS.BOLD_ON + FONTS.DOUBLE_BOTH;
  commands += "💎 BMG JEWELLERS 💎\n";
  commands += FONTS.NORMAL;
  commands += FONTS.ALIGN_CENTER;
  commands += FONTS.BOLD_ON;
  commands += "Trusted Since 1985\n";
  commands += FONTS.NORMAL;
  commands += "--------------------------------\n";
  
  return commands;
};

// Function to print QR code
export const printQRCode = (data) => {
  let commands = '';
  
  commands += FONTS.ALIGN_CENTER;
  commands += PRINTER_COMMANDS.QR_CODE_MODEL2;
  commands += PRINTER_COMMANDS.QR_CODE_SIZE(4); // Size 4 (medium)
  commands += PRINTER_COMMANDS.QR_CODE_ERROR_CORRECTION(2); // Error correction level Q
  commands += PRINTER_COMMANDS.QR_CODE_STORE_DATA(data);
  commands += PRINTER_COMMANDS.QR_CODE_PRINT;
  commands += PRINTER_COMMANDS.FEED_LINES(1);
  
  return commands;
};