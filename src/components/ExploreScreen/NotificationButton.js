import React from 'react';
import {Pressable, View, Platform} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Bell} from 'lucide-react-native';

const NotificationButton = ({
  unreadNotification = false,
  floating = true,
  iconColor,
  iconSize = 23,
  badgeColor,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const floatingStyle = {
    zIndex: 10,
    position: 'absolute',
    right: 24,
    top: Platform.OS === 'android' ? insets.top + 20 : insets.top + 10,
  };
  const tintColor = iconColor ?? (floating ? '#fff' : '#333');
  const indicatorColor = badgeColor ?? (floating ? '#333' : '#fff');

  return (
    <Pressable
      hitSlop={15}
      onPress={() => navigation.navigate('NotificationScreen')}
      style={[
        floating ? floatingStyle : null,
        !floating && {justifyContent: 'center', alignItems: 'center'},
      ]}>
      <Bell size={iconSize} color={tintColor} />

      {unreadNotification && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 4,
            height: 4,
            borderRadius: 3,
            backgroundColor: indicatorColor,
            zIndex: 20,
          }}
        />
      )}
    </Pressable>
  );
};

export default NotificationButton;
