import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Challenge } from '../../types/challenge';
import { InfoView } from './InfoView';
import { OpenView } from './OpenView';
import { ParticipantCountDisplay } from './ParticipantCountDisplay';
import { ParticipantsView } from './ParticipantsView';
import { TeamsView } from './TeamsView';

export interface ChallengeCardProps {
  challenge: Challenge;
  onPress?: (challengeId: number) => void;
  type: 'open' | 'closed';
}

export const ChallengeCard = ({ challenge, onPress, type }: ChallengeCardProps) => {
  // Calculate joined participants (sum of all users in all teams);
  const joinedParticipants = challenge.users?.length || 0;
  
  // Calculate total possible participants (team_size * number_of_teams)
  const totalParticipants = challenge.team_size * (challenge.teams?.length || 2);

  // Determine tabs and active tab state based on type
  const isOpen = type === 'open';
  const [activeTab, setActiveTab] = useState<'open' | 'participants' | 'info' | 'teams'>(
    isOpen ? 'open' : 'info'
  );

  const tabs = isOpen
    ? [
        { key: 'open' as const, label: 'Åben' },
        { key: 'participants' as const, label: 'Deltagere' },
      ]
    : [
        { key: 'info' as const, label: 'Oplysninger' },
        { key: 'teams' as const, label: 'Hold' },
      ];

  const viewProps = {
    challenge,
    joinedParticipants,
    totalParticipants,
  };

  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between top-4 z-10">
        <View className="flex-row items-center gap-1">
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className="bg-surface rounded-xl p-2"
            >
              <Text className={`text-xs font-medium ${activeTab === tab.key ? 'text-white' : 'text-gray-500'}`}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable onPress={() => onPress?.(challenge.id)} className="bg-surface rounded-xl p-3 max-w-[370px]" style={{ height: 136 }}>
        <View className="mt-2 flex-row flex-1">
          <View className="flex-1 pr-4 border-r border-black/40 self-stretch">
            {activeTab === 'open' && (
              <OpenView {...viewProps} />
            )}
            {activeTab === 'participants' && (
              <ParticipantsView {...viewProps} />
            )}
            {activeTab === 'info' && (
              <InfoView {...viewProps} />
            )}
            {activeTab === 'teams' && (
              <TeamsView {...viewProps} />
            )}
          </View>

          <ParticipantCountDisplay
            joinedParticipants={joinedParticipants}
            totalParticipants={totalParticipants}
          />
        </View>
      </Pressable>
    </View>
  );
};
