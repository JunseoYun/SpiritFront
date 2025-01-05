import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { getLocation } from '../../storage/locationStorage';
import { fetchLocation, requestLocationPermission } from '../../hooks/useLocation';
import { getStore } from '../../api/storeApi';
import MapSearchBar from '../../components/MapScreen/MapSearchBar';
import MapLocation from '../../components/MapScreen/MapLocation';
import MapDirections from '../../components/MapScreen/MapDirections';

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const webViewRef = useRef(null);

  useEffect(() => {
    fetchSaveLocation();
  }, []);

  const fetchSaveLocation = async () => {
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation);

      const storesData = await getStore();
      setStores(storesData);

      if (webViewRef.current) {
        const script = generateMapScript(currentLocation.latitude, currentLocation.longitude, storesData);
        webViewRef.current.injectJavaScript(script);
      }
    } catch (err) {
      console.error('위치 또는 가게 데이터를 가져오는 중 오류 발생:', err);
    }
  };

  const updateNewLocation = async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert('위치 권한이 거부되었습니다.');
      return;
    }
    try {
      const newLocation = await getLocation();
      if (
        location &&
        location.latitude === newLocation.latitude &&
        location.longitude === newLocation.longitude
      ) {
        moveCenterMap(newLocation.latitude, newLocation.longitude);
      } else {
        setLocation(newLocation);
        if (webViewRef.current) {
          const script = generateMapScript(newLocation.latitude, newLocation.longitude, stores);
          webViewRef.current.injectJavaScript(script);
        }
      }
    } catch (err) {
      console.error('위치 업데이트 중 오류 발생:', err);
    }
  };

  const moveCenterMap = (lat, lng) => {
    const script = `
      if (window.map) {
        window.map.setCenter(new kakao.maps.LatLng(${lat}, ${lng}));
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  const generateMapScript = (lat, lng, stores) => `
    if (!window.map) {
      var mapContainer = document.getElementById('map');
      var options = {
        center: new kakao.maps.LatLng(${lat}, ${lng}),
        level: 3
      };
      window.map = new kakao.maps.Map(mapContainer, options);
    }

    var map = window.map;

    if (!window.currentMarker) {
      window.currentMarker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(${lat}, ${lng}),
        map: map,
        title: '현재 위치',
        zIndex: 1
      });
    } else {
      window.currentMarker.setPosition(new kakao.maps.LatLng(${lat}, ${lng}));
    }

    if (window.storeMarkers) {
      window.storeMarkers.forEach(marker => marker.setMap(null));
    }

    window.storeMarkers = ${JSON.stringify(stores)}.map(store => {
      var markerPosition = new kakao.maps.LatLng(store.latitude, store.longitude);

      var marker = new kakao.maps.Marker({
        position: markerPosition,
        map: map,
        title: store.storeName,
        zIndex: 2,
        image: new kakao.maps.MarkerImage(
          'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
          new kakao.maps.Size(24, 35)
        )
      });

      kakao.maps.event.addListener(marker, 'click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'markerClicked', storeId: store.storeId }));
      });

      return marker;
    });

    true;
  `;

  const initialHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      <title>Kakao Map</title>
      <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=f5e6db800b171aa75ab189e0c334c74a"></script>
      <style>
        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
        #map {
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {location ? (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: initialHtml }}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
        />
      ) : (
        <View style={styles.loading}>
          <Text>Loading Map...</Text>
        </View>
      )}
      <MapSearchBar buttonText="근처 주점들을 검색해보세요." />
      <MapLocation onPress={updateNewLocation} />
      <MapDirections />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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

export default MapScreen;
