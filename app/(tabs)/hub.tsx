import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { ChallengeCard } from '../../components/challenges';
import { EmptyState, ErrorScreen, LoadingScreen, ScreenContainer, TabNavigation, TopActionBar } from '../../components/common';
import { useChallenges } from '../../hooks/queries';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Challenge } from '../../types/challenge';
import type { Team } from '../../types/team';
import type { User } from '../../types/user';

type TabType = 'public' | 'friends';
type PersonalTabType = 'mine' | 'tilmeldte';
type ViewMode = 'default' | 'personal';

export default function HubScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [activeTab, setActiveTab] = useState<TabType>('public');
  const [activePersonalTab, setActivePersonalTab] = useState<PersonalTabType>('mine');

  const { data: challenges = [], isLoading: loading, error, refetch } = useChallenges();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleChallengePress = (challengeId: number) => {
    router.push(`/hub/${challengeId}` as any);
  };

  const filteredChallenges = useMemo(() => {
    if (viewMode === 'default') {
      // Default view: Public and Friends tabs
      return challenges.filter((challenge: Challenge) =>
        activeTab === 'public' ? challenge.is_public : !challenge.is_public
      );
    } else {
      // Personal view: My challenges and Registered tabs
      if (!user) return [];
      
      if (activePersonalTab === 'mine') {
        // My challenges: challenges created by the current user
        return challenges.filter((challenge: Challenge) =>
          challenge.creator.id === user.id
        );
      } else {
        // Registered: challenges where user has joined (but not created)
        return challenges.filter((challenge: Challenge) => {
          // Exclude challenges created by the user
          if (challenge.creator.id === user.id) {
            return false;
          }
          // Include challenges where user is participating
          const isParticipating = 
            challenge.users.some((u: User) => u.id === user.id) ||
            challenge.teams.some((team: Team) => team.users?.some((u: User) => u.id === user.id));
          return isParticipating;
        });
      }
    }
  }, [challenges, activeTab, activePersonalTab, viewMode, user]);

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
        leftAction={
          <Pressable onPress={() => setViewMode(viewMode === 'default' ? 'personal' : 'default')}>
            <Image
              source={require('../../assets/VS-Icon-button.svg')}
              style={{ width: 40, height: 40 }}
              contentFit="contain"
            />
          </Pressable>
        }
        showSettings={false}
      />

      <View className="px-6 pt-2 pb-2">
        {viewMode === 'default' ? (
          <TabNavigation
            tabs={[
              { key: 'public', label: 'Offentligt' },
              { key: 'friends', label: 'Venner' },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as TabType)}
          />
        ) : (
          <TabNavigation
            tabs={[
              { key: 'mine', label: 'Mine udfordringer' },
              { key: 'tilmeldte', label: 'Tilmeldte' },
            ]}
            activeTab={activePersonalTab}
            onTabChange={(key) => setActivePersonalTab(key as PersonalTabType)}
          />
        )}
      </View>

      <FlatList
        data={filteredChallenges}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="px-6">
            <ChallengeCard
              challenge={item}
              onPress={handleChallengePress}
              type={item.is_completed ? 'closed' : 'open'}
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
