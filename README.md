# Challenger Mobile

A React Native mobile application built with Expo for managing challenges, teams, and tournaments.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- For iOS development: Xcode (macOS only)
- For Android development: Android Studio
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed globally (optional, but recommended)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

- `EXPO_PUBLIC_API_BASE_URL`: Your backend API base URL
- `EXPO_PUBLIC_TOMTOM_API_KEY`: Your TomTom API key for location services

**Important Notes:**

- For iOS Simulator: Use `http://localhost:PORT`
- For Android Emulator: Use `http://10.0.2.2:PORT` (10.0.2.2 maps to host machine's localhost)
- For Physical Devices: Use `http://YOUR_COMPUTER_IP:PORT` (e.g., `http://192.168.1.100:3000`)

### 3. Running the App

#### Development Server

Start the Expo development server:

```bash
npx expo start
```

This will open the Expo DevTools where you can:

- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on physical device

#### Running on iOS

To run the app directly on iOS simulator or device:

```bash
npx expo run:ios
```

Or use the npm script:

```bash
npm run ios
```

**Requirements:**

- macOS with Xcode installed
- iOS Simulator or physical iOS device connected
- CocoaPods dependencies will be installed automatically

#### Running on Android

To run the app directly on Android emulator or device:

```bash
npx expo run:android
```

Or use the npm script:

```bash
npm run android
```

**Requirements:**

- Android Studio installed
- Android emulator running or physical Android device connected via USB with USB debugging enabled
- Android SDK and build tools configured

## Building for Production

This project uses [Expo Application Services (EAS)](https://docs.expo.dev/build/introduction/) for building production apps.

### EAS Build Prerequisites

1. Install EAS CLI globally:

```bash
npm install -g eas-cli
```

1. Login to your Expo account:

```bash
eas login
```

1. Configure your project (if not already done):

```bash
eas build:configure
```

### Building

#### Development Build

Build a development client for testing:

```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

#### Preview Build

Build a preview build for internal testing:

```bash
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

#### Production Build

Build for production and app stores:

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

Build for both platforms:

```bash
eas build --profile production --platform all
```

### Submitting to App Stores

Submit your production build to the App Store and Google Play:

```bash
eas submit --platform ios
eas submit --platform android
```

For more information, see the [EAS Submit documentation](https://docs.expo.dev/submit/introduction/).

## App Icons and Assets

### Generating App Icons

Use the [Expo Icon Generator](https://www.favicon-generator.org/) or [App Icon Generator](https://www.appicon.co/) to generate icons in the required sizes.

Required icon files:

- `assets/images/icon.png` - Main app icon (1024x1024px)
- `assets/images/android-icon-foreground.png` - Android adaptive icon foreground
- `assets/images/android-icon-background.png` - Android adaptive icon background
- `assets/images/android-icon-monochrome.png` - Android monochrome icon
- `assets/images/favicon.png` - Web favicon
- `assets/images/splash-icon.png` - Splash screen icon

### Icon Resources

- [Expo Icon Guidelines](https://docs.expo.dev/guides/app-icons/)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [iOS App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)

## Project Structure

```text
challenger-mobile/
├── app/                    # App routes (Expo Router)
│   ├── (auth)/            # Authentication routes
│   ├── (tabs)/             # Tab navigation routes
│   ├── hub/                # Challenge hub routes
│   ├── profile/            # Profile routes
│   └── teams/              # Team management routes
├── api/                    # API client functions
├── components/             # Reusable React components
├── contexts/               # React contexts (Auth, etc.)
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── assets/                 # Images, fonts, and other assets
├── app.config.js          # Expo configuration (supports environment variables)
└── eas.json               # EAS Build configuration
```

## Development

### Code Style

This project uses ESLint for code quality. Run the linter:

```bash
npm run lint
```

### File-based Routing

This project uses [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing. Routes are defined in the `app/` directory.

## Learn More

- [Expo Documentation](https://docs.expo.dev/): Learn fundamentals and advanced topics
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/): File-based routing for React Native
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/): Building native apps with EAS
- [React Native Documentation](https://reactnative.dev/docs/getting-started): React Native fundamentals

## Troubleshooting

### iOS Build Issues

- Ensure Xcode is up to date
- Run `cd ios && pod install` if CocoaPods dependencies are missing
- Clean build folder: `npx expo run:ios --clean`

### Android Build Issues

- Ensure Android SDK and build tools are properly installed
- Check that `ANDROID_HOME` environment variable is set
- Clean build: `npx expo run:android --clean`

### Environment Variables Not Working

- Ensure `.env` file exists in the root directory
- Restart the Expo development server after changing `.env`
- Environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app

## Environment Variables for Production Builds

When building for production with EAS Build, environment variables from your local `.env` file are **not automatically included**. You need to configure them using one of the following methods:

### Method 1: EAS Secrets (Required for Production)

EAS Secrets is the recommended way to store sensitive environment variables for production builds. Secrets are encrypted and stored securely, and **will not be exposed in your repository**.

#### Setting Up EAS Secrets

You need to create secrets for both your production API URL and TomTom API key:

1. Create a secret for your production API URL:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value "public_api" --type string
```

2. Create a secret for your TomTom API key:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_TOMTOM_API_KEY --value "your_tomtom_api_key" --type string
```

3. List your secrets to verify:

```bash
eas secret:list
```

The `eas.json` file is already configured to use these secrets for production builds. They will be automatically injected during the build process.

### Method 2: Local Environment Variables (For Development)

For local development, create a `.env` file in the root directory:

1. Create a `.env` file:

```bash
# For local development, use localhost
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_TOMTOM_API_KEY=your_tomtom_api_key
```

**Note**:

- For iOS Simulator: Use `http://localhost:3000`
- For Android Emulator: Use `http://10.0.2.2:3000` (10.0.2.2 maps to host machine's localhost)
- For Physical Devices: Use `http://YOUR_COMPUTER_IP:3000`

2. The `app.config.js` file will automatically load these variables using `dotenv`.

3. Restart the Expo development server after creating or modifying the `.env` file.

### Important Notes

- **For Production Builds**: Always use EAS Secrets to keep sensitive information secure and out of your repository
- **For Development**: Use `.env` file for local development (already in `.gitignore`)
- **Variable Names**: All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app
- **After Changes**: Restart the Expo development server after changing `.env` files
- **Build Time**: Environment variables are embedded at build time, not runtime
- **Security**: Never commit production URLs or API keys to your repository - always use EAS Secrets

### Required Environment Variables

- `EXPO_PUBLIC_API_BASE_URL`: Your backend API base URL
  - Development: `http://localhost:3000` (iOS) or `http://10.0.2.2:3000` (Android)
  - Production: Set via EAS Secrets
- `EXPO_PUBLIC_TOMTOM_API_KEY`: Your TomTom API key for location services
  - Get your key from: <https://developer.tomtom.com/>
  - Set via EAS Secrets for production builds

### Verifying Environment Variables

After building, you can verify that environment variables are set correctly by checking the app's configuration. The variables are available in your code via `process.env.EXPO_PUBLIC_*`.
