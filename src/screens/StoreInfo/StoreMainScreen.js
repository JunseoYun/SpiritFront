import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  View,
  Dimensions,
  Animated,
  Text,
  StyleSheet,
  Button,
  TextInput,
} from 'react-native';
import ImageSlider from '../../components/StoreScreen/ImageSlider';
import {ScrollView} from 'react-native-gesture-handler';
import StoreMainInfo from '../../components/StoreScreen/StoreMainInfo';
import StoreTabs from '../../components/StoreScreen/StoreTabs';
import {useRoute} from '@react-navigation/native';
import {StoreMainget} from '../../api/storeApi';
import StoreMenuScreen from './StoreMenuScreen';
import StoreAlcoholScreen from './StoreAlcoholScreen';
import StoreReviewScreen from './StoreReviewScreen';
import StoreMapScreen from './StoreMapScreen';
import StoreHeader from '../../components/StoreScreen/StoreHeader';
import {StoreMenuget} from '../../api/menuApi';
import StoreModal from '../../components/StoreScreen/StoreModal';
import UpdateHeader from '../../components/StoreScreen/UpdateHeader';
import BottomSheet from '@gorhom/bottom-sheet';
import useCategoryTranslation from '../../hooks/useCategoryTranslation ';

const {width} = Dimensions.get('window');

