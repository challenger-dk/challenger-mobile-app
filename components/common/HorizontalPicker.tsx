import { Pressable, ScrollView, Text, View } from 'react-native';

interface PickerOption {
  key: string;
  label: string;
}

interface HorizontalPickerProps {
  options: PickerOption[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  renderOption?: (option: PickerOption, isSelected: boolean) => React.ReactNode;
}

export const HorizontalPicker = ({
  options,
  selectedKey,
  onSelect,
  renderOption,
}: HorizontalPickerProps) => {
  const defaultRenderOption = (option: PickerOption, isSelected: boolean) => (
    <Pressable
      key={option.key}
      onPress={() => onSelect(option.key)}
      className={`px-4 py-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#575757]'}`}
    >
      <Text
        className={`text-sm font-medium ${isSelected ? 'text-black' : 'text-white'}`}
      >
        {option.label}
      </Text>
    </Pressable>
  );

  return (
    <View className="bg-[#272626] rounded-lg p-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {options.map((option) => {
            const isSelected = selectedKey === option.key;
            return renderOption
              ? renderOption(option, isSelected)
              : defaultRenderOption(option, isSelected);
          })}
        </View>
      </ScrollView>
    </View>
  );
};
