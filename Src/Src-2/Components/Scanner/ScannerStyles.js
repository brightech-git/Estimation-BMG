import { StyleSheet } from 'react-native';
import { moderateScale } from '../../../Utills/Scalling'; // Adjust path as needed

export const createBarcodeScannerModalStyles = (theme) => {
  const { COLORS, SIZES, FONTS } = theme;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    closeButton: {
      position: 'absolute',
      bottom: moderateScale(40),
      alignSelf: 'center',
      backgroundColor: COLORS.overlay,
      paddingHorizontal: moderateScale(20),
      paddingVertical: moderateScale(10),
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: moderateScale(2) },
      shadowOpacity: 1,
      shadowRadius: moderateScale(4),
      elevation: 5,
    },
    closeText: {
      color: COLORS.buttonText,
      fontSize: moderateScale(SIZES.font),
      fontWeight: '600',
      ...FONTS.font,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.surface,
      padding: moderateScale(20),
    },
    permissionButton: {
      marginTop: moderateScale(15),
      backgroundColor: COLORS.primary,
      paddingHorizontal: moderateScale(20),
      paddingVertical: moderateScale(10),
      borderRadius: SIZES.radius,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: moderateScale(2) },
      shadowOpacity: 1,
      shadowRadius: moderateScale(4),
      elevation: 3,
    },
    permissionText: {
      color: COLORS.buttonText,
      fontWeight: 'bold',
      fontSize: moderateScale(SIZES.font),
      ...FONTS.font,
    },
    permissionMessage: {
      fontSize: moderateScale(SIZES.font),
      color: COLORS.text,
      textAlign: 'center',
      marginBottom: moderateScale(10),
      ...FONTS.font,
    },
    processingText: {
      fontSize: moderateScale(SIZES.font),
      color: COLORS.text,
      marginTop: moderateScale(10),
      ...FONTS.font,
    },
    cameraContainer: {
      flex: 1,
      backgroundColor: COLORS.black,
    },
    // Scanner overlay styles
    scannerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scannerFrame: {
      width: moderateScale(250),
      height: moderateScale(250),
      borderWidth: moderateScale(2),
      borderColor: COLORS.primary,
      borderRadius: SIZES.radius,
      backgroundColor: 'transparent',
    },
    scannerText: {
      color: COLORS.buttonText,
      fontSize: moderateScale(SIZES.font),
      marginTop: moderateScale(20),
      textAlign: 'center',
      ...FONTS.font,
    },
  });
};

export default createBarcodeScannerModalStyles;