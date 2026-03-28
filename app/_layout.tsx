import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../stores/useAuthStore';
import { useSettingsStore } from '../stores/useSettingsStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialized, user, initialize } = useAuthStore();
  const { initialized: settingsInitialized, darkMode, initialize: initializeSettings } = useSettingsStore();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    let cleanup: undefined | (() => void);

    initialize().then((unsubscribe) => {
      cleanup = unsubscribe;
    });

    initializeSettings();

    return () => {
      cleanup?.();
    };
  }, [initialize, initializeSettings]);

  useEffect(() => {
    if (fontsLoaded && initialized && settingsInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initialized, settingsInitialized]);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, initialized, segments]);

  if (!fontsLoaded || !initialized || !settingsInitialized) return null;

  return (
    <>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
