import { Stack } from "expo-router";
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens/HomeScreen" options={{ title: "Home" }} />
        <Stack.Screen name="details" options={{ title: "Details" }} />
      </Stack>
    </GluestackUIProvider>
  );
}
