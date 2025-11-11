import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { createChallenge } from '../../api/challenges';
import { getUsers } from '../../api/users';
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
    return (
      <View className="flex-1 bg-[#171616] justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#171616] justify-center items-center px-6">
        <Text className="text-white text-lg">Error: {error.message}</Text>
      </View>
    );
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
        <View className="w-full flex-row items-center mb-6 mt-8" style={{ maxWidth: 384 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ flex: 1 }}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#9CA3AF" />
          </Pressable>
          <Text className="text-white text-2xl font-bold text-center" style={{ flex: 4 }}>Opret Challenge</Text>
          <View style={{ flex: 1 }} />
        </View>

        {/* Header with Tabs */}
        <View className="w-full items-center mb-6">
          
          {/* Tabs */}
          <View className="flex-row border-b border-[#272626]">
            <Pressable onPress={() => setChallengeType('public')} className={`flex-1 py-3 ${challengeType === 'public' ? '' : ''}`}>
              <Text className={`text-white text-center ${challengeType === 'public' ? 'font-medium' : ''}`}>
                Offentligt
              </Text>
              {challengeType === 'public' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </Pressable>
            <Pressable onPress={() => setChallengeType('friends')} className={`flex-1 py-3 ${challengeType === 'friends' ? '' : ''}`}>
              <Text className={`text-white text-center ${challengeType === 'friends' ? 'font-medium' : ''}`}>
                Venner
              </Text>
              {challengeType === 'friends' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Participants Section */}
        <View className="w-full mb-8">
          <View className="flex-row items-center mb-4">
            {/* Left Person Icon */}
            <View className="w-8 h-8 rounded-full bg-[#575757] items-center justify-center">
              <Ionicons name="person" size={20} color="#ffffff" />
              <View className="w-8 h-8 rounded-full bg-[#575757] items-center justify-center border-2 border-white">
                  <Ionicons name="add" size={16} color="#ffffff" />
                </View>
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
            <View className="bg-[#272626] rounded-lg p-4 mt-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {TEAM_SIZES.map((size) => {
                    const isSelected = teamSize === size;
                    return (
                      <Pressable
                        key={size}
                        onPress={() => {
                          setTeamSize(size);
                          setShowTeamSizePicker(false);
                        }}
                        className={`px-6 py-3 rounded-full ${isSelected ? 'bg-white' : 'bg-[#575757]'}`}
                      >
                        <Text className={`text-base font-bold ${isSelected ? 'text-black' : 'text-white'}`}>
                          {size}v{size}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Form Fields */}
        <View className="w-full gap-6 mb-8">
          {/* Sport */}
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base flex-1">Sport</Text>
            <Pressable
              onPress={() => setShowSportPicker(!showSportPicker)}
              disabled={isSubmitting}
              className="bg-[#575757] px-4 py-2 rounded-full flex-1 ml-4"
            >
              <Text className="text-white text-sm text-center">
                {selectedSportName || 'Vælg sport'}
              </Text>
            </Pressable>
          </View>

          {/* Sport Picker */}
          {showSportPicker && (
            <View className="bg-[#272626] rounded-lg p-4 mb-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {AVAILABLE_SPORTS.map((sportKey) => {
                    const danishName = SPORTS_TRANSLATION_EN_TO_DK[sportKey];
                    const isSelected = sport === sportKey;
                    return (
                      <Pressable
                        key={sportKey}
                        onPress={() => {
                          setSport(sportKey);
                          setShowSportPicker(false);
                        }}
                        className={`px-4 py-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#575757]'}`}
                      >
                        <Text className={`text-sm font-medium ${isSelected ? 'text-black' : 'text-white'}`}>
                          {danishName}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Location */}
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base flex-1">Lokation</Text>
            <Pressable
              onPress={() => setShowLocationPicker(!showLocationPicker)}
              disabled={isSubmitting}
              className="bg-[#575757] px-4 py-2 rounded-full flex-1 ml-4"
            >
              <Text className="text-white text-sm text-center">
                {location || 'Vælg lokation'}
              </Text>
            </Pressable>
          </View>

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
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base flex-1">Dato / Tid</Text>
            <Pressable
              onPress={() => {
                setTempDateTime(dateTime || new Date());
                setShowDateTimePicker(true);
              }}
              disabled={isSubmitting}
              className="bg-[#575757] px-4 py-2 rounded-full flex-1 ml-4"
            >
              <Text className="text-white text-sm text-center">
                {dateTime
                  ? `${dateTime.toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${dateTime.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Vælg dato og tid'}
              </Text>
            </Pressable>
          </View>

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
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base flex-1">INT/EXT</Text>
            <View className="flex-row gap-2 flex-1 ml-4">
              <Pressable
                onPress={() => setIsIndoor(true)}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-full flex-1 ${isIndoor === true ? 'bg-[#0A84FF]' : 'bg-[#575757]'}`}
              >
                <Text className="text-white text-sm text-center">INT</Text>
              </Pressable>
              <Pressable
                onPress={() => setIsIndoor(false)}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-full flex-1 ${isIndoor === false ? 'bg-[#0A84FF]' : 'bg-[#575757]'}`}
              >
                <Text className="text-white text-sm text-center">EXT</Text>
              </Pressable>
            </View>
          </View>

          {/* Spil om */}
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base flex-1">Spil om</Text>
            <Pressable
              onPress={() => setShowPlayForPicker(!showPlayForPicker)}
              disabled={isSubmitting}
              className="bg-[#575757] px-4 py-2 rounded-full flex-1 ml-4"
            >
              <Text className="text-white text-sm text-center">
                {playFor || '...'}
              </Text>
            </Pressable>
          </View>

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
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-base flex-1">Omkostninger</Text>
            <View className="flex-row gap-2 flex-1 ml-4">
              <Pressable
                onPress={() => setHasCosts(true)}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-full flex-1 ${hasCosts === true ? 'bg-[#0A84FF]' : 'bg-[#575757]'}`}
              >
                <Text className="text-white text-sm text-center">Ja</Text>
              </Pressable>
              <Pressable
                onPress={() => setHasCosts(false)}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-full flex-1 ${hasCosts === false ? 'bg-[#0A84FF]' : 'bg-[#575757]'}`}
              >
                <Text className="text-white text-sm text-center">Nej</Text>
              </Pressable>
            </View>
          </View>
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
        <View className="w-full flex-row gap-4 mt-auto">
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting || !sport || !location || !dateTime || isIndoor === null || hasCosts === null}
            className={`flex-1 rounded-lg px-4 py-4 ${
              !isSubmitting && sport && location && dateTime && isIndoor !== null && hasCosts !== null
                ? 'bg-white'
                : 'bg-[#575757]'
            }`}
          >
            <Text className={`text-center font-medium ${
              !isSubmitting && sport && location && dateTime && isIndoor !== null && hasCosts !== null
                ? 'text-black'
                : 'text-gray-400'
            }`}>
              {isSubmitting ? 'Opretter...' : 'Opret Challenge'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
