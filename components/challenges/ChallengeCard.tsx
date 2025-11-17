import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Challenge } from '../../types/challenge';
import { SPORTS_TRANSLATION_EN_TO_DK } from '../../types/sports';

export interface ChallengeCardProps {
  challenge: Challenge;
  onParticipate: (challengeId: number) => void;
}

export const ChallengeCard = ({ challenge, onParticipate }: ChallengeCardProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'teams'>('info');
  const sportName = SPORTS_TRANSLATION_EN_TO_DK[challenge.sport] || challenge.sport;
  const teamCount = challenge.teams?.length || '?';
  
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

  // Format creator name
  const creatorName = challenge.creator 
    ? challenge.creator.last_name
      ? `${challenge.creator.first_name} ${challenge.creator.last_name}`
      : challenge.creator.first_name
    : 'Unknown';

  // Format date and time
  const challengeDate = challenge.date ? new Date(challenge.date) : new Date();
  const formattedDate = challengeDate.toLocaleDateString('da-DK', { 
    day: 'numeric', 
    month: 'long' 
  });
  
  // Extract hour from ISO date string
  const getHour = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.getHours().toString();
  };
  
  // Format time range as "Kl. HH-HH"
  const formattedTimeRange = challenge.start_time && challenge.end_time
    ? `Kl. ${getHour(challenge.start_time)}-${getHour(challenge.end_time)}`
    : challenge.start_time
    ? `Kl. ${getHour(challenge.start_time)}`
    : '';

  return (
    <View className="mb-8">
      {/* Status and Tab Header */}
      <View className="flex-row items-center justify-between top-4 z-10">
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={() => setActiveTab('info')}
            className="bg-[#272626] rounded-xl p-2"
          >
          <Text className="text-white text-xs font-medium">Oplysninger</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('teams')}
            className="bg-[#272626] rounded-xl p-2"
          >
            <Text className="text-white text-xs font-medium">Deltagere</Text>
          </Pressable>
        </View>
      </View>

      {activeTab === 'info' ? (
        <View className="bg-[#272626] rounded-xl p-3">
          {/* 2x2 Grid (left) + 1x2 Grid (right) Layout */}
          <View className="mt-2 flex-row">
            {/* Left: 2x2 Grid */}
            <View className="flex-1 pr-4 border-r border-black/40">
              {/* Row 1 of 2x2 grid */}
              <View className="flex-row mb-2">
                {/* Cell 1,1 - Icon, Sport Name and Creator */}
                <View className="w-[62.5%] justify-center border-r border-black/40 pr-4">
                  <View className="flex-row items-center">
                    <Ionicons name={getSportIcon(challenge.sport) as any} size={48} color="#ffffff" />
                    <View className="ml-2">
                      <View className="flex-row items-center">
                        <Text className="text-white text-base font-semibold">
                          {sportName}
                        </Text>
                        <Text className="text-white text-xs ml-2 italic">{challenge.is_indoor ? 'INT' : 'EXT'}</Text>
                      </View>
                      <Text className="text-[#dfdfdf] text-sm">{creatorName}</Text>
                    </View>
                  </View>
                </View>
                {/* Cell 1,2 - StartTime, EndTime and Date */}
                <View className="w-[32.5%] justify-center pl-4">
                  {formattedTimeRange && (
                    <Text className="text-white text-lg">{formattedTimeRange}</Text>
                  )}
                  {formattedDate && (
                    <Text className="text-white text-xs">{formattedDate}</Text>
                  )}
                </View>
              </View>
              
              {/* Black Separator Line */}
              <View className="w-[110%] bg-[#171616] mx-2 absolute h-[1px] top-1/2 -translate-y-1/2 z-10 -left-5" />

              {/* Row 2 of 2x2 grid */}
              <View className="flex-row">
                {/* Cell 2,1 - Location */}
                <View className="w-[55%] border-r border-black/40 pr-4">
                  <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={16} color="#ffffff" />
                    <Text className="text-white text-sm ml-2 flex-1">{challenge.location.address}</Text>
                  </View>
                </View>
                {/* Cell 2,2 - Comment */}
                <View className="w-[45%] justify-center pl-4">
                  {challenge.comment && (
                    <View className="flex-row items-start">
                      <Ionicons name="chatbubble-outline" size={16} color="#ffffff" />
                      <Text className="text-white text-sm ml-2 flex-1">{challenge.comment}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Right: 1x2 Grid - Vertical Score Display */}
            <View className="w-[17.5%] relative">
              {/* Score Column */}
              <View className="items-center">
                {/* Row 1 of 1x2 grid - Top Score */}
                <View className="mb-2">
                  <View className="bg-[#272626] px-4 py-4 w-[115%] items-center -mr-3 -mt-4">
                    <Text className="text-white font-bold text-2xl">
                      {teamCount !== '?' 
                        ? (challenge.teams?.[0]?.users?.length || 0)
                        : challenge.team_size}
                    </Text>
                  </View>
                </View>

                {/* VS Text */}
                <Text className="text-white font-black text-sm my-2 tracking-wider z-10">
                  VS
                </Text>

                {/* Row 2 of 1x2 grid - Bottom Score */}
                <View className="bg-[#BD1A1A] px-4 py-4 w-[115%] items-center -mr-3 -mt-4">
                    <Text className="text-white font-bold text-2xl">
                      {teamCount !== '?' 
                        ? (challenge.teams?.[1]?.users?.length || challenge.teams?.[0]?.users?.length || 0)
                        : challenge.team_size}
                    </Text>
                </View>
              </View>

              {/* Arrow Button - Positioned absolutely on the right, vertically centered */}
              <View className="absolute right-[-15px] top-1/2 -translate-y-1/2">
                <Ionicons name="arrow-forward-circle" size={36} color="#FFC033" />
              </View>
            </View>
          </View>
        </View>
      ) : (
        /* Teams View */
        <View className="flex-row items-start">
          {/* Team B */}
          <View className="flex-1">
            <Text className="text-white font-semibold mb-2">Team B</Text>
            {challenge.teams?.[0]?.users?.map((user, index) => (
              <Text key={index} className="text-white text-sm mb-1">
                {user.first_name} {user.last_name || ''}
              </Text>
            ))}
            {(!challenge.teams?.[0] || challenge.teams[0].users?.length === 0) && (
              <Text className="text-[#575757] text-sm">?</Text>
            )}
          </View>

          {/* VS and Score */}
          <View className="px-4 items-center justify-center">
            <Text className="text-white font-bold text-xl mb-4">VS</Text>
            <View className="flex-row items-center gap-2 mb-2">
              <View className="bg-white rounded px-4 py-2">
                <Text className="text-[#171616] font-bold text-2xl">
                  {challenge.teams?.[0]?.users?.length || 0}
                </Text>
              </View>
              <Text className="text-white font-bold text-lg">VS</Text>
              <View className="bg-[#943d40] rounded px-4 py-2">
                <Text className="text-white font-bold text-2xl">
                  {challenge.teams?.[1]?.users?.length || 0}
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="#fbb03c" />
          </View>

          {/* Team R */}
          <View className="flex-1 items-end">
            <Text className="text-white font-semibold mb-2">Team R</Text>
            {challenge.teams?.[1]?.users?.map((user, index) => (
              <Text key={index} className="text-white text-sm mb-1 text-right">
                {user.first_name} {user.last_name || ''}
              </Text>
            ))}
            {(!challenge.teams?.[1] || challenge.teams[1].users?.length === 0) && (
              <>
                {Array.from({ length: challenge.teams?.[0]?.users?.length || 0 }).map((_, index) => (
                  <Text key={index} className="text-[#575757] text-sm mb-1 text-right">?</Text>
                ))}
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

