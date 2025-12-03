import { Avatar, LoadingScreen, ScreenContainer, ScreenHeader, SearchInput } from '@/components/common';
import { useCreateChat } from '@/hooks/queries/useChats';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View, Alert } from 'react-native';

export default function CreateChatScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const createChatMutation = useCreateChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupName, setGroupName] = useState('');

  if (!user) return <LoadingScreen />;

  // Filter friends based on search
  const filteredFriends = (user.friends || []).filter(f =>
    f.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (id: number) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(prev => prev.filter(u => u !== id));
    } else {
      setSelectedUsers(prev => [...prev, id]);
    }
  };

  const handleCreate = () => {
    if (selectedUsers.length === 0) return;

    createChatMutation.mutate({
      name: groupName || undefined,
      user_ids: selectedUsers
    }, {
      onSuccess: () => {
        router.back();
      },
      onError: () => {
        Alert.alert('Fejl', 'Kunne ikke oprette chat');
      }
    });
  };

  const renderFriend = ({ item }: { item: any }) => {
    const isSelected = selectedUsers.includes(item.id);
    return (
      <Pressable
        onPress={() => toggleUser(item.id)}
        className={`flex-row items-center p-4 border-b border-surface ${isSelected ? 'bg-surface' : ''}`}
      >
        <Avatar uri={item.profile_picture} size={40} className="mr-3" />
        <View className="flex-1">
          <Text className="text-text font-medium">{item.first_name} {item.last_name}</Text>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#D1FF4C" />}
      </Pressable>
    );
  };

  return (
    <ScreenContainer safeArea edges={['top']}>
      <ScreenHeader title="Ny Chat" onBack={() => router.back()} />

      <View className="p-4 border-b border-surface">
        {selectedUsers.length > 1 && (
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Gruppenavn (valgfrit)"
            placeholderTextColor="#575757"
            className="bg-surface text-text p-3 rounded-xl mb-3"
          />
        )}
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Søg blandt venner..."
        />
      </View>

      <FlatList
        data={filteredFriends}
        keyExtractor={item => item.id.toString()}
        renderItem={renderFriend}
        ListFooterComponent={<View className="h-20" />}
      />

      {selectedUsers.length > 0 && (
        <View className="absolute bottom-10 left-5 right-5">
          <Pressable
            onPress={handleCreate}
            disabled={createChatMutation.isPending}
            className="bg-primary p-4 rounded-xl items-center"
          >
            {createChatMutation.isPending ? (
              <Text className="text-background font-bold">Opretter...</Text>
            ) : (
              <Text className="text-background font-bold text-lg">
                Opret {selectedUsers.length > 1 ? 'Gruppe' : 'Chat'}
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </ScreenContainer>
  );
}
