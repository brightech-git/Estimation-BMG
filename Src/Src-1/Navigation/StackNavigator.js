// AppContainer.js
import React, { useState, useEffect } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

//Src-1 data 

//Screens
import LoginScreen from "../screens/Login/LoginScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import PrintScreen from "../screens/AddPrinter/PrintMain";

//Context
import { LoginProvider } from "../Context/LoginContext";
import {ToastProvider} from '../Context/ToastContext'

//Src-2 data
import Homescreen1 from "../../Src-2/Screens/Home/Home";



const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        AsyncStorage.clear();
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.username) {
              setInitialRoute("Home");
            } else {
              setInitialRoute("Login");
            }
          } catch (parseErr) {
            console.error("Error parsing stored user:", parseErr);
            setInitialRoute("Login");
          }
        } else {
          setInitialRoute("Login");
        }
      } catch (err) {
        console.error("Error checking login:", err);
        setInitialRoute("Login");
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a1b9a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoginProvider>
        <ToastProvider>
       
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRoute}>
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
