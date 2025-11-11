import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { updateUser } from '../../api/users';
import { ErrorScreen, LoadingScreen, ScreenHeader, SubmitButton } from '../../components/common';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { SPORTS_TRANSLATION_EN_TO_DK, type Sport } from '../../types/sports';
import type { UpdateUser } from '../../types/user';

// Create reverse mapping: Danish -> English
const SPORTS_TRANSLATION_DK_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(SPORTS_TRANSLATION_EN_TO_DK).map(([en, dk]) => [dk, en])
);

// Normalize sport name to English
const normalizeSportName = (name: string): string => {
  // If it's already an English key, return it
  if (SPORTS_TRANSLATION_EN_TO_DK[name]) {
    return name;
  }
  // If it's a Danish name, convert to English
  if (SPORTS_TRANSLATION_DK_TO_EN[name]) {
    return SPORTS_TRANSLATION_DK_TO_EN[name];
  }
  // Otherwise return as-is
  return name;
};

export default function ProfileInformationScreen() {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();

  // Form state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteSports, setFavoriteSports] = useState<Sport[]>([]); // English values (for API)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileImage(user.profile_picture || null);
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setBio(user.bio || '');
      // Normalize sport names to English and set favorite sports
      const normalizedSports = (user.favorite_sports || []).map(sport => ({
        ...sport,
        name: normalizeSportName(sport.name)
      }));
      setFavoriteSports(normalizedSports);
      setHasChanges(false);
    }
  }, [user]);

  // Track changes
  useEffect(() => {
    if (user) {
      const hasImageChanged = profileImage !== (user.profile_picture || null);
      const hasFirstNameChanged = firstName !== (user.first_name || '');
      const hasLastNameChanged = lastName !== (user.last_name || '');
      const hasBioChanged = bio !== (user.bio || '');

      // Compare current favorite sports with user's favorite sports by name
      const userSportNames = (user.favorite_sports || []).map(s => s.name).sort();
      const currentSportNames = favoriteSports.map(s => s.name).sort();
      const hasSportsChanged = JSON.stringify(currentSportNames) !== JSON.stringify(userSportNames);

      setHasChanges(hasImageChanged || hasFirstNameChanged || hasLastNameChanged || hasBioChanged || hasSportsChanged);
    }
  }, [profileImage, firstName, lastName, bio, favoriteSports, user]);

  const handleImageChange = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tilladelse påkrævet', 'Vi har brug for tilladelse til at tilgå dine billeder.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const toggleSport = (sportName: string) => {
    setFavoriteSports(prev => {
      // Check if sport already exists (case-insensitive to avoid duplicates)
      const existingIndex = prev.findIndex(s => s.name.toLowerCase() === sportName.toLowerCase());
      if (existingIndex >= 0) {
        // Remove the sport
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add the sport - try to find original sport from user data to preserve ID
        const originalSport = user?.favorite_sports?.find(s => s.name.toLowerCase() === sportName.toLowerCase());
        if (originalSport) {
          return [...prev, originalSport];
        } else {
          // For new sports, create with id: 0 (backend will handle it)
          return [...prev, { id: 0, name: sportName }];
        }
      }
    });
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (firstName.trim() === '') {
      Alert.alert('Fejl', 'Fornavn er påkrævet');
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize and deduplicate favorite_sports by name (case-insensitive), then extract just the names
      const normalizedAndUniqueSportNames = favoriteSports
        .map(sport => normalizeSportName(sport.name))
        .reduce((acc, sportName) => {
          const exists = acc.some(s => s.toLowerCase() === sportName.toLowerCase());
          if (!exists) {
            acc.push(sportName);
          }
          return acc;
        }, [] as string[]);

      const updateData: UpdateUser = {
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        profile_picture: profileImage || user.profile_picture || undefined,
        bio: bio.trim() || undefined,
        favorite_sports: normalizedAndUniqueSportNames.length > 0 ? normalizedAndUniqueSportNames : undefined,
      };

      const response = await updateUser(String(user.id), updateData);

      if (response.error) {
        Alert.alert('Fejl', response.error || 'Der opstod en fejl ved opdatering af profil');
        setIsSubmitting(false);
        return;
      }

      // Navigate back to profile
      router.back();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Fejl', 'Der opstod en fejl ved opdatering af profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#171616]"
    >
      <ScrollView
        contentContainerClassName="flex-grow px-6 pb-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Top bar with back button and header */}
        <ScreenHeader title="Rediger Profil" />

        {/* Profile Picture Section */}
        <View className="mb-8 items-center">
          <Pressable
            onPress={handleImageChange}
            className="w-48 h-48 rounded-full overflow-hidden"
            style={{ backgroundColor: '#2c2c2c' }}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                className="w-full h-full object-cover"
                contentFit="cover"
              />
            ) : (
              <View 
              className='w-48 h-48 rounded-full justify-center items-center'
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <Ionicons name="person" size={120} color="#2c2c2c" />
              </View>
            )}
          </Pressable>
        </View>

        {/* Name Fields */}
        <View className="w-full max-w-sm mb-6">
          <Text className="text-white text-xl font-bold mb-4">Navn</Text>
          <TextInput
            placeholder="Fornavn"
            placeholderTextColor="#9CA3AF"
            value={firstName}
            onChangeText={setFirstName}
            className="w-full bg-[#575757] text-white rounded-lg px-4 py-3 mb-4"
            style={{ color: '#ffffff' }}
          />

          <TextInput
            placeholder="Efternavn"
            placeholderTextColor="#9CA3AF"
            value={lastName}
            onChangeText={setLastName}
            className="w-full bg-[#575757] text-white rounded-lg px-4 py-3"
            style={{ color: '#ffffff' }}
          />
        </View>

        {/* Bio Section */}
        <View className="w-full max-w-sm mb-6">
          <Text className="text-white text-xl font-bold mb-4">Bio</Text>

          <TextInput
            placeholder="Skriv din bio her..."
            placeholderTextColor="#9CA3AF"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            className="w-full bg-[#575757] text-white rounded-lg px-4 py-3"
            style={{ color: '#ffffff', minHeight: 160 }}
          />
        </View>

        {/* Favorite Sports Section */}
        <View className="w-full max-w-sm mb-8">
          <Text className="text-white text-xl font-bold mb-4">Favoritsportsgrene</Text>

          <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-3 justify-center">
              {Object.keys(SPORTS_TRANSLATION_EN_TO_DK).map((sportName) => {
                const danishName = SPORTS_TRANSLATION_EN_TO_DK[sportName] || sportName;
                const isSelected = favoriteSports.some(s => s.name === sportName);

                return (
                  <Pressable
                    key={sportName}
                    onPress={() => toggleSport(sportName)}
                    className={`px-4 py-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#575757]'}`}
                  >
                    <Text className={`text-sm font-medium ${isSelected ? 'text-black' : 'text-white'}`}>
                      {danishName}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Save Button */}
        <SubmitButton
          label="Gem ændringer"
          loadingLabel="Gemmer..."
          onPress={handleSubmit}
          disabled={!hasChanges || firstName.trim() === ''}
          isLoading={isSubmitting}
          className="max-w-sm"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

