import {Platform} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  openPhotoPicker,
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
        if (reqResult === RESULTS.GRANTED) return true;

        showAlert({
          title: '사진 권한 요청',
          message: '카메라를 사용하려면 사진 권한이 필요합니다.',
          onConfirm: openAppSettings,
          type: 'confirm',
        });
        return false;
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

// 설정 화면으로 이동
export const openAppSettings = () => {
  openSettings().catch(() => {
    showAlert({
      title: '설정 열기 실패',
      message: '앱 설정을 여는 데 실패했습니다.',
    });
  });
};

// 사진 권한 확인 (iOS LIMITED 포함)
export const checkPhotoPermissionStatus = async () => {
  const permission = Platform.select({
    android:
      Platform.Version >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  });

  try {
    const status = await check(permission);
    const limited = Platform.OS === 'ios' && status === RESULTS.LIMITED;
    const granted = status === RESULTS.GRANTED || limited;
    return {status, granted, limited};
  } catch (error) {
    console.warn('사진 접근 권한 확인 오류:', error);
    return {status: RESULTS.DENIED, granted: false, limited: false};
  }
};

// 사진 권한 요청 (iOS LIMITED도 허용으로 간주)
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
    if (
      result === RESULTS.GRANTED ||
      (Platform.OS === 'ios' && result === RESULTS.LIMITED)
    ) {
      return true;
    }

    const reqResult = await request(permission);
    if (
      reqResult === RESULTS.GRANTED ||
      (Platform.OS === 'ios' && reqResult === RESULTS.LIMITED)
    ) {
      return true;
    }

    if (reqResult === RESULTS.BLOCKED || reqResult === RESULTS.DENIED) {
      showAlert({
        title: '사진 접근 권한 요청',
        message: '갤러리 사용을 위해서는 사진 접근 권한이 필요합니다.',
        onConfirm: openAppSettings,
        type: 'confirm',
      });
    }
    return false;
  } catch (error) {
    console.warn('사진 접근 권한 요청 오류:', error);
    return false;
  }
};

// iOS 제한 접근 시 시스템 선택기 열기
export const openLimitedPhotoPicker = async () => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  try {
    await openPhotoPicker();
    return true;
  } catch (error) {
    console.warn('Limited photo picker open error:', error);
    return false;
  }
};