const StoreMainScreen = ({navigation}) => {
  const {translateCategory} = useCategoryTranslation();
  const route = useRoute();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%', '80%'], []);
  const {storeId, innerlatitude, innerlongitude} = route.params;
  const [menus, setMenus] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [storedata, setStoredata] = useState('');
  const [scrollY] = useState(new Animated.Value(0)); // 스크롤 위치 추적

  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [currentPage, setCurrentPage] = useState('StoreMenuScreen');
  const [isUpdate, setIsUpdate] = useState(false);

  const startUpdate = () => {
    setIsUpdate(true);
  };

  const endUpdate = () => {
    setIsUpdate(false);
  };

  const onPressModalClose = () => {
    setIsModalVisible(false);
  };

  const [updatedKey, setUpdatedKey] = useState(null);
  const [updatedValue, setUpdatedValue] = useState(null);

  const handleBottomOpen = () => {
    bottomSheetRef.current?.expand();
  };

  const handleBottomClose = () => {
    setUpdatedKey(null);
    setUpdatedValue(null);
    bottomSheetRef.current?.close();
  };

  const handleEditKey = key => {
    setUpdatedKey(key); // 수정할 데이터 저장
  };

  const handleEditValue = value => {
    setUpdatedValue(value);
  };

  const handleUpdate = () => {
    // 업데이트된 데이터 저장 로직
    console.log('Updated Data:', updatedKey, updatedValue);
    handleBottomClose();
  };

  const getStoreData = async () => {
    try {
      const storeData = await StoreMainget(storeId);
      setStoredata(storeData);
      setLongitude(storeData.locationDto.longitude);
      setLatitude(storeData.locationDto.latitude);
      // const Menus = await StoreMenuget(storeId);
      // setMenus(Menus);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getStoreData();
  }, [storeId]);
  const imageSliderData =
    storedata.imgUrlList?.map(url => ({imageUrl: url})) || [];

  // 헤더 스타일 동적 변경
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

  return (
    <>
      {/* 네비게이션 헤더 */}
      {!isUpdate && (
        <StoreHeader
          navigation={navigation}
          headerBackgroundColor={headerBackgroundColor}
          iconColor={iconColor}
          titleOpacity={titleOpacity}
          title={storedata.storeName}
        />
      )}

      {/* 이미지 슬라이더 및 콘텐츠 */}
      <ScrollView
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}
        style={{backgroundColor: 'white'}}>
        {/* 이미지 슬라이더 */}
        {isUpdate && (
          <UpdateHeader navigation={navigation} endUpdate={endUpdate} />
        )}

        <View
          style={{
            height: '300',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black',
          }}>
          {/* <ImageSlider images={tempImages} interval={4000} /> */}
          {imageSliderData.length > 0 ? (
            <ImageSlider
              images={imageSliderData}
              interval={4000}
              isUpdate={isUpdate}
            />
          ) : (
            <View>
              <Text style={{color: 'white'}}>이미지 없음</Text>
            </View>
          )}
        </View>

        {/* 추가 콘텐츠 */}
        <StoreMainInfo
          storedata={storedata}
          onModalOpen={() => setIsModalVisible(true)}
          navigation={navigation}
          isUpdate={isUpdate}
          endUpdate={endUpdate}
          handleBottomOpen={handleBottomOpen}
          onEditKey={handleEditKey}
          onEditValue={handleEditValue}
        />
        {!isUpdate && <View style={{backgroundColor: '#F2F2F2', height: 20}} />}

        {!isUpdate && <StoreTabs changePage={setCurrentPage} />}
        {!isUpdate && (
          <View>
            {currentPage === 'StoreMenuScreen' && (
              <StoreMenuScreen
                navigation={navigation}
                storeId={storeId}
                menus={menus}
              />
            )}
            {currentPage === 'StoreAlcoholScreen' && (
              <StoreAlcoholScreen
                navigation={navigation}
                storeId={storeId}
                menus={menus}
              />
            )}
            {currentPage === 'StoreReviewScreen' && (
              <StoreReviewScreen navigation={navigation} storeId={storeId} />
            )}
            {currentPage === 'StoreMapScreen' && (
              <StoreMapScreen
                navigation={navigation}
                storeId={storeId}
                storeLatitude={latitude}
                storeLongitude={longitude}
                innerlatitude={innerlatitude}
                innerlongitude={innerlongitude}
              />
            )}
          </View>
        )}

        <StoreModal
          isModalVisible={isModalVisible}
          onPressModalClose={onPressModalClose}
          storeId={storeId}
          navigation={navigation}
          startUpdate={startUpdate}
        />
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}>
        {updatedKey === 'name' && (
          <View style={styles.bottomSheetContent}>
            <Text style={styles.title}>Editing {updatedKey}</Text>
            <TextInput
              style={styles.input}
              defaultValue={updatedValue}
              onChangeText={text => setUpdatedValue(text)}
            />
            <Button title="Save" onPress={() => handleUpdate()} />
          </View>
        )}

        {updatedKey === 'category' && (
          <View style={styles.bottomSheetContent}>
            <Text style={styles.title}>Editing {updatedKey}</Text>
            {Array.isArray(updatedValue) &&
              updatedValue.map((category, index) => (
                <Text key={index} style={styles.Storesubtitle}>
                  {' '}
                  {translateCategory(category)}
                </Text>
              ))}
            <Button title="Save" onPress={() => handleUpdate()} />
          </View>
        )}

        {updatedKey === 'address' && (
          <View style={styles.bottomSheetContent}>
            <Text style={styles.title}>Editing {updatedKey}</Text>

            <Text style={styles.Storesubtitle}>
              {updatedValue.address}, {updatedValue.addressDetail}
            </Text>
            <Button title="Save" onPress={() => handleUpdate()} />
          </View>
        )}

        {updatedKey === 'operatingTime' && (
          <View style={styles.bottomSheetContent}>
            <Text style={styles.title}>Editing {updatedKey}</Text>

            <Text style={styles.Storesubtitle}>
              {updatedValue.openTime}, {updatedValue.closeTime}
            </Text>
            <Button title="Save" onPress={() => handleUpdate()} />
          </View>
        )}

        {updatedKey === 'breakingTime' && (
          <View style={styles.bottomSheetContent}>
            <Text style={styles.title}>Editing {updatedKey}</Text>
            {updatedValue ? (
              <Text style={styles.Storesubtitle}>
                {updatedValue.breakStartTime}, {updatedValue.breakEndTime}
              </Text>
            ) : (
              <Text>미지정</Text>
            )}

            <Button title="Save" onPress={() => handleUpdate()} />
          </View>
        )}
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default StoreMainScreen;
