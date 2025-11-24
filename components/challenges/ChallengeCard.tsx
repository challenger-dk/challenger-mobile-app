import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Challenge } from '../../types/challenge';
import { SPORTS_TRANSLATION_EN_TO_DK } from '../../types/sports';

export interface ChallengeCardProps {
  challenge: Challenge;
  onParticipate: (challengeId: number) => void;
  onPress?: (challengeId: number) => void;
}

export const ChallengeCard = ({ challenge, onParticipate, onPress }: ChallengeCardProps) => {
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
          <Text className={`text-xs font-medium ${activeTab === 'info' ? 'text-white' : 'text-gray-500'}`}>Oplysninger</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('teams')}
            className="bg-[#272626] rounded-xl p-2"
          >
            <Text className={`text-xs font-medium ${activeTab === 'teams' ? 'text-white' : 'text-gray-500'}`}>Teams</Text>
          </Pressable>
        </View>
      </View>

      {activeTab === 'info' ? (
        <Pressable 
          onPress={() => onPress?.(challenge.id)}
          className="bg-[#272626] rounded-xl p-3"
        >
          {/* 2x2 Grid (left) + 1x2 Grid (right) Layout */}
          <View className="mt-2 flex-row">
            {/* Left: 2x2 Grid */}
            <View className="flex-1 pr-4 border-r border-black/40">
              {/* Row 1 of 2x2 grid */}
              <View className="flex-row">
                {/* Cell 1,1 - Icon, Sport Name and Creator */}
                <View className="w-[62.5%] justify-center border-r border-black/40 pr-4">
                  <View className="flex-row items-center">
                    <Ionicons name={getSportIcon(challenge.sport) as any} size={48} color="#ffffff" />
                    <View className="ml-2 flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-white text-base font-semibold flex-1" numberOfLines={1} ellipsizeMode="tail">
                          {sportName}
                        </Text>
                        <Text className="text-white text-xs ml-2 italic">{challenge.is_indoor ? 'INT' : 'EXT'}</Text>
                      </View>
                      <Text className="text-[#dfdfdf] text-sm" numberOfLines={1} ellipsizeMode="tail">{creatorName}</Text>
                    </View>
                  </View>
                </View>
                {/* Cell 1,2 - StartTime, EndTime and Date */}
                <View className="w-[32.5%] justify-center pl-4">
                  {formattedTimeRange && (
                    <Text className="text-white text-lg text-center">{formattedTimeRange}</Text>
                  )}
                  {formattedDate && (
                    <Text className="text-white text-xs text-center">{formattedDate}</Text>
                  )}
                </View>
              </View>
              
              {/* Black Separator Line */}
              <View className="w-[112%] bg-[#171616] absolute h-[1px] top-[62px] -translate-y-1/2 z-10 -left-5" />

              {/* Row 2 of 2x2 grid */}
              <View className="flex-row mt-6">
                {/* Cell 2,1 - Location */}
                <View className="w-[55%] border-r border-black/40 pr-4">
                  <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={16} color="#ffffff" />
                    <Text className="text-white text-sm ml-2 flex-1" numberOfLines={2} ellipsizeMode="tail">{challenge.location.address}</Text>
                  </View>
                </View>
                {/* Cell 2,2 - Comment */}
                <View className="w-[45%] justify-center pl-4">
                  {challenge.comment && (
                    <View className="flex-row items-start">
                      <Ionicons name="chatbubble-outline" size={16} color="#ffffff" />
                      <Text className="text-white text-sm ml-2 flex-1" numberOfLines={2} ellipsizeMode="tail">{challenge.comment}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Right: 1x2 Grid - Vertical Score Display */}
            <View className="w-[17.5%] relative self-stretch">
              {/* Score Column */}
              <View className="absolute -top-5 -bottom-3 left-0 right-0 flex-col">
                {/* Row 1 of 1x2 grid - Top Score */}
                <View className="flex-1 bg-[#272626] w-[115%] items-center justify-center -mr-3 rounded-tr-xl">
                  <Text className="text-white font-bold text-2xl">
                    {teamCount !== '?' 
                      ? (challenge.teams?.[0]?.users?.length || 0)
                      : challenge.team_size}
                  </Text>
                </View>

                {/* VS Text */}
                <View className="w-[100%] items-center justify-center absolute top-1/2 left-0 -translate-y-1/2 z-10">
                  {/* Black Separator Line */}
                  <View className="w-[140%] bg-[#161617] absolute h-[1px] z-10 left-0" />
                  <Text className="text-white font-black text-sm tracking-wider z-10 px-2 left-1">
                    VS
                  </Text>
                </View>

                {/* Row 2 of 1x2 grid - Bottom Score */}
                <View className="flex-1 bg-[#BD1A1A] w-[115%] items-center justify-center -mr-3 rounded-br-xl">
                    <Text className="text-white font-bold text-2xl">
                      {teamCount !== '?' 
                        ? (challenge.teams?.[1]?.users?.length || challenge.teams?.[0]?.users?.length || 0)
                        : challenge.team_size}
                    </Text>
                </View>
              </View>

              {/* Arrow Button - Positioned absolutely on the right, vertically centered */}
              <View className="absolute right-[-25px] top-[48%] -translate-y-1/2 z-20">
              <View className="relative">
                  <View className="absolute inset-0 bg-[#FFC033] rounded-full border-2 border-[#171616]" style={{ width: 32, height: 32, left: 2, top: 2 }} />
                  <Ionicons name="arrow-forward-circle-outline" size={36} color="#171616" />
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      ) : (
        /* Teams View */
        <Pressable 
          onPress={() => onPress?.(challenge.id)}
          className="bg-[#272626] rounded-xl p-3"
        >
          {/* 2x2 Grid (left) + 1x2 Grid (right) Layout */}
          <View className="mt-2 flex-row">
            {/* Left: 2x2 Grid */}
            <View className="flex-1 pr-4 border-r border-black/40">
              {/* Row 1 of 2x2 grid */}
              <View className="flex-row">
                {/* Cell 1,1 - Icon, Sport Name and Creator */}
                <View className="w-[50%] justify-center border-r border-black/40 pr-4">
                  <View className="flex-col">
                    {/* Team A */}
                    <View className="flex-row items-center">
                      <Text className="text-white text-base font-semibold flex-1" numberOfLines={1} ellipsizeMode="tail">
                        {challenge.teams?.[0]?.name ?? 'Team A'}
                      </Text>
                    </View>
                    {/* User list */}
                    <View className="flex-row items-center">
                      <Text className="text-white text-sm flex-1" numberOfLines={1} ellipsizeMode="tail">
                        {challenge.teams?.[0]?.users?.map((user) => user.first_name).join(', ')}
                      </Text>
                    </View>
                  </View>
                </View>
                {/* Cell 1,2 - Team B */}
                <View className="w-[50%] justify-center pl-4">
                  <View className="flex-col">
                    <View className="flex-row items-center">
                      <Text className="text-white text-base font-semibold flex-1" numberOfLines={1} ellipsizeMode="tail">
                        {challenge.teams?.[1]?.name ?? 'Team B'}
                      </Text>
                    </View>
                    {/* User list */}
                    <View className="flex-row items-center">
                      <Text className="text-white text-sm flex-1" numberOfLines={1} ellipsizeMode="tail">
                        {challenge.teams?.[1]?.users?.map((user) => user.first_name).join(', ')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Right: 1x2 Grid - Vertical Score Display */}
            <View className="w-[17.5%] relative self-stretch">
              {/* Score Column */}
              <View className="absolute -top-5 -bottom-3 left-0 right-0 flex-col">
                {/* Row 1 of 1x2 grid - Top Score */}
                <View className="flex-1 bg-[#272626] w-[115%] items-center justify-center -mr-3 rounded-tr-xl">
                  <Text className="text-white font-bold text-2xl">
                    {teamCount !== '?' 
                      ? (challenge.teams?.[0]?.users?.length || 0)
                      : challenge.team_size}
                  </Text>
                </View>

                {/* VS Text */}
                <View className="w-[100%] items-center justify-center absolute top-1/2 left-0 -translate-y-1/2 z-10">
                  {/* Black Separator Line */}
                  <View className="w-[140%] bg-[#161617] absolute h-[1px] z-10 left-0" />
                  <Text className="text-white font-black text-sm tracking-wider z-10 px-2 left-1">
                    VS
                  </Text>
                </View>

                {/* Row 2 of 1x2 grid - Bottom Score */}
                <View className="flex-1 bg-[#BD1A1A] w-[115%] items-center justify-center -mr-3 rounded-br-xl">
                    <Text className="text-white font-bold text-2xl">
                      {teamCount !== '?' 
                        ? (challenge.teams?.[1]?.users?.length || challenge.teams?.[0]?.users?.length || 0)
                        : challenge.team_size}
                    </Text>
                </View>
              </View>

              {/* Arrow Button - Positioned absolutely on the right, vertically centered */}
              <View className="absolute right-[-25px] top-[48%] -translate-y-1/2 z-20">
              <View className="relative">
                  <View className="absolute inset-0 bg-[#FFC033] rounded-full border-4 border-black" style={{ width: 32, height: 32, left: 2, top: 2 }} />
                  <Ionicons name="arrow-forward-circle-outline" size={36} color="#171616" />
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );
};

