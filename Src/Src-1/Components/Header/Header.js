import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";

import { LoginContext } from "../../Context/LoginContext";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS, SIZES } from "../../Utills/Theme";
import { scale, verticalScale, moderateScale } from "../../Utills/Scalling";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PureNativeButton } from "react-native-gesture-handler";
import { useApiBaseUrl } from "../../Config/Config";

const MainHeader = () => {
  const [goldRate, setGoldRate] = useState(null);
  const [silverRate, setSilverRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rateUpdated, setRateUpdated] = useState(null);
  const API_BASE_URL = useApiBaseUrl();


  const { username } = useContext(LoginContext);
  const navigation = useNavigation();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const formatDateTime = () => {
    const day = String(currentDateTime.getDate()).padStart(2, "0");
    const month = String(currentDateTime.getMonth() + 1).padStart(2, "0");
    const year = currentDateTime.getFullYear();

    const date = `${day}-${month}-${year}`;
    const time = currentDateTime.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { date, time };
  };

  const { date } = formatDateTime();

  const fetchRates = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(`${API_BASE_URL}/todayrate`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      if (data?.GOLDRATE && data?.SILVERRATE) {
        setGoldRate(data.GOLDRATE);
        setSilverRate(data.SILVERRATE);
        setRateUpdated(new Date().toLocaleTimeString("en-GB"));
      } else throw new Error("Invalid data");
    } catch (err) {
      console.error("Error fetching rates:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.secondary]}
      style={styles.gradientBackground}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 🔹 Top Header Section */}
        <View style={styles.TopSection}>
          {/* Left: Settings Icon */}
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => navigation.navigate("Print")}
          >
            <Ionicons name="settings-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Center: Company Logo + Name */}
          <View style={styles.companySection}>
            <Image
              source={require("../../../../assets/icon.png")}
              style={styles.companyLogo}
              resizeMode="contain"
            />
            <Text style={styles.companyName}>BMG JEWELLERS PVT LTD</Text>
          </View>

          {/* Right: Menu Icon */}
          {/* <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => navigation.navigate("Homescreen1")}
          >
            <MaterialIcons name="menu" size={30} color={COLORS.primary} />
          </TouchableOpacity> */}
        </View>

        {/* 🔹 Info Section */}
        <View style={styles.infoCard}>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>📅 Date :</Text>
              <Text style={styles.value}>{date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>🏅 Gold Rate :</Text>
              <Text style={styles.value}>
                ₹ {loading ? "Loading..." : error ? "Error" : goldRate}
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>👤 User Name :</Text>
              <Text style={styles.value}>{username || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>🥈 Silver Rate :</Text>
              <Text style={styles.value}>
                ₹ {loading ? "Loading..." : error ? "Error" : silverRate}
              </Text>
            </View>
          </View>

          {rateUpdated && (
            <Text style={styles.updatedText}>
              🕒 Last updated: {rateUpdated}
            </Text>
          )}
        </View>

        {/* 🔹 Buttons */}
        <View style={styles.buttonContainer}>
          {/* <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Print")}
          >
            <Text style={styles.buttonText}>🛒 Print</Text>
          </TouchableOpacity> */}

          {/* <TouchableOpacity
            style={[styles.button, styles.refreshButton]}
            onPress={fetchRates}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>🔄 Refresh</Text>
            )}
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    borderBottomLeftRadius: moderateScale(12),
    borderBottomRightRadius: moderateScale(12),
    marginBottom: verticalScale(10),
  },

  scrollContainer: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    alignItems: "center",

  },

  TopSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: verticalScale(5),
    paddingTop: verticalScale(5),
  },

  iconContainer: {
    padding: scale(2),
    marginBottom: verticalScale(3),
  },

  companySection: {
    position: "absolute", // keeps logo & text centered regardless of icons
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  companyLogo: {
    width: scale(30),
    height: scale(30),
    marginRight: scale(8),
    borderRadius: moderateScale(15),
  },

  companyName: {
    color: COLORS.primary,
    fontSize: moderateScale(SIZES.h6-3),
    letterSpacing: scale(1.5),
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: verticalScale(1) },
    textShadowRadius: moderateScale(8),
    ...FONTS.heading,
  },

  infoCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(15),
    width: "100%",
  },

  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(6),
    borderBottomWidth: 0.3,
    borderBottomColor: "#bbb",
  },

  label: {
    color: COLORS.black,
    marginRight: scale(8),
    fontSize: moderateScale(SIZES.fontSm),
    ...FONTS.subheading,
  },

  value: {
    color: COLORS.primary,
    fontSize: moderateScale(SIZES.font),
    ...FONTS.text,
  },

  updatedText: {
    marginTop: verticalScale(8),
    textAlign: "right",
    color: "#444",
    fontSize: moderateScale(11),
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(12),
    marginTop: verticalScale(20),
  },

  button: {
    backgroundColor: "#721b9aff",
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(14),
    borderRadius: moderateScale(8),
    minWidth: scale(110),
    alignItems: "center",
  },

  refreshButton: {
    backgroundColor: "#6a1b9a",
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(14),
    borderRadius: moderateScale(8),
    minWidth: scale(110),
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: moderateScale(13),
    fontWeight: "600",
  },
});

export default MainHeader;
