import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import type { Challenge } from '../../types/challenge';
import { getSportIcon } from '../../utils/sportIcons';

interface ChallengeMarkerProps {
  challenge: Challenge;
  onPress: (challengeId: number) => void;
}

export const ChallengeMarker = ({ challenge, onPress }: ChallengeMarkerProps) => {
  const iconConfig = getSportIcon(challenge.sport);

  const renderIcon = () => {
    switch (iconConfig.library) {
      case 'material':
        return <MaterialIcons name={iconConfig.name as any} size={20} color="#FFFFFF" />;
      case 'material-community':
        return <MaterialCommunityIcons name={iconConfig.name as any} size={20} color="#FFFFFF" />;
      case 'ionicons':
      default:
        return <Ionicons name={iconConfig.name as any} size={20} color="#FFFFFF" />;
    }
  };

  // Calculate marker dimensions:
  // Circle: 40px (w-10 h-10)
  // Triangle height: 26px
  // Overlap: -7px
  // Total height: ~59px
  // To align bottom with coordinate, offset center up by half height
  const markerHeight = 59; // 40 (circle) + 26 (triangle) - 7 (overlap)
  const centerOffsetY = -markerHeight / 2;

  return (
    <Marker
      coordinate={{
        latitude: challenge.location.latitude,
        longitude: challenge.location.longitude,
      }}
      centerOffset={{ x: 0, y: centerOffsetY }}
      title={challenge.name}
      description={challenge.description}
      onPress={() => onPress(challenge.id)}
      zIndex={1000}
    >
      <View className="items-center z-20">
        <View className="w-10 h-10 rounded-full bg-[#262626] items-center justify-center shadow-lg">
          {renderIcon()}
        </View>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 14,
            borderRightWidth: 14,
            borderTopWidth: 26,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: '#262626',
            marginTop: -7,
          }}
        />
      </View>
    </Marker>
  );
};

