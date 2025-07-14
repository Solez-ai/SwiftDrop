import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <View className="flex-1 bg-navy">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center px-6 pt-16">
          {/* Send & Receive Buttons */}
          <View className="flex-row space-x-6 mb-10">
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-2xl bg-purple/80 shadow-lg py-8 mx-2"
              style={{ shadowColor: '#4F46E5', shadowOpacity: 0.6, shadowRadius: 16 }}
              onPress={() => navigation.navigate('Send')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="send-circle" size={56} color="#fff" />
              <Text className="text-white text-xl font-poppins mt-2">Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-2xl bg-cyan/80 shadow-lg py-8 mx-2"
              style={{ shadowColor: '#22D3EE', shadowOpacity: 0.6, shadowRadius: 16 }}
              onPress={() => navigation.navigate('Receive')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="download-circle" size={56} color="#fff" />
              <Text className="text-white text-xl font-poppins mt-2">Receive</Text>
            </TouchableOpacity>
          </View>

          {/* Storage Summary Cards */}
          <View className="w-full flex-row space-x-4 mb-8">
            <View className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-md shadow-md">
              <Text className="text-white text-base font-poppins mb-1">Internal Storage</Text>
              <View className="h-2 w-full bg-white/20 rounded-full mb-1">
                <View className="h-2 bg-purple rounded-full" style={{ width: '60%' }} />
              </View>
              <Text className="text-xs text-white/70">60 GB / 128 GB</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-2xl p-4 backdrop-blur-md shadow-md">
              <Text className="text-white text-base font-poppins mb-1">SD Card</Text>
              <View className="h-2 w-full bg-white/20 rounded-full mb-1">
                <View className="h-2 bg-cyan rounded-full" style={{ width: '32%' }} />
              </View>
              <Text className="text-xs text-white/70">16 GB / 64 GB</Text>
            </View>
          </View>

          {/* Ad Container */}
          <View className="w-full bg-white/10 rounded-xl p-4 mt-4 items-center justify-center border border-white/10">
            <Text className="text-white/70 text-xs mb-2">Thanks for supporting this app</Text>
            <View className="w-32 h-16 bg-white/20 rounded-lg items-center justify-center">
              {/* Static image ad placeholder */}
              <Text className="text-white/40">[Ad Image]</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 