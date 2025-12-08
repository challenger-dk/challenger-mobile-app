import { Text, View } from 'react-native';
import type { Challenge } from '../../types/challenge';

export interface ViewProps {
  challenge: Challenge;
  joinedParticipants: number;
  totalParticipants: number;
}

export const TeamsView = ({ challenge }: ViewProps) => {
  return (
    <View className="flex-1 justify-center">
      <View className="flex-row">
        <View className="w-[62.5%] justify-center border-r border-black/40 pr-4">
          <View className="flex-col">
            <View className="flex-row items-center">
              <Text className="text-white text-base font-semibold flex-1" numberOfLines={1}>
                {challenge.teams?.[0]?.name ?? 'Team A'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-white text-sm flex-1" numberOfLines={1}>
                {challenge.teams?.[0]?.users?.map((user) => user.first_name).join(', ')}
              </Text>
            </View>
          </View>
        </View>
        <View className="w-[32.5%] justify-center pl-4">
          <View className="flex-col">
            <View className="flex-row items-center">
              <Text className="text-white text-base font-semibold flex-1" numberOfLines={1}>
                {challenge.teams?.[1]?.name ?? 'Team B'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-white text-sm flex-1" numberOfLines={1}>
                {challenge.teams?.[1]?.users?.map((user) => user.first_name).join(', ')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

