import { Pressable, ScrollView, Text, View } from 'react-native';

interface DateFilterProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const DateFilter = ({ selectedDate, onDateSelect }: DateFilterProps) => {
  // Generate dates: today + next 14 days
  const generateDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDateLabel = (date: Date): { day: number; label: string } => {
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const day = date.getDate();
    const month = date.toLocaleDateString('da-DK', { month: 'short' });
    const dayName = date.toLocaleDateString('da-DK', { weekday: 'short' }).toUpperCase();

    if (isToday) {
      return { day, label: `${day}. ${month} Idag` };
    } else {
      return { day, label: `${day}. ${dayName}` };
    }
  };

  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('da-DK', { weekday: 'short' }).toUpperCase();
  };

  const isDateSelected = (date: Date): boolean => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <View className="px-6 py-6 bg-[#1f1f1f]">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {dates.map((date, index) => {
            const isSelected = isDateSelected(date);
            const dateInfo = formatDateLabel(date);
            const dayName = getDayName(date);
            
            return (
              <Pressable
                key={index}
                onPress={() => onDateSelect(date)}
                className={`px-2 py-2 rounded-xl ${isSelected ? 'bg-[#4a4a4a]' : 'bg-[#262626]'} max-w-20 min-w-16`}
              >
                {isSelected ? (
                  <View className="rounded-xl items-center justify-center flex-1">
                    <Text
                      className={`text-sm font-medium text-center text-white`}
                    >
                      {dateInfo.label}
                    </Text>
                  </View>
                ) : (
                  <View className="rounded-xl items-center justify-center">
                    <Text
                      className={`text-xl font-medium text-center text-[#333333]`}
                    >
                      {dateInfo.day}.
                    </Text>
                    <Text
                      className={`text-sm font-medium text-center text-[#333333]`}
                    >
                      {dayName}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
