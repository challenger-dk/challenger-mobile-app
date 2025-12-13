import { register } from '@/api/auth';
import { Avatar, StepIndicator } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { useImagePicker } from '@/hooks/useImagePicker';
import { SPORTS_TRANSLATION_EN_TO_DK } from '@/types/sports';
import type { CreateUser } from '@/types/user';
import { uploadProfilePicture } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOTAL_STEPS = 4;

export default function RegisterScreen() {
  const router = useRouter();
  const { setToken } = useAuth();
  const insets = useSafeAreaInsets();
  const { imageUri, pickImage } = useImagePicker();
  const [currentStep, setCurrentStep] = useState(1);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [age, setAge] = useState('');
  const [city, setCity] = useState<string>('');

  const toggleSport = (sport: string) => {
    setFavoriteSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Fejl', 'Adgangskoderne matcher ikke');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Fejl', 'Adgangskoden skal være mindst 6 tegn');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalProfilePictureUrl: string | undefined = undefined;

      // Upload image to Firebase if one exists
      if (imageUri) {
        try {
          finalProfilePictureUrl = await uploadProfilePicture(imageUri);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          Alert.alert(
            'Fejl ved billede',
            'Kunne ikke uploade profilbillede. Vil du fortsætte uden?',
            [
              {
                text: 'Nej',
                style: 'cancel',
                onPress: () => setIsSubmitting(false),
              },
              {
                text: 'Ja',
                onPress: async () => await proceedWithRegistration(undefined),
              },
            ]
          );
          return;
        }
      }

      await proceedWithRegistration(finalProfilePictureUrl);
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Fejl', 'Der opstod en fejl ved registrering');
      setIsSubmitting(false);
    }
  };

  const proceedWithRegistration = async (
    profilePictureUrl: string | undefined
  ) => {
    try {
      const ageNumber = age.trim() === '' ? undefined : parseInt(age, 10);

      const registerResponse = await register({
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        profile_picture: profilePictureUrl,
        bio: bio.trim() || undefined,
        favorite_sports: favoriteSports.length > 0 ? favoriteSports : undefined,
        age: ageNumber ?? 1,
        city: city.trim() || undefined,
      } as CreateUser);

      if (registerResponse.error) {
        Alert.alert(
          'Fejl',
          registerResponse.error || 'Der opstod en fejl ved registrering'
        );
        setIsSubmitting(false);
        return;
      }

      if (registerResponse.token) {
        await setToken(registerResponse.token);
        router.replace('/(tabs)' as any);
      }
    } catch (error) {
      console.error('Registration API error:', error);
      Alert.alert('Fejl', 'Kunne ikke oprette bruger');
      setIsSubmitting(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: {
        const ageNumber = age.trim() === '' ? NaN : parseInt(age, 10);
        return (
          firstName.trim() !== '' &&
          lastName.trim() !== '' &&
          Number.isFinite(ageNumber) &&
          ageNumber > 0
        );
      }
      case 2:
        return true;
      case 3:
        return favoriteSports.length > 0;
      case 4:
        return (
          email.trim() !== '' &&
          password.trim() !== '' &&
          confirmPassword.trim() !== '' &&
          password === confirmPassword
        );
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text className="text-text text-xl font-bold mb-4">
              Tilføj Profilbillede
            </Text>
            <Text className="text-text text-center text-sm mb-8">
              Sørg for at man tydeligt kan se ansigt er klart og tydeligt.
            </Text>

            <View className="mb-8">
              <Pressable onPress={pickImage}>
                <Avatar
                  uri={imageUri}
                  size={192}
                  className="bg-surface"
                  placeholderIcon="person"
                />
              </Pressable>
            </View>

            <TextInput
              placeholder="Fornavn"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
              className="w-full max-w-sm bg-surface text-text rounded-lg px-4 py-3 mb-4"
            />
            <TextInput
              placeholder="Efternavn"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
              className="w-full max-w-sm bg-surface text-text rounded-lg px-4 py-3 mb-4"
            />
            <TextInput
              placeholder="By"
              placeholderTextColor="#9CA3AF"
              value={city}
              onChangeText={setCity}
              className="w-full max-w-sm bg-surface text-text rounded-lg px-4 py-3 mb-4"
            />

            <TextInput
              placeholder="Alder"
              placeholderTextColor="#9CA3AF"
              value={age}
              keyboardType="number-pad"
              onChangeText={(text) => {
                const digitsOnly = text.replace(/\D/g, '');
                setAge(digitsOnly);
              }}
              className="w-full max-w-sm bg-surface text-text rounded-lg px-4 py-3 mb-4"
            />
          </>
        );
      case 2:
        return (
          <>
            <Text className="text-text text-xl font-bold mb-4">Tilføj Bio</Text>
            <Text className="text-text text-center text-sm mb-8">
              Fortæl lidt om dig selv
            </Text>
            <TextInput
              placeholder="Skriv din bio her..."
              placeholderTextColor="#9CA3AF"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="w-full max-w-sm bg-surface text-text rounded-lg px-4 py-3 mb-4 min-h-[160px]"
            />
          </>
        );
      case 3:
        return (
          <>
            <Text className="text-text text-xl font-bold mb-4">
              Vælg Dine Favoritsports
            </Text>
            <Text className="text-text text-center text-sm mb-8">
              Vælg de sportsgrene du er interesseret i
            </Text>
            <ScrollView
              className="w-full max-w-sm"
              showsVerticalScrollIndicator={false}
            >
              <View className="flex-row flex-wrap gap-3 justify-center">
                {Object.keys(SPORTS_TRANSLATION_EN_TO_DK).map((sport) => (
                  <Pressable
                    key={sport}
                    onPress={() => toggleSport(sport)}
                    className={`px-4 py-2 rounded-full ${
                      favoriteSports.includes(sport) ? 'bg-white' : 'bg-surface'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        favoriteSports.includes(sport) ? 'text-black' : 'text-white'
                      }`}
                    >
                      {SPORTS_TRANSLATION_EN_TO_DK[sport] || sport}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </>
        );
      case 4:
        return (
          <>
            <Text className="text-text text-xl font-bold mb-4">Opret Konto</Text>
            <Text className="text-text text-center text-sm mb-8">
              Indtast din e-mail og adgangskode
            </Text>
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="w-full max-w-sm bg-surface text-text rounded-lg px-4 py-3 mb-4"
            />
            <View className="w-full max-w-sm relative mb-4">
              <TextInput
                placeholder="Adgangskode"
                testID="password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                autoComplete="password-new"
                autoCorrect={false}
                spellCheck={false}
                className="w-full bg-surface text-text rounded-lg px-4 py-3 pr-12"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-2.5"
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>
            <View className="w-full max-w-sm relative mb-4">
              <TextInput
                placeholder="Bekræft adgangskode"
                testID="confirmPassword"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                textContentType="newPassword"
                autoComplete="password-new"
                autoCorrect={false}
                spellCheck={false}
                className="w-full bg-surface text-text rounded-lg px-4 py-3 pr-12"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-2.5"
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>
            {password && confirmPassword && password !== confirmPassword && (
              <Text className="text-danger text-sm mb-4">
                Adgangskoderne matcher ikke
              </Text>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 72,
          paddingBottom: 48,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="absolute top-4 left-4 z-10">
          <Pressable
            onPress={() => router.push('/(auth)/login' as any)}
            className="p-2"
          >
            <Ionicons name="chevron-back-outline" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        <View className="w-full max-w-38 mb-12 mt-8 items-center">
          <Text className="text-text text-2xl font-bold">Challenger</Text>
        </View>

        <StepIndicator totalSteps={TOTAL_STEPS} currentStep={currentStep} />

        <View className="flex-1 w-full items-center">{renderStepContent()}</View>

        <View className="w-full max-w-sm flex-row gap-4 mt-8">
          {currentStep > 1 && (
            <Pressable
              onPress={handleBack}
              className="flex-1 bg-surface rounded-lg px-4 py-4"
            >
              <Text className="text-text text-center font-medium">Tilbage</Text>
            </Pressable>
          )}
          {currentStep < TOTAL_STEPS ? (
            <Pressable
              onPress={handleNext}
              disabled={!canProceedToNextStep()}
              className={`flex-1 rounded-lg px-4 py-4 ${
                canProceedToNextStep() ? 'bg-white' : 'bg-surface'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  canProceedToNextStep() ? 'text-black' : 'text-gray-400'
                }`}
              >
                Fortsæt
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubmit}
              disabled={!canProceedToNextStep() || isSubmitting}
              className={`flex-1 rounded-lg px-4 py-4 ${
                canProceedToNextStep() && !isSubmitting ? 'bg-white' : 'bg-surface'
              }`}
              testID="submitButton"
            >
              <Text
                className={`text-center font-medium ${
                  canProceedToNextStep() && !isSubmitting
                    ? 'text-black'
                    : 'text-gray-400'
                }`}
              >
                {isSubmitting ? 'Opretter...' : 'Opret konto'}
              </Text>
            </Pressable>
          )}
        </View>

        {currentStep === 4 && (
          <View className="mt-4 flex-row justify-center flex-wrap">
            <Text className="text-[#9CA3AF] text-xs text-center">
              Ved at oprette en bruger accepterer du vores{' '}
            </Text>
            <Pressable onPress={() => router.push('/privacy-policy' as any)}>
              <Text className="text-primary text-xs font-medium underline">
                privatlivspolitik
              </Text>
            </Pressable>
            <Text className="text-[#9CA3AF] text-xs">.</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
