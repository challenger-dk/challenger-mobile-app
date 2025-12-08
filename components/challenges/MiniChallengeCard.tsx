import { formatDate, formatTimeRange } from '@/utils/date';
import { SportIcon } from '@/utils/sportIcons';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import type { Challenge } from '../../types/challenge';
import { SPORTS_TRANSLATION_EN_TO_DK } from '../../types/sports';

export interface MiniChallengeCardProps {
  challenge: Challenge;
  joinedParticipants: number;
  totalParticipants: number;
  onPress: (challengeId: number) => void;
}

export const MiniChallengeCard = ({ challenge, joinedParticipants, totalParticipants, onPress }: MiniChallengeCardProps) => {
  const sportName = SPORTS_TRANSLATION_EN_TO_DK[challenge.sport] || challenge.sport;
  
  const creatorName = challenge.creator
    ? challenge.creator.last_name
      ? `${challenge.creator.first_name} ${challenge.creator.last_name}`
      : challenge.creator.first_name
    : 'Unknown';

  const formattedDate = formatDate(challenge.date);
  const formattedTimeRange = formatTimeRange(challenge.start_time, challenge.end_time);

  return (
    <Pressable onPress={() => onPress(challenge.id)}>
      <View className="bg-surface rounded-xl p-3" style={{ width: 280 }}>
        <View className="flex-row items-center mb-2">
          <SportIcon sport={challenge.sport} size={32} color="#ffffff" />
          <View className="ml-2 flex-1">
            <View className="flex-row items-center">
              <Text className="text-text text-sm font-semibold flex-1" numberOfLines={1}>{sportName}</Text>
              <Text className="text-text text-xs ml-2 italic">{challenge.is_indoor ? 'INT' : 'EXT'}</Text>
            </View>
            <Text className="text-text-disabled text-xs" numberOfLines={1}>{creatorName}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <Ionicons name="time-outline" size={14} color="#ffffff" />
            <Text className="text-text text-xs ml-1">{formattedTimeRange}</Text>
          </View>
          <Text className="text-text text-xs ml-2">{formattedDate}</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Ionicons name="location-outline" size={14} color="#ffffff" />
            <Text className="text-text text-xs ml-1 flex-1" numberOfLines={1}>{challenge.location.address}</Text>
          </View>
          <View className="flex-row items-center ml-2">
            <Ionicons name="people-outline" size={14} color="#ffffff" />
            <Text className="text-text text-xs ml-1">{joinedParticipants}/{totalParticipants}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

