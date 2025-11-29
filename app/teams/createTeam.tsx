import { SendInvitation } from '@/api/invitations';
import { createTeam } from '@/api/teams';
import { getUsers } from '@/api/users';
import { Avatar, FormFieldButton, LocationSearch, StepIndicator } from '@/components/common';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useImagePicker } from '@/hooks/useImagePicker';
import type { CreateInvitation } from '@/types/invitation';
import type { Location } from '@/types/location';
import type { CreateTeam, Team } from '@/types/team';
import type { User } from '@/types/user';
import { showErrorToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOTAL_STEPS = 4;

export default function CreateTeamScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const { imageUri, pickImage } = useImagePicker();

  const [currentStep, setCurrentStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTeam, setNewTeam] = useState<Team | null>(null);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
  const [isInviting, setIsInviting] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (currentStep === 4 && user) {
      const loadUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const users = await getUsers();
          const invitedIds = new Set(invitedUsers.map((u) => u.id));
          setAllUsers(users.filter((u: { id: string | number; }) => !invitedIds.has(u.id) && u.id !== user?.id));
        } catch (err) {
          console.error('Failed to fetch users:', err);
          showErrorToast('Kunne ikke hente brugerliste.');
        } finally {
          setIsLoadingUsers(false);
        }
      };
      loadUsers();
    }
  }, [currentStep, user, invitedUsers]);

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      if (currentStep === 3) {
        if (!user) {
          showErrorToast('Du skal være logget ind for at oprette et hold.');
          return;
        }
        setIsSubmitting(true);
        try {
          const payload: CreateTeam = { name: teamName };
          if (location) payload.location = location;

          const createdTeam = await createTeam(payload);
          if (createdTeam) {
            setNewTeam(createdTeam);
            setCurrentStep(currentStep + 1);
          } else {
            showErrorToast('Kunne ikke oprette holdet. Prøv igen.');
          }
        } catch (error) {
          console.error('Create team error:', error);
          showErrorToast('Der opstod en uventet fejl.');
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFinish = () => {
    newTeam ? router.replace(`/teams/${newTeam.id}` as any) : router.replace('/teams' as any);
  };

  const handleInvite = async (invitee: User) => {
    if (!newTeam || !user) return;
    const inviterId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const inviteeId = typeof invitee.id === 'string' ? parseInt(invitee.id, 10) : invitee.id;

    setIsInviting((prev) => ({ ...prev, [inviteeId]: true }));
    try {
      await SendInvitation({
        inviter_id: inviterId,
        invitee_id: inviteeId,
        note: `${user.first_name} har inviteret dig til holdet ${teamName}`,
        resource_type: 'team',
        resource_id: newTeam.id,
      });
      setInvitedUsers((prev) => [...prev, invitee]);
      setAllUsers((prev) => prev.filter((u) => u.id !== invitee.id));
    } catch (err) {
      console.error('Failed to send invitation:', err);
      showErrorToast(`Kunne ikke invitere ${invitee.first_name}.`);
    } finally {
      setIsInviting((prev) => ({ ...prev, [inviteeId]: false }));
    }
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) return teamName.trim() !== '';
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text className="text-text text-xl font-bold mb-4">Opret dit hold</Text>
            <Text className="text-text text-center text-sm mb-8">Tilføj et holdbillede og et navn til dit hold.</Text>
            <View className="mb-8">
              <Pressable onPress={pickImage}>
                <Avatar uri={imageUri} size={192} className="bg-surface" placeholderIcon="shield" />
              </Pressable>
            </View>
            <TextInput
              placeholder="Holdnavn"
              placeholderTextColor="#9CA3AF"
              value={teamName}
              onChangeText={setTeamName}
              className="w-full max-w-sm bg-surface text-text rounded-lg px-4 py-3 mb-4"
            />
          </>
        );
      case 2:
        return (
          <>
            <Text className="text-text text-xl font-bold mb-4">Holdets Lokation</Text>
            <Text className="text-text text-center text-sm mb-8">Hvor hører holdet til? (Valgfrit)</Text>
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
      case 3:
        return (
          <>
            <Text className="text-text text-xl font-bold mb-4">Vælg Holdets Sportsgrene</Text>
            <Text className="text-text text-center text-sm mb-8">Valg af sportsgrene er midlertidigt deaktiveret.</Text>
            <View className="w-full max-w-sm h-48 bg-surface rounded-lg items-center justify-center">
              <Ionicons name="construct-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-400 mt-4">Kommer snart</Text>
            </View>
          </>
        );
      case 4:
        return (
          <>
            <Text className="text-text text-xl font-bold mb-4">Inviter Medlemmer</Text>
            <Text className="text-text text-center text-sm mb-8">Inviter brugere til {teamName}.</Text>
            <ScrollView className="w-full max-w-sm" style={{ maxHeight: 300 }}>
              {user && (
                <View className="mb-4">
                  <Text className="text-text-muted text-sm mb-2">Medlemmer</Text>
                  <View className="flex-row items-center justify-between bg-surfaceHighlight p-3 rounded-lg mb-2">
                    <Text className="text-text">Dig</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
                  </View>
                </View>
              )}
              {isLoadingUsers ? <ActivityIndicator size="large" color="#fff" /> : (
                allUsers.map((user) => (
                  <View key={user.id} className="flex-row items-center justify-between bg-surface p-3 rounded-lg mb-2">
                    <Text className="text-text">{user.first_name} {user.last_name}</Text>
                    <Pressable
                      onPress={() => handleInvite(user)}
                      disabled={!!isInviting[typeof user.id === 'string' ? parseInt(user.id, 10) : user.id]}
                      className="bg-success px-3 py-1 rounded-full"
                    >
                      {isInviting[typeof user.id === 'string' ? parseInt(user.id, 10) : user.id] ?
                        <ActivityIndicator size="small" color="#fff" /> :
                        <Text className="text-text text-sm font-medium">Inviter</Text>
                      }
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>
          </>
        );
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      className="flex-1 bg-background"
    >
      <Stack.Screen options={{ title: 'Opret Hold', headerStyle: { backgroundColor: '#171616' }, headerTintColor: '#9CA3AF', headerShadowVisible: false, headerLeft: () => <Pressable onPress={() => router.back()} className={Platform.OS === 'ios' ? 'pl-2' : 'pr-4'}><Ionicons name="chevron-back" size={24} color="#9CA3AF" /></Pressable> }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 + insets.bottom }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="w-full max-w-38 mb-12 mt-8 items-center"><Text className="text-text text-2xl font-bold">Challenger</Text></View>
        <StepIndicator totalSteps={TOTAL_STEPS} currentStep={currentStep} />
        <View className="flex-1 w-full items-center">{renderStepContent()}</View>
        <View className="w-full max-w-sm flex-row gap-4 mt-8">
          {currentStep > 1 && (
            <Pressable onPress={handleBack} className="flex-1 bg-surface rounded-lg px-4 py-4">
              <Text className="text-text text-center font-medium">Tilbage</Text>
            </Pressable>
          )}
          {currentStep < TOTAL_STEPS ? (
            <Pressable onPress={handleNext} disabled={!canProceedToNextStep() || isSubmitting} className={`flex-1 rounded-lg px-4 py-4 ${canProceedToNextStep() && !isSubmitting ? 'bg-white' : 'bg-surface'}`}>
              <Text className={`text-center font-medium ${canProceedToNextStep() && !isSubmitting ? 'text-black' : 'text-gray-400'}`}>
                {currentStep === 3 ? (isSubmitting ? 'Opretter...' : 'Opret og fortsæt') : 'Fortsæt'}
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleFinish} className="flex-1 bg-white rounded-lg px-4 py-4">
              <Text className="text-black text-center font-medium">Færdig</Text>
            </Pressable>
          )}
        </View>
        {currentStep === 4 && (
          <Pressable onPress={handleFinish} className="w-full max-w-sm bg-transparent rounded-lg px-4 py-4 mt-2">
            <Text className="text-text-muted text-center font-medium">Spring over</Text>
          </Pressable>
        )}
      </ScrollView>
      <Modal visible={showLocationPicker} transparent={true} animationType="slide" onRequestClose={() => setShowLocationPicker(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable className="absolute inset-0" onPress={() => setShowLocationPicker(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'height'} keyboardVerticalOffset={0}>
            <View className="bg-background rounded-t-3xl" style={{ maxHeight: Dimensions.get('window').height * 0.85, minHeight: Dimensions.get('window').height * 0.5, paddingBottom: insets.bottom }}>
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-surface">
                <Pressable onPress={() => setShowLocationPicker(false)}><Text className="text-text text-base">Annuller</Text></Pressable>
                <Text className="text-text text-lg font-bold">Søg efter lokation</Text>
                <Pressable onPress={() => setShowLocationPicker(false)}><Text className="text-text text-base font-medium">Færdig</Text></Pressable>
              </View>
              <View className="flex-1 px-6 pt-4 pb-8">
                <LocationSearch value={location} onLocationSelect={(loc) => { setLocation(loc); if (loc) setShowLocationPicker(false); }} disabled={isSubmitting} showResultsInline={true} />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
