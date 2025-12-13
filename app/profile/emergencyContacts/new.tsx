import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ScreenContainer, ScreenHeader } from "@/components/common";
import { createEmergencyContact } from "@/api/users";
import type { EmergencyContact } from "@/types/user";

export default function NewEmergencyContactScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Manglende info", "Navn og telefonnummer er påkrævet.");
      return;
    }

    setSaving(true);
    try {
      const payload: EmergencyContact = {
        name: name.trim(),
        relationship: relationship.trim(),
        phone_number: phone.trim(),
      } as EmergencyContact;

      await createEmergencyContact(payload);
      Alert.alert("Gemt", "Nød-kontakt er oprettet.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch {
      Alert.alert("Fejl", "Kunne ikke oprette kontakt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer safeArea edges={['top', 'left', 'right', 'bottom']}>
      <View className="px-6 flex-1">
        <ScreenHeader title="Nødinfo" />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 32,
            }}
            keyboardShouldPersistTaps="handled"
          >
          {/* Avatar */}
          <View className="items-center mb-8">
            <View className="w-28 h-28 rounded-full bg-[#2C2C2E] items-center justify-center">
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
          </View>

          {/* Top-right Gem button */}
          <View className="flex-row justify-end mb-6">
            <Pressable
              onPress={handleSave}
              disabled={saving}
              className={`px-5 py-2 rounded-full ${
                saving ? "bg-[#943d40]/60" : "bg-[#943d40]"
              }`}
            >
              <Text className="text-sm text-white">
                {saving ? "Gemmer..." : "Gem"}
              </Text>
            </Pressable>
          </View>

          {/* Form fields */}
          <View className="gap-4">
            <View>
              <Text className="text-xs text-gray-400 mb-1">Navn</Text>
              <View className="bg-[#1C1C1E] rounded-2xl px-3 py-2">
                <TextInput
                  className="text-white text-sm"
                  placeholder="Navn"
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View>
              <Text className="text-xs text-gray-400 mb-1">Relation</Text>
              <View className="bg-[#1C1C1E] rounded-2xl px-3 py-2">
                <TextInput
                  className="text-white text-sm"
                  placeholder="Mor/Far/Bror"
                  placeholderTextColor="#6B7280"
                  value={relationship}
                  onChangeText={setRelationship}
                />
              </View>
            </View>

            <View>
              <Text className="text-xs text-gray-400 mb-1">Telefonnummer</Text>
              <View className="bg-[#1C1C1E] rounded-2xl px-3 py-2">
                <TextInput
                  className="text-white text-sm"
                  placeholder="+45"
                  placeholderTextColor="#6B7280"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
