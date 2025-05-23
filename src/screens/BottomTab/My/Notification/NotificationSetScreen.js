import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Pressable,
  Animated,
} from 'react-native';
import {
  checkNotifications,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

const Toggle = ({value, onToggle}) => {
  const translateX = useState(new Animated.Value(value ? 22 : 2))[0];

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 18 : 2,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.toggleContainer,
        {backgroundColor: value ? '#80D2F4' : '#ccc'},
      ]}>
      <Animated.View style={[styles.toggleCircle, {marginLeft: translateX}]} />
    </Pressable>
  );
};

const NotificationSetScreen = ({navigation}) => {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const {status} = await checkNotifications();
      if (status === RESULTS.GRANTED) {
        setNotificationEnabled(true);
        setMarketingEnabled(true);
      } else {
        setNotificationEnabled(false);
        setMarketingEnabled(false);
      }
    };

    checkPermission();
  }, []);

  const handleGoToSettings = () => {
    openSettings().catch(() => {
      console.warn('설정 열기에 실패했습니다.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.row1}>
          <Text style={styles.label}>시스템 알림</Text>

          <Text
            style={[
              styles.statusText,
              {color: notificationEnabled ? '#80D2F4' : '#999'},
            ]}>
            {notificationEnabled ? 'ON' : 'OFF'}
          </Text>
        </View>

        <Text style={styles.guide}>
          시스템 알림은 휴대폰의 알림 설정에서 변경할 수 있어요.
        </Text>

        <Pressable onPress={handleGoToSettings}>
          <Text style={styles.underlineButton}>설정으로 이동</Text>
        </Pressable>
      </View>

      {notificationEnabled && (
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>마케팅 알림 수신</Text>
            <Toggle
              value={marketingEnabled}
              onToggle={() => setMarketingEnabled(prev => !prev)}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 18,
    marginVertical: 10,
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
  },
  statusText: {
    fontSize: 15,

    fontFamily: 'Pretendard-Medium',
  },
  guide: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
    fontFamily: 'Pretendard-Medium',
  },
  underlineButton: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
    fontFamily: 'Pretendard-Regular',
  },
  toggleContainer: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    backgroundColor: '#ccc',
    padding: 2,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
});

export default NotificationSetScreen;
