import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  View,
  Animated,
  Text,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import ImageSlider from '../../components/StoreScreen/ImageSlider';
import {ScrollView} from 'react-native-gesture-handler';
import StoreMainInfo from '../../components/StoreScreen/StoreMainInfo';
import StoreTabs from '../../components/StoreScreen/StoreTabs';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {
  StoreMainget,
  UpdateStore,
  DeleteStoreImage,
  UpdateStoreImage,
} from '../../api/storeApi';

import Feather from 'react-native-vector-icons/Feather';
import StoreMenuScreen from './StoreMenuScreen';
import StoreAlcoholScreen from './StoreAlcoholScreen';
import StoreHeader from '../../components/StoreScreen/StoreHeader';
import {StoreMenuget} from '../../api/menuApi';
import {StoreDrinkget} from '../../api/drinkApi';
import StoreModal from '../../components/StoreScreen/StoreModal';
import UpdateHeader from '../../components/StoreScreen/UpdateHeader';
import BottomSheet from '@gorhom/bottom-sheet';
import UpdateBottomSheet from '../../components/StoreScreen/UpdateBottomSheet';
import useCustomAlert from '../../hooks/useCustomAlert';
import forbiddenWords from '../../hooks/forbiddenWords';
import {useToast} from '../../context/ToastContext';
import {useAuth} from '../../context/AuthContext';
import Loading from '../../hooks/Loading';
import NonImageHeader from '../../components/StoreScreen/NonImageHeader';

const {width} = Dimensions.get('window');

const StoreMainScreen = ({navigation}) => {
  const {token} = useAuth();
  const route = useRoute();
  const {showAlert, AlertComponent} = useCustomAlert();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '70%', '85%'], []);
  const {storeId, innerlatitude, innerlongitude} = route.params;
  const [menus, setMenus] = useState([]);
  const [alcohols, setAlcohols] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [storedata, setStoredata] = useState('');
  const [scrollY] = useState(new Animated.Value(0));
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

  const onPressModalClose = () => {
    setIsModalVisible(false);
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

  return (
    <>
      <View style={{backgroundColor: 'white', flex: 1}}>
        {!isUpdate && storedata?.imgUrlList && (
          <StoreHeader
            navigation={navigation}
            headerBackgroundColor={headerBackgroundColor}
            iconColor={iconColor}
            titleOpacity={titleOpacity}
            title={storedata.name}
            isOwner={storedata?.isOwner}
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
              title={storedata.name}
              isOwner={storedata.isOwner}
            />
          )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: scrollY}}}],
              {useNativeDriver: false},
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
            <TouchableWithoutFeedback onPress={handleBottomClose}>
              <View>
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
                      images={imageSliderData}
                      interval={4000}
                      isUpdate={isUpdate}
                      handleBottomOpen={handleBottomOpen}
                      onEditKey={handleEditKey}
                      onEditValue={handleEditValue}
                    />
                  </View>
                )}
                {!storedata?.imgUrlList?.length > 0 &&
                  !isUpdate &&
                  storedata?.isUpdatable === true && (
                    <Pressable
                      style={styles.addImageButton}
                      onPress={startUpdate}>
                      <Text style={styles.addImageText}>
                        매장 이미지 추가하기
                      </Text>
                      <Feather name="chevron-right" size={23} color="#999" />
                    </Pressable>
                  )}

                <StoreMainInfo
                  storedata={storedata}
                  onModalOpen={() => setIsModalVisible(true)}
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
                  <View>
                    {currentPage === 'StoreMenuScreen' && (
                      <StoreMenuScreen
                        navigation={navigation}
                        storeId={storeId}
                        menus={menus}
                        onMenuDelete={handleMenuDelete}
                        isUpdatable={!storedata?.isUpdatable}
                        onMenuUpdateComplete={refreshMenus}
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
                        isUpdatable={!storedata?.isUpdatable}
                        onAlcoholUpdateComplete={refresAlcohols}
                      />
                    )}
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
        <StoreModal
          isModalVisible={isModalVisible}
          onPressModalClose={onPressModalClose}
          storeId={storeId}
          navigation={navigation}
          startUpdate={startUpdate}
          handleReport={handleReport}
          handleReportList={handleReportList}
          isUpdatable={!storedata?.isUpdatable}
        />
      </View>
      {isUpdate && (
        <View style={styles.endUpdateButton}>
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
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
    fontWeight: '600',
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
    fontWeight: '600',
  },
});

export default StoreMainScreen;
