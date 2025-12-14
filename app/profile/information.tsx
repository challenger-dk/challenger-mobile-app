import { updateUser } from '@/api/users';
import {
  Avatar,
  ErrorScreen,
  LoadingScreen,
  ScreenHeader,
  SubmitButton,
} from '@/components/common';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useImagePicker } from '@/hooks/useImagePicker';
import { queryKeys } from '@/lib/queryClient';
import { SPORTS_TRANSLATION_EN_TO_DK, type Sport } from '@/types/sports';
import type { UpdateUser } from '@/types/user';
import { deleteFile, uploadProfilePicture } from '@/utils/storage';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SPORTS_TRANSLATION_DK_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(SPORTS_TRANSLATION_EN_TO_DK).map(([en, dk]) => [dk, en])
);

// Convert sport name to English (for API)
const toEnglishSportName = (name: string): string =>
  SPORTS_TRANSLATION_DK_TO_EN[name] || name;

// Convert sport name to Danish (for display)
const toDanishSportName = (name: string): string =>
  SPORTS_TRANSLATION_EN_TO_DK[name] || name;

// Normalize sport name for comparison (handles both English and Danish)
const normalizeSportNameForComparison = (name: string): string => {
  // If it's already an English key, return it
  if (SPORTS_TRANSLATION_EN_TO_DK[name]) return name;
  // If it's Danish, convert to English
  if (SPORTS_TRANSLATION_DK_TO_EN[name])
    return SPORTS_TRANSLATION_DK_TO_EN[name];
  // Otherwise return as-is
  return name;
};

