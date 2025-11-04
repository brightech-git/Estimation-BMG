// App.js - Simplified Version
import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import StackNavigator from './Src/Navigation/StackNavigator';
import { ThemeProvider, useTheme } from './Src/Context/ThemeContext';

// Wrapper component for theme-aware styling
const AppWrapper = () => {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.COLORS.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <StackNavigator />
    </View>
  );
};

export default function App() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    TrajanPro: require('./Src/Src-1/Assets/Fonts/TrajanPro-Regular.ttf'),
    TrajanProBold: require('./Src/Src-1/Assets/Fonts/TrajanPro-Bold.otf'),
    DancingScript: require('./Src/Src-1/Assets/Fonts/DancingScript.ttf'),
    DMSerif: require('./Src/Src-1/Assets/Fonts/DMSerif.ttf'),
    Fancy: require('./Src/Src-1/Assets/Fonts/Fancy.ttf'),
    Domine: require('./Src/Src-1/Assets/Fonts/Domine-Bold.ttf'),
  });

  // Show loader while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppWrapper />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});