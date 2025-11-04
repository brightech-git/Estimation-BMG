import React from "react";
import {
  View,
  Text,
} from "react-native";
import { useTheme } from "../../../Context/ThemeContext"; // Adjust path as needed
import { createFooterStyles } from "./FooterStyles"; // Adjust path as needed

const Footer = ({
  companyName = "© 2025 Brightechsoftware Solutions",
  style,
  testID = "footer-component",
}) => {
  const { theme } = useTheme();
  const styles = createFooterStyles(theme);

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

export default React.memo(Footer);