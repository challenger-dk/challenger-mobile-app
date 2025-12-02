import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ErrorScreen, LoadingScreen, TabNavigation, TopActionBar } from '../../components/common';
import { ChallengeClusterMarker, ChallengeMarker, FacilityClusterMarker, FacilityMarker } from '../../components/maps';
import { useChallenges } from '../../hooks/queries';
import { useFacilities } from '../../hooks/useFacilities';
import { useLocation } from '../../hooks/useLocation';
import type { Challenge } from '../../types/challenge';
import type { Facility } from '../../types/facility';
import type { Cluster, FacilityCluster } from '../../utils/markerClustering';
import { clusterChallenges, clusterFacilities } from '../../utils/markerClustering';

type MapViewType = 'challenges' | 'facilities';

// Default location: Copenhagen, Denmark
const DEFAULT_LOCATION: Region = {
  latitude: 55.6761,
  longitude: 12.5683,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapsScreen() {
  const router = useRouter();
  const [mapViewType, setMapViewType] = useState<MapViewType>('challenges');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_LOCATION);
  const [initialRegionSet, setInitialRegionSet] = useState(false);
  const shouldCenterOnLocationRef = useRef(false);
  
  // Animation values for search bar
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.95);
  
  // Get user's current location
  const { location: userLocation, loading: locationLoading, permissionGranted, requestPermission, refreshLocation } = useLocation({
    autoRequest: true,
    watchPosition: false, // Don't continuously watch, just get initial location
  });
  
  // React Query hook - automatically handles caching and refetching
  const { data: challenges = [], isLoading: loading, error, refetch } = useChallenges();
  
  // Load facilities from CSV
  const { facilities = [], isLoading: facilitiesLoading } = useFacilities();

  // Refetch challenges when screen comes into focus
  // This ensures fresh data when navigating to this screen
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Set initial map region to user's location when available
  useEffect(() => {
    if (userLocation && !initialRegionSet && mapRef.current) {
      const newRegion: Region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 1000);
      setInitialRegionSet(true);
    }
  }, [userLocation, initialRegionSet]);

  // Handle centering map when location is updated after manual request
  useEffect(() => {
    if (userLocation && shouldCenterOnLocationRef.current && mapRef.current) {
      const newRegion: Region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01, // Zoom in closer when centering manually
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
      setMapRegion(newRegion);
      shouldCenterOnLocationRef.current = false;
    }
  }, [userLocation]);

  // Handle centering map on user location
  const handleCenterOnLocation = useCallback(async () => {
    if (!permissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    // Set flag to center when location updates
    shouldCenterOnLocationRef.current = true;
    await refreshLocation();
  }, [permissionGranted, requestPermission, refreshLocation]);

  // Filter for public challenges with valid coordinates
  const publicChallenges = useMemo(() => challenges.filter(
    (challenge: Challenge) =>
      challenge.is_public &&
      challenge.location &&
      typeof challenge.location.latitude === 'number' &&
      typeof challenge.location.longitude === 'number' &&
      !isNaN(challenge.location.latitude) &&
      !isNaN(challenge.location.longitude)
  ), [challenges]);

  // Cluster challenges based on zoom level
  const { clusters, individualChallenges } = useMemo(() => {
    return clusterChallenges(publicChallenges, mapRegion);
  }, [publicChallenges, mapRegion]);

  // Cluster facilities based on zoom level
  const { clusters: facilityClusters, individualFacilities } = useMemo(() => {
    return clusterFacilities(facilities, mapRegion);
  }, [facilities, mapRegion]);

  const handleMarkerPress = (challengeId: number) => {
    router.push(`/hub/${challengeId}` as any);
  };

  const handleFacilityPress = (facilityId: string) => {
    // Could navigate to facility details or show info
    console.log('Facility pressed:', facilityId);
  };

  const mapRef = useRef<MapView>(null);

  const handleClusterPress = (cluster: Cluster) => {
    // Zoom in to show individual challenges
    const newRegion: Region = {
      latitude: cluster.latitude,
      longitude: cluster.longitude,
      latitudeDelta: mapRegion.latitudeDelta * 0.3, // Zoom in by 70%
      longitudeDelta: mapRegion.longitudeDelta * 0.3,
    };
    mapRef.current?.animateToRegion(newRegion, 500);
  };

  const handleFacilityClusterPress = (cluster: FacilityCluster) => {
    // Zoom in to show individual facilities
    const newRegion: Region = {
      latitude: cluster.latitude,
      longitude: cluster.longitude,
      latitudeDelta: mapRegion.latitudeDelta * 0.3, // Zoom in by 70%
      longitudeDelta: mapRegion.longitudeDelta * 0.3,
    };
    mapRef.current?.animateToRegion(newRegion, 500);
  };

  const handleRegionChangeComplete = (region: Region) => {
    setMapRegion(region);
  };

  const handleMapPress = () => {
    // Blur the search input when map is tapped
    searchInputRef.current?.blur();
  };

  const handleSearchFocus = () => {
    opacity.value = withSpring(1);
    scale.value = withSpring(1);
  };

  const handleSearchBlur = () => {
    opacity.value = withSpring(0.3);
    scale.value = withSpring(0.95);
  };

  const animatedSearchStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  if (loading || facilitiesLoading) {
    return <LoadingScreen message="Loader challenges..." />;
  }

  if (error) {
    return <ErrorScreen error={error instanceof Error ? error : new Error('Kunne ikke hente challenges')} />;
  }

  // Show fallback for web platform since react-native-maps doesn't fully support web
  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-[#171616]">
        <TopActionBar title="Kort" showNotifications={false} showCalendar={false} showSettings={false} />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-white text-center text-lg mb-2">
            Kortet er ikke tilgængeligt på web
          </Text>
          <Text className="text-gray-400 text-center">
            Brug appen på iOS eller Android for at se kortet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#171616]">
      {/* Top Action Bar */}
      <TopActionBar title="Kort" showNotifications={false} showCalendar={false} showSettings={false} />

      {/* View Toggle */}
      <TabNavigation
        tabs={[
          { key: 'challenges', label: 'Challenges' },
          { key: 'facilities', label: 'Faciliteter' },
        ]}
        activeTab={mapViewType}
        onTabChange={(tabKey) => setMapViewType(tabKey as MapViewType)}
      />

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={userLocation ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        } : DEFAULT_LOCATION}
        region={mapRegion}
        showsUserLocation={permissionGranted}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        onPress={handleMapPress}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {/* Render markers based on selected view */}
        {mapViewType === 'challenges' ? (
          <>
            {/* Render challenge cluster markers */}
            {clusters.map((cluster: Cluster) => (
              <ChallengeClusterMarker
                key={cluster.id}
                cluster={cluster}
                onPress={handleClusterPress}
              />
            ))}
            {/* Render individual challenges that aren't clustered */}
            {individualChallenges.map((challenge: Challenge) => (
              <ChallengeMarker
                key={challenge.id}
                challenge={challenge}
                onPress={handleMarkerPress}
              />
            ))}
          </>
        ) : (
          <>
            {/* Render facility cluster markers */}
            {facilityClusters.map((cluster: FacilityCluster) => (
              <FacilityClusterMarker
                key={cluster.id}
                cluster={cluster}
                onPress={handleFacilityClusterPress}
              />
            ))}
            {/* Render individual facilities that aren't clustered */}
            {individualFacilities.map((facility: Facility) => (
              <FacilityMarker
                key={facility.id}
                facility={facility}
                onPress={handleFacilityPress}
              />
            ))}
          </>
        )}
      </MapView>

      {/* Semi-transparent Search Bar - positioned below toggle */}
      <Animated.View 
        className="absolute top-[100px] left-4 right-[60px] z-10"
        style={animatedSearchStyle}
      >
        <View className="flex-row items-center bg-[#272626]/90 rounded-xl px-3 py-2.5 border border-[#575757]/50">
          <View className="mr-2">
            <Ionicons name="search" size={20} color="#9CA3AF" />
          </View>
          <TextInput
            ref={searchInputRef}
            placeholder="Søg efter lokation..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className="flex-1 text-white text-base p-0"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} className="ml-2 p-1">
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* Center on Location Button */}
      <Pressable
        onPress={handleCenterOnLocation}
        className="absolute bottom-8 right-4 z-10 bg-[#272626]/90 rounded-full p-3 border border-[#575757]/50 shadow-lg"
        style={styles.locationButton}
      >
        <Ionicons 
          name={locationLoading ? "hourglass" : permissionGranted ? "locate" : "location-outline"} 
          size={24} 
          color={permissionGranted ? "#3B82F6" : "#9CA3AF"} 
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  locationButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

