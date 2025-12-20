import { Stack } from 'expo-router';
import React from 'react';

export default function TeamsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="createTeam" />
      <Stack.Screen name="members/[id]" />
    </Stack>
  );
}
