import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Pressable,
  FlatList,
  Text,
  View,
  Image,
  Modal,
  Animated, // Animated 추가
  PanResponder, // PanResponder 추가
} from 'react-native';
import { WebView } from 'react-native-webview';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { getLocation } from '../../storage/locationStorage';
import { fetchLocation } from '../../hooks/useLocation';
import { getStore } from '../../api/storeApi';
import throttle from 'lodash/throttle';
import MapSearchBar from '../../components/MapScreen/MapSearchBar';
import MapLocation from '../../components/MapScreen/MapLocation';
import MapDirections from '../../components/MapScreen/MapDirections';
import MapCategory from '../../hooks/MapCategory';

const MapScreen = () => {
  const [location, setLocation] = useState(null);

  const [error, setError] = useState(null);

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null); // 선택된 가게 상태
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const webViewRef = useRef(null);
  const [isWebModalVisible, setWebModalVisible] = useState(false);
  const flatListRef = useRef(null);

  const [isFlatListVisible, setIsFlatListVisible] = useState(true); // 플랫리스트 상태
  const flatListAnim = useRef(new Animated.Value(0)).current; // 초기 위치 0

  const openWebModal = () => {
    setWebModalVisible(true);
  };

  const closeWebModal = () => {
    setWebModalVisible(false);
  };


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
        updateMap(newLocation.latitude, newLocation.longitude, stores);
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

  const updateMap = (lat, lng, stores) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(generateMapScript(lat, lng, stores));
    }
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

  // 지도 클릭 이벤트 추가
  kakao.maps.event.addListener(map, 'click', function() {
    window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'hideFlatList' }));
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
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        if (typeof kakao !== "undefined" && kakao.maps) {
          console.log("Kakao Maps API 로드 완료");
          window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'mapLoaded' }));
        } else {
          console.error("Kakao Maps API 로드 실패");
        }
      });
    </script>
  </body>
  </html>
