import React from 'react';
import {Pressable, View, Platform} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Bell, BellDot} from 'lucide-react-native';

const NotificationButton = ({unreadNotification = false}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      hitSlop={15}
      onPress={() => navigation.navigate('NotificationScreen')}
      style={{
        zIndex: 10,
        position: 'absolute',
        right: 24,
        top: Platform.OS === 'android' ? insets.top + 20 : insets.top + 10,
      }}>
      <Bell size={22} color="#fff" />

      {/* 🔴 빨간 점 */}
      {unreadNotification && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 5,
            height: 5,
            borderRadius: 5,
            backgroundColor: '#E9F5FB',
            zIndex: 20,
          }}
        />
      )}
    </Pressable>
  );
};

export default NotificationButton;
