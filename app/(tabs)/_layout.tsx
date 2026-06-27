import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

import TabAuthGate from '@/components/shared/TabAuthGate';
import { HapticTab } from '@/components/shared/HapticTab';
import { TAB_SCREENS, type IoniconName } from '@/constants/tabScreens';

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
  return <Ionicons name={iconName} size={24} color={color} />;
}

export default function TabLayout() {
  return (
    <TabAuthGate>
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: 70,
          paddingTop: 8,
          paddingBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
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
