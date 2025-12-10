import { Text, View } from 'react-native';
import type { Challenge } from '../../types/challenge';

export interface ViewProps {
  challenge: Challenge;
  joinedParticipants: number;
  totalParticipants: number;
}

export const ParticipantsView = ({
  challenge,
  joinedParticipants,
  totalParticipants,
}: ViewProps) => {
  // Calculate empty spots
  const emptySpots = totalParticipants - joinedParticipants;

  // Create list with participants and empty spots
  const participantList = [
    ...challenge.users?.map((user, index) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name || ''}`.trim(),
      isEmpty: false,
    })),
    ...Array.from({ length: Math.max(0, emptySpots) }, (_, index) => ({
      id: `empty-${index}`,
      name: 'Ledig plads',
      isEmpty: true,
    })),
  ];

  // Split into two columns
  const leftColumn = participantList.slice(
    0,
    Math.ceil(participantList.length / 2)
  );
  const rightColumn = participantList.slice(
    Math.ceil(participantList.length / 2)
  );

  return (
    <View className="flex-1 justify-center">
      <View className="flex-row">
        <View className="w-[62.5%] justify-center border-r border-black/40 pr-4">
          <View className="flex-col">
            {leftColumn.map((item) => (
              <View key={item.id} className="mb-1">
                <Text
                  className={`text-sm ${item.isEmpty ? 'text-gray-500' : 'text-white'}`}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View className="w-[32.5%] justify-center pl-4">
          <View className="flex-col">
            {rightColumn.map((item) => (
              <View key={item.id} className="mb-1">
                <Text
                  className={`text-sm ${item.isEmpty ? 'text-gray-500' : 'text-white'}`}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};
