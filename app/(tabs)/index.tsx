import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  ScreenContainer,
  TabNavigation,
  TopActionBar,
} from '../../components/common';
import { Clubs } from '../../components/home/Clubs';
import { Tournaments } from '../../components/home/Tournaments';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'turneringer' | 'klubber'>(
    'turneringer'
  );

  return (
    <ScreenContainer className="pt-1">
      {/* Header Section */}
      <TopActionBar
        title="Home"
        leftAction={<View className="w-7 h-7" />}
        showMessages={true}
        showSettings={false}
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
    </ScreenContainer>
  );
}
