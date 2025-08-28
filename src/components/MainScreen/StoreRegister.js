import React from 'react';
import {View, Pressable, Text, StyleSheet, Platform} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {iniBasictNotification} from '../../hooks/notification/useNotificationPermission';
import useCustomAlert from '../../hooks/useCustomAlert';
import {openSettings} from 'react-native-permissions';

const StoreRegister = ({handlestoreItemClick}) => {
  const {showAlert, AlertComponent} = useCustomAlert();

  const options = [
    {
      id: 0,
      title: '매장 제보',
      icon: 'plus-square',
    },
    {
      id: 1,
      title: '사장님 인증',
      icon: 'check-circle',
    },
  ];

  const handleGoToSettings = () => {
    openSettings().catch(() => console.warn('설정 열기에 실패했습니다.'));
  };

  const handlePress = async id => {
    if (id === 1) {
      const isAuthorized = await iniBasictNotification(1);
      if (isAuthorized) {
        handlestoreItemClick(id);
      } else {
        showAlert({
          title: '알림 미설정',
          message: '사장님 인증 결과를 받기 위해\n알림 권한이 필요해요',
          type: 'notificationSetting',
          onConfirm: handleGoToSettings,
          onCancel: () => {},
        });
      }
      return;
    }
    handlestoreItemClick(id);
  };

  return (
    <View style={styles.container}>
      {options.map(option => {
        return (
          <Pressable
            key={option.id}
            onPress={() => handlePress(option.id)}
            hitSlop={8}
            style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
            accessibilityRole="button"
            accessibilityLabel={option.title}>
            <View style={[styles.cover]}>
              <Feather name={option.icon} size={22} color={'#45C9FF'} />
              <Text style={styles.title}>{option.title}</Text>
            </View>
          </Pressable>
        );
      })}
      <AlertComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 18,
    gap: 12,
  },

  // 카드(버튼)
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    justifyContent: 'center',
  },
  cardActive: {
    borderColor: '#B6E7FF',
    backgroundColor: '#F5FBFF',
  },
  cardPressed: {
    transform: [{scale: 0.98}],
    opacity: Platform.OS === 'ios' ? 0.9 : 0.9,
    borderColor: '#45C9FF',
  },
  cover: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },

  title: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#121212',
    marginLeft: 10,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#7A7F85',
  },
});

export default StoreRegister;
