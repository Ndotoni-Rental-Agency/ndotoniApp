import { Stack } from 'expo-router';

export default function LandlordLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="properties" />
      <Stack.Screen name="property/[id]" />
      <Stack.Screen name="short-property/[id]" />
    </Stack>
  );
}
