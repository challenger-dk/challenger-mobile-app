import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Challenge } from '../../types/challenge';
import { SPORTS_TRANSLATION_EN_TO_DK } from '../../types/sports';
import { formatDate, formatTimeRange } from '@/utils/date';

export interface ChallengeCardProps {
  challenge: Challenge;
  onParticipate: (challengeId: number) => void;
  onPress?: (challengeId: number) => void;
}

export const ChallengeCard = ({ challenge, onParticipate, onPress }: ChallengeCardProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'teams'>('info');
  const sportName = SPORTS_TRANSLATION_EN_TO_DK[challenge.sport] || challenge.sport;
  const teamCount = challenge.teams?.length || '?';

  const getSportIcon = (sport: string) => {
    const iconMap: Record<string, string> = {
      'Football': 'football', 'Soccer': 'football', 'PadelTennis': 'tennisball',
      'Tennis': 'tennisball', 'Basketball': 'basketball', 'Volleyball': 'volleyball',
    };
    return iconMap[sport] || 'ellipse';
  };

  const creatorName = challenge.creator
    ? challenge.creator.last_name
      ? `${challenge.creator.first_name} ${challenge.creator.last_name}`
      : challenge.creator.first_name
    : 'Unknown';

  const formattedDate = formatDate(challenge.date);
  const formattedTimeRange = formatTimeRange(challenge.start_time, challenge.end_time);

  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between top-4 z-10">
        <View className="flex-row items-center gap-1">
          <Pressable onPress={() => setActiveTab('info')} className="bg-surface rounded-xl p-2">
            <Text className={`text-xs font-medium ${activeTab === 'info' ? 'text-white' : 'text-gray-500'}`}>Oplysninger</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab('teams')} className="bg-surface rounded-xl p-2">
            <Text className={`text-xs font-medium ${activeTab === 'teams' ? 'text-white' : 'text-gray-500'}`}>Teams</Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={() => onPress?.(challenge.id)} className="bg-surface rounded-xl p-3">
        <View className="mt-2 flex-row">
          <View className="flex-1 pr-4 border-r border-black/40">
            <View className="flex-row">
              <View className="w-[62.5%] justify-center border-r border-black/40 pr-4">
                {activeTab === 'info' ? (
                  <View className="flex-row items-center">
                    <Ionicons name={getSportIcon(challenge.sport) as any} size={48} color="#ffffff" />
                    <View className="ml-2 flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-text text-base font-semibold flex-1" numberOfLines={1}>{sportName}</Text>
                        <Text className="text-text text-xs ml-2 italic">{challenge.is_indoor ? 'INT' : 'EXT'}</Text>
                      </View>
                      <Text className="text-text-disabled text-sm" numberOfLines={1}>{creatorName}</Text>
                    </View>
                  </View>
                ) : (
                  <View className="flex-col">
                    <View className="flex-row items-center">
                      <Text className="text-white text-base font-semibold flex-1" numberOfLines={1}>{challenge.teams?.[0]?.name ?? 'Team A'}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-white text-sm flex-1" numberOfLines={1}>{challenge.teams?.[0]?.users?.map((user) => user.first_name).join(', ')}</Text>
                    </View>
                  </View>
                )}
              </View>
              <View className="w-[32.5%] justify-center pl-4">
                {activeTab === 'info' ? (
                  <>
                    <Text className="text-text text-lg text-center">{formattedTimeRange}</Text>
                    <Text className="text-text text-xs text-center">{formattedDate}</Text>
                  </>
                ) : (
                  <View className="flex-col">
                    <View className="flex-row items-center">
                      <Text className="text-white text-base font-semibold flex-1" numberOfLines={1}>{challenge.teams?.[1]?.name ?? 'Team B'}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-white text-sm flex-1" numberOfLines={1}>{challenge.teams?.[1]?.users?.map((user) => user.first_name).join(', ')}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View className="w-[112%] bg-[#171616] absolute h-[1px] top-[62px] -translate-y-1/2 z-10 -left-5" />

            <View className="flex-row mt-6">
              <View className="w-[55%] border-r border-black/40 pr-4">
                {activeTab === 'info' && (
                  <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={16} color="#ffffff" />
                    <Text className="text-text text-sm ml-2 flex-1" numberOfLines={2}>{challenge.location.address}</Text>
                  </View>
                )}
              </View>
              <View className="w-[45%] justify-center pl-4">
                {activeTab === 'info' && challenge.comment && (
                  <View className="flex-row items-start">
                    <Ionicons name="chatbubble-outline" size={16} color="#ffffff" />
                    <Text className="text-text text-sm ml-2 flex-1" numberOfLines={2}>{challenge.comment}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className="w-[17.5%] relative self-stretch">
            <View className="absolute -top-5 -bottom-3 left-0 right-0 flex-col">
              <View className="flex-1 bg-surface w-[115%] items-center justify-center -mr-3 rounded-tr-xl">
                <Text className="text-text font-bold text-2xl">
                  {teamCount !== '?' ? (challenge.teams?.[0]?.users?.length || 0) : challenge.team_size}
                </Text>
              </View>
              <View className="w-[100%] items-center justify-center absolute top-1/2 left-0 -translate-y-1/2 z-10">
                <View className="w-[140%] bg-[#161617] absolute h-[1px] z-10 left-0" />
                <Text className="text-text font-black text-sm tracking-wider z-10 px-2 left-1">VS</Text>
              </View>
              <View className="flex-1 bg-[#BD1A1A] w-[115%] items-center justify-center -mr-3 rounded-br-xl">
                <Text className="text-text font-bold text-2xl">
                  {teamCount !== '?' ? (challenge.teams?.[1]?.users?.length || challenge.teams?.[0]?.users?.length || 0) : challenge.team_size}
                </Text>
              </View>
            </View>
            <View className="absolute right-[-25px] top-[48%] -translate-y-1/2 z-20">
              <View className="relative">
                <View className="absolute inset-0 bg-warning rounded-full border-2 border-background" style={{ width: 32, height: 32, left: 2, top: 2 }} />
                <Ionicons name="arrow-forward-circle-outline" size={36} color="#171616" />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};
