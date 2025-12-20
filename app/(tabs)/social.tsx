import {
  ScreenContainer,
  TabNavigation,
  TopActionBar,
} from '@/components/common';
import { FriendsContent, TeamsContent } from '@/components/social';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { CreateNewButton } from '@/components/common/CreateNewButton';

type TabType = 'friends' | 'teams';

export default function SocialScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('friends');

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabType);
  };

  return (
    <ScreenContainer className="pt-5">
      <TopActionBar
        title="Social"
        leftAction={<View className="w-7 h-7" />}
        showNotifications={true}
				showMessages={true}
        showSettings={false}
      />

      <TabNavigation
        tabs={[
          { key: 'friends', label: 'Venner' },
          { key: 'teams', label: 'Hold' },
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content Area */}
      {activeTab === 'friends' ? <FriendsContent /> : <TeamsContent />}

      {/* Floating Action Button - Only show on teams tab */}
      {activeTab === 'teams' && (
        <CreateNewButton
          onPress={() => router.push('/teams/createTeam')}
        />
      )}
    </ScreenContainer>
  );	
}
