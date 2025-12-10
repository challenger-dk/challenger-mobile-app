import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { SPORTS_TRANSLATION_EN_TO_DK } from '../../types/sports';
import { BooleanToggle, FormFieldButton } from '../common';

interface FilterMenuProps {
  visible: boolean;
  onClose: () => void;
  onResetFilters: () => void;
}

export const FilterMenu = ({
  visible,
  onClose,
  onResetFilters,
}: FilterMenuProps) => {
  // Filter state
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [endTime, setEndTime] = useState<Date>(
    new Date(new Date().setHours(23, 30, 0, 0))
  );
  const [isIndoor, setIsIndoor] = useState<boolean | null>(null);
  const [hasCosts, setHasCosts] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isTeamChallenge, setIsTeamChallenge] = useState<boolean>(true);
  const [showSportChips, setShowSportChips] = useState(false);
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Animation values for filter menu
  const screenHeight = useMemo(() => Dimensions.get('window').height, []);
  const filterMenuTranslateY = useSharedValue(screenHeight);
  const filterMenuOpacity = useSharedValue(0);

  // Handle filter menu visibility changes
  useEffect(() => {
    if (visible) {
      filterMenuTranslateY.value = withSpring(0);
      filterMenuOpacity.value = withSpring(1);
    } else {
      filterMenuTranslateY.value = withSpring(screenHeight);
      filterMenuOpacity.value = withSpring(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, screenHeight]);

  // Helper function to format time as HH.mm
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}.${minutes}`;
  };

  // Get sport options from translation map (English keys)
  const sportKeys = Object.keys(SPORTS_TRANSLATION_EN_TO_DK).sort();

  // Toggle sport selection
  const toggleSport = (sportKey: string) => {
    setSelectedSports((prev) => {
      const newSelection = prev.includes(sportKey)
        ? prev.filter((s) => s !== sportKey)
        : [...prev, sportKey];
      // Close chips view when a sport is selected (but keep it open if deselecting)
      if (!prev.includes(sportKey) && newSelection.length > 0) {
        setShowSportChips(false);
      }
      // Close chips view if all sports are deselected
      if (newSelection.length === 0) {
        setShowSportChips(false);
      }
      return newSelection;
    });
  };

  // Area options (placeholder - can be expanded later)
  const areaOptions = ['København', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg'];

  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-20 flex items-center top-36">
      {/* Backdrop */}
      <Animated.View className="absolute inset-0 z-10" pointerEvents="box-none">
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      {/* Filter Menu Sheet */}
      <Animated.View
        className="w-[93%] bg-[#1E1E1E] rounded-3xl max-h-[85%] z-30"
        pointerEvents="auto"
      >
        <View className="absolute -top-7 right-0 w-11 h-12 bg-[#1E1E1E]">
          <Svg
            width={28}
            height={28}
            style={{ position: 'absolute', right: 38, bottom: 17 }}
          >
            <Path d="M0 28 Q28 28 28 0 L28 28 Z" fill="#1E1E1E" />
          </Svg>
        </View>
        <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-white text-xl font-bold">
                Filtrering af
              </Text>
              <Text className="text-gray-400 text-xl font-bold">
                Challenges
              </Text>
            </View>
            <Pressable onPress={onResetFilters} className="p-1">
              <Ionicons name="refresh" size={24} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Filter Options */}
          <View className="gap-4 mb-6">
            {/* Sport */}
            <View>
              <View className="flex-row items-center justify-between gap-10">
                <Text className="text-white text-base">Sport</Text>
                {selectedSports.length === 0 && !showSportChips ? (
                  <Pressable
                    onPress={() => setShowSportChips(true)}
                    className="bg-[#575757] px-4 py-2 rounded-full"
                  >
                    <Text className="text-white text-sm">Vælg sportsgrene</Text>
                  </Pressable>
                ) : (
                  <View className="flex-row items-center gap-2 flex-1">
                    <Pressable
                      onPress={() => setShowSportChips((prev) => !prev)}
                      className="px-4 py-2 rounded-full max-w-10 max-h-10 bg-[#575757]"
                    >
                      <Text className="text-sm font-medium text-white">+</Text>
                    </Pressable>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="flex-1"
                      contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
                    >
                      {selectedSports.map((sportKey) => (
                        <Pressable
                          key={sportKey}
                          onPress={() => toggleSport(sportKey)}
                          className="px-4 py-2 rounded-full bg-white relative"
                        >
                          <Ionicons
                            name="close-circle-outline"
                            className="rounded-full"
                            size={16}
                            color="#ffffff"
                            style={{
                              position: 'absolute',
                              top: -2,
                              right: -2,
                              backgroundColor: '#494949',
                              padding: 0,
                            }}
                          />
                          <Text className="text-sm font-medium text-black">
                            {SPORTS_TRANSLATION_EN_TO_DK[sportKey] || sportKey}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              {showSportChips && (
                <View className="flex-row flex-wrap gap-2 mt-2 justify-center">
                  {sportKeys
                    .filter((sportKey) => !selectedSports.includes(sportKey))
                    .map((sportKey) => (
                      <Pressable
                        key={sportKey}
                        onPress={() => toggleSport(sportKey)}
                        className="px-4 py-2 rounded-full bg-[#575757]"
                      >
                        <Text className="text-sm font-medium text-white">
                          {SPORTS_TRANSLATION_EN_TO_DK[sportKey] || sportKey}
                        </Text>
                      </Pressable>
                    ))}
                </View>
              )}
            </View>

            {/* Område */}
            <FormFieldButton
              label="Område"
              value={selectedArea}
              placeholder="Vælg område"
              onPress={() => setShowAreaPicker(true)}
            />

            {/* Tidsrum */}
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-base flex-1">Tidsrum</Text>
              <View className="flex-row items-center gap-2 ml-4">
                <Pressable
                  onPress={() => setShowStartTimePicker(true)}
                  className="bg-[#575757] px-3 py-2 rounded-lg min-w-[70px]"
                >
                  <Text className="text-white text-sm text-center">
                    {formatTime(startTime)}
                  </Text>
                </Pressable>
                <Text className="text-gray-400 text-lg">:</Text>
                <Pressable
                  onPress={() => setShowEndTimePicker(true)}
                  className="bg-[#575757] px-3 py-2 rounded-lg min-w-[70px]"
                >
                  <Text className="text-white text-sm text-center">
                    {formatTime(endTime)}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* INT / EXT */}
            <BooleanToggle
              label="INT / EXT"
              value={isIndoor}
              onValueChange={setIsIndoor}
              trueLabel="INT"
              falseLabel="EXT"
            />

            {/* Omkostninger */}
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-base flex-1">Omkostninger</Text>
              <Switch
                value={hasCosts}
                onValueChange={setHasCosts}
                trackColor={{ false: '#2c2c2c', true: '#0A84FF' }}
                thumbColor={hasCosts ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            {/* Åben */}
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-base flex-1">Åben</Text>
              <Switch
                value={isOpen}
                onValueChange={setIsOpen}
                trackColor={{ false: '#2c2c2c', true: '#0A84FF' }}
                thumbColor={isOpen ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            {/* Hold Challenge */}
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-base flex-1">
                Hold Challenge
              </Text>
              <Switch
                value={isTeamChallenge}
                onValueChange={setIsTeamChallenge}
                trackColor={{ false: '#2c2c2c', true: '#0A84FF' }}
                thumbColor={isTeamChallenge ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Area Picker Modal */}
      <Modal
        visible={showAreaPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAreaPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setShowAreaPicker(false)}
        >
          <View className="bg-[#1E1E1E] rounded-t-3xl p-5 max-h-[70%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-bold">Vælg område</Text>
              <Pressable onPress={() => setShowAreaPicker(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </Pressable>
            </View>
            <ScrollView>
              {areaOptions.map((area) => (
                <Pressable
                  key={area}
                  onPress={() => {
                    setSelectedArea(area);
                    setShowAreaPicker(false);
                  }}
                  className="py-3 border-b border-[#333]"
                >
                  <Text className="text-white text-base">{area}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Start Time Picker Modal */}
      {showStartTimePicker && (
        <Modal
          visible={showStartTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowStartTimePicker(false)}
        >
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-[#171616] rounded-t-3xl pb-8">
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#272626]">
                <Pressable onPress={() => setShowStartTimePicker(false)}>
                  <Text className="text-white text-base">Annuller</Text>
                </Pressable>
                <Text className="text-white text-lg font-bold">
                  Vælg start tid
                </Text>
                <Pressable onPress={() => setShowStartTimePicker(false)}>
                  <Text className="text-white text-base font-medium">
                    Færdig
                  </Text>
                </Pressable>
              </View>
              <View className="py-4 w-full items-center">
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    if (selectedTime) {
                      setStartTime(selectedTime);
                    }
                    if (Platform.OS === 'android') {
                      setShowStartTimePicker(false);
                    }
                  }}
                  textColor="#ffffff"
                  themeVariant="dark"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* End Time Picker Modal */}
      {showEndTimePicker && (
        <Modal
          visible={showEndTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowEndTimePicker(false)}
        >
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-[#171616] rounded-t-3xl pb-8">
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#272626]">
                <Pressable onPress={() => setShowEndTimePicker(false)}>
                  <Text className="text-white text-base">Annuller</Text>
                </Pressable>
                <Text className="text-white text-lg font-bold">
                  Vælg slut tid
                </Text>
                <Pressable onPress={() => setShowEndTimePicker(false)}>
                  <Text className="text-white text-base font-medium">
                    Færdig
                  </Text>
                </Pressable>
              </View>
              <View className="py-4 w-full items-center">
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    if (selectedTime) {
                      setEndTime(selectedTime);
                    }
                    if (Platform.OS === 'android') {
                      setShowEndTimePicker(false);
                    }
                  }}
                  textColor="#ffffff"
                  themeVariant="dark"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};
