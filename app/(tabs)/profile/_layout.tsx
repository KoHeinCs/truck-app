import { Stack } from "expo-router";
import React from "react";

export default function ProfileStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="user/index" />
      <Stack.Screen name="user/create" />
      <Stack.Screen name="language" />
    </Stack>
  );
}
