import React, {useState, useEffect, useCallback} from 'react';
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
import {Userdataget, user_marketing_consent} from '../../../../api/userApi';
import Loading from '../../../../hooks/Loading';
import useCustomAlert from '../../../../hooks/useCustomAlert';

const Toggle = ({value, onToggle}) => {
  const translateX = useState(new Animated.Value(value ? 22 : 2))[0];

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 20 : 2,
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
  const [userdata, setUserdata] = useState(null);
  const [loading, setLoading] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();

  useEffect(() => {
    const checkPermission = async () => {
      const {status} = await checkNotifications();
      if (status === RESULTS.GRANTED) {
        setNotificationEnabled(true);
      } else {
        setNotificationEnabled(false);
      }
    };

    checkPermission();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await Userdataget();

        console.log(data);
        setUserdata(data);
        setMarketingEnabled(data.marketingConsent);
        console.log(data.isManager);
      } catch (error) {
        if (error.response) {
        } else {
          // 네트워크 또는 다른 에러 처리
          console.error('Unexpected Error:', error);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleGoToSettings = () => {
    openSettings().catch(() => {
      console.warn('설정 열기에 실패했습니다.');
    });
  };

  const handleMarketingToggle = async () => {
    const newValue = !marketingEnabled;
    setMarketingEnabled(newValue);
    setLoading(true);
    try {
      // ⭐️ isAgreed를 경로 파라미터로 넘겨주는 방식으로 호출
      await user_marketing_consent(newValue);
    } catch (error) {
      console.error('마케팅 알림 상태 업데이트 실패:', error.response);
      // 실패 시 원래 상태로 롤백
      setMarketingEnabled(!newValue);
    }
    setLoading(false);
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
        {!notificationEnabled && (
          <Pressable onPress={handleGoToSettings}>
            <Text style={styles.underlineButton}>설정으로 이동</Text>
          </Pressable>
        )}
      </View>
      {notificationEnabled && (
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>마케팅 알림 수신 (선택)</Text>

            <Toggle value={marketingEnabled} onToggle={handleMarketingToggle} />
          </View>
          {marketingEnabled && (
            <Text style={styles.label2}>
              {new Date(userdata.marketingAgreedAt).toLocaleDateString()} 동의
            </Text>
          )}
        </View>
      )}
      <Loading loading={loading} />
      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
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
  label2: {
    fontSize: 14,
    color: '#999',
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
