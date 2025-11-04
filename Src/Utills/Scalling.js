// 📁 src/Utills/Scalling.js
import { Dimensions, Platform, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

// 🔍 Determine if device is a tablet
const isTablet = Math.min(width, height) >= 600;

// ⚖️ Base guideline dimensions
const guidelineBaseWidth = isTablet ? 834 : 375;   // iPad Air width vs iPhone
const guidelineBaseHeight = isTablet ? 1194 : 812; // iPad Air height vs iPhone X

// 🔹 Scalers
export const scale = (size) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size) => (height / guidelineBaseHeight) * size;

// Smooth scaling to avoid overshoot on tablets
export const moderateScale = (size, factor = isTablet ? 0.7 : 0.5) =>
  size + (scale(size) - size) * factor;

// Export device info
export const DEVICE = {
  width,
  height,
  isTablet,
  isLandscape: width > height,
  pixelRatio: PixelRatio.get(),
  platform: Platform.OS,
};
