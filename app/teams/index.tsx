import { TabNavigation } from '@/components/common';
import { FriendsContent, TeamsContent } from '@/components/social';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type TabType = 'friends' | 'teams';

export default function SocialScreen() {
  const router = useRouter();
  const segments = useSegments();

  // Determine initial tab based on route
  const getInitialTab = useCallback((): TabType => {
    const path = segments.join('/');
    if (path.includes('friends')) {
      return 'friends';
    }
    return 'teams';
  }, [segments]);

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());

  // Update tab when route changes
  useEffect(() => {
    const newTab = getInitialTab();
    setActiveTab(newTab);
  }, [getInitialTab]);

  const handleTabChange = (key: string) => {
    const newTab = key as TabType;
    setActiveTab(newTab);
    // No navigation - just update state to avoid slide animation
  };

  const getTitle = () => {
    return activeTab === 'friends' ? 'Venner' : 'Hold';
  };

  return (
    <View className="flex-1 bg-[#171616]">
      {/* Header Section */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="chevron-back" size={28} color="#ffffff" />
            </Pressable>
            <Text className="text-white text-xl font-bold">{getTitle()}</Text>
          </View>
        </View>

        {/* Tabs */}
        <TabNavigation
          tabs={[
            { key: 'friends', label: 'Venner' },
            { key: 'teams', label: 'Hold' },
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </View>

      {/* Main Content Area */}
      {activeTab === 'friends' ? <FriendsContent /> : <TeamsContent />}
    </View>
  );
}
