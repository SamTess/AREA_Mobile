import { router } from 'expo-router';
import { Activity, ArrowRight, Bell, CheckCircle, Clock, Github, Mail, Plus, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { useDesignTokens } from '@/components/ui/hooks/useDesignTokens';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

// Types pour les automations
interface Automation {
  id: number;
  name: string;
  action: string;
  reaction: string;
  isActive: boolean;
  triggerCount: number;
  lastTriggered?: string;
}

interface Service {
  id: number;
  name: string;
  icon: any;
  color: string;
  category: string;
}

const AutomationCard: React.FC<{
  automation: Automation;
  onToggle: (id: number) => void;
  onPress: () => void;
}> = ({ automation, onToggle, onPress }) => {
  const { getToken } = useDesignTokens();
  const { t } = useTranslation();
  
  return (
    <Pressable onPress={onPress}>
      <Box className="bg-background-0 rounded-xl p-4 shadow-soft-1 border border-outline-100">
        <VStack space="md">
          {/* Header avec nom et statut */}
          <HStack justify="between" align="center">
            <VStack className="flex-1 pr-2">
              <Heading size="sm" className="text-typography-900 mb-1">
                {automation.name}
              </Heading>
              <HStack space="xs" align="center">
                <Icon 
                  as={automation.isActive ? CheckCircle : Clock} 
                  size="xs" 
                  className={automation.isActive ? "text-success-500" : "text-warning-500"} 
                />
                <Text size="xs" className={automation.isActive ? "text-success-600" : "text-warning-600"}>
                  {automation.isActive ? t('home.statusActive') : t('home.statusInactive')}
                </Text>
              </HStack>
            </VStack>
            {/* Toggle switch simulé avec Badge */}
            <Pressable onPress={() => onToggle(automation.id)}>
              <Badge 
                size="md" 
                variant="solid" 
                action={automation.isActive ? "success" : "muted"}
                className="px-3 py-1"
              >
                <BadgeText>{automation.isActive ? t('home.toggleOn') : t('home.toggleOff')}</BadgeText>
              </Badge>
            </Pressable>
          </HStack>

          <Divider />

          {/* Action → Reaction */}
          <HStack space="sm" align="center">
            <Box className="flex-1 bg-primary-50 rounded-lg p-3">
              <HStack space="xs" align="center" className="mb-1">
                <Icon as={Zap} size="xs" className="text-primary-600" />
                <Text size="xs" className="text-primary-700 font-semibold">{t('home.labelAction')}</Text>
              </HStack>
              <Text size="sm" className="text-typography-900" numberOfLines={2}>
                {automation.action}
              </Text>
            </Box>

            <Icon as={ArrowRight} size="lg" className="text-typography-400" />

            <Box className="flex-1 bg-secondary-50 rounded-lg p-3">
              <HStack space="xs" align="center" className="mb-1">
                <Icon as={Activity} size="xs" className="text-secondary-600" />
                <Text size="xs" className="text-secondary-700 font-semibold">{t('home.labelReaction')}</Text>
              </HStack>
              <Text size="sm" className="text-typography-900" numberOfLines={2}>
                {automation.reaction}
              </Text>
            </Box>
          </HStack>

          {/* Stats */}
          <HStack justify="between" align="center" className="pt-2">
            <HStack space="xs" align="center">
              <Icon as={Activity} size="xs" className="text-typography-500" />
              <Text size="xs" className="text-typography-600">
                {automation.triggerCount} {t('home.triggers')}
              </Text>
            </HStack>
            {automation.lastTriggered && (
              <HStack space="xs" align="center">
                <Icon as={Clock} size="xs" className="text-typography-500" />
                <Text size="xs" className="text-typography-600">
                  {automation.lastTriggered}
                </Text>
              </HStack>
            )}
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );
};

const ServiceCard: React.FC<{
  service: Service;
  onPress: () => void;
}> = ({ service, onPress }) => {
  const { t } = useTranslation();
  const categoryKey = (service.category || '').toLowerCase();
  const categoryLabel = categoryKey === 'dev' || categoryKey === 'productivity'
    ? t(`home.category.${categoryKey}` as any)
    : service.category;
  return (
    <Pressable onPress={onPress} testID={`service-card-${service.name}`}>
      <Box className="bg-background-0 rounded-xl p-4 shadow-soft-1 border border-outline-100 mr-3" style={{ width: 140 }}>
        <VStack space="sm" className="items-center">
          <Box 
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: service.color + '20' }}
          >
            <Icon 
              as={service.icon} 
              size="xl" 
              style={{ color: service.color }}
            />
          </Box>
          <VStack space="xs" className="items-center">
            <Text size="sm" className="text-typography-900 font-semibold text-center">
              {service.name}
            </Text>
            <Badge size="sm" variant="outline" action="muted">
              <BadgeText className="text-xs">{categoryLabel}</BadgeText>
            </Badge>
          </VStack>
        </VStack>
      </Box>
    </Pressable>
  );
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const { getToken } = useDesignTokens();

  // Données mockées pour les automations - VIDE pour le moment
  const [automations, setAutomations] = useState<Automation[]>([]);

  // Services disponibles
  const services: Service[] = [
    { id: 1, name: "GitHub", icon: Github, color: "#181717", category: "Dev" },
    { id: 2, name: "Microsoft", icon: Mail, color: "#00A4EF", category: "Productivity" },
    { id: 3, name: "Google", icon: Mail, color: "#EA4335", category: "Productivity" }
  ];

  const toggleAutomation = (id: number) => {
    setAutomations(prev =>
      prev.map(auto =>
        auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
      )
    );
  };

  const handleCreateNew = () => {
    router.push('/details'); // Temporaire - à remplacer par la vraie page de création
  };

  const handleAutomationPress = () => {
    router.push('/details'); // Temporaire - à remplacer par la page de détails
  };

  const handleServicePress = () => {
    router.push('/details'); // Temporaire - à remplacer par la page de configuration
  };

  const activeCount = automations.filter(a => a.isActive).length;
  const totalTriggers = automations.reduce((sum, a) => sum + a.triggerCount, 0);

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Box className="px-6 py-4">
          <Heading size="2xl" className="text-typography-900 mb-2">
            {t('home.greeting')}
          </Heading>
          <Text size="md" className="text-typography-600">
            {t('home.subtitle')}
          </Text>
        </Box>

        {/* Stats Cards */}
        <HStack space="md" className="px-6 mb-6">
          <Box className="flex-1 bg-primary-600 rounded-xl p-4">
            <VStack space="xs">
              <HStack space="xs" align="center">
                <Icon as={Zap} size="sm" className="text-primary-50" />
                <Text size="xs" className="text-primary-100 font-semibold">{t('home.activesLabel')}</Text>
              </HStack>
              <Heading size="2xl" className="text-typography-0">
                {activeCount}
              </Heading>
              <Text size="xs" className="text-primary-100">
                {t('home.automationsInProgress')}
              </Text>
            </VStack>
          </Box>

          <Box className="flex-1 bg-success-600 rounded-xl p-4">
            <VStack space="xs">
              <HStack space="xs" align="center">
                <Icon as={Activity} size="sm" className="text-success-50" />
                <Text size="xs" className="text-success-100 font-semibold">{t('home.totalLabel')}</Text>
              </HStack>
              <Heading size="2xl" className="text-typography-0">
                {totalTriggers}
              </Heading>
              <Text size="xs" className="text-success-100">
                {t('home.triggers')}
              </Text>
            </VStack>
          </Box>
        </HStack>

        {/* Mes Automations */}
        <VStack className="gap-4 px-6 mb-6">
          <HStack justify="between" align="center">
            <Heading size="lg" className="text-typography-900">
              {t('home.myAutomationsTitle')}
            </Heading>
            <Badge size="sm" variant="solid" action="info">
              <BadgeText>{automations.length}</BadgeText>
            </Badge>
          </HStack>

          {automations.length === 0 ? (
            <Box className="bg-background-0 rounded-xl p-8 border-2 border-dashed border-outline-200">
              <VStack space="md" className="items-center">
                <Box className="w-16 h-16 bg-primary-50 rounded-full items-center justify-center">
                  <Icon as={Zap} size="xl" className="text-primary-600" />
                </Box>
                <VStack space="xs" className="items-center">
                  <Heading size="sm" className="text-typography-900 text-center">
                    {t('home.noAutomationsTitle')}
                  </Heading>
                  <Text size="sm" className="text-typography-600 text-center">
                    {t('home.noAutomationsDesc')}
                  </Text>
                </VStack>
              </VStack>
            </Box>
          ) : (
            <VStack space="md">
              {automations.map((automation) => (
                <AutomationCard
                  key={automation.id}
                  automation={automation}
                  onToggle={toggleAutomation}
                  onPress={handleAutomationPress}
                />
              ))}
            </VStack>
          )}
        </VStack>

        {/* Services Disponibles */}
        <VStack className="gap-4 mb-6">
          <HStack justify="between" align="center" className="px-6">
            <Heading size="lg" className="text-typography-900">
              {t('home.servicesTitle')}
            </Heading>
            <Button variant="link" size="sm">
              <ButtonText className="text-primary-600">
                {t('home.seeAll')}
              </ButtonText>
              <ButtonIcon as={ArrowRight} className="text-primary-600" size="sm" />
            </Button>
          </HStack>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingLeft: 24, 
              paddingRight: 24,
            }}
            decelerationRate="fast"
          >
            <HStack space="md">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onPress={handleServicePress}
                />
              ))}
            </HStack>
          </ScrollView>
        </VStack>

        {/* CTA - Créer nouvelle automation */}
        <Box className="px-6">
          <Box className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 shadow-soft-2">
            <VStack space="md">
              <VStack space="sm">
                <HStack space="sm" align="center">
                  <Icon as={Plus} size="lg" className="text-typography-0" />
                  <Heading size="lg" className="text-typography-0">
                    {t('home.createAutomationTitle')}
                  </Heading>
                </HStack>
                <Text size="md" className="text-primary-100">
                  {t('home.createAutomationSubtitle')}
                </Text>
              </VStack>
              <Button 
                variant="solid" 
                size="lg" 
                className="bg-background-0 self-start"
                onPress={handleCreateNew}
                testID="btn-create-automation"
              >
                <ButtonIcon as={Plus} className="text-primary-600" />
                <ButtonText className="text-primary-600 font-semibold">
                  {t('home.createAutomationButton')}
                </ButtonText>
              </Button>
            </VStack>
          </Box>
        </Box>

        {/* Templates populaires */}
        <VStack className="gap-4 px-6 mt-6">
          <Heading size="lg" className="text-typography-900">
            {t('home.popularTemplatesTitle')}
          </Heading>
          
          <VStack space="sm">
            {[
              { title: t('home.template1Title'), desc: t('home.template1Desc'), icon: Github },
              { title: t('home.template2Title'), desc: t('home.template2Desc'), icon: Bell },
              { title: t('home.template3Title'), desc: t('home.template3Desc'), icon: Github }
            ].map((template, idx) => (
              <Pressable key={idx} onPress={handleServicePress}>
                <Box className="bg-background-0 rounded-lg p-4 border border-outline-100">
                  <HStack justify="between" align="center">
                    <HStack space="md" align="center" className="flex-1">
                      <Box className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center">
                        <Icon as={template.icon} size="md" className="text-primary-600" />
                      </Box>
                      <VStack className="flex-1">
                        <Text size="sm" className="text-typography-900 font-semibold">
                          {template.title}
                        </Text>
                        <Text size="xs" className="text-typography-600">
                          {template.desc}
                        </Text>
                      </VStack>
                    </HStack>
                    <Icon as={ArrowRight} size="md" className="text-typography-400" />
                  </HStack>
                </Box>
              </Pressable>
            ))}
          </VStack>
        </VStack>
      </ScrollView>

      {/* FAB - Bouton d'action flottant */}
      <Box className="absolute bottom-6 right-6">
        <Pressable onPress={handleCreateNew}>
          <Box 
            className="w-16 h-16 bg-primary-600 rounded-full items-center justify-center shadow-hard-2"
            style={{
              shadowColor: getToken('primary-600'),
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Icon as={Plus} size="xl" className="text-typography-0" />
          </Box>
        </Pressable>
      </Box>
    </SafeAreaView>
  );
}