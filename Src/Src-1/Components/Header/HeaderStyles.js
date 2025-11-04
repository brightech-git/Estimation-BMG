import { StyleSheet, Platform, Dimensions } from "react-native";
import { scale, verticalScale, moderateScale } from "../../Utills/Scalling";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;

/**
 * Responsive font sizes
 */
const FONT_SIZES = {
  small: isTablet ? 16 : 12,
  medium: isTablet ? 18 : 14,
  large: isTablet ? 22 : 16,
  heading: isTablet ? 24 : 16,
};

export default function getStyles(theme) {
  const { COLORS, FONTS, SIZES } = theme;

  return StyleSheet.create({
    /* --------------------------------------------------------------------- */
    /* GRADIENT BACKGROUND                                                   */
    /* --------------------------------------------------------------------- */
    gradientBackground: {
      flex: 1,
      borderBottomLeftRadius: moderateScale(12),
      borderBottomRightRadius: moderateScale(12),
      marginBottom: verticalScale(10),
      paddingTop: Platform.OS === "ios" ? verticalScale(30) : verticalScale(10),
    },

    scrollContainer: {
      paddingVertical: verticalScale(5),
      paddingHorizontal: scale(10),
      alignItems: "center",
    },

    /* --------------------------------------------------------------------- */
    /* LOADER                                                                */
    /* --------------------------------------------------------------------- */
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loaderText: {
      ...FONTS.font,
      color: COLORS.text,
      marginTop: 8,
      textAlign: "center",
    },

    /* --------------------------------------------------------------------- */
    /* HEADER SECTION                                                        */
    /* --------------------------------------------------------------------- */
    topSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: verticalScale(8),
      paddingHorizontal: scale(10),
      position: "relative",
    },

    iconContainer: {
      padding: scale(6),
    },
    iconSize: isTablet ? 36 : 28,

    /* --------------------------------------------------------------------- */
    /* COMPANY SECTION                                                       */
    /* --------------------------------------------------------------------- */
    companySection: {
      position: "absolute",
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      pointerEvents: "none",
    },
    companyLogo: {
      width: isTablet ? scale(50) : scale(30),
      height: isTablet ? scale(50) : scale(30),
      marginRight: scale(8),
      borderRadius: moderateScale(15),
    },
    companyName: {
      maxWidth: "70%",
      textAlign: "center",
      color: COLORS.buttonText,
      fontSize: FONT_SIZES.heading,
      letterSpacing: scale(1),
      ...FONTS.heading,
    },

    /* --------------------------------------------------------------------- */
    /* INFO CARD                                                             */
    /* --------------------------------------------------------------------- */
    infoCard: {
      backgroundColor: theme.isDarkMode
        ? COLORS.surfaceVariant
        : "rgba(255,255,255,0.95)",
      borderRadius: moderateScale(12),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(15),
      width: "100%",
      elevation: 3,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    infoSection: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: verticalScale(6),
      borderBottomWidth: 0.3,
      borderBottomColor: COLORS.borderColor,
    },
    label: {
      ...FONTS.subheading,
      color: COLORS.text,
      marginRight: scale(8),
      fontSize: SIZES.h6,
    },
    value: {
      ...FONTS.text,
      color: COLORS.primary,
      fontWeight: "600",
    },
    updatedText: {
      marginTop: verticalScale(8),
      textAlign: "right",
      color: COLORS.textLight,
      fontSize: FONT_SIZES.small,
      ...FONTS.text,
    },

    /* --------------------------------------------------------------------- */
    /* DRAWER – FIXED POSITION & ALIGNMENT                                   */
   /* -------------------------------------------------------------------------- */
/* 🎚️ FIXED DRAWER STYLES — FULL BACKGROUND + SMOOTH CONTENT DISPLAY         */
/* -------------------------------------------------------------------------- */
drawerOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0, 0, 0, 0.38)",
  zIndex: 1000,
},

drawerContainer: {
  position: "absolute",
  top: 0,
  right: 0,
  width: width * 0.75, // 75% of screen width
  height: 850, // Fixed height
  backgroundColor: theme.isDarkMode
    ? COLORS.surface
    : COLORS.background, // ✅ Use theme background (or "#000" for solid)
  borderTopLeftRadius: moderateScale(20),
  borderBottomLeftRadius: moderateScale(20),
  paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(30),
  paddingHorizontal: scale(15),
  elevation: 20,
  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 15,
  shadowOffset: { width: -4, height: 0 },
  zIndex: 2000,
  overflow: "hidden", // ✅ Ensures background fills entire drawer
},

closeDrawer: {
  position: "absolute",
  top: Platform.OS === "ios" ? verticalScale(40) : verticalScale(20), // small top margin
  right: scale(15),                                                  // aligns to right edge
  zIndex: 2100,
  padding: scale(6),
  backgroundColor: "rgba(0,0,0,0.05)",                               // light touch background
  borderRadius: moderateScale(20),
  alignSelf: "flex-end",                                             // ensures right alignment
},


drawerHeader: {
  alignItems: "center",
  marginBottom: verticalScale(30),
  paddingBottom: verticalScale(15),
  borderBottomWidth: 0.6,
  borderBottomColor: COLORS.borderColor,
},

drawerLogo: {
  width: scale(70),
  height: scale(70),
  borderRadius: moderateScale(14),
  marginBottom: verticalScale(8),
  backgroundColor: COLORS.surfaceVariant,
},

drawerCompanyName: {
  ...FONTS.h5,
  color: COLORS.primary,
  textAlign: "center",
  fontWeight: "700",
  letterSpacing: 0.5,
  fontSize: isTablet ? 20 : 17,
},

drawerItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: verticalScale(14),
  paddingHorizontal: scale(12),
  borderRadius: moderateScale(12),
  marginBottom: verticalScale(10),
  backgroundColor: theme.isDarkMode
    ? COLORS.surfaceVariant
    : "rgba(245,245,245,0.9)",
},

drawerText: {
  ...FONTS.fontLg,
  color: COLORS.text,
  marginLeft: scale(14),
  fontWeight: "600",
  fontSize: isTablet ? 18 : 15,
},

  });
}