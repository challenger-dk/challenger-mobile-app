import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingScreen, TabNavigation } from '../../components/common';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useMyTeams } from '../../hooks/queries/useTeams';

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { data: myTeams = [], isLoading: teamsLoading } = useMyTeams();

  const [activeTab, setActiveTab] = useState<'teams' | 'friends'>('teams');

  if (!user || teamsLoading) return <LoadingScreen />;

  // Filter friends/teams lists
  const data = activeTab === 'teams' ? myTeams : (user.friends || []);

  const renderItem = ({ item }: { item: any }) => {
    // Determine name and image based on type (Team or User)
    const isTeam = activeTab === 'teams';
    const name = isTeam ? item.name : `${item.first_name} ${item.last_name || ''}`;
    const image = item.profile_picture || null; // Teams usually don't have images in your model yet, but users do.
    const id = item.id;

    return (
      <Pressable
        onPress={() => {
          // Navigate to the specific chat room
          // We pass the ID and the TYPE (user or team) params
          router.push({
            pathname: '/chat/[id]',
            params: { id: id, type: isTeam ? 'team' : 'user', name: name }
          } as any);
        }}
        className="flex-row items-center p-4 border-b border-[#2c2c2c]"
      >
        <View className="w-12 h-12 rounded-full bg-[#2c2c2c] items-center justify-center mr-4 overflow-hidden">
          {image ? (
            <Image source={{ uri: image }} className="w-full h-full" />
          ) : (
            <Ionicons name={isTeam ? "shield" : "person"} size={24} color="#ffffff" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-white text-base font-medium">{name}</Text>
          <Text className="text-gray-500 text-sm">Tryk for at chatte</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#575757" />
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#171616]" edges={['top']}>
      <View className="px-5 pb-2">
        <Text className="text-white text-xl font-bold mb-4">Beskeder</Text>
        <TabNavigation
          tabs={[
            { key: 'teams', label: 'Hold' },
            { key: 'friends', label: 'Venner' },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as 'teams' | 'friends')}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View className="p-8 items-center">
            <Text className="text-gray-500 text-center">
              {activeTab === 'teams'
                ? "Du er ikke medlem af nogen hold endnu."
                : "Du har ingen venner endnu."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
