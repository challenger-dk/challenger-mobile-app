import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { getTeam } from '@/api/teams';
import { LoadingScreen } from '@/components/common';
import { ActionMenu, MenuAction } from '@/components/common/ActionMenu';
import { ReportModal } from '@/components/common/ReportModal';
import type { Team } from '@/types/team';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDeleteTeam, useLeaveTeam } from '@/hooks/queries/useTeams';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const leaveTeamMutation = useLeaveTeam();
  const deleteTeamMutation = useDeleteTeam();

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
                router.replace('/teams' as any);
              } catch (error) {
                // Error handled in hook
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
                router.replace('/teams' as any);
              } catch (error) {
                // Error handled in hook
              }
            },
          },
        ]
      );
    }
  };

  if (loading) {
    return <LoadingScreen message="Indlæser hold..." />;
  }

  if (!team) {
    return (
      <View className="flex-1 bg-[#171616] justify-center items-center px-5">
        <Text className="text-white">Hold ikke fundet.</Text>
      </View>
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

  return (
    <ScrollView className="flex-1 bg-[#171616] p-5 pb-20">
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        targetId={Number(id)}
        targetType="TEAM"
      />

      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Pressable onPress={() => router.back()} className="p-2">
          <Text className="text-gray-400 text-lg">←</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-white">Hold</Text>

        <ActionMenu actions={menuActions} />
      </View>

      {/* Team info */}
      <View className="bg-[#2c2c2c] p-5 rounded-2xl mb-6 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-xl font-semibold mb-1 text-white">
            {team.name}
          </Text>
        </View>
        <View className="bg-blue-900 rounded-2xl p-3">
          <Ionicons name="shield" size={40} color="#ffffff" />
        </View>
      </View>

      {/* Upcoming Events */}
      <View className="mb-6">
        <Text className="text-gray-300 text-sm mb-3">
          Kommende begivenheder
        </Text>
        <View className="flex-row gap-3">
          <View className="flex-1 bg-[#2c2c2c] p-4 rounded-xl">
            <Text className="text-sm text-gray-300 font-semibold">
              Man 17 Juli
            </Text>
            <Text className="text-xs text-gray-400 mb-2">18.00</Text>
            <Text className="text-xs text-gray-500">København</Text>
            <Text className="text-xs text-blue-400 underline">
              Blågårdsgade
            </Text>
          </View>
          <View className="flex-1 bg-[#2c2c2c] p-4 rounded-xl items-center justify-center">
            <View className="flex-row items-center gap-3">
              <View className="bg-blue-900 p-2 rounded-xl">
                <Ionicons name="shield" size={24} color="#ffffff" />
              </View>
              <Text className="text-gray-300 text-sm">vs</Text>
              <View className="bg-red-900 p-2 rounded-xl">
                <Ionicons name="shield" size={24} color="#ffffff" />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Quick actions */}
      <View className="flex-row gap-3 mb-6">
        <Pressable
          className="flex-1 bg-[#2c2c2c] p-4 rounded-xl items-center gap-2"
          onPress={() => router.push(`/teams/members/${id}` as any)}
        >
          <Ionicons name="people" size={24} color="#ffffff" />
          <Text className="text-sm text-gray-300">Medlemmer</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-[#2c2c2c] p-4 rounded-xl items-center gap-2"
          onPress={() =>
            router.push(`/chat/${team.id}?type=team&name=${team.name}` as any)
          }
        >
          <Ionicons name="chatbubble" size={24} color="#ffffff" />
          <Text className="text-sm text-gray-300">Chat</Text>
        </Pressable>
        <Pressable className="flex-1 bg-[#2c2c2c] p-4 rounded-xl items-center gap-2">
          <Ionicons name="calendar" size={24} color="#ffffff" />
          <Text className="text-sm text-gray-300">Begivenheder</Text>
        </Pressable>
      </View>

      {/* Invitations / Suggestions */}
      <View>
        <Text className="text-gray-300 text-sm mb-3">
          Invitationer / Forslag
        </Text>
        <View className="bg-[#2c2c2c] rounded-2xl overflow-hidden">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
            <View className="flex-1">
              <Text className="font-semibold text-white">Soccer</Text>
              <Text className="text-gray-400 text-xs">Emil Matic, 23</Text>
            </View>
            <View className="bg-blue-700 rounded-xl px-3 py-2">
              <Text className="text-white font-bold">6 vs 6</Text>
            </View>
          </View>
          <View className="p-4">
            <Text className="text-sm text-gray-400">
              Gymnasievej 2, 3060 Espergærde
            </Text>
            <Text className="mt-1 text-gray-500 text-sm">
              Tag gerne en bold med så vi har flere!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
