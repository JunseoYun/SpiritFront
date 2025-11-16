import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Animated,
  Text,
  Platform,
  Keyboard,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Share,
  Modal,
  TouchableOpacity,
  Dimensions,
  Easing,
} from 'react-native';
import ImageSlider from '../../components/StoreScreen/StoreImage/ImageSlider';
import StoreMainInfo from '../../components/StoreScreen/StoreMainInfo';
import StoreTabs from '../../components/StoreScreen/StoreTabs';
import StoreInfoImage from '../../components/StoreScreen/StoreInfoImage';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {StoreMainget, get_store_share, Storelikepost} from '../../api/storeApi';

import StoreMenuScreen from './StoreMenuScreen';
import StoreAlcoholScreen from './StoreAlcoholScreen';
import StoreHeader from '../../components/StoreScreen/StoreHeader';
import {StoreMenuget} from '../../api/menuApi';
import {StoreDrinkget} from '../../api/drinkApi';
import {useToast} from '../../context/ToastContext';
import {useAuth} from '../../context/AuthContext';
import Loading from '../../hooks/Loading';
import NonImageHeader from '../../components/StoreScreen/NonImageHeader';
import Alcoholcategorytab from '../../components/StoreAlcoholScreen/Alcoholcategorytab';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import StoreMainSkeleton from './StoreMainSkeleton';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import useScrollToTopVisibility from '../../hooks/useScrollToTopVisibility';
import OrderForm from '../../components/StoreScreen/OrderForm';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const StoreMainScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {top, bottom} = useSafeAndroidInsets();
  const {token} = useAuth();
  const route = useRoute();
  const {storeId, innerlatitude, innerlongitude} = route.params;

  const [menus, setMenus] = useState([]);
  const [alcohols, setAlcohols] = useState([]);
  const [storedata, setStoredata] = useState('');
  const [isStoreLiked, setIsStoreLiked] = useState(false);
  const [storeLikeCount, setStoreLikeCount] = useState(0);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [currentPage, setCurrentPage] = useState('StoreMenuScreen');
  const scrollViewRef = useRef(null); // ScrollView 참조 추가
  const [loading, setLoading] = useState(true);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const {showToast} = useToast();
  const [sectionPositions, setSectionPositions] = useState({});

  const [isOrderEnabled, setIsOrderEnabled] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderBarHeight, setOrderBarHeight] = useState(0);

  const {
    visible: showScrollToTop,
    scrollToTop,
    updateVisibility,
  } = useScrollToTopVisibility({externalRef: scrollViewRef});
  const scrollButtonBottom = (bottom || 16) + 34;
  const orderSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // 상위 scrollTo 함수
  const scrollToHandler = params => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo(params);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!token) {
        showToast('로그인 후 이용해주세요', 'center');
        navigation.goBack();
      }
    }, [token]),
  );

  const storeTimeEditHandle = () => {
    navigation.navigate('StoreTimeEditScreen', {
      storeId: storedata.id,
      operationInfoDtos: storedata.operationInfoDtos,
      is24Hours: storedata.isAlwaysOpen,
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!token) return;
      let isActive = true; // ✅ cleanup을 위한 변수 추가
      setTimeout(() => {
        if (isActive && currentPage === 'StoreMapScreen') {
          setCurrentPage('StoreMenuScreen'); // ✅ 상태 변경을 안전하게 수행
        }
      }, 0);
      return () => {
        isActive = false; // ✅ cleanup
      };
    }, [currentPage]),
  );
  useEffect(() => {
    if (!token) return;
    if (currentPage === 'StoreMapScreen') {
      setTimeout(() => {
        navigation.navigate('StoreMapScreen', {
          storename: storedata.name,
          storeLatitude: latitude,
          storeLongitude: longitude,
          innerlatitude: innerlatitude,
          innerlongitude: innerlongitude,
        });
      }, 0);
    }
  }, [currentPage]);

  // 처음 진입 시 전체 fetch
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!token) return;
    fetchInitialStoreData().finally(() => {
      isFirstLoad.current = false;
    });
  }, []);

  useEffect(() => {
    if (!token) return;
    const unsubscribe = navigation.addListener('focus', () => {
      if (!isFirstLoad.current) {
        fetchInitialStoreData();
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (showOrderForm) {
      Animated.timing(orderSlideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(orderSlideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [showOrderForm, orderSlideAnim]);

  const fetchStoreDataOnly = async () => {
    setLoading(true);
    try {
      const storeData = await StoreMainget(storeId);

      setStoredata(storeData);
      setIsStoreLiked(!!storeData?.isStoreLiked);
      setStoreLikeCount(storeData?.likeCount ?? 0);
      setLongitude(storeData.locationDto.longitude);
      setLatitude(storeData.locationDto.latitude);

      if (storeData.isDeleted) {
        showToast('삭제된 가게입니다.');
        setTimeout(() => navigation.goBack(), 100);
      }
    } catch (error) {
      console.error(error, '!!');
    } finally {
      setSkeletonLoading(false);
      setLoading(false);
    }
  };

  const fetchInitialStoreData = async () => {
    setLoading(true);
    try {
      await fetchStoreDataOnly();

      const Menus = await StoreMenuget(storeId);
      setMenus(Menus);
      const Drinks = await StoreDrinkget(storeId);
      setAlcohols(Drinks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startUpdate = () => {
    if (!storedata?.id) {
      showToast('매장 정보를 불러온 후 다시 시도해주세요.');
      return;
    }

    navigation.navigate('StoreStack', {
      screen: 'StoreManageScreen',
      params: {
        storeId: storedata.id,
        storedata: storedata,
        storeName: storedata?.name,
      },
    });
  };

  const imageSliderData =
    storedata.imgUrlList?.map(url => ({imageUrl: url})) || [];

  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [150, 250],
    outputRange: ['transparent', '#fff'],
    extrapolate: 'clamp',
  });

  const iconColor = scrollY.interpolate({
    inputRange: [150, 250],
    outputRange: ['#fff', '#333'],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [100, 250],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleReport = () => {
    navigation.navigate('StoreStack', {
      screen: 'StoreReportScreen',
      params: {
        storeId: storedata.id,
        storeName: storedata.name,
      },
    });
  };

  const handleReportList = () => {
    navigation.navigate('StoreStack', {
      screen: 'StoreReportList',
      params: {
        storeId: storedata.id,
        storeName: storedata.name,
      },
    });
  };

  const onShare = async () => {
    try {
      const response = await get_store_share(storeId);
      if (!response?.shareLink) {
        showToast('공유할 링크를 가져오지 못했어요.');
        return;
      }

      await Share.share({
        message: `${storedata.name}에서 한잔 어때요?\n한잔할까에서 매장 정보를 확인하세요.\n\n${response.shareLink}`,
        shareLink: response.shareLink,
      });
    } catch (error) {
      showToast('공유 도중 문제가 발생했어요.');
      console.error('onShare error:', error.response);
    }
  };

  const handleStoreInfo = () => {
    const locationDto = {
      latitude: latitude,
      longitude: longitude,
    };
    navigation.navigate('StoreStack', {
      screen: 'ManagerStoreInfoScreen',
      params: {
        storeId: storeId,
        storename: storedata.name,
        locationDto: locationDto,
      },
    });
  };

  const handleToggleLike = async () => {
    if (!storedata?.id || isLikeProcessing) {
      return;
    }
    const nextLikeState = !isStoreLiked;
    const previousCount = storeLikeCount ?? 0;
    const delta = nextLikeState ? 1 : -1;

    setIsStoreLiked(nextLikeState);
    setStoreLikeCount(Math.max(0, previousCount + delta));
    setIsLikeProcessing(true);

    try {
      await Storelikepost(storedata.id);
    } catch (error) {
      setIsStoreLiked(!nextLikeState);
      setStoreLikeCount(previousCount);
      showToast('찜 상태를 변경하지 못했어요.', 'center');
    } finally {
      setIsLikeProcessing(false);
    }
  };

  const [mainSectionHeight, setMainSectionHeight] = useState(0);
  const [filterHeight, setFilterHeight] = useState(0);
  const [filterHeaderTouchable, setFilterHeaderTouchable] = useState(false);

  const filterHeaderThreshold = useMemo(() => {
    if (!mainSectionHeight) return 100000; // wait until measured
    // 상단 고정 헤더 높이 보정
    // console.log(insets.top);
    const overlayOffset = Platform.OS === 'ios' ? insets.top + 30 : top + 40;
    // 메인 이미지가 없는 경우 목록 헤더가 너무 빨리 붙는 것을 방지하기 위해 추가 지연 적용
    // iOS는 상단 여백이 더 크므로 약간 더 크게 지연

    // 조금 더 늦게 붙도록 지연값을 소폭 상향
    const hasImage = !!(storedata?.imgUrlList && storedata.imgUrlList.length);
    const extraDelay = hasImage ? 0 : Platform.OS === 'ios' ? 0 : insets.top;
    return Math.max(0, mainSectionHeight - overlayOffset + extraDelay);
  }, [mainSectionHeight, insets.top, top, storedata?.imgUrlList]);

  const stickyTranslateY = 0;

  const filterHeaderProgress = scrollY.interpolate({
    inputRange: [filterHeaderThreshold, filterHeaderThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const listFilterOpacity = Animated.subtract(1, filterHeaderProgress);

  const [selectedType, setSelectedType] = useState(null);
  const isClickedRef = useRef(false);

  // Control sticky filter header touchability without using __getValue()
  useEffect(() => {
    const hysteresis = 1; // px
    const sub = scrollY.addListener(({value}) => {
      const active = value >= filterHeaderThreshold + hysteresis;
      setFilterHeaderTouchable(prev => (prev !== active ? active : prev));
    });
    return () => scrollY.removeListener(sub);
  }, [filterHeaderThreshold]);

  // const handleOrderButtonPress = () => {
  //   setShowOrderForm(true);
  // };

  // const handleOrderCancel = () => {
  //   Keyboard.dismiss();
  //   setShowOrderForm(false);
  // };

  // const handleOrderBarLayout = useCallback(({nativeEvent}) => {
  //   const {height} = nativeEvent.layout;
  //   setOrderBarHeight(prev => (Math.abs(prev - height) > 2 ? height : prev));
  // }, []);

  useEffect(() => {
    if (!isOrderEnabled) {
      setOrderBarHeight(0);
    }
  }, [isOrderEnabled]);

  const orderBarOffset = isOrderEnabled
    ? Math.max(0, orderBarHeight - insets.bottom)
    : 0;
  const scrollButtonBottomValue = scrollButtonBottom + orderBarOffset;

  const handleOrderSubmit = ({visitTime, peopleCount}) => {
    Keyboard.dismiss();
    setShowOrderForm(false);
    navigation.navigate('StoreOrderScreen', {
      storeId,
      storeName: storedata?.name ?? '',
      initialMenus: menus ?? [],
      initialAlcohols: alcohols ?? [],
      mainDrinkDtos: storedata?.mainDrinkDtos ?? [],
      visitTime,
      peopleCount,
    });
  };

  if (!storeId) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>가게 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      {loading && skeletonLoading ? (
        <StoreMainSkeleton />
      ) : (
        <>
          <View
            style={{
              backgroundColor: 'white',
              flex: 1,
              ...(!storedata?.imgUrlList?.length > 0 && {
                paddingTop: top,
                paddingBottom: bottom,
              }),
            }}>
            {storedata?.imgUrlList && (
              <StoreHeader
                navigation={navigation}
                headerBackgroundColor={headerBackgroundColor}
                iconColor={iconColor}
                titleOpacity={titleOpacity}
                title={storedata?.name}
                onShare={onShare}
                isLiked={isStoreLiked}
                onToggleLike={handleToggleLike}
                likeDisabled={isLikeProcessing}
              />
            )}
            {(!storedata?.imgUrlList || storedata.imgUrlList.length === 0) && (
              <NonImageHeader
                navigation={navigation}
                headerBackgroundColor={'#fff'}
                iconColor={'#333'}
                title={storedata?.name}
                onShare={onShare}
                isLiked={isStoreLiked}
                onToggleLike={handleToggleLike}
                likeDisabled={isLikeProcessing}
              />
            )}
            {currentPage === 'StoreAlcoholScreen' && (
              <Animated.View
                pointerEvents={filterHeaderTouchable ? 'auto' : 'none'}
                style={[
                  styles.fixedFilterHeader,
                  {
                    top: Platform.OS === 'ios' ? insets.top + 30 : top + 40,
                    opacity: filterHeaderProgress,
                    transform: [{translateY: stickyTranslateY}],
                  },
                ]}>
                <Alcoholcategorytab
                  alcohols={alcohols}
                  mainDrinks={storedata.mainDrinkDtos}
                  imagelist={storedata?.imgUrlList?.length}
                  onScrollTo={scrollToHandler}
                  sectionPositions={sectionPositions}
                  setSectionPositions={setSectionPositions}
                  scrollY={scrollY}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  isClickedRef={isClickedRef}
                  filterHeight={filterHeight}
                  mainSectionHeight={mainSectionHeight}
                />
              </Animated.View>
            )}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <Animated.ScrollView
                onScroll={Animated.event(
                  [{nativeEvent: {contentOffset: {y: scrollY}}}],
                  {
                    useNativeDriver: false,
                    listener: event => {
                      const offsetY = event?.nativeEvent?.contentOffset?.y ?? 0;
                      updateVisibility(offsetY);
                    },
                  },
                )}
                onScrollEndDrag={() => {
                  if (isClickedRef.current) {
                    setTimeout(() => {
                      isClickedRef.current = false;
                    }, 200);
                  }
                }}
                onMomentumScrollEnd={() => {
                  if (isClickedRef.current) {
                    setTimeout(() => {
                      isClickedRef.current = false;
                    }, 200);
                  }
                }}
                scrollEventThrottle={16}
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                style={{
                  backgroundColor: 'white',
                  width: '100%',
                  paddingBottom: isOrderEnabled ? 60 : 100,
                }}
                keyboardShouldPersistTaps="always"
                scrollEnabled={true}
                contentContainerStyle={{flexGrow: 1}}>
                <View
                  style={{
                    paddingTop:
                      !storedata?.imgUrlList?.length > 0
                        ? Platform.OS === 'ios'
                          ? 80
                          : 30
                        : undefined,
                  }}
                  onLayout={e => {
                    const {height} = e.nativeEvent.layout;
                    setMainSectionHeight(height);
                  }}>
                  {storedata?.imgUrlList?.length > 0 && (
                    <View
                      style={[
                        {
                          height: 270, // 숫자 값은 따옴표 없이 사용
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'black',
                        },
                      ]}>
                      <ImageSlider
                        storeId={storeId}
                        images={imageSliderData}
                        interval={4000}
                        navigation={navigation}
                        onToggleLike={handleToggleLike}
                        isLiked={isStoreLiked}
                        likeCount={storeLikeCount}
                        likeDisabled={isLikeProcessing}
                      />
                    </View>
                  )}

                  <StoreMainInfo
                    storedata={storedata}
                    navigation={navigation}
                    storeTimeEditHandle={storeTimeEditHandle}
                    setLoading={setLoading}
                    loading={loading}
                    startUpdate={startUpdate}
                    handleReport={handleReport}
                    handleReportList={handleReportList}
                    handleStoreInfo={handleStoreInfo}
                    onToggleLike={handleToggleLike}
                    isLiked={isStoreLiked}
                    likeCount={storeLikeCount}
                    likeDisabled={isLikeProcessing}
                  />
                  <View style={{backgroundColor: '#F2F2F2', height: 10}} />

                  <StoreTabs
                    changePage={setCurrentPage}
                    currentPage={currentPage}
                  />

                  <StoreInfoImage
                    storeId={storeId}
                    imageList={storedata?.boardImageDtoList}
                    navigation={navigation}
                  />
                </View>

                {currentPage === 'StoreAlcoholScreen' && (
                  <Animated.View
                    style={{opacity: listFilterOpacity}}
                    onLayout={e => {
                      const {height} = e.nativeEvent.layout;
                      setFilterHeight(height);
                    }}>
                    <Alcoholcategorytab
                      alcohols={alcohols}
                      mainDrinks={storedata.mainDrinkDtos}
                      imagelist={storedata?.imgUrlList?.length}
                      onScrollTo={scrollToHandler}
                      sectionPositions={sectionPositions}
                      setSectionPositions={setSectionPositions}
                      scrollY={scrollY}
                      selectedType={selectedType}
                      setSelectedType={setSelectedType}
                      isClickedRef={isClickedRef}
                      filterHeight={filterHeight}
                      mainSectionHeight={mainSectionHeight}
                    />
                  </Animated.View>
                )}

                <>
                  {currentPage === 'StoreMenuScreen' && (
                    <StoreMenuScreen
                      navigation={navigation}
                      storeId={storeId}
                      menus={menus}
                      isOrderEnabled={isOrderEnabled}
                    />
                  )}
                  {currentPage === 'StoreAlcoholScreen' && (
                    <StoreAlcoholScreen
                      navigation={navigation}
                      storeId={storeId}
                      alcohols={alcohols}
                      mainDrinks={storedata.mainDrinkDtos}
                      // scrollViewRef={scrollViewRef}
                      // isUpdatable={storedata?.isUpdatable}
                      // onAlcoholUpdateComplete={refresAlcohols}
                      // imagelist={storedata?.imgUrlList?.length}
                      // onScrollTo={scrollToHandler}
                      sectionPositions={sectionPositions}
                      setSectionPositions={setSectionPositions}
                      isOrderEnabled={isOrderEnabled}
                    />
                  )}
                </>
              </Animated.ScrollView>
            </KeyboardAvoidingView>
            <ScrollToTopButton
              visible={showScrollToTop}
              bottom={scrollButtonBottomValue}
              onPress={scrollToTop}
            />
          </View>
        </>
      )}
      {/* {isOrderEnabled && (
        <>
          <View
            style={[
              styles.storeOrderview,
              {
                paddingBottom:
                  Platform.OS === 'android'
                    ? insets.bottom + 20
                    : insets.bottom + 10,
              },
            ]}
            onLayout={handleOrderBarLayout}>
            <Pressable
              style={styles.storeOrderButton}
              onPress={handleOrderButtonPress}>
              <Text style={styles.storeOrderText}>실시간 주문하기</Text>
            </Pressable>
          </View>
          {showOrderForm && (
            <SafeAreaView>
              <Modal
                animationType="fade"
                transparent
                visible={showOrderForm}
                statusBarTranslucent={true}
                onRequestClose={handleOrderCancel}>
                <View style={styles.orderModalContainer}>
                  <Pressable
                    style={styles.orderModalOverlay}
                    onPress={handleOrderCancel}
                  />
                  <Animated.View
                    style={[
                      styles.orderModalContent,
                      {
                        paddingBottom:
                          Platform.OS === 'android'
                            ? insets.bottom + 20
                            : insets.bottom + 10,
                      },
                      {transform: [{translateY: orderSlideAnim}]},
                    ]}>
                    <View style={styles.orderModalHeader}>
                      <Text style={styles.orderModalTitle}>
                        실시간 주문하기
                      </Text>
                      <TouchableOpacity onPress={handleOrderCancel}>
                        <Ionicons name="close" size={22} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <OrderForm
                      operationInfoDtos={storedata?.operationInfoDtos}
                      isAlwaysOpen={storedata?.isAlwaysOpen}
                      onCancel={handleOrderCancel}
                      onSubmit={handleOrderSubmit}
                    />
                  </Animated.View>
                </View>
              </Modal>
            </SafeAreaView>
          )}
        </>
      )} */}

      <Loading loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(194, 194, 194, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
  endUpdateButton: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,

    paddingTop: 10,
  },
  storeAddButtonsearch: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3CBBFF',
    borderRadius: 10,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  endUpdateText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },

  fixedFilterHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  nonimgstickyActive: {
    paddingTop: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  reorderButton: {
    marginHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#E9F5FB',
  },
  alcoholAddButtonText: {
    color: '#3CBBFF',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    padding: 16,
  },
  orderModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  orderModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 1,
  },
  orderModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 2,
  },
  orderModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 16,
  },
  orderModalTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#121212',
  },
  storeOrderview: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 10,
  },
  storeOrderButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3CBBFF',
    borderRadius: 9,
    width: '100%',
    height: 50,
  },
  storeOrderText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
});

export default StoreMainScreen;
