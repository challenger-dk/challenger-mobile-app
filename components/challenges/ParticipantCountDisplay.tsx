import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export interface ParticipantCountDisplayProps {
  joinedParticipants: number;
  totalParticipants: number;
}

export const ParticipantCountDisplay = ({ joinedParticipants, totalParticipants }: ParticipantCountDisplayProps) => {
  const isOverCapacity = joinedParticipants > totalParticipants;
  const participationPercentage = totalParticipants > 0 ? Math.min(joinedParticipants / totalParticipants, 1) : 0;
  const topPercentage = isOverCapacity ? 100 : participationPercentage * 100;
  const bottomPercentage = isOverCapacity ? 0 : (1 - participationPercentage) * 100;

  return (
    <View className="w-[17.5%] relative self-stretch">
      <View className="absolute -top-5 -bottom-3 left-0 right-0 flex-col">
        <View 
          className={`w-[115%] -mr-3 rounded-tr-xl ${topPercentage === 100 ? 'rounded-br-xl' : ''}`}
          style={{ 
            backgroundColor: '#737373',
            flex: topPercentage / 100,
            minHeight: topPercentage > 0 ? 1 : 0
          }}
        />
        <View className="w-[100%] items-center justify-center absolute top-1/2 left-0 -translate-y-1/2 z-10">
          <View className="w-[140%] bg-[#161617] absolute h-[1px] z-10 left-0" />
          <Text className="text-text font-black text-sm tracking-wider z-10 px-2 left-1">/</Text>
        </View>
        <View 
          className={`w-[115%] -mr-3 rounded-br-xl ${bottomPercentage === 100 ? 'rounded-tr-xl' : ''}`}
          style={{ 
            backgroundColor: '#4d4d4d',
            flex: bottomPercentage / 100,
            minHeight: bottomPercentage > 0 ? 1 : 0
          }}
        />
        <View className="absolute top-[15%] left-2 right-0 items-center z-20">
          <Text className="text-text font-bold text-3xl">
            {joinedParticipants}
          </Text>
        </View>
        <View className="absolute bottom-[15%] left-2 right-0 items-center z-20">
          <Text className="text-text font-bold text-3xl">
            {totalParticipants}
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
  );
};

