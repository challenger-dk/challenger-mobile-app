import { updateUser } from '@/api/users';
import { Avatar, ErrorScreen, LoadingScreen, ScreenContainer, ScreenHeader, SubmitButton } from '@/components/common';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useImagePicker } from '@/hooks/useImagePicker';
import { SPORTS_TRANSLATION_EN_TO_DK, type Sport } from '@/types/sports';
import type { UpdateUser } from '@/types/user';
import { showErrorToast } from '@/utils/toast';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SPORTS_TRANSLATION_DK_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(SPORTS_TRANSLATION_EN_TO_DK).map(([en, dk]) => [dk, en])
);

const normalizeSportName = (name: string): string =>
  SPORTS_TRANSLATION_EN_TO_DK[name] || SPORTS_TRANSLATION_DK_TO_EN[name] || name;

export default function ProfileInformationScreen() {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const { imageUri, setImageUri, pickImage } = useImagePicker();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteSports, setFavoriteSports] = useState<Sport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setImageUri(user.profile_picture || null);
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setBio(user.bio || '');
      setFavoriteSports((user.favorite_sports || []).map(sport => ({
        ...sport,
        name: normalizeSportName(sport.name)
      })));
      setHasChanges(false);
    }
  }, [user, setImageUri]);

  useEffect(() => {
    if (user) {
      const hasImageChanged = imageUri !== (user.profile_picture || null);
      const hasFirstNameChanged = firstName !== (user.first_name || '');
      const hasLastNameChanged = lastName !== (user.last_name || '');
      const hasBioChanged = bio !== (user.bio || '');
      const userSportNames = (user.favorite_sports || []).map(s => s.name).sort();
      const currentSportNames = favoriteSports.map(s => s.name).sort();
      const hasSportsChanged = JSON.stringify(currentSportNames) !== JSON.stringify(userSportNames);

      setHasChanges(hasImageChanged || hasFirstNameChanged || hasLastNameChanged || hasBioChanged || hasSportsChanged);
    }
  }, [imageUri, firstName, lastName, bio, favoriteSports, user]);

  const toggleSport = (sportName: string) => {
    setFavoriteSports(prev => {
      const existingIndex = prev.findIndex(s => s.name.toLowerCase() === sportName.toLowerCase());
      if (existingIndex >= 0) {
        return prev.filter((_, index) => index !== existingIndex);
      }
      const originalSport = user?.favorite_sports?.find(s => s.name.toLowerCase() === sportName.toLowerCase());
      return [...prev, originalSport || { id: 0, name: sportName }];
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (firstName.trim() === '') {
      showErrorToast('Fornavn er påkrævet');
      return;
    }

    setIsSubmitting(true);
    try {
      const sportNames = favoriteSports
        .map(sport => normalizeSportName(sport.name))
        .reduce((acc, sportName) => {
          if (!acc.some(s => s.toLowerCase() === sportName.toLowerCase())) acc.push(sportName);
          return acc;
        }, [] as string[]);

      const updateData: UpdateUser = {
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        profile_picture: imageUri || user.profile_picture || undefined,
        bio: bio.trim() || undefined,
        favorite_sports: sportNames.length > 0 ? sportNames : undefined,
      };

      const response = await updateUser(String(user.id), updateData);
      if (response.error) {
        showErrorToast(response.error);
        return;
      }
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 + insets.bottom }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Rediger Profil" />
        <View className="mb-8 items-center">
          <Pressable onPress={pickImage}>
            <Avatar uri={imageUri} size={192} className="bg-surface" placeholderIcon="person" />
          </Pressable>
        </View>
        <View className="w-full max-w-sm mb-6">
          <Text className="text-text text-xl font-bold mb-4">Navn</Text>
          <TextInput
            placeholder="Fornavn"
            placeholderTextColor="#9CA3AF"
            value={firstName}
            onChangeText={setFirstName}
            className="w-full bg-surface text-text rounded-lg px-4 py-3 mb-4 border border-text-disabled"
          />
          <TextInput
            placeholder="Efternavn"
            placeholderTextColor="#9CA3AF"
            value={lastName}
            onChangeText={setLastName}
            className="w-full bg-surface text-text rounded-lg px-4 py-3 border border-text-disabled"
          />
        </View>
        <View className="w-full max-w-sm mb-6">
          <Text className="text-text text-xl font-bold mb-4">Bio</Text>
          <TextInput
            placeholder="Skriv din bio her..."
            placeholderTextColor="#9CA3AF"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            className="w-full bg-surface text-text rounded-lg px-4 py-3 border border-text-disabled min-h-[160px]"
          />
        </View>
        <View className="w-full max-w-sm mb-8">
          <Text className="text-text text-xl font-bold mb-4">Favoritsportsgrene</Text>
          <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-3 justify-center">
              {Object.keys(SPORTS_TRANSLATION_EN_TO_DK).map((sportName) => {
                const isSelected = favoriteSports.some(s => s.name === sportName);
                return (
                  <Pressable
                    key={sportName}
                    onPress={() => toggleSport(sportName)}
                    className={`px-4 py-2 rounded-full ${isSelected ? 'bg-white' : 'bg-surface border border-text-disabled'}`}
                  >
                    <Text className={`text-sm font-medium ${isSelected ? 'text-black' : 'text-text'}`}>
                      {SPORTS_TRANSLATION_EN_TO_DK[sportName] || sportName}
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
          className="max-w-sm"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
