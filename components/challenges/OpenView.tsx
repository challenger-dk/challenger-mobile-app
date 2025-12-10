import { useJoinChallenge, useLeaveChallenge } from '@/hooks/queries/useChallenges';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { queryKeys } from '@/lib/queryClient';
import { formatDate, formatTimeRange } from '@/utils/date';
import { SportIcon } from '@/utils/sportIcons';
import { showErrorToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Challenge } from '../../types/challenge';
import { SPORTS_TRANSLATION_EN_TO_DK } from '../../types/sports';
import type { Team } from '../../types/team';
import type { User } from '../../types/user';

export interface ViewProps {
  challenge: Challenge;
  joinedParticipants: number;
  totalParticipants: number;
}

export const OpenView = ({ challenge }: ViewProps) => {
  const { user } = useCurrentUser();
  const joinChallengeMutation = useJoinChallenge();
  const leaveChallengeMutation = useLeaveChallenge();
  const queryClient = useQueryClient();
  const [isJoining, setIsJoining] = useState(false);

  const isUserParticipating = user && (
    challenge.users.some((u: User) => u.id === user.id) ||
    challenge.teams.some((team: Team) => team.users?.some((u: User) => u.id === user.id))
  );

  const handleJoinLeave = async () => {
    if (!user) {
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
        await leaveChallengeMutation.mutateAsync(challenge.id.toString());
      } else {
        await joinChallengeMutation.mutateAsync(challenge.id.toString());
      }
      // Invalidate challenges list to refresh the UI
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.challenges.lists(),
      });
    } catch (err) {
      console.error('Failed to join/leave challenge:', err);
      // Error toast is handled by the mutation hooks
    } finally {
      setIsJoining(false);
    }
  };
  const sportName = SPORTS_TRANSLATION_EN_TO_DK[challenge.sport] || challenge.sport;
  
  const creatorName = challenge.creator
    ? challenge.creator.last_name
      ? `${challenge.creator.first_name} ${challenge.creator.last_name}`
      : challenge.creator.first_name
    : 'Unknown';

  const formattedDate = formatDate(challenge.date);
  const formattedTimeRange = formatTimeRange(challenge.start_time, challenge.end_time);

  return (
    <View className="flex-1 justify-between">
      <View className="flex-row">
        <View className="w-[62.5%] justify-center border-r border-black/40 pr-4">
          <View className="flex-row items-center">
            <SportIcon sport={challenge.sport} size={48} color="#ffffff" />
            <View className="ml-2 flex-1">
              <View className="flex-row items-center">
                <Text className="text-text text-base font-semibold flex-1" numberOfLines={1}>{sportName}</Text>
                <Text className="text-text text-xs ml-2 italic">{challenge.is_indoor ? 'INT' : 'EXT'}</Text>
              </View>
              <Text className="text-text-disabled text-sm" numberOfLines={1}>{creatorName}</Text>
            </View>
          </View>
        </View>
        <View className="w-[43%] justify-center pl-4 relative">
          <View className="absolute -top-5 right-0 w-8 h-8 bg-black/20 rounded-bl-full items-center justify-center">
            <Ionicons className="absolute top-1 right-1" name="calendar-outline" size={14} color="#ffffff" />
          </View>
          <Text className="text-text text-lg text-center">{formattedTimeRange}</Text>
          <Text className="text-text text-xs text-center">{formattedDate}</Text>
        </View>
      </View>

      <View className="w-[112%] bg-[#171616] absolute h-[1px] top-[62px] -translate-y-1/2 z-10 -left-5" />

      <View className="flex-row -mr-4 -mb-3 items-stretch">
        <View className="w-[55%] border-r border-black/40 pr-4 justify-center py-3 relative">
          <View className="absolute top-0 right-0 w-8 h-8 bg-black/20 rounded-bl-full items-center justify-center">
            <Ionicons className="absolute top-1 right-1" name="pin-outline" size={14} color="#ffffff" />
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#ffffff" />
            <Text className="text-text text-sm ml-2 flex-1" numberOfLines={2}>{challenge.location.address}</Text>
          </View>
        </View>
        <Pressable
          onPress={handleJoinLeave}
          disabled={isUserParticipating || isJoining || challenge.is_completed}
          className={`flex-1 justify-center items-center ${isUserParticipating || challenge.is_completed ? 'bg-surface' : 'bg-softBlue'}`}
        >
          <Text className={`text-sm font-medium ${isUserParticipating || challenge.is_completed ? 'text-text-disabled' : 'text-white'}`}>
            {isJoining ? 'Deltager...' : isUserParticipating ? 'Deltager' : 'Deltag'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

