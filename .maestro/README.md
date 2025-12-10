# Maestro End-to-End Testing

This directory contains Maestro test flows for end-to-end testing of the Challenger Mobile app.

## 📁 Directory Structure

```
.maestro/
├── config.yaml              # Global Maestro configuration
├── tests/                   # All test files organized by feature
│   ├── auth/                # Authentication tests
│   ├── navigation/          # Navigation tests
│   ├── maps/                # Maps functionality tests
│   ├── profile/             # Profile tests
│   ├── teams/               # Teams tests
│   ├── chat/                # Chat tests
│   ├── challenges/          # Challenges tests
│   └── suites/              # Test suites (groups of tests)
├── examples/                # Example test files
├── README.md                # This file
└── QUICKSTART.md            # Quick start guide
```

See [tests/README.md](./tests/README.md) for detailed test structure overview.

## Prerequisites

1. **Install Maestro CLI**

   ```bash
   # macOS/Linux
   curl -Ls "https://get.maestro.mobile.dev" | bash

   # Or using Homebrew
   brew tap mobile-dev-inc/tap
   brew install maestro

   # Verify installation
   maestro --version
   ```

2. **Build and install the app on a device or simulator**

   ```bash
   # For iOS Simulator
   npm run ios

   # For Android Emulator
   npm run android
   ```

## Configuration

The `config.yaml` file contains global Maestro configuration. App IDs are:

- **iOS**: `com.daniellorenzen.challenger`
- **Android**: `com.daniellorenzen.challenger`

## Running Tests

### Quick Start

```bash
# Run smoke tests (quick critical tests)
npm run test:e2e:smoke

# Run all tests
npm run test:e2e
```

### Test Suites

Test suites group related tests together:

```bash
# Smoke tests (quick critical tests)
npm run test:e2e:smoke

# All authentication tests
npm run test:e2e:auth

# Full test suite (all tests)
npm run test:e2e:full
```

### Individual Test Categories

```bash
# Authentication
npm run test:e2e:login
npm run test:e2e:register
npm run test:e2e:logout

# Navigation
npm run test:e2e:navigation

# Maps
npm run test:e2e:maps

# Teams
npm run test:e2e:teams

# Chat
npm run test:e2e:chat

# Challenges
npm run test:e2e:challenges

# Profile
npm run test:e2e:profile
```

### Run Specific Test Files

```bash
# Run a specific test file
maestro test .maestro/tests/auth/login.yaml --env APP_ID=com.daniellorenzen.challenger

# Run all tests in a directory
maestro test .maestro/tests/auth/ --env APP_ID=com.daniellorenzen.challenger
```

### Run with Custom Environment Variables

```bash
maestro test .maestro/tests/auth/login.yaml \
  --env APP_ID=com.daniellorenzen.challenger \
  --env TEST_EMAIL=test@example.com \
  --env TEST_PASSWORD=testpass123
```

## Environment Variables

Common environment variables used in tests:

- `APP_ID`: App bundle identifier (required)
- `TEST_EMAIL`: Test user email (for login tests)
- `TEST_PASSWORD`: Test user password (for login tests)
- `TEST_REGISTER_EMAIL`: New user email (for registration tests)
- `TEST_REGISTER_PASSWORD`: New user password (for registration tests)
- `TEST_TEAM_NAME`: Team name (for team creation tests)
- `TEST_CHALLENGE_NAME`: Challenge name (for challenge creation tests)

## Test Organization

Tests are organized by feature/domain:

- **`tests/auth/`**: Login, registration, logout
- **`tests/navigation/`**: Tab navigation, deep linking
- **`tests/maps/`**: Maps functionality, location permissions, markers
- **`tests/profile/`**: Profile settings, information
- **`tests/teams/`**: Team creation, viewing teams
- **`tests/chat/`**: Sending messages
- **`tests/challenges/`**: Challenge creation, viewing challenges
- **`tests/suites/`**: Pre-configured test suites

## Customizing Tests

### Finding Element Selectors

Maestro can help you find elements:

1. **Use Maestro Studio** (recommended):

   ```bash
   maestro studio
   ```

   This opens an interactive UI to explore your app and generate test flows.

2. **Use Maestro's element inspector**:

   ```bash
   maestro inspect
   ```

### Common Selectors

- **By text**: `tapOn: "Log på"`
- **By ID**: `tapOn: { id: "login-button" }`
- **By index**: `tapOn: { index: 0 }`
- **By regex**: `tapOn: { text: ".*Login.*" }`

### Best Practices

1. **Use test IDs**: Add `testID` props to your React Native components for reliable selectors:

   ```tsx
   <Pressable testID="login-button">
     <Text>Log på</Text>
   </Pressable>
   ```

2. **Wait for animations**: Use `waitForAnimationToEnd` after navigation or state changes.

3. **Use assertions**: Verify expected states with `assertVisible`, `assertNotVisible`, etc.

4. **Handle async operations**: Use `wait` or `waitForAnimationToEnd` for network requests.

5. **Organize tests**: Place tests in appropriate feature directories and use tags.

## Troubleshooting

### App not found

- Ensure the app is installed on the device/simulator
- Verify the `APP_ID` matches your app's bundle identifier
- Check that the device/simulator is running

### Elements not found

- Use Maestro Studio to inspect the app
- Add `testID` props to components for reliable selectors
- Check if elements are visible (may need scrolling or navigation)

### Tests timing out

- Increase timeout in `config.yaml`
- Add explicit waits for async operations
- Check network connectivity for API calls

### Location permissions

- Grant location permissions manually before running map tests
- Or use Maestro's permission handling commands

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro GitHub](https://github.com/mobile-dev-inc/maestro)
- [Maestro Examples](https://maestro.mobile.dev/examples)
- See [tests/README.md](./tests/README.md) for detailed test structure

## CI/CD Integration

Maestro can be integrated into CI/CD pipelines. Example GitHub Actions workflow:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
      - name: Run Smoke Tests
        run: npm run test:e2e:smoke
      - name: Run Full Test Suite
        run: npm run test:e2e:full
```
