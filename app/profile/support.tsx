import { ScreenContainer, ScreenHeader, SubmitButton } from '@/components/common';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

type SupportType = 'BUG' | 'CONTACT' | 'OTHER';

const TypeSelector = ({
                        selected,
                        onSelect,
                      }: {
  selected: SupportType;
  onSelect: (t: SupportType) => void;
}) => {
  const types: { label: string; value: SupportType }[] = [
    { label: 'Fejl', value: 'BUG' },
    { label: 'Kontakt', value: 'CONTACT' },
    { label: 'Andet', value: 'OTHER' },
  ];

  return (
    <View className="flex-row gap-2 mb-6">
      {types.map((type) => (
        <Pressable
          key={type.value}
          onPress={() => onSelect(type.value)}
          className={`flex-1 py-3 rounded-lg items-center justify-center ${
            selected === type.value ? 'bg-[#943d40]' : 'bg-[#2c2c2c]'
          }`}
        >
          <Text
            className={`font-semibold ${
              selected === type.value ? 'text-white' : 'text-[#9CA3AF]'
            }`}
          >
            {type.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export default function SupportScreen() {
  const router = useRouter();
  const [type, setType] = useState<SupportType>('BUG');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Fejl', 'Udfyld venligst alle felter');
      return;
    }

    const email = 'support@challenger.dk';
    // Pre-pend the type to the subject line for easier filtering in your inbox
    const emailSubject = encodeURIComponent(`[${type}] ${subject}`);
    const emailBody = encodeURIComponent(message);
    const url = `mailto:${email}?subject=${emailSubject}&body=${emailBody}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Fejl',
          'Kunne ikke åbne din email-app. Du kan skrive manuelt til support@challenger.dk'
        );
      }
    } catch (error) {
      Alert.alert('Fejl', 'Der skete en fejl ved åbning af email-programmet.');
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Support" />
      <ScrollView className="flex-1 px-6 pt-4" keyboardShouldPersistTaps="handled">
        <Text className="text-white text-base mb-2 font-medium">Hvad drejer det sig om?</Text>
        <TypeSelector selected={type} onSelect={setType} />

        <Text className="text-white text-base mb-2 font-medium">Emne</Text>
        <View className="bg-[#2c2c2c] rounded-lg p-4 mb-6">
          <TextInput
            className="text-white text-base"
            placeholder="Kort overskrift..."
            placeholderTextColor="#6B7280"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <Text className="text-white text-base mb-2 font-medium">Besked</Text>
        <View className="bg-[#2c2c2c] rounded-lg p-4 mb-8 min-h-[150px]">
          <TextInput
            className="text-white text-base flex-1"
            placeholder="Beskriv problemet eller din henvendelse her..."
            placeholderTextColor="#6B7280"
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <SubmitButton
          label="Åben Email"
          onPress={handleSend}
        />
        <View className="h-10" />
      </ScrollView>
    </ScreenContainer>
  );
}
