import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { createChallenge } from '../../api/challenges';
import { getUsers } from '../../api/users';
import { BooleanToggle, ErrorScreen, FormFieldButton, HorizontalPicker, LoadingScreen, ScreenHeader, SubmitButton, TabNavigation } from '../../components/common';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { CreateChallenge } from '../../types/challenge';
import { SPORTS_TRANSLATION_EN_TO_DK } from '../../types/sports';
import type { User } from '../../types/user';

const AVAILABLE_SPORTS = Object.keys(SPORTS_TRANSLATION_EN_TO_DK);

export default function CreateChallengeScreen() {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();
  const [challengeType, setChallengeType] = useState<'public' | 'friends'>('public');
  const [participants, setParticipants] = useState<User[]>([]);
  const [teamSize, setTeamSize] = useState<number | null>(null);
  const [showTeamSizePicker, setShowTeamSizePicker] = useState(false);
  const [sport, setSport] = useState<string>('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [tempDateTime, setTempDateTime] = useState<Date>(new Date());
  const [isIndoor, setIsIndoor] = useState<boolean | null>(null);
  const [playFor, setPlayFor] = useState('');
  const [hasCosts, setHasCosts] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showPlayForPicker, setShowPlayForPicker] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const TEAM_SIZES = [3, 4, 5, 7, 8, 10, 11];

  // Load users for friends selection
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getUsers();
        setAvailableUsers(users);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Fejl', 'Du skal være logget ind for at oprette en udfordring');
      return;
    }

    if (!sport || !location || !dateTime || isIndoor === null || hasCosts === null) {
      Alert.alert('Fejl', 'Udfyld venligst alle påkrævede felter');
      return;
    }

    setIsSubmitting(true);

    try {
      const challengeData: CreateChallenge = {
        name: `${sport} - ${location}`, // Temporary name
        description: comment.trim() || '',
        sport: sport,
        location: location.trim(),
        creator_id: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
      };

      await createChallenge(challengeData);
      
      Alert.alert('Succes', 'Udfordringen er oprettet!');
      router.back();
    } catch (error) {
      console.error('Error creating challenge:', error);
      Alert.alert('Fejl', 'Der opstod en fejl ved oprettelse af udfordringen');
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
      className="flex-1 bg-[#171616]"
    >
      <ScrollView
        contentContainerClassName="flex-grow px-6 pb-6"
        keyboardShouldPersistTaps="handled"
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
            {/* Left Person Icon */}
            <View className="w-8 h-8 rounded-full bg-[#575757] items-center justify-center border-2 border-white">
                  <Ionicons name="add" size={16} color="#ffffff" />
                </View>
            
            {/* Middle Team Size Selector Button */}
            <View className="flex-1 mx-4">
              <Pressable
                onPress={() => setShowTeamSizePicker(!showTeamSizePicker)}
                disabled={isSubmitting}
                className="bg-[#272626] rounded-lg border border-[#575757] py-3 px-4"
              >
                <Text className="text-white text-center text-base font-medium">
                  {teamSize ? `${teamSize}v${teamSize}` : 'Vælg team størrelse'}
                </Text>
              </Pressable>
            </View>

            {/* Right Side - Person Icon and Add Button */}
            <View className="flex-column items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-[#575757] items-center justify-center">
                <Ionicons name="person" size={20} color="#ffffff" />
              </View>
              <Pressable onPress={() => {
                // TODO: Open participant selection modal
                if (challengeType === 'friends' && availableUsers.length > 0) {
                  // For now, just add first available user as placeholder
                  const firstUser = availableUsers.find(u => u.id !== user?.id);
                  if (firstUser && !participants.find(p => p.id === firstUser.id)) {
                    setParticipants([...participants, firstUser]);
                  }
                }
              }}>
              </Pressable>
            </View>
          </View>

          {/* Participants List */}
          {participants.length > 0 && (
            <View className="ml-12 mb-2">
              {participants.slice(0, 5).map((participant, index) => (
                <Text key={index} className="text-white text-sm mb-1">
                  {participant.first_name} {participant.last_name || ''}
                </Text>
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
            value={location}
            placeholder="Vælg lokation"
            onPress={() => setShowLocationPicker(!showLocationPicker)}
            disabled={isSubmitting}
          />

          {/* Location Input (shown when picker is open) */}
          {showLocationPicker && (
            <View className="mb-4">
              <TextInput
                placeholder="Indtast lokation"
                placeholderTextColor="#9CA3AF"
                value={location}
                onChangeText={(text) => {
                  setLocation(text);
                  if (text.trim()) {
                    setShowLocationPicker(false);
                  }
                }}
                className="bg-[#575757] text-white rounded-lg px-4 py-3"
                style={{ color: '#ffffff' }}
                autoFocus
              />
            </View>
          )}

          {/* Dato / Tid */}
          <FormFieldButton
            label="Dato / Tid"
            value={dateTime
              ? `${dateTime.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${dateTime.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}`
              : ''}
            placeholder="Vælg dato og tid"
            onPress={() => {
              setTempDateTime(dateTime || new Date());
              setShowDateTimePicker(true);
            }}
            disabled={isSubmitting}
          />

          {/* DateTime Picker */}
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showDateTimePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowDateTimePicker(false)}
            >
              <View className="flex-1 bg-black/50 justify-end">
                <Pressable 
                  className="flex-1" 
                  onPress={() => setShowDateTimePicker(false)}
                />
                <View className="bg-[#171616] rounded-t-3xl pb-8">
                  <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#272626]">
                    <Pressable onPress={() => setShowDateTimePicker(false)}>
                      <Text className="text-white text-base">Annuller</Text>
                    </Pressable>
                    <Text className="text-white text-lg font-bold">Vælg dato og tid</Text>
                    <Pressable
                      onPress={() => {
                        setDateTime(tempDateTime);
                        setShowDateTimePicker(false);
                      }}
                    >
                      <Text className="text-white text-base font-medium">Færdig</Text>
                    </Pressable>
                  </View>
                  <View className="py-4 w-full items-center" style={{ backgroundColor: '#171616' }}>
                    <DateTimePicker
                      value={tempDateTime}
                      mode="datetime"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setTempDateTime(selectedDate);
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
            showDateTimePicker && (
              <DateTimePicker
                value={dateTime || new Date()}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDateTimePicker(false);
                  if (event.type === 'set' && selectedDate) {
                    setDateTime(selectedDate);
                  }
                }}
                minimumDate={new Date()}
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
            onPress={() => setShowPlayForPicker(!showPlayForPicker)}
            disabled={isSubmitting}
          />

          {/* Play For Input (shown when picker is open) */}
          {showPlayForPicker && (
            <View className="mb-4">
              <TextInput
                placeholder="Hvad spiller I om?"
                placeholderTextColor="#9CA3AF"
                value={playFor}
                onChangeText={(text) => {
                  setPlayFor(text);
                  if (text.trim()) {
                    setShowPlayForPicker(false);
                  }
                }}
                className="bg-[#575757] text-white rounded-lg px-4 py-3"
                style={{ color: '#ffffff' }}
                autoFocus
              />
            </View>
          )}

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
          />
        </View>

        {/* Submit Button */}
        <SubmitButton
          label="Opret Challenge"
          loadingLabel="Opretter..."
          onPress={handleSubmit}
          disabled={!sport || !location || !dateTime || isIndoor === null || hasCosts === null}
          isLoading={isSubmitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
