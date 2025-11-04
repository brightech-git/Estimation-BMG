// 📁 src/Screens/Login/LoginStyles.js
import { StyleSheet } from "react-native";
import { moderateScale } from "../../Utills/Scalling";

export const getStyles = (theme) => {
  const { COLORS, FONTS, SIZES } = theme;

  return StyleSheet.create({
    gradient: { flex: 1, width: "100%", height: "100%" },
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: SIZES.padding,
    },
    content: {
      width: "100%",
      alignItems: "center",
      maxWidth: moderateScale(480),
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: moderateScale(25),
    },
    title: {
      color: COLORS.warning,
      textAlign: "center",
      fontSize: moderateScale(28),
      letterSpacing: 4,
      ...FONTS.heading,
    },
    titleAccent: {
      color: COLORS.notification,
      ...FONTS.heading,
    },
    subtitle: {
      color: COLORS.textLight,
      marginTop: moderateScale(6),
      ...FONTS.body,
      fontSize: moderateScale(26),
    },
    formContainer: {
      width: "100%",
      borderRadius: SIZES.radius_lg,
      overflow: "hidden",
    },
    glassBackground: {
      borderRadius: SIZES.radius_lg,
      borderWidth: 1.5,
      borderColor: COLORS.borderColor,
    },
    formInner: { padding: SIZES.padding * 1.5 },
    formTitle: {
      color: COLORS.title,
      textAlign: "center",
      marginBottom: moderateScale(22),
      ...FONTS.h5,
    },
    input1: {
      width: "100%",
      height: moderateScale(54),
      paddingHorizontal: moderateScale(16),
      backgroundColor: COLORS.input,
      borderRadius: SIZES.radius,
      color: COLORS.text,
      marginBottom: moderateScale(16),
      ...FONTS.text,
      textTransform: "capitalize",
    },
    input: {
      width: "100%",
      height: moderateScale(54),
      paddingHorizontal: moderateScale(16),
      backgroundColor: COLORS.input,
      borderRadius: SIZES.radius,
      color: COLORS.text,
      marginBottom: moderateScale(16),
      ...FONTS.text,
    },
    button: {
      width: "100%",
      height: moderateScale(56),
      borderRadius: SIZES.radius,
      overflow: "hidden",
      marginTop: moderateScale(10),
      elevation: 6,
    },
    gradientButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: SIZES.radius,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: {
      color: COLORS.buttonText,
      fontSize: moderateScale(18),
      ...FONTS.subheading,
    },
    toggleThemeBtn: { marginTop: 20, alignSelf: "center" },
    toggleThemeText: { color: COLORS.text, ...FONTS.text },
  });
};
