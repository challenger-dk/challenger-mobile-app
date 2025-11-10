import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Clubs } from '../../components/home/Clubs';
import { Tournaments } from '../../components/home/Tournaments';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'turneringer' | 'klubber'>('turneringer');

  return (
    <View className="flex-1 bg-[#171616]">
      {/* Header Section */}
      <View className="flex-row items-center justify-between px-6 py-3">
        {/* "Home" title on the left */}
        <Text className="text-white text-lg font-medium">Home</Text>

        {/* Icons on the right */}
        <View className="flex-row items-center gap-4">
          {/* Bell icon */}
          <Pressable
            className="relative"
            aria-label="Notifications"
          >
            <Ionicons name="notifications" size={24} color="#ffffff" />
          </Pressable>

          {/* Calendar icon */}
          <Pressable
            className="relative"
            aria-label="Calendar"
          >
            <Ionicons name="calendar-outline" size={24} color="#ffffff" />
          </Pressable>

          {/* Settings icon */}
          <Pressable
            aria-label="Settings"
          >
            <Ionicons name="settings" size={24} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Navigation Tab Bar */}
      <View className="flex-row border-b border-[#272626]">
        <Pressable
          onPress={() => setActiveTab('turneringer')}
          className={`flex-1 py-3 ${activeTab === 'turneringer' ? '' : ''}`}
        >
          <Text className={`text-white text-center ${activeTab === 'turneringer' ? 'font-medium' : ''}`}>
            Turneringer
          </Text>
          {activeTab === 'turneringer' && (
            <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('klubber')}
          className={`flex-1 py-3 ${activeTab === 'klubber' ? '' : ''}`}
        >
          <Text className={`text-white text-center ${activeTab === 'klubber' ? 'font-medium' : ''}`}>
            Klubber
          </Text>
          {activeTab === 'klubber' && (
            <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
        </Pressable>
      </View>

      {/* Main Content Area */}
      <ScrollView className="flex-1">
        <View className="p-6">
          {activeTab === 'turneringer' ? <Tournaments /> : <Clubs />}
        </View>
      </ScrollView>
    </View>
  );
}
