import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { completeOAuthRedirect, getCurrentUser, logout } from '@/services/auth';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';

type RedirectStatus = 'processing' | 'success' | 'error';

export default function OAuthRedirect() {
  const params = useLocalSearchParams<{
    code?: string;
    provider?: string;
    error?: string;
    error_description?: string;
  }>();

  const [status, setStatus] = useState<RedirectStatus>('processing');
  const [message, setMessage] = useState<string>('Finalising authentication…');
  const [debug, setDebug] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    let cancelled = false;

    const run = async () => {
      setStatus('processing');
      setMessage('Finalising authentication…');
      setDebug(null);

      const MAX_ATTEMPTS = 3;
      const buildRetryMessage = (attempt: number) =>
        `Contacting server… (attempt ${attempt}/${MAX_ATTEMPTS})`;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        if (cancelled) return;
        if (attempt > 1) {
          setMessage(buildRetryMessage(attempt));
        }

        try {
          const result = await completeOAuthRedirect({
            code: params.code,
            provider: params.provider,
            error: params.error,
            error_description: params.error_description,
          });

          if (cancelled) return;
          setStatus('success');
          setMessage(result.message || 'Authentication successful');
          setTimeout(() => router.replace('/(tabs)'), 600);
          return;
        } catch (err) {
          if (cancelled) return;
          const rawMessage = err instanceof Error ? err.message : 'Authentication failed';

          const fallback = await getCurrentUser();
          if (cancelled) return;

            if (fallback) {
            setStatus('success');
            setMessage('Authentication completed. Redirecting…');
            setTimeout(() => router.replace('/(tabs)'), 600);
            return;
          }

          if (attempt < MAX_ATTEMPTS) {
            setDebug(rawMessage);
            await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
            continue;
          }

          setStatus('error');
          setMessage('We could not complete authentication. Please try again.');
          setDebug(rawMessage);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [params.code, params.provider, params.error, params.error_description, params]);

  return (
    <Box className="flex-1 p-6 items-center justify-center">
      <VStack space="lg" className="items-center">
        {status === 'processing' && <ActivityIndicator size="large" color="#333" />}
        
        <Text size="xl" className="font-semibold text-center">
          {status === 'processing' && 'Authentication in progress…'}
          {status === 'success' && 'Authentication successful'}
          {status === 'error' && 'Authentication error'}
        </Text>
        
        <Text className="text-center">{message}</Text>

        {status === 'error' && (
          <>
            <Button 
              onPress={() => router.replace('/(tabs)')}
              className="mt-4"
            >
              <ButtonText>Try again</ButtonText>
            </Button>
            
            <Button
              onPress={async () => {
                try {
                  await logout();
                } catch (err) {
                }
                router.replace('/(tabs)');
              }}
              variant="outline"
              className="mt-2"
            >
              <ButtonText>Logout & retry</ButtonText>
            </Button>
            
            {debug ? (
              <Text size="sm" className="mt-2 text-gray-600 text-center">
                {debug}
              </Text>
            ) : null}
          </>
        )}
      </VStack>
    </Box>
  );
}
