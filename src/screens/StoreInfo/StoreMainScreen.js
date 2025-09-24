import React, {useEffect, useState, useRef, useMemo} from 'react';
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
} from 'react-native';
import ImageSlider from '../../components/StoreScreen/StoreImage/ImageSlider';
import StoreMainInfo from '../../components/StoreScreen/StoreMainInfo';
import StoreTabs from '../../components/StoreScreen/StoreTabs';
import StorePriceImage from '../../components/StoreScreen/StorePriceImage';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {
  StoreMainget,
  UpdateStore,
  DeleteStoreImage,
  UpdateStoreImage,
  get_store_share,
} from '../../api/storeApi';

import Feather from 'react-native-vector-icons/Feather';
import StoreMenuScreen from './StoreMenuScreen';
import StoreAlcoholScreen from './StoreAlcoholScreen';
import StoreHeader from '../../components/StoreScreen/StoreHeader';
import {StoreMenuget} from '../../api/menuApi';
import {StoreDrinkget} from '../../api/drinkApi';
import UpdateHeader from '../../components/StoreScreen/UpdateHeader';
import BottomSheet from '@gorhom/bottom-sheet';
import UpdateBottomSheet from '../../components/StoreScreen/UpdateBottomSheet';
import useCustomAlert from '../../hooks/useCustomAlert';
import forbiddenWords from '../../hooks/forbiddenWords';
import {useToast} from '../../context/ToastContext';
import {useAuth} from '../../context/AuthContext';
import Loading from '../../hooks/Loading';
import NonImageHeader from '../../components/StoreScreen/NonImageHeader';
import Alcoholcategorytab from '../../components/StoreAlcoholScreen/Alcoholcategorytab';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import StoreMainSkeleton from './StoreMainSkeleton';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import useScrollToTopVisibility from '../../hooks/useScrollToTopVisibility';

const StoreMainScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {top, bottom} = useSafeAndroidInsets();
  const {token} = useAuth();
  const route = useRoute();
  const {showAlert, AlertComponent} = useCustomAlert();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '70%', '85%'], []);
  const {storeId, innerlatitude, innerlongitude} = route.params;

  const [menus, setMenus] = useState([]);
  const [alcohols, setAlcohols] = useState([]);
  const [storedata, setStoredata] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [currentPage, setCurrentPage] = useState('StoreMenuScreen');
  const [isUpdate, setIsUpdate] = useState(false);
  const [updatedKey, setUpdatedKey] = useState(null);
  const [updatedValue, setUpdatedValue] = useState(null);
  const [updatedImgValue, setUpdatedImgValue] = useState([]);
  const scrollViewRef = useRef(null); // ScrollView 참조 추가
  const [loading, setLoading] = useState(true);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const {showToast} = useToast();
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1);
  const [sectionPositions, setSectionPositions] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const {visible: showScrollToTop, scrollToTop, updateVisibility} =
    useScrollToTopVisibility({externalRef: scrollViewRef});
  const scrollButtonBottom = (bottom || 16) + 24 + 36;
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

  const refreshMenus = async () => {
    try {
      const Menus = await StoreMenuget(storeId);
      setMenus(Menus);
    } catch (error) {
      console.error('메뉴 다시 불러오기 실패', error);
    }
  };

  const refresAlcohols = async () => {
    try {
      const Drinks = await StoreDrinkget(storeId);
      setAlcohols(Drinks);
    } catch (error) {
      console.error('메뉴 다시 불러오기 실패', error);
    }
  };

  const storeupdatedrink = () => {
    navigation.navigate('UpdateStoreDrink', {
      storeId: storedata.id,
      mainDrinkDtos: storedata.mainDrinkDtos,
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
        fetchStoreDataOnly();
      }
    });

    return unsubscribe;
  }, [navigation]);

  const fetchStoreDataOnly = async () => {
    setLoading(true);
    try {
      const storeData = await StoreMainget(storeId);

      setStoredata(storeData);
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
    setIsUpdate(true);
  };
  const endUpdate = () => {
    setIsUpdate(false);
    handleBottomClose();
  };

  const handleBottomOpen = () => {
    bottomSheetRef.current?.expand();
  };

  const handleBottomClose = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      bottomSheetRef.current?.close();
    }, 300);
  };

  const handleEditKey = key => {
    setUpdatedKey(key);
  };

  const handleEditValue = value => {
    setUpdatedValue(value);
  };

  const handleUpdate = async () => {
    const containsForbiddenWord = value =>
      typeof value === 'string' &&
      forbiddenWords.some(word => value.includes(word));

    const showErrorAndExit = message => {
      showAlert({
        title: '가이드 위반',
        message,
      });
      return;
    };

    const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    if (isEqual(storedata[updatedKey], updatedValue)) {
      handleBottomClose();
      return;
    }

    if (containsForbiddenWord(updatedValue)) {
      showErrorAndExit(
        '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
      );
      return;
    }

    if (
      updatedKey === 'locationDto' &&
      containsForbiddenWord(updatedValue?.addressDetail)
    ) {
      showErrorAndExit(
        '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
      );
      return;
    }

    const performUpdate = async (key, value) => {
      try {
        Keyboard.dismiss();
        setLoading(true);
        if (key === 'images') {
          const {addedImages, deletedImages} = value;
          try {
            if (addedImages.length === 0 && deletedImages.length > 0) {
              const response = await DeleteStoreImage(storeId, deletedImages);
              await UpdateStore(storeId, {['mainImgUrl']: response[0]});
            }
            if (addedImages.length > 0 && deletedImages.length === 0) {
              const response = await UpdateStoreImage(storeId, addedImages);
              await UpdateStore(storeId, {['mainImgUrl']: response[0]});
            }
            if (addedImages.length > 0 && deletedImages.length > 0) {
              await UpdateStoreImage(storeId, addedImages);
              const response = await DeleteStoreImage(storeId, deletedImages);
              await UpdateStore(storeId, {['mainImgUrl']: response[0]});
            }
          } catch (error) {
            console.log(error);
          }
        } else {
          await UpdateStore(storeId, {[key]: value});
        }

        await fetchStoreDataOnly();
      } catch (error) {
        handleError();
      } finally {
        setLoading(false);
      }
    };

    switch (updatedKey) {
      case 'description':
        await performUpdate(updatedKey, removeLineBreaks(updatedValue));
        break;
      case 'locationDto':
        await performUpdate(updatedKey, updatedValue);
        break;
      case 'images':
        await performUpdate(updatedKey, updatedImgValue);
        break;

      default:
        await performUpdate(updatedKey, updatedValue);
        break;
    }

    handleBottomClose();
  };

  const handleError = () => {
    showAlert({
      title: '잘못된 요청입니다.',
      message: '잠시 후 다시 시도해주세요.',
    });
  };

  const removeLineBreaks = value => {
    if (typeof value === 'string') {
      return value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .join('\n');
    }
    return value;
  };

  useEffect(() => {
    if (!token) return;
    if (isUpdate) {
      showToast('원하는 항목을 클릭해 수정하세요!', 'center');
    }
  }, [isUpdate]);

  // 뒤로가기(스와이프 포함) 시 편집 종료로 대체
  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', e => {
      if (!isUpdate) return; // 편집 중이 아니면 기본 동작
      e.preventDefault(); // 뒤로가기 취소
      endUpdate(); // 편집 종료 및 바텀시트 닫기
    });
    return sub;
  }, [navigation, isUpdate]);

  // iOS 제스처 자체를 편집 중에는 비활성화해 '밀고 돌아가기' 애니메이션 방지
  // 중첩 네비게이터(자신/부모/상위부모)까지 순차적으로 적용
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    try {
      navigation.setOptions({gestureEnabled: !isUpdate});
      const parent = navigation.getParent?.();
      parent?.setOptions?.({gestureEnabled: !isUpdate});
      const grand = parent?.getParent?.();
      grand?.setOptions?.({gestureEnabled: !isUpdate});
    } catch (e) {
      // no-op
    }
  }, [navigation, isUpdate]);

  const handleMenuDelete = id => {
    setMenus(prevMenus => prevMenus.filter(menu => menu.id !== id));
  };

  const handleAlcoholDelete = id => {
    setAlcohols(prevAlcohols =>
      prevAlcohols.filter(alcohol => alcohol.id !== id),
    );
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

  const stickyProgress = scrollY.interpolate({
    inputRange: [250, 251], // 250 이후는 1, 그 전은 0
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
              ...(!storedata?.imgUrlList?.length > 0 &&
                !isUpdate && {paddingTop: top, paddingBottom: bottom}),
            }}>
            {!isUpdate && storedata?.imgUrlList && (
              <StoreHeader
                navigation={navigation}
                headerBackgroundColor={headerBackgroundColor}
                iconColor={iconColor}
                titleOpacity={titleOpacity}
                title={storedata?.name}
                onShare={onShare}
              />
            )}
            {isUpdate && (
              <UpdateHeader
                navigation={navigation}
                endUpdate={endUpdate}
                handleBottomClose={handleBottomClose}
              />
            )}
            {(!storedata?.imgUrlList || storedata.imgUrlList.length === 0) &&
              !isUpdate && (
                <NonImageHeader
                  navigation={navigation}
                  headerBackgroundColor={'#fff'}
                  iconColor={'#333'}
                  title={storedata?.name}
                  onShare={onShare}
                />
              )}
            {!isUpdate && currentPage === 'StoreAlcoholScreen' && (
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
                      if (isClickedRef.current) {
                        setTimeout(() => {
                          isClickedRef.current = false;
                        }, 200);
                      }
                    },
                  },
                )}
                scrollEventThrottle={16}
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                style={{
                  backgroundColor: 'white',
                  width: '100%',
                  paddingBottom: 100,
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
                  {(storedata?.imgUrlList?.length > 0 || isUpdate) && (
                    <View
                      style={[
                        {
                          height: 270, // 숫자 값은 따옴표 없이 사용
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'black',
                        },
                        isUpdate && {
                          marginTop: Platform.OS === 'ios' ? 100 : 60,
                        }, // 조건부 스타일
                        isUpdate &&
                          !storedata?.imgUrlList?.length > 0 && {
                            marginTop: Platform.OS === 'ios' ? 20 : 30,
                          },
                      ]}>
                      <ImageSlider
                        storeId={storeId}
                        images={imageSliderData}
                        interval={4000}
                        isUpdate={isUpdate}
                        handleBottomOpen={handleBottomOpen}
                        onEditKey={handleEditKey}
                        onEditValue={handleEditValue}
                        navigation={navigation}
                      />
                    </View>
                  )}
                  {!storedata?.imgUrlList?.length > 0 &&
                    !isUpdate &&
                    storedata?.isUpdatable === true && (
                      <Pressable
                        style={[styles.addImageButton, {}]}
                        onPress={startUpdate}>
                        <Text style={styles.addImageText}>
                          매장 이미지 추가하기
                        </Text>
                        <Feather name="chevron-right" size={23} color="#999" />
                      </Pressable>
                    )}

                  <StoreMainInfo
                    storedata={storedata}
                    navigation={navigation}
                    isUpdate={isUpdate}
                    endUpdate={endUpdate}
                    handleBottomOpen={handleBottomOpen}
                    onEditKey={handleEditKey}
                    onEditValue={handleEditValue}
                    storeTimeEditHandle={storeTimeEditHandle}
                    storeupdatedrink={storeupdatedrink}
                    setLoading={setLoading}
                    loading={loading}
                    startUpdate={startUpdate}
                    handleReport={handleReport}
                    handleReportList={handleReportList}
                    handleStoreInfo={handleStoreInfo}
                  />
                  {!isUpdate && (
                    <View style={{backgroundColor: '#F2F2F2', height: 10}} />
                  )}

                  {!isUpdate && (
                    <StoreTabs
                      changePage={setCurrentPage}
                      currentPage={currentPage}
                    />
                  )}

                  {!isUpdate && (
                    <StorePriceImage
                      storeId={storeId}
                      isUpdatable={storedata?.isUpdatable}
                      imageList={storedata?.boardImageDtoList}
                      navigation={navigation}
                    />
                  )}
                  {!isUpdate &&
                    storedata?.isUpdatable &&
                    currentPage === 'StoreAlcoholScreen' && (
                      <>
                        <Pressable
                          style={styles.reorderButton}
                          onPress={() => setModalVisible(true)}>
                          <Text style={styles.alcoholAddButtonText}>
                            주류 편집
                          </Text>
                        </Pressable>
                      </>
                    )}
                </View>

                {!isUpdate && currentPage === 'StoreAlcoholScreen' && (
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
                      scrollY={scrollY}
                      selectedType={selectedType}
                      setSelectedType={setSelectedType}
                      isClickedRef={isClickedRef}
                      filterHeight={filterHeight}
                      mainSectionHeight={mainSectionHeight}
                    />
                  </Animated.View>
                )}

                {!isUpdate && (
                  <>
                    {currentPage === 'StoreMenuScreen' && (
                      <StoreMenuScreen
                        navigation={navigation}
                        storeId={storeId}
                        menus={menus}
                        onMenuDelete={handleMenuDelete}
                        isUpdatable={storedata?.isUpdatable}
                        onMenuUpdateComplete={refreshMenus}
                        images={imageSliderData}
                      />
                    )}
                    {currentPage === 'StoreAlcoholScreen' && (
                      <StoreAlcoholScreen
                        navigation={navigation}
                        storeId={storeId}
                        alcohols={alcohols}
                        mainDrinks={storedata.mainDrinkDtos}
                        scrollViewRef={scrollViewRef}
                        onAlcoholDelete={handleAlcoholDelete}
                        isUpdatable={storedata?.isUpdatable}
                        onAlcoholUpdateComplete={refresAlcohols}
                        imagelist={storedata?.imgUrlList?.length}
                        onScrollTo={scrollToHandler}
                        sectionPositions={sectionPositions}
                        setSectionPositions={setSectionPositions}
                      />
                    )}
                  </>
                )}
              </Animated.ScrollView>
            </KeyboardAvoidingView>
            <ScrollToTopButton
              visible={!isUpdate && showScrollToTop}
              bottom={scrollButtonBottom}
              onPress={scrollToTop}
            />
            <Modal
              transparent
              visible={isModalVisible}
              animationType="fade"
              statusBarTranslucent={true}>
              <Pressable
                style={styles.overlay}
                onPress={() => setModalVisible(false)}>
                <View style={styles.modal}>
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      navigation.navigate('AlcoholEditScreen', {
                        storeId,
                        alcohols,
                        onAlcoholUpdateComplete: refresAlcohols,
                        onAlcoholDelete: handleAlcoholDelete,
                      });
                      setModalVisible(false);
                    }}>
                    <Text style={styles.optionText}>주류 수정/삭제</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      navigation.navigate('AlcoholAddScreen', {storeId});
                      setModalVisible(false);
                    }}>
                    <Text style={styles.optionText}>새 주류 추가</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>
          </View>
          {isUpdate && (
            <View
              style={[
                styles.endUpdateButton,
                {paddingBottom: Platform.OS === 'ios' ? 30 : 10 + bottom},
              ]}>
              <Pressable
                onPress={endUpdate}
                style={styles.storeAddButtonsearch}>
                <Text style={styles.endUpdateText}>완료</Text>
              </Pressable>
            </View>
          )}
          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            onChange={index => setBottomSheetIndex(index)}
            enablePanDownToClose={true}
            gestureEnabled={true}
            keyboardShouldPersistTaps="handled"
            keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : 'extend'}
            keyboardBlurBehavior="restore"
            backgroundStyle={{
              backgroundColor: '#F7F7F7',
              borderTopLeftRadius: 35,
              borderTopRightRadius: 35,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: -3},
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 10,
            }}>
            <UpdateBottomSheet
              isUpdate={isUpdate}
              updatedKey={updatedKey}
              updatedValue={updatedValue}
              setUpdatedValue={setUpdatedValue}
              setUpdatedImgValue={setUpdatedImgValue}
              handleUpdate={handleUpdate}
              handleBottomClose={handleBottomClose}
              navigation={navigation}
              endUpdate={endUpdate}
              bottomSheetIndex={bottomSheetIndex}
            />
          </BottomSheet>
          <AlertComponent />
        </>
      )}

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
    backgroundColor: '#45C9FF',
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
  addImageButton: {
    marginTop: 20,
    marginHorizontal: 18,
    paddingTop: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addImageText: {
    color: '#999',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
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
    color: '#45C9FF',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    padding: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: 260,
  },
  option: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});

export default StoreMainScreen;
