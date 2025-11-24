import { SendInvitation } from '@/api/invitations';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';

interface AddFriendButtonProps {
  inviteeId: number | string;
  onInvitationSent: () => void;
}

export function AddFriendButton({ inviteeId, onInvitationSent }: AddFriendButtonProps) {
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    if (!user) {
      showErrorToast('Du skal være logget ind for at tilføje venner.');
      return;
    }

    setLoading(true);

    const inviterId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    // Use the inviteeId prop directly
    const numericInviteeId = typeof inviteeId === 'string' ? parseInt(inviteeId, 10) : inviteeId;

    if (isNaN(inviterId) || isNaN(numericInviteeId)) {
      showErrorToast('Bruger ID er ugyldigt.');
      setLoading(false);
      return;
    }

    try {
      const note = `${user.first_name} ${user.last_name || ''} har sendt der en venneanmodning`.trim();

      await SendInvitation({
        inviter_id: inviterId,
        invitee_id: numericInviteeId,
        resource_type: 'friend',
        note: note,
      });

      showSuccessToast('Venneanmodning sendt!');
      onInvitationSent(); // Trigger the reload
    } catch (err) {
      console.error('Failed to send invitation:', err);
      showErrorToast('Kunne ikke sende venneanmodning.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handleAddFriend}
      disabled={loading}
      className="bg-orange-500 rounded-full p-2"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Ionicons name="add" size={20} color="#ffffff" />
      )}
    </Pressable>
  );
}