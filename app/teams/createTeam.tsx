import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
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
import { getUsers } from '@/api/users';
// Common Components
import { FormFieldButton, LocationSearch } from '@/components/common';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { CreateInvitation } from '@/types/invitation';
import type { Location } from '@/types/location';
import type { CreateTeam, Team } from '@/types/team'; // Import CreateTeam
import type { User } from '@/types/user';

const TOTAL_STEPS = 4; // Updated from 3 to 4

export default function CreateTeamScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [teamImage, setTeamImage] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [location, setLocation] = useState<Location | null>(null); // Added location state
  const [showLocationPicker, setShowLocationPicker] = useState(false); // Added modal state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State after team is created
  const [newTeam, setNewTeam] = useState<Team | null>(null);

  // State for inviting
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
  const [isInviting, setIsInviting] = useState<Record<number, boolean>>({});

  // Fetch all users when step 4 (invites) is reached
  useEffect(() => {
    if (currentStep === 4 && user) {
      const loadUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const users = await getUsers();
          const invitedIds = new Set(invitedUsers.map((u) => u.id));
          // Filter out current user and already invited users
          setAllUsers(users.filter((u: { id: string | number; }) => !invitedIds.has(u.id) && u.id !== user?.id));
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
      // Logic for step 3 (Sports step): Create team before proceeding
      if (currentStep === 3) {
        if (!user) {
          Alert.alert('Fejl', 'Du skal være logget ind for at oprette et hold.');
          return;
        }

        // Removed location check

        setIsSubmitting(true);
        try {
          // *** THIS IS THE FIX ***
          // Conditionally build the payload to match Go's `omitempty`
          const payload: CreateTeam = {
            name: teamName,
          };

          if (location) {
            payload.location = location; // Only add the key if location is not null
          }
          // If location is null, the key will be omitted, and `omitempty` will work.
          // *** END OF FIX ***

          const createdTeam = await createTeam(payload);

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
      router.replace('/teams' as any); // Go to teams index
    }
  };

  const handleInvite = async (invitee: User) => {
    if (!newTeam || !user) return;

    const inviterId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const inviteeId = typeof invitee.id === 'string' ? parseInt(invitee.id, 10) : invitee.id;

    setIsInviting((prev) => ({ ...prev, [inviteeId]: true }));
    try {
      const invitation: CreateInvitation = {
        inviter_id: inviterId,
        invitee_id: inviteeId,
        note: `${user.first_name} har inviteret dig til holdet ${teamName}`, // Added a note
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
      setIsInviting((prev) => ({ ...prev, [inviteeId]: false }));
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return teamName.trim() !== '';
      case 2:
        return true; // Location is optional, so always allow proceeding
      case 3:
        return true; // Step 3 (sports) is a placeholder, always allow proceed
      case 4:
        return true; // Step 4 (invite)
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

      case 2: // New Location Step
        return (
          <>
            <Text className="text-white text-xl font-bold mb-4">Holdets Lokation</Text>
            <Text className="text-white text-center text-sm mb-8">
              Hvor hører holdet til? (Valgfrit)
            </Text>
            <View className="w-full max-w-sm">
              <FormFieldButton
                label="Lokation"
                value={location?.address || ''}
                placeholder="Vælg lokation"
                onPress={() => setShowLocationPicker(true)}
                disabled={isSubmitting}
              />
            </View>
          </>
        );

      case 3: // Old Step 2 (Sports)
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

      case 4: // Old Step 3 (Invites)
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
                      disabled={!!isInviting[typeof user.id === 'string' ? parseInt(user.id, 10) : user.id]}
                      className="bg-green-600 px-3 py-1 rounded-full"
                    >
                      {isInviting[typeof user.id === 'string' ? parseInt(user.id, 10) : user.id] ? (
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
                  <Text className="text-gray-400 text-sm mb-2">Inviteret</Text>
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
                index + 1 <= currentStep ? 'bg-white' : 'bg-[#57575j]'
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
                {currentStep === 3 // Check if on new step 3 (Sports)
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

        {currentStep === 4 && ( // Updated to step 4
          <Pressable
            onPress={handleFinish}
            className="w-full max-w-sm bg-transparent rounded-lg px-4 py-4 mt-2"
          >
            <Text className="text-gray-400 text-center font-medium">Spring over</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Location Search Modal */}
      <Modal
        visible={showLocationPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <Pressable
              className="absolute inset-0"
              onPress={() => setShowLocationPicker(false)}
            />
            <View
              className="bg-[#171616] rounded-t-3xl"
              style={{
                maxHeight: Dimensions.get('window').height * 0.85,
                minHeight: Dimensions.get('window').height * 0.5
              }}
            >
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#272626]">
                <Pressable onPress={() => setShowLocationPicker(false)}>
                  <Text className="text-white text-base">Annuller</Text>
                </Pressable>
                <Text className="text-white text-lg font-bold">Søg efter lokation</Text>
                <Pressable
                  onPress={() => setShowLocationPicker(false)}
                >
                  <Text className="text-white text-base font-medium">Færdig</Text>
                </Pressable>
              </View>
              <View className="flex-1 px-6 pt-4 pb-8">
                <LocationSearch
                  value={location}
                  onLocationSelect={(selectedLocation) => {
                    setLocation(selectedLocation);
                    if (selectedLocation) {
                      setShowLocationPicker(false);
                    }
                  }}
                  placeholder="F.eks. Fælledparken, København"
                  disabled={isSubmitting}
                  showResultsInline={true}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}