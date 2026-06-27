import type { ComponentProps } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** Single source of truth for tab routes (Expo Router file names). */
export const TAB_SCREENS: readonly {
  readonly name: 'dashboard' | 'reminders' | 'habits' | 'health' | 'goals' | 'profile';
  readonly title: string;
  readonly icon: IoniconName;
}[] = [
  { name: 'dashboard', title: 'Home', icon: 'home' },
  { name: 'reminders', title: 'Reminders', icon: 'alarm' },
  { name: 'habits', title: 'Habits', icon: 'checkmark-circle' },
  { name: 'health', title: 'Health', icon: 'heart' },
  { name: 'goals', title: 'Goals', icon: 'flag' },
  { name: 'profile', title: 'Profile', icon: 'person' },
] as const;
