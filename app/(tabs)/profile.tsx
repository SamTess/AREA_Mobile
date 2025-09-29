import { BadgeCheck, Bell, HelpCircle, LogOut, Settings } from 'lucide-react-native';
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

// Profile Option Item
const ProfileOption: React.FC<{
  icon: any;
  title: string;
  subtitle: string;
  onPress?: () => void;
}> = ({ icon: Icon, title, subtitle, onPress }) => {
  return (
    <Button variant="ghost" onPress={onPress} className="p-4">
      <HStack space="md" align="center" className="w-full">
        <Box className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center">
          <Icon size={20} color="#6366f1" />
        </Box>
        <VStack className="flex-1 gap-1">
          <Text className="text-typography-900 font-medium">
            {title}
          </Text>
          <Text size="sm" className="text-typography-600">
            {subtitle}
          </Text>
        </VStack>
      </HStack>
    </Button>
  );
};

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <Box className="px-6 py-4">
          <Heading size="2xl" className="text-typography-900 mb-2">
            Profil
          </Heading>
          <Text size="md" className="text-typography-600">
            Gérez votre compte et vos préférences
          </Text>
        </Box>

        {/* Profile Card */}
        <Box className="mx-6 mb-6 bg-white rounded-lg p-6 shadow-soft-1">
          <HStack space="md" align="center">
            <Avatar size="xl">
              <AvatarFallbackText>John Doe</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
                }}
              />
              <AvatarBadge />
            </Avatar>
            <VStack className="flex-1 gap-2">
              <HStack space="sm" align="center">
                <Heading size="lg" className="text-typography-900">
                  John Doe
                </Heading>
                <Badge size="sm" variant="solid" action="success">
                  <BadgeText>Vérifié</BadgeText>
                  <BadgeIcon as={BadgeCheck} />
                </Badge>
              </HStack>
              <Text className="text-typography-600">
                john.doe@example.com
              </Text>
              <Badge size="sm" variant="outline" action="info">
                <BadgeText>Membre Premium</BadgeText>
              </Badge>
            </VStack>
          </HStack>
        </Box>

        {/* Options */}
        <VStack className="mx-6 gap-2">
          <ProfileOption
            icon={Settings}
            title="Paramètres"
            subtitle="Configurez votre application"
          />
          <Divider className="my-2" />
          <ProfileOption
            icon={Bell}
            title="Notifications"
            subtitle="Gérez vos notifications"
          />
          <ProfileOption
            icon={HelpCircle}
            title="Aide et support"
            subtitle="Obtenez de l'aide"
          />
          <Divider className="my-2" />
          <ProfileOption
            icon={LogOut}
            title="Se déconnecter"
            subtitle="Quitter votre compte"
          />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}