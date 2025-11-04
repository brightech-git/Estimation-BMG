import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  Easing,
  Image,
} from "react-native";
import { useTheme } from "../../../Context/ThemeContext";
import { LoginContext } from "../../../Context/LoginContext";
import { createHeaderStyles } from "./HeaderStyles";
import { LinearGradient } from "expo-linear-gradient";

const Header = () => {
  const { theme } = useTheme();
  const styles = createHeaderStyles(theme);
  
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const {
    username,
    companyName,
    companyLogo,
    companyLogoUrl,
    loading: contextLoading,
  } = useContext(LoginContext);

  const companyLogoFullPath = companyLogoUrl
    ? `${companyLogoUrl.replace(/\/$/, "")}/${encodeURI(
        companyLogo?.replace(/^\//, "") || ""
      )}`
    : null;

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = () => {
    const day = String(currentDateTime.getDate()).padStart(2, "0");
    const month = String(currentDateTime.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = currentDateTime.getFullYear();

    const date = `${day}-${month}-${year}`;

    const time = currentDateTime.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { date, time };
  };

  const { date, time } = formatDateTime();

  return (
    <LinearGradient
      colors={theme.COLORS.gradientPrimary}
      style={styles.gradientBackground}
    >
      <Animated.View
        style={[
          styles.headerContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.companySection}>
          <Image
            source={
              companyLogoFullPath
                ? { uri: companyLogoFullPath }
                : require("../../../../assets/brightechlogo.png")
            }
            style={styles.companyLogo}
            resizeMode="contain"
          />

          <Text style={styles.companyName}>{companyName}</Text>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.dateTimeContainer}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>📅 DATE :</Text>
              <Text style={styles.dateText}>{date}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>🕒 TIME :</Text>
              <Text style={styles.dateText}>{time}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

export default Header;