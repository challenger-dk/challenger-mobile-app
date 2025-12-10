import { Stack } from 'expo-router';
import React from 'react';

export default function FriendsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#171616',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false, // Un-commented to hide the default stack header
      }}
    />
  );
}
