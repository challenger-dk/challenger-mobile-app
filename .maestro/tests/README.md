# Test Structure Overview

This directory contains all Maestro E2E tests organized by feature/domain.

## Directory Structure

```
tests/
├── auth/              # Authentication tests (working)
│   ├── helpers/
│   │   └── logout.yaml
│   ├── login.yaml
│   └── register.yaml
└── suites/            # Test suites (groups of tests)
    ├── smoke.yaml     # Quick smoke tests
    ├── auth.yaml      # All auth tests
    └── full.yaml      # All tests (runs in correct order)
```

## Running Tests

### Run Individual Test Files

```bash
# Run a specific test
maestro test .maestro/tests/auth/login.yaml --env MAESTRO_APP_ID=com.daniellorenzen.challenger

# Run all tests in a directory
maestro test .maestro/tests/auth/ --env MAESTRO_APP_ID=com.daniellorenzen.challenger
```

### Run Test Suites

```bash
# Run all tests (recommended - runs tests in correct order)
npm run test:e2e
# or
maestro test .maestro/tests/suites/full.yaml --env MAESTRO_APP_ID=com.daniellorenzen.challenger

# Run smoke tests (quick critical tests)
npm run test:e2e:smoke
# or
maestro test .maestro/tests/suites/smoke.yaml --env MAESTRO_APP_ID=com.daniellorenzen.challenger

# Run all auth tests
npm run test:e2e:auth
# or
maestro test .maestro/tests/suites/auth.yaml --env MAESTRO_APP_ID=com.daniellorenzen.challenger
```

## Test Categories

### Authentication (`auth/`)

- **login.yaml**: Tests user login flow
- **register.yaml**: Tests user registration
- **helpers/logout.yaml**: Helper flow for logout functionality

## Adding New Tests

1. **Start simple**: Begin with basic navigation and assertions
2. **Use proper selectors**: Use test IDs, text, or IDs instead of placeholder selectors
3. **Follow naming conventions**: Use descriptive names like `create.yaml`, `view.yaml`, `edit.yaml`
4. **Add tags**: Include relevant tags for filtering and organization
5. **Update suites**: Add new tests to appropriate test suites in `suites/`

## Test Dependencies and Order

Tests are run in a specific order to handle dependencies:

1. **Register** - Creates a new test user (runs first)
2. **Login** - Authenticates with existing user (runs after register)
3. **Other tests** - Any tests that require authentication (will run after login)

The `full.yaml` suite automatically handles this ordering. When adding new tests:

- Add authenticated tests to `full.yaml` after the login flow
- Tests that don't require auth can be added before login
- Use `runFlow` in suites to maintain proper order
