import { Dimensions } from "react-native";
import { DEVICE, moderateScale } from "./Scalling";

const { width, height } = Dimensions.get("screen");

/* -------------------------------------------------------------------------- */
/* 🎨 PURE WHITE & TRUE BLACK COLOR SCHEMES                                   */
/* -------------------------------------------------------------------------- */
export const LIGHT_COLORS = {
  /* -------------------------------------------------------------------------- */
  /* 🎨 BASE COLORS                                                            */
  /* -------------------------------------------------------------------------- */
  background: "#FFFFFF",          // Clean white background
  card: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceVariant: "#F5F7FA",

  /* -------------------------------------------------------------------------- */
  /* 🎨 BRAND COLORS                                                           */
  /* -------------------------------------------------------------------------- */
  primary: "#1C467C",             // Main brand blue
  primaryLight: "rgba(28,70,124,0.15)",
  secondary: "#3A6EA5",           // Complementary blue
  notification: "#C98900",
  success: "#1B9721",
  danger: "#C62828",
  warning: "#FFA000",
  info: "#1565C0",

  /* -------------------------------------------------------------------------- */
  /* 📝 TEXT COLORS                                                            */
  /* -------------------------------------------------------------------------- */
  title: "#0D1B2A",               // Slightly tinted dark for better contrast
  text: "#1A1A1A",                // Smooth readable text
  textLight: "#4A4A4A",
  label: "#666666",
  placeholder: "rgba(0,0,0,0.35)",

  /* -------------------------------------------------------------------------- */
  /* 🎨 MISC COLORS                                                            */
  /* -------------------------------------------------------------------------- */
  borderColor: "#8a8a8aff",
  outline: "#E5E5E5",
  shadow: "rgba(28,70,124,0.08)",  // Soft shadow tinted with theme color
  overlay: "rgba(0,0,0,0.2)",
  input: "#F7F9FC",
  darkInput: "#EFF2F7",
  buttonText: "#FFFFFF",

  /* -------------------------------------------------------------------------- */
  /* 🔵 ICONS & GRADIENTS                                                      */
  /* -------------------------------------------------------------------------- */
  iconPrimary: "#1C467C",
  iconSecondary: "#6C757D",
  

  gradientPrimary: ["#1C467C", "#3A6EA5"],  // Brand gradient
  gradientSecondary: ["#ffffffff", "#ffffffff"],
  gradientText: ["#ffffffff", "#3A6EA5"],
};


export const DARK_COLORS = {
  background: "#000000",         // True black
  card: "#0A0A0A",
  surface: "#0F0F0F",
  surfaceVariant: "#1A1A1A",
  primary: "#8CBBFF",
  primaryLight: "rgba(140,187,255,0.15)",
  secondary: "#90CAF9",
  notification: "#FFD54F",
  success: "#66BB6A",
  danger: "#EF5350",
  warning: "#FFB300",
  info: "#29B6F6",
  title: "#FFFFFF",
  text: "#EDEDED",               // Soft white text for readability
  textLight: "#BBBBBB",
  label: "#999999",
  placeholder: "rgba(255,255,255,0.5)",
  white: "#FFFFFF",
  black: "#000000",
  borderColor: "#808080ff",
  outline: "#2C2C2C",
  shadow: "rgba(255,255,255,0.05)",
  overlay: "rgba(255,255,255,0.08)",
  input: "#1C1C1C",
  darkInput: "#2A2A2A",
  buttonText: "#FFFFFF",
  iconPrimary: "#C5A572",
  iconSecondary: "#AAAAAA",
  gradientPrimary: ["#000000", "#1A1A1A"],
  gradientSecondary: ["#1A1A1A", "#2C2C2C"],
  gradientText: ["#FFFFFF", "#BBBBBB"],
};

/* -------------------------------------------------------------------------- */
/* 🔢 SIZES & FONTS                                                          */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/* 🧾 FUNCTION TO BUILD FONTS BASED ON COLOR PALETTE                          */
/* -------------------------------------------------------------------------- */
export const createFonts = (COLORS) => ({
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
  subheading: { fontFamily: "DMSerif",  },
  body: { fontFamily: "DancingScript" },
  text: { fontFamily: "Domine", },
});

/* -------------------------------------------------------------------------- */
/* 🧠 FUNCTION TO BUILD THEME (LIGHT OR DARK)                                 */
/* -------------------------------------------------------------------------- */
export const getAppTheme = (isDarkMode = false) => {
  const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  const FONTS = createFonts(COLORS);
  return { COLORS, SIZES, FONTS, DEVICE, isDarkMode };
};

/* -------------------------------------------------------------------------- */
/* 🚀 Default Export (Light by default)                                       */
/* -------------------------------------------------------------------------- */
const appTheme = getAppTheme(false);
export default appTheme;
