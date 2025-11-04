// 📁 src/Utills/Theme.js
import { Dimensions } from "react-native";
import { DEVICE, moderateScale } from "./Scalling";

const { width, height } = Dimensions.get("screen");

// 🎨 Colors
export const COLORS = {
  background: "#FFFFFF",
  card: "#F9F9F9",
  surface: "#F5F5F5",
  surfaceVariant: "#EEEEEE",
  primary: "#1c467cff",
  primaryLight: "rgba(212, 175, 55, 0.15)",
  secondary: "#3A6EA5",
  notification: "#C98900",
  success: "#1b9721ff",
  danger: "#C62828",
  warning: "#FFA000",
  info: "#1565C0",
  title: "#333333",
  text: "#222222",
  textLight: "#666666",
  label: "#757575",
  placeholder: "rgba(0,0,0,0.4)",
  white: "#FFFFFF",
  black: "#000000",
  borderColor: "rgba(0,0,0,0.1)",
  outline: "#DDDDDD",
  shadow: "rgba(0,0,0,0.08)",
  overlay: "rgba(0,0,0,0.3)",
  input: "#F0F0F0",
  darkInput: "#E8E8E8",
  iconPrimary: "#C5A572",
  iconSecondary: "#888888",
  gradientPrimary: ["#D4AF37", "#8C6C3F"],
  gradientSecondary: ["rgba(197,165,114,0.15)", "#D4AF37"],
  gradientText: ["#2E6F95", "#C62828"],
};

// 🔢 Base sizes (auto-adjust for tablets)
const baseFont = DEVICE.isTablet ? 18 : 14;
const baseHeading = DEVICE.isTablet ? 22 : 16;

export const SIZES = {
  fontLg: baseFont + 2,
  font: baseFont,
  fontSm: baseFont - 1,
  fontXs: baseFont - 2,
  radius_sm: DEVICE.isTablet ? 12 : 8,
  radius: DEVICE.isTablet ? 18 : 12,
  radius_lg: DEVICE.isTablet ? 22 : 16,
  padding: DEVICE.isTablet ? 20 : 16,
  margin: DEVICE.isTablet ? 20 : 16,
  h1: baseHeading + 16,
  h2: baseHeading + 12,
  h3: baseHeading + 8,
  h4: baseHeading + 4,
  h5: baseHeading + 2,
  h6: baseHeading,
  width,
  height,
};

// 🧾 Fonts
export const FONTS = {
  fontLg: {
    fontSize: moderateScale(SIZES.fontLg),
    color: COLORS.text,
    lineHeight: DEVICE.isTablet ? 28 : 24,
    fontFamily: "TimesNewRoman",
  },
  font: {
    fontSize: moderateScale(SIZES.font),
    color: COLORS.text,
    lineHeight: DEVICE.isTablet ? 24 : 20,
    fontFamily: "TimesNewRoman",
  },
  fontSm: {
    fontSize: moderateScale(SIZES.fontSm),
    color: COLORS.text,
    lineHeight: DEVICE.isTablet ? 22 : 18,
    fontFamily: "TimesNewRoman",
  },
  fontXs: {
    fontSize: moderateScale(SIZES.fontXs),
    color: COLORS.text,
    lineHeight: DEVICE.isTablet ? 20 : 16,
    fontFamily: "TimesNewRoman",
  },

  // Headings
  h1: {
    fontSize: moderateScale(SIZES.h1),
    color: COLORS.title,
    fontFamily: "TrajanProBold",
    lineHeight: DEVICE.isTablet ? 48 : 40,
  },
  h2: {
    fontSize: moderateScale(SIZES.h2),
    color: COLORS.title,
    fontFamily: "TrajanProBold",
    lineHeight: DEVICE.isTablet ? 44 : 36,
  },
  h3: {
    fontSize: moderateScale(SIZES.h3),
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: DEVICE.isTablet ? 38 : 32,
  },
  h4: {
    fontSize: moderateScale(SIZES.h4),
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: DEVICE.isTablet ? 34 : 28,
  },
  h5: {
    fontSize: moderateScale(SIZES.h5),
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: DEVICE.isTablet ? 30 : 26,
  },
  h6: {
    fontSize: moderateScale(SIZES.h6),
    color: COLORS.title,
    fontFamily: "DMSerif",
    lineHeight: DEVICE.isTablet ? 28 : 24,
  },

  heading: { fontFamily: "TrajanProBold", lineHeight: DEVICE.isTablet ? 40 : 35 },
  subheading: { fontFamily: "DMSerif", fontWeight: "500" },
  body: { fontFamily: "DancingScript", fontWeight: "600" },
  text: { fontFamily: "Domine", fontWeight: "400" },
};

// 🚀 Export the combined theme
const appTheme = { COLORS, SIZES, FONTS, DEVICE };
export default appTheme;
