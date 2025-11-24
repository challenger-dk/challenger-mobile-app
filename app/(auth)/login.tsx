import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await login(email, password);
      
      if (response.success && response.token) {
        await setToken(response.token);
        router.replace('/(tabs)' as any);
      } else {
        setError(response.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      className="flex-1 bg-[#171616]"
    >
      <ScrollView
        contentContainerStyle={{ 
          flexGrow: 1, 
          alignItems: 'center', 
          justifyContent: 'center', 
          paddingHorizontal: 24, 
          paddingVertical: 48,
          paddingBottom: 48 + insets.bottom
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View className="w-full max-w-sm mb-12 items-center">
          {/* TODO: Add Logo_WHITE.png to assets/images/ and uncomment below */}
          <Image
            source={require('../../assets/Logo_WHITE.png')}
            className="w-full max-w-sm"
            style={{ height: 80 }}
            resizeMode="contain"
          />
        </View>

        {/* Error Message */}
        {error && (
          <View className="w-full max-w-sm mb-4 bg-[#943d40] rounded-lg px-4 py-3">
            <Text className="text-white text-sm">{error}</Text>
          </View>
        )}

        {/* Email Input */}
        <TextInput
          placeholder="E-mail"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          className="w-full max-w-sm bg-[#575757] text-white rounded-lg px-4 py-4 mb-4"
          style={{ color: '#ffffff' }}
        />

        {/* Password Input */}
        <View className="w-full max-w-sm relative mb-4">
          <TextInput
            placeholder="Adgangskode"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            className="w-full bg-[#575757] text-white rounded-lg px-4 py-4 pr-12"
            style={{ color: '#ffffff' }}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2"
            style={{ transform: [{ translateY: -10 }] }}
          >
            {showPassword ? (
              <Ionicons name="eye-off" size={18} color="#9CA3AF" />
            ) : (
              <Ionicons name="eye" size={18} color="#9CA3AF" />
            )}
          </Pressable>
        </View>

        {/* Log på Button */}
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className={`w-full max-w-sm bg-white rounded-lg px-4 py-4 mb-4 ${loading ? 'opacity-50' : ''}`}
        >
          <Text className="text-black text-center font-medium">
            {loading ? 'Logger ind...' : 'Log på'}
          </Text>
        </Pressable>

        {/* Forgot Password Link */}
        <Pressable className="mb-8">
          <Text className="text-gray-400 text-sm">Glemt adgangskode?</Text>
        </Pressable>

        {/* Or Separator */}
        <View className="w-full max-w-sm flex-row items-center mb-8">
          <View className="flex-1 h-px bg-gray-600" />
          <Text className="px-4 text-gray-400 text-sm">Eller</Text>
          <View className="flex-1 h-px bg-gray-600" />
        </View>

        {/* Create Account Button */}
        <Pressable
          onPress={() => router.push('/(auth)/register' as any)}
          className="w-full max-w-sm bg-[#2c2c2c] rounded-lg px-4 py-4"
        >
          <Text className="text-white text-center font-medium">Opret konto</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
