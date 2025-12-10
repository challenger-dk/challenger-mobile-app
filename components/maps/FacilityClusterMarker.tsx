import { Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import type { FacilityCluster } from '../../utils/markerClustering';

interface FacilityClusterMarkerProps {
  cluster: FacilityCluster;
  onPress: (cluster: FacilityCluster) => void;
}

export const FacilityClusterMarker = ({ cluster, onPress }: FacilityClusterMarkerProps) => {
  // Calculate marker dimensions:
  // Circle size varies based on count
  const size = cluster.count < 10 ? 40 : cluster.count < 100 ? 50 : 60;
  const fontSize = cluster.count < 10 ? 14 : cluster.count < 100 ? 16 : 18;
  
  // Center the circle on the coordinate (no offset needed for circle-only design)
  const centerOffsetY = -size / 2;

  return (
    <Marker
      coordinate={{
        latitude: cluster.latitude,
        longitude: cluster.longitude,
      }}
      centerOffset={{ x: 0, y: centerOffsetY }}
      title={`${cluster.count} faciliteter`}
      description={`Tryk for at zoome ind`}
      onPress={() => onPress(cluster)}
      zIndex={500}
    >
      <View className="items-center">
        {/* Circular cluster marker with blue background to match FacilityMarker */}
        <View
          className="rounded-full bg-softBlue items-center justify-center shadow-lg border-2 border-white"
          style={{
            width: size,
            height: size,
          }}
        >
          <Text
            className="text-white font-bold"
            style={{ fontSize }}
          >
            {cluster.count}
          </Text>
        </View>
      </View>
    </Marker>
  );
};

