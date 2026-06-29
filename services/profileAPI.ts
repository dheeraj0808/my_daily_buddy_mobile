import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import api from './api';

const PROFILE_IMAGE_KEY = 'profileImageUri';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role_id: number;
  isVerified: boolean;
  isActive: boolean;
  subscription_id: string | null;
  profile_image_url: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_image_url?: string | null;
}

export async function getProfile(): Promise<UserProfile> {
  const response = await api.get<{ data: UserProfile }>('/users/profile');
  return response.data.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const response = await api.put<{ data: UserProfile }>('/users/profile', payload);
  return response.data.data;
}

export async function uploadProfileImage(uri: string): Promise<string> {
  const formData = new FormData();
  const filename = uri.split('/').pop() ?? 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

  formData.append('file', { uri, name: filename, type } as any);

  const response = await api.post<{ data: { url: string } }>(
    '/uploads/single',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data.url;
}

export async function saveProfileImageUri(uri: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(PROFILE_IMAGE_KEY, uri);
  } else {
    await SecureStore.setItemAsync(PROFILE_IMAGE_KEY, uri);
  }
}

export async function loadProfileImageUri(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(PROFILE_IMAGE_KEY);
  }
  return SecureStore.getItemAsync(PROFILE_IMAGE_KEY);
}