export default function ProfileInformationScreen() {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const { imageUri, setImageUri, pickImage } = useImagePicker();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteSports, setFavoriteSports] = useState<Sport[]>([]);
  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setImageUri(user.profile_picture || null);
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setBio(user.bio || '');
      setCity((user as any)?.city || ''); // remove "as any" once user type includes city
      
      // Parse birth_date - handle both Date objects and string dates from API
      if (user.birth_date) {
        const parsedDate = typeof user.birth_date === 'string' 
          ? new Date(user.birth_date) 
          : user.birth_date;
        setBirthDate(isNaN(parsedDate.getTime()) ? undefined : parsedDate);
      } else {
        setBirthDate(undefined);
      }

      setFavoriteSports(
        (user.favorite_sports || []).map((sport) => ({
          ...sport,
          name: normalizeSportNameForComparison(sport.name),
        }))
      );
      setHasChanges(false);
    }
  }, [user, setImageUri]);

  useEffect(() => {
    if (user) {
      const hasImageChanged = imageUri !== (user.profile_picture || null);
      const hasFirstNameChanged = firstName !== (user.first_name || '');
      const hasLastNameChanged = lastName !== (user.last_name || '');
      const hasBioChanged = bio !== (user.bio || '');
      const hasCityChanged = city !== ((user as any)?.city || '');
      
      // Compare birth_date - handle both Date objects and string dates
      const userBirthDate = user.birth_date 
        ? (typeof user.birth_date === 'string' ? new Date(user.birth_date) : user.birth_date)
        : undefined;
      const userBirthDateStr = userBirthDate && !isNaN(userBirthDate.getTime())
        ? userBirthDate.toISOString().split('T')[0]
        : '';
      const currentBirthDateStr = birthDate && !isNaN(birthDate.getTime())
        ? birthDate.toISOString().split('T')[0]
        : '';
      const hasBirthDateChanged = userBirthDateStr !== currentBirthDateStr;

      const userSportNames = (user.favorite_sports || [])
        .map((s) => normalizeSportNameForComparison(s.name))
        .sort();
      const currentSportNames = favoriteSports
        .map((s) => normalizeSportNameForComparison(s.name))
        .sort();
      const hasSportsChanged =
        JSON.stringify(currentSportNames) !== JSON.stringify(userSportNames);

      setHasChanges(
        hasImageChanged ||
        hasFirstNameChanged ||
        hasLastNameChanged ||
        hasBioChanged ||
        hasCityChanged ||
        hasBirthDateChanged ||
        hasSportsChanged
      );
    }
  }, [imageUri, firstName, lastName, bio, city, birthDate, favoriteSports, user]);

  const toggleSport = (sportName: string) => {
    setFavoriteSports((prev) => {
      const normalizedSportName = normalizeSportNameForComparison(sportName);
      const existingIndex = prev.findIndex(
        (s) =>
          normalizeSportNameForComparison(s.name).toLowerCase() ===
          normalizedSportName.toLowerCase()
      );
      if (existingIndex >= 0) {
        return prev.filter((_, index) => index !== existingIndex);
      }
      const originalSport = user?.favorite_sports?.find(
        (s) =>
          normalizeSportNameForComparison(s.name).toLowerCase() ===
          normalizedSportName.toLowerCase()
      );
      return [
        ...prev,
        originalSport
          ? { ...originalSport, name: normalizedSportName }
          : { id: 0, name: normalizedSportName },
      ];
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (firstName.trim() === '') {
      showErrorToast('Fornavn er påkrævet');
      return;
    }

    // Validate birthdate if provided
    if (birthDate && isNaN(birthDate.getTime())) {
      showErrorToast('Indtast en gyldig fødselsdato');
      return;
    }

    // Check if birthdate is in the future
    if (birthDate && birthDate > new Date()) {
      showErrorToast('Fødselsdatoen kan ikke være i fremtiden');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalProfilePictureUrl = user.profile_picture;

      // 1. Upload new image if changed
      if (imageUri && imageUri !== user.profile_picture) {
        try {
          finalProfilePictureUrl = await uploadProfilePicture(imageUri, user.id);

          // 2. Delete old image if it existed
          if (user.profile_picture) {
            await deleteFile(user.profile_picture);
          }
        } catch (uploadError) {
          console.error('Upload failed:', uploadError);
          showErrorToast('Kunne ikke uploade billede');
          setIsSubmitting(false);
          return;
        }
      }

      const sportNames = favoriteSports
        .map((sport) => toEnglishSportName(sport.name))
        .reduce((acc, sportName) => {
          if (!acc.some((s) => s.toLowerCase() === sportName.toLowerCase()))
            acc.push(sportName);
          return acc;
        }, [] as string[]);

      const updateData: UpdateUser = {
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        profile_picture: finalProfilePictureUrl || undefined,
        bio: bio.trim() || undefined,
        favorite_sports: sportNames.length > 0 ? sportNames : undefined,
        city: city.trim() || undefined,
        birth_date: birthDate,
      };

      const response = await updateUser(updateData);

      if (response.error) {
        showErrorToast(response.error);
        return;
      }

      // 3. Invalidate React Query Cache so the app refreshes the user data
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.current(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });

      showSuccessToast('Profil opdateret');
      router.back();
    } catch (error) {
      console.error('Update error:', error);
      showErrorToast('Der opstod en fejl ved opdatering af profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        className="flex-1"
      >
        <View className="px-6 flex-1">
          <ScreenHeader title="Rediger Profil" />

          <ScrollView
            contentContainerStyle={{
              paddingBottom: 24 + insets.bottom,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

        <View className="mb-8 items-center">
          <Pressable onPress={pickImage} testID="pickImage">
            <Avatar
              uri={imageUri}
              size={164}
              className="bg-surface"
              placeholderIcon="camera"
            />
          </Pressable>
        </View>

        <View className="w-full mb-6">
          <Text className="text-text text-xl font-bold mb-4">Fornavn</Text>
          <TextInput
            placeholder="Fornavn"
            placeholderTextColor="#9CA3AF"
            value={firstName}
            onChangeText={setFirstName}
            testID="firstName"
            className="w-full bg-surface text-text rounded-lg px-4 py-3 mb-4 border border-text-disabled"
          />
          <Text className="text-text text-xl font-bold mb-4">Efternavn</Text>
          <TextInput
            placeholder="Efternavn"
            placeholderTextColor="#9CA3AF"
            value={lastName}
            onChangeText={setLastName}
            testID="lastName"
            className="w-full bg-surface text-text rounded-lg px-4 py-3 border border-text-disabled"
          />
        </View>

        <View className="w-full mb-6">
          <Text className="text-text text-xl font-bold mb-4">By</Text>

          <TextInput
            placeholder="By"
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={setCity}
            testID="city"
            className="w-full bg-surface text-text rounded-lg px-4 py-3 mb-4 border border-text-disabled"
          />
          <Text className="text-text text-xl font-bold mb-4">Fødselsdato</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            value={birthDate ? birthDate.toISOString().split('T')[0] : ''}
            onChangeText={(text) => {
              // Allow YYYY-MM-DD format
              const cleaned = text.replace(/[^\d-]/g, '');
              if (cleaned.length === 0) {
                setBirthDate(undefined);
                return;
              }
              
              // Try to parse as date
              const parsed = new Date(cleaned);
              if (!isNaN(parsed.getTime())) {
                setBirthDate(parsed);
              } else if (cleaned.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // If format is correct but date is invalid, still try to set it
                // The validation will catch it on submit
                const parts = cleaned.split('-');
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                const day = parseInt(parts[2], 10);
                const date = new Date(year, month, day);
                if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                  setBirthDate(date);
                }
              }
            }}
            testID="birthDate"
            className="w-full bg-surface text-text rounded-lg px-4 py-3 border border-text-disabled"
          />
        </View>

        <View className="w-full mb-6">
          <Text className="text-text text-xl font-bold mb-4">Bio</Text>
          <TextInput
            placeholder="Skriv din bio her..."
            placeholderTextColor="#9CA3AF"
            value={bio}
            onChangeText={setBio}
            testID="bio"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="w-full bg-surface text-text rounded-lg px-4 py-3 border border-text-disabled min-h-24"
          />
        </View>

        <View className="w-full mb-8">
          <Text className="text-text text-xl font-bold mb-4">
            Favoritsportsgrene
          </Text>
          <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-3 justify-center">
              {Object.keys(SPORTS_TRANSLATION_EN_TO_DK)
                .sort((a, b) => {
                  const aSelected = favoriteSports.some(
                    (s) => normalizeSportNameForComparison(s.name) === a
                  );
                  const bSelected = favoriteSports.some(
                    (s) => normalizeSportNameForComparison(s.name) === b
                  );
                  if (aSelected && !bSelected) return -1;
                  if (!aSelected && bSelected) return 1;
                  return a.localeCompare(b);
                })
                .map((sportName) => {
                  const isSelected = favoriteSports.some(
                    (s) => normalizeSportNameForComparison(s.name) === sportName
                  );
                  return (
                    <Pressable
                      key={sportName}
                      onPress={() => toggleSport(sportName)}
                      className={`px-4 py-2 rounded-full ${
                        isSelected
                          ? 'bg-white'
                          : 'bg-surface border border-text-disabled'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? 'text-black' : 'text-text'
                        }`}
                      >
                        {toDanishSportName(sportName)}
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          </ScrollView>
        </View>

            <SubmitButton
              label="Gem ændringer"
              loadingLabel="Gemmer..."
              onPress={handleSubmit}
              disabled={!hasChanges || firstName.trim() === ''}
              isLoading={isSubmitting}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
