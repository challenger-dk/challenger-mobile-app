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
  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };
  
  const formattedTime = challenge.start_time && challenge.end_time
    ? `Kl.${formatTime(challenge.start_time)}-${formatTime(challenge.end_time)}`
    : challenge.start_time
    ? `Kl.${formatTime(challenge.start_time)}`
    : '';

  return (
    <View className="bg-[#272626] rounded-lg mb-4 p-4">
      {/* Status and Tab Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-white text-xs font-medium">Open</Text>
          <Text className="text-[#575757] text-xs">Deltagere</Text>
        </View>
        {teamCount !== '?' && (
          <View className="flex-row">
            <Pressable
              onPress={() => setActiveTab('info')}
              className="px-3 pb-2"
            >
              <Text className={`text-xs ${activeTab === 'info' ? 'text-white font-medium' : 'text-[#575757]'}`}>
                Oplysninger
              </Text>
              {activeTab === 'info' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('teams')}
              className="px-3 pb-2"
            >
              <Text className={`text-xs ${activeTab === 'teams' ? 'text-white font-medium' : 'text-[#575757]'}`}>
                Teams
              </Text>
              {activeTab === 'teams' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </Pressable>
          </View>
        )}
      </View>

      {activeTab === 'info' ? (
        <>
          {/* Top Row: Sport/Creator on left, Score on right */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              {/* Sport Icon and Name */}
              <View className="flex-row items-center mb-2">
                <Ionicons name={getSportIcon(challenge.sport) as any} size={20} color="#ffffff" />
                <Text className="text-white text-base font-semibold ml-2">
                  {sportName} {challenge.name.includes('EXT') ? 'EXT' : challenge.name.includes('INT') ? 'INT' : ''}
                </Text>
              </View>
              {/* Creator Name */}
              <Text className="text-[#dfdfdf] text-sm">{creatorName}</Text>
            </View>
            
            {/* Score/Participant Display on Right */}
            <View className="flex-row items-center gap-2">
              {teamCount !== '?' ? (
                <>
                  <View className="bg-white rounded px-4 py-2">
                    <Text className="text-[#171616] font-bold text-2xl">
                      {challenge.teams?.[0]?.users?.length || 0}
                    </Text>
                  </View>
                  <Text className="text-white font-bold text-lg">VS</Text>
                  <View className="bg-[#943d40] rounded px-4 py-2">
                    <Text className="text-white font-bold text-2xl">
                      {challenge.teams?.[1]?.users?.length || challenge.teams?.[0]?.users?.length || 0}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View className="bg-white rounded px-4 py-2">
                    <Text className="text-[#171616] font-bold text-2xl">{challenge.team_size}</Text>
                  </View>
                  <Text className="text-white font-bold text-lg">VS</Text>
                  <View className="bg-[#943d40] rounded px-4 py-2">
                    <Text className="text-white font-bold text-2xl">{challenge.team_size}</Text>
                  </View>
                </>
              )}
              <Ionicons name="arrow-forward-circle" size={28} color="#fbb03c" />
            </View>
          </View>

          {/* Location */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={16} color="#ffffff" />
            <Text className="text-white text-sm ml-2">{challenge.location.address}</Text>
          </View>

          {/* Date and Time */}
          {formattedTime && (
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar-outline" size={16} color="#ffffff" />
              <Text className="text-white text-sm ml-2">{formattedTime}</Text>
              <Text className="text-white text-sm ml-2">{formattedDate}</Text>
            </View>
          )}

          {/* Comment if exists */}
          {challenge.comment && (
            <View className="flex-row items-start">
              <Ionicons name="chatbubble-outline" size={16} color="#ffffff" />
              <Text className="text-white text-sm ml-2 flex-1">{challenge.comment}</Text>
            </View>
          )}
        </>
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

