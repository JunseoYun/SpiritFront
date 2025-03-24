import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  View,
  Animated,
  Text,
  Platform,
  TouchableWithoutFeedback,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
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

const StoreMainScreen = ({navigation}) => {
  const route = useRoute();
  const {showAlert, AlertComponent} = useCustomAlert();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%', '80%'], []);
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

  const storeTimeEditHandle = () => {
    navigation.navigate('StoreAddTimeSetScreen', {
      //   // operatingHours,
      //   // breakingHours,
      //   // setOperatingHours,
      //   // setBreakingHours,
      //   // closedDay,
      //   // setClosedDay,
      //   // is24Hours,
      //   // setIs24Hours,
      //   // isSameEveryTime,
      //   // setIsSameEveryTime,
      //   // hasBreaking,
      // setHasBreaking,
    });

    // navigation.navigate('MainStack', {
    //   screen: 'StoreAddTimeSetScreen',
    //   params: {
    //     // storeId: store.id,
    //   },
    // });
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
    bottomSheetRef.current?.close();
    setTimeout(() => {
      setUpdatedKey(null);
      setUpdatedValue(null);
    }, 500);
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
        if (key === 'images') {
          const {addedImages, deletedImages, hasmainImg} = value;
          try {
            //매장 추가만 되었을때
            if (
              addedImages.length > 0 &&
              deletedImages.length === 0 &&
              hasmainImg === false
            ) {
              await UpdateStoreImage(storeId, addedImages);
            }
            //삭제만 되었을때
            if (
              addedImages.length === 0 &&
              deletedImages.length > 0 &&
              hasmainImg === false
            ) {
              await DeleteStoreImage(storeId, deletedImages);
            }
            //매장 추가 및 메인 이미지 추가
            if (
              addedImages.length > 0 &&
              deletedImages.length === 0 &&
              hasmainImg === true
            ) {
              const response = await UpdateStoreImage(storeId, addedImages);
              await UpdateStore(storeId, {['mainImgUrl']: response[0]});
            }
            //매장 삭제 및 메인 이미지 추가
            if (
              addedImages.length === 0 &&
              deletedImages.length > 0 &&
              hasmainImg === true
            ) {
              const response = await DeleteStoreImage(storeId, deletedImages);
              await UpdateStore(storeId, {['mainImgUrl']: response[0]});
            }
            //추가 삭제만 되었을때
            if (
              addedImages.length > 0 &&
              deletedImages.length > 0 &&
              hasmainImg === false
            ) {
              await UpdateStoreImage(storeId, addedImages);
              await DeleteStoreImage(storeId, deletedImages);
            }
            //셋다 되었을때
            if (
              addedImages.length > 0 &&
              deletedImages.length > 0 &&
              hasmainImg === true
            ) {
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
        const storeData = await StoreMainget(storeId);
        setStoredata(storeData);
        setLongitude(storeData.locationDto.longitude);
        setLatitude(storeData.locationDto.latitude);
      } catch (error) {
        handleError();
      }
    };

    switch (updatedKey) {
      case 'operatingTime':
      case 'breakingTime':
        await performUpdate('businessHoursDto', updatedValue);
        break;
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
    const getStoreData = async () => {
      try {
        const storeData = await StoreMainget(storeId);
        setStoredata(storeData);
        setLongitude(storeData.locationDto.longitude);
        setLatitude(storeData.locationDto.latitude);
        if (storeData.isDeleted) {
          showToast('삭제된 가게입니다.'); // 🔥 토스트 메시지 띄우기
          setTimeout(() => navigation.goBack(), 100); // 1초 후 뒤로 가기
        }
        const Menus = await StoreMenuget(storeId);
        setMenus(Menus);
        const Drinks = await StoreDrinkget(storeId);
        setAlcohols(Drinks);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    getStoreData();
  }, []);

  useEffect(() => {
    if (isUpdate) {
      showToast('원하는 항목을 클릭해 수정하세요!');
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
  return (
    <>
      {!isUpdate && (
        <StoreHeader
          navigation={navigation}
          headerBackgroundColor={headerBackgroundColor}
          iconColor={iconColor}
          titleOpacity={titleOpacity}
          title={storedata.storeName}
        />
      )}
      {isUpdate && (
        <UpdateHeader
          navigation={navigation}
          endUpdate={endUpdate}
          handleBottomClose={handleBottomClose}
        />
      )}
      <KeyboardAvoidingView>
        <ScrollView
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false},
          )}
          scrollEventThrottle={16}
          ref={scrollViewRef}
          style={{backgroundColor: 'white'}}
          keyboardShouldPersistTaps="always"
          scrollEnabled={true}
          contentContainerStyle={{flexGrow: 1}}>
          <TouchableWithoutFeedback onPress={handleBottomClose}>
            <View>
              <View
                style={[
                  {
                    height: 300, // 숫자 값은 따옴표 없이 사용
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'black',
                  },
                  isUpdate && {marginTop: Platform.OS === 'ios' ? 100 : 60}, // 조건부 스타일
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
                      scrollViewRef={scrollViewRef} // 스크롤 참조 전달
                      onMenuDelete={handleMenuDelete}
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
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        gestureEnabled={false}
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
      {loading && (
        <View style={styles.footer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      )}
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
});

export default StoreMainScreen;
