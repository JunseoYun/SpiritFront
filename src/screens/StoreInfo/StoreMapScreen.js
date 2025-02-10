import React, {useState, useEffect, useRef} from 'react';
import {Text, View, StyleSheet} from 'react-native';

import {WebView} from 'react-native-webview';
import {getLocation} from '../../storage/locationStorage';
import {fetchLocation} from '../../hooks/useLocation';
import KakaoMapHTML from '../../components/MapScreen/KakaoMapHTML';
import StoreMapScript from '../../components/StoreMapScreen/StoreMapScript';
import StoreMapLocation from '../../components/StoreMapScreen/StoreMapLocation';
import StoreMapCenter from '../../components/StoreMapScreen/StoreMapCenter';
import {openKakaoMap} from '../../hooks/openKakaoMap';
import StoreMapFoot from '../../components/StoreMapScreen/StoreMapFoot';
import StoreMapBus from '../../components/StoreMapScreen/StoreMapBus';
import StoreMapCar from '../../components/StoreMapScreen/StoreMapCar';

const StoreMapScreen = ({
  storeLatitude,
  storeLongitude,
  innerlatitude,
  innerlongitude,
}) => {
  const [location, setLocation] = useState({innerlatitude, innerlongitude});
  const webViewRef = useRef(null);

  useEffect(() => {
    fetchSaveLocation();
  }, []);

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

  const updateNewLocation = async () => {
    try {
      const newLocation = await fetchLocation();
      if (
        location &&
        location.latitude === newLocation.latitude &&
        location.longitude === newLocation.longitude
      ) {
        moveCenterMap(newLocation.latitude, newLocation.longitude);
      } else {
        setLocation(newLocation);
        updateMap(
          newLocation.latitude,
          newLocation.longitude,
          storeLatitude,
          storeLongitude,
        );
      }
    } catch (err) {
      console.error('위치 업데이트 중 오류 발생:', err);
    }
  };

  const storeCenter = () => {
    moveCenterMap(storeLatitude, storeLongitude);
  };

  const openMapHandle = text => {
    openKakaoMap(
      location.latitude,
      location.longitude,
      storeLatitude,
      storeLongitude,
      text,
    );
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
    <View style={styles.container}>
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
      <StoreMapFoot onPress={() => openMapHandle('FOOT')} />
      <StoreMapBus onPress={() => openMapHandle('PUBLICTRANSIT')} />
      <StoreMapCar onPress={() => openMapHandle('CAR')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 700,
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
