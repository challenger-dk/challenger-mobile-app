import { Stack } from 'expo-router';
import React from 'react';

export default function TeamsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        //headerShown: false
      }}
    />
  );
}