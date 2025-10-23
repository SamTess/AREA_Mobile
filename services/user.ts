import { User } from '@/types/auth';
import { API_CONFIG, ENV } from './api.config';
import { getUserData, saveUserData } from './storage';

/**
 * Mock mode configuration
 */
const USE_MOCK = ENV.USE_MOCK;
const MOCK_DELAY = ENV.MOCK_DELAY;

/**
 * Upload avatar to server
 * @param fileUri - Local file URI from image picker
 * @returns Server URL of uploaded avatar
 */
export async function uploadAvatar(_fileUri: string): Promise<string> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    return _fileUri;
  }
  // Explicitly unsupported in real backend per spec
  throw new Error('Avatar upload is not supported by the current backend.');
}

/**
 * Update user profile
 * @param userData - Partial user data to update
 * @returns Updated user object from server
 */
export async function updateProfile(userData: Partial<User>): Promise<User> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    const existingDataStr = await getUserData();
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
    const updatedUser = {
      ...existingData,
      ...userData,
      lastLoginAt: existingData?.lastLoginAt,
    };
    await saveUserData(JSON.stringify(updatedUser));
    return updatedUser;
  }

  try {
    if (!userData.id) {
      throw new Error('Missing user id for profile update');
    }
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${encodeURIComponent(userData.id)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Profile update failed');
    }

    const updatedUser: User = await response.json();
    await saveUserData(JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

/**
 * Update user profile with avatar upload
 * Handles avatar file upload first if avatar is a local file URI
 * @param userData - Partial user data to update
 * @returns Updated user object
 */
export async function updateProfileWithAvatar(userData: Partial<User>): Promise<User> {
  let finalUserData = { ...userData };

  if ((userData as any).avatarUrl && (userData as any).avatarUrl.startsWith?.('file://')) {
    try {
      const avatarUrl = await uploadAvatar((userData as any).avatarUrl);
      (finalUserData as any).avatarUrl = avatarUrl;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      delete (finalUserData as any).avatarUrl;
    }
  }

  return updateProfile(finalUserData);
}

/**
 * Delete user avatar
 * @returns Success status
 */
export async function deleteAvatar(): Promise<void> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY / 2));
    return;
  }

  try {
    throw new Error('Avatar deletion is not supported by the current backend.');
  } catch (error) {
    console.error('Delete avatar error:', error);
    throw error;
  }
}

/**
 * Get user by ID
 * @param userId - User ID to fetch
 * @returns User object
 */
export async function getUserById(userId: string): Promise<User> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    const existingDataStr = await getUserData();
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
    return existingData;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${encodeURIComponent(userId)}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch user');
    }

    const user: User = await response.json();
    return user;
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error;
  }
}
