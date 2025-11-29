import React from 'react';
import { View } from 'react-native';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export const StepIndicator = ({ totalSteps, currentStep }: StepIndicatorProps) => {
  return (
    <View className="w-full max-w-sm flex-row justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`h-1 flex-1 rounded-full ${
            index + 1 <= currentStep ? 'bg-white' : 'bg-surface'
          }`}
        />
      ))}
    </View>
  );
};
