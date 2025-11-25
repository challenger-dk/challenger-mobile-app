import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LoadingScreen, ScreenHeader } from '@/components/common';
import { UserCard } from '@/components/users/UserCard';
import { useRemoveUserFromTeam, useTeam } from '@/hooks/queries/useTeams';
import { useUsers } from '@/hooks/queries/useUsers';
import { useSendInvitation } from '@/hooks/queries/useInvitations';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { User } from '@/types/user';
import { showSuccessToast } from '@/utils/toast';

export default function TeamMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  // Team Data
  const { data: team, isLoading: teamLoading, error } = useTeam(id!);

  // Mutations
  const removeUserMutation = useRemoveUserFromTeam();
  const sendInvitationMutation = useSendInvitation();

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Track invites sent in this session to hide them immediately
  const [invitedUserIds, setInvitedUserIds] = useState<Set<number>>(new Set());

  // Users Data for Invitation
  const { data: allUsers = [] } = useUsers();

  // Logic to filter users for invitation (exclude current members AND invited users)
  const getAvailableUsers = () => {
    if (!team || !allUsers) return [];
    const memberIds = new Set(team.users.map(u => u.id));
    if (currentUser) memberIds.add(Number(currentUser.id));

    return allUsers.filter((u: User) =>
      !memberIds.has(Number(u.id)) &&
      !invitedUserIds.has(Number(u.id)) && // Filter out users we just invited
      `${u.first_name} ${u.last_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleRemoveUser = (userId: string | number, userName: string) => {
    Alert.alert(
      "Fjern medlem",
      `Er du sikker på, at du vil fjerne ${userName} fra holdet?`,
      [
        {
          text: "Annuller",
          style: "cancel"
        },
        {
          text: "Fjern",
          style: "destructive",
          onPress: () => {
            if (id) {
              removeUserMutation.mutate({
                teamId: id,
                userId: String(userId)
              });
            }
          }
        }
      ]
    );
  };

  const handleInviteUser = (userToInvite: User) => {
    if (!currentUser || !team) return;

    const inviteeId = Number(userToInvite.id);

    sendInvitationMutation.mutate({
      inviter_id: currentUser.id,
      invitee_id: inviteeId,
      resource_type: 'team',
      resource_id: team.id,
      note: `${currentUser.first_name} har inviteret dig til holdet ${team.name}`
    }, {
      onSuccess: () => {
        // Add to local set to hide from list
        setInvitedUserIds(prev => {
          const newSet = new Set(prev);
          newSet.add(inviteeId);
          return newSet;
        });
        showSuccessToast(`Invitation sendt til ${userToInvite.first_name}`);
      }
    });
  };

  if (teamLoading || !currentUser) {
    return <LoadingScreen message="Indlæser medlemmer..." />;
  }

  if (error || !team) {
    return (
      <View className="flex-1 bg-[#171616] justify-center items-center px-5">
        <Text className="text-white">Hold ikke fundet.</Text>
      </View>
    );
  }

  const isCreator = String(team.creator.id) === String(currentUser.id);

  return (
    <SafeAreaView className="flex-1 bg-[#171616]" edges={['top']}>
      <ScreenHeader
        title={team.name}
        rightAction={
          isCreator ? (
            <Pressable
              onPress={() => {
                setSearchQuery(''); // Reset search
                setShowInviteModal(true);
              }}
              className="bg-[#2c2c2c] p-2 rounded-full"
            >
              <Ionicons name="person-add" size={22} color="#0A84FF" />
            </Pressable>
          ) : null
        }
      />

      <ScrollView className="flex-1 px-5 pb-20">
        <Text className="text-gray-300 text-sm mb-3">Medlemmer ({team.users?.length ?? 0})</Text>
        {team.users && team.users.length > 0 ? (
          team.users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onPress={() => {
                if (String(user.id) === String(currentUser.id)) {
                  router.push('/(tabs)/profile' as any);
                } else {
                  router.push(`/users/${user.id}` as any);
                }
              }}
              rightAction={
                isCreator && String(user.id) !== String(currentUser.id) ? (
                  <Pressable
                    onPress={() => handleRemoveUser(user.id, user.first_name)}
                    disabled={removeUserMutation.isPending}
                    className="bg-[#575757] rounded-full px-4 py-2 border border-[#575757]"
                  >
                    {removeUserMutation.isPending ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-white text-xs font-medium">Fjern</Text>
                    )}
                  </Pressable>
                ) : String(user.id) === String(team.creator.id) ? (
                  <View className="bg-blue-900/30 rounded-full px-3 py-1 border border-blue-500/50">
                    <Text className="text-blue-400 text-xs font-medium">Ejer</Text>
                  </View>
                ) : null
              }
            />
          ))
        ) : (
          <Text className="text-gray-500 text-sm">Der er ingen medlemmer på dette hold endnu.</Text>
        )}
      </ScrollView>

      {/* Invite Users Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View className="flex-1 bg-[#171616]">
          {/* Modal Header */}
          <View className="px-4 py-4 border-b border-[#2c2c2c] flex-row justify-between items-center">
            <Pressable onPress={() => setShowInviteModal(false)} className="p-2 -ml-2">
              <Ionicons name="chevron-back" size={28} color="#0A84FF" />
            </Pressable>
            <Text className="text-white text-lg font-bold">Inviter medlemmer</Text>
            <View className="w-10" /> {/* Spacer for centering title */}
          </View>

          {/* Search Input */}
          <View className="p-4">
            <View className="flex-row items-center bg-[#2c2c2c] rounded-lg px-3 border border-[#575757]">
              <Ionicons name="search" size={20} color="#9CA3AF" style={{marginRight: 8}} />
              <TextInput
                placeholder="Søg efter brugere..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-white py-3"
                style={{ color: '#ffffff' }}
                autoFocus
              />
            </View>
          </View>

          <FlatList
            data={getAvailableUsers()}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              return (
                <UserCard
                  user={item}
                  rightAction={
                    <Pressable
                      onPress={() => handleInviteUser(item)}
                      disabled={sendInvitationMutation.isPending}
                      className="bg-[#0A84FF] rounded-full px-4 py-2"
                    >
                      <Text className="text-white text-xs font-medium">Inviter</Text>
                    </Pressable>
                  }
                />
              );
            }}
            ListEmptyComponent={
              <View className="py-10 items-center">
                <Text className="text-[#575757] text-center">
                  {searchQuery ? 'Ingen brugere fundet' : 'Søg for at finde brugere'}
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}