import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getCurrentUser } from '@/services/auth';
import { useThemeColors } from '@/hooks/useThemeColors';

import UsersTab from '@/components/admin/UsersTab';
import AreasTab from '@/components/admin/AreasTab';
import ServicesTab from '@/components/admin/ServicesTab';

type TabType = 'users' | 'areas' | 'services';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user)
        return;
      if (!(user as any).isAdmin) {
        Alert.alert(t('admin.accessDenied'), 'You do not have admin privileges');
        router.replace('/(tabs)');
        return;
      }
      if (!(user as any).isVerified) {
        setIsVerified(false);
        Alert.alert(
          t('admin.emailNotVerified'),
          t('admin.users.emailVerificationMessage'),
          [{ text: 'OK' }]
        );
      } else {
        setIsVerified(true);
      }
      setIsAdmin(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to verify admin access');
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const tabs = [
    { key: 'users' as TabType, label: t('admin.tabs.users'), icon: 'people' },
    { key: 'areas' as TabType, label: t('admin.tabs.areas'), icon: 'map' },
    { key: 'services' as TabType, label: t('admin.tabs.services'), icon: 'settings' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTab key={refreshing ? 'refreshing' : 'normal'} />;
      case 'areas':
        return <AreasTab key={refreshing ? 'refreshing' : 'normal'} />;
      case 'services':
        return <ServicesTab key={refreshing ? 'refreshing' : 'normal'} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('admin.checkingPermissions')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('admin.accessDenied')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('admin.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {!isVerified && (
        <View style={[styles.warningBanner, { backgroundColor: colors.isDark ? '#3F2A0D' : '#FFF3CD', borderBottomColor: colors.isDark ? '#5A3F1A' : '#FFE69C' }]}>
          <Ionicons name="warning" size={20} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.isDark ? '#FDB94D' : '#856404' }]}>
            {t('admin.emailNotVerified')}
          </Text>
        </View>
      )}

      <View style={[styles.tabBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: colors.info }
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? colors.info : colors.textTertiary}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: colors.textTertiary },
                activeTab === tab.key && { color: colors.info, fontWeight: '600' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
  },
});
