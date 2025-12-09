// ProfileScreen.tsx

import {
  Avatar,
  ErrorScreen,
  LoadingScreen,
  ScreenContainer,
  TopActionBar,
} from "@/components/common";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import type { Challenge } from "@/types/challenge";
import { SportIcon } from "@/utils/sportIcons";
import { FriendsContent} from "@/components/social";

const SEPARATOR_COLOR = "bg-[#3A3A3C]";

// Small helpers
const StatItem = ({
                    label,
                    value,
                  }: {
  label: string;
  value: number | string;
}) => (
  <View className="items-center justify-center">
    <Text
      className="text-[11px] uppercase tracking-[1px] text-gray-400"
      numberOfLines={1}
    >
      {label}
    </Text>
    <Text className="text-2xl font-semibold text-white mt-1">
      {value}
    </Text>
  </View>
);

const InterestIcons = ({ sports }: { sports?: { name: string }[] }) => {
  if (!sports || sports.length === 0) return null;

  const visible = sports.slice(0, 4);

  return (
    <View className="mt-2">
      <View className="flex-row items-center">
        {/* Left separator */}
        <View className={`w-[1px] h-12 ${SEPARATOR_COLOR} mr-3`} />

        {/* Label + icons */}
        <View className="flex-row items-center gap-3 flex-shrink">
          <Text className="text-xs uppercase tracking-[1px] text-gray-400">
            Interesser
          </Text>

          {visible.map((s, idx) => (
            <View
              key={`${s.name}-${idx}`}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <SportIcon sport={s.name} size={22} color="#ffffff" />
            </View>
          ))}
        </View>

        {/* Right separator */}
        <View className={`w-[1px] h-12 ${SEPARATOR_COLOR} ml-3`} />
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const { user, loading, error } = useCurrentUser();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<"vs" | "home" | "stats">("vs");

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!user) return <LoadingScreen />;

  const friendsCount = user.friends?.length || 0;
  const completedChallenges = user.completed_challenges ?? 0;
  const teamsCount = 0; // TODO: plug in real value when available
  const nextChallenges: Challenge[] = user.next_challenges ?? [];

  const handleParticipate = (challengeId: number) => {
    router.push(`/hub/${challengeId}` as any);
  };

  const handleChallengePress = (challengeId: number) => {
    router.push(`/hub/${challengeId}` as any);
  };

  // underline indicator sizing (3 equal tabs)
  const tabCount = 3;
  const indicatorWidth = width / tabCount;
  const activeIndex = activeTab === "vs" ? 0 : activeTab === "home" ? 1 : 2;

  return (
    <ScreenContainer>
      <TopActionBar
        title="Profil"
        leftAction={
          <Pressable
            onPress={() => router.push("/profile/information" as any)}
            className="flex-row items-center bg-surface px-3 py-1.5 rounded-full gap-2"
          >
            <Text className="text-white text-sm font-medium">
              Rediger profil
            </Text>
          </Pressable>
        }
        settingsRoute="/profile/settings"
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="border-t border-[#272626]" />

        {/* Header + stats + interests – shared px-6 */}
        <View className="px-6 pt-4">
          {/* Header card */}
          <View className="rounded-2xl px-5 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4 flex-1">
              <Avatar
                uri={user.profile_picture}
                size={80}
                placeholderIcon="person"
                className="bg-black/30"
              />
              <View className="flex-1">
                <Text className="text-white text-xl font-semibold">
                  {user.first_name} {user.last_name}
                </Text>
                <Text className="text-sm text-gray-300 mt-1">
                  {user.age ? `${user.age} år` : ""}
                </Text>
              </View>
            </View>

            {/* Nødinfo */}
            <Pressable
              className="items-center"
              onPress={() => router.push("/profile/emergency-info" as any)}
            >
              <View className="w-9 h-9 rounded-xl bg-[#943d40]/12 border border-[#943d40]/25 items-center justify-center mb-1">
                <View className="w-6 h-6 rounded-full bg-[#943d40] items-center justify-center">
                  <Ionicons name="add" size={14} color="#ffffff" />
                </View>
              </View>
              <Text className="text-[11px] text-gray-200">Nødinfo</Text>
            </Pressable>
          </View>

          {/* Stats + Interests */}
          <View className="mt-3 rounded-2xl px-5 py-3">
            {/* Stats row: 1 / 1 / 3 layout */}
            <View className="flex-row items-center mb-3">
              {/* Left separator */}
              <View className={`w-[1px] h-12 ${SEPARATOR_COLOR}`} />

              {/* Venner */}
              <View style={{ flex: 1 }} className="items-center justify-center px-2">
                <StatItem label="Venner" value={friendsCount} />
              </View>

              {/* Separator */}
              <View className={`w-[1px] h-12 ${SEPARATOR_COLOR}`} />

              {/* Hold */}
              <View style={{ flex: 1 }} className="items-center justify-center px-2">
                <StatItem label="Hold" value={teamsCount} />
              </View>

              {/* Separator */}
              <View className={`w-[1px] h-12 ${SEPARATOR_COLOR}`} />

              {/* Fuldførte Challenges */}
              <View style={{ flex: 3 }} className="items-center justify-center px-1">
                <Text
                  className="text-[11px] uppercase tracking-[1px] text-gray-400"
                  numberOfLines={1}
                >
                  Fuldførte Challenges
                </Text>
                <Text className="text-2xl font-semibold text-white mt-1">
                  {completedChallenges}
                </Text>
              </View>

              {/* Right separator */}
              <View className={`w-[1px] h-12 ${SEPARATOR_COLOR}`} />
            </View>

            {/* Interests */}
            <InterestIcons sports={user.favorite_sports} />
          </View>
        </View>

        {/* Tabs row – same px-6 */}
        <View className="px-6 mt-4">
          <View className="flex-row w-full">
            {/* VS tab */}
            <Pressable
              onPress={() => setActiveTab("vs")}
              className="flex-1 items-center"
            >
              <View
                className={`px-4 py-1.5 rounded-full border ${
                  activeTab === "vs"
                    ? "border-white bg-white/10"
                    : "border-transparent bg-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    activeTab === "vs" ? "text-white" : "text-gray-400"
                  }`}
                >
                  VS
                </Text>
              </View>
            </Pressable>

            {/* Home tab */}
            <Pressable
              onPress={() => setActiveTab("home")}
              className="flex-1 items-center"
            >
              <View
                className={`px-4 py-1.5 rounded-full border ${
                  activeTab === "home"
                    ? "border-white bg-white/10"
                    : "border-transparent bg-transparent"
                }`}
              >
                <Ionicons
                  name="home"
                  size={16}
                  color={activeTab === "home" ? "#ffffff" : "#9CA3AF"}
                />
              </View>
            </Pressable>

            {/* Stats tab */}
            <Pressable
              onPress={() => setActiveTab("stats")}
              className="flex-1 items-center"
            >
              <View
                className={`px-4 py-1.5 rounded-full border ${
                  activeTab === "stats"
                    ? "border-white bg-white/10"
                    : "border-transparent bg-transparent"
                }`}
              >
                <Ionicons
                  name="stats-chart"
                  size={16}
                  color={activeTab === "stats" ? "#ffffff" : "#9CA3AF"}
                />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Full-width baseline with active highlight (no px-6 so it spans edge-to-edge) */}
        <View className="mt-3 h-[1px] bg-gray-700 w-full relative">
          <View
            className="absolute h-[2px] bg-white"
            style={{
              width: indicatorWidth,
              left: indicatorWidth * activeIndex,
              top: -0.5,
            }}
          />
        </View>

        {/* Tab content – inside px-6 so it aligns with header/stats/tabs */}
        <View className="px-6 mt-4">
          {activeTab === "vs" && (
            <>
              <Text className="text-white text-lg font-semibold mb-2">
                Næste Challenges
              </Text>

              {nextChallenges.length > 0 ? (
                nextChallenges.map((ch) => (
                  <View key={ch.id} className="mb-4">
                    <ChallengeCard
                      challenge={ch}
                      type="open"
                      onParticipate={handleParticipate}
                      onPress={handleChallengePress}
                    />
                  </View>
                ))
              ) : (
                <View className="bg-surface rounded-2xl p-4 mt-3">
                  <Text className="text-sm text-gray-300">
                    Du har ingen kommende challenges endnu.
                  </Text>
                </View>
              )}
            </>
          )}

          {activeTab === "home" && (
            <View className="mt-3">
              <FriendsContent />
            </View>
          )}

          {activeTab === "stats" && (
            <View className="bg-surface rounded-2xl p-4 mt-3">
              <Text className="text-sm text-gray-300">
                Statistik-sektionen kommer snart.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
