import { StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from "../../../Utills/Scalling";

export const createHomeScreenStyles = (theme) => {
  const { COLORS, SIZES, FONTS } = theme;
  
  return StyleSheet.create({
    container: {
      padding: SIZES.padding,
      backgroundColor: COLORS.background,
      flexGrow: 1,
      minHeight: "100%",
    },
    inputRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginVertical: SIZES.margin / 3,
      gap: moderateScale(10),
    },
    column: {
      flex: 2,
      marginHorizontal: moderateScale(1),
    },
    buttonsColumn: {
      flex: 1,
      marginHorizontal: moderateScale(1),
    },
    label: {
      fontSize: moderateScale(SIZES.font),
      marginBottom: moderateScale(5),
      color: COLORS.title,
      ...FONTS.text,
      alignSelf: "flex-start",
      paddingLeft: moderateScale(25),
    },
    inputWithIcon: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: moderateScale(15),
      width: scale(200),
    },
    itemName: {
      fontSize: moderateScale(SIZES.h5),
      fontWeight: "bold",
      color: COLORS.primary,
      textAlign: "center",
      marginBottom: moderateScale(SIZES.margin - 5),
      ...FONTS.h5,
    },
    input: {
      flex: 1,
      backgroundColor: COLORS.input,
      paddingHorizontal: moderateScale(14),
      paddingVertical: moderateScale(5),
      borderRadius: SIZES.radius_sm,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      fontSize: moderateScale(SIZES.font),
      color: COLORS.text,
      ...FONTS.font,
      minHeight: moderateScale(40),
    },
    inputError: {
      borderColor: COLORS.danger,
      borderWidth: 2,
    },
    errorMessage: {
      fontSize: moderateScale(SIZES.font - 2),
      color: COLORS.danger,
      marginTop: moderateScale(4),
      paddingLeft: moderateScale(10),
      ...FONTS.text,
    },
    iconButton: {
      marginLeft: moderateScale(8),
      padding: moderateScale(8),
      borderRadius: SIZES.radius_sm,
      width: moderateScale(40),
      height: moderateScale(40),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.primary,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: moderateScale(2) },
      shadowOpacity: 1,
      shadowRadius: moderateScale(4),
      elevation: 3,
    },
    buttonsWrapper: {
      flexDirection: "row",
      gap: moderateScale(3),
      height: moderateScale(40),
      justifyContent: "center",
      marginLeft: scale(-45),
      paddingRight: scale(5),
    },
    actionButton: {
      paddingVertical: moderateScale(3),
      paddingHorizontal: moderateScale(6),
      borderRadius: SIZES.radius_sm,
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      flex: 1,
      width: moderateScale(60),
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: moderateScale(2) },
      shadowOpacity: 1,
      shadowRadius: moderateScale(4),
      elevation: 3,
    },
    submitButton: {
      backgroundColor: COLORS.success,
    },
    refreshButton: {
      backgroundColor: COLORS.warning,
    },
    buttonText: {
      color: COLORS.buttonText,
      fontSize: moderateScale(SIZES.font - 3),
      ...FONTS.text,
      textAlign: "center",
      fontWeight: "bold",
    },
    card: {
      marginTop: SIZES.margin,
      borderRadius: SIZES.radius,
      padding: SIZES.padding,
      backgroundColor: COLORS.surface,
      shadowColor: COLORS.shadow,
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(6),
      elevation: 4,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
    },
    imageContainer: { 
      alignItems: "center", 
      marginBottom: SIZES.margin 
    },
    itemImage: {
      width: moderateScale(150),
      height: moderateScale(150),
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
    },
    detailsContainer: { 
      marginTop: moderateScale(10) 
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: SIZES.margin / 2,
      alignItems: "center",
    },
    detailLabel: {
      color: COLORS.text,
      flex: 1,
      ...FONTS.subheading,
      fontSize: moderateScale(SIZES.h5),
    },
    detailValue: {
      color: COLORS.text,
      flex: 1,
      textAlign: "left",
      ...FONTS.text,
      fontSize: moderateScale(SIZES.h6),
    },
    grandTotalRow: {
      marginTop: SIZES.margin,
      paddingTop: SIZES.padding / 2,
      borderTopWidth: 1,
      borderTopColor: COLORS.borderColor,
    },
    grandTotalValue: { 
      color: COLORS.primary, 
      fontSize: moderateScale(SIZES.h4),
      fontWeight: 'bold',
      ...FONTS.h4,
    },
    gstValue: { 
      color: COLORS.text, 
      fontSize: moderateScale(SIZES.h6 - 3) 
    },
    subItemValue: { 
      color: COLORS.text, 
      fontSize: moderateScale(SIZES.h6 - 3) 
    },
    itemValue: { 
      color: COLORS.text, 
      fontSize: moderateScale(SIZES.h6 - 3) 
    },
    center: {
      marginTop: SIZES.margin,
      alignItems: "center",
      paddingVertical: SIZES.padding * 2,
    },
    loadingText: {
      marginTop: moderateScale(10),
      ...FONTS.font,
      color: COLORS.text,
    },
    errorText: {
      marginTop: SIZES.margin,
      textAlign: "center",
      ...FONTS.font,
      color: COLORS.danger,
      fontWeight: "bold",
      marginBottom: SIZES.margin,
    },
    retryButton: {
      marginTop: moderateScale(10),
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(24),
      backgroundColor: COLORS.primary,
      borderRadius: SIZES.radius_sm,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: moderateScale(2) },
      shadowOpacity: 1,
      shadowRadius: moderateScale(4),
      elevation: 3,
    },
    retryButtonText: {
      color: COLORS.buttonText,
      ...FONTS.text,
      fontSize: moderateScale(SIZES.font),
    },
    placeholderText: {
      marginTop: SIZES.margin * 2,
      color: COLORS.textLight,
      textAlign: "center",
      ...FONTS.font,
      fontSize: moderateScale(SIZES.h5),
    },
    footer: { 
      position: "absolute", 
      bottom: 0, 
      left: 0, 
      right: 0 
    },
    floatingButton: {
      position: 'absolute',
      bottom: moderateScale(80),
      right: moderateScale(20),
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(30),
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: moderateScale(4) },
      shadowOpacity: 0.3,
      shadowRadius: moderateScale(4),
      elevation: 8,
      zIndex: 100,
    },
    disabledButton: {
      opacity: 0.6,
    },
    disabledIconButton: {
      backgroundColor: COLORS.placeholder,
    },
  });
};

export default createHomeScreenStyles;