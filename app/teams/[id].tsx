// app/teams/%5Bid%5D.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getTeam } from '@/api/teams';
import {
  LoadingScreen,
  ScreenHeader,
  TabNavigation,
} from '@/components/common';
import { ChatView } from '@/components/chat';
import { ActionMenu, MenuAction } from '@/components/common/ActionMenu';
import { ReportModal } from '@/components/common/ReportModal';
import type { Team } from '@/types/team';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDeleteTeam, useLeaveTeam } from '@/hooks/queries/useTeams';
import { useTeamConversation } from '@/hooks/queries/useConversations';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const { width } = useWindowDimensions();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const leaveTeamMutation = useLeaveTeam();
  const deleteTeamMutation = useDeleteTeam();

  const [activeTab, setActiveTab] = useState<'chat' | 'profile'>('profile');

  // Check if user is a member of the team
  const isMember = team && currentUser && team.users.some(u => u.id === currentUser.id);

  // Get team conversation (only if user is a member)
  const teamId = id ? parseInt(id, 10) : null;
  const { data: teamConversation, isLoading: conversationLoading } = useTeamConversation(isMember ? teamId : null);

  // Update active tab when team loads
  useEffect(() => {
    if (team && currentUser) {
      const userIsMember = team.users.some(u => u.id === currentUser.id);
      setActiveTab(userIsMember ? 'chat' : 'profile');
    }
  }, [team, currentUser]);

  useEffect(() => {
    const loadTeam = async () => {
      if (!id) return;

      try {
        const data = await getTeam(id);
        setTeam(data);
      } catch (err) {
        console.error('Failed to load team:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [id]);

  const handleLeaveOrDelete = () => {
    if (!team || !currentUser || !id) return;

    const isCreator = String(team.creator.id) === String(currentUser.id);

    if (isCreator) {
      Alert.alert(
        'Slet hold',
        'Er du sikker på, at du vil slette dette hold? Dette kan ikke fortrydes.',
        [
          { text: 'Annuller', style: 'cancel' },
          {
            text: 'Slet',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteTeamMutation.mutateAsync(id);
                router.replace('/(tabs)/social' as any);
              } catch {
                // handled in hook
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Forlad hold',
        'Er du sikker på, at du vil forlade dette hold?',
        [
          { text: 'Annuller', style: 'cancel' },
          {
            text: 'Forlad',
            style: 'destructive',
            onPress: async () => {
              try {
                await leaveTeamMutation.mutateAsync(id);
                router.replace('/(tabs)/social' as any);
              } catch {
                // handled in hook
              }
            },
          },
        ]
      );
    }
  };

  const handleTabChange = (key: string) => {
    if (key === 'chat' || key === 'profile') {
      setActiveTab(key);
    }
  };

  if (loading) return <LoadingScreen message="Indlæser hold..." />;

  if (!team) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-5" edges={['top', 'left', 'right', 'bottom']}>
        <Text className="text-white">Hold ikke fundet.</Text>
      </SafeAreaView>
    );
  }

  const isCreator =
    currentUser && String(team.creator.id) === String(currentUser.id);

  const menuActions: MenuAction[] = [
    {
      label: isCreator ? 'Slet hold' : 'Forlad hold',
      icon: isCreator ? 'trash-outline' : 'log-out-outline',
      onPress: handleLeaveOrDelete,
      variant: 'destructive',
    },
    {
      label: 'Rapporter',
      icon: 'flag-outline',
      onPress: () => setReportModalVisible(true),
      variant: 'destructive',
    },
  ];

	// Youngest and oldest member calculation
	const calculatedUserAges = team.users
		.map(user => {
			if (user.birth_date) {
				const birthDate = new Date(user.birth_date);
				const ageDifMs = Date.now() - birthDate.getTime();
				const ageDate = new Date(ageDifMs);
				return Math.abs(ageDate.getUTCFullYear() - 1970);
			}
			return undefined;
		})
		.filter(age => age !== undefined) as number[];

  const membersCount = team.users?.length || 0;
  const challengesCount = 0; // TODO: Implement when team challenges are added

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right', 'bottom']}>
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        targetId={Number(id)}
        targetType="TEAM"
      />

      {/* Same outer padding style as SettingsScreen */}
      <View className="px-6 flex-1">
        {/* ✅ Use ScreenHeader for consistent back button placement */}
        <ScreenHeader
          title={team.name || 'Hold'}
          rightAction={<ActionMenu actions={menuActions} />}
        />

        {/* Tabs - Only show if user is a member */}
        {isMember && (
          <View className="mt-2 pb-2">
            <TabNavigation
              tabs={[
                { key: 'chat', label: 'Chat' },
                { key: 'profile', label: 'Holdinfo' },
              ]}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </View>
        )}

        {/* Content - Switch between chat and profile */}
        {activeTab === 'chat' && isMember ? (
          conversationLoading ? (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-text-disabled">Indlæser chat...</Text>
            </View>
          ) : teamConversation ? (
            <View className="flex-1">
              <ChatView
                conversationId={teamConversation.id}
                conversationName={team.name}
              />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-text-disabled">Kunne ikke indlæse chat</Text>
            </View>
          )
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header card - same as profile */}
            <View className="mt-3 rounded-2xl px-5 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4 flex-1">
              <View className="w-20 h-20 rounded-full bg-[#3A3A3C] items-center justify-center">
                <Ionicons name="shield" size={40} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-xl font-semibold">
                  {team.name}
                </Text>
                <Text className="text-sm text-gray-300 mt-1">
                  {calculatedUserAges.length > 0
                    ? `${Math.min(...calculatedUserAges)}-${Math.max(...calculatedUserAges)} år`
                    : ''}
                </Text>
                <Text className="text-sm text-gray-300 mt-1">
                  {team.location
                    ? `${team.location.city}, ${team.location.country}`
                    : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats + Interests - same as profile */}
          <View className="mt-3 rounded-2xl px-5 py-3">
            {/* Stats row */}
            <View className="flex-row items-center mb-3">
              {/* Left separator */}
              <View className="w-[1px] h-12 bg-[#3A3A3C]" />

              {/* Medlemmer - Clickable */}
              <Pressable
                style={{ flex: 1 }}
                className="items-center justify-center px-2"
                onPress={() => router.push(`/teams/members/${id}` as any)}
              >
                <View className="items-center justify-center">
                  <Text
                    className="text-[11px] uppercase tracking-[1px] text-gray-400"
                    numberOfLines={1}
                  >
                    Medlemmer
                  </Text>
                  <Text className="text-2xl font-semibold text-white mt-1">{membersCount}</Text>
                </View>
              </Pressable>

              {/* Separator */}
              <View className="w-[1px] h-12 bg-[#3A3A3C]" />

              {/* Fuldførte Challenges */}
              <View
                style={{ flex: 3 }}
                className="items-center justify-center px-1"
              >
                <Text
                  className="text-[11px] uppercase tracking-[1px] text-gray-400"
                  numberOfLines={1}
                >
                  Fuldførte Challenges
                </Text>
                <Text className="text-2xl font-semibold text-white mt-1">
                  {challengesCount}
                </Text>
              </View>

              {/* Right separator */}
              <View className="w-[1px] h-12 bg-[#3A3A3C]" />
            </View>

            {/* Interests */}
            <View className="mt-2">
              <View className="flex-row items-center">
                {/* Left separator */}
                <View className="w-[1px] h-12 bg-[#3A3A3C] mr-3" />

                {/* Label + icons */}
                <View className="flex-row items-center gap-3 flex-shrink">
                  <Text className="text-xs uppercase tracking-[1px] text-gray-400">
                    Interesser
                  </Text>

                  <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                    <Ionicons name="football" size={22} color="#ffffff" />
                  </View>
                  <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
                    <Ionicons name="basketball" size={22} color="#ffffff" />
                  </View>
                </View>

                {/* Right separator */}
                <View className="w-[1px] h-12 bg-[#3A3A3C] ml-3" />
              </View>
            </View>
          </View>

          {/* Tabs row – same as profile */}
          <View className="mt-4">
            <View className="flex-row w-full">
              {/* VS tab */}
              <Pressable className="flex-1 items-center">
                <View className="px-4 py-1.5 rounded-full border border-white bg-white/10">
                  <Text className="text-xs font-semibold text-white">
                    VS
                  </Text>
                </View>
              </Pressable>

              {/* Home tab */}
              <Pressable className="flex-1 items-center">
                <View className="px-4 py-1.5 rounded-full border border-transparent bg-transparent">
                  <Ionicons name="home" size={16} color="#9CA3AF" />
                </View>
              </Pressable>

              {/* Stats tab */}
              <Pressable className="flex-1 items-center">
                <View className="px-4 py-1.5 rounded-full border border-transparent bg-transparent">
                  <Ionicons name="stats-chart" size={16} color="#9CA3AF" />
                </View>
              </Pressable>
            </View>
          </View>

          {/* Full-width baseline with active highlight */}
          <View className="mt-3 h-[1px] bg-gray-700 w-full relative">
            <View
              className="absolute h-[2px] bg-white"
              style={{
                width: width / 3,
                left: 0,
                top: -0.5,
              }}
            />
          </View>

          {/* Content area - placeholder for now */}
          <View className="mt-4">
            <Text className="text-white text-sm">
              Team challenges will appear here
            </Text>
          </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
