import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import FileManagerScreen from '../screens/FileManagerScreen';
import SendScreen from '../screens/SendScreen';
import ReceiveScreen from '../screens/ReceiveScreen';
import QRReceiveScreen from '../screens/QRReceiveScreen';

function QRScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-navy">
      <Text className="text-white text-2xl font-poppins">QR</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1E293B', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#64748B',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <MaterialCommunityIcons name="home-variant" size={size} color={color} />;
          } else if (route.name === 'File Manager') {
            return <MaterialCommunityIcons name="folder" size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="File Manager" component={FileManagerScreen} />
      <Tab.Screen name="Send" component={SendScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Receive" component={ReceiveScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="QR" component={QRReceiveScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
} 