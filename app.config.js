import 'dotenv/config';

export default {
  expo: {
    name: 'challenger-mobile',
    slug: 'challenger-mobile',
    version: '1.0.5',
    orientation: 'portrait',
    icon: './assets/App_Logo.png',
    scheme: 'challengermobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.daniellorenzen.challenger',
      buildNumber: '1.0.0',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription: 'This app needs access to your location to show your position on the map and help you find nearby challenges and facilities.',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'This app needs access to your location to show your position on the map and help you find nearby challenges and facilities.',
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
      versionCode: 1,
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        },
      },
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
          googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        },
      ],
      [
        'expo-location',
        {
          locationWhenInUsePermission: 'This app needs access to your location to show your position on the map and help you find nearby challenges and facilities.',
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

