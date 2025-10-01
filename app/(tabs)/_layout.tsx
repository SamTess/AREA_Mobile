import { useAuth } from '@/contexts/AuthContext';
import { Tabs, useRouter } from 'expo-router';
import { Home, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const getColorValue = (token: string) => {
    const tokenMap = {
      'indigo-600': colorScheme === 'dark' ? 'rgb(129 140 248)' : 'rgb(99 102 241)',
      'gray-500': colorScheme === 'dark' ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
      'gray-200': colorScheme === 'dark' ? 'rgb(75 85 99)' : 'rgb(229 231 235)',
      'background-0': colorScheme === 'dark' ? 'rgb(18 18 18)' : 'rgb(255 255 255)',
    };
    return tokenMap[token as keyof typeof tokenMap];
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: getColorValue('indigo-600'),
        tabBarInactiveTintColor: getColorValue('gray-500'),
        headerShown: false,
        tabBarStyle: {
          backgroundColor: getColorValue('background-0'),
          borderTopWidth: 1,
          borderTopColor: getColorValue('gray-200'),
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      {/* Login and Register are hidden from the navigation bar */}
      <Tabs.Screen
        name="login"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              router.push('/(tabs)/login');
            }
          },
        }}
      />
    </Tabs>
  );
}