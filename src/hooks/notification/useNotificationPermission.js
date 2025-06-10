import {Platform, PermissionsAndroid} from 'react-native';
import {
  getMessaging,
  requestPermission,
  registerDeviceForRemoteMessages,
  getToken,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import {
  setNotification,
  getNotification,
} from '../../storage/notificationStorage';
import {getGlobalShowAlert} from '../../context/CustomAlertContext';
import {user_push_consent, user_marketing_consent} from '../../api/userApi';

export const requestNotificationPermission = async () => {
  try {
    // Android 13+ 알림 권한 요청
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('🚫 Android 알림 권한 거부됨');
        return false;
      }
      console.log('✅ Android 알림 권한 허용됨');
    }

    // FCM 권한 요청 (iOS 또는 공통)
    const authStatus = await requestPermission(getMessaging());
    const isAuthorized =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    return isAuthorized;
  } catch (err) {
    console.error('💥 알림 권한 요청 중 오류:', err);
    return false;
  }
};

export const getFcmToken = async () => {
  try {
    await registerDeviceForRemoteMessages(getMessaging()); // 필수
    const fcmToken = await getToken(getMessaging());
    if (fcmToken) {
      return fcmToken;
    } else {
      console.log('❌ FCM Token not retrieved');
      return null;
    }
  } catch (err) {
    console.error('💥 FCM 토큰 가져오기 실패:', err);
    return null;
  }
};

export const iniBasictNotification = async token => {
  const isAuthorized = await requestNotificationPermission();
  const isBasicNotification = await getNotification('basicNotification');
  if (isAuthorized.toString() === isBasicNotification || !token) {
    return isAuthorized;
  }

  if (token) {
    try {
      await user_push_consent(isAuthorized);
      await setNotification('basicNotification', isAuthorized.toString());
    } catch (error) {
      console.error(error);
    }
    return isAuthorized;
  }
};

export const showMarketingConsentAlert = () => {
  const showAlert = getGlobalShowAlert();
  return new Promise(resolve => {
    showAlert({
      title: '마케팅 알림 수신 동의',
      message:
        '취향 저격 한잔 정보, 놓치지 마세요!\n알림으로 바로 알려드려요.\n(알림 > 알림 설정에서 변경 가능)',
      onConfirm: async () => {
        console.log('✅ 마케팅 알림 수신 동의');
        try {
          await user_marketing_consent(true);
          console.log('✅ 서버 동의 상태 업데이트 성공');
        } catch (error) {
          console.error('💥 서버 동의 상태 업데이트 실패:', error);
        }

        resolve(true);
      },
      onCancel: async () => {
        try {
          await user_marketing_consent(false);
          console.log('✅ 서버 동의 상태 업데이트 성공');
        } catch (error) {
          console.error('💥 서버 동의 상태 업데이트 실패:', error);
        }

        resolve(false);
      },
      type: 'marketingConsent',
    });
  });
};
