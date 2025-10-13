import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/global.css';
import '@/i18n';
import { Stack } from "expo-router";
import { useColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

function AppContent() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens/HomeScreen" options={{ title: "Home" }} />
        <Stack.Screen name="details" options={{ title: "Details" }} />
        <Stack.Screen name="area-detail" options={{ title: "Area Details" }} />
      </Stack>
    </AuthProvider>
  );
}

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const STORAGE_KEY = 'app_color_scheme';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);
        if (mounted && saved && setColorScheme && saved !== colorScheme) {
          setColorScheme(saved as any);
        }
      } catch (err) {
        console.error('Failed to load color scheme from storage', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!colorScheme) return;

    (async () => {
      try {
        await SecureStore.setItemAsync(STORAGE_KEY, colorScheme);
      } catch (err) {
        console.error('Failed to save color scheme to storage', err);
      }
    })();
  }, [colorScheme]);

  return (
    <GluestackUIProvider mode={colorScheme ?? 'light'}>
      <AppContent />
    </GluestackUIProvider>
  );
}
