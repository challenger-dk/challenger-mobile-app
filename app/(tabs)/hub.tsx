import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { ChallengeCard } from '../../components/challenges';
import { EmptyState, ErrorScreen, LoadingScreen, ScreenContainer, TabNavigation, TopActionBar } from '../../components/common';
import { useChallenges } from '../../hooks/queries';
import type { Challenge } from '../../types/challenge';

type TabType = 'public' | 'friends';

export default function HubScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('public');

  const { data: challenges = [], isLoading: loading, error, refetch } = useChallenges();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleParticipate = (challengeId: number) => {
    router.push(`/teams/${challengeId}` as any);
  };

  const handleChallengePress = (challengeId: number) => {
    router.push(`/hub/${challengeId}` as any);
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
    <ScreenContainer>
      <TopActionBar
        title="Hub"
        leftAction={<Pressable onPress={() => router.push('/(tabs)' as any)}><Ionicons name="apps" size={24} color="#ffffff" /></Pressable>}
        settingsRoute="/profile/settings"
      />

      <View className="px-6 pt-2 pb-2">
        <TabNavigation
          tabs={[
            { key: 'public', label: 'Offentligt' },
            { key: 'friends', label: 'Venner' },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as TabType)}
        />
      </View>

      <FlatList
        data={filteredChallenges}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="px-6">
            <ChallengeCard
              challenge={item}
              onParticipate={handleParticipate}
              onPress={handleChallengePress}
            />
          </View>
        )}
        contentContainerClassName="py-4"
        ListEmptyComponent={
          <EmptyState
            title="Ingen udfordringer"
            description="Der er ingen aktive udfordringer i øjeblikket."
            icon="trophy-outline"
          />
        }
      />

      <Pressable
        onPress={() => router.push('/hub/create' as any)}
        className="absolute bottom-8 right-6 bg-white rounded-full p-4 shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        aria-label="Create Challenge"
      >
        <Ionicons name="add" size={28} color="#171616" />
      </Pressable>
    </ScreenContainer>
  );
}
