import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import type { Facility } from '../../types/facility';
import { getFacilityTypeIcon } from '../../utils/facilityIcons';

interface FacilityMarkerProps {
  facility: Facility;
  onPress: (facilityId: string) => void;
}

export const FacilityMarker = ({ facility, onPress }: FacilityMarkerProps) => {
  // Calculate marker dimensions:
  // Square: 40px (w-10 h-10)
  // Triangle height: 26px
  // Overlap: -7px
  // Total height: ~59px
  // To align bottom with coordinate, offset center up by half height
  const markerHeight = 59; // 40 (square) + 26 (triangle) - 7 (overlap)
  const centerOffsetY = -markerHeight / 2;

  // Get icon based on facility type
  const iconConfig = getFacilityTypeIcon(facility.facilityType);

  // Render the appropriate icon based on library
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

  return (
    <Marker
      coordinate={{
        latitude: facility.location.latitude,
        longitude: facility.location.longitude,
      }}
      centerOffset={{ x: 0, y: centerOffsetY }}
      title={facility.name}
      description={facility.address}
      onPress={() => onPress(facility.id)}
      zIndex={500}
    >
      <View className="items-center z-10">
        {/* Square marker with rounded corners */}
        <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center shadow-lg">
          {renderIcon()}
        </View>
        {/* Triangle pointer */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 14,
            borderRightWidth: 14,
            borderTopWidth: 26,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: '#2563EB', // blue-600
            marginTop: -7,
          }}
        />
      </View>
    </Marker>
  );
};

