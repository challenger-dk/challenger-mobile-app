import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import type { Location } from '../../types/location';
import { formatLocationResult, searchLocation, tomTomResultToLocation, type TomTomSearchResult } from '../../utils/tomtom';

interface LocationSearchProps {
  value: Location | null;
  onLocationSelect: (location: Location | null) => void;
  placeholder?: string;
  disabled?: boolean;
  showResultsInline?: boolean;
  onResultsChange?: (hasResults: boolean) => void;
}

export const LocationSearch = ({
  value,
  onLocationSelect,
  placeholder = 'Søg efter lokation...',
  disabled = false,
  showResultsInline = false,
  onResultsChange,
}: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState(value?.address || '');
  const [searchResults, setSearchResults] = useState<TomTomSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Update search query when value changes externally
  useEffect(() => {
    if (value?.address) {
      setSearchQuery(value.address);
    } else if (!value) {
      setSearchQuery('');
    }
  }, [value]);

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

    const timeoutId = setTimeout(async () => {
      // After 2 seconds of no typing, actually make the API call
      setIsWaiting(false);
      setIsSearching(true);
      
      try {
        // Search with Denmark as default country set (can be made configurable)
        const response = await searchLocation(searchQuery, {
          limit: 10,
          countrySet: 'DK', // Focus on Denmark, can be expanded to 'DK,SE,NO' for Nordic countries
        });
        setSearchResults(response.results);
        setShowResults(true);
        onResultsChange?.(response.results.length > 0);
      } catch (error) {
        console.error('Location search error:', error);
        setSearchResults([]);
        setShowResults(false);
        onResultsChange?.(false);
      } finally {
        setIsSearching(false);
      }
    }, 2000); // 2 second debounce - only search after user stops typing

    return () => {
      clearTimeout(timeoutId);
      setIsWaiting(false);
    };
  }, [searchQuery, onResultsChange]);

  const handleSelectResult = (result: TomTomSearchResult) => {
    const location = tomTomResultToLocation(result);
    const formattedLocation = formatLocationResult(result);
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
            {isWaiting ? 'Venter på at du stopper med at skrive...' : 'Søger...'}
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectResult(item)}
              className="px-4 py-4 border-b border-[#575757] active:bg-[#171616]"
            >
              <Text className="text-white text-base font-medium">
                {formatLocationResult(item)}
              </Text>
              {item.address.municipality && (
                <Text className="text-[#9CA3AF] text-sm mt-1">
                  {item.address.municipality}
                  {item.address.postalCode && `, ${item.address.postalCode}`}
                </Text>
              )}
            </Pressable>
          )}
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
      <View className="flex-1">
        <View className="relative mb-4">
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
        {renderResults()}
      </View>
    );
  }

  // Original dropdown layout (for absolute positioning)
  return (
    <View className="relative">
      <View className="relative">
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

      {/* Search Results Dropdown */}
      {showResults && searchQuery.length >= 2 && searchResults.length > 0 && (
        <View className="absolute top-full left-0 right-0 mt-1 bg-[#272626] rounded-lg border border-[#575757] max-h-64 z-50">
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectResult(item)}
                className="px-4 py-3 border-b border-[#575757] active:bg-[#171616]"
              >
                <Text className="text-white text-base font-medium">
                  {formatLocationResult(item)}
                </Text>
                {item.address.municipality && (
                  <Text className="text-[#9CA3AF] text-sm mt-1">
                    {item.address.municipality}
                    {item.address.postalCode && `, ${item.address.postalCode}`}
                  </Text>
                )}
              </Pressable>
            )}
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
  );
};

