import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MenuAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'default' | 'destructive';
}

interface ActionMenuProps {
  actions: MenuAction[];
  trigger?: React.ReactNode;
}

export const ActionMenu = ({ actions, trigger }: ActionMenuProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => setVisible(true)}>
        {trigger || (
          <View className="p-2">
            <Ionicons
              name="ellipsis-horizontal-circle"
              size={32}
              color="#3b82f6"
            />
          </View>
        )}
      </Pressable>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/60"
          onPress={() => setVisible(false)}
        >
          {/* Positioned for top-right context, but centered enough to look good */}
          <View className="absolute top-28 right-6 bg-[#1E1E1E] rounded-xl overflow-hidden min-w-[200px] shadow-lg border border-[#333]">
            {actions.map((action, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setVisible(false);
                  action.onPress();
                }}
                className={`p-4 active:bg-[#333] flex-row items-center gap-3 ${
                  index !== actions.length - 1 ? 'border-b border-[#333]' : ''
                }`}
              >
                <Ionicons
                  name={action.icon}
                  size={20}
                  color={action.variant === 'destructive' ? '#ef4444' : '#fff'}
                />
                <Text
                  className={`font-medium text-base ${
                    action.variant === 'destructive'
                      ? 'text-red-500'
                      : 'text-white'
                  }`}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
