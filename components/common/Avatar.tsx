import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  showBorder?: boolean;
  placeholderIcon?: keyof typeof Ionicons.glyphMap;
  className?: string;
}

export const Avatar = ({
                         uri,
                         size = 48,
                         showBorder = false,
                         placeholderIcon = 'person',
                         className = ''
                       }: AvatarProps) => {
  const borderRadius = size / 2;
  const iconSize = size * 0.5;

  return (
    <View
      className={`items-center justify-center bg-[#575757] overflow-hidden ${showBorder ? 'border-2 border-white' : ''} ${className}`}
      style={{ width: size, height: size, borderRadius }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      ) : (
        <Ionicons name={placeholderIcon} size={iconSize} color="#ffffff" />
      )}
    </View>
  );
};
