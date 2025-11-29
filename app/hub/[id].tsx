import { getChallenge } from '@/api/challenges';
import { LoadingScreen, ScreenHeader, ErrorScreen, ScreenContainer } from '@/components/common';
import { useJoinChallenge, useLeaveChallenge } from '@/hooks/queries/useChallenges';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Challenge } from '@/types/challenge';
import { SPORTS_TRANSLATION_EN_TO_DK } from '@/types/sports';
import { formatDate, formatTimeRange } from '@/utils/date';
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

  if (loading) return <LoadingScreen message="Indlæser udfordring..." />;
  if (error || !challenge) return <ScreenContainer><ScreenHeader title="Udfordring" /><ErrorScreen error={error || new Error('Udfordring ikke fundet')} /></ScreenContainer>;

  const getSportIcon = (sport: string) => {
    const iconMap: Record<string, string> = {
      'Football': 'football', 'Soccer': 'football', 'PadelTennis': 'tennisball',
      'Tennis': 'tennisball', 'Basketball': 'basketball', 'Volleyball': 'volleyball',
    };
    return iconMap[sport] || 'ellipse';
  };

  const sportName = SPORTS_TRANSLATION_EN_TO_DK[challenge.sport] || challenge.sport;
  const creatorName = challenge.creator ? challenge.creator.last_name ? `${challenge.creator.first_name} ${challenge.creator.last_name}` : challenge.creator.first_name : 'Unknown';
  const formattedDateShort = formatDate(challenge.date);
  const formattedTimeRange = formatTimeRange(challenge.start_time, challenge.end_time);

  const hasTwoTeams = challenge.teams && challenge.teams.length === 2;
  const team1 = challenge.teams?.[0];
  const team2 = challenge.teams?.[1];
  const team1Count = team1?.users?.length || 0;
  const team2Count = team2?.users?.length || 0;
  const teamSize = challenge.team_size;
  const allUsers = hasTwoTeams ? [] : (challenge.users || []);
  const totalSlots = hasTwoTeams ? teamSize * 2 : teamSize * 2;
  const locationParts = [challenge.location.address, challenge.location.city, challenge.location.postal_code].filter(Boolean);
  const isUserParticipating = currentUser && challenge.users.some(user => user.id === currentUser.id);

  const handleJoinLeave = async () => {
    if (!id || !currentUser) { showErrorToast('Du skal være logget ind for at deltage i udfordringer'); return; }
    if (challenge.is_completed) { showErrorToast('Du kan ikke deltage i en afsluttet udfordring'); return; }
    try {
      setIsJoining(true);
      if (isUserParticipating) await useLeaveChallengeMutation.mutateAsync(id);
      else await useJoinChallengeMutation.mutateAsync(id);
      setChallenge(await getChallenge(id));
    } catch (err) {
      console.error('Failed to join/leave challenge:', err);
      showErrorToast(err instanceof Error ? err.message : 'Kunne ikke opdatere deltagelse');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        <View className="px-6 pb-8">
          <ScreenHeader title="Udfordring" />
          <View className="bg-[#A0522D] rounded-lg flex-row items-center justify-center py-5 mb-6 relative">
            <View className="flex-1 items-center justify-center"><Text className="text-text font-bold text-6xl">{team1Count || teamSize || '?'}</Text></View>
            <View><Text className="text-text text-4xl font-medium italic z-10">vs</Text></View>
            <View className="w-[1px] bg-background mx-2 absolute h-[200%]" />
            <View className="flex-1 items-center justify-center"><Text className="text-text font-bold text-6xl">{team2Count || teamSize || '?'}</Text></View>
          </View>

          {hasTwoTeams ? (
            <View className="mb-8">
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <View className="bg-surface rounded-xl p-4 relative overflow-hidden">
                    <View className="absolute top-0 right-0 opacity-5"><Ionicons name={getSportIcon(challenge.sport) as any} size={120} color="#ffffff" /></View>
                    <Text className="text-text text-lg font-semibold mb-3 relative z-10">{team1?.name || 'Team A'}</Text>
                    <View className="relative z-10">
                      {team1?.users?.map(user => <View key={user.id} className="mb-2"><Text className="text-text text-sm">{user.first_name} {user.last_name || ''}</Text></View>)}
                      {team1 && team1.users.length < teamSize && Array.from({ length: teamSize - team1.users.length }).map((_, idx) => <View key={`empty-${idx}`} className="mb-2"><Text className="text-text-muted text-sm italic">Ledig plads</Text></View>)}
                    </View>
                  </View>
                </View>
                <View className="flex-1">
                  <View className="bg-surface rounded-xl p-4 relative overflow-hidden">
                    <View className="absolute top-0 right-0 opacity-5"><Ionicons name={getSportIcon(challenge.sport) as any} size={120} color="#ffffff" /></View>
                    <Text className="text-text text-lg font-semibold mb-3 relative z-10">{team2?.name || 'Team B'}</Text>
                    <View className="relative z-10">
                      {team2?.users?.map(user => <View key={user.id} className="mb-2"><Text className="text-text text-sm">{user.first_name} {user.last_name || ''}</Text></View>)}
                      {team2 && team2.users.length < teamSize && Array.from({ length: teamSize - team2.users.length }).map((_, idx) => <View key={`empty-${idx}`} className="mb-2"><Text className="text-text-muted text-sm italic">Ledig plads</Text></View>)}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="mb-8">
              <View className="bg-surface rounded-xl p-4 relative overflow-hidden">
                <View className="absolute top-0 right-0 opacity-5"><Ionicons name={getSportIcon(challenge.sport) as any} size={120} color="#ffffff" /></View>
                <Text className="text-text text-lg font-semibold mb-3 relative z-10">Deltagere</Text>
                <View className="relative z-10">
                  {allUsers.map(user => <View key={user.id} className="mb-2"><Text className="text-text text-sm">{user.first_name} {user.last_name || ''}</Text></View>)}
                  {allUsers.length < totalSlots && Array.from({ length: totalSlots - allUsers.length }).map((_, idx) => <View key={`empty-${idx}`} className="mb-2"><Text className="text-text-muted text-sm italic">Ledig plads</Text></View>)}
                </View>
              </View>
            </View>
          )}

          <View className="bg-surface rounded-xl p-5 mb-6">
            <View className="flex-row items-center justify-between mb-5 pb-5 border-b border-black/20">
              <Text className="text-text text-base font-medium">Sport</Text>
              <View className="bg-background rounded-full px-4 py-2 flex-row items-center">
                <Ionicons name={getSportIcon(challenge.sport) as any} size={18} color="#ffffff" />
                <Text className="text-text text-sm font-medium ml-2">{sportName}</Text>
              </View>
            </View>
            <View className="flex-row items-start justify-between mb-5 pb-5 border-b border-black/20">
              <Text className="text-text text-base font-medium pt-1">Lokation</Text>
              <View className="bg-background rounded-xl px-4 py-3 flex-1 ml-4 max-w-[70%]">
                {locationParts.map((part, idx) => <Text key={idx} className="text-text text-sm">{part}</Text>)}
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-5 pb-5 border-b border-black/20">
              <Text className="text-text text-base font-medium">Dato / Tid</Text>
              <View className="flex-row gap-2">
                <View className="bg-background rounded-full px-4 py-2"><Text className="text-text text-sm font-medium">{formattedDateShort}</Text></View>
                {formattedTimeRange && <View className="bg-background rounded-full px-4 py-2"><Text className="text-text text-sm font-medium">{formattedTimeRange}</Text></View>}
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-5 pb-5 border-b border-black/20">
              <Text className="text-text text-base font-medium">INT/EXT</Text>
              <View className={`rounded-full px-4 py-2 ${challenge.is_indoor ? 'bg-blue-600' : 'bg-green-600'}`}><Text className="text-text text-sm font-semibold">{challenge.is_indoor ? 'INT' : 'EXT'}</Text></View>
            </View>
            {challenge.comment && (
              <View className="flex-row items-start justify-between">
                <Text className="text-text text-base font-medium pt-1">Kommentar</Text>
                <View className="bg-background rounded-xl px-4 py-3 flex-1 ml-4 max-w-[70%]"><Text className="text-text text-sm">{challenge.comment}</Text></View>
              </View>
            )}
          </View>

          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-surface rounded-xl p-4">
              <Text className="text-text-muted text-xs mb-2">Oprettet af</Text>
              <Text className="text-text text-base font-semibold">{creatorName}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4">
              <Text className="text-text-muted text-xs mb-2">Status</Text>
              <Text className="text-text text-base font-semibold">{challenge.is_completed ? 'Afsluttet' : 'Aktiv'}</Text>
            </View>
          </View>

          <View className="gap-3">
            {!challenge.is_completed && (
              <Pressable
                className={`rounded-xl p-4 items-center ${isUserParticipating ? 'bg-surface border border-red-500/50' : 'bg-warning'} ${!currentUser ? 'opacity-50' : ''}`}
                onPress={handleJoinLeave}
                disabled={isJoining || !currentUser}
              >
                <Text className={`text-lg font-bold ${isUserParticipating ? 'text-red-400' : 'text-background'}`}>
                  {isJoining ? 'Opdaterer...' : !currentUser ? 'Log ind for at deltage' : isUserParticipating ? 'Forlad udfordringen' : 'Deltag i udfordring'}
                </Text>
              </Pressable>
            )}
            {hasTwoTeams && (
              <Pressable className="bg-surface rounded-xl p-4 items-center border border-[#3A3A3A]" onPress={() => router.back()}>
                <Text className="text-text text-base font-medium">Se hold detaljer</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
