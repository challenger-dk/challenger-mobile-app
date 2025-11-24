import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import MapView from 'react-native-maps';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ErrorScreen, LoadingScreen, TopActionBar } from '../../components/common';
import { ChallengeMarker } from '../../components/maps';
import { useChallenges } from '../../hooks/queries';
import type { Challenge } from '../../types/challenge';

export default function MapsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  
  // Animation values for search bar
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.95);
  
  // React Query hook - automatically handles caching and refetching
  const { data: challenges = [], isLoading: loading, error, refetch } = useChallenges();

  // Refetch challenges when screen comes into focus
  // This ensures fresh data when navigating to this screen
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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

  const handleMarkerPress = (challengeId: number) => {
    router.push(`/teams/${challengeId}` as any);
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

  if (loading) {
    return <LoadingScreen message="Loader challenges..." />;
  }

  if (error) {
    return <ErrorScreen error={error instanceof Error ? error : new Error('Kunne ikke hente challenges')} />;
  }

  return (
    <View className="flex-1 bg-[#171616]">
      {/* Top Action Bar */}
      <TopActionBar title="Kort" showNotifications={false} showCalendar={false} showSettings={false} />

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 55.6761, // Copenhagen, Denmark (default location)
          longitude: 12.5683,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType="none"
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        onPress={handleMapPress}
      >
        {publicChallenges.map((challenge: Challenge) => (
          <ChallengeMarker
            key={challenge.id}
            challenge={challenge}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {/* Semi-transparent Search Bar - positioned to avoid compass */}
      <Animated.View 
        className="absolute top-[60px] left-4 right-[60px] z-10"
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
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

