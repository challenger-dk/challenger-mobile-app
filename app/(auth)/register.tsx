import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { register } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { SPORTS_TRANSLATION_EN_TO_DK } from '../../types/sports';
import type { CreateUser } from '../../types/user';

const TOTAL_STEPS = 4;

export default function RegisterScreen() {
  const router = useRouter();
  const { setToken } = useAuth();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]); // English values (for API)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const toggleSport = (sport: string) => {
    setFavoriteSports(prev =>
      prev.includes(sport)
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
      // Register with all collected data
      const registerResponse = await register({
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName || undefined,
        profile_picture: profileImage || undefined,
        bio: bio || undefined,
        favorite_sports: favoriteSports.length > 0 ? favoriteSports : undefined,
      } as CreateUser);

      if (registerResponse.error) {
        Alert.alert('Fejl', registerResponse.error || 'Der opstod en fejl ved registrering');
        setIsSubmitting(false);
        return;
      }

      // If registration successful, save token and navigate
      if (registerResponse.token) {
        await setToken(registerResponse.token);
        router.replace('/(tabs)' as any);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Fejl', 'Der opstod en fejl ved registrering');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return firstName.trim() !== '' && lastName.trim() !== '';
      case 2:
        return true;
      case 3:
        return favoriteSports.length > 0;
      case 4:
        return email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '' && password === confirmPassword;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text className="text-white text-xl font-bold mb-4">Tilføj Profilbillede</Text>
            <Text className="text-white text-center text-sm mb-8">
              Sørg for at man tydeligt kan se ansigt er klart og tydeligt.
            </Text>

            <View className="mb-8">
              <Pressable
                onPress={handleImageChange}
                className="w-48 h-48 rounded-full items-center justify-center overflow-hidden bg-[#2c2c2c]"
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="person-circle" size={180} color="#FFFFFF" />
                )}
              </Pressable>
            </View>

            <TextInput
              placeholder="Fornavn"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
              className="w-full max-w-sm bg-[#575757] text-white rounded-lg px-4 py-3 mb-4"
              style={{ color: '#ffffff' }}
            />

            <TextInput
              placeholder="Efternavn"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
              className="w-full max-w-sm bg-[#575757] text-white rounded-lg px-4 py-3 mb-4"
              style={{ color: '#ffffff' }}
            />
          </>
        );

      case 2:
        return (
          <>
            <Text className="text-white text-xl font-bold mb-4">Tilføj Bio</Text>
            <Text className="text-white text-center text-sm mb-8">
              Fortæl lidt om dig selv
            </Text>

            <TextInput
              placeholder="Skriv din bio her..."
              placeholderTextColor="#9CA3AF"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              className="w-full max-w-sm bg-[#575757] text-white rounded-lg px-4 py-3 mb-4"
              style={{ color: '#ffffff', minHeight: 160 }}
            />
          </>
        );

      case 3:
        return (
          <>
            <Text className="text-white text-xl font-bold mb-4">Vælg Dine Favoritsports</Text>
            <Text className="text-white text-center text-sm mb-8">
              Vælg de sportsgrene du er interesseret i
            </Text>

            <ScrollView className="w-full max-w-sm" showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap gap-3 justify-center">
                {Object.keys(SPORTS_TRANSLATION_EN_TO_DK).map((sport) => {
                  const danishName = SPORTS_TRANSLATION_EN_TO_DK[sport] || sport;
                  const isSelected = favoriteSports.includes(sport);

                  return (
                    <Pressable
                      key={sport}
                      onPress={() => toggleSport(sport)}
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
          </>
        );

      case 4:
        return (
          <>
            <Text className="text-white text-xl font-bold mb-4">Opret Konto</Text>
            <Text className="text-white text-center text-sm mb-8">
              Indtast din e-mail og adgangskode
            </Text>

            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="w-full max-w-sm bg-[#575757] text-white rounded-lg px-4 py-3 mb-4"
              style={{ color: '#ffffff' }}
            />

            <View className="w-full max-w-sm relative mb-4">
              <TextInput
                placeholder="Adgangskode"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="w-full bg-[#575757] text-white rounded-lg px-4 py-3 pr-12"
                style={{ color: '#ffffff' }}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2"
                style={{ transform: [{ translateY: -10 }] }}
              >
                {showPassword ? (
                  <Ionicons name="eye-off" size={18} color="#9CA3AF" />
                ) : (
                  <Ionicons name="eye" size={18} color="#9CA3AF" />
                )}
              </Pressable>
            </View>

            <View className="w-full max-w-sm relative mb-4">
              <TextInput
                placeholder="Bekræft adgangskode"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="w-full bg-[#575757] text-white rounded-lg px-4 py-3 pr-12"
                style={{ color: '#ffffff' }}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2"
                style={{ transform: [{ translateY: -10 }] }}
              >
                {showConfirmPassword ? (
                  <Ionicons name="eye-off" size={18} color="#9CA3AF" />
                ) : (
                  <Ionicons name="eye" size={18} color="#9CA3AF" />
                )}
              </Pressable>
            </View>

            {password && confirmPassword && password !== confirmPassword && (
              <Text className="text-red-400 text-sm mb-4">Adgangskoderne matcher ikke</Text>
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
      className="flex-1 bg-[#171616]"
    >
      <ScrollView
        contentContainerClassName="flex-grow px-6 pt-18 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Cancel button */}
        <View className="w-full max-w-sm flex-row justify-start mb-4 absolute top-4 left-4 z-10">
          <Pressable
            onPress={() => router.push('/(auth)/login' as any)}
            className="p-2"
          >
            <Ionicons name="chevron-back-outline" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Logo - same position on all steps */}
        <View className="w-full max-w-38 mb-12 mt-8 items-center">
          <Text className="text-white text-2xl font-bold">Challenger</Text>
          {/* TODO: Add Logo_WHITE.png to assets/images/ and uncomment below */}
          {/* <Image
            source={require('../../assets/images/Logo_WHITE.png')}
            className="w-full max-w-38"
            contentFit="contain"
          /> */}
        </View>

        {/* Step indicator */}
        <View className="w-full max-w-sm flex-row justify-center gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <View
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index + 1 <= currentStep ? 'bg-white' : 'bg-[#575757]'
              }`}
            />
          ))}
        </View>

        {/* Step content */}
        <View className="flex-1 w-full items-center">
          {renderStepContent()}
        </View>

        {/* Navigation buttons */}
        <View className="w-full max-w-sm flex-row gap-4 mt-8">
          {currentStep > 1 && (
            <Pressable
              onPress={handleBack}
              className="flex-1 bg-[#2c2c2c] rounded-lg px-4 py-4"
            >
              <Text className="text-white text-center font-medium">Tilbage</Text>
            </Pressable>
          )}
          {currentStep < TOTAL_STEPS ? (
            <Pressable
              onPress={handleNext}
              disabled={!canProceedToNextStep()}
              className={`flex-1 rounded-lg px-4 py-4 ${
                canProceedToNextStep()
                  ? 'bg-white'
                  : 'bg-[#575757]'
              }`}
            >
              <Text className={`text-center font-medium ${
                canProceedToNextStep()
                  ? 'text-black'
                  : 'text-gray-400'
              }`}>
                Fortsæt
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubmit}
              disabled={!canProceedToNextStep() || isSubmitting}
              className={`flex-1 rounded-lg px-4 py-4 ${
                canProceedToNextStep() && !isSubmitting
                  ? 'bg-white'
                  : 'bg-[#575757]'
              }`}
            >
              <Text className={`text-center font-medium ${
                canProceedToNextStep() && !isSubmitting
                  ? 'text-black'
                  : 'text-gray-400'
              }`}>
                {isSubmitting ? 'Opretter...' : 'Opret konto'}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
