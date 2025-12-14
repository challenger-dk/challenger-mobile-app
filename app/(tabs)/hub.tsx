import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { ChallengeCard } from '../../components/challenges';
import {
  DateFilter,
  EmptyState,
  ErrorScreen,
  LoadingScreen,
  ScreenContainer,
  TabNavigation,
  TopActionBar,
} from '../../components/common';
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
  const [activePersonalTab, setActivePersonalTab] =
    useState<PersonalTabType>('mine');
  
  // Date filter state - default to today
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const {
    data: challenges = [],
    isLoading: loading,
    error,
    refetch,
  } = useChallenges();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleChallengePress = (challengeId: number) => {
    router.push(`/hub/${challengeId}` as any);
  };

  // Helper function to compare dates (ignoring time)
  const isSameDate = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const filteredChallenges = useMemo(() => {
    let filtered = challenges;

    console.log('filtered', filtered);

    // Filter by date first
    filtered = filtered.filter((challenge: Challenge) => {
      if (!challenge.date) return false;
      const challengeDate = new Date(challenge.date);
      challengeDate.setHours(0, 0, 0, 0);
      return isSameDate(challengeDate, selectedDate);
    });

    // Then filter by view mode and tabs
    if (viewMode === 'default') {
      // Default view: Public and Friends tabs
      filtered = filtered.filter((challenge: Challenge) =>
        activeTab === 'public' ? challenge.is_public : !challenge.is_public
      );
    } else {
      // Personal view: My challenges and Registered tabs
      if (!user) return [];

      if (activePersonalTab === 'mine') {
        // My challenges: challenges created by the current user
        filtered = filtered.filter(
          (challenge: Challenge) => challenge.creator.id === user.id
        );
      } else {
        // Registered: challenges where user has joined (but not created)
        filtered = filtered.filter((challenge: Challenge) => {
          // Exclude challenges created by the user
          if (challenge.creator.id === user.id) {
            return false;
          }
          // Include challenges where user is participating
          const isParticipating =
            challenge.users.some((u: User) => u.id === user.id) ||
            challenge.teams.some((team: Team) =>
              team.users?.some((u: User) => u.id === user.id)
            );
          return isParticipating;
        });
      }
    }

    return filtered;
  }, [challenges, activeTab, activePersonalTab, viewMode, user, selectedDate]);

  if (loading) {
    return <LoadingScreen message="Loading challenges..." />;
  }

  if (error) {
    return (
      <ErrorScreen
        error={
          error instanceof Error
            ? error
            : new Error('Failed to fetch challenges')
        }
      />
    );
  }

  return (
    <ScreenContainer>
      <TopActionBar
        title={viewMode === 'default' ? 'Hub' : undefined}
        leftAction={
          viewMode === 'personal' ? (
            <Pressable
              onPress={() => setViewMode('default')}
              className="p-2 -ml-2"
            >
              <Ionicons name="chevron-back" size={28} color="#ffffff" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() =>
                setViewMode(viewMode === 'default' ? 'personal' : 'default')
              }
            >
              <Image
                source={require('../../assets/VS-Icon-button.svg')}
                style={{ width: 40, height: 40 }}
                contentFit="contain"
              />
            </Pressable>
          )
        }
        centerAction={
          viewMode === 'personal' ? (
            <Pressable onPress={() => setViewMode('default')}>
              <Image
                source={require('../../assets/VS-Icon-button.svg')}
                style={{ width: 40, height: 40 }}
                contentFit="contain"
              />
            </Pressable>
          ) : undefined
        }
        showNotifications={viewMode === 'default'}
        showCalendar={viewMode === 'default'}
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

      <DateFilter selectedDate={selectedDate} onDateSelect={setSelectedDate} />

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
