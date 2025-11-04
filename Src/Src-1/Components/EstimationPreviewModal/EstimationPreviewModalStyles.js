import { StyleSheet } from 'react-native';
import { moderateScale } from '../../../Utills/Scalling'; // Adjust path as needed

// This function will create styles based on the theme object from context
export const createEstimationPreviewModalStyles = (theme) => {
  const { COLORS, SIZES, FONTS } = theme;
  
  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.overlay,
    },
    modalContent: {
      backgroundColor: COLORS.surface,
      borderRadius: SIZES.radius,
      padding: SIZES.padding,
      width: "95%",
      height: "90%",
      borderWidth: 1,
      borderColor: COLORS.borderColor,
    },
    modalTitle: {
      fontSize: moderateScale(SIZES.h5),
      fontWeight: 'bold',
      textAlign: "center",
      marginBottom: moderateScale(15),
      color: COLORS.title,
      ...FONTS.h5,
    },
    printerInfo: {
      fontSize: moderateScale(SIZES.fontSm),
      textAlign: "center",
      marginBottom: moderateScale(10),
      color: COLORS.textLight,
      fontStyle: "italic",
      ...FONTS.fontSm,
    },
    previewContainer: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      borderRadius: SIZES.radius_sm,
      padding: SIZES.padding,
      marginBottom: moderateScale(15),
      backgroundColor: COLORS.surfaceVariant,
    },
    section: {
      marginBottom: moderateScale(10),
    },
    label: {
      fontSize: moderateScale(SIZES.fontSm),
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: moderateScale(2),
      ...FONTS.fontSm,
    },
    underline: {
      borderBottomWidth: 1,
      borderBottomColor: COLORS.text,
      marginBottom: moderateScale(8),
    },
    dashedLine: {
      borderBottomWidth: 1,
      borderBottomColor: COLORS.textLight,
      borderStyle: "dashed",
      marginVertical: moderateScale(8),
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: moderateScale(4),
    },
    tableHeader: {
      backgroundColor: COLORS.primaryLight,
      paddingVertical: moderateScale(4),
      paddingHorizontal: moderateScale(8),
      borderRadius: SIZES.radius_sm,
    },
    itemContainer: {
      marginBottom: moderateScale(8),
      paddingLeft: moderateScale(5),
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: moderateScale(2),
    },
    // Column widths matching receipt format
    colDesc: {
      flex: 4,
      textAlign: "left",
    },
    colWeight: {
      flex: 1.5,
      textAlign: "right",
    },
    colVA: {
      flex: 1,
      textAlign: "right",
    },
    colAmount: {
      flex: 1.5,
      textAlign: "right",
    },
    text: {
      fontSize: moderateScale(SIZES.fontXs),
      color: COLORS.text,
      ...FONTS.fontXs,
    },
    boldText: {
      fontSize: moderateScale(SIZES.fontXs),
      fontWeight: 'bold',
      color: COLORS.text,
      ...FONTS.fontXs,
    },
    totalsSection: {
      marginTop: moderateScale(10),
    },
    footer: {
      alignItems: "center",
      marginTop: moderateScale(10),
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: moderateScale(10),
    },
    cancelButton: {
      backgroundColor: COLORS.secondary,
      padding: SIZES.padding,
      borderRadius: SIZES.radius,
      flex: 1,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 3,
    },
    printButton: {
      backgroundColor: COLORS.primary,
      padding: SIZES.padding,
      borderRadius: SIZES.radius,
      flex: 1,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonText: {
      color: COLORS.buttonText,
      textAlign: "center",
      fontSize: moderateScale(SIZES.font),
      fontWeight: '600',
      ...FONTS.font,
    },
    disabledButton: {
      backgroundColor: COLORS.placeholder,
      opacity: 0.6,
    },
  });
};

// Default export for convenience
export default createEstimationPreviewModalStyles;