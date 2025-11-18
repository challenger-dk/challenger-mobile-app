import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { ChallengeCard } from '../../components/challenges';
import { ErrorScreen } from '../../components/common/ErrorScreen';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { TabNavigation } from '../../components/common/TabNavigation';
import { useChallenges } from '../../hooks/queries';
import type { Challenge } from '../../types/challenge';

type TabType = 'public' | 'friends';

export default function HubScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('public');
  
  // React Query hook - automatically handles caching and refetching
  const { data: challenges = [], isLoading: loading, error, refetch } = useChallenges();

  // Refetch challenges when screen comes into focus
  // This ensures fresh data when navigating back from create screen
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleParticipate = (challengeId: number) => {
    // Navigate to challenge details or handle participation
    router.push(`/teams/${challengeId}` as any);
  };

  const filteredChallenges = useMemo(() => 
    challenges.filter((challenge: Challenge) => 
      activeTab === 'public' ? challenge.is_public : !challenge.is_public
    ),
    [challenges, activeTab]
  );

  if (loading) {
    return <LoadingScreen message="Loading challenges..." />;
  }

  if (error) {
    return <ErrorScreen error={error instanceof Error ? error : new Error('Failed to fetch challenges')} />;
  }

  return (
    <View className="flex-1 bg-[#171616]">
      {/* Header Section */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-xl font-bold">Hub</Text>
          <View className="flex-row items-center gap-4">
            <Pressable className="relative">
              <Ionicons name="notifications-outline" size={24} color="#ffffff" />
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-[#943d40] rounded-full" />
            </Pressable>
            <Pressable>
              <Ionicons name="calendar-outline" size={24} color="#ffffff" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/hub/create' as any)}
              className="bg-white rounded-full p-2"
              aria-label="Create Challenge"
            >
              <Ionicons name="add" size={24} color="#171616" />
            </Pressable>
          </View>
        </View>

        {/* Tabs */}
        <TabNavigation
          tabs={[
            { key: 'public', label: 'Offentligt' },
            { key: 'friends', label: 'Venner' },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as TabType)}
        />
      </View>

      {/* Challenges List */}
      <FlatList
        data={filteredChallenges}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="px-6">
            <ChallengeCard challenge={item} onParticipate={handleParticipate} />
          </View>
        )}
        contentContainerClassName="py-4"
        ListEmptyComponent={
          <View className="px-6 py-8 items-center">
            <Text className="text-[#575757] text-center">
              Ingen udfordringer fundet
            </Text>
          </View>
        }
      />
    </View>
  );
}

