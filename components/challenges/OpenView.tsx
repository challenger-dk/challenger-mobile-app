import { formatDate, formatTimeRange } from '@/utils/date';
import { SportIcon } from '@/utils/sportIcons';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import type { Challenge } from '../../types/challenge';
import { SPORTS_TRANSLATION_EN_TO_DK } from '../../types/sports';

export interface ViewProps {
  challenge: Challenge;
  joinedParticipants: number;
  totalParticipants: number;
}

export interface OpenViewProps extends ViewProps {
  onParticipate: (challengeId: number) => void;
}

export const OpenView = ({ challenge, onParticipate }: OpenViewProps) => {
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
        <View className="w-[32.5%] justify-center pl-4">
          <Text className="text-text text-lg text-center">{formattedTimeRange}</Text>
          <Text className="text-text text-xs text-center">{formattedDate}</Text>
        </View>
      </View>

      <View className="w-[112%] bg-[#171616] absolute h-[1px] top-[62px] -translate-y-1/2 z-10 -left-5" />

      <View className="flex-row -mr-4 -mb-3 mt-4 items-stretch">
        <View className="w-[55%] border-r border-black/40 pr-4 justify-center py-3">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#ffffff" />
            <Text className="text-text text-sm ml-2 flex-1" numberOfLines={2}>{challenge.location.address}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => onParticipate(challenge.id)}
          className="flex-1 bg-softBlue justify-center items-center"
        >
          <Text className="text-white text-sm font-medium">Deltag</Text>
        </Pressable>
      </View>
    </View>
  );
};

