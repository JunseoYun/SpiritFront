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
  const {showToast} = useToast();

  const [sectionPositions, setSectionPositions] = useState({});

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
    if (!token) return;
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
    }
  };

  const fetchInitialStoreData = async () => {
    if (!token) return;
    try {
      setLoading(true);

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

  const stickyThreshold = useMemo(() => {
    if (!storedata?.imgUrlList || storedata.imgUrlList.length === 0) {
      return mainSectionHeight;
    }
    if (storedata?.imgUrlList) {
      return mainSectionHeight - filterHeight;
    }
    // 원하는 offset 추가 가능
  }, [mainSectionHeight, filterHeight]);

  const stickyTranslateY = scrollY.interpolate({
    inputRange: [stickyThreshold - 80, stickyThreshold],
    outputRange: [-80, 0], // 위에서 부드럽게 내려옴
    extrapolate: 'clamp',
  });

  const stickyOpacity = scrollY.interpolate({
    inputRange: [stickyThreshold - 80, stickyThreshold],
    outputRange: [0, 1], // 점점 나타남
    extrapolate: 'clamp',
  });

  const [selectedType, setSelectedType] = useState(null);
  const isClickedRef = useRef(false);
  return (
    <>
      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
          ...(!storedata?.imgUrlList?.length > 0 &&
          !isUpdate &&
          storedata?.isUpdatable === true
            ? {paddingTop: top, paddingBottom: bottom}
            : {}),
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
            style={[
              styles.fixedFilterHeader,
              {
                top: Platform.OS === 'ios' ? insets.top + 30 : top + 40,
                opacity: Animated.multiply(
                  stickyOpacity,
                  stickyProgress ? 1 : 0,
                ),
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
              paddingTop:
                !storedata?.imgUrlList?.length > 0
                  ? Platform.OS === 'ios'
                    ? 80
                    : 30
                  : undefined,
            }}
            keyboardShouldPersistTaps="always"
            scrollEnabled={true}
            contentContainerStyle={{flexGrow: 1}}>
            <View
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
                    isUpdate && {marginTop: Platform.OS === 'ios' ? 100 : 60}, // 조건부 스타일
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
                <View style={{backgroundColor: '#F2F2F2', height: 20}} />
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
            </View>

            {!isUpdate && currentPage === 'StoreAlcoholScreen' && (
              <View
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
                />
              </View>
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
      </View>
      {isUpdate && (
        <View
          style={[
            styles.endUpdateButton,
            {paddingBottom: Platform.OS === 'ios' ? 30 : 10 + bottom},
          ]}>
          <Pressable onPress={endUpdate} style={styles.storeAddButtonsearch}>
            <Text style={styles.endUpdateText}>완료</Text>
          </Pressable>
        </View>
      )}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
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
          updatedKey={updatedKey}
          updatedValue={updatedValue}
          setUpdatedValue={setUpdatedValue}
          setUpdatedImgValue={setUpdatedImgValue}
          handleUpdate={handleUpdate}
          handleBottomClose={handleBottomClose}
          navigation={navigation}
        />
      </BottomSheet>
      <AlertComponent />

      <Loading loading={loading} />
    </>
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
  },
  nonimgstickyActive: {
    paddingTop: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});

export default StoreMainScreen;
