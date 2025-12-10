import { Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import type { Cluster } from '../../utils/markerClustering';

interface ChallengeClusterMarkerProps {
  cluster: Cluster;
  onPress: (cluster: Cluster) => void;
}

export const ChallengeClusterMarker = ({
  cluster,
  onPress,
}: ChallengeClusterMarkerProps) => {
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
      title={`${cluster.count} challenges`}
      description={`Tryk for at zoome ind`}
      onPress={() => onPress(cluster)}
      zIndex={1000}
    >
      <View className="items-center">
        {/* Circular cluster marker */}
        <View
          className="rounded-full bg-[#262626] items-center justify-center shadow-lg border-2 border-white"
          style={{
            width: size,
            height: size,
          }}
        >
          <Text className="text-white font-bold" style={{ fontSize }}>
            {cluster.count}
          </Text>
        </View>
      </View>
    </Marker>
  );
};
