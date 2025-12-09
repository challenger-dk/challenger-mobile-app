import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import type { Facility } from '../../types/facility';
import type { GroupedFacility } from '../../utils/facilityGrouping';
import { isGroupedFacility } from '../../utils/facilityGrouping';
import { getFacilityCategoryConfig } from '../../utils/facilityIcons';

interface FacilityMarkerProps {
  facility: Facility | GroupedFacility;
  onPress: (facility: Facility | GroupedFacility) => void;
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

  // For grouped facilities, always show as Sportshaller
  // For individual facilities, use their actual category
  const facilityType = isGroupedFacility(facility) ? 'Sportshaller' : facility.facilityType;
  const categoryConfig = getFacilityCategoryConfig(facilityType);

  const getBackgroundColor = () => {
    if (categoryConfig.color.startsWith('#')) {
      return categoryConfig.color; // Hex color for "Andet"
    }
    // Map color names to hex values
    const colorMap: Record<string, string> = {
      softGreen: '#76a179',
      softBlue: '#2F6487',
      softPurple: '#8572a3',
      darkBrown: '#423b38',
    };
    return colorMap[categoryConfig.color] || '#2563EB';
  };

  const getBorderColor = () => {
    return getBackgroundColor();
  };

  const getBackgroundClass = () => {
    if (categoryConfig.color.startsWith('#')) {
      return ''; // Will use inline style for hex colors
    }
    // Map color names to Tailwind classes
    const classMap: Record<string, string> = {
      softGreen: 'bg-softGreen',
      softBlue: 'bg-softBlue',
      softPurple: 'bg-softPurple',
      darkBrown: 'bg-darkBrown',
    };
    return classMap[categoryConfig.color] || 'bg-blue-600';
  };

  // Render the appropriate icon based on library
  const renderIcon = () => {
    switch (categoryConfig.iconLibrary) {
      case 'fontawesome6':
        return <FontAwesome6 name={categoryConfig.iconName as any} size={24} color="white" />;
      case 'material-community':
        return <MaterialCommunityIcons name={categoryConfig.iconName as any} size={24} color="white" />;
      case 'ionicons':
      default:
        return <Ionicons name={categoryConfig.iconName as any} size={24} color="white" />;
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
      description={isGroupedFacility(facility) ? `${facility.facilityTypes.length} aktiviteter` : facility.address}
      onPress={() => onPress(facility)}
      zIndex={500}
    >
      <View className="items-center z-10">
        {/* Square marker with rounded corners */}
        <View 
          className={`w-10 h-10 rounded-full items-center justify-center shadow-lg ${getBackgroundClass()}`}
          style={categoryConfig.color.startsWith('#') ? { backgroundColor: getBackgroundColor() } : undefined}
        >
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
            borderTopColor: getBorderColor(),
            marginTop: -7,
          }}
        />
      </View>
    </Marker>
  );
};

