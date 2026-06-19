import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  useFonts as useBaloo,
} from '@expo-google-fonts/baloo-2';
import {
  Nunito_600SemiBold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from '@/screens/HomeScreen';

const LOGO = require('./assets/kiddo-logo.png');

/**
 * Root. Loads the Kiddo type pairing (Baloo 2 display + Nunito body) before
 * mounting the SDUI homepage, then hands off entirely to the server-driven feed.
 */
export default function App(): React.ReactElement {
  const [fontsLoaded] = useBaloo({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {fontsLoaded ? (
        <HomeScreen />
      ) : (
        <View style={styles.loading}>
          <Image source={LOGO} style={styles.logo} contentFit="contain" />
          <ActivityIndicator size="small" color="#FF9933" />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: '#FFF5E6',
  },
  logo: { width: 220, height: 44 },
});
