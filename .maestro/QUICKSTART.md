# Maestro Quick Start Guide

Get started with Maestro E2E testing in 5 minutes!

## Step 1: Install Maestro

```bash
# macOS/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Or using Homebrew (macOS)
brew tap mobile-dev-inc/tap
brew install maestro

# Verify installation
maestro --version
```

## Step 2: Build and Install Your App

Make sure your app is running on a simulator or device:

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

## Step 3: Run Your First Test

```bash
# Run smoke tests (quick critical tests)
npm run test:e2e:smoke

# Or run a specific test
npm run test:e2e:login -- --env TEST_EMAIL=test@example.com --env TEST_PASSWORD=testpass

# Or run all tests
npm run test:e2e
```

## Step 4: Use Maestro Studio (Recommended)

Maestro Studio provides a visual interface to explore your app and generate tests:

```bash
maestro studio
```

This will:

1. Open a web interface
2. Connect to your running app
3. Let you record interactions
4. Generate test flows automatically

## Step 5: Customize Tests

1. **Add testID props to your components** for reliable selectors:

```tsx
// Example: Login button
<Pressable testID="login-button" onPress={handleLogin}>
  <Text>Log på</Text>
</Pressable>

// Example: Email input
<TextInput
  testID="email-input"
  placeholder="E-mail"
  value={email}
  onChangeText={setEmail}
/>
```

2. **Update test flows** in `.maestro/tests/**/*.yaml` files to use your testIDs

3. **Run tests** to verify they work

## Common Commands

```bash
# Run smoke tests (quick critical tests)
npm run test:e2e:smoke

# Run all tests
npm run test:e2e

# Run test suites
npm run test:e2e:auth      # All auth tests
npm run test:e2e:full      # All tests

# Run specific test categories
npm run test:e2e:login
npm run test:e2e:maps
npm run test:e2e:teams

# Run with custom environment variables
maestro test .maestro/tests/auth/login.yaml \
  --env APP_ID=com.daniellorenzen.challenger \
  --env TEST_EMAIL=your@email.com \
  --env TEST_PASSWORD=yourpassword

# Inspect app elements
maestro inspect

# Record a new test flow
maestro studio
```

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check out [example-with-testids.yaml](./example-with-testids.yaml) for best practices
- Visit [Maestro Documentation](https://maestro.mobile.dev/) for advanced features

## Troubleshooting

**App not found?**

- Make sure the app is installed and running
- Verify APP_ID matches your bundle identifier

**Elements not found?**

- Use `maestro studio` to explore your app
- Add `testID` props to components
- Check element visibility (may need scrolling)

**Need help?**

- Check [Maestro Documentation](https://maestro.mobile.dev/)
- Review test examples in `.maestro/tests/` directory
- See [tests/README.md](./tests/README.md) for test structure overview
