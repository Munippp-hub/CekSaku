import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Palette } from '@/constants/design';
import { AppProvider, useApp } from '@/store/app-context';

function RootNavigator() {
  const { hydrated, onboardingCompleted, sessionActive, settings, unlocked } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    const current: string = segments[0] ?? '';
    const inOnboarding = current === 'onboarding';
    const inLock = current === 'lock';

    if (!onboardingCompleted || !sessionActive) {
      if (!inOnboarding) router.replace('/onboarding');
      return;
    }

    if (settings.pinEnabled && !unlocked) {
      if (!inLock) router.replace('/lock');
      return;
    }

    if (inOnboarding || inLock || current === '') {
      router.replace('/home');
    }
  }, [hydrated, onboardingCompleted, sessionActive, settings.pinEnabled, unlocked, segments, router]);

  if (!hydrated) {
    return <View style={styles.boot} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Palette.page },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="lock" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen
        name="transaction/new"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="transaction/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    backgroundColor: Palette.onboarding,
  },
});
