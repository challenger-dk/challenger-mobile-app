import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import type { Challenge } from '../../types/challenge';

interface ChallengeMarkerProps {
  challenge: Challenge;
  onPress: (challengeId: number) => void;
}

// Map sport names to Ionicons icon names
const getSportIcon = (sport: string): string => {
  const sportLower = sport.toLowerCase();
  
  const sportIconMap: Record<string, string> = {
    'football': 'football',
    'fodbold': 'football',
    'basketball': 'basketball',
    'tennis': 'tennisball',
    'padeltennis': 'tennisball',
    'padel tennis': 'tennisball',
    'tabletennis': 'tennisball',
    'bordtennis': 'tennisball',
    'golf': 'golf',
    'volleyball': 'ellipse',
    'badminton': 'tennisball',
    'boxing': 'fitness',
    'boxning': 'fitness',
    'squash': 'tennisball',
    'petanque': 'radio-button-on',
    'hockey': 'ellipse',
    'handball': 'hand-left',
    'håndbold': 'hand-left',
    'running': 'walk',
    'løb': 'walk',
    'biking': 'bicycle',
    'cykling': 'bicycle',
    'minigolf': 'golf',
    'climbing': 'fitness',
    'klatring': 'fitness',
    'skateboarding': 'bicycle',
    'surfing': 'water',
    'hiking': 'walk',
    'vandring': 'walk',
    'ultimatefrisbee': 'radio-button-on',
    'ultimate frisbee': 'radio-button-on',
    'floorball': 'ellipse',
  };

  return sportIconMap[sportLower] || 'football';
};

export const ChallengeMarker = ({ challenge, onPress }: ChallengeMarkerProps) => {
  const iconName = getSportIcon(challenge.sport);

  return (
    <Marker
      coordinate={{
        latitude: challenge.location.latitude,
        longitude: challenge.location.longitude,
      }}
      title={challenge.name}
      description={challenge.description}
      onPress={() => onPress(challenge.id)}
    >
      <View className="items-center justify-center">
        <View className="w-10 h-10 rounded-full bg-[#262626] items-center justify-center shadow-lg">
          <Ionicons name={iconName as any} size={20} color="#FFFFFF" />
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

