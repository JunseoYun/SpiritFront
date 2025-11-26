import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Share,
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useDistance from '../../hooks/useDistance';
import Clipboard from 'react-native/Libraries/Components/Clipboard/Clipboard';
import {useToast} from '../../context/ToastContext';
import NonImageHeader from '../../components/StoreScreen/NonImageHeader';
import StoreTabs from '../../components/StoreScreen/StoreTabs';
import {Storelikepost, get_store_share} from '../../api/storeApi';
import CustomText from '../../utils/CustomText';

const StoreMapScreen = ({navigation}) => {
  const route = useRoute();
  const {
    storeLatitude,
    storeLongitude,
    innerlatitude,
    innerlongitude,
    storename,
    storeAddress,
    storeAddressDetail,
    storeId,
    isStoreLiked: initialIsStoreLiked,
    onSelectTab,
  } = route.params;
  const {openDirectionsModal, DirectionsModal} = useDirectionsModal();
  const insets = useSafeAreaInsets();

  const [location, setLocation] = useState({innerlatitude, innerlongitude});
  const [infoHeight, setInfoHeight] = useState(null);
  const webViewRef = useRef(null);
  const calculateDistance = useDistance();
  const {showToast} = useToast();
  const [showAddressOverlay, setShowAddressOverlay] = useState(false);
  const [isStoreLiked, setIsStoreLiked] = useState(
    Boolean(initialIsStoreLiked),
  );
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  useEffect(() => {
    setIsStoreLiked(Boolean(initialIsStoreLiked));
  }, [initialIsStoreLiked]);

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
              storename,
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
          storename,
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
        moveCenterMap(newLocation.latitude, newLocation.longitude);
      } else {
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
        StoreMapScript(lat, lng, storeLatitude, storeLongitude, storename),
      );
    }
  };

  const handleShare = useCallback(async () => {
    if (!storeId) {
      showToast?.('매장 정보를 불러오지 못했어요.', 'center');
      return;
    }
    try {
      const response = await get_store_share(storeId);
      if (!response?.shareLink) {
        showToast?.('공유할 링크를 가져오지 못했어요.', 'center');
        return;
      }
      const storeLabel = storename || '한잔할까';
      await Share.share({
        message: `${storeLabel}에서 한잔 어때요?\n한잔할까에서 매장 정보를 확인하세요.\n\n${response.shareLink}`,
        shareLink: response.shareLink,
      });
    } catch (error) {
      console.error('onShare error:', error);
      showToast?.('공유 도중 문제가 발생했어요.', 'center');
    }
  }, [showToast, storeId, storename]);

  const handleToggleLike = useCallback(async () => {
    if (!storeId || isLikeProcessing) {
      return;
    }
    setIsLikeProcessing(true);
    try {
      await Storelikepost(storeId);
      setIsStoreLiked(prev => !prev);
    } catch (error) {
      console.error('toggle like error:', error);
      showToast?.('찜 상태를 변경하지 못했어요.', 'center');
    } finally {
      setIsLikeProcessing(false);
    }
  }, [storeId, isLikeProcessing, showToast]);

  const handleTabChange = useCallback(
    screenName => {
      if (screenName === 'StoreMapScreen') {
        return;
      }
      if (onSelectTab) {
        onSelectTab(screenName);
        navigation.goBack();
        return;
      }
      navigation.navigate({
        name: 'StoreMainScreen',
        params: {targetTab: screenName},
        merge: true,
      });
    },
    [navigation, onSelectTab],
  );

  const resolvedAddress = useMemo(() => {
    const base =
      typeof storeAddress === 'string' && storeAddress.trim().length > 0
        ? storeAddress.trim()
        : '';
    const detail =
      typeof storeAddressDetail === 'string' &&
      storeAddressDetail.trim().length > 0
        ? storeAddressDetail.trim()
        : '';
    if (base && detail) {
      return `${base}, ${detail}`;
    }
    return base || detail || '';
  }, [storeAddress, storeAddressDetail]);
  const distanceLabel = useMemo(() => {
    if (
      !location ||
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number' ||
      typeof storeLatitude !== 'number' ||
      typeof storeLongitude !== 'number'
    ) {
      return '';
    }
    const dist = calculateDistance(
      location.latitude,
      location.longitude,
      storeLatitude,
      storeLongitude,
    );
    if (!Number.isFinite(dist)) {
      return '';
    }
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m`;
    }
    return `${dist.toFixed(2)}km`;
  }, [
    calculateDistance,
    location?.latitude,
    location?.longitude,
    storeLatitude,
    storeLongitude,
  ]);
  const hasDetailLine = Boolean(resolvedAddress) || Boolean(distanceLabel);
  const handleCopyAddress = useCallback(() => {
    const base =
      typeof storeAddress === 'string' && storeAddress.trim().length > 0
        ? storeAddress.trim()
        : '';
    if (!base) {
      return;
    }
    Clipboard.setString(base);
    showToast?.('주소를 복사했어요.', 'center');
  }, [storeAddress, showToast]);
  const infoPaddingBottom = Math.max(16, insets.bottom + 8);
  const defaultInfoHeight = hasDetailLine ? 120 : 96;
  const controlsBottom = (infoHeight ?? defaultInfoHeight) + 24;

  return (
    <View style={styles.screen}>
      <View style={styles.headerContainer}>
        <NonImageHeader
          navigation={navigation}
          headerBackgroundColor="#fff"
          iconColor="#333"
          title={storename}
          onShare={handleShare}
          isLiked={isStoreLiked}
          onToggleLike={handleToggleLike}
          likeDisabled={isLikeProcessing || !storeId}
          isAbsolute={false}
          containerStyle={styles.inlineHeader}
        />
        <View style={styles.tabsWrapper}>
          <StoreTabs
            changePage={handleTabChange}
            currentPage="StoreMapScreen"
            showBottomBorder
          />
        </View>
      </View>
      <TouchableWithoutFeedback
        onPress={() => {
          if (showAddressOverlay) {
            setShowAddressOverlay(false);
          }
        }}>
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
              <CustomText>Loading Map...</CustomText>
            </View>
          )}

          <StoreMapLocation
            onPress={() => {
              setShowAddressOverlay(false);
              updateNewLocation();
            }}
            style={[styles.mapControl, {bottom: controlsBottom + 52}]}
          />
          <StoreMapCenter
            onPress={() => {
              setShowAddressOverlay(false);
              storeCenter();
            }}
            style={[styles.mapControl, {bottom: controlsBottom}]}
          />
          <StoreMapNavi
            onPress={() => {
              setShowAddressOverlay(false);
              openDirectionsModal({
                startLat: location?.latitude,
                startLng: location?.longitude,
                destLat: storeLatitude,
                destLng: storeLongitude,
                destName: route.params?.storename,
              });
            }}
            style={{bottom: controlsBottom}}
          />
          <View
            style={[
              styles.storeInfoContainer,
              {paddingBottom: infoPaddingBottom},
            ]}
            onLayout={({nativeEvent}) => {
              const height = nativeEvent?.layout?.height;
              if (typeof height === 'number' && height !== infoHeight) {
                setInfoHeight(height);
              }
            }}>
            <CustomText style={styles.storeInfoName} numberOfLines={1}>
              {storename || '매장 정보'}
            </CustomText>
            {hasDetailLine ? (
              <>
                <View style={styles.infoDetailRow}>
                  {distanceLabel ? (
                    <>
                      <CustomText style={styles.storeInfoDistance}>
                        {distanceLabel}
                      </CustomText>
                      {resolvedAddress ? (
                        <CustomText style={styles.dotSeparator}> · </CustomText>
                      ) : null}
                    </>
                  ) : null}
                  {resolvedAddress ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowAddressOverlay(prev => !prev)}>
                      <CustomText
                        style={styles.storeInfoAddress}
                        numberOfLines={2}>
                        {resolvedAddress}
                      </CustomText>
                    </TouchableOpacity>
                  ) : null}
                </View>
                {resolvedAddress && showAddressOverlay ? (
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.addressPanel}
                    onPress={event => event.stopPropagation()}>
                    <View style={styles.addressPanelHeader}>
                      <CustomText style={styles.addressOverlayTitle}>
                        주소
                      </CustomText>
                      <TouchableOpacity
                        onPress={() => setShowAddressOverlay(false)}
                        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                        <CustomText style={styles.addressOverlayClose}>
                          ×
                        </CustomText>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.addressPanelContent}
                      onPress={handleCopyAddress}>
                      <CustomText style={styles.addressPanelText}>
                        {resolvedAddress}
                      </CustomText>
                      <CustomText style={styles.addressOverlayCopy}>
                        복사
                      </CustomText>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}
          </View>
          <DirectionsModal />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomColor: '#EDEDED',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabsWrapper: {
    backgroundColor: '#fff',
  },
  inlineHeader: {
    paddingBottom: 6,
  },
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
  mapControl: {
    position: 'absolute',
    left: '7%',
  },
  storeInfoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  storeInfoName: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    marginBottom: 4,
  },
  infoDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  storeInfoDistance: {
    fontSize: 14,
    color: '#3CBBFF',
    fontFamily: 'Pretendard-SemiBold',
  },
  dotSeparator: {
    color: '#D4D4D4',
    marginHorizontal: 4,
  },
  storeInfoAddress: {
    fontSize: 14,
    color: '#555',
    lineHeight: 18,
    fontFamily: 'Pretendard-Medium',
    paddingTop: 4,
  },
  addressPanel: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  addressPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  addressOverlayTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-Bold',
    color: '#111',
  },
  addressOverlayClose: {
    fontSize: 18,
    color: '#999',
    marginLeft: 8,
  },
  addressPanelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressPanelText: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    marginRight: 12,
  },
  addressOverlayCopy: {
    fontSize: 14,
    color: '#0A7CC1',
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default StoreMapScreen;
