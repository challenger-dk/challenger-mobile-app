// app/profile/emergencyContacts/[id].tsx
import React, { useEffect, useState } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";

import {
  ErrorScreen,
  LoadingScreen,
  ScreenContainer,
  ScreenHeader,
} from "@/components/common";
import {
  updateEmergencyContact,
  deleteEmergencyContact,
} from "@/api/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { EmergencyContact } from "@/types/user";

export default function EmergencyContactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user, loading, error } = useCurrentUser();

  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // When user data (or id) changes, find the contact and populate form state
  useEffect(() => {
    if (loading || error || !user || !id) return;

    const found =
      user.emergency_contacts?.find(
        (c: EmergencyContact) => String(c.id) === String(id)
      ) ?? null;

    if (!found) {
      setNotFound(true);
      setContact(null);
      return;
    }

    setNotFound(false);
    setContact(found);
    setName(found.name || "");
    setRelationship(found.relationship || "");
    setPhone(found.phone_number || "");
  }, [loading, error, user, id]);

  const handleSave = async () => {
    if (!id || !contact) return;

    if (!name.trim() || !phone.trim()) {
      Alert.alert("Manglende info", "Navn og telefonnummer er påkrævet.");
      return;
    }

    setSaving(true);
    try {
      await updateEmergencyContact(id, {
        ...contact,
        name: name.trim(),
        relationship: relationship.trim(),
        phone_number: phone.trim(),
      } as EmergencyContact);

      Alert.alert("Gemt", "Kontakt er opdateret.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Fejl", "Kunne ikke opdatere kontakt.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      "Fjern kontakt",
      `Er du sikker på, at du vil fjerne ${name || "denne kontakt"}?`,
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Fjern",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEmergencyContact(id);
              router.back();
            } catch {
              Alert.alert("Fejl", "Kunne ikke fjerne kontakt.");
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  if (notFound || !contact) {
    return (
      <ScreenContainer>
        <TopActionBar
          title="Nødinfo"
          leftAction={
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-[#1C1C1E] items-center justify-center"
            >
              <Ionicons name="chevron-back" size={20} color="#ffffff" />
            </Pressable>
          }
          showNotifications={false}
          showCalendar={false}
          showSettings={false}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-300 text-center">
            Kontakt blev ikke fundet.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

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

          {/* Fjern + Gem row */}
          <View className="flex-row justify-between items-center mb-6">
            <Pressable
              onPress={handleDelete}
              className="px-4 py-2 rounded-full bg-[#3A3A3C]"
            >
              <Text className="text-sm text-gray-200">Fjern</Text>
            </Pressable>

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
