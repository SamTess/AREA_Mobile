import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AreaProvider } from '@/contexts/AreaContext';
import { SelectedAreaProvider } from '@/contexts/SelectedAreaContext';
import { AreaEditorProvider } from '@/contexts/AreaEditorContext';
import { LinkProvider } from '@/contexts/LinkContext';
import '@/global.css';
import '@/i18n';
import { Stack } from "expo-router";
import { useColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

function AppContent() {
  return (
    <AuthProvider>
      <AreaProvider>
        <SelectedAreaProvider>
          <AreaEditorProvider>
            <LinkProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ title: "Home" }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="area-editor" options={{ title: "Area Editor" }} />
                <Stack.Screen name="service-selector" options={{ title: "Select Service" }} />
                <Stack.Screen name="action-configurator" options={{ title: "Configure Action" }} />
                <Stack.Screen name="link-configurator" options={{ title: "Configure Link" }} />
                <Stack.Screen name="connected-services" options={{ title: "Connected Services" }} />
                <Stack.Screen name="help" options={{ title: "Help & Support" }} />
              </Stack>
            </LinkProvider>
          </AreaEditorProvider>
        </SelectedAreaProvider>
      </AreaProvider>
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
        if (mounted && saved && setColorScheme) {
          setColorScheme(saved as any);
        }
      } catch (err) {
        console.error('Failed to load color scheme from storage', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setColorScheme]);

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
