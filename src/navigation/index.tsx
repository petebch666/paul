import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import HomeScreen from '../screens/HomeScreen'
import CreateScreen from '../screens/CreateScreen'
import ProfileScreen from '../screens/ProfileScreen'
import AdminScreen from '../screens/AdminScreen'

const Tab = createBottomTabNavigator()

export default function AppNavigator() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarIcon: () => null,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: theme.borderWidth,
          paddingBottom: 4,
          paddingTop: 8,
          height: 56,
        },
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textDim,
        tabBarLabelStyle: {
          fontFamily: theme.fonts.regular,
          fontSize: theme.fontSize.xs,
          letterSpacing: 2,
        },
        tabBarShowLabel: true,
        tabBarItemStyle: {
          justifyContent: 'center',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'HOME',
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarLabel: 'CREATE',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'PROFILE',
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            tabBarLabel: 'ADMIN',
          }}
        />
      )}
    </Tab.Navigator>
  )
}
