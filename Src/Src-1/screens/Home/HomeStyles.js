import { StyleSheet } from 'react-native';
import { moderateScale } from '../../../Utills/Scalling';

// This function will create styles based on the theme object from context
export const createHomeStyles = (theme) => {
  const { COLORS, SIZES, FONTS } = theme;
  
  return StyleSheet.create({

    scrollView: {
          backgroundColor: COLORS.background,
    },
    container: {
      flex: 1,
      padding: SIZES.padding,
      backgroundColor: COLORS.background,
    },
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(14),
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginHorizontal: moderateScale(4),
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      borderRadius: SIZES.radius_sm,
      backgroundColor: COLORS.input,
      paddingHorizontal: SIZES.padding,
      paddingVertical: moderateScale(6),
      fontSize: moderateScale(SIZES.font),
      color: COLORS.text,
      ...FONTS.font,
    },
    scanButton: {
      paddingLeft: moderateScale(6),
    },
    scanIcon: {
      fontSize: moderateScale(15),
      color: COLORS.iconPrimary,
    },
    dropdown: {
      backgroundColor: COLORS.surface,
      borderColor: COLORS.borderColor,
      borderWidth: 1,
      borderRadius: SIZES.radius_sm,
      maxHeight: moderateScale(140),
      marginTop: moderateScale(2),
      marginBottom: moderateScale(10),
      zIndex: 10,
      elevation: 5,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
    },
    dropdownItem: {
      padding: SIZES.padding,
      borderBottomColor: COLORS.borderColor,
      borderBottomWidth: 1,
    },
    dropdownText: {
      color: COLORS.text,
      ...FONTS.font,
    },
    totalsContainer: {
      backgroundColor: COLORS.outline,
      borderRadius: SIZES.radius,
      padding: SIZES.padding,
      marginBottom: moderateScale(10),
      borderWidth: 1,
      borderColor: COLORS.borderColor,
    },
    totalsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    totalItem: {
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: moderateScale(SIZES.fontSm),
      color: COLORS.label,
      ...FONTS.subheading,
    },
    totalValue: {
      fontSize: moderateScale(SIZES.font),
      fontWeight: '600',
      color: COLORS.text,
      ...FONTS.text,
    },
    grandTotal: {
      fontWeight: 'bold',
      color: COLORS.primary,
    },
    loader: {
      marginVertical: moderateScale(20),
    },
    tableContainer: {
      marginBottom: moderateScale(10),
      borderRadius: SIZES.radius_sm,
      overflow: 'hidden',
    },
    headerRow: {
      flexDirection: 'row',
      backgroundColor: COLORS.outline,
      paddingVertical: moderateScale(6),
    },
    headerCell: {
      color: COLORS.buttonText,
      fontWeight: 'bold',
      paddingHorizontal: moderateScale(10),
      minWidth: moderateScale(80),
      textAlign: 'center',
      ...FONTS.fontSm,
    },
    dataRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: COLORS.borderColor,
      paddingVertical: moderateScale(6),
      backgroundColor: COLORS.surface,
    },
    cell: {
      minWidth: moderateScale(80),
      textAlign: 'center',
      paddingHorizontal: moderateScale(10),
      color: COLORS.text,
      fontSize: moderateScale(SIZES.fontXs),
      ...FONTS.fontXs,
    },
    trannoContainer: {
      marginTop: moderateScale(12),
      alignItems: 'center',
      padding: moderateScale(10),
      backgroundColor: COLORS.surfaceVariant,
      borderRadius: SIZES.radius_sm,
    },
    trannoText: {
      fontSize: moderateScale(SIZES.font+2),
      // fontWeight: 'bold',
      color: COLORS.primary,
      ...FONTS.text,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: moderateScale(20),
    },
    submitButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: SIZES.padding,
      borderRadius: SIZES.radius,
      alignItems: 'center',
      width: '48%',
      height: moderateScale(50),
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 3,
    },
    printButton: {
      backgroundColor: COLORS.secondary,
    },
    submitButtonText: {
      color: COLORS.buttonText,
      // fontWeight: '700',
      fontSize: moderateScale(SIZES.font),
      ...FONTS.text,
    },
    disabledButton: {
      backgroundColor: COLORS.placeholder,
      opacity: 0.6,
    },
  });
};

// Default export for convenience
export default createHomeStyles;