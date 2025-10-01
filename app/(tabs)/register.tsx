import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { EyeIcon, EyeOffIcon, UserPlus } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';

export default function RegisterScreen() {
    const { t } = useTranslation();
    const { register, isLoading, error, clearError } = useAuth();
    const router = useRouter();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleShowConfirmPassword = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRegister = async () => {
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        clearError();

        let hasError = false;

        if (!name) {
            setNameError(t('register.nameRequired'));
            hasError = true;
        } else if (name.length < 2) {
            setNameError(t('register.nameTooShort'));
            hasError = true;
        }

        if (!email) {
            setEmailError(t('register.emailRequired'));
            hasError = true;
        } else if (!validateEmail(email)) {
            setEmailError(t('register.emailInvalid'));
            hasError = true;
        }

        if (!password) {
            setPasswordError(t('register.passwordRequired'));
            hasError = true;
        } else if (password.length < 6) {
            setPasswordError(t('register.passwordTooShort'));
            hasError = true;
        }

        if (!confirmPassword) {
            setConfirmPasswordError(t('register.confirmPasswordRequired'));
            hasError = true;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError(t('register.passwordMismatch'));
            hasError = true;
        }

        if (hasError) {
            return;
        }

        try {
            await register(email, password, name);
            Alert.alert(
                t('register.successTitle') || 'Inscription réussie',
                t('register.successMessage') || 'Votre compte a été créé avec succès',
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/(tabs)'),
                    },
                ]
            );
        } catch (err) {
            Alert.alert(
                t('register.errorTitle') || 'Erreur',
                error || t('register.errorMessage') || 'L\'inscription a échoué'
            );
        }
    };

    return (
        <ScrollView className="flex-1 bg-background-50">
            <Box className="flex-1 justify-center py-8">
                <VStack space="2xl" className="w-full max-w-md mx-auto px-6">
                    {/* Registration card with background */}
                    <Box className="bg-background-0 rounded-2xl shadow-lg p-8">
                        {/* Top icon */}
                        <Center className="mb-6">
                            <Box className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center">
                                <UserPlus size={40} color="#333333" strokeWidth={2} />
                            </Box>
                        </Center>

                        {/* Header */}
                        <VStack space="md" className="items-center mb-8">
                            <Heading size="4xl" className="text-center text-primary-500">
                                {t('register.title')}
                            </Heading>
                            <Text size="md" className="text-typography-600 text-center">
                                {t('register.subtitle')}
                            </Text>
                        </VStack>

                        {/* Form */}
                        <VStack space="xl">
                            {/* Name Field */}
                            <VStack space="xs">
                                <Text size="sm" bold className="text-typography-900 mb-1">
                                    {t('register.nameLabel')}
                                </Text>
                                <Input 
                                    variant="outline" 
                                    size="lg"
                                    isInvalid={!!nameError}
                                    className="border-outline-300 bg-background-0 focus:border-primary-500 rounded-lg"
                                >
                                    <InputField
                                        placeholder={t('register.namePlaceholder')}
                                        value={name}
                                        onChangeText={(text) => {
                                            setName(text);
                                            setNameError('');
                                        }}
                                        autoCapitalize="words"
                                        autoCorrect={false}
                                    />
                                </Input>
                                {nameError ? (
                                    <Box className="flex-row items-center mt-1">
                                        <Text size="xs" className="text-error-600 ml-1">
                                            ⚠️ {nameError}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text size="xs" className="text-typography-500 ml-1 mt-1">
                                        {t('register.nameHelper')}
                                    </Text>
                                )}
                            </VStack>

                            {/* Email Field */}
                            <VStack space="xs">
                                <Text size="sm" bold className="text-typography-900 mb-1">
                                    {t('register.emailLabel')}
                                </Text>
                                <Input 
                                    variant="outline" 
                                    size="lg"
                                    isInvalid={!!emailError}
                                    className="border-outline-300 bg-background-0 focus:border-primary-500 rounded-lg"
                                >
                                    <InputField
                                        placeholder={t('register.emailPlaceholder')}
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
                                        {t('register.emailHelper')}
                                    </Text>
                                )}
                            </VStack>

                            {/* Password Field */}
                            <VStack space="xs">
                                <Text size="sm" bold className="text-typography-900 mb-1">
                                    {t('register.passwordLabel')}
                                </Text>
                                <Input 
                                    variant="outline" 
                                    size="lg"
                                    isInvalid={!!passwordError}
                                    className="border-outline-300 bg-background-0 focus:border-primary-500 rounded-lg"
                                >
                                    <InputField
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={t('register.passwordPlaceholder')}
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            setPasswordError('');
                                        }}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <InputSlot className="pr-3" onPress={handleShowPassword}>
                                        <InputIcon 
                                            as={showPassword ? EyeIcon : EyeOffIcon} 
                                            className="text-typography-500"
                                        />
                                    </InputSlot>
                                </Input>
                                {passwordError ? (
                                    <Box className="flex-row items-center mt-1">
                                        <Text size="xs" className="text-error-600 ml-1">
                                            ⚠️ {passwordError}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text size="xs" className="text-typography-500 ml-1 mt-1">
                                        {t('register.passwordHelper')}
                                    </Text>
                                )}
                            </VStack>

                            {/* Confirm Password Field */}
                            <VStack space="xs">
                                <Text size="sm" bold className="text-typography-900 mb-1">
                                    {t('register.confirmPasswordLabel')}
                                </Text>
                                <Input 
                                    variant="outline" 
                                    size="lg"
                                    isInvalid={!!confirmPasswordError}
                                    className="border-outline-300 bg-background-0 focus:border-primary-500 rounded-lg"
                                >
                                    <InputField
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder={t('register.confirmPasswordPlaceholder')}
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            setConfirmPasswordError('');
                                        }}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <InputSlot className="pr-3" onPress={handleShowConfirmPassword}>
                                        <InputIcon 
                                            as={showConfirmPassword ? EyeIcon : EyeOffIcon} 
                                            className="text-typography-500"
                                        />
                                    </InputSlot>
                                </Input>
                                {confirmPasswordError ? (
                                    <Box className="flex-row items-center mt-1">
                                        <Text size="xs" className="text-error-600 ml-1">
                                            ⚠️ {confirmPasswordError}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text size="xs" className="text-typography-500 ml-1 mt-1">
                                        {t('register.confirmPasswordHelper')}
                                    </Text>
                                )}
                            </VStack>

                            {/* Register Button */}
                            <Button
                                size="lg"
                                onPress={handleRegister}
                                isDisabled={isLoading}
                                className="mt-6 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 rounded-lg shadow-md"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <ButtonText className="font-semibold text-base">
                                        {t('register.registerButton')}
                                    </ButtonText>
                                )}
                            </Button>
                        </VStack>
                    </Box>

                    {/* Login section */}
                    <Box className="items-center mt-4">
                        <Text size="sm" className="text-typography-600">
                            {t('register.hasAccount')}{' '}
                            <Text 
                                size="sm" 
                                bold 
                                className="text-primary-500"
                                onPress={() => router.push('/(tabs)/login')}
                            >
                                {t('register.signIn')}
                            </Text>
                        </Text>
                    </Box>
                </VStack>
            </Box>
        </ScrollView>
    );
}
