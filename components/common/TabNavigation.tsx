import { Pressable, Text, View } from 'react-native';

interface Tab {
  key: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
}

export const TabNavigation = ({ tabs, activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <View className="flex-row border-b border-[#272626]">
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          className="flex-1 py-3"
        >
          <Text className={`text-white text-center ${activeTab === tab.key ? 'font-medium' : ''}`}>
            {tab.label}
          </Text>
          {activeTab === tab.key && (
            <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
        </Pressable>
      ))}
    </View>
  );
};

