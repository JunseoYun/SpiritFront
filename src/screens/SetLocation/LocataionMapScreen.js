import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import {WebView} from 'react-native-webview';
import {getLocation, saveLocationAddress} from '../../storage/locationStorage';
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
import {log_access_create} from '../../api/userApi';
import BottomActionButton from '../../utils/BottomActionButton';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomText from '../../utils/CustomText';
import {formatLocationAddress} from '../../utils/locationAddressUtil';
const LocataionMapScreen = ({navigation}) => {
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const {location, onAddressSelect, origin} = route.params || {};
  const [centerLatLng, setCenterLatLng] = useState(null);
  const [prevCenterLatLng, setPrevCenterLatLng] = useState(null);
  const [currentloacation, setCurrentloacation] = useState(null);
  const isProgrammaticPan = useRef(false);
  const {showToast} = useToast();
  const webViewRef = useRef(null);

  const insets = useSafeAreaInsets();

  const resetToHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainBtmbar',
          params: {
            initialTab: 'ExploreScreen',
            lastFocusedTab: 'ExploreScreen',
            lastNonMapTab: 'ExploreScreen',
          },
        },
      ],
    });
  }, [navigation]);
  useEffect(() => {
    if (location) {
      updateNewLocation();
    }
  }, [location]);

  const roundToPrecision = (value, precision = 4) => {
    return parseFloat(value.toFixed(precision)); // 🔥 소수점 5자리까지만 남김
  };

  const updateNewLocation = async () => {
    setLoading(true);
    try {
      const {newLocation, address} = await fetchLocationAddress();
      setCurrentloacation(newLocation);

      if (webViewRef.current) {
        const script = StoreMapAddScript(
          newLocation.latitude,
          newLocation.longitude,
        );
        webViewRef.current.injectJavaScript(script);
      }

      moveCenterMap(newLocation.latitude, newLocation.longitude);
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

      const roundedNewLat = roundToPrecision(location.latitude);
      const roundedNewLng = roundToPrecision(location.longitude);

      const centerLat = roundToPrecision(
        centerLatLng?.latitude ?? currentloacation.latitude,
      );
      const centerLng = roundToPrecision(
        centerLatLng?.longitude ?? currentloacation.longitude,
      );

      if (roundedNewLat === centerLat && roundedNewLng === centerLng) {
        showToast('이전에 설정한 위치와 같습니다.', 'center');
        return;
      }

      const targetCoords = centerLatLng || currentloacation;

      if (targetCoords) {
        const addressObj = await get_address(
          targetCoords.latitude,
          targetCoords.longitude,
        );

        let addressText = addressObj?.address || '';
        if (addressObj?.address) {
          addressText = formatLocationAddress(addressText);
        }

        if (addressObj) {
          await saveLocationAddress(targetCoords, addressText);
          log_access_create(targetCoords);
          showToast('주소 설정이 완료 되었습니다.');
          setTimeout(() => {
            resetToHome();
          }, 100);
        } else {
          showToast('주소 설정 오류.');
          return;
        }
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
    <View style={{flex: 1}}>
      {location ? (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{html: KakaoMapHTML()}}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          nestedScrollEnabled={true}
          style={styles.webview}
          onMessage={onMessageHandler}
        />
      ) : null}

      {/* <TouchableOpacity
        style={[styles.buttonRoute, {bottom: 110 + bottom}]}
        onPress={updateNewLocation}>
        <Feather name="crosshair" size={30} color="#3CBBFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.locationbtn, {bottom: 40 + bottom}]}
        onPress={setcenterrefresh}>
        <CustomText style={styles.locationbtntext}>
          이 위치로 주소 설정
        </CustomText>
      </TouchableOpacity> */}

      <TouchableOpacity
        style={[styles.buttonRoute, {bottom: insets.bottom + 100}]}
        onPress={updateNewLocation}>
        <Feather name="crosshair" size={22} color="#3CBBFF" />
      </TouchableOpacity>

      <BottomActionButton
        label={'이 위치로 주소 설정'}
        cancel={true}
        onPress={setcenterrefresh}
        onCancel={() => navigation.goBack()}
      />
      <Loading loading={loading} />
    </View>
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
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    backgroundColor: '#3CBBFF',
    borderRadius: 7,
  },
  locationbtntext: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 15,
  },
  buttonRoute: {
    width: 42,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.15,
    shadowRadius: 4,

    position: 'absolute',
    right: '7%',
  },
});

export default LocataionMapScreen;
