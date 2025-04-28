import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import {WebView} from 'react-native-webview';
import {getLocation} from '../../storage/locationStorage';
import {fetchLocationAddress} from '../../hooks/useLocation';
import {get_address} from '../../api/location';
import KakaoMapHTML from '../../components/MapScreen/KakaoMapHTML';
import StoreMapAddScript from '../../components/StoreAddScreen/StoreAddMap/StoreMapAddScript';
import {useRoute} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {useToast} from '../../context/ToastContext';
import {
  requestLocationPermission,
  handleLocationError,
} from '../../hooks/useLocation';
import Loading from '../../hooks/Loading';

const StoreAddMapScreen = ({navigation}) => {
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const {location, onAddressSelect} = route.params;
  const [centerLatLng, setCenterLatLng] = useState(null);
  const [prevCenterLatLng, setPrevCenterLatLng] = useState(null);
  const [currentloacation, setCurrentloacation] = useState(null);
  const isProgrammaticPan = useRef(false);
  const {showToast} = useToast();
  const webViewRef = useRef(null);

  useEffect(() => {
    let isMounted = true; // ✅ cleanup을 위한 변수 추가

    fetchSaveLocation();
    return () => {
      isMounted = false; // ✅ cleanup
    };
  }, [location]);

  const fetchSaveLocation = async () => {
    setLoading(true);
    try {
      const currentLocation = await getLocation();
      if (webViewRef.current) {
        const script = StoreMapAddScript(
          currentLocation.latitude,
          currentLocation.longitude,
        );
        webViewRef.current.injectJavaScript(script);
      }
    } catch (err) {
      console.error('위치 가져오는 중 오류 발생:', err);
    } finally {
      setLoading(false);
    }
  };
  const roundToPrecision = (value, precision = 4) => {
    return parseFloat(value.toFixed(precision)); // 🔥 소수점 5자리까지만 남김
  };

  const updateNewLocation = async () => {
    setLoading(true);
    try {
      const {newLocation, address} = await fetchLocationAddress();
      const roundedCurrentLat = location
        ? roundToPrecision(location.latitude)
        : null;
      const roundedCurrentLng = location
        ? roundToPrecision(location.longitude)
        : null;
      const roundedNewLat = roundToPrecision(newLocation.latitude);
      const roundedNewLng = roundToPrecision(newLocation.longitude);

      if (
        roundedCurrentLat === roundedNewLat &&
        roundedCurrentLng === roundedNewLng
      ) {
        moveCenterMap(newLocation.latitude, newLocation.longitude);
      } else {
        moveCenterMap(newLocation.latitude, newLocation.longitude);
        if (webViewRef.current) {
          const script = StoreMapAddScript(
            newLocation.latitude,
            newLocation.longitude,
          );
          webViewRef.current.injectJavaScript(script);
        }
      }
    } catch (err) {
      console.error('위치 업데이트 중 오류 발생:', err);
    } finally {
      setLoading(false);
    }
  };

  const setcenterrefresh = async () => {
    setLoading(true);
    try {
      const hasPermission = requestLocationPermission();
      if (!hasPermission) {
        showToast('위치 권한이 거부되었습니다.');
        return;
      }
      const targetCoords = centerLatLng || currentloacation;

      if (targetCoords) {
        const addressObj = await get_address(
          targetCoords.latitude,
          targetCoords.longitude,
        );
        const addressText = addressObj?.address || '';

        if (route.params?.onAddressSelect) {
          route.params.onAddressSelect({
            address: addressText,
            coords: targetCoords,
          });
        }

        showToast('주소 설정이 완료 되었습니다.');
        navigation.goBack();
      }
    } catch (err) {
      handleLocationError(err);
      console.error('지도 재설정 중 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const moveCenterMap = (lat, lng) => {
    const script = `
      if (window.map) {
        window.map.panTo(new kakao.maps.LatLng(${lat}, ${lng}));
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  const onMessageHandler = event => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.action === 'mapMoved') {
        if (isProgrammaticPan.current) {
          isProgrammaticPan.current = false;
          return;
        }

        const current = {
          latitude: message.latitude,
          longitude: message.longitude,
        };

        if (isSignificantMovement(prevCenterLatLng, current)) {
          setCenterLatLng(current);
          setPrevCenterLatLng(current);
        }
      }
    } catch (err) {
      console.error('WebView 메시지 파싱 오류:', err);
    }
  };

  const isSignificantMovement = (prev, current, threshold = 0.00001) => {
    if (!prev) return true;
    const latDiff = Math.abs(prev.latitude - current.latitude);
    const lngDiff = Math.abs(prev.longitude - current.longitude);
    return latDiff > threshold || lngDiff > threshold;
  };

  return (
    <>
      {location ? (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{html: KakaoMapHTML()}}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          nestedScrollEnabled={true} // 제스처 전달 허용
          onLoadEnd={fetchSaveLocation}
          style={styles.webview}
          onMessage={onMessageHandler}
        />
      ) : null}

      <TouchableOpacity style={styles.buttonRoute} onPress={updateNewLocation}>
        <Feather name="crosshair" size={30} color="#16BBFF" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.locationbtn} onPress={setcenterrefresh}>
        <Text style={styles.locationbtntext}>이 위치로 주소 설정</Text>
      </TouchableOpacity>

      <Loading loading={loading} />
    </>
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationbtn: {
    position: 'absolute',
    bottom: '5%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: '8%',
    backgroundColor: '#45C9FF',
    borderRadius: 12,
  },
  locationbtntext: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
  },
  buttonRoute: {
    position: 'absolute',
    bottom: '15%',
    left: '7%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(22, 187, 255, 0.2)',
  },
});

export default StoreAddMapScreen;
