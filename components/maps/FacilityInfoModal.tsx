import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import type { GroupedFacility } from '../../utils/facilityGrouping';
import { getFacilityCategoryConfig } from '../../utils/facilityIcons';

interface FacilityInfoModalProps {
  visible: boolean;
  onClose: () => void;
  groupedFacility: GroupedFacility;
}

export const FacilityInfoModal = ({ visible, onClose, groupedFacility }: FacilityInfoModalProps) => {
  const renderIcon = (facilityType: string, size: number = 20) => {
    const config = getFacilityCategoryConfig(facilityType);
    
    switch (config.iconLibrary) {
      case 'fontawesome6':
        return <FontAwesome6 name={config.iconName as any} size={size} color="white" />;
      case 'material-community':
        return <MaterialCommunityIcons name={config.iconName as any} size={size} color="white" />;
      case 'ionicons':
      default:
        return <Ionicons name={config.iconName as any} size={size} color="white" />;
    }
  };

  const getColorForType = (facilityType: string) => {
    const config = getFacilityCategoryConfig(facilityType);
    if (config.color.startsWith('#')) {
      return config.color;
    }
    const colorMap: Record<string, string> = {
      softGreen: '#76a179',
      softBlue: '#2F6487',
      softPurple: '#8572a3',
      darkBrown: '#423b38',
    };
    return colorMap[config.color] || '#2563EB';
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-center items-center px-4" onPress={onClose}>
        <Pressable
          className="bg-[#1E1E1E] w-full rounded-xl p-5 border border-[#333] max-h-[80%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-bold flex-1">{groupedFacility.name}</Text>
            <Pressable onPress={onClose} className="ml-2 p-1">
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Address */}
          {groupedFacility.address && (
            <View className="mb-4">
              <View className="flex-row items-center mb-1">
                <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                <Text className="text-gray-400 text-sm ml-2">{groupedFacility.address}</Text>
              </View>
            </View>
          )}

          {/* Facility Types */}
          <View className="mb-4">
            <Text className="text-white text-base font-semibold mb-3">
              Tilgængelige aktiviteter ({groupedFacility.facilityTypes.length})
            </Text>
            <ScrollView className="max-h-[300px]">
              {groupedFacility.facilityTypes.map((facilityType, index) => {
                const color = getColorForType(facilityType);
                
                return (
                  <View
                    key={`${facilityType}-${index}`}
                    className="flex-row items-center mb-3 p-3 rounded-lg"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: color }}
                    >
                      {renderIcon(facilityType, 20)}
                    </View>
                    <Text className="text-white text-base flex-1">{facilityType}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Additional Info */}
          {(groupedFacility.phone || groupedFacility.email || groupedFacility.website) && (
            <View className="border-t border-[#333] pt-4">
              {groupedFacility.phone && (
                <View className="flex-row items-center mb-2">
                  <Ionicons name="call-outline" size={16} color="#9CA3AF" />
                  <Text className="text-gray-400 text-sm ml-2">{groupedFacility.phone}</Text>
                </View>
              )}
              {groupedFacility.email && (
                <View className="flex-row items-center mb-2">
                  <Ionicons name="mail-outline" size={16} color="#9CA3AF" />
                  <Text className="text-gray-400 text-sm ml-2">{groupedFacility.email}</Text>
                </View>
              )}
              {groupedFacility.website && (
                <View className="flex-row items-center">
                  <Ionicons name="globe-outline" size={16} color="#9CA3AF" />
                  <Text className="text-gray-400 text-sm ml-2">{groupedFacility.website}</Text>
                </View>
              )}
            </View>
          )}

          {/* Close Button */}
          <Pressable
            className="mt-4 bg-[#333] p-3 rounded-lg items-center"
            onPress={onClose}
          >
            <Text className="text-white font-medium">Luk</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

