// AppContainer.js
import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

// Screens
import LoginScreen from "../Src-1/screens/Login/LoginScreen";
import HomeScreen from "../Src-1/screens/Home/HomeScreen";
import PrintScreen from "../Src-1/screens/AddPrinter/PrintMain";
import Homescreen1 from "../Src-2/Screens/Home/Home";

// Context
import { LoginProvider, LoginContext } from "../Context/LoginContext";
import { ToastProvider } from "../Src-1/Context/ToastContext";

const Stack = createNativeStackNavigator();

// ✅ Create a separate inner stack handler
function AppStack() {
  const { username, loading } = useContext(LoginContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a1b9a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={username ? "Home" : "Login"}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Homescreen1"
          component={Homescreen1}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Print"
          component={PrintScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppContainer() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoginProvider>
        <ToastProvider>
          <AppStack />
        </ToastProvider>
      </LoginProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
