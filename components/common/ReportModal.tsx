import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { createReport, ReportTargetType } from '@/api/reports';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetId: number;
  targetType: ReportTargetType;
}

export const ReportModal = ({ visible, onClose, targetId, targetType }: ReportModalProps) => {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      showErrorToast('Please provide a reason');
      return;
    }

    try {
      setLoading(true);
      await createReport({
        target_id: targetId,
        target_type: targetType,
        reason: reason,
        comment: comment,
      });
      showSuccessToast('Report submitted successfully');
      setReason('');
      setComment('');
      onClose();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center items-center px-4">
        <View className="bg-[#1E1E1E] w-full rounded-xl p-5 border border-[#333]">
          <Text className="text-white text-lg font-bold mb-4">Report {targetType.toLowerCase()}</Text>

          <Text className="text-gray-400 text-sm mb-2">Reason (Required)</Text>
          <TextInput
            className="bg-[#2c2c2c] text-white p-3 rounded-lg mb-4"
            placeholder="e.g. Harassment, Spam, Inappropriate content"
            placeholderTextColor="#666"
            value={reason}
            onChangeText={setReason}
          />

          <Text className="text-gray-400 text-sm mb-2">Additional Details (Optional)</Text>
          <TextInput
            className="bg-[#2c2c2c] text-white p-3 rounded-lg mb-6 min-h-[80px]"
            placeholder="Describe what happened..."
            placeholderTextColor="#666"
            multiline
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />

          <View className="flex-row gap-3">
            <Pressable className="flex-1 bg-[#333] p-3 rounded-lg items-center" onPress={onClose}>
              <Text className="text-white font-medium">Cancel</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-red-600 p-3 rounded-lg items-center"
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold">Submit Report</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
