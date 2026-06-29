import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import TabAuthGate from '@/components/shared/TabAuthGate';
import { HapticTab } from '@/components/shared/HapticTab';
import { TAB_SCREENS, type IoniconName } from '@/constants/tabScreens';
import { palette, spacing } from '@/theme';

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IoniconName;
  color: string;
  focused: boolean;
}) {
  const iconName: IoniconName = focused ? name : (`${name}-outline` as IoniconName);
  return <Ionicons name={iconName} size={22} color={color} />;
}

export default function TabLayout() {
  return (
    <TabAuthGate>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: palette.primaryLight,
          tabBarInactiveTintColor: palette.textMuted,
          tabBarStyle: {
            backgroundColor: palette.surface,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 84 : 72,
            paddingTop: spacing.sm,
            paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.sm,
            shadowColor: palette.text,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            elevation: 12,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
            fontFamily: 'Inter_600SemiBold',
          },
        }}
      >
        {TAB_SCREENS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon name={tab.icon} color={color} focused={focused} />
              ),
            }}
          />
        ))}
      </Tabs>
    </TabAuthGate>
  );
}
