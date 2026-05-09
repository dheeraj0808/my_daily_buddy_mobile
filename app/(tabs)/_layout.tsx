import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/shared/HapticTab';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

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
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="alarm" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="checkmark-circle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="heart" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
