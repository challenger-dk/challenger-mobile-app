import { Ionicons } from '@expo/vector-icons';
import { TextInput, View, Pressable, TextInputProps } from 'react-native';

interface SearchInputProps extends TextInputProps {
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchInput = ({
  value,
  onChangeText,
  onClear,
  containerClassName = '',
  placeholderTextColor = '#9CA3AF',
  ...props
}: SearchInputProps) => (
  <View
    className={`flex-row items-center bg-surface rounded-lg px-3 border border-text-disabled ${containerClassName}`}
  >
    <Ionicons
      name="search"
      size={20}
      color={placeholderTextColor as string}
      style={{ marginRight: 8 }}
    />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={placeholderTextColor}
      className="flex-1 text-text py-3"
      style={{ color: '#ffffff' }}
      {...props}
    />
    {value && value.length > 0 ? (
      <Pressable onPress={onClear}>
        <Ionicons
          name="close-circle"
          size={20}
          color={placeholderTextColor as string}
        />
      </Pressable>
    ) : null}
  </View>
);
