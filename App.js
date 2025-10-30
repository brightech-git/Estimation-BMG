// App.js
import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import StackNavigator from './screens/StackNavigator'; // keep your original path

export default function App() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    TrajanPro: require('./Src/Assets/Fonts/TrajanPro-Regular.ttf'),
    TrajanProBold: require('./Src/Assets/Fonts/TrajanPro-Bold.otf'),
    DancingScript: require('./Src/Assets/Fonts/DancingScript.ttf'),
    DMSerif: require('./Src/Assets/Fonts/DMSerif.ttf'),
    Fancy: require('./Src/Assets/Fonts/Fancy.ttf'),
    Domine: require('./Src/Assets/Fonts/Domine-Bold.ttf'),
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <StackNavigator />
    </SafeAreaView>
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
