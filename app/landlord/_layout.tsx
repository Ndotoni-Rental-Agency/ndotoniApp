import { Stack } from 'expo-router';

export default function LandlordLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="properties" options={{ headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="short-property/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="calendar/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
