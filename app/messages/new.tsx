import {
  Avatar,
  EmptyState,
  LoadingScreen,
  ScreenContainer,
  ScreenHeader,
  TabNavigation,
} from '@/components/common';
import { useMyTeams } from '@/hooks/queries/useTeams';
import { useCreateDirectConversation, useCreateGroupConversation } from '@/hooks/queries/useConversations';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewMessageScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { data: myTeams = [], isLoading: teamsLoading } = useMyTeams();
  const { mutate: createDirectConversation, isPending: isCreatingDirect } = useCreateDirectConversation();
  const { mutate: createGroupConversation, isPending: isCreatingGroup } = useCreateGroupConversation();

  const [activeTab, setActiveTab] = useState<'friends' | 'teams'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [showGroupNameModal, setShowGroupNameModal] = useState(false);
  const [groupName, setGroupName] = useState('');

  const isPending = isCreatingDirect || isCreatingGroup;

  if (!user || teamsLoading) return <LoadingScreen />;

  const data = activeTab === 'friends' ? user.friends || [] : myTeams;

  // Filter data based on search
  const filteredData = data.filter((item: any) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const name = activeTab === 'friends'
      ? `${item.first_name} ${item.last_name || ''}`.toLowerCase()
      : item.name.toLowerCase();
    
    return name.includes(query);
  });

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCreateChat = () => {
    if (selectedUserIds.length === 0) {
      Alert.alert('Vælg brugere', 'Vælg mindst én bruger for at starte en chat.');
      return;
    }

    if (selectedUserIds.length === 1) {
      // Create direct conversation
      createDirectConversation(
        { other_user_id: selectedUserIds[0] },
        {
          onSuccess: (conversation) => {
            router.replace({
              pathname: '/chat/[id]',
              params: {
                id: conversation.id,
                name: conversation.other_user
                  ? `${conversation.other_user.first_name} ${conversation.other_user.last_name}`
                  : 'Chat',
              },
            } as any);
          },
          onError: (error) => {
            Alert.alert('Fejl', 'Kunne ikke oprette chat. Prøv igen.');
          },
        }
      );
    } else {
      // Create group conversation - show modal for group name
      setShowGroupNameModal(true);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Fejl', 'Gruppenavn er påkrævet');
      return;
    }

    const requestData = {
      title: groupName.trim(),
      participant_ids: selectedUserIds,
    };

    createGroupConversation(requestData, {
      onSuccess: (conversation) => {
        setShowGroupNameModal(false);
        setGroupName('');
        setSelectedUserIds([]);

        // Navigate to the chat
        router.replace({
          pathname: '/chat/[id]',
          params: {
            id: conversation.id,
            name: conversation.title || groupName.trim(),
          },
        } as any);
      },
      onError: (error: any) => {
        Alert.alert(
          'Fejl',
          `Kunne ikke oprette gruppe: ${error?.message || 'Ukendt fejl'}`
        );
      },
    });
  };

  const handleSelectTeam = (teamId: number, teamName: string) => {
    // Team conversations are auto-created by backend
    // Navigate to team profile which has a chat button
    router.replace({
      pathname: '/teams/[id]',
      params: { id: teamId },
    } as any);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isTeam = activeTab === 'teams';
    const name = isTeam
      ? item.name
      : `${item.first_name} ${item.last_name || ''}`;
    const image = item.profile_picture || null;
    const id = item.id;
    const isSelected = selectedUserIds.includes(id);

    return (
      <Pressable
        onPress={() => {
          if (isTeam) {
            handleSelectTeam(id, name);
          } else {
            toggleUserSelection(id);
          }
        }}
        disabled={isPending}
        className="flex-row items-center p-4 border-b border-surface active:bg-surface/50"
      >
        {/* Checkbox for friends */}
        {!isTeam && (
          <View className="mr-3">
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              isSelected ? 'bg-primary border-primary' : 'border-text-disabled'
            }`}>
              {isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}
            </View>
          </View>
        )}

        <View className="mr-4">
          <Avatar
            uri={image}
            size={48}
            placeholderIcon={isTeam ? 'shield' : 'person'}
            className="bg-surface"
          />
        </View>
        <View className="flex-1">
          <Text className="text-text text-base font-medium">{name}</Text>
          <Text className="text-text-disabled text-sm">
            {isTeam ? 'Tryk for at åbne hold' : isSelected ? 'Valgt' : 'Tryk for at vælge'}
          </Text>
        </View>
        {isTeam && <Ionicons name="chevron-forward" size={20} color="#575757" />}
      </Pressable>
    );
  };

  return (
    <ScreenContainer safeArea edges={['top', 'left', 'right', 'bottom']}>
      <View className="px-6 flex-1">
        <ScreenHeader
          title="Ny besked"
          rightAction={
            activeTab === 'friends' && selectedUserIds.length > 0 ? (
              <Pressable
                onPress={handleCreateChat}
                disabled={isPending}
                className="bg-primary px-4 py-2 rounded-full"
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold">
                    {selectedUserIds.length === 1 ? 'Start' : `Opret (${selectedUserIds.length})`}
                  </Text>
                )}
              </Pressable>
            ) : undefined
          }
        />

        {/* Search Bar */}
        <View className="pb-3 pt-4">
          <View className="flex-row items-center bg-surface rounded-2xl px-4 py-2">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="ml-2 flex-1 text-white text-sm"
              placeholder="Søg..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View className="pb-3">
          <TabNavigation
            tabs={[
              { key: 'friends', label: 'Venner' },
              { key: 'teams', label: 'Hold' },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as 'friends' | 'teams')}
          />
        </View>

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              title={activeTab === 'friends' ? 'Ingen venner' : 'Ingen hold'}
              description={
                searchQuery
                  ? 'Ingen resultater matcher din søgning.'
                  : activeTab === 'friends'
                  ? 'Du har ingen venner endnu.'
                  : 'Du er ikke medlem af nogen hold endnu.'
              }
              icon={activeTab === 'friends' ? 'people-outline' : 'shield-outline'}
            />
          }
        />
      </View>

      {/* Group Name Modal */}
      <Modal
        visible={showGroupNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGroupNameModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-surface rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-white text-xl font-bold mb-2">Opret gruppe</Text>
            <Text className="text-text-disabled text-sm mb-4">
              Indtast et navn til gruppen med {selectedUserIds.length} medlemmer
            </Text>

            <TextInput
              className="bg-background text-white px-4 py-3 rounded-xl mb-4"
              placeholder="Gruppenavn..."
              placeholderTextColor="#6B7280"
              value={groupName}
              onChangeText={setGroupName}
              autoFocus
              maxLength={50}
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowGroupNameModal(false);
                  setGroupName('');
                }}
                disabled={isPending}
                className="flex-1 bg-background py-3 rounded-xl items-center"
              >
                <Text className="text-text font-semibold">Annuller</Text>
              </Pressable>

              <Pressable
                onPress={handleCreateGroup}
                disabled={isPending || !groupName.trim()}
                className={`flex-1 py-3 rounded-xl items-center ${
                  isPending || !groupName.trim() ? 'bg-primary/50' : 'bg-primary'
                }`}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold">Opret</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

