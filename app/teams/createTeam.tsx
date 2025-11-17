import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

// Api Imports
import { SendInvitation } from '@/api/invitations';
import { createTeam } from '@/api/teams';
import { getUsers } from '@/api/users'; // Assuming you have this API function
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { CreateInvitation } from '@/types/invitation';
import type { Team } from '@/types/team';
import type { User } from '@/types/user';

const TOTAL_STEPS = 3;

export default function CreateTeamScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [teamImage, setTeamImage] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State after team is created
  const [newTeam, setNewTeam] = useState<Team | null>(null);

  // State for inviting
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
  const [isInviting, setIsInviting] = useState<Record<number, boolean>>({});

  // Fetch all users when step 3 is reached
  useEffect(() => {
    if (currentStep === 3 && user) {
      const loadUsers = async () => {
        setIsLoadingUsers(true);
        try {
          // Assuming getUsers() fetches all users
          const users = await getUsers();
          const invitedIds = new Set(invitedUsers.map((u) => u.id));
          // Filter out current user and already invited users
          setAllUsers(users.filter((u) => !invitedIds.has(u.id) && u.id !== user?.id));
        } catch (err) {
          console.error('Failed to fetch users:', err);
          Alert.alert('Fejl', 'Kunne ikke hente brugerliste.');
        } finally {
          setIsLoadingUsers(false);
        }
      };
      loadUsers();
    }
  }, [currentStep, user, invitedUsers]);

  const handleImageChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tilladelse påkrævet', 'Vi har brug for tilladelse til at tilgå dine billeder.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setTeamImage(result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      // Special logic for step 2: Create team before proceeding
      if (currentStep === 2) {
        if (!user) {
          Alert.alert('Fejl', 'Du skal være logget ind for at oprette et hold.');
          return;
        }
        setIsSubmitting(true);
        try {
          // Create team with just name and creator ID
          const createdTeam = await createTeam({
            name: teamName,
            creator_id: user.id, // Using the logged-in user's ID
            // image: teamImage, // You can add image upload logic here if API supports it
          });

          if (createdTeam) {
            setNewTeam(createdTeam);
            setCurrentStep(currentStep + 1);
          } else {
            Alert.alert('Fejl', 'Kunne ikke oprette holdet. Prøv igen.');
          }
        } catch (error) {
          console.error('Create team error:', error);
          Alert.alert('Fejl', 'Der opstod en uventet fejl.');
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (newTeam) {
      router.replace(`/teams/${newTeam.id}` as any);
    } else {
      router.replace('/(tabs)/teams' as any);
    }
  };

  const handleInvite = async (invitee: User) => {
    if (!newTeam || !user) return;

    setIsInviting((prev) => ({ ...prev, [invitee.id]: true }));
    try {
      const invitation: CreateInvitation = {
        inviter_id: user.id,
        invitee_id: invitee.id,
        note: '', // Sending an empty note
        resource_type: 'team',
        resource_id: newTeam.id,
      };
      await SendInvitation(invitation);
      setInvitedUsers((prev) => [...prev, invitee]);
      setAllUsers((prev) => prev.filter((u) => u.id !== invitee.id));
    } catch (err) {
      console.error('Failed to send invitation:', err);
      Alert.alert('Fejl', `Kunne ikke invitere ${invitee.first_name}.`);
    } finally {
      setIsInviting((prev) => ({ ...prev, [invitee.id]: false }));
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return teamName.trim() !== '';
      case 2:
        return true; // Step 2 (sports) is now just a placeholder, always allow proceed
      case 3:
        return true; // Step 3 (invite) is now just a placeholder
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text className="text-white text-xl font-bold mb-4">Opret dit hold</Text>
            <Text className="text-white text-center text-sm mb-8">
              Tilføj et holdbillede og et navn til dit hold.
            </Text>

            <View className="mb-8">
              <Pressable
                onPress={handleImageChange}
                className="w-48 h-48 rounded-full items-center justify-center overflow-hidden bg-[#2c2c2c]"
              >
                {teamImage ? (
                  <Image source={{ uri: teamImage }} className="w-full h-full" contentFit="cover" />
                ) : (
                  <Ionicons name="shield" size={120} color="#FFFFFF" />
                )}
              </Pressable>
            </View>

            <TextInput
              placeholder="Holdnavn"
              placeholderTextColor="#9CA3AF"
              value={teamName}
              onChangeText={setTeamName}
              className="w-full max-w-sm bg-[#575757] text-white rounded-lg px-4 py-3 mb-4"
              style={{ color: '#ffffff' }}
            />
          </>
        );

      case 2:
        return (
          <>
            <Text className="text-white text-xl font-bold mb-4">Vælg Holdets Sportsgrene</Text>
            <Text className="text-white text-center text-sm mb-8">
              Valg af sportsgrene er midlertidigt deaktiveret.
            </Text>
            <View className="w-full max-w-sm h-48 bg-[#2c2c2c] rounded-lg items-center justify-center">
              <Ionicons name="construct-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-400 mt-4">Kommer snart</Text>
            </View>
          </>
        );

      case 3:
        return (
          <>
            <Text className="text-white text-xl font-bold mb-4">Inviter Medlemmer</Text>
            <Text className="text-white text-center text-sm mb-8">
              Inviter brugere til {teamName}.
            </Text>

            <ScrollView className="w-full max-w-sm" style={{ maxHeight: 300 }}>
              {isLoadingUsers ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                allUsers.map((user) => (
                  <View
                    key={user.id}
                    className="flex-row items-center justify-between bg-[#2C2C2E] p-3 rounded-lg mb-2"
                  >
                    <Text className="text-white">
                      {user.first_name} {user.last_name}
                    </Text>
                    <Pressable
                      onPress={() => handleInvite(user)}
                      disabled={!!isInviting[user.id]}
                      className="bg-green-600 px-3 py-1 rounded-full"
                    >
                      {isInviting[user.id] ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white text-sm font-medium">Inviter</Text>
                      )}
                    </Pressable>
                  </View>
                ))
              )}

              {invitedUsers.length > 0 && (
                <View className="mt-4">
                  <Text className="text-gray-400 text-sm mb-2">Inviteteret</Text>
                  {invitedUsers.map((user) => (
                    <View
                      key={user.id}
                      className="flex-row items-center justify-between bg-[#1C1C1E] p-3 rounded-lg mb-2"
                    >
                      <Text className="text-white">
                        {user.first_name} {user.last_name}
                      </Text>
                      <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
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
      <Stack.Screen
        options={{
          title: 'Opret Hold',
          headerStyle: { backgroundColor: '#171616' },
          headerTintColor: '#9CA3AF',
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className={Platform.OS === 'ios' ? 'pl-2' : 'pr-4'}
            >
              <Ionicons name="chevron-back" size={24} color="#9CA3AF" />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerClassName="flex-grow px-6 pt-12 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-38 mb-12 mt-8 items-center">
          <Text className="text-white text-2xl font-bold">Challenger</Text>
        </View>

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

        <View className="flex-1 w-full items-center">{renderStepContent()}</View>

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
              disabled={!canProceedToNextStep() || isSubmitting}
              className={`flex-1 rounded-lg px-4 py-4 ${
                canProceedToNextStep() && !isSubmitting ? 'bg-white' : 'bg-[#575757]'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  canProceedToNextStep() && !isSubmitting ? 'text-black' : 'text-gray-400'
                }`}
              >
                {currentStep === 2
                  ? isSubmitting
                    ? 'Opretter...'
                    : 'Opret og fortsæt'
                  : 'Fortsæt'}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleFinish}
              className="flex-1 bg-white rounded-lg px-4 py-4"
            >
              <Text className="text-black text-center font-medium">Færdig</Text>
            </Pressable>
          )}
        </View>

        {currentStep === 3 && (
          <Pressable
            onPress={handleFinish}
            className="w-full max-w-sm bg-transparent rounded-lg px-4 py-4 mt-2"
          >
            <Text className="text-gray-400 text-center font-medium">Spring over</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}