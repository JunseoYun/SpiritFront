import {Linking, Platform} from 'react-native';
import {getGlobalShowAlert} from '../context/CustomAlertContext';

export const openKakaoMap = async (
  startLat,
  startLng,
  endLat,
  endLng,
  method = 'FOOT',
) => {
  const showAlert = getGlobalShowAlert();
  const kakaoMapUrl = `kakaomap://route?sp=${startLat},${startLng}&ep=${endLat},${endLng}&by=${method}`;
  const storeUrl =
    Platform.OS === 'android'
      ? 'https://play.google.com/store/apps/details?id=net.daum.android.map'
      : 'https://apps.apple.com/kr/app/%EC%B9%B4%EC%B9%B4%EC%98%A4%EB%A7%B5/id304608425';

  try {
    await Linking.openURL(kakaoMapUrl);
  } catch (error) {
    showAlert({
      type: 'confirm',
      title: '카카오맵 미설치',
      message:
        '카카오맵 앱이 설치되어 있지 않습니다.\n스토어로 이동하시겠습니까?',
      onConfirm: () => {
        Linking.openURL(storeUrl);
      },
    });
  }
};