`;

  const onMessageHandler = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      // 기존 메시지 처리
      if (message.action === 'mapLoaded') {
        console.log('Kakao Maps API가 로드되었습니다.');
        const script = generateMapScript(location.latitude, location.longitude, stores);
        webViewRef.current?.injectJavaScript(script);
      }

      // 새로운 메시지 처리
      handleWebViewMessage(message); // 새로운 로직 추가
    } catch (error) {
      console.error('Error parsing message from WebView:', error);
    }
  };


  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 세로로 드래그된 경우만 활성화
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 30
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -30) {
          // 위로 드래그
          showFlatList();
        } else if (gestureState.dy > 30) {
          // 아래로 드래그
          hideFlatList();
        }
      },
    }),
  ).current;

  // 플랫리스트 애니메이션 함수
  const hideFlatList = () => {
    Animated.timing(flatListAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setIsFlatListVisible(false));
  };

  const showFlatList = () => {
    setIsFlatListVisible(true);
    Animated.timing(flatListAnim, {
      toValue: 0, // 플랫리스트를 원래 위치로
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleWebViewMessage = throttle(message => {
    if (message.action === 'hideFlatList') {
      console.log('Hiding FlatList'); // 디버깅용 로그
      hideFlatList(); // 플랫리스트 숨기기
    } else if (message.action === 'markerClicked' && message.storeId) {
      console.log('Marker clicked:', message.storeId); // 디버깅용 로그
      showFlatList();

      const index = stores.findIndex(
        store => store.storeId === message.storeId,
      );
      if (index !== -1) {
        setSelectedStoreIndex(index);
        flatListRef.current.scrollToOffset({
          offset: index * 410, // snapToInterval 값 사용
          animated: true,
        });

        const store = stores[index];
        if (store) {
          moveCenterMap(store.latitude, store.longitude);
        }
      }
    }
  }, 500); // 500ms 내에 동일한 메시지는 무시


  return (
    <View style={styles.container}>
      {location ? (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: initialHtml }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={onMessageHandler} // 메시지 핸들러 추가
          nestedScrollEnabled={true} // 제스처 전달 허용
          onLoadEnd={fetchSaveLocation}
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

      <Animated.View
        {...panResponder.panHandlers} // PanResponder 연결
        style={[
          styles.flatListContainer,
          { transform: [{ translateY: flatListAnim }], zIndex: 10 }, // 위치 애니메이션
        ]}>
        {isFlatListVisible && (
          <FlatList
            ref={flatListRef}
            data={stores}
            horizontal
            keyExtractor={item => item.storeId.toString()}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            snapToInterval={410} // 아이템 너비(350) + 간격(60)
            decelerationRate="fast"
            onScroll={event => {
              const offsetX = event.nativeEvent.contentOffset.x; // 스크롤 위치
              const index = Math.round(offsetX / 410); // 현재 중앙 아이템 인덱스 계산

              // 중앙 아이템이 바뀌었을 때만 처리
              if (index !== selectedStoreIndex) {
                setSelectedStoreIndex(index); // 중앙 아이템 인덱스 업데이트

                // 해당 인덱스의 좌표로 지도 이동
                setSelectedStore(stores[index]);
                const store = stores[index];
                if (store) {
                  moveCenterMap(store.latitude, store.longitude); // 지도 이동 함수 호출
                }
              }
            }}
            scrollEventThrottle={16} // 스크롤 이벤트 호출 빈도
            renderItem={({ item, index }) => (
              <Pressable
                style={[
                  styles.storeInfo,
                  index === selectedStoreIndex ? styles.selectedStore : null,
                ]}
                onPress={() => {
                  navigation.navigate('StoreStack', {
                    screen: 'StoreMainPage',
                    params: {
                      storeId: selectedStore.storeId,
                      innerlatitude: location.latitude,
                      innerlongitude: location.longitude,
                    },
                  });
                }}>
                <Image
                  source={require('../../assets/kim.png')}
                  style={styles.storeImage}
                />
                <View style={styles.titletopview}>
                  <View style={styles.titleview}>
                    <Text style={styles.storeName}>{item.storeName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FontAwesomeIcon name="star" size={15} color="#FCC104" />
                      <Text style={styles.storeAddress}>{item.storeRate}</Text>
                    </View>
                  </View>
                  <View style={styles.category}>
                    {item.categories.slice(0, 3).map((category, idx) => (
                      <MapCategory
                        key={idx}
                        categories={[category]}
                        style={styles.StoreCategory}
                      />
                    ))}
                  </View>
                  <View style={styles.timeview}>
                    <Text style={styles.timeviewtext}>
                      영업종료 {item.closeHour.slice(0, 5)}
                    </Text>
                  </View>
                  <Text style={styles.menutext}>소주 5000원</Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </Animated.View>

      {selectedStore && (
        <Modal
          visible={isWebModalVisible}
          animationType="slide"
          transparent={true}>
          <View style={styles.container}>
            <WebView
              source={{
                uri: `https://map.kakao.com/link/map/${selectedStore.latitude},${selectedStore.longitude}`,
              }} // 열고 싶은 웹페이지의 URL
            />
          </View>
          <View style={styles.goBackButton2}>
            <Pressable onPress={closeWebModal}>
              <FontAwesomeIcon
                name={'angle-left'}
                size={30}
                color={'gray'}
                style={styles.searchicon}
              />
            </Pressable>
          </View>
        </Modal>
      )}
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

  StoreCategory: {
    top: 1,
    fontSize: 15,
    color: 'black',
    marginRight: 5,
  },
  searchBar: {
    width: '100%',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  buttonTop: {
    position: 'absolute',
    top: '3%',
    left: '5%',
    backgroundColor: '#ffffff',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    width: '90%',
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#ccc',

    // 그라디언트 효과 (배경이 단일 색상이 아닌 경우)
    backgroundColor: '#fdfdfd',
  },
  buttonBottom: {
    position: 'absolute',
    bottom: '20%',
    left: '7%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowColor: '#16BBFF',
    elevation: 0.001,
  },
  buttonRoute: {
    position: 'absolute',
    bottom: '20%',
    right: '7%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowColor: '#16BBFF',
    elevation: 0.001,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonTextTop: {
    color: 'gray',
    fontSize: 16,
    borderRadius: 100,
    width: '100%',
    left: '3%',
    textAlign: 'left',
    marginLeft: 5,
  },

  flatListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 10,
    elevation: 10,
    minHeight: 30, // 숨김 상태에서도 60px 정도 보이도록 설정
  },

  storeInfo: {
    flexDirection: 'row',
    width: 370, // 아이템 너비
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20, // 아이템 간 간격
  },
  titletopview: {
    flex: 1,
    marginLeft: 20,
  },
  titleview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  category: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  storeAddress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginRight: 5,
  },
  todayimageView: {
    alignItems: 'center',
  },
  storeImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  timeview: {
    flexDirection: 'row',
  },
  timeviewtext: {
    fontSize: 12,
    fontWeight: '700',
    color: 'gray',
    marginBottom: 15,
  },
  menutext: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16BBFF',
  },
  goBackButton2: {
    position: 'absolute',
    bottom: '10%',
    left: '3%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'white',

    // 그림자 설정
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // 아래쪽으로 더 깊은 그림자
    shadowOpacity: 0.3, // 그림자의 투명도
    shadowRadius: 6, // 그림자의 퍼짐 정도
    elevation: 12, // 안드로이드 그림자 효과

    // 테두리 설정
    borderWidth: 1,
    borderColor: '#ccc',

    // 그라디언트 효과 (배경이 단일 색상이 아닌 경우)
    backgroundColor: '#fdfdfd',
  },
});

export default MapScreen;
