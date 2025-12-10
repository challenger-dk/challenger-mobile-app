import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  ErrorScreen,
  LoadingScreen,
  ScreenContainer,
  TopActionBar,
} from "@/components/common";
import { deleteEmergencyContact } from "@/api/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { EmergencyContact } from "@/types/user";

export default function EmergencyContactsListScreen() {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();

  // Local state so we can update the list after delete without refetch
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [search, setSearch] = useState("");

  // Sync with currentUser when it changes
  useEffect(() => {
    if (!loading && !error && user) {
      setContacts(user.emergency_contacts ?? []);
    }
  }, [loading, error, user]);

  const handleDelete = (contact: EmergencyContact) => {
    Alert.alert(
      "Fjern kontakt",
      `Er du sikker på, at du vil fjerne ${contact.name}?`,
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Fjern",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEmergencyContact(contact.id as number);
              setContacts((prev) =>
                prev.filter((c) => c.id !== contact.id)
              );
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

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Search + plus button row */}
      <View className="px-6 mt-2 mb-3 flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center bg-[#1C1C1E] rounded-2xl px-3 py-2">
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            className="ml-2 flex-1 text-white text-sm"
            placeholder="Navn"
            placeholderTextColor="#6B7280"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Pressable
          onPress={() => router.push("/profile/emergencyContacts/new" as any)}
          className="w-9 h-9 rounded-2xl bg-[#943d40] items-center justify-center"
        >
          <Ionicons name="add" size={20} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 32,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((contact) => (
          <Pressable
            key={contact.id}
            onPress={() =>
              router.push(
                `/profile/emergencyContacts/${contact.id}` as any
              )
            }
            className="bg-[#1C1C1E] rounded-2xl px-4 py-3 mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-[#2C2C2E] items-center justify-center">
                <Ionicons name="person" size={20} color="#ffffff" />
              </View>

              <View className="flex-1">
                <Text className="text-white font-semibold" numberOfLines={1}>
                  {contact.name}
                </Text>
                {!!contact.relationship && (
                  <Text className="text-gray-400 text-sm">
                    {contact.relationship}
                  </Text>
                )}
                {!!contact.phone_number && (
                  <Text className="text-gray-300 text-sm mt-0.5">
                    {contact.phone_number}
                  </Text>
                )}
              </View>
            </View>

            <Pressable
              onPress={() => handleDelete(contact)}
              className="px-3 py-1 rounded-full bg-[#3A3A3C]"
            >
              <Text className="text-xs text-gray-300">Fjern</Text>
            </Pressable>
          </Pressable>
        ))}

        {filtered.length === 0 && (
          <View className="mt-6 items-center">
            <Text className="text-gray-400 text-sm">
              Ingen nød-kontakter endnu.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
