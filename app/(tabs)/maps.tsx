import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { MiniChallengeCard } from '../../components/challenges/MiniChallengeCard';
import {
  ErrorScreen,
  LoadingScreen,
  ScreenContainer,
  TabNavigation,
  TopActionBar,
} from '../../components/common';
import {
  ChallengeClusterMarker,
  ChallengeMarker,
  FacilityClusterMarker,
  FacilityInfoModal,
  FacilityMarker,
  FilterMenu,
  type ChallengeFilters,
} from '../../components/maps';
import { useChallenges } from '../../hooks/queries';
import { useFacilities } from '../../hooks/useFacilities';
import { useLocation } from '../../hooks/useLocation';
import type { Challenge } from '../../types/challenge';
import type { Facility } from '../../types/facility';
import {
  groupDuplicateFacilities,
  isGroupedFacility,
  type GroupedFacility,
} from '../../utils/facilityGrouping';
import type { Cluster, FacilityCluster } from '../../utils/markerClustering';
import {
  clusterChallenges,
  clusterFacilities,
} from '../../utils/markerClustering';

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
  const searchInputRef = useRef<TextInput | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_LOCATION);
  const [initialRegionSet, setInitialRegionSet] = useState(false);
  const shouldCenterOnLocationRef = useRef(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filters, setFilters] = useState<ChallengeFilters | null>(null);

  // Get user's current location
  const {
    location: userLocation,
    permissionGranted,
    requestPermission,
    refreshLocation,
  } = useLocation({
    autoRequest: true,
    watchPosition: false, // Don't continuously watch, just get initial location
  });

  // React Query hook - automatically handles caching and refetching
  const {
    data: challenges = [],
    isLoading: loading,
    error,
    refetch,
  } = useChallenges();

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

  // Helper function to parse time string (HH:mm) to minutes since midnight
  const parseTimeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Helper function to convert Date to minutes since midnight
  const dateToMinutes = (date: Date): number => {
    return date.getHours() * 60 + date.getMinutes();
  };

  // Filter for public challenges with valid coordinates and apply filters
  const publicChallenges = useMemo(
    () => {
      // Helper to check if time range is the default (00:00 to 23:30)
      const isDefaultTimeRange = (startTime: Date, endTime: Date): boolean => {
        const startMinutes = dateToMinutes(startTime);
        const endMinutes = dateToMinutes(endTime);
        return startMinutes === 0 && endMinutes === 1410; // 23:30 = 23*60 + 30 = 1410
      };
      let filtered = challenges.filter(
        (challenge: Challenge) =>
          challenge.is_public &&
          challenge.location &&
          typeof challenge.location.latitude === 'number' &&
          typeof challenge.location.longitude === 'number' &&
          !isNaN(challenge.location.latitude) &&
          !isNaN(challenge.location.longitude)
      );

      // Only apply filters if they exist and are not at default values
      if (filters) {
        // Filter by sports (only if sports are selected)
        if (filters.selectedSports.length > 0) {
          filtered = filtered.filter((challenge: Challenge) =>
            filters.selectedSports.includes(challenge.sport)
          );
        }

        // Filter by indoor/outdoor (only if explicitly set)
        if (filters.isIndoor !== null) {
          filtered = filtered.filter(
            (challenge: Challenge) => challenge.is_indoor === filters.isIndoor
          );
        }

        // Filter by costs (hasCosts: true = show both, false = only without costs)
        // Only apply if hasCosts is false (meaning user wants to filter out challenges with costs)
        if (!filters.hasCosts) {
          filtered = filtered.filter((challenge: Challenge) => !challenge.has_costs);
        }

        // Filter by open status (isOpen: true = show both, false = only closed/not completed)
        // Only apply if isOpen is false (meaning user wants to filter out open challenges)
        if (!filters.isOpen) {
          filtered = filtered.filter((challenge: Challenge) => challenge.is_completed);
        }

        // Filter by team challenge (isTeamChallenge: true = show both, false = only individual)
        // Only apply if isTeamChallenge is false (meaning user wants to filter out team challenges)
        if (!filters.isTeamChallenge) {
          filtered = filtered.filter(
            (challenge: Challenge) => !challenge.teams || challenge.teams.length === 0
          );
        }

        // Filter by time range (only if not default range)
        if (!isDefaultTimeRange(filters.startTime, filters.endTime)) {
          const filterStartMinutes = dateToMinutes(filters.startTime);
          const filterEndMinutes = dateToMinutes(filters.endTime);

          filtered = filtered.filter((challenge: Challenge) => {
            const challengeStartMinutes = parseTimeToMinutes(challenge.start_time);
            const challengeEndMinutes = parseTimeToMinutes(challenge.end_time);

            // Check if challenge time overlaps with filter time range
            // Challenge overlaps if:
            // - Challenge starts before filter ends AND challenge ends after filter starts
            return (
              challengeStartMinutes < filterEndMinutes &&
              challengeEndMinutes > filterStartMinutes
            );
          });
        }
      }

      return filtered;
    },
    [challenges, filters]
  );

  // Cluster challenges based on zoom level
  const { clusters, individualChallenges } = useMemo(() => {
    return clusterChallenges(publicChallenges, mapRegion);
  }, [publicChallenges, mapRegion]);

  // Group duplicate facilities first, then cluster
  const groupedFacilities = useMemo(() => {
    return groupDuplicateFacilities(facilities);
  }, [facilities]);

  // Separate grouped and individual facilities
  const { individualFacilities: individualFacs, groupedFacs } = useMemo(() => {
    const individual: Facility[] = [];
    const grouped: GroupedFacility[] = [];

    groupedFacilities.forEach((f) => {
      if (isGroupedFacility(f)) {
        grouped.push(f);
      } else {
        individual.push(f);
      }
    });

    return { individualFacilities: individual, groupedFacs: grouped };
  }, [groupedFacilities]);

  // Cluster only individual facilities (grouped facilities are always shown individually)
  const { clusters: facilityClusters, individualFacilities } = useMemo(() => {
    const clusteringResult = clusterFacilities(individualFacs, mapRegion);
    return clusteringResult;
  }, [individualFacs, mapRegion]);

  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(
    null
  );
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [cardPosition, setCardPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedGroupedFacility, setSelectedGroupedFacility] =
    useState<GroupedFacility | null>(null);
  const markerPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleMarkerPress = (challengeId: number) => {
    // Clear any pending map press timeout
    if (markerPressTimeoutRef.current) {
      clearTimeout(markerPressTimeoutRef.current);
      markerPressTimeoutRef.current = null;
    }

    if (selectedChallengeId === challengeId) {
      // Second click: navigate to challenge
      router.push(`/hub/${challengeId}` as any);
      setSelectedChallengeId(null);
      setSelectedChallenge(null);
      setCardPosition(null);
    } else {
      // First click: show card overlay
      const challenge = publicChallenges.find(
        (c: Challenge) => c.id === challengeId
      );
      if (challenge && mapRef.current) {
        // Convert marker coordinate to screen position
        mapRef.current
          .pointForCoordinate({
            latitude: challenge.location.latitude,
            longitude: challenge.location.longitude,
          })
          .then((point) => {
            // Position card above marker
            setCardPosition({
              x: point.x - 140, // Center the card (card width is ~280px)
              y: point.y - 95, // Position above marker
            });
          })
          .catch(() => {
            // Fallback to bottom if coordinate conversion fails
            setCardPosition(null);
          });
      }
      setSelectedChallengeId(challengeId);
      setSelectedChallenge(challenge || null);
    }
  };

  const handleCardPress = (challengeId: number) => {
    // Clicking on the card navigates to challenge
    router.push(`/hub/${challengeId}` as any);
    setSelectedChallengeId(null);
    setSelectedChallenge(null);
    setCardPosition(null);
  };

  const handleFacilityPress = (facility: Facility | GroupedFacility) => {
    // If it's a grouped facility, show the modal with all facility types
    if (isGroupedFacility(facility)) {
      setSelectedGroupedFacility(facility);
    } else {
      // For individual facilities, could show info or navigate
      console.log('Facility pressed:', facility.id);
    }
  };

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

  const updateCardPosition = useCallback(() => {
    // Update card position if a challenge is selected
    if (selectedChallenge && mapRef.current) {
      mapRef.current
        .pointForCoordinate({
          latitude: selectedChallenge.location.latitude,
          longitude: selectedChallenge.location.longitude,
        })
        .then((point) => {
          setCardPosition({
            x: point.x - 140,
            y: point.y - 95, // Match the offset used in handleMarkerPress
          });
        })
        .catch(() => {
          // Keep existing position if conversion fails
        });
    }
  }, [selectedChallenge]);

  const handleRegionChange = (region: Region) => {
    // Update card position continuously during map interaction for smooth movement
    updateCardPosition();
  };

  const handleRegionChangeComplete = (region: Region) => {
    setMapRegion(region);
    // Final update when interaction completes
    updateCardPosition();
  };

  const handleMapPress = () => {
    // Blur the search input when map is tapped
    searchInputRef.current?.blur();

    // Delay clearing selection to allow marker press to fire first
    markerPressTimeoutRef.current = setTimeout(() => {
      setSelectedChallengeId(null);
      setSelectedChallenge(null);
      setCardPosition(null);
      markerPressTimeoutRef.current = null;
    }, 100);
  };

  if (loading || facilitiesLoading) {
    return <LoadingScreen message="Loader challenges..." />;
  }

  if (error) {
    return (
      <ErrorScreen
        error={
          error instanceof Error
            ? error
            : new Error('Kunne ikke hente challenges')
        }
      />
    );
  }

  // Show fallback for web platform since react-native-maps doesn't fully support web
  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-background">
        <TopActionBar
          title="Kort"
          showNotifications={false}
          showCalendar={false}
          showSettings={false}
        />
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
    <ScreenContainer className="pt-5">
      {/* Top Action Bar */}
      <TopActionBar
        title="Kort"
        showNotifications={false}
        showCalendar={false}
        showSettings={false}
      />

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
        ref={(ref) => {
          mapRef.current = ref ?? null;
        }}
        style={styles.map}
        initialRegion={
          userLocation
            ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : DEFAULT_LOCATION
        }
        region={mapRegion}
        showsUserLocation={permissionGranted}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        mapType="standard"
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={false}
        onPress={handleMapPress}
        onRegionChange={handleRegionChange}
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
                selectedChallengeId={selectedChallengeId}
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
            {/* Render grouped facilities (always shown individually) */}
            {groupedFacs.map((groupedFacility: GroupedFacility) => (
              <FacilityMarker
                key={groupedFacility.id}
                facility={groupedFacility}
                onPress={handleFacilityPress}
              />
            ))}
          </>
        )}
      </MapView>

      {/* Semi-transparent Search Bar - positioned below toggle */}
      <View
        className="absolute top-[75px] left-4 right-[68px] z-10"
        style={{
          opacity: isSearchFocused ? 1 : 0.3,
        }}
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
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 text-white text-base p-0"
            style={{ textAlignVertical: 'center' }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} className="ml-2 p-1">
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Button */}
      <Pressable
        onPress={() => setFilterMenuVisible(!filterMenuVisible)}
        className="absolute top-[75px] right-4 z-10 bg-[#1E1E1E] rounded-xl p-2.5 border"
      >
        <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
      </Pressable>

      {/* Filter Menu */}
      <FilterMenu
        visible={filterMenuVisible}
        onClose={() => setFilterMenuVisible(false)}
        onResetFilters={() => {
          setSearchQuery('');
          setFilters(null);
        }}
        onFiltersChange={setFilters}
      />

      {/* Center on Location Button */}
      <Pressable
        onPress={handleCenterOnLocation}
        className="absolute bottom-8 right-4 z-10 bg-[#272626]/90 rounded-full p-3 border border-[#575757]/50 shadow-lg"
        style={styles.locationButton}
      >
        <Ionicons
          name={permissionGranted ? 'locate' : 'location-outline'}
          size={24}
          color={permissionGranted ? '#3B82F6' : '#9CA3AF'}
        />
      </Pressable>

      {/* Mini Challenge Card Overlay - shown when marker is selected */}
      {selectedChallenge && cardPosition && cardPosition.y > 80 && (
        <View
          className="absolute"
          style={{
            left: Math.max(
              10,
              Math.min(cardPosition.x, Dimensions.get('window').width - 250)
            ),
            top: cardPosition.y,
            zIndex: 1, // Lower than TopActionBar (100) and searchBar (10)
          }}
        >
          <MiniChallengeCard
            challenge={selectedChallenge}
            joinedParticipants={selectedChallenge.users?.length || 0}
            totalParticipants={
              selectedChallenge.team_size *
              (selectedChallenge.teams?.length || 2)
            }
            onPress={handleCardPress}
          />
        </View>
      )}

      {/* Facility Info Modal - shown when grouped facility is clicked */}
      {selectedGroupedFacility && (
        <FacilityInfoModal
          visible={!!selectedGroupedFacility}
          onClose={() => setSelectedGroupedFacility(null)}
          groupedFacility={selectedGroupedFacility}
        />
      )}
    </ScreenContainer>
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
