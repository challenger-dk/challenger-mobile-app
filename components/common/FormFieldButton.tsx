import { Pressable, Text, View } from 'react-native';

interface FormFieldButtonProps {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
}

export const FormFieldButton = ({
  label,
  value,
  placeholder,
  onPress,
  disabled = false,
}: FormFieldButtonProps) => {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-white text-base flex-1">{label}</Text>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className="bg-[#575757] px-4 py-2 rounded-full flex-1 ml-4"
      >
        <Text className="text-white text-sm text-center">
          {value || placeholder}
        </Text>
      </Pressable>
    </View>
  );
};

