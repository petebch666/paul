import React from 'react'
import { View, Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Home, Plus, User, Shield, Bell } from 'lucide-react-native'
import { theme } from '../theme'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import HomeScreen from '../screens/HomeScreen'
import CreateScreen from '../screens/CreateScreen'
import ProfileScreen from '../screens/ProfileScreen'
import AdminScreen from '../screens/AdminScreen'
import PublicProfileScreen from '../screens/PublicProfileScreen'
import NotificationsScreen from '../screens/NotificationsScreen'

export type RootStackParamList = {
  Main: undefined
  PublicProfile: { userId: string }
}

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator<RootStackParamList>()

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <View style={{
      position: 'absolute',
      top: -4,
      right: -6,
      backgroundColor: theme.colors.danger,
      borderRadius: 6,
      minWidth: 12,
      height: 12,
      paddingHorizontal: 2,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{
        fontFamily: theme.fonts.bold,
        fontSize: 8,
        color: '#FFF',
        lineHeight: 12,
      }}>
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  )
}

function MainTabs() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const { unreadCount, refreshUnreadCount } = useNotifications(user?.id || '')

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: theme.borderWidth,
          paddingBottom: 4,
          paddingTop: 8,
          height: theme.tabBarHeight,
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
          tabBarIcon: ({ color, focused }) => (
            <Home size={20} color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarLabel: 'CREATE',
          tabBarIcon: ({ color, focused }) => (
            <Plus size={20} color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={NotificationsScreen}
        listeners={{
          tabPress: () => refreshUnreadCount(),
        }}
        options={{
          tabBarLabel: 'INBOX',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Bell size={20} color={color} strokeWidth={focused ? 2 : 1.5} />
              <UnreadBadge count={unreadCount} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'PROFILE',
          tabBarIcon: ({ color, focused }) => (
            <User size={20} color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            tabBarLabel: 'ADMIN',
            tabBarIcon: ({ color, focused }) => (
              <Shield size={20} color={color} strokeWidth={focused ? 2 : 1.5} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
    </Stack.Navigator>
  )
}
