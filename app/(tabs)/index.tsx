import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { TabNavigation, TopActionBar } from '../../components/common';
import { Clubs } from '../../components/home/Clubs';
import { Tournaments } from '../../components/home/Tournaments';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'turneringer' | 'klubber'>('turneringer');

  return (
    <View className="flex-1 bg-[#171616]">
      {/* Header Section */}
      <TopActionBar
        title="Home"
        settingsRoute="/profile/settings"
      />

      {/* Navigation Tab Bar */}
      <TabNavigation
        tabs={[
          { key: 'turneringer', label: 'Turneringer' },
          { key: 'klubber', label: 'Klubber' },
        ]}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as 'turneringer' | 'klubber')}
      />

      {/* Main Content Area */}
      <ScrollView className="flex-1">
        <View className="p-6">
          {activeTab === 'turneringer' ? <Tournaments /> : <Clubs />}
        </View>
      </ScrollView>
    </View>
  );
}
