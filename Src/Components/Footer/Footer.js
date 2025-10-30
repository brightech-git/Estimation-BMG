import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  I18nManager,
} from "react-native";

const Footer = ({
  companyName = "© 2025 Brightechsoftware Solutions",
  theme = "light", // 'light' or 'dark'
  style,
  testID = "footer-component",
}) => {
  const isDark = theme === "dark";
  const styles = getStyles(isDark);

  return (
    <View
      style={[styles.footer, style]}
      testID={testID}
      accessible={true}
      accessibilityLabel="App footer"
    >
      <Text style={styles.companyName}>{companyName}</Text>
    </View>
  );
};

const getStyles = (isDark) =>
  StyleSheet.create({
    footer: {
      backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
      paddingVertical: Platform.select({
        ios: 10,
        android: 8,
        default: 10,
      }),
      paddingHorizontal: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? "#333" : "#e0e0e0",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
    },
    companyName: {
      fontSize: 13,
      color: isDark ? "#4dabf7" : "#007bff",
      fontWeight: "600",
      textAlign: "center",
      writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
    },
  });

export default React.memo(Footer);
