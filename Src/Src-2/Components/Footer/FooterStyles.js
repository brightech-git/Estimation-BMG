import { StyleSheet, Platform } from "react-native";
import { moderateScale } from "../../../Utills/Scalling"; // Adjust path as needed

export const createFooterStyles = (theme) => {
  const { COLORS, SIZES, FONTS } = theme;
  
  return StyleSheet.create({
    footer: {
      backgroundColor: COLORS.surface,
      paddingVertical: Platform.select({
        ios: moderateScale(10),
        android: moderateScale(8),
        default: moderateScale(10),
      }),
      paddingHorizontal: moderateScale(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: COLORS.borderColor,
      alignItems: "center",
      justifyContent: "center",
      minHeight: moderateScale(40),
      shadowColor: COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 1,
      shadowRadius: moderateScale(3),
      elevation: 4,
    },
    companyName: {
      fontSize: moderateScale(SIZES.fontSm),
      color: COLORS.primary,
      fontWeight: "600",
      textAlign: "center",
      ...FONTS.fontSm,
    },
  });
};

export default createFooterStyles;