import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFacilities } from '../../hooks/useFacilities';
import { useLocation } from '../../hooks/useLocation';
import type { Facility } from '../../types/facility';
import type { Location } from '../../types/location';
import {
    extractPostalCodeFromAddress,
    formatLocationResult,
    reverseGeocode,
    searchLocation,
    tomTomResultToLocation,
    type TomTomSearchResult,
} from '../../utils/tomtom';

interface LocationSearchProps {
  value: Location | null;
  onLocationSelect: (location: Location | null) => void;
  placeholder?: string;
  disabled?: boolean;
  showResultsInline?: boolean;
  onResultsChange?: (hasResults: boolean) => void;
}

type SearchResult =
  | { type: 'facility'; facility: Facility }
  | { type: 'tomtom'; result: TomTomSearchResult };

export const LocationSearch = ({
  value,
  onLocationSelect,
  placeholder = 'Søg efter lokation...',
  disabled = false,
  showResultsInline = false,
  onResultsChange,
}: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState(value?.address || '');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPinLocation, setMapPinLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const { facilities } = useFacilities();
  const { location: userLocation } = useLocation({ autoRequest: false });
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  // Update search query when value changes externally
  useEffect(() => {
    if (value?.address) {
      setSearchQuery(value.address);
    } else if (!value) {
      setSearchQuery('');
    }
  }, [value]);

  // Helper function to check if a location has a postal code
  const hasPostalCode = (location: Location): boolean => {
    if (location.postal_code && location.postal_code.trim() !== '') {
      return true;
    }
    // Check if we can extract postal code from address
    const extractedPostalCode = extractPostalCodeFromAddress(location.address);
    return extractedPostalCode !== '';
  };

  // Search facilities locally (synchronous, instant)
  const facilityResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    return facilities
      .filter((facility) => {
        const nameMatch = facility.name.toLowerCase().includes(query);
        const detailedNameMatch = facility.detailedName
          ?.toLowerCase()
          .includes(query);
        const addressMatch = facility.address.toLowerCase().includes(query);
        const facilityTypeMatch = facility.facilityType
          .toLowerCase()
          .includes(query);
        const matchesQuery =
          nameMatch || detailedNameMatch || addressMatch || facilityTypeMatch;
        
        // Only include facilities that have a postal code
        return matchesQuery && hasPostalCode(facility.location);
      })
      .slice(0, 10); // Limit to 10 facilities
  }, [searchQuery, facilities]);

  // Debounce search - show "waiting" state while typing, only search after 2 seconds of inactivity
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setIsWaiting(false);
      setShowResults(false);
      onResultsChange?.(false);
      return;
    }

    // Show waiting state immediately when user types
    setIsWaiting(true);
    setShowResults(true);

    // Show facility results immediately (they're already filtered)
    const facilitySearchResults: SearchResult[] = facilityResults.map(
      (facility) => ({
        type: 'facility',
        facility,
      })
    );
    setSearchResults(facilitySearchResults);
    onResultsChange?.(facilitySearchResults.length > 0);

    const timeoutId = setTimeout(async () => {
      // After 2 seconds of no typing, actually make the TomTom API call
      setIsWaiting(false);
      setIsSearching(true);

      try {
        // Search with Denmark as default country set (can be made configurable)
        const response = await searchLocation(searchQuery, {
          limit: 10,
          countrySet: 'DK', // Focus on Denmark, can be expanded to 'DK,SE,NO' for Nordic countries
        });

        // Combine facility results (first priority) with TomTom results (second priority)
        // Filter TomTom results to only include those with postal codes
        const tomTomSearchResults: SearchResult[] = response.results
          .filter((result) => {
            // Check if TomTom result has postal code
            const hasPostalCode =
              result.address.postalCode && result.address.postalCode.trim() !== '';
            return hasPostalCode;
          })
          .map((result) => ({
            type: 'tomtom',
            result,
          }));

        const combinedResults = [
          ...facilitySearchResults,
          ...tomTomSearchResults,
        ];
        setSearchResults(combinedResults);
        setShowResults(true);
        onResultsChange?.(combinedResults.length > 0);
      } catch (error) {
        console.error('Location search error:', error);
        // If TomTom fails, still show facility results
        setSearchResults(facilitySearchResults);
        setShowResults(facilitySearchResults.length > 0);
        onResultsChange?.(facilitySearchResults.length > 0);
      } finally {
        setIsSearching(false);
      }
    }, 2000); // 2 second debounce - only search after user stops typing

    return () => {
      clearTimeout(timeoutId);
      setIsWaiting(false);
    };
  }, [searchQuery, facilityResults, onResultsChange]);

  const handleSelectResult = (result: SearchResult) => {
    let location: Location;
    let formattedLocation: string;

    if (result.type === 'facility') {
      // Extract postal code from address if missing
      const facilityLocation = result.facility.location;
      const postalCode =
        facilityLocation.postal_code && facilityLocation.postal_code.trim() !== ''
          ? facilityLocation.postal_code
          : extractPostalCodeFromAddress(facilityLocation.address);
      
      location = {
        ...facilityLocation,
        postal_code: postalCode,
      };
      formattedLocation = result.facility.detailedName
        ? `${result.facility.name} - ${result.facility.detailedName}`
        : result.facility.name;
    } else {
      location = tomTomResultToLocation(result.result);
      formattedLocation = formatLocationResult(result.result);
    }

    setSearchQuery(formattedLocation);
    setShowResults(false);
    setSearchResults([]);
    setIsWaiting(false);
    setIsSearching(false);
    onLocationSelect(location);
    onResultsChange?.(false);
  };

  const handleInputChange = (text: string) => {
    setSearchQuery(text);
    // Clear location if user is typing (not selecting from results)
    if (text === '') {
      setIsWaiting(false);
      setIsSearching(false);
      onLocationSelect(null);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
    setIsWaiting(false);
    setIsSearching(false);
    onLocationSelect(null);
    onResultsChange?.(false);
  };

  const handleMapPickerOpen = () => {
    // Initialize map with current location or selected location
    if (value) {
      setMapPinLocation({
        latitude: value.latitude,
        longitude: value.longitude,
      });
    } else if (userLocation) {
      setMapPinLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
    } else {
      // Default to Copenhagen
      setMapPinLocation({ latitude: 55.6761, longitude: 12.5683 });
    }
    setShowMapPicker(true);
  };

  const handleMapPress = (event: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMapPinLocation({ latitude, longitude });
  };

  const handleMapPickerConfirm = async () => {
    if (!mapPinLocation) return;

    setIsReverseGeocoding(true);
    try {
      const location = await reverseGeocode(
        mapPinLocation.latitude,
        mapPinLocation.longitude
      );
      setSearchQuery(location.address);
      onLocationSelect(location);
      setShowMapPicker(false);
      onResultsChange?.(false);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Still set location even if reverse geocoding fails
      const location: Location = {
        address: `${mapPinLocation.latitude.toFixed(6)}, ${mapPinLocation.longitude.toFixed(6)}`,
        latitude: mapPinLocation.latitude,
        longitude: mapPinLocation.longitude,
        postal_code: '',
        city: '',
        country: '',
      };
      setSearchQuery(location.address);
      onLocationSelect(location);
      setShowMapPicker(false);
      onResultsChange?.(false);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Render results inline (for modal layout) or as dropdown (for absolute positioning)
  const renderResults = () => {
    if (!showResults || searchQuery.length < 2) {
      return null;
    }

    // Show searching indicator while waiting for user to stop typing OR while actually searching
    if (isWaiting || isSearching) {
      return (
        <View className="py-8 items-center">
          <ActivityIndicator size="small" color="#ffffff" />
          <Text className="text-[#9CA3AF] text-sm mt-2">
            {isWaiting
              ? 'Venter på at du stopper med at skrive...'
              : 'Søger...'}
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0 && searchQuery.trim().length > 0) {
      return (
        <View className="py-8 items-center">
          <Text className="text-[#9CA3AF] text-center">
            Ingen resultater fundet
          </Text>
        </View>
      );
    }

    if (searchResults.length > 0) {
      return (
        <FlatList
          data={searchResults}
          keyExtractor={(item) =>
            item.type === 'facility' ? item.facility.id : item.result.id
          }
          renderItem={({ item }) => {
            if (item.type === 'facility') {
              return (
                <Pressable
                  onPress={() => handleSelectResult(item)}
                  className="px-4 py-4 border-b border-[#575757] active:bg-[#171616]"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="location" size={16} color="#3B82F6" />
                    <View className="flex-1">
                      <Text className="text-white text-base font-medium">
                        {item.facility.detailedName
                          ? `${item.facility.name} - ${item.facility.detailedName}`
                          : item.facility.name}
                      </Text>
                      <Text className="text-[#9CA3AF] text-sm mt-1">
                        {item.facility.address}
                      </Text>
                      {item.facility.facilityType && (
                        <Text className="text-[#3B82F6] text-xs mt-1">
                          {item.facility.facilityType}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            } else {
              return (
                <Pressable
                  onPress={() => handleSelectResult(item)}
                  className="px-4 py-4 border-b border-[#575757] active:bg-[#171616]"
                >
                  <Text className="text-white text-base font-medium">
                    {formatLocationResult(item.result)}
                  </Text>
                  {item.result.address.municipality && (
                    <Text className="text-[#9CA3AF] text-sm mt-1">
                      {item.result.address.municipality}
                      {item.result.address.postalCode &&
                        `, ${item.result.address.postalCode}`}
                    </Text>
                  )}
                </Pressable>
              );
            }
          }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          className="flex-1"
        />
      );
    }

    return null;
  };

  if (showResultsInline) {
    // Inline layout for modal - results appear below input
    return (
      <>
        <View className="flex-1">
          <View className="relative mb-4 flex-row items-center gap-2">
            <View className="flex-1 relative">
              <TextInput
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleInputChange}
                className="bg-[#272626] text-white rounded-lg px-4 py-3 pr-10 border border-[#575757]"
                style={{ color: '#ffffff', fontSize: 16 }}
                editable={!disabled}
                autoFocus
                multiline={false}
                returnKeyType="search"
              />
              {(isSearching || isWaiting) && (
                <View className="absolute right-3 top-3">
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              )}
              {!isSearching && !isWaiting && searchQuery && (
                <Pressable
                  onPress={handleClear}
                  className="absolute right-3 top-3"
                >
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={handleMapPickerOpen}
              disabled={disabled}
              className="bg-[#272626] border border-[#575757] rounded-lg p-3"
            >
              <Ionicons name="map" size={20} color="#ffffff" />
            </Pressable>
          </View>
          {renderResults()}
        </View>
        {/* Map Picker Modal */}
        <Modal
          visible={showMapPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMapPicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <Pressable
              className="absolute inset-0"
              onPress={() => setShowMapPicker(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'position' : 'height'}
              keyboardVerticalOffset={0}
            >
              <View
                className="bg-background rounded-t-3xl"
                style={{
                  maxHeight: Dimensions.get('window').height * 0.9,
                  minHeight: Dimensions.get('window').height * 0.7,
                  paddingBottom: insets.bottom,
                }}
              >
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-surface">
                  <Pressable onPress={() => setShowMapPicker(false)}>
                    <Text className="text-text text-base">Annuller</Text>
                  </Pressable>
                  <Text className="text-text text-lg font-bold">
                    Vælg lokation på kort
                  </Text>
                  <Pressable
                    onPress={handleMapPickerConfirm}
                    disabled={!mapPinLocation || isReverseGeocoding}
                  >
                    {isReverseGeocoding ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text
                        className={`text-text text-base font-medium ${!mapPinLocation ? 'opacity-50' : ''}`}
                      >
                        Færdig
                      </Text>
                    )}
                  </Pressable>
                </View>
                <View className="flex-1">
                  {mapPinLocation && (
                    <MapView
                      ref={mapRef}
                      style={{ flex: 1 }}
                      initialRegion={{
                        latitude: mapPinLocation.latitude,
                        longitude: mapPinLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      onPress={handleMapPress}
                      showsUserLocation={true}
                      showsMyLocationButton={false}
                      mapType="standard"
                    >
                      <Marker
                        coordinate={mapPinLocation}
                        draggable
                        onDragEnd={(e) =>
                          setMapPinLocation(e.nativeEvent.coordinate)
                        }
                      />
                    </MapView>
                  )}
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </>
    );
  }

  // Original dropdown layout (for absolute positioning)
  return (
    <>
      <View className="relative">
        <View className="relative flex-row items-center gap-2">
          <View className="flex-1 relative">
            <TextInput
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleInputChange}
              className="bg-[#272626] text-white rounded-lg px-4 py-3 pr-10 border border-[#575757]"
              style={{ color: '#ffffff', fontSize: 16 }}
              editable={!disabled}
              autoFocus
              multiline={false}
              returnKeyType="search"
            />
            {(isSearching || isWaiting) && (
              <View className="absolute right-3 top-3">
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            )}
            {!isSearching && !isWaiting && searchQuery && (
              <Pressable
                onPress={handleClear}
                className="absolute right-3 top-3"
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={handleMapPickerOpen}
            disabled={disabled}
            className="bg-[#272626] border border-[#575757] rounded-lg p-3"
          >
            <Ionicons name="map" size={20} color="#ffffff" />
          </Pressable>
        </View>

        {/* Search Results Dropdown */}
        {showResults && searchQuery.length >= 2 && searchResults.length > 0 && (
          <View className="absolute top-full left-0 right-0 mt-1 bg-[#272626] rounded-lg border border-[#575757] max-h-64 z-50">
            <FlatList
              data={searchResults}
              keyExtractor={(item) =>
                item.type === 'facility' ? item.facility.id : item.result.id
              }
              renderItem={({ item }) => {
                if (item.type === 'facility') {
                  return (
                    <Pressable
                      onPress={() => handleSelectResult(item)}
                      className="px-4 py-3 border-b border-[#575757] active:bg-[#171616]"
                    >
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="location" size={16} color="#3B82F6" />
                        <View className="flex-1">
                          <Text className="text-white text-base font-medium">
                            {item.facility.detailedName
                              ? `${item.facility.name} - ${item.facility.detailedName}`
                              : item.facility.name}
                          </Text>
                          <Text className="text-[#9CA3AF] text-sm mt-1">
                            {item.facility.address}
                          </Text>
                          {item.facility.facilityType && (
                            <Text className="text-[#3B82F6] text-xs mt-1">
                              {item.facility.facilityType}
                            </Text>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  );
                } else {
                  return (
                    <Pressable
                      onPress={() => handleSelectResult(item)}
                      className="px-4 py-3 border-b border-[#575757] active:bg-[#171616]"
                    >
                      <Text className="text-white text-base font-medium">
                        {formatLocationResult(item.result)}
                      </Text>
                      {item.result.address.municipality && (
                        <Text className="text-[#9CA3AF] text-sm mt-1">
                          {item.result.address.municipality}
                          {item.result.address.postalCode &&
                            `, ${item.result.address.postalCode}`}
                        </Text>
                      )}
                    </Pressable>
                  );
                }
              }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            />
          </View>
        )}

        {/* No Results Message */}
        {showResults &&
          searchQuery.length >= 2 &&
          !isSearching &&
          searchResults.length === 0 &&
          searchQuery.trim().length > 0 && (
            <View className="absolute top-full left-0 right-0 mt-1 bg-[#272626] rounded-lg border border-[#575757] p-4 z-50">
              <Text className="text-[#9CA3AF] text-center">
                Ingen resultater fundet
              </Text>
            </View>
          )}
      </View>
      {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable
            className="absolute inset-0"
            onPress={() => setShowMapPicker(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'position' : 'height'}
            keyboardVerticalOffset={0}
          >
            <View
              className="bg-background rounded-t-3xl"
              style={{
                maxHeight: Dimensions.get('window').height * 0.9,
                minHeight: Dimensions.get('window').height * 0.7,
                paddingBottom: insets.bottom,
              }}
            >
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-surface">
                <Pressable onPress={() => setShowMapPicker(false)}>
                  <Text className="text-text text-base">Annuller</Text>
                </Pressable>
                <Text className="text-text text-lg font-bold">
                  Vælg lokation på kort
                </Text>
                <Pressable
                  onPress={handleMapPickerConfirm}
                  disabled={!mapPinLocation || isReverseGeocoding}
                >
                  {isReverseGeocoding ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text
                      className={`text-text text-base font-medium ${!mapPinLocation ? 'opacity-50' : ''}`}
                    >
                      Færdig
                    </Text>
                  )}
                </Pressable>
              </View>
              <View className="flex-1">
                {mapPinLocation && (
                  <MapView
                    ref={mapRef}
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: mapPinLocation.latitude,
                      longitude: mapPinLocation.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    onPress={handleMapPress}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    mapType="standard"
                  >
                    <Marker
                      coordinate={mapPinLocation}
                      draggable
                      onDragEnd={(e) =>
                        setMapPinLocation(e.nativeEvent.coordinate)
                      }
                    />
                  </MapView>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
};
