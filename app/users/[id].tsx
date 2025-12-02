import { getUserById, getUserCommonStats, removeFriend } from '@/api/users';
import { SendInvitation } from '@/api/invitations';
import { Avatar, ScreenContainer, ScreenHeader } from '@/components/common';
import { ActionMenu, MenuAction } from '@/components/common/ActionMenu';
import { ReportModal } from '@/components/common/ReportModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useBlockUser, useUnblockUser } from '@/hooks/queries/useUsers';
import { queryKeys } from '@/lib/queryClient';
import { CommonStats, PublicUser } from '@/types/user';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';

const getSportIcon = (sportName: string) => {
  const name = sportName.toLowerCase();
  if (name.includes('fodbold') || name.includes('soccer')) return 'football';
  if (name.includes('basket')) return 'basketball';
  if (name.includes('tennis')) return 'tennisball';
  if (name.includes('base')) return 'baseball';
  return 'trophy';
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  // Mutations
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const [user, setUser] = useState<PublicUser | null>(null);
  const [commonStats, setCommonStats] = useState<CommonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  // UI State
  const [isBlocked, setIsBlocked] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [fetchedUser, fetchedStats] = await Promise.all([
          getUserById(id),
          getUserCommonStats(id)
        ]);

        setUser(fetchedUser);
        setCommonStats(fetchedStats);

        if (currentUser && currentUser.friends) {
          const isFriendCheck = currentUser.friends.some(
            (friend) => String(friend.id) === String(fetchedUser.id)
          );
          setIsFriend(isFriendCheck);
        }

      } catch (err) {
        console.error('Failed to load user data:', err);
        Alert.alert('Fejl', 'Kunne ikke hente brugerdata.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, id, router]);

  const handleAddFriend = async () => {
    if (!currentUser || !user) return;

    try {
      const note = `${currentUser.first_name} ${currentUser.last_name || ''} har sendt dig en venneanmodning`.trim();

      await SendInvitation({
        inviter_id: Number(currentUser.id),
        invitee_id: Number(user.id),
        resource_type: 'friend',
        note: note,
      });
      showSuccessToast('Venneanmodning sendt!');
    } catch (err) {
      console.error('Failed to send invitation:', err);
      showErrorToast('Kunne ikke sende venneanmodning.');
    }
  };

  const handleUnfriend = () => {
    if (!user) return;

    Alert.alert(
      'Fjern ven',
      `Er du sikker på, at du vil fjerne ${user.first_name} fra dine venner?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Fjern',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(String(user.id));
              setIsFriend(false);
              showSuccessToast(`${user.first_name} er blevet fjernet som ven.`);
              queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
              queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(user.id) });
            } catch (err) {
              console.error('Failed to remove friend:', err);
              showErrorToast('Kunne ikke fjerne ven.');
            }
          },
        },
      ]
    );
  };

  const handleBlockAction = () => {
    if (!user) return;

    if (isBlocked) {
      unblockUserMutation.mutate(String(user.id), {
        onSuccess: () => {
          setIsBlocked(false);
        }
      });
    } else {
      Alert.alert(
        'Bloker bruger',
        `Er du sikker på, at du vil blokere ${user.first_name}?`,
        [
          { text: 'Annuller', style: 'cancel' },
          {
            text: 'Bloker',
            style: 'destructive',
            onPress: () => {
              blockUserMutation.mutate(String(user.id), {
                onSuccess: () => {
                  setIsBlocked(true);
                  setIsFriend(false);
                }
              });
            },
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-text">Bruger ikke fundet</Text>
      </ScreenContainer>
    )
  }

  const menuActions: MenuAction[] = [
    {
      label: isFriend ? 'Fjern ven' : 'Tilføj ven',
      icon: isFriend ? 'person-remove-outline' : 'person-add-outline',
      onPress: isFriend ? handleUnfriend : handleAddFriend,
      variant: isFriend ? 'destructive' : 'default',
    },
    {
      label: isBlocked ? 'Fjern blokering' : 'Bloker bruger',
      icon: isBlocked ? 'lock-open-outline' : 'ban-outline',
      onPress: handleBlockAction,
      variant: 'destructive',
    },
    {
      label: 'Rapporter',
      icon: 'flag-outline',
      onPress: () => setReportModalVisible(true),
      variant: 'destructive',
    }
  ];

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Profil"
        rightAction={<ActionMenu actions={menuActions} />}
      />

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        targetId={Number(id)}
        targetType="USER"
      />

      <ScrollView className="flex-1 px-6">
        <View className="flex-row items-center mb-8">
          <Avatar
            uri={user.profile_picture}
            size={80}
            placeholderIcon="person"
            className="mr-4"
          />
          <View className="flex-1">
            <Text className="text-text text-xl font-bold">
              {user.first_name} {user.last_name || ''}
            </Text>
            <Text className="text-text-muted text-base">
              {(user as any).age ? `${(user as any).age} år` : ''}
            </Text>
          </View>
          <View>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
          </View>
        </View>

        <View className="bg-surface p-4 rounded-lg mb-6 h-32 justify-center">
          <Text className="text-text-muted text-sm">Sidst i var sammen..</Text>
        </View>

        <View className="flex-row items-center justify-between bg-surface p-4 rounded-lg mb-2">
          <Text className="text-text text-base font-medium">Fællesvenner</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-text text-base font-bold">
              {commonStats?.common_friends_count ?? 0}
            </Text>
            <Ionicons name="people" size={20} color="#3b82f6" />
          </View>
        </View>

        <View className="flex-row items-center justify-between bg-surface p-4 rounded-lg mb-2">
          <Text className="text-text text-base font-medium">Fælleshold</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-text text-base font-bold">
              {commonStats?.common_teams_count ?? 0}
            </Text>
            <Ionicons name="shield" size={20} color="#22c55e" />
          </View>
        </View>

        <View className="bg-surface p-4 rounded-lg mb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text text-base font-medium">Fællesfavoritter</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-text text-base font-bold">
                {commonStats?.common_sports?.length ?? 0}
              </Text>
              <Ionicons name="star" size={20} color="#f59e0b" />
            </View>
          </View>

          <View className="flex-row justify-end gap-3 flex-wrap">
            {commonStats?.common_sports && commonStats.common_sports.length > 0 ? (
              commonStats.common_sports.map((sport) => (
                <Ionicons
                  key={sport.id}
                  name={getSportIcon(sport.name) as any}
                  size={28}
                  color="#dfdfdf"
                />
              ))
            ) : (
              <Text className="text-text-muted text-xs">Ingen fælles sport</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
