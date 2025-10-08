# AREA Mobile - Architecture

Software architecture and design patterns reference.

---

## Overview

### Layer Architecture

```
┌─────────────────────────────┐
│   Presentation Layer        │  Screens, Components
├─────────────────────────────┤
│   Application Logic         │  Contexts, Hooks
├─────────────────────────────┤
│   Business Logic            │  Services, Validators
├─────────────────────────────┤
│   Data Layer                │  API, Storage
└─────────────────────────────┘
```

### Data Flow

```
User Input
    ↓
Component Handler
    ↓
Context Action
    ↓
Service Call
    ↓
API Request
    ↓
State Update
    ↓
Re-render
```

---

## Design Patterns

### 1. Context Pattern

Global state management for authentication.

```typescript
// contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };
  
  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
}
```

**Benefits:**
- Global state accessible everywhere
- No prop drilling
- Type-safe with TypeScript

### 2. Service Layer

Business logic abstraction.

```typescript
// services/auth.ts
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    await storage.saveTokens(response.tokens);
    return response;
  },
  
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    await storage.clearTokens();
  }
};
```

**Benefits:**
- Centralized business logic
- Easy to test (mock services)
- Separation of concerns
- Reusable

### 3. Repository Pattern

Data source abstraction.

```typescript
// services/storage.ts
export const storage = {
  async saveTokens(tokens: Tokens): Promise<void> {
    await SecureStore.setItemAsync('access_token', tokens.access);
    await SecureStore.setItemAsync('refresh_token', tokens.refresh);
  },
  
  async getTokens(): Promise<Tokens | null> {
    const access = await SecureStore.getItemAsync('access_token');
    const refresh = await SecureStore.getItemAsync('refresh_token');
    return access && refresh ? { access, refresh } : null;
  }
};
```

**Benefits:**
- Storage abstraction (can change implementation)
- Stable interface
- Testable with mocks

### 4. Composition Pattern

Reusable and composable components.

```typescript
// Atomic component
function Avatar({ url }: { url: string }) {
  return <Image source={{ uri: url }} className="w-12 h-12 rounded-full" />;
}

// Composed component
function UserCard({ user }: { user: User }) {
  return (
    <Box className="flex-row items-center p-4">
      <Avatar url={user.avatarUrl} />
      <VStack className="ml-3">
        <Text className="font-bold">{user.name}</Text>
        <Text className="text-gray-500">{user.email}</Text>
      </VStack>
    </Box>
  );
}
```

### 5. Custom Hooks

Reusable logic encapsulation.

```typescript
function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  
  const setValue = (key: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };
  
  return { values, errors, setValue };
}

// Usage
function LoginScreen() {
  const { values, errors, setValue } = useForm({
    email: '',
    password: ''
  });
  
  return (
    <Input 
      value={values.email}
      onChangeText={(text) => setValue('email', text)}
    />
  );
}
```

---

## State Management

### Local vs Global State

**Local State** (useState):
- Component-specific state
- No need to share
- Temporary data (forms, UI toggles)

```typescript
function Counter() {
  const [count, setCount] = useState(0);
  return <Button onPress={() => setCount(c => c + 1)}>{count}</Button>;
}
```

**Global State** (Context):
- Shared between components
- Persists across navigation
- User data, authentication

```typescript
const { user } = useAuth(); // Accessible everywhere
```

---

## Navigation

### File-based Routing

```
app/
├── _layout.tsx           → Root layout
├── index.tsx             → / (Home)
├── details.tsx           → /details
└── (tabs)/               → Tab group
    ├── _layout.tsx       → Tabs layout
    ├── index.tsx         → /(tabs)
    └── profile.tsx       → /(tabs)/profile
```

### Programmatic Navigation

```typescript
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  
  router.push('/profile');      // Navigate
  router.replace('/login');     // Replace (no back)
  router.back();                // Go back
}
```

### Route Protection

```typescript
function ProtectedScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) return null;
  
  return <View>Protected Content</View>;
}
```

---

## Styling System

### Architecture

```
Tailwind (NativeWind)
    ↓
Gluestack Theme
    ↓
Component Classes
```

### Design Tokens

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3b82f6', // Main color
        }
      }
    }
  }
};
```

### Usage

```tsx
// NativeWind
<Text className="text-primary-500 font-bold text-lg">
  Hello
</Text>

// Gluestack
<Button className="bg-primary-500 hover:bg-primary-600">
  <ButtonText>Click me</ButtonText>
</Button>
```

---

## Design Decisions

### Why Expo?
- Fast development with hot reload
- Multi-platform (iOS, Android, Web)
- OTA updates without stores
- Cloud builds (EAS)

### Why Gluestack-UI?
- Accessible components (ARIA compliant)
- Customizable theming
- Type-safe (TypeScript first)
- Optimized performance

### Why NativeWind?
- Familiar (if you know Tailwind)
- Fast development
- Responsive breakpoints
- VSCode autocomplete

### Why Context API?
- Simple, less boilerplate
- Built-in (no external dependency)
- Sufficient for simple global state
- Easy to migrate to Zustand/Redux if needed

### Why Yarn?
- Deterministic (yarn.lock)
- Fast (parallel installation)
- Monorepo support (workspaces)
- npm compatible

---

**Last updated**: October 2025
