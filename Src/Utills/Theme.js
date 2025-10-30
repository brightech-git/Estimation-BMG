// theme.js
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('screen');

// Colors
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

// Sizes
export const SIZES = {
  fontLg: 16,
  font: 14,
  fontSm: 13,
  fontXs: 12,
  radius_sm: 8,
  radius: 12,
  radius_lg: 16,
  padding: 16,
  margin: 16,
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  width,
  height,
};

// Fonts
export const FONTS = {
  fontLg: { fontSize: SIZES.fontLg, color: COLORS.text, lineHeight: 24, fontFamily: 'TimesNewRoman' },
  font: { fontSize: SIZES.font, color: COLORS.text, lineHeight: 20, fontFamily: 'TimesNewRoman' },
  fontSm: { fontSize: SIZES.fontSm, color: COLORS.text, lineHeight: 18, fontFamily: 'TimesNewRoman' },
  fontXs: { fontSize: SIZES.fontXs, color: COLORS.text, lineHeight: 16, fontFamily: 'TimesNewRoman' },

  h1: { fontSize: SIZES.h1, color: COLORS.title, fontFamily: 'TrajanProBold', lineHeight: 40 },
  h2: { fontSize: SIZES.h2, color: COLORS.title, fontFamily: 'TrajanProBold', lineHeight: 36 },
  h3: { fontSize: SIZES.h3, color: COLORS.title, fontFamily: 'DMSerif', lineHeight: 32 },
  h4: { fontSize: SIZES.h4, color: COLORS.title, fontFamily: 'DMSerif', lineHeight: 28 },
  h5: { fontSize: SIZES.h5, color: COLORS.title, fontFamily: 'DMSerif', lineHeight: 26 },
  h6: { fontSize: SIZES.h6, color: COLORS.title, fontFamily: 'DMSerif', lineHeight: 24 },

  heading: { fontFamily: 'TrajanProBold', lineHeight: 25 },
  subheading: { fontFamily: 'DMSerif', fontWeight: '500' },
  body: { fontFamily: 'DancingScript', fontWeight: '600' },
  text: { fontFamily: 'Domine', fontWeight: '400' },
};

// Export theme
const appTheme = { COLORS, SIZES, FONTS };
export default appTheme;
