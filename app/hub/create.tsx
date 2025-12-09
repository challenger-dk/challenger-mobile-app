import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BooleanToggle, ErrorScreen, FormFieldButton, HorizontalPicker, LoadingScreen, LocationSearch, ScreenHeader, SubmitButton, TabNavigation, TeamSizeSelector } from '../../components/common';
import { useCreateChallenge, useTeams, useUsers } from '../../hooks/queries';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { CreateChallenge } from '../../types/challenge';
import type { Location } from '../../types/location';
import { SPORTS_TRANSLATION_EN_TO_DK } from '../../types/sports';
import type { Team } from '../../types/team';
import type { User } from '../../types/user';
import { showErrorToast } from '../../utils/toast';

const AVAILABLE_SPORTS = Object.keys(SPORTS_TRANSLATION_EN_TO_DK);

// Helper function to round time to the nearest 15 minutes
const roundToNearest15Minutes = (date: Date): Date => {
  const roundedDate = new Date(date);
  const minutes = roundedDate.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  roundedDate.setMinutes(roundedMinutes);
  roundedDate.setSeconds(0);
  roundedDate.setMilliseconds(0);
  return roundedDate;
};

export default function CreateChallengeScreen() {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const commentInputRef = useRef<TextInput>(null);
  const [challengeType, setChallengeType] = useState<'public' | 'friends'>('public');
  const [participants, setParticipants] = useState<User[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [teamSize, setTeamSize] = useState<number | null>(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [participantModalTab, setParticipantModalTab] = useState<'friends' | 'teams'>('friends');
  const [showTeamSizePicker, setShowTeamSizePicker] = useState(false);
  const [sport, setSport] = useState<string>('');
  const [location, setLocation] = useState<Location | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [tempStartTime, setTempStartTime] = useState<Date>(new Date());
  const [tempEndTime, setTempEndTime] = useState<Date>(new Date());
  const [isIndoor, setIsIndoor] = useState<boolean | null>(null);
  const [playFor, setPlayFor] = useState('');
  const [hasCosts, setHasCosts] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showPlayForPicker, setShowPlayForPicker] = useState(false);
  const TEAM_SIZES = [1, 2,3, 4, 5, 7, 8, 10, 11];

  // React Query hooks for data fetching
  const { data: availableUsersData = [] } = useUsers();
  const { data: availableTeamsData = [], isLoading: teamsQueryLoading } = useTeams();
  const createChallengeMutation = useCreateChallenge();

  // Use the data directly - React Query handles caching and updates
  const availableUsers = availableUsersData;
  const availableTeams = availableTeamsData;
  const loadingTeams = teamsQueryLoading;

  const handleSubmit = async () => {
    if (!user) {
      showErrorToast('Du skal være logget ind for at oprette en udfordring');
      return;
    }

    if (!sport || !location || !date || !startTime || !endTime || isIndoor === null || hasCosts === null) {
      showErrorToast('Udfyld venligst alle påkrævede felter');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create ISO 8601 datetime strings (RFC3339 format)
      // For date: create a date at midnight local time, then convert to ISO string
      const dateAtMidnight = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0, 0, 0, 0
      );
      const dateISO = dateAtMidnight.toISOString();

      // For start_time: combine date with startTime's hours, minutes, seconds, and milliseconds
      const startDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        startTime.getHours(),
        startTime.getMinutes(),
        startTime.getSeconds(),
        startTime.getMilliseconds()
      );
      const startDateTimeISO = startDateTime.toISOString();

      // For end_time: combine date with endTime's hours, minutes, seconds, and milliseconds
      const endDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        endTime.getHours(),
        endTime.getMinutes(),
        endTime.getSeconds(),
        endTime.getMilliseconds()
      );
      const endDateTimeISO = endDateTime.toISOString();

      const challengeData: CreateChallenge = {
        name: `${sport} - ${location.address} - ${teamSize}v${teamSize}`,
        description: comment.trim() || '',
        sport: sport,
        location: location,
        is_public: challengeType === 'public',
        is_indoor: isIndoor,
        play_for: playFor.trim(),
        has_costs: hasCosts,
        comment: comment.trim(),
        users: participants.map(p => typeof p.id === 'string' ? parseInt(p.id, 10) : p.id),
        teams: selectedTeams.map(t => typeof t.id === 'string' ? parseInt(t.id, 10) : t.id),
        date: dateISO,
        start_time: startDateTimeISO,
        end_time: endDateTimeISO,
        team_size: teamSize || 0,
      };

      await createChallengeMutation.mutateAsync(challengeData);
      router.back();
    } catch (error) {
      console.error('Error creating challenge:', error);
      // Error toast is handled by the mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  const selectedSportName = sport ? SPORTS_TRANSLATION_EN_TO_DK[sport] : '';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      className="flex-1 bg-[#171616]"
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingBottom: 24 + insets.bottom 
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar with back button and header */}
        <ScreenHeader title="Opret Challenge" />

        {/* Header with Tabs */}
        <View className="w-full items-center mb-6">
          <TabNavigation
            tabs={[
              { key: 'public', label: 'Offentligt' },
              { key: 'friends', label: 'Venner' },
            ]}
            activeTab={challengeType}
            onTabChange={(key) => setChallengeType(key as 'public' | 'friends')}
          />
        </View>

        {/* Participants Section */}
        <View className="w-full mb-8">
          <View className="flex-row items-center mb-4">
            {/* Left Person Icon - Add Teams */}
            <Pressable
              onPress={() => {
                setParticipantModalTab('friends');
                setShowParticipantModal(true);
              }}
              disabled={isSubmitting}
            >
              <View className="w-8 h-8 rounded-full bg-[#575757] items-center justify-center border-2 border-white">
                <Ionicons name="add" size={16} color="#ffffff" />
              </View>
            </Pressable>
            
            {/* Middle Team Size Selector Button */}
            <TeamSizeSelector
              teamSize={teamSize}
              onPress={() => setShowTeamSizePicker(!showTeamSizePicker)}
              disabled={isSubmitting}
            />

            {/* Right Side - Person Icon and Add users Button */}
            <Pressable
              onPress={() => {
                setParticipantModalTab('friends');
                setShowParticipantModal(true);
              }}
              disabled={isSubmitting}
            >
              <View className="flex-column items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-[#575757] items-center justify-center">
                  <Ionicons name="person" size={20} color="#ffffff" />
                </View>
              </View>
            </Pressable>
          </View>

          {/* Selected Teams List */}
          {selectedTeams.length > 0 && (
            <View className="ml-12 mb-2">
              {selectedTeams.map((team, index) => (
                <View key={index} className="flex-row items-center mb-1">
                  <Text className="text-white text-sm">
                    {team.name}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setSelectedTeams(selectedTeams.filter(t => t.id !== team.id));
                    }}
                    className="ml-2"
                  >
                    <Ionicons name="close-circle" size={16} color="#ffffff" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Participants List */}
          {participants.length > 0 && (
            <View className="ml-12 mb-2">
              {participants.map((participant, index) => (
                <View key={index} className="flex-row items-center mb-1">
                  <Text className="text-white text-sm">
                    {participant.first_name} {participant.last_name || ''}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setParticipants(participants.filter(p => p.id !== participant.id));
                    }}
                    className="ml-2"
                  >
                    <Ionicons name="close-circle" size={16} color="#ffffff" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Team Size Picker */}
          {showTeamSizePicker && (
            <View className="mt-4">
              <HorizontalPicker
                options={TEAM_SIZES.map((size) => ({
                  key: String(size),
                  label: `${size}v${size}`,
                }))}
                selectedKey={teamSize ? String(teamSize) : null}
                onSelect={(key) => {
                  setTeamSize(parseInt(key, 10));
                  setShowTeamSizePicker(false);
                }}
                renderOption={(option, isSelected) => (
                  <Pressable
                    key={option.key}
                    onPress={() => {
                      setTeamSize(parseInt(option.key, 10));
                      setShowTeamSizePicker(false);
                    }}
                    className={`px-6 py-3 rounded-full ${isSelected ? 'bg-white' : 'bg-[#575757]'}`}
                  >
                    <Text className={`text-base font-bold ${isSelected ? 'text-black' : 'text-white'}`}>
                      {option.label}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>

        {/* Participant Selection Modal */}
        <Modal
          visible={showParticipantModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowParticipantModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <Pressable 
              className="flex-1" 
              onPress={() => setShowParticipantModal(false)}
            />
            <View 
              className="bg-[#171616] rounded-t-3xl"
              style={{
                maxHeight: Dimensions.get('window').height * 0.85,
                minHeight: Dimensions.get('window').height * 0.5
              }}
            >
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#272626]">
                <Pressable onPress={() => setShowParticipantModal(false)}>
                  <Text className="text-white text-base">Annuller</Text>
                </Pressable>
                <Text className="text-white text-lg font-bold">
                  {participantModalTab === 'teams' ? 'Vælg teams' : 'Vælg venner'}
                </Text>
                <Pressable onPress={() => setShowParticipantModal(false)}>
                  <Text className="text-white text-base font-medium">Færdig</Text>
                </Pressable>
              </View>

              {/* Tabs */}
              <View className="px-6 pt-4">
                <TabNavigation
                  tabs={[
                    { key: 'friends', label: 'Venner' },
                    { key: 'teams', label: 'Teams' },
                  ]}
                  activeTab={participantModalTab}
                  onTabChange={(key) => setParticipantModalTab(key as 'friends' | 'teams')}
                />
              </View>

              {/* Content */}
              <View className="flex-1">
                <ScrollView 
                  className="px-6 pt-4 pb-8"
                  contentContainerStyle={{ paddingBottom: 32 }}
                >
                {participantModalTab === 'teams' ? (
                  loadingTeams ? (
                    <View className="py-8 items-center">
                      <Text className="text-white">Indlæser teams...</Text>
                    </View>
                  ) : availableTeams.length === 0 ? (
                    <View className="py-8 items-center">
                      <Text className="text-white text-center">Ingen teams tilgængelige</Text>
                    </View>
                  ) : (
                    <View className="gap-2">
                      {availableTeams.map((team: Team) => {
                        const isSelected = selectedTeams.some(t => t.id === team.id);
                        return (
                          <Pressable
                            key={team.id}
                            onPress={() => {
                              if (isSelected) {
                                setSelectedTeams(selectedTeams.filter(t => t.id !== team.id));
                              } else {
                                setSelectedTeams([...selectedTeams, team]);
                              }
                            }}
                            className={`flex-row items-center justify-between p-4 rounded-lg border ${
                              isSelected ? 'bg-white border-white' : 'bg-[#272626] border-[#575757]'
                            }`}
                          >
                            <Text className={`text-base font-medium ${isSelected ? 'text-black' : 'text-white'}`}>
                              {team.name}
                            </Text>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={24} color="#000000" />
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  )
                ) : (
                  <View className="gap-2">
                    {availableUsers
                      .filter((u: User) => u.id !== user?.id)
                      .map((friend: User) => {
                        const isSelected = participants.some(p => p.id === friend.id);
                        return (
                          <Pressable
                            key={friend.id}
                            onPress={() => {
                              if (isSelected) {
                                setParticipants(participants.filter(p => p.id !== friend.id));
                              } else {
                                setParticipants([...participants, friend]);
                              }
                            }}
                            className={`flex-row items-center justify-between p-4 rounded-lg border ${
                              isSelected ? 'bg-white border-white' : 'bg-[#272626] border-[#575757]'
                            }`}
                          >
                            <Text className={`text-base font-medium ${isSelected ? 'text-black' : 'text-white'}`}>
                              {friend.first_name} {friend.last_name || ''}
                            </Text>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={24} color="#000000" />
                            )}
                          </Pressable>
                        );
                      })}
                    {availableUsers.filter((u: User) => u.id !== user?.id).length === 0 && (
                      <View className="py-8 items-center">
                        <Text className="text-white text-center">Ingen venner tilgængelige</Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
              </View>
            </View>
          </View>
        </Modal>

        {/* Form Fields */}
        <View className="w-full gap-6 mb-8">
          {/* Sport */}
          <FormFieldButton
            label="Sport"
            value={selectedSportName}
            placeholder="Vælg sport"
            onPress={() => setShowSportPicker(!showSportPicker)}
            disabled={isSubmitting}
          />

          {/* Sport Picker */}
          {showSportPicker && (
            <View className="mb-4">
              <HorizontalPicker
                options={AVAILABLE_SPORTS.map((sportKey) => ({
                  key: sportKey,
                  label: SPORTS_TRANSLATION_EN_TO_DK[sportKey],
                }))}
                selectedKey={sport}
                onSelect={(key) => {
                  setSport(key);
                  setShowSportPicker(false);
                }}
              />
            </View>
          )}

          {/* Location */}
          <FormFieldButton
            label="Lokation"
            value={location?.address || ''}
            placeholder="Vælg lokation"
            onPress={() => setShowLocationPicker(true)}
            disabled={isSubmitting}
          />

          {/* Location Search Modal */}
          <Modal
            visible={showLocationPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowLocationPicker(false)}
          >
            <View className="flex-1 bg-black/50 justify-end">
              <Pressable 
                className="absolute inset-0" 
                onPress={() => setShowLocationPicker(false)}
              />
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'position' : 'height'}
                keyboardVerticalOffset={0}
              >
                <View 
                  className="bg-[#171616] rounded-t-3xl"
                  style={{ 
                    maxHeight: Dimensions.get('window').height * 0.85,
                    minHeight: Dimensions.get('window').height * 0.5,
                    paddingBottom: insets.bottom
                  }}
                >
                  <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#272626]">
                    <Pressable onPress={() => setShowLocationPicker(false)}>
                      <Text className="text-white text-base">Annuller</Text>
                    </Pressable>
                    <Text className="text-white text-lg font-bold">Søg efter lokation</Text>
                    <Pressable
                      onPress={() => setShowLocationPicker(false)}
                    >
                      <Text className="text-white text-base font-medium">Færdig</Text>
                    </Pressable>
                  </View>
                  <View className="flex-1 px-6 pt-4 pb-8">
                    <LocationSearch
                      value={location}
                      onLocationSelect={(selectedLocation) => {
                        setLocation(selectedLocation);
                        if (selectedLocation) {
                          setShowLocationPicker(false);
                        }
                      }}
                      placeholder="F.eks. Fælledparken, København"
                      disabled={isSubmitting}
                      showResultsInline={true}
                    />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Modal>

          {/* Date */}
          <FormFieldButton
            label="Dato"
            value={date
              ? date.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : ''}
            placeholder="Vælg dato"
            onPress={() => {
              setTempDate(date || new Date());
              setShowDatePicker(true);
            }}
            disabled={isSubmitting}
          />

          {/* Date Picker */}
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View className="flex-1 bg-black/50 justify-end">
                <Pressable 
                  className="flex-1" 
                  onPress={() => setShowDatePicker(false)}
                />
                <View className="bg-[#171616] rounded-t-3xl pb-8">
                  <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#272626]">
                    <Pressable onPress={() => setShowDatePicker(false)}>
                      <Text className="text-white text-base">Annuller</Text>
                    </Pressable>
                    <Text className="text-white text-lg font-bold">Vælg dato</Text>
                    <Pressable
                      onPress={() => {
                        setDate(tempDate);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text className="text-white text-base font-medium">Færdig</Text>
                    </Pressable>
                  </View>
                  <View className="py-4 w-full items-center" style={{ backgroundColor: '#171616' }}>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setTempDate(selectedDate);
                        }
                      }}
                      minimumDate={new Date()}
                      textColor="#ffffff"
                      themeVariant="dark"
                      style={{ backgroundColor: '#171616' }}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          ) : (
            showDatePicker && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (event.type === 'set' && selectedDate) {
                    setDate(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )
          )}

          {/* Start Time */}
          <FormFieldButton
            label="Start tid"
            value={startTime
              ? startTime.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
              : ''}
            placeholder="Vælg start tid"
            onPress={() => {
              const timeToSet = startTime || new Date();
              setTempStartTime(roundToNearest15Minutes(timeToSet));
              setShowStartTimePicker(true);
            }}
            disabled={isSubmitting}
          />

          {/* Start Time Picker */}
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showStartTimePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowStartTimePicker(false)}
            >
              <View className="flex-1 bg-black/50 justify-end">
                <Pressable 
                  className="flex-1" 
                  onPress={() => setShowStartTimePicker(false)}
                />
                <View className="bg-[#171616] rounded-t-3xl pb-8">
                  <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#272626]">
                    <Pressable onPress={() => setShowStartTimePicker(false)}>
                      <Text className="text-white text-base">Annuller</Text>
                    </Pressable>
                    <Text className="text-white text-lg font-bold">Vælg start tid</Text>
                    <Pressable
                      onPress={() => {
                        setStartTime(roundToNearest15Minutes(tempStartTime));
                        setShowStartTimePicker(false);
                      }}
                    >
                      <Text className="text-white text-base font-medium">Færdig</Text>
                    </Pressable>
                  </View>
                  <View className="py-4 w-full items-center" style={{ backgroundColor: '#171616' }}>
                    <DateTimePicker
                      value={tempStartTime}
                      mode="time"
                      display="spinner"
                      minuteInterval={15}
                      onChange={(event, selectedTime) => {
                        if (selectedTime) {
                          setTempStartTime(selectedTime);
                        }
                      }}
                      textColor="#ffffff"
                      themeVariant="dark"
                      style={{ backgroundColor: '#171616' }}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          ) : (
            showStartTimePicker && (
              <DateTimePicker
                value={startTime || new Date()}
                mode="time"
                display="default"
                minuteInterval={15}
                onChange={(event, selectedTime) => {
                  setShowStartTimePicker(false);
                  if (event.type === 'set' && selectedTime) {
                    setStartTime(roundToNearest15Minutes(selectedTime));
                  }
                }}
              />
            )
          )}

          {/* End Time */}
          <FormFieldButton
            label="Slut tid"
            value={endTime
              ? endTime.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
              : ''}
            placeholder="Vælg slut tid"
            onPress={() => {
              const timeToSet = endTime || new Date();
              setTempEndTime(roundToNearest15Minutes(timeToSet));
              setShowEndTimePicker(true);
            }}
            disabled={isSubmitting}
          />

          {/* End Time Picker */}
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showEndTimePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowEndTimePicker(false)}
            >
              <View className="flex-1 bg-black/50 justify-end">
                <Pressable 
                  className="flex-1" 
                  onPress={() => setShowEndTimePicker(false)}
                />
                <View className="bg-[#171616] rounded-t-3xl pb-8">
                  <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#272626]">
                    <Pressable onPress={() => setShowEndTimePicker(false)}>
                      <Text className="text-white text-base">Annuller</Text>
                    </Pressable>
                    <Text className="text-white text-lg font-bold">Vælg slut tid</Text>
                    <Pressable
                      onPress={() => {
                        setEndTime(roundToNearest15Minutes(tempEndTime));
                        setShowEndTimePicker(false);
                      }}
                    >
                      <Text className="text-white text-base font-medium">Færdig</Text>
                    </Pressable>
                  </View>
                  <View className="py-4 w-full items-center" style={{ backgroundColor: '#171616' }}>
                    <DateTimePicker
                      value={tempEndTime}
                      mode="time"
                      display="spinner"
                      minuteInterval={15}
                      onChange={(event, selectedTime) => {
                        if (selectedTime) {
                          setTempEndTime(selectedTime);
                        }
                      }}
                      textColor="#ffffff"
                      themeVariant="dark"
                      style={{ backgroundColor: '#171616' }}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          ) : (
            showEndTimePicker && (
              <DateTimePicker
                value={endTime || new Date()}
                mode="time"
                display="default"
                minuteInterval={15}
                onChange={(event, selectedTime) => {
                  setShowEndTimePicker(false);
                  if (event.type === 'set' && selectedTime) {
                    setEndTime(roundToNearest15Minutes(selectedTime));
                  }
                }}
              />
            )
          )}

          {/* INT/EXT */}
          <BooleanToggle
            label="INT/EXT"
            value={isIndoor}
            onValueChange={setIsIndoor}
            trueLabel="INT"
            falseLabel="EXT"
            disabled={isSubmitting}
          />

          {/* Spil om */}
          <FormFieldButton
            label="Spil om"
            value={playFor}
            placeholder="..."
            onPress={() => setShowPlayForPicker(true)}
            disabled={isSubmitting}
          />

          {/* Play For Input Modal */}
          <Modal
            visible={showPlayForPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPlayForPicker(false)}
          >
            <View className="flex-1 bg-black/50 justify-end">
              <Pressable 
                className="flex-1" 
                onPress={() => setShowPlayForPicker(false)}
              />
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'position' : 'height'}
                keyboardVerticalOffset={0}
              >
                <View className="bg-[#171616] rounded-t-3xl" style={{ paddingBottom: 8 + insets.bottom }}>
                  <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#272626]">
                    <Pressable onPress={() => setShowPlayForPicker(false)}>
                      <Text className="text-white text-base">Annuller</Text>
                    </Pressable>
                    <Text className="text-white text-lg font-bold">Hvad spiller I om?</Text>
                    <Pressable
                      onPress={() => setShowPlayForPicker(false)}
                    >
                      <Text className="text-white text-base font-medium">Færdig</Text>
                    </Pressable>
                  </View>
                  <View className="px-6 pt-4">
                    <TextInput
                      placeholder="F.eks. Ære, en øl, eller bare for sjov"
                      placeholderTextColor="#9CA3AF"
                      value={playFor}
                      onChangeText={setPlayFor}
                      className="bg-[#272626] text-white rounded-lg px-4 py-3 border border-[#575757]"
                      style={{ color: '#ffffff', fontSize: 16 }}
                      autoFocus
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                      returnKeyType="done"
                      onSubmitEditing={() => setShowPlayForPicker(false)}
                    />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Modal>

          {/* Omkostninger */}
          <BooleanToggle
            label="Omkostninger"
            value={hasCosts}
            onValueChange={setHasCosts}
            trueLabel="Ja"
            falseLabel="Nej"
            disabled={isSubmitting}
          />
        </View>

        {/* Kommentar Section */}
        <View className="w-full mb-8">
          <Text className="text-white text-base mb-4">Kommentar</Text>
          <TextInput
            ref={commentInputRef}
            placeholder="Husk at medbring en volleyball."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-[#575757] text-white rounded-lg px-4 py-3"
            style={{ color: '#ffffff', minHeight: 100 }}
            editable={!isSubmitting}
            onFocus={() => {
              // Scroll to show the comment input above keyboard
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />
        </View>

        {/* Submit Button */}
        <SubmitButton
          label="Opret Challenge"
          loadingLabel="Opretter..."
          onPress={handleSubmit}
          disabled={!sport || !location || !date || !startTime || !endTime || isIndoor === null || hasCosts === null || isSubmitting}
          isLoading={isSubmitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
