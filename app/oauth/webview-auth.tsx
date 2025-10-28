/**
 * OAuth WebView Authentication Screen
 * Handles OAuth flow within a WebView with automatic cookie management
 */

import React, { useRef, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '@/services/api.config';
import { useAuth } from '@/contexts/AuthContext';
import CookieManager from '@react-native-cookies/cookies';

export default function OAuthWebViewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { provider, mode } = params; // mode: 'login' ou 'link'
  const { refreshAuth } = useAuth();
  const webViewRef = useRef<WebView>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const [authCompleted, setAuthCompleted] = useState(false);

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    const { url, loading } = navState;
    setCurrentUrl(url);
    setIsLoading(loading);

    // Éviter de traiter plusieurs fois
    if (authCompleted) return;

    console.log('📍 Navigation:', url);

    // Détecter la page de callback OAuth
    if (url.includes('/oauth-callback')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (error) {
        setAuthCompleted(true);
        Alert.alert(
          t('oauth.error', 'Error'),
          errorDescription || error || t('oauth.authFailed', 'OAuth authentication failed'),
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace(mode === 'link' ? '/connected-services' : '/(tabs)/login');
              }
            }
          ]
        );
        return;
      }

      // Le code sera échangé par la page web elle-même
      console.log('✅ OAuth callback page loaded - waiting for token exchange...');
    }

    // Détecter la redirection finale après succès
    // La page web redirige vers la home ou services après l'échange
    if (!authCompleted && (
      url.endsWith('/(tabs)') || 
      url.includes('/connected-services') ||
      url.includes('/oauth-success') ||
      // Patterns pour détecter les redirections de succès
      (url.includes('success') && !url.includes('oauth-callback'))
    )) {
      setAuthCompleted(true);
      console.log('🎉 OAuth completed successfully');

      try {
        // Récupérer les cookies de la WebView
        const apiUrl = await getApiUrl();
        const cookies = await CookieManager.get(apiUrl);
        
        console.log('🍪 Cookies récupérés:', Object.keys(cookies));

        // Vérifier qu'on a bien les cookies d'authentification
        if (cookies.authToken || cookies.refreshToken) {
          console.log('✅ Cookies d\'authentification trouvés');
          
          // Rafraîchir l'état d'authentification
          if (mode !== 'link') {
            await refreshAuth();
          }

          // Redirection
          setTimeout(() => {
            router.replace(mode === 'link' ? '/connected-services' : '/(tabs)');
          }, 500);
        } else {
          console.warn('⚠️  Cookies d\'authentification non trouvés');
          Alert.alert(
            t('oauth.error', 'Error'),
            t('oauth.cookieError', 'Failed to retrieve authentication cookies'),
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace(mode === 'link' ? '/connected-services' : '/(tabs)/login');
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('❌ Error handling OAuth success:', error);
        Alert.alert(
          t('oauth.error', 'Error'),
          t('oauth.unexpectedError', 'An unexpected error occurred'),
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace(mode === 'link' ? '/connected-services' : '/(tabs)/login');
              }
            }
          ]
        );
      }
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    Alert.alert(
      t('oauth.error', 'Error'),
      t('oauth.webviewError', 'Failed to load OAuth page'),
      [
        {
          text: 'OK',
          onPress: () => {
            router.replace(mode === 'link' ? '/connected-services' : '/(tabs)/login');
          }
        }
      ]
    );
  };

  const handleHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView HTTP error:', nativeEvent.statusCode, nativeEvent.url);
  };

  // Construire l'URL OAuth
  const getOAuthUrl = async () => {
    const apiUrl = await getApiUrl();
    return `${apiUrl}/api/oauth/${provider}/authorize?origin=mobile&mode=${mode || 'login'}`;
  };

  const [oauthUrl, setOAuthUrl] = useState<string | null>(null);

  React.useEffect(() => {
    getOAuthUrl().then(setOAuthUrl);
  }, []);

  if (!oauthUrl) {
    return (
      <Center className="flex-1 bg-background-0">
        <ActivityIndicator size="large" color="#0066FF" />
        <Text className="text-typography-700 mt-4">
          {t('oauth.loading', 'Loading...')}
        </Text>
      </Center>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000,
        }}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text className="text-typography-700 mt-4">
            {t('oauth.authenticating', 'Authenticating...')}
          </Text>
          {currentUrl && (
            <Text className="text-typography-500 text-xs mt-2 px-4 text-center">
              {currentUrl.length > 50 ? currentUrl.substring(0, 50) + '...' : currentUrl}
            </Text>
          )}
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ uri: oauthUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleError}
        onHttpError={handleHttpError}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        incognito={false}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        allowsBackForwardNavigationGestures={true}
        style={{ flex: 1 }}
      />
    </View>
  );
}
