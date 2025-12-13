// app/teams/createTeam.tsx
import { SendInvitation } from '@/api/invitations';
import { createTeam } from '@/api/teams';
import { getUsers } from '@/api/users';
import {
  Avatar,
  FormFieldButton,
  LocationSearch,
  StepIndicator,
} from '@/components/common';
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
import {
  ActivityIndicator,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
    // existing effect logic...
  }, [currentStep, user, invitedUsers]);

  const handleNext = async () => {
    // existing next logic...
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFinish = () => {
    // existing finish logic...
  };

  const handleInvite = async (invitee: User) => {
    // existing invite logic...
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) return teamName.trim() !== '';
    return true;
  };

  const renderStepContent = () => {
    // existing render steps...
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        className="flex-1"
      >
        <Stack.Screen
          // existing stack screen props...
        />
        <ScrollView
          // existing scroll props...
        >
          {/* existing content... */}
        </ScrollView>
        <Modal
          visible={showLocationPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLocationPicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <Pressable
              className="absolute inset-0"
              onPress={() => setShowLocationPicker(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'position' : 'height'}
              keyboardVerticalOffset={0}
            >
              <View
                className="bg-background rounded-t-3xl"
                style={{
                  maxHeight: Dimensions.get('window').height * 0.85,
                  minHeight: Dimensions.get('window').height * 0.5,
                  paddingBottom: insets.bottom,
                }}
              >
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-surface">
                  <Pressable onPress={() => setShowLocationPicker(false)}>
                    <Text className="text-text text-base">Annuller</Text>
                  </Pressable>
                  <Text className="text-text text-lg font-bold">
                    Søg efter lokation
                  </Text>
                  <Pressable onPress={() => setShowLocationPicker(false)}>
                    <Text className="text-text text-base font-medium">
                      Færdig
                    </Text>
                  </Pressable>
                </View>
                <View className="flex-1 px-6 pt-4 pb-8">
                  <LocationSearch
                    value={location}
                    onLocationSelect={(loc) => {
                      setLocation(loc);
                      if (loc) setShowLocationPicker(false);
                    }}
                    disabled={isSubmitting}
                    showResultsInline={true}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
