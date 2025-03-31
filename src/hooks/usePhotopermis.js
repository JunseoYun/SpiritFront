import {Platform, Linking} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import {getGlobalShowAlert} from '../context/CustomAlertContext';

const showAlert = getGlobalShowAlert();

// 카메라 권한 요청
export const requestCameraPermission = async () => {
  const permission = Platform.select({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  });

  try {
    const result = await check(permission);

    switch (result) {
      case RESULTS.GRANTED:
        return true;

      case RESULTS.DENIED: {
        const reqResult = await request(permission);
        return reqResult === RESULTS.GRANTED;
      }

      case RESULTS.BLOCKED:
        showAlert({
          title: '카메라 권한이 차단되었습니다.',
          message: '설정에서 카메라 권한을 허용해주세요.',
          onConfirm: openAppSettings,
          type: 'confirm',
        });
        return false;

      default:
        return false;
    }
  } catch (error) {
    console.warn('카메라 권한 요청 오류:', error);
    return false;
  }
};

// 앱 설정으로 이동
export const openAppSettings = () => {
  openSettings().catch(() => {
    showAlert({title: '설정 열기 실패', message: '앱 설정을 열 수 없습니다.'});
  });
};

export const requestPhotoPermission = async () => {
  const permission = Platform.select({
    android:
      Platform.Version >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  });

  try {
    const result = await check(permission);

    switch (result) {
      case RESULTS.GRANTED:
        return true;

      case RESULTS.DENIED: {
        const reqResult = await request(permission);
        return reqResult === RESULTS.GRANTED;
      }

      case RESULTS.BLOCKED:
        showAlert({
          title: '사진 접근 권한이 차단되었습니다.',
          message: '설정에서 사진 접근 권한을 허용해주세요.',
          onConfirm: openAppSettings,
          type: 'confirm',
        });
        return false;

      default:
        return false;
    }
  } catch (error) {
    console.warn('사진 권한 요청 오류:', error);
    return false;
  }
};
