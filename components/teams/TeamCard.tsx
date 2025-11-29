import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import type { Team } from '../../types/team';

interface TeamCardProps {
  team: Team;
  onPress: (teamId: number) => void;
}

export const TeamCard = ({ team, onPress }: TeamCardProps) => {
  return (
    <Pressable
      onPress={() => onPress(team.id)}
      className="flex-row items-center justify-between bg-surface rounded-2xl p-4 mb-3"
    >
      <View className="flex-row items-center gap-3">
        <View className="bg-green-600 rounded-xl p-3">
          <Ionicons name="shield" size={24} color="#ffffff" />
        </View>
        <View>
          <Text className="text-text text-base font-semibold">{team.name}</Text>
          <Text className="text-sm text-text-muted">
            Medlemmer: {team.users?.length ?? 0}
          </Text>
        </View>
      </View>
      <Text className="text-xs text-text-muted">Hold</Text>
    </Pressable>
  );
};
