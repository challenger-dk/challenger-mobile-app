import { getChallenge } from '@/api/challenges';
import { LoadingScreen, ScreenHeader } from '@/components/common';
import { ErrorScreen } from '@/components/common/ErrorScreen';
import { useJoinChallenge, useLeaveChallenge } from '@/hooks/queries/useChallenges';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Challenge } from '@/types/challenge';
import { SPORTS_TRANSLATION_EN_TO_DK } from '@/types/sports';
import { showErrorToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const useLeaveChallengeMutation = useLeaveChallenge();
  const useJoinChallengeMutation = useJoinChallenge();

  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getChallenge(id);
        setChallenge(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load challenge:', err);
        setError(err instanceof Error ? err : new Error('Failed to load challenge'));
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, [id]);

  if (loading) {
    return <LoadingScreen message="Indlæser udfordring..." />;
  }

  if (error || !challenge) {
    return (
      <View className="flex-1 bg-[#171616]">
        <ScreenHeader title="Udfordring" />
        <ErrorScreen error={error || new Error('Udfordring ikke fundet')} />
      </View>
    );
  }

  // Get sport icon name
  const getSportIcon = (sport: string) => {
    const iconMap: Record<string, string> = {
      'Football': 'football',
      'Soccer': 'football',
      'PadelTennis': 'tennisball',
      'Tennis': 'tennisball',
      'Basketball': 'basketball',
      'Volleyball': 'volleyball',
    };
    return iconMap[sport] || 'ellipse';
  };

  const sportName = SPORTS_TRANSLATION_EN_TO_DK[challenge.sport] || challenge.sport;
  
  // Format creator name
  const creatorName = challenge.creator 
    ? challenge.creator.last_name
      ? `${challenge.creator.first_name} ${challenge.creator.last_name}`
      : challenge.creator.first_name
    : 'Unknown';

  // Format date - short format like "14. Juli"
  const challengeDate = challenge.date ? new Date(challenge.date) : new Date();
  const formattedDateShort = challengeDate.toLocaleDateString('da-DK', { 
    day: 'numeric', 
    month: 'long' 
  });
  
  // Extract hour from ISO date string
  const getHour = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.getHours().toString().padStart(2, '0');
  };
  
  // Format time range as "Kl. HH-HH"
  const formattedTimeRange = challenge.start_time && challenge.end_time
    ? `Kl. ${getHour(challenge.start_time)}-${getHour(challenge.end_time)}`
    : challenge.start_time
    ? `Kl. ${getHour(challenge.start_time)}`
    : '';

  // Check if there are exactly 2 teams invited
  const hasTwoTeams = challenge.teams && challenge.teams.length === 2;
  const team1 = challenge.teams?.[0];
  const team2 = challenge.teams?.[1];
  const team1Count = team1?.users?.length || 0;
  const team2Count = team2?.users?.length || 0;
  const teamSize = challenge.team_size;

  console.log('challenge', challenge);
  
  // Get all users (from teams if 2 teams exist, otherwise from challenge.users)
  const allUsers = hasTwoTeams 
    ? [] // Users are shown per team
    : (challenge.users || []);
  
  // Calculate total slots needed (2 teams * team_size, or just team_size * 2 for display)
  const totalSlots = hasTwoTeams ? teamSize * 2 : teamSize * 2;

  // Format location
  const locationParts = [
    challenge.location.address,
    challenge.location.city,
    challenge.location.postal_code
  ].filter(Boolean);

  // Check if current user is part of the challenge
  const isUserParticipating = currentUser && challenge.users.some(user => user.id === currentUser.id);

  // Handle join/leave challenge
  const handleJoinLeave = async () => {
    if (!id || !currentUser) {
      showErrorToast('Du skal være logget ind for at deltage i udfordringer');
      return;
    }

    if (challenge.is_completed) {
      showErrorToast('Du kan ikke deltage i en afsluttet udfordring');
      return;
    }

    try {
      setIsJoining(true);
      
      if (isUserParticipating) {
        await useLeaveChallengeMutation.mutateAsync(id);
      } else {
        await useJoinChallengeMutation.mutateAsync(id);
      }

      // Refresh challenge data
      const updatedChallenge = await getChallenge(id);
      setChallenge(updatedChallenge);
    } catch (err) {
      console.error('Failed to join/leave challenge:', err);
      showErrorToast(
        err instanceof Error ? err.message : 'Kunne ikke opdatere deltagelse'
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#171616]">
      <View className="px-6 pb-8">
        <ScreenHeader title="Udfordring" />

        {/* VS Score Display - Same design as create page but non-interactive */}
        <View className="bg-[#A0522D] rounded-lg flex-row items-center justify-center py-5 mb-6 relative">
              {/* Left Number */}
              <View className="flex-1 items-center justify-center">
                <Text className="text-white text-6xl font-bold">
                  {team1Count || teamSize || '?'}
                </Text>
              </View>
              
              {/* VS Text */}
              <View className="">
                <Text className="text-white text-4xl font-medium italic z-10">vs</Text>
              </View>
              
              {/* Black Separator Line */}
              <View className="w-[1px] bg-[#171616] mx-2 absolute h-[200%]" />
              
              {/* Right Number */}
              <View className="flex-1 items-center justify-center">
                <Text className="text-white text-6xl font-bold">
                  {team2Count || teamSize || '?'}
                </Text>
              </View>
            </View>

        {/* Central VS Display with Teams - Only show if 2 teams are invited */}
        {hasTwoTeams ? (
          <View className="mb-8">
            {/* Team Rosters */}
            <View className="flex-row gap-4">
              {/* Team 1 Roster */}
              <View className="flex-1">
                <View className="bg-[#272626] rounded-xl p-4 relative overflow-hidden">
                  {/* Subtle background pattern */}
                  <View className="absolute top-0 right-0 opacity-5">
                    <Ionicons name={getSportIcon(challenge.sport) as any} size={120} color="#ffffff" />
                  </View>
                  
                  <Text className="text-white text-lg font-semibold mb-3 relative z-10">
                    {team1?.name || 'Team A'}
                  </Text>
                  {team1?.users && team1.users.length > 0 ? (
                    <View className="relative z-10">
                      {team1.users.map((user, idx) => (
                        <View key={user.id} className="mb-2">
                          <Text className="text-white text-sm">
                            {user.first_name} {user.last_name || ''}
                          </Text>
                        </View>
                      ))}
                      {/* Show empty slots if team not full */}
                      {team1.users.length < teamSize && (
                        <View className="mt-2 pt-2 border-t border-black/20">
                          {Array.from({ length: teamSize - team1.users.length }).map((_, idx) => (
                            <View key={`empty-${idx}`} className="mb-2">
                              <Text className="text-[#575757] text-sm italic">Ledig plads</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View className="relative z-10">
                      {Array.from({ length: teamSize }).map((_, idx) => (
                        <View key={`empty-${idx}`} className="mb-2">
                          <Text className="text-[#575757] text-sm italic">Ledig plads</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Team 2 Roster */}
              <View className="flex-1">
                <View className="bg-[#272626] rounded-xl p-4 relative overflow-hidden">
                  {/* Subtle background pattern */}
                  <View className="absolute top-0 right-0 opacity-5">
                    <Ionicons name={getSportIcon(challenge.sport) as any} size={120} color="#ffffff" />
                  </View>
                  
                  <Text className="text-white text-lg font-semibold mb-3 relative z-10">
                    {team2?.name || 'Team B'}
                  </Text>
                  {team2?.users && team2.users.length > 0 ? (
                    <View className="relative z-10">
                      {team2.users.map((user, idx) => (
                        <View key={user.id} className="mb-2">
                          <Text className="text-white text-sm">
                            {user.first_name} {user.last_name || ''}
                          </Text>
                        </View>
                      ))}
                      {/* Show empty slots if team not full */}
                      {team2.users.length < teamSize && (
                        <View className="mt-2 pt-2 border-t border-black/20">
                          {Array.from({ length: teamSize - team2.users.length }).map((_, idx) => (
                            <View key={`empty-${idx}`} className="mb-2">
                              <Text className="text-[#575757] text-sm italic">Ledig plads</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View className="relative z-10">
                      {Array.from({ length: teamSize }).map((_, idx) => (
                        <View key={`empty-${idx}`} className="mb-2">
                          <Text className="text-[#575757] text-sm italic">Ledig plads</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Simple user list with empty slots - Show when not 2 teams */
          <View className="mb-8">
            <View className="bg-[#272626] rounded-xl p-4 relative overflow-hidden">
              {/* Subtle background pattern */}
              <View className="absolute top-0 right-0 opacity-5">
                <Ionicons name={getSportIcon(challenge.sport) as any} size={120} color="#ffffff" />
              </View>
              
              <Text className="text-white text-lg font-semibold mb-3 relative z-10">
                Deltagere
              </Text>
              <View className="relative z-10">
                {allUsers.length > 0 ? (
                  <>
                    {allUsers.map((user) => (
                      <View key={user.id} className="mb-2">
                        <Text className="text-white text-sm">
                          {user.first_name} {user.last_name || ''}
                        </Text>
                      </View>
                    ))}
                    {/* Show empty slots if not full */}
                    {allUsers.length < totalSlots && (
                      <View className="mt-2 pt-2 border-t border-black/20">
                        {Array.from({ length: totalSlots - allUsers.length }).map((_, idx) => (
                          <View key={`empty-${idx}`} className="mb-2">
                            <Text className="text-[#575757] text-sm italic">Ledig plads</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View>
                    {Array.from({ length: totalSlots }).map((_, idx) => (
                      <View key={`empty-${idx}`} className="mb-2">
                        <Text className="text-[#575757] text-sm italic">Ledig plads</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Challenge Details - Clean List Format */}
        <View className="bg-[#272626] rounded-xl p-5 mb-6">
          {/* Sport */}
          <View className="flex-row items-center justify-between mb-5 pb-5 border-b border-black/20">
            <Text className="text-white text-base font-medium">Sport</Text>
            <View className="bg-[#171616] rounded-full px-4 py-2 flex-row items-center">
              <Ionicons name={getSportIcon(challenge.sport) as any} size={18} color="#ffffff" />
              <Text className="text-white text-sm font-medium ml-2">{sportName}</Text>
            </View>
          </View>

          {/* Location */}
          <View className="flex-row items-start justify-between mb-5 pb-5 border-b border-black/20">
            <Text className="text-white text-base font-medium pt-1">Lokation</Text>
            <View className="bg-[#171616] rounded-xl px-4 py-3 flex-1 ml-4 max-w-[70%]">
              {locationParts.map((part, idx) => (
                <Text key={idx} className="text-white text-sm">
                  {part}
                </Text>
              ))}
            </View>
          </View>

          {/* Date / Time */}
          <View className="flex-row items-center justify-between mb-5 pb-5 border-b border-black/20">
            <Text className="text-white text-base font-medium">Dato / Tid</Text>
            <View className="flex-row gap-2">
              <View className="bg-[#171616] rounded-full px-4 py-2">
                <Text className="text-white text-sm font-medium">{formattedDateShort}</Text>
              </View>
              {formattedTimeRange && (
                <View className="bg-[#171616] rounded-full px-4 py-2">
                  <Text className="text-white text-sm font-medium">{formattedTimeRange}</Text>
                </View>
              )}
            </View>
          </View>

          {/* INT/EXT */}
          <View className="flex-row items-center justify-between mb-5 pb-5 border-b border-black/20">
            <Text className="text-white text-base font-medium">INT/EXT</Text>
            <View className={`rounded-full px-4 py-2 ${challenge.is_indoor ? 'bg-blue-600' : 'bg-green-600'}`}>
              <Text className="text-white text-sm font-semibold">
                {challenge.is_indoor ? 'INT' : 'EXT'}
              </Text>
            </View>
          </View>

          {/* Comment */}
          {challenge.comment && (
            <View className="flex-row items-start justify-between">
              <Text className="text-white text-base font-medium pt-1">Kommentar</Text>
              <View className="bg-[#171616] rounded-xl px-4 py-3 flex-1 ml-4 max-w-[70%]">
                <Text className="text-white text-sm">{challenge.comment}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Additional Info Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-[#272626] rounded-xl p-4">
            <Text className="text-[#9CA3AF] text-xs mb-2">Oprettet af</Text>
            <Text className="text-white text-base font-semibold">{creatorName}</Text>
          </View>
          <View className="flex-1 bg-[#272626] rounded-xl p-4">
            <Text className="text-[#9CA3AF] text-xs mb-2">Status</Text>
            <Text className="text-white text-base font-semibold">
              {challenge.is_completed ? 'Afsluttet' : 'Aktiv'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          {!challenge.is_completed && (
            <Pressable
              className={`rounded-xl p-4 items-center ${isUserParticipating ? 'bg-[#272626] border border-red-500/50' : 'bg-[#FFC033]'} ${!currentUser ? 'opacity-50' : ''}`}
              onPress={handleJoinLeave}
              disabled={isJoining || !currentUser}
            >
              <Text className={`text-lg font-bold ${isUserParticipating ? 'text-red-400' : 'text-[#171616]'}`}>
                {isJoining 
                  ? 'Opdaterer...' 
                  : !currentUser
                  ? 'Log ind for at deltage'
                  : isUserParticipating 
                  ? 'Forlad udfordringen' 
                  : 'Deltag i udfordring'}
              </Text>
            </Pressable>
          )}

          {hasTwoTeams && (
            <Pressable
              className="bg-[#272626] rounded-xl p-4 items-center border border-[#3A3A3A]"
              onPress={() => {
                // Navigate to team management or similar
                router.back();
              }}
            >
              <Text className="text-white text-base font-medium">Se hold detaljer</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
