import { StyleSheet, Platform, StatusBar } from "react-native";
import { scale, verticalScale, moderateScale } from "../../Utills/Scalling"; // Adjust path as needed

export const createHeaderStyles = (theme) => {
  const { COLORS, SIZES, FONTS } = theme;
  
  return StyleSheet.create({
    gradientBackground: {
      borderBottomLeftRadius: moderateScale(SIZES.radius_lg),
      borderBottomRightRadius: moderateScale(SIZES.radius_lg),
      overflow: "hidden",
    },
    headerContainer: {
      backgroundColor: 'transparent', // Changed to transparent since gradient handles background
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: verticalScale(4) },
      shadowOpacity: 0.6,
      shadowRadius: moderateScale(8),
      elevation: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderColor,
      overflow: "hidden",
      position: "relative",
      height: verticalScale(80),
    },
    companySection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: scale(8),
      marginTop: scale(-25),
    },
    companyLogo: {
      width: scale(40),
      height: scale(40),
      marginRight: scale(8),
      borderRadius: moderateScale(20),
      marginTop: verticalScale(5),
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent background for better visibility
    },
    companyName: {
      color: COLORS.buttonText,
      fontSize: moderateScale(SIZES.h6),
      letterSpacing: scale(1.5),
      textShadowColor: COLORS.shadow,
      textShadowOffset: { width: 0, height: verticalScale(1) },
      textShadowRadius: moderateScale(8),
      ...FONTS.heading,
    },
    bottomSection: {
      paddingHorizontal: scale(SIZES.padding),
      paddingVertical: verticalScale(12),
      minHeight: verticalScale(70),
    },
    dateTimeContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: scale(18),
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeLabel: {
      color: COLORS.buttonText,
      marginRight: scale(8),
      ...FONTS.subheading,
      fontSize: moderateScale(SIZES.fontSm),
      textShadowColor: COLORS.shadow,
      textShadowOffset: { width: 0, height: verticalScale(1) },
      textShadowRadius: moderateScale(4),
    },
    dateText: {
      color: COLORS.buttonText,
      ...FONTS.text,
      fontSize: moderateScale(SIZES.font),
      textShadowColor: COLORS.shadow,
      textShadowOffset: { width: 0, height: verticalScale(1) },
      textShadowRadius: moderateScale(4),
    },
  });
};

export default createHeaderStyles;