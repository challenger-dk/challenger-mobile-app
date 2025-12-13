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
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

const SEPARATOR_COLOR = 'bg-[#3A3A3C]';

const StatItem = ({
                    label,
                    value,
                    secondaryValue,
                  }: {
  label: string;
  value: number | string;
  secondaryValue?: number | string;
}) => (
  <View className="items-center justify-center">
    <Text
      className="text-[11px] uppercase tracking-[1px] text-gray-400"
      numberOfLines={1}
    >
      {label}
    </Text>
    <Text className="text-2xl font-semibold text-white mt-1">
      {value}
      {secondaryValue !== undefined && (
        <Text className="text-base font-normal text-gray-400">
          {' '}
          ({secondaryValue})
        </Text>
      )}
    </Text>
  </View>
);

const getSportIcon = (sportName: string) => {
  const name = sportName.toLowerCase();
  if (name.includes('fodbold') || name.includes('soccer')) return 'football';
  if (name.includes('basket')) return 'basketball';
  if (name.includes('tennis')) return 'tennisball';
  if (name.includes('base')) return 'baseball';
  return 'trophy';
};

const InterestIcons = ({ sports }: { sports?: { name: string }[] }) => {
  if (!sports || sports.length === 0) return null;

  const visible = sports.slice(0, 4);

  return (
    <View className="mt-2">
      <View className="flex-row items-center">
        <View className={`w-[1px] h-12 ${SEPARATOR_COLOR} mr-3`} />

        <View className="flex-row items-center gap-3 flex-shrink">
          <Text className="text-xs uppercase tracking-[1px] text-gray-400">
            Interesser
          </Text>

          {visible.map((sport, idx) => (
            <View
              key={`${sport.name}-${idx}`}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <Ionicons
                name={getSportIcon(sport.name) as any}
                size={22}
                color="#ffffff"
              />
            </View>
          ))}
        </View>

        <View className={`w-[1px] h-12 ${SEPARATOR_COLOR} ml-3`} />
      </View>
    </View>
  );
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const [user, setUser] = useState<PublicUser | null>(null);
  const [commonStats, setCommonStats] = useState<CommonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  const [isBlocked, setIsBlocked] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [fetchedUser, fetchedStats] = await Promise.all([
          getUserById(id),
          getUserCommonStats(id),
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
      const note =
        `${currentUser.first_name} ${currentUser.last_name || ''} har sendt dig en venneanmodning`.trim();

      await SendInvitation({
        inviter_id: Number(currentUser.id),
        invitee_id: Number(user.id),
        resource_type: 'friend',
        note,
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
              queryClient.invalidateQueries({
                queryKey: queryKeys.users.current(),
              });
              queryClient.invalidateQueries({
                queryKey: queryKeys.users.detail(user.id),
              });
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
        },
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
                },
              });
            },
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <ScreenContainer safeArea edges={['top', 'left', 'right', 'bottom']} className="justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer safeArea edges={['top', 'left', 'right', 'bottom']} className="justify-center items-center">
        <Text className="text-text">Bruger ikke fundet</Text>
      </ScreenContainer>
    );
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
    },
  ];

  const friendsCount = (user as any).friends_count ?? 0;
  const teamsCount = (user as any).teams_count ?? 0;
  const completedChallenges = (user as any).completed_challenges ?? 0;

  const commonFriends = commonStats?.common_friends_count ?? 0;
  const commonTeams = commonStats?.common_teams_count ?? 0;
  const commonChallenges =
    (commonStats as any)?.common_challenges_count ??
    (commonStats as any)?.common_completed_challenges ??
    0;

  const bottomMessage = isFriend
    ? 'Ingen informationer endnu'
    : 'Tilføj ven for at se informationer';

  return (
    <ScreenContainer safeArea edges={['top', 'left', 'right', 'bottom']}>
      <View className="px-6 flex-1">
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

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="pt-4">
          <View className="rounded-2xl px-5 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4 flex-1">
              <Avatar
                uri={user.profile_picture}
                size={80}
                placeholderIcon="person"
                className="bg-black/30"
              />
              <View className="flex-1">
                <Text className="text-white text-xl font-semibold">
                  {user.first_name} {user.last_name || ''}
                </Text>
                <Text className="text-sm text-gray-300 mt-1">
                  {(user as any).age ? `${(user as any).age} år` : ''}
                </Text>
                <Text className="text-sm text-gray-300 mt-1">
                  {(user as any).city || ''}
                </Text>
              </View>
            </View>

            <View className="items-center">
              <View className="w-9 h-9 rounded-xl bg-surface items-center justify-center mb-1">
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color="#ffffff"
                />
              </View>
              <Text className="text-[11px] text-gray-200">Besked</Text>
            </View>
          </View>

          <View className="mt-3 rounded-2xl px-5 py-3">
            <View className="flex-row items-center mb-3">
              <View className={`w-[1px] h-12 ${SEPARATOR_COLOR}`} />

              <View
                style={{ flex: 1 }}
                className="items-center justify-center px-2"
              >
                <StatItem
                  label="Venner"
                  value={friendsCount}
                  secondaryValue={commonFriends}
                />
              </View>

              <View className={`w-[1px] h-12 ${SEPARATOR_COLOR}`} />

              <View
                style={{ flex: 1 }}
                className="items-center justify-center px-2"
              >
                <StatItem
                  label="Hold"
                  value={teamsCount}
                  secondaryValue={commonTeams}
                />
              </View>

              <View className={`w-[1px] h-12 ${SEPARATOR_COLOR}`} />

              <View
                style={{ flex: 3 }}
                className="items-center justify-center px-1"
              >
                <StatItem
                  label="Fuldførte Challenges"
                  value={completedChallenges}
                  secondaryValue={commonChallenges}
                />
              </View>

              <View className={`w-[1px] h-12 ${SEPARATOR_COLOR}`} />
            </View>

            <InterestIcons sports={commonStats?.common_sports} />
          </View>
        </View>

        <View className="px-6 mt-6 items-center">
          <View className="px-4 py-1.5 rounded-full border border-white bg-white/10">
            <Ionicons name="home" size={16} color="#ffffff" />
          </View>
        </View>

        <View className="mt-3 h-[1px] bg-gray-700 w-full relative">
          <View
            className="absolute h-[2px] bg-white"
            style={{
              width: width * 0.25,
              left: (width - width * 0.25) / 2,
              top: -0.5,
            }}
          />
        </View>

        <View className="mt-10 items-center">
          <Text className="text-text-muted text-sm text-center">
            {bottomMessage}
          </Text>
        </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
