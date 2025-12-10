import { Pressable, Text, View } from 'react-native';

interface BooleanToggleProps {
  label: string;
  value: boolean | null;
  onValueChange: (value: boolean) => void;
  trueLabel: string;
  falseLabel: string;
  disabled?: boolean;
}

export const BooleanToggle = ({
  label,
  value,
  onValueChange,
  trueLabel,
  falseLabel,
  disabled = false,
}: BooleanToggleProps) => {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-white text-base flex-1">{label}</Text>
      <View className="flex-row gap-2 flex-1 ml-4">
        <Pressable
          onPress={() => onValueChange(true)}
          disabled={disabled}
          className={`px-4 py-2 rounded-full flex-1 ${value === true ? 'bg-[#0A84FF]' : 'bg-[#575757]'}`}
        >
          <Text className="text-white text-sm text-center">{trueLabel}</Text>
        </Pressable>
        <Pressable
          onPress={() => onValueChange(false)}
          disabled={disabled}
          className={`px-4 py-2 rounded-full flex-1 ${value === false ? 'bg-[#0A84FF]' : 'bg-[#575757]'}`}
        >
          <Text className="text-white text-sm text-center">{falseLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};
