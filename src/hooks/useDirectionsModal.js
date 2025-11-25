import {useCallback, useMemo, useRef, useState} from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  Platform,
  Linking,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useToast} from '../context/ToastContext';
import {getGlobalShowAlert} from '../context/CustomAlertContext';
import {openKakaoMap} from './openKakaoMap';
import FastImage from 'react-native-fast-image';
import CustomText from '../components/common/CustomText';

const APP_NAME_PARAM = Platform.select({
  ios: 'com.spiritfront',
  android: 'com.spiritfront',
});

/**
 *  FastImage는 반드시 require가 들어가야 정상동작함
 */
const ICON_META = {
  naver: {
    color: '#FFF',
    img: require('../assets/naverMap.png'),
  },
  kakao: {
    color: '#FAE100',
    img: require('../assets/kakaoMap.png'),
  },
};

const DIRECTIONS_STORE_URL = {
  naver: {
    ios: 'https://apps.apple.com/kr/app/id311867728',
    android:
      'https://play.google.com/store/apps/details?id=com.nhn.android.nmap',
    label: '네이버 지도',
  },
};

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)'},
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#111',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
  },
  cancelButton: {
    marginTop: 8,
    borderRadius: 9,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
});

const useDirectionsModal = () => {
  const {showToast} = useToast();
  const showAlertRef = useRef(getGlobalShowAlert());
  const [payload, setPayload] = useState(null);

  /** 좌표 유효성 검사 */
  const ensureCoords = useCallback(
    params => {
      const {startLat, startLng, destLat, destLng} = params || {};
      if (
        [startLat, startLng, destLat, destLng].some(
          v => typeof v !== 'number' || Number.isNaN(v),
        )
      ) {
        showToast?.('위치 정보를 확인할 수 없어요.', 'center');
        return null;
      }
      return {startLat, startLng, destLat, destLng};
    },
    [showToast],
  );

  /** 모달 오픈 */
  const openDirectionsModal = useCallback(
    params => {
      const coords = ensureCoords(params);
      if (!coords) return;
      setPayload({
        ...coords,
        destName: params?.destName || '도착지',
      });
    },
    [ensureCoords],
  );

  /** 모달 닫기 */
  const closeModal = useCallback(() => setPayload(null), []);

  /** 설치 안내 */
  const promptInstall = useCallback((storeUrl, label) => {
    const showAlert = showAlertRef.current;
    if (showAlert) {
      showAlert({
        type: 'confirm',
        title: `${label} 미설치`,
        message: `${label} 앱이 설치되어 있지 않아요.\n스토어로 이동할까요?`,
        onConfirm: () => Linking.openURL(storeUrl),
      });
    } else {
      Linking.openURL(storeUrl);
    }
  }, []);

  /** 네이버 */
  const handleNaver = useCallback(async () => {
    if (!payload) return;
    closeModal();

    const destName = encodeURIComponent(payload.destName || '도착지');
    const url = `nmap://route/car?slat=${payload.startLat}&slng=${
      payload.startLng
    }&sname=${encodeURIComponent('현재 위치')}&dlat=${payload.destLat}&dlng=${
      payload.destLng
    }&dname=${destName}&appname=${APP_NAME_PARAM}`;

    const storeUrl = DIRECTIONS_STORE_URL.naver[Platform.OS];

    try {
      await Linking.openURL(url);
    } catch (error) {
      promptInstall(storeUrl, DIRECTIONS_STORE_URL.naver.label);
    }
  }, [closeModal, payload, promptInstall]);

  /** 카카오 */
  const handleKakao = useCallback(async () => {
    if (!payload) return;
    closeModal();
    try {
      await openKakaoMap(
        payload.startLat,
        payload.startLng,
        payload.destLat,
        payload.destLng,
        'FOOT',
      );
    } catch (error) {
      showToast?.('카카오맵을 실행하지 못했어요.', 'center');
    }
  }, [closeModal, payload, showToast]);

  /** 옵션 목록 */
  const options = useMemo(
    () => [
      {key: 'naver', label: '네이버 지도', onPress: handleNaver},
      {key: 'kakao', label: '카카오맵', onPress: handleKakao},
    ],
    [handleKakao, handleNaver],
  );

  /** DirectionsModal 컴포넌트 */
  const DirectionsModal = useCallback(() => {
    if (!payload) return null;

    return (
      <Modal
        visible
        animationType="fade"
        transparent
        onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal} />

        <View style={[styles.sheet]}>
          <CustomText style={styles.title}>길찾기</CustomText>

          {options.map(option => {
            const meta = ICON_META[option.key];
            return (
              <Pressable
                key={option.key}
                style={styles.optionRow}
                onPress={option.onPress}>
                <View
                  style={[styles.optionIcon, {backgroundColor: meta.color}]}>
                  <FastImage
                    source={meta.img}
                    style={{width: 32, height: 32, borderRadius: 6}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </View>
                <CustomText style={styles.optionText}>
                  {option.label}
                </CustomText>
              </Pressable>
            );
          })}

          <Pressable style={styles.cancelButton} onPress={closeModal}>
            <CustomText style={styles.cancelText}>취소</CustomText>
          </Pressable>
        </View>
      </Modal>
    );
  }, [closeModal, options, payload]);

  return {openDirectionsModal, DirectionsModal};
};

export default useDirectionsModal;
