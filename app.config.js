import 'dotenv/config';

export default {
  expo: {
    name: 'challenger-mobile',
    slug: 'challenger-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'challengermobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.daniellorenzen.challenger',
      buildNumber: '1.0.0',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.daniellorenzen.challenger',
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#171616',
          dark: {
            backgroundColor: '#171616',
          },
        },
      ],
      [
        'react-native-maps',
        {
          googleMapsApiKey: '',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '0406f4ec-1402-4c82-9684-2fa39495fdec',
      },
      // Expose environment variables to the app
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '',
      tomtomApiKey: process.env.EXPO_PUBLIC_TOMTOM_API_KEY || '',
    },
  },
};

