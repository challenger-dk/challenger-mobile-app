import { acceptInvitation, declineInvitation } from '@/api/invitations';
import { Avatar } from '@/components/common';
import type { Invitation } from '@/types/invitation';
import { showErrorToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
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
        <Avatar
          uri={invitation.inviter.profile_picture}
          size={40}
          placeholderIcon="person"
        />
        <View>
          <Text className="text-text text-base font-semibold">
            {invitation.inviter.first_name} {invitation.inviter.last_name}
          </Text>
        </View>
      </View>

      {invitation.note && (
        <Text className="text-gray-300 text-sm mb-4 ml-13">&quot;{invitation.note}&quot;</Text>
      )}

      <View className="flex-row gap-3">
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
