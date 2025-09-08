import React from 'react';
import {Pressable, View, Platform} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

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
        right: 22,
        top: Platform.OS === 'android' ? insets.top + 20 : insets.top + 10,
      }}>
      <AntDesign name="bells" size={22} color="#fff" />

      {/* 🔴 빨간 점 */}
      {unreadNotification && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 6,
            height: 6,
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
