# Maestro Test Structure Overview

Visual overview of the test file organization.

## Directory Tree

```
.maestro/
│
├── config.yaml                    # Global Maestro configuration
├── README.md                      # Main documentation
├── QUICKSTART.md                  # Quick start guide
├── STRUCTURE.md                   # This file
│
├── tests/                         # All test files
│   │
│   ├── auth/                      # 🔐 Authentication Tests
│   │   ├── login.yaml             # User login flow
│   │   ├── register.yaml          # User registration flow
│   │   └── logout.yaml            # User logout flow
│   │
│   ├── navigation/                # 🧭 Navigation Tests
│   │   ├── tabs.yaml              # Tab navigation
│   │   └── deep-linking.yaml      # Deep linking functionality
│   │
│   ├── maps/                      # 🗺️ Maps Tests
│   │   ├── basic.yaml             # Basic maps functionality
│   │   ├── location-permissions.yaml  # Location permission handling
│   │   └── markers.yaml           # Map marker interactions
│   │
│   ├── profile/                   # 👤 Profile Tests
│   │   ├── settings.yaml          # Profile settings screen
│   │   └── information.yaml       # Profile information viewing/editing
│   │
│   ├── teams/                     # 👥 Teams Tests
│   │   ├── create.yaml            # Creating a new team
│   │   └── view.yaml              # Viewing team details
│   │
│   ├── chat/                      # 💬 Chat Tests
│   │   └── send-message.yaml      # Sending messages in chat
│   │
│   ├── challenges/                # 🏆 Challenges Tests
│   │   ├── create.yaml            # Creating a new challenge
│   │   └── view.yaml              # Viewing challenge details
│   │
│   ├── suites/                    # 📦 Test Suites (Groups of Tests)
│   │   ├── smoke.yaml             # Quick smoke tests (critical functionality)
│   │   ├── auth.yaml              # All authentication tests
│   │   └── full.yaml              # Complete test suite (all tests)
│   │
│   └── README.md                  # Detailed test structure documentation
│
└── examples/                      # 📚 Example Files
    └── example-with-testids.yaml  # Best practices example using testIDs
```

## Test Categories

### 🔐 Authentication (`tests/auth/`)

- **login.yaml**: User login flow
- **register.yaml**: User registration
- **logout.yaml**: Logout functionality

### 🧭 Navigation (`tests/navigation/`)

- **tabs.yaml**: Tab navigation between screens
- **deep-linking.yaml**: Deep linking functionality

### 🗺️ Maps (`tests/maps/`)

- **basic.yaml**: Basic maps functionality
- **location-permissions.yaml**: Location permission handling
- **markers.yaml**: Map marker interactions (challenges, facilities)

### 👤 Profile (`tests/profile/`)

- **settings.yaml**: Profile settings screen
- **information.yaml**: Profile information viewing/editing

### 👥 Teams (`tests/teams/`)

- **create.yaml**: Creating a new team
- **view.yaml**: Viewing team details

### 💬 Chat (`tests/chat/`)

- **send-message.yaml**: Sending messages in chat

### 🏆 Challenges (`tests/challenges/`)

- **create.yaml**: Creating a new challenge
- **view.yaml**: Viewing challenge details

### 📦 Test Suites (`tests/suites/`)

- **smoke.yaml**: Quick critical tests (login + navigation)
- **auth.yaml**: All authentication tests grouped together
- **full.yaml**: Complete test suite running all tests

## Quick Reference

### Run Tests by Category

```bash
npm run test:e2e:smoke        # Quick smoke tests
npm run test:e2e:auth         # All auth tests
npm run test:e2e:full         # All tests
npm run test:e2e:login        # Login test only
npm run test:e2e:maps         # Maps tests
npm run test:e2e:teams        # Teams tests
npm run test:e2e:chat         # Chat tests
npm run test:e2e:challenges   # Challenges tests
npm run test:e2e:profile      # Profile tests
```

### Run Individual Test Files

```bash
maestro test .maestro/tests/auth/login.yaml --env APP_ID=com.daniellorenzen.challenger
maestro test .maestro/tests/maps/basic.yaml --env APP_ID=com.daniellorenzen.challenger
```

### Run All Tests in a Directory

```bash
maestro test .maestro/tests/auth/ --env APP_ID=com.daniellorenzen.challenger
maestro test .maestro/tests/maps/ --env APP_ID=com.daniellorenzen.challenger
```

## Adding New Tests

1. **Choose the right directory**: Place your test in the appropriate feature directory
2. **Follow naming conventions**: Use descriptive names like `create.yaml`, `view.yaml`, `edit.yaml`
3. **Add tags**: Include relevant tags for filtering and organization
4. **Update suites**: Add new tests to appropriate test suites in `tests/suites/`

## Benefits of This Structure

✅ **Easy to navigate**: Tests organized by feature/domain  
✅ **Scalable**: Easy to add new tests without cluttering  
✅ **Clear organization**: Know exactly where to find or add tests  
✅ **Test suites**: Group related tests for easy execution  
✅ **Maintainable**: Changes to one feature don't affect others  
