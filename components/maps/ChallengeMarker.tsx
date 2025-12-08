import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import type { Challenge } from '../../types/challenge';
import { getSportIcon } from '../../utils/sportIcons';

interface ChallengeMarkerProps {
  challenge: Challenge;
  onPress: (challengeId: number) => void;
  selectedChallengeId?: number | null;
}

export const ChallengeMarker = ({ challenge, onPress, selectedChallengeId }: ChallengeMarkerProps) => {
  const iconConfig = getSportIcon(challenge.sport);
  const isSelected = selectedChallengeId === challenge.id;

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

  const handleMarkerPress = (e: any) => {
    e.stopPropagation?.();
    if (isSelected) {
      // Second click: navigate to challenge
      onPress(challenge.id);
    } else {
      // First click: show card overlay
      onPress(challenge.id);
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: challenge.location.latitude,
        longitude: challenge.location.longitude,
      }}
      centerOffset={{ x: 0, y: centerOffsetY }}
      onPress={handleMarkerPress}
      tappable={true}
      zIndex={isSelected ? 1001 : 1000}
      tracksViewChanges={false}
    >
      <View className="items-center z-20" pointerEvents="none">
        <View className={`w-10 h-10 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-[#262626]'} items-center justify-center shadow-lg`}>
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
            borderTopColor: isSelected ? '#3B82F6' : '#262626',
            marginTop: -7,
          }}
        />
      </View>
    </Marker>
  );
};

