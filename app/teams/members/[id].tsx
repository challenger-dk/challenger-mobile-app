import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  LoadingScreen,
  ScreenContainer,
  ScreenHeader,
  EmptyState,
} from '@/components/common';
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

  const { data: team, isLoading: teamLoading, error } = useTeam(id!);
  const removeUserMutation = useRemoveUserFromTeam();
  const sendInvitationMutation = useSendInvitation();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedUserIds, setInvitedUserIds] = useState<Set<number>>(new Set());

  const { data: allUsers = [] } = useUsers();

  const getAvailableUsers = () => {
    if (!team || !allUsers) return [];
    const memberIds = new Set(team.users.map((u) => u.id));
    if (currentUser) memberIds.add(Number(currentUser.id));

    return allUsers.filter(
      (u: User) =>
        !memberIds.has(Number(u.id)) &&
        !invitedUserIds.has(Number(u.id)) &&
        `${u.first_name} ${u.last_name || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  };

  const handleRemoveUser = (userId: string | number, userName: string) => {
    Alert.alert(
      'Fjern medlem',
      `Er du sikker på, at du vil fjerne ${userName} fra holdet?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Fjern',
          style: 'destructive',
          onPress: () => {
            if (id) {
              removeUserMutation.mutate({ teamId: id, userId: String(userId) });
            }
          },
        },
      ]
    );
  };

  const handleInviteUser = (userToInvite: User) => {
    if (!currentUser || !team) return;
    const inviteeId = Number(userToInvite.id);

    sendInvitationMutation.mutate(
      {
        inviter_id: currentUser.id,
        invitee_id: inviteeId,
        resource_type: 'team',
        resource_id: team.id,
        note: `${currentUser.first_name} har inviteret dig til holdet ${team.name}`,
      },
      {
        onSuccess: () => {
          setInvitedUserIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(inviteeId);
            return newSet;
          });
          showSuccessToast(`Invitation sendt til ${userToInvite.first_name}`);
        },
      }
    );
  };

  if (teamLoading || !currentUser) {
    return <LoadingScreen message="Indlæser medlemmer..." />;
  }

  if (error || !team) {
    return (
      <ScreenContainer className="justify-center items-center px-5">
        <Text className="text-white">Hold ikke fundet.</Text>
      </ScreenContainer>
    );
  }

  const isCreator = String(team.creator.id) === String(currentUser.id);

  return (
    <ScreenContainer safeArea edges={['top']}>
      <ScreenHeader
        title={team.name}
        rightAction={
          isCreator ? (
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setShowInviteModal(true);
              }}
              className="bg-surface p-2 rounded-full"
            >
              <Ionicons name="person-add" size={22} color="#0A84FF" />
            </Pressable>
          ) : null
        }
      />

      <ScrollView className="flex-1 px-5 pb-20">
        <Text className="text-text-muted text-sm mb-3">
          Medlemmer ({team.users?.length ?? 0})
        </Text>
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
                      <Text className="text-white text-xs font-medium">
                        Fjern
                      </Text>
                    )}
                  </Pressable>
                ) : String(user.id) === String(team.creator.id) ? (
                  <View className="bg-blue-900/30 rounded-full px-3 py-1 border border-blue-500/50">
                    <Text className="text-primary text-xs font-medium">
                      Ejer
                    </Text>
                  </View>
                ) : null
              }
            />
          ))
        ) : (
          <EmptyState
            title="Ingen medlemmer"
            description="Der er ingen medlemmer på dette hold endnu."
            icon="people-outline"
          />
        )}
      </ScrollView>

      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View className="flex-1 bg-background">
          <View className="px-4 py-4 border-b border-surface flex-row justify-between items-center">
            <Pressable
              onPress={() => setShowInviteModal(false)}
              className="p-2 -ml-2"
            >
              <Ionicons name="chevron-back" size={28} color="#0A84FF" />
            </Pressable>
            <Text className="text-text text-lg font-bold">
              Inviter medlemmer
            </Text>
            <View className="w-10" />
          </View>

          <View className="p-4">
            <View className="flex-row items-center bg-surface rounded-lg px-3 border border-text-disabled">
              <Ionicons
                name="search"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="Søg efter brugere..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-text py-3"
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
            renderItem={({ item }) => (
              <UserCard
                user={item}
                rightAction={
                  <Pressable
                    onPress={() => handleInviteUser(item)}
                    disabled={sendInvitationMutation.isPending}
                    className="bg-primary rounded-full px-4 py-2"
                  >
                    <Text className="text-white text-xs font-medium">
                      Inviter
                    </Text>
                  </Pressable>
                }
              />
            )}
            ListEmptyComponent={
              <EmptyState
                title={
                  searchQuery
                    ? 'Ingen brugere fundet'
                    : 'Søg for at finde brugere'
                }
                icon="search-outline"
              />
            }
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
}
