import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

import {
  ErrorScreen,
  LoadingScreen,
  ScreenContainer,
  TopActionBar,
} from '../../components/common';
import { useChallenges } from '../../hooks/queries';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Challenge } from '../../types/challenge';
import type { Team } from '../../types/team';
import type { User } from '../../types/user';

LocaleConfig.locales.da = {
  monthNames: [
    'Januar',
    'Februar',
    'Marts',
    'April',
    'Maj',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan.',
    'Feb.',
    'Mar.',
    'Apr.',
    'Maj',
    'Jun.',
    'Jul.',
    'Aug.',
    'Sep.',
    'Okt.',
    'Nov.',
    'Dec.',
  ],
  dayNames: [
    'Søndag',
    'Mandag',
    'Tirsdag',
    'Onsdag',
    'Torsdag',
    'Fredag',
    'Lørdag',
  ],
  dayNamesShort: ['Søn.', 'Man.', 'Tirs.', 'Ons.', 'Tors.', 'Fre.', 'Lør.'],
  today: 'I dag',
};

LocaleConfig.defaultLocale = 'da';

const isUserConnectedToChallenge = (challenge: Challenge, currentUser: User) => {
  return (
    challenge.creator.id === currentUser.id ||
    challenge.users.some((u: User) => u.id === currentUser.id) ||
    challenge.teams.some((team: Team) =>
      team.users?.some((u: User) => u.id === currentUser.id)
    )
  );
};

// Helper function to compare dates (ignoring time and timezone)
const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// Convert date string (YYYY-MM-DD) to Date object at midnight local time
const dateStringToDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function HubCalendarScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const {
    data: challenges = [],
    isLoading,
    error,
  } = useChallenges();

  const connectedChallenges = useMemo(() => {
    if (!user) return [] as Challenge[];
    return (challenges as Challenge[]).filter((challenge) =>
      isUserConnectedToChallenge(challenge, user)
    );
  }, [challenges, user]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    connectedChallenges.forEach((challenge) => {
      if (!challenge.date) return;
      
      const challengeDate = new Date(challenge.date);
      const year = challengeDate.getFullYear();
      const month = String(challengeDate.getMonth() + 1).padStart(2, '0');
      const day = String(challengeDate.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;

      if (!marks[key]) {
        marks[key] = { marked: true };
      }
    });

    return marks;
  }, [connectedChallenges]);

  const challengesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const selectedDateObj = dateStringToDate(selectedDate);
    
    return connectedChallenges.filter((challenge) => {
      if (!challenge.date) return false;
      const challengeDate = new Date(challenge.date);
      return isSameDate(challengeDate, selectedDateObj);
    });
  }, [connectedChallenges, selectedDate]);

  if (isLoading) {
    return <LoadingScreen message="Henter kalender..." />;
  }

  if (error) {
    return (
      <ErrorScreen
        error={
          error instanceof Error
            ? error
            : new Error('Kunne ikke hente udfordringer til kalenderen')
        }
      />
    );
  }

  return (
    <ScreenContainer className="pt-5">
      <TopActionBar
        title="Kalender"
        leftAction={
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-[#1C1C1E] items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
          </Pressable>
        }
        showNotifications={false}
        showCalendar={false}
        showSettings={false}
      />

      <View className="flex-1 bg-[#171616] pt-2">
        <Calendar
          current={selectedDate}
          firstDay={1}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: '#0A84FF',
            },
          }}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
          }}
          theme={{
            backgroundColor: '#171616',
            calendarBackground: '#171616',
            dayTextColor: '#FFFFFF',
            monthTextColor: '#FFFFFF',
            textSectionTitleColor: '#999999',
            selectedDayBackgroundColor: '#0A84FF',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#0A84FF',
            arrowColor: '#FFFFFF',
          }}
        />

        <FlatList
          data={challengesForSelectedDate}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="px-6 pt-4 pb-6 gap-3"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/hub/${item.id}` as any)}
              className="bg-[#1C1C1E] rounded-xl px-4 py-3 border border-[#2C2C2E]"
            >
              <Text className="text-white text-base font-semibold">
                {item.name}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                {item.sport} •{' '}
                {new Date(item.start_time || item.date).toLocaleTimeString('da-DK', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="px-6 pt-6">
              <Text className="text-gray-400 text-center">
                Ingen udfordringer på den valgte dag.
              </Text>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}