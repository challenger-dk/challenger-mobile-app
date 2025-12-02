# Maestro Test Data Configuration

This directory contains test data configuration files for Maestro E2E tests.

## Files

- `test-data.env` - Environment variables with test user credentials and test data
- `test-data.yaml` - Documentation reference for all test data variables

## Usage

### Option 1: Using Environment Variables (Recommended)

Load the test data before running tests:

```bash
# Source the env file and run tests
export $(cat .maestro/test-data.env | xargs) && maestro test .maestro/tests/auth/login.yaml

# Or use with npm scripts (they're already configured)
npm run test:e2e:login
```

### Option 2: Using Maestro's --env Flag

Pass variables directly:

```bash
maestro test .maestro/tests/auth/login.yaml \
  --env USER1_EMAIL=user1@challenger.dk \
  --env USER1_PASSWORD=password12
```

### Option 3: Set in Shell Environment

```bash
export USER1_EMAIL=user1@challenger.dk
export USER1_PASSWORD=password12
maestro test .maestro/tests/auth/login.yaml
```

## Available Test Data Variables

### User Credentials

- `USER1_EMAIL` - Email for test user 1
- `USER1_PASSWORD` - Password for test user 1
- `USER2_EMAIL` - Email for test user 2 (if needed)
- `USER2_PASSWORD` - Password for test user 2 (if needed)
- `USER3_EMAIL` - Email for test user 3 (if needed)
- `USER3_PASSWORD` - Password for test user 3 (if needed)

### Registration Test Data

- `TEST_REGISTER_EMAIL` - Email for registration tests
- `TEST_REGISTER_PASSWORD` - Password for registration tests
- `TEST_REGISTER_NAME` - First name for registration tests

### Challenge Test Data

- `TEST_CHALLENGE_NAME` - Name for challenge creation tests
- `TEST_CHALLENGE_DESCRIPTION` - Description for challenge creation tests

### Team Test Data

- `TEST_TEAM_NAME` - Name for team creation tests
- `TEST_TEAM_DESCRIPTION` - Description for team creation tests

### Chat Test Data

- `TEST_MESSAGE` - Default message text for chat tests

### App Configuration

- `MAESTRO_APP_ID` - App identifier for Maestro tests
- `APP_ID` - App identifier (alternative name)

## Updating Test Data

Edit `.maestro/test-data.env` to change test data values. All test files reference these variables using `${VARIABLE_NAME}` syntax.

## Best Practices

1. **Never commit real user credentials** - Use test accounts only
2. **Keep test data consistent** - Update all related tests when changing test data
3. **Use descriptive variable names** - Makes tests more maintainable
4. **Document new variables** - Add them to both `test-data.env` and `test-data.yaml`
