import { Linking, Alert, Platform } from 'react-native';

export const openKakaoMap = (startLat, startLng, endLat, endLng, method = 'FOOT') => {
  const kakaoMapUrl = `kakaomap://route?sp=${startLat},${startLng}&ep=${endLat},${endLng}&by=${method}`;

  const storeUrl =
  Platform.OS === 'android'
    ? 'https://play.google.com/store/apps/details?id=net.daum.android.map' // Android
    : 'https://apps.apple.com/kr/app/%EC%B9%B4%EC%B9%B4%EC%98%A4%EB%A7%B5/id304608425'; // iOS


  Linking.canOpenURL(kakaoMapUrl)
    .then((supported) => {
      if (supported) {
        Linking.openURL(kakaoMapUrl);
      } else {
        Alert.alert(
          '카카오맵 미설치',
          '카카오맵 앱이 설치되어 있지 않습니다. 스토어로 이동하시겠습니까?',
          [
            {
              text: '취소',
              style: 'cancel',
            },
            {
              text: '스토어 열기',
              onPress: () => Linking.openURL(storeUrl),
            },
          ]
        );
      }
    })
    .catch((err) => console.error('카카오맵 열기 중 오류 발생:', err));
};
