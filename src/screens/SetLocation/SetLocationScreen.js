import React, {useState, useEffect, useCallback, useRef} from 'react';
import {SafeAreaView, StyleSheet, ScrollView} from 'react-native';
import Config from 'react-native-config';
import {
  saveLocationAddress,
  getAddress,
  getLocation,
  saveSearchRadius,
  getSearchRadius,
  clearLocationStorage,
  DEFAULT_SEARCH_RADIUS_KM,
} from '../../storage/locationStorage';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useToast} from '../../context/ToastContext';
import Loading from '../../hooks/Loading';
import {log_access_create} from '../../api/userApi';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import DeleteLocationButton from '../../components/SetLocation/DeleteLocationButton';
import MapPreview from '../../components/SetLocation/MapPreview';
import RadiusSelector from '../../components/SetLocation/RadiusSelector';
import SetLocationHeader from '../../components/SetLocation/SetLocationHeader';
import {useMapSearch, formatRadiusLabel} from '../../context/MapSearchContext';
import {formatLocationAddress} from '../../utils/locationAddressUtil';

const RADIUS_OPTIONS = [
  {label: '500m', value: 0.5},
  {label: '1km', value: 1},
  {label: '2km', value: 2},
  {label: '3km', value: 3},
];

const SetLocationScreen = ({navigation, route}) => {
  const [currentAddress, setCurrentAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapSearch = useMapSearch();

  const {bottom} = useSafeAndroidInsets();
  const [loading, setLoading] = useState(false);
  const [searchRadiusKm, setSearchRadiusKm] = useState(
    DEFAULT_SEARCH_RADIUS_KM,
  );
  const [mapLoaded, setMapLoaded] = useState(false);
  const webViewRef = useRef(null);
  const kakaoJsKey = Config?.KAKAO_APP_JAVASCRIPT || '';

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoJsKey}"></script>
      <style>
        html, body { width: 100%; height: 100%; margin: 0; padding: 0; }
        #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        (function() {
          var attempts = 0;
          function notifyLoaded() {
            if (!window.ReactNativeWebView || !window.kakao || !window.kakao.maps) return;
            kakao.maps.load(function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ action: "mapLoaded" }));
            });
          }
          function waitForKakao() {
            if (window.kakao && window.kakao.maps) {
              notifyLoaded();
              return;
            }
            attempts++;
            if (attempts > 100) return; // ~10s guard
            setTimeout(waitForKakao, 100);
          }
          waitForKakao();
        })();
      </script>
    </body>
    </html>
  `;
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();
  const origin = route?.params?.origin || null;
  const setMapRadius = mapSearch?.setRadiusKm;
  const setMapStoredRadius = mapSearch?.setStoredRadiusKm;
  const setMapFilters = mapSearch?.setSelectedFilters;

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
    const fetchLocation = async () => {
      try {
        const storageLocation = await getLocation();
        if (storageLocation) setCurrentLocation(storageLocation);
        const storageAddress = await getAddress();
        if (storageAddress) setCurrentAddress(storageAddress);
        const storedRadius = await getSearchRadius();
        if (typeof storedRadius === 'number') {
          setSearchRadiusKm(storedRadius);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchLocation();
  }, []);

  const onAddressSelect = async ({address, coords}) => {
    if (JSON.stringify(currentLocation) === JSON.stringify(coords)) {
      showToast('이전에 설정한 위치와 같습니다.');
      return;
    }
    try {
      setLoading(true);
      if (address && coords) {
        let addressText = address || '';
        if (address) {
          addressText = formatLocationAddress(addressText);
        }
        await saveLocationAddress(coords, addressText);

        log_access_create(coords);
        setCurrentLocation(coords);
        setCurrentAddress(addressText);
        showToast('주소 설정이 완료 되었습니다.');
        setTimeout(() => {
          resetToHome();
        }, 100);
      } else {
        showAlert({title: '주소를 선택해주세요.'});
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigation.navigate('LocationSearchScreen', {onAddressSelect});
  };

  const handleGetCurrentLocation = async () => {
    try {
      const location = await getLocation();
      navigation.navigate('LocataionMapScreen', {location, origin});
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearLocation = async () => {
    if (currentAddress === '신논현역') {
      showToast('현재 기본 주소입니다.');
    } else {
      try {
        const newLocationAddress = await clearLocationStorage();
        if (newLocationAddress) {
          setCurrentLocation(newLocationAddress.fixedLocation);
          setCurrentAddress(newLocationAddress.fixedAddress);
          showToast('저장된 주소가 삭제되었습니다.');
        }
        setTimeout(() => {
          resetToHome();
        }, 100);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleSelectRadius = async value => {
    setSearchRadiusKm(value);
    try {
      setMapRadius?.(value);
      setMapStoredRadius?.(value);
      setMapFilters?.(prev => {
        const filters = prev || {};
        const distanceKey =
          Object.keys(filters).find(key =>
            (key || '').replace(/\s/g, '').includes('거리'),
          ) || '거리';
        return {...filters, [distanceKey]: formatRadiusLabel(value)};
      });
      await saveSearchRadius(value);
      if (currentLocation && mapLoaded) {
        updateMapCircle(currentLocation, value);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMapLevel = radiusKmValue => {
    if (radiusKmValue >= 3) return 8; // 3km
    if (radiusKmValue >= 2) return 7; // 2km
    if (radiusKmValue >= 1) return 6; // 2km
    return 5; // 0.5km, 1km
  };

  const updateMapCircle = (location, radiusKmValue) => {
    const radiusMeters = Math.round(radiusKmValue * 1000);
    const level = getMapLevel(radiusKmValue);
    const script = `
      (function() {
        if (!window.kakao || !window.kakao.maps || !document.getElementById('map')) return true;
        kakao.maps.load(function() {
          var mapContainer = document.getElementById('map');
          var center = new kakao.maps.LatLng(${location.latitude}, ${location.longitude});
          if (!window.map || typeof window.map.setLevel !== 'function') {
            window.map = new kakao.maps.Map(mapContainer, {
              center: center,
              level: ${level}
            });
          } else {
            window.map.setLevel(${level}, {anchor: center});
            window.map.setCenter(center);
          }
          try {
            if (window.map && typeof window.map.setDraggable === 'function') {
              window.map.setDraggable(false);
            }
            if (window.map && typeof window.map.setZoomable === 'function') {
              window.map.setZoomable(false);
            }
          } catch (e) {}
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              action: 'mapUpdated',
              radiusKm: ${radiusKmValue},
              level: ${level}
            }));
          } catch (e) {}

          var markerImageUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(\`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 400 400">
  <circle cx="200" cy="200" r="200" fill="rgba(0, 109, 254, 0.2)" />
  <circle cx="200" cy="200" r="90" fill="#ffffff" />
  <circle cx="200" cy="200" r="60" fill="#006DFE" />
</svg>\`);

          if (!window.centerMarker) {
            window.centerMarker = new kakao.maps.Marker({
              position: center,
              map: window.map,
              zIndex: 3,
              image: new kakao.maps.MarkerImage(
                markerImageUrl,
                new kakao.maps.Size(40, 40),
                { offset: new kakao.maps.Point(20, 20) }
              )
            });
          } else {
            window.centerMarker.setPosition(center);
          }

          if (window.radiusCircle) {
            window.radiusCircle.setMap(null);
          }
          window.radiusCircle = new kakao.maps.Circle({
            center: center,
            radius: ${radiusMeters},
            strokeWeight: 2,
            strokeColor: '#3CBBFF',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            fillColor: '#3CBBFF',
            fillOpacity: 0.15
        });
          window.radiusCircle.setMap(window.map);
        });
        true;
      })();
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  useEffect(() => {
    if (mapLoaded && currentLocation) {
      updateMapCircle(currentLocation, searchRadiusKm);
    }
  }, [mapLoaded, currentLocation, searchRadiusKm]);

  return (
    <SafeAreaView style={[styles.container, {paddingBottom: bottom}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <SetLocationHeader
          address={currentAddress}
          noticeMessage="현재 한잔할까는 강남구 중심으로 운영 중입니다."
          onGetCurrentLocation={handleGetCurrentLocation}
          onSearch={handleSearch}
        />
        <DeleteLocationButton onPress={handleClearLocation} />
        <RadiusSelector
          options={RADIUS_OPTIONS}
          selectedValue={searchRadiusKm}
          onSelect={handleSelectRadius}
        />
        <MapPreview
          mapHtml={mapHtml}
          webViewRef={webViewRef}
          onMapLoaded={() => setMapLoaded(true)}
        />
      </ScrollView>
      <AlertComponent />
      <Loading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

export default SetLocationScreen;
