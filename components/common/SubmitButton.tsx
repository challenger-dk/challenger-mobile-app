import { Pressable, Text, View } from 'react-native';

interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const SubmitButton = ({
  label,
  loadingLabel,
  onPress,
  disabled = false,
  isLoading = false,
  className = '',
}: SubmitButtonProps) => {
  const isDisabled = disabled || isLoading;
  const displayText = isLoading ? loadingLabel || 'Loading...' : label;

  return (
    <View className={`w-full flex-row gap-4 mt-auto ${className}`}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`flex-1 rounded-lg px-4 py-4 ${
          !isDisabled ? 'bg-white' : 'bg-[#575757]'
        }`}
      >
        <Text
          className={`text-center font-medium ${
            !isDisabled ? 'text-black' : 'text-gray-400'
          }`}
        >
          {displayText}
        </Text>
      </Pressable>
    </View>
  );
};
