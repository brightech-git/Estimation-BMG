// App.js
import React from 'react';
import {  StyleSheet } from 'react-native';
import StackNavigator from './screens/StackNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StackNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
