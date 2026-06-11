import { Stack } from "expo-router";
import React from "react";

export default function OwnershipStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="create" />
      <Stack.Screen name="detail" />
    </Stack>
  );
}
