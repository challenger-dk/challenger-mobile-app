import { acceptInvitation, declineInvitation } from '@/api/invitations';
import type { Invitation } from '@/types/invitation';
import { showErrorToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface InvitationCardProps {
  invitation: Invitation;
  onInvitationHandled: () => void;
}

export function InvitationCard({ invitation, onInvitationHandled }: InvitationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await acceptInvitation(invitation.id);
      onInvitationHandled(); // Tell TeamsScreen to reload data
    } catch (err) {
      console.error('Failed to accept invitation:', err);
      showErrorToast('Kunne ikke acceptere invitationen.');
      setIsProcessing(false); // Only reset on error
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await declineInvitation(invitation.id);
      onInvitationHandled(); // Tell TeamsScreen to reload data
    } catch (err) {
      console.error('Failed to decline invitation:', err);
      showErrorToast('Kunne ikke afvise invitationen.');
      setIsProcessing(false); // Only reset on error
    }
  };

  return (
    <View className="bg-[#1C1C1E] rounded-2xl p-4 mb-3">
      <View className="flex-row items-center gap-3 mb-3">
        {invitation.inviter.profile_picture ? (
          <Image
            source={{ uri: invitation.inviter.profile_picture }}
            className="w-10 h-10 rounded-full"
            contentFit="cover"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gray-600 items-center justify-center">
            <Ionicons name="person" size={20} color="#ffffff" />
          </View>
        )}
        <View>
          <Text className="text-white text-base font-semibold">
            {invitation.inviter.first_name} {invitation.inviter.last_name}
          </Text>
          <Text className="text-gray-400 text-sm">Har inviteret dig til et hold</Text>
        </View>
      </View>

      {invitation.note && (
        <Text className="text-gray-300 text-sm mb-4 ml-13">&quot;{invitation.note}&quot;</Text>
      )}

      <View className="flex-row gap-3">
        {/* Swapped order: Green button first */}
        <Pressable
          onPress={handleAccept}
          disabled={isProcessing}
          className="flex-1 bg-green-600 rounded-lg p-3 items-center justify-center flex-row"
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="checkmark" size={20} color="#ffffff" />
          )}
        </Pressable>
        {/* Red button second */}
        <Pressable
          onPress={handleDecline}
          disabled={isProcessing}
          className="flex-1 bg-red-600 rounded-lg p-3 items-center justify-center flex-row"
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="close" size={20} color="#ffffff" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
