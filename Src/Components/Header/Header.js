// Header.js
import React, { useEffect, useState, useRef } from "react";
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
import { COLORS, FONTS, SIZES } from "../../Utills/Theme";
import { scale, verticalScale, moderateScale } from "../../Utills/Scalling";

const Header = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

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
    <Animated.View
      style={[
        styles.headerContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.gradientOverlay} />

      <View style={[styles.companySection, { marginTop: scale(-25) }]}>
        <Image
          source={require("../../Assets/Images/icon.png")}
          style={styles.companyLogo}
          resizeMode="contain"
        />
        <Text style={styles.companyName}>BMG JEWELLERS PVT LTD</Text>
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
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.primary,
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
    borderBottomLeftRadius: moderateScale(SIZES.radius_lg),
    borderBottomRightRadius: moderateScale(SIZES.radius_lg),
    height: verticalScale(80),
 
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  companySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(8),
    // marginBottom: verticalScale(4),
    // paddingTop: verticalScale(-20),
  },
  companyLogo: {
    width: scale(40),
    height: scale(40),
    marginRight: scale(8),
    borderRadius: moderateScale(20),
    marginTop: verticalScale(5),
  },
  companyName: {
    color: COLORS.white,
    fontSize: moderateScale(SIZES.h6),
    letterSpacing: scale(1.5),
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: verticalScale(1) },
    textShadowRadius: moderateScale(8),
    ...FONTS.heading,
      //  marginTop: verticalScale(-22),
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
    color: COLORS.warning,
    marginRight: scale(8),
    ...FONTS.subheading,
    fontSize: moderateScale(SIZES.fontSm),
  },
  dateText: {
    color: COLORS.white,
    ...FONTS.text,
    fontSize: moderateScale(SIZES.font),
  },
});

export default Header;