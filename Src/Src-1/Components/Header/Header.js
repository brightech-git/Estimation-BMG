import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LoginContext } from "../../../Context/LoginContext";
import { useApiBaseUrl } from "../../../Config/Config";
import { useTheme } from "../../../Context/ThemeContext";
import getStyles from "./HeaderStyles";

const { width, height } = Dimensions.get("window");

const MainHeader = () => {
  const [goldRate, setGoldRate] = useState(null);
  const [silverRate, setSilverRate] = useState(null);
  const [loadingRates, setLoadingRates] = useState(true);
  const [error, setError] = useState(false);
  const [rateUpdated, setRateUpdated] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const API_BASE_URL = useApiBaseUrl();
  const navigation = useNavigation();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const styles = getStyles(theme);

  // ✅ FIX: Initialize animated value properly
  const slideAnim = useState(new Animated.Value(width))[0];

  const {
    username,
    companyName,
    companyLogo,
    companyLogoUrl,
    logout,
    loading: contextLoading,
  } = useContext(LoginContext);

  const companyLogoFullPath = companyLogoUrl
    ? `${companyLogoUrl.replace(/\/$/, "")}/${encodeURI(
        companyLogo?.replace(/^\//, "") || ""
      )}`
    : null;

      const handleLogout = async () => {
    await logout();
    navigation.replace("Login"); // 👈 Ensures navigation resets
  };

  const [currentDateTime] = useState(new Date());
  const date = `${String(currentDateTime.getDate()).padStart(2, "0")}-${String(
    currentDateTime.getMonth() + 1
  ).padStart(2, "0")}-${currentDateTime.getFullYear()}`;

  const fetchRates = async () => {
    setLoadingRates(true);
    setError(false);
    try {
      const response = await fetch(`${API_BASE_URL}/todayrate`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setGoldRate(data.GOLDRATE);
      setSilverRate(data.SILVERRATE);
      setRateUpdated(new Date().toLocaleTimeString("en-GB"));
    } catch {
      setError(true);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerVisible(false));
  };

  if (contextLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.COLORS.primary} />
        <Text style={styles.loaderText}>Loading company info...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={theme.COLORS.gradientPrimary}
      style={styles.gradientBackground}
    >
      <View style={styles.scrollContainer}>
        {/* 🔹 HEADER */}
        <View style={styles.topSection}>
          {/* Left: Theme Toggle */}
          <TouchableOpacity style={styles.iconContainer} onPress={toggleTheme}>
            <Ionicons
              name={isDarkMode ? "sunny-outline" : "moon-outline"}
              size={styles.iconSize + 2}
              color={theme.COLORS.warning}
            />
          </TouchableOpacity>

          {/* Center: Company Logo + Name */}
          <View style={styles.companySection}>
            <Text style={styles.companyName}>
              {companyName || "Company Name"}
            </Text>
          </View>

          {/* Right: Drawer Toggle */}
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={openDrawer}
            testID="menu-button"
          >
            <Ionicons
              name="menu-outline"
              size={styles.iconSize}
              color={theme.COLORS.warning}
            />
          </TouchableOpacity>
        </View>

        {/* 🔹 INFO CARD */}
        <View style={styles.infoCard}>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>📅 Date :</Text>
              <Text style={styles.value}>{date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>🏅 Gold Rate :</Text>
              <Text style={styles.value}>
                ₹{" "}
                {loadingRates
                  ? "Loading..."
                  : error
                  ? "Error"
                  : goldRate?.toLocaleString() ?? "N/A"}
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
                ₹{" "}
                {loadingRates
                  ? "Loading..."
                  : error
                  ? "Error"
                  : silverRate?.toLocaleString() ?? "N/A"}
              </Text>
            </View>
          </View>

          {rateUpdated && (
            <Text style={styles.updatedText}>
              🕒 Last updated: {rateUpdated}
            </Text>
          )}
        </View>
      </View>

      {/* 🔹 Drawer Overlay */}
      {drawerVisible && (
        <>
          {/* 🔹 Background Overlay */}
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={closeDrawer}
          />

          {/* 🔹 Sliding Drawer - NOW TAKES HALF SCREEN VERTICALLY */}
          <Animated.View style={styles.drawerContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.closeDrawer}
                onPress={closeDrawer}
              >
                <Ionicons
                  name="close-outline"
                  size={30}
                  color={theme.COLORS.title}
                />
              </TouchableOpacity>

              <View style={styles.drawerHeader}>
                <Image
                  source={
                    companyLogoFullPath
                      ? { uri: companyLogoFullPath }
                      : require("../../../../assets/brightechlogo.png")
                  }
                  style={styles.drawerLogo}
                  resizeMode="contain"
                />
                <Text style={styles.drawerCompanyName}>
                  {companyName || "Company Name"}
                </Text>
              </View>

              {/* Drawer Items */}
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  closeDrawer();
                  navigation.navigate("Print");
                }}
              >
                <MaterialIcons
                  name="print"
                  size={26}
                  color={theme.COLORS.iconPrimary}
                />
                <Text style={styles.drawerText}>Print</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  closeDrawer();
                  navigation.navigate("Homescreen1");
                }}
              >
                <Ionicons
                  name="home-outline"
                  size={26}
                  color={theme.COLORS.iconPrimary}
                />
                <Text style={styles.drawerText}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  handleLogout();
                }}
              >
                <Ionicons
                  name="log-out-outline"
                  size={26}
                  color={theme.COLORS.danger}
                />
                <Text
                  style={[styles.drawerText, { color: theme.COLORS.danger }]}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </>
      )}
    </LinearGradient>
  );
};

export default MainHeader;
