import React, {useEffect, useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
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
    <View style={styles.StoreTopView}>
      <Title
        handleEdit={handleEdit}
        storedata={storedata}
        isUpdate={isUpdate}
        onModalOpen={onModalOpen}
      />

      <Category
        handleEdit={handleEdit}
        storedata={storedata}
        translateCategory={translateCategory}
        isUpdate={isUpdate}
      />

      <Review isUpdate={isUpdate} storedata={storedata} />

      <Alcohol
        isUpdate={isUpdate}
        storedata={storedata}
        handleEdit={handleEdit}
        translateAlcohol={translateAlcohol}
      />

      <Location isUpdate={isUpdate} distance={distance} unit={unit} />

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

      <Introduce
        isUpdate={isUpdate}
        handleEdit={handleEdit}
        storedata={storedata}
        descripexpanded={descripexpanded}
        toggleDescription={toggleDescription}
      />

      {/*필요한 정보만 넘기는 걸로 변경*/}
      {!isUpdate && (
        <StoreActions
          storeData={storedata}
          navigation={navigation}
          storename={storedata.name}
        />
      )}
      <AlertComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  StoreTopView: {
    width: '100%',
    backgroundColor: 'white',
    marginBottom: 10,
    pointerEvents: 'auto',
  },
});

export default StoreMainInfo;
