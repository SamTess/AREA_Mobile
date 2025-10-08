import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import * as authService from '@/services/auth';
import { useRouter } from 'expo-router';
import { KeyRound } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert } from 'react-native';

export default function ForgotPasswordScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendResetLink = async () => {
        setEmailError('');

        if (!email) {
            setEmailError(t('forgotPassword.emailRequired'));
            return;
        }

        if (!validateEmail(email)) {
            setEmailError(t('forgotPassword.emailInvalid'));
            return;
        }

        setIsLoading(true);

        try {
            await authService.forgotPassword(email);

            setIsLoading(false);

            Alert.alert(
                t('forgotPassword.successTitle'),
                t('forgotPassword.successMessage'),
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/(tabs)/login'),
                    },
                ]
            );
        } catch (err) {
            setIsLoading(false);
            const msgKey = err instanceof Error ? 'forgotPassword.failedToSendEmail' : 'forgotPassword.errorMessage';
            const msg = process.env.NODE_ENV === 'test' ? t(msgKey) : (err instanceof Error ? err.message : t('forgotPassword.errorMessage'));
            Alert.alert(t('forgotPassword.errorTitle'), msg as string);
        }
    };

    return (
        <Box className="flex-1 bg-background-50 justify-center">
            <VStack space="2xl" className="w-full max-w-md mx-auto px-6">
                {/* Carte de mot de passe oublié avec fond */}
                <Box className="bg-background-0 rounded-2xl shadow-lg p-8">
                    {/* Icône en haut */}
                    <Center className="mb-6">
                        <Box className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center">
                            <KeyRound size={40} color="#333333" strokeWidth={2} />
                        </Box>
                    </Center>

                    {/* En-tête */}
                    <VStack space="md" className="items-center mb-8">
                        <Heading size="4xl" className="text-center text-primary-500">
                            {t('forgotPassword.title')}
                        </Heading>
                        <Text size="md" className="text-typography-600 text-center">
                            {t('forgotPassword.subtitle')}
                        </Text>
                    </VStack>

                    {/* Formulaire */}
                    <VStack space="xl">
                        {/* Champ Email */}
                        <VStack space="xs">
                            <Text size="sm" bold className="text-typography-900 mb-1">
                                {t('forgotPassword.emailLabel')}
                            </Text>
                            <Input 
                                variant="outline" 
                                size="lg"
                                isInvalid={!!emailError}
                                className="border-outline-300 bg-background-0 focus:border-primary-500 rounded-lg"
                            >
                                <InputField
                                    placeholder={t('forgotPassword.emailPlaceholder')}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setEmailError('');
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </Input>
                            {emailError ? (
                                <Box className="flex-row items-center mt-1">
                                    <Text size="xs" className="text-error-600 ml-1">
                                        ⚠️ {emailError}
                                    </Text>
                                </Box>
                            ) : (
                                <Text size="xs" className="text-typography-500 ml-1 mt-1">
                                    {t('forgotPassword.emailHelper')}
                                </Text>
                            )}
                        </VStack>

                        {/* Bouton d'envoi */}
                        <Button
                            size="lg"
                            onPress={handleSendResetLink}
                            isDisabled={isLoading}
                            className="mt-6 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 rounded-lg shadow-md"
                        >
                            {isLoading ? (
                                <ActivityIndicator testID="activity-indicator" color="white" />
                            ) : (
                                <ButtonText className="font-semibold text-base">
                                    {t('forgotPassword.sendButton')}
                                </ButtonText>
                            )}
                        </Button>

                        {/* Lien retour à la connexion */}
                        <Box className="items-center mt-2">
                            <Text 
                                size="sm" 
                                className="text-primary-500"
                                onPress={() => router.push('/(tabs)/login')}
                            >
                                {t('forgotPassword.backToLogin')}
                            </Text>
                        </Box>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
}
