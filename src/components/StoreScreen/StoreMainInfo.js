import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import StoreActions from './StoreActions';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import {getLocation} from '../../storage/locationStorage';
import useDistance from '../../hooks/useDistance';
import useDayTranslation from '../../hooks/useDayTranslation';
import useStoreStatus from '../../hooks/useStoreStatus';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useCustomAlert from '../../hooks/useCustomAlert';
import Title from './StoreMainInfo/Title';
import Category from './StoreMainInfo/Category';
import Review from './StoreMainInfo/Review';
import Alcohol from './StoreMainInfo/Alcohol';
import Location from './StoreMainInfo/Location';
import Address from './StoreMainInfo/Address';
import OperationSchedule from './StoreMainInfo/OperationSchedule';
import InnerOperation from './StoreMainInfo/InnerOperation';
import Introduce from './StoreMainInfo/Introduce';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import StoreExtraInfo from './StoreMainInfo/StoreExtraInfo';
const StoreMainInfo = ({
  storedata = {},
  onModalOpen,
  isUpdate,
  handleBottomOpen,
  onEditKey,
  onEditValue,
  navigation,
  storeTimeEditHandle,
}) => {
  const handleEdit = (key, value) => {
    onEditKey(key); // 수정 키와 값을 부모 컴포넌트로 전달
    onEditValue(value);
    handleBottomOpen(); // 바텀 시트 열기
  };

  const {
    isOpen,
    isBreak,
    closed,
    nextclosed,
    starttime,
    endtime,
    breakstart,
    breakend,
    operationSchedule,
  } = useStoreStatus(storedata?.operationInfoDtos, storedata?.isAlwaysOpen);

  const [distance, setDistance] = useState(0);
  const [unit, setUnite] = useState('m');
  const calculateDistance = useDistance();

  const {translateCategory} = useCategoryTranslation();
  const {translateDays} = useDayTranslation();
  const {translateAlcohol} = useTranslateAlcohol();
  const {showAlert, AlertComponent} = useCustomAlert();

  const [isExpanded, setIsExpanded] = useState(false);
  const [descripexpanded, setDescripexpanded] = useState(false);
  const [descLineCount, setDescLineCount] = useState(0);

  const handleTextLayout = e => {
    setDescLineCount(e.nativeEvent.lines.length);
  };

  const toggleExpand = () => {
    if (isUpdate) {
      setIsExpanded(true);
    } else {
      setIsExpanded(prev => !prev);
    }
  };

  const toggleDescription = () => {
    if (isUpdate) {
      setDescripexpanded(true);
    } else {
      setDescripexpanded(prev => !prev);
    }
  };

  useEffect(() => {
    if (isUpdate) {
      setIsExpanded(true);
      setDescripexpanded(true);
    }
  }, [isUpdate]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const {latitude, longitude} = await getLocation();
        let tempDistance = calculateDistance(
          latitude,
          longitude,
          storedata.locationDto.latitude,
          storedata.locationDto.longitude,
        );
        if (tempDistance < 1) {
          tempDistance *= 1000;
          setDistance(tempDistance.toFixed(0));
        } else {
          setDistance(tempDistance.toFixed(2));
          setUnite('km');
        }
      } catch (error) {}
    };
    fetchLocation();
  }, [storedata]);

  return (
    <View style={[styles.StoreTopView, isUpdate && {paddingBottom: 120}]}>
      <Category
        handleEdit={handleEdit}
        storedata={storedata}
        translateCategory={translateCategory}
        isUpdate={isUpdate}
      />
      <Title
        handleEdit={handleEdit}
        storeName={storedata?.name}
        isUpdate={isUpdate}
        onModalOpen={onModalOpen}
      />

      <Review
        isUpdate={isUpdate}
        navigation={navigation}
        storeData={{
          name: storedata?.name,
          id: storedata?.id,
          rate: storedata?.storeRate,
          reviewCount: storedata.reviewCount,
        }}
      />

      <Alcohol
        isUpdate={isUpdate}
        storeDrinkDtos={storedata?.mainDrinkDtos}
        handleEdit={handleEdit}
        translateAlcohol={translateAlcohol}
      />
      {!isUpdate && storedata?.description && (
        <Pressable onPress={toggleDescription} style={styles.infoView}>
          <View>
            {storedata?.description && (
              <View>
                {/* 라인 수 측정용 (숨김 처리) */}
                <Text
                  style={[
                    styles.infoText,
                    {position: 'absolute', opacity: 0, zIndex: -1},
                  ]}
                  onTextLayout={handleTextLayout}>
                  {storedata?.description}
                </Text>

                {/* 실제 노출용 */}
                <Text
                  style={styles.infoText}
                  numberOfLines={descripexpanded ? undefined : 2}>
                  {storedata?.description}
                </Text>
              </View>
            )}
          </View>

          {descLineCount > 2 && (
            <View style={styles.togglebtn}>
              {descripexpanded ? (
                <Entypo name="chevron-small-up" size={20} color="#767676" />
              ) : (
                <Entypo name="chevron-small-down" size={20} color="#767676" />
              )}
            </View>
          )}
        </Pressable>
      )}
      {!isUpdate && <View style={styles.division} />}

      <Address
        handleEdit={handleEdit}
        isUpdate={isUpdate}
        storedata={storedata}
      />

      <OperationSchedule
        toggleExpand={toggleExpand}
        isExpanded={isExpanded}
        isUpdate={isUpdate}
        storedata={storedata}
        isOpen={isOpen}
        isBreak={isBreak}
        closed={closed}
        nextclosed={nextclosed}
        starttime={starttime}
        endtime={endtime}
        breakend={breakend}
      />

      <InnerOperation
        toggleExpand={toggleExpand}
        isExpanded={isExpanded}
        isUpdate={isUpdate}
        storedata={storedata}
        operationSchedule={operationSchedule}
        storeTimeEditHandle={storeTimeEditHandle}
      />

      {!isUpdate && (
        <StoreExtraInfo
          navigation={navigation}
          storeData={storedata}
          distance={distance}
          unit={unit}
        />
      )}

      {!isUpdate && (
        <StoreActions
          storeData={storedata}
          navigation={navigation}
          storename={storedata.name}
        />
      )}

      {isUpdate && (
        <>
          <Location isUpdate={isUpdate} distance={distance} unit={unit} />

          <Introduce
            isUpdate={isUpdate}
            handleEdit={handleEdit}
            storedata={storedata}
            descripexpanded={descripexpanded}
            toggleDescription={toggleDescription}
          />
        </>
      )}

      {/*필요한 정보만 넘기는 걸로 변경*/}

      <AlertComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  StoreTopView: {
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 10,
    pointerEvents: 'auto',

    flex: 1,
  },
  infoCard: {
    backgroundColor: '#FAFAFA',
    marginHorizontal: 16,
    // paddingVertical: 18,
    height: 150,
    justifyContent: 'space-evenly',
    borderRadius: 16,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  infoCol: {
    alignItems: 'center',
    width: 100,
  },
  locationtext: {
    marginTop: 7,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#181A1A',
  },
  division: {
    backgroundColor: '#F5F5F5',
    height: 1,
    marginHorizontal: 16,
    marginVertical: 5,
  },
  infoView: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    marginHorizontal: 18,
  },
  infoText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 20,
    color: '#767676',
    marginTop: 3,
    marginBottom: 5,
  },
});

export default StoreMainInfo;
