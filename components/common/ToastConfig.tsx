import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../theme/colors';

/**
 * Custom toast configuration matching the app's dark theme
 */
export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View className="top-3 flex-row items-center px-4 py-3 rounded-xl min-h-[60px] w-[90%] bg-[#2c2c2c] border-l-4 border-[#016937] shadow-lg">
      <View className="w-9 h-9 rounded-full justify-center items-center mr-3 bg-[#016937]/20">
        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
      </View>
      <View className="flex-1">
        {text1 && (
          <Text className="text-[15px] font-semibold text-white mb-0.5">
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className="text-[13px] font-normal text-[#575757] leading-[18px]">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),

  error: ({ text1, text2 }: any) => (
    <View className="flex-row items-center px-4 py-3 rounded-xl min-h-[60px] w-[90%] bg-[#2c2c2c] border-l-4 border-[#943d40] shadow-lg">
      <View className="w-9 h-9 rounded-full justify-center items-center mr-3 bg-[#943d40]/20">
        <Ionicons name="close-circle" size={24} color={colors.error} />
      </View>
      <View className="flex-1">
        {text1 && (
          <Text className="text-[15px] font-semibold text-white mb-0.5">
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className="text-[13px] font-normal text-[#575757] leading-[18px]">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),

  info: ({ text1, text2 }: any) => (
    <View className="flex-row items-center px-4 py-3 rounded-xl min-h-[60px] w-[90%] bg-[#2c2c2c] border-l-4 border-[#273ba3] shadow-lg">
      <View className="w-9 h-9 rounded-full justify-center items-center mr-3 bg-[#273ba3]/20">
        <Ionicons name="information-circle" size={24} color={colors.info} />
      </View>
      <View className="flex-1">
        {text1 && (
          <Text className="text-[15px] font-semibold text-white mb-0.5">
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className="text-[13px] font-normal text-[#575757] leading-[18px]">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
};
