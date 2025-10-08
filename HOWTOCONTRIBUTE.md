# How to Contribute to AREA Mobile

Thank you for your interest in contributing to AREA Mobile! This guide will help you get started.

---

## Quick Start

### 1. Fork & Clone

```bash
# Fork the project on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/AREA_Mobile.git
cd AREA_Mobile

# Add upstream remote
git remote add upstream https://github.com/SamTess/AREA_Mobile.git
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Create a Branch

```bash
# Get latest changes
git checkout main
git pull upstream main

# Create your branch
git checkout -b feature/my-feature
```

Branch naming:
- `feature/` - New feature
- `fix/` - Bug fix
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Tests
- `chore/` - Maintenance

---

## Development

### Run the App

```bash
yarn start    # Start Expo
yarn android  # Run on Android
yarn ios      # Run on iOS
```

### Run Tests

```bash
yarn test          # Run all tests
yarn test:watch    # Watch mode
yarn lint          # Check code style
```

---

## Commit Convention

### Format

```
[TYPE](scope/file): message

[optional body]

[optional footer]
```

### Types

- **feat** - New feature
- **fix** - Bug fix
- **bonus** - Epitech bonus
- **doc** - Documentation changes
- **style** - Code formatting (no behavior change)
- **refactor** - Code refactoring
- **perf** - Performance improvement
- **test** - Adding or modifying tests
- **chore** - Maintenance tasks
- **build** - Build configuration changes
- **ci** - CI configuration changes

### Examples

**Simple commit:**
```bash
git commit -m "[feat](login): add login functionality"
```

**With body:**
```bash
git commit -m "[feat](login): add login functionality

Add login feature with form validation."
```

**Closing an issue:**
```bash
git commit -m "[fix](auth): fix token expiration

Fix token refresh logic.

Closes #123"
```

**Or:**
```bash
git commit -m "[feat](test.c): add test for normies

Add test file for nothing at all.

Fixes #4334"
```

---

## Code Standards

### TypeScript

✅ **Do:**
- Always type your functions and props
- Use interfaces for complex objects
- Avoid `any`, use `unknown` instead

```typescript
interface UserProps {
  name: string;
  email: string;
}

function UserCard({ name, email }: UserProps) {
  // ...
}
```

❌ **Don't:**
```typescript
function UserCard(props: any) {
  // Bad - avoid any
}
```

### Components

Structure:
1. Imports
2. Types/Interfaces
3. Component function
4. Export

```typescript
import { useState } from 'react';

interface Props {
  title: string;
}

function MyComponent({ title }: Props) {
  const [count, setCount] = useState(0);
  
  return <Box>{title}</Box>;
}

export default MyComponent;
```

### Styling

Use NativeWind (Tailwind):

```tsx
<Box className="flex-1 bg-background-50 p-4">
  <Text className="text-lg font-bold">Hello</Text>
</Box>
```

### Internationalization

Always use i18n:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('home.greeting')}</Text>;
}
```

Never hardcode text:
```tsx
// ❌ Don't
<Text>Hello</Text>

// ✅ Do
<Text>{t('common.hello')}</Text>
```

---

## Testing

### Rules

1. Every new component must have tests
2. Every new service must have tests
3. Don't decrease code coverage (currently 75.7%)
4. Test edge cases

### Example

```tsx
import { render, screen } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeTruthy();
  });
});
```

---

## Pull Request

### Before Creating a PR

Checklist:
- [ ] Tests pass: `yarn test`
- [ ] No lint errors: `yarn lint`
- [ ] Code follows project conventions
- [ ] Documentation updated if needed
- [ ] Translations complete (FR + EN)
- [ ] No console.log left behind

### PR Title

Use the same format as commits:
```
[feat](auth): Add OAuth authentication
```

### PR Description

```markdown
## Description
Brief description of changes

## Changes
- Change 1
- Change 2

## Tests
- [x] Unit tests
- [x] Manual tests on iOS/Android

## Related Issue
Closes #123
```

---

## Getting Help

- 📖 Read the [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
- 💬 Create a [GitHub Discussion](https://github.com/SamTess/AREA_Mobile/discussions)
- 🐛 Report a [Bug](https://github.com/SamTess/AREA_Mobile/issues/new)

---

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)

---

**Thank you for contributing! 🎉**
