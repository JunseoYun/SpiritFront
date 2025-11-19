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
import {fetchLocation} from '../../hooks/useLocation';
import KakaoMapHTML from '../../components/MapScreen/KakaoMapHTML';
import StoreMapScript from '../../components/StoreMapScreen/StoreMapScript';
import StoreMapLocation from '../../components/StoreMapScreen/StoreMapLocation';
import StoreMapCenter from '../../components/StoreMapScreen/StoreMapCenter';
import StoreMapNavi from '../../components/StoreMapScreen/StoreMapNavi';
import {useRoute} from '@react-navigation/native';
import useDirectionsModal from '../../hooks/useDirectionsModal';

const StoreMapScreen = ({navigation}) => {
  const route = useRoute();
  const {storeLatitude, storeLongitude, innerlatitude, innerlongitude} =
    route.params;
  const {openDirectionsModal, DirectionsModal} = useDirectionsModal();

  const [location, setLocation] = useState({innerlatitude, innerlongitude});
  const webViewRef = useRef(null);

  useEffect(() => {
    let isMounted = true; // ✅ cleanup을 위한 변수 추가
    const fetchSaveLocation = async () => {
      try {
        const currentLocation = await getLocation();
        if (isMounted) {
          setLocation(currentLocation);
          if (webViewRef.current) {
            const script = StoreMapScript(
              currentLocation.latitude,
              currentLocation.longitude,
              storeLatitude,
              storeLongitude,
            );
            webViewRef.current.injectJavaScript(script);
          }
        }
      } catch (err) {
        console.error('위치 가져오는 중 오류 발생:', err);
      }
    };
    fetchSaveLocation();

    return () => {
      isMounted = false; // ✅ cleanup
    };
  }, [storeLatitude, storeLongitude]);

  const fetchSaveLocation = async () => {
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation);
      // 지도를 초기화하고 마커를 업데이트
      if (webViewRef.current) {
        const script = StoreMapScript(
          currentLocation.latitude,
          currentLocation.longitude,
          storeLatitude,
          storeLongitude,
        );
        webViewRef.current.injectJavaScript(script);
      }
    } catch (err) {
      console.error('위치 가져오는 중 오류 발생:', err);
    }
  };
  const roundToPrecision = (value, precision = 4) => {
    return parseFloat(value.toFixed(precision)); // 🔥 소수점 5자리까지만 남김
  };

  const updateNewLocation = async () => {
    try {
      const newLocation = await fetchLocation();
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
        console.log('true');
        moveCenterMap(newLocation.latitude, newLocation.longitude);
      } else {
        console.log('false');
        setLocation(newLocation);
        updateMap(
          newLocation.latitude,
          newLocation.longitude,
          storeLatitude,
          storeLongitude,
        );

        moveCenterMap(newLocation.latitude, newLocation.longitude);
      }
    } catch (err) {
      console.error('위치 업데이트 중 오류 발생:', err);
    }
  };

  const storeCenter = () => {
    moveCenterMap(storeLatitude, storeLongitude);
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

  const updateMap = (lat, lng, storeLatitude, storeLongitude) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(
        StoreMapScript(lat, lng, storeLatitude, storeLongitude),
      );
    }
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
        />
      ) : (
        <View style={styles.loading}>
          <Text>Loading Map...</Text>
        </View>
      )}

      <StoreMapLocation onPress={updateNewLocation} />
      <StoreMapCenter onPress={storeCenter} />
      <StoreMapNavi
        onPress={() =>
          openDirectionsModal({
            startLat: location?.latitude,
            startLng: location?.longitude,
            destLat: storeLatitude,
            destLng: storeLongitude,
            destName: route.params?.storename,
          })
        }
      />
      <DirectionsModal />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 15,
    textAlign: 'center',
    color: '#333', // ✅ 더 진한 색상 적용
  },
  webview: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StoreMapScreen;
