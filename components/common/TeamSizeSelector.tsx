import { Pressable, Text, View } from 'react-native';

interface TeamSizeSelectorProps {
  teamSize: number | null;
  onPress: () => void;
  disabled?: boolean;
}

export const TeamSizeSelector = ({
  teamSize,
  onPress,
  disabled = false,
}: TeamSizeSelectorProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-1 mx-14 bg-[#A0522D] rounded-lg flex-row items-center justify-center py-5"
    >
      {/* Left Number */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-6xl font-bold">
          {teamSize ? teamSize : '?'}
        </Text>
      </View>

      {/* VS Text */}
      <View className="">
        <Text className="text-white text-4xl font-medium italic z-10">vs</Text>
      </View>

      {/* Black Separator Line */}
      <View className="w-[1px] bg-[#171616] mx-2 absolute h-[200%]" />

      {/* Right Number */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-6xl font-bold">
          {teamSize ? teamSize : '?'}
        </Text>
      </View>
    </Pressable>
  );
};
