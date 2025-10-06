import { User } from '@/types/auth';
import { API_CONFIG, ENV } from './api.config';
import { getAccessToken, getUserData, saveUserData } from './storage';

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
export async function uploadAvatar(fileUri: string): Promise<string> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    return fileUri;
  }

  try {
    const token = await getAccessToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();

    const filename = fileUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri: fileUri,
      name: filename,
      type,
    } as any);

    const response = await fetch(`${API_CONFIG.BASE_URL}/user/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Avatar upload failed');
    }

    const data = await response.json();
    
    if (!data.avatarUrl) {
      throw new Error('Server did not return avatar URL');
    }

    return data.avatarUrl;
  } catch (error) {
    console.error('Upload avatar error:', error);
    throw error;
  }
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
      updatedAt: new Date().toISOString(),
    };
    
    await saveUserData(JSON.stringify(updatedUser));
    return updatedUser;
  }

  try {
    const token = await getAccessToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_UPDATE}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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

  if (userData.avatar && userData.avatar.startsWith('file://')) {
    try {
      const avatarUrl = await uploadAvatar(userData.avatar);
      finalUserData.avatar = avatarUrl;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      delete finalUserData.avatar;
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
    const token = await getAccessToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/user/avatar`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Avatar deletion failed');
    }
  } catch (error) {
    console.error('Delete avatar error:', error);
    throw error;
  }
}
