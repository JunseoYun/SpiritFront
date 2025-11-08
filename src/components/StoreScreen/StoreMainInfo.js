import React, {useEffect, useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import {getLocation} from '../../storage/locationStorage';
import useDistance from '../../hooks/useDistance';
import useStoreStatus from '../../hooks/useStoreStatus';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import Title from './StoreMainInfo/Title';
import Category from './StoreMainInfo/Category';
import Review from './StoreMainInfo/Review';
import Alcohol from './StoreMainInfo/Alcohol';
import Location from './StoreMainInfo/Location';
import Address from './StoreMainInfo/Address';
import OperationSchedule from './StoreMainInfo/OperationSchedule';
import InnerOperation from './StoreMainInfo/InnerOperation';
import Introduce from './StoreMainInfo/Introduce';

import StoreExtraInfo from './StoreMainInfo/StoreExtraInfo';
import FacilitiesInfo from './StoreMainInfo/FacilitiesInfo';
import Contact from './StoreMainInfo/Contact';
import Description from './StoreMainInfo/Description';
import ColorUtil from '../../utils/ColorUtil';
const StoreMainInfo = ({
  storedata = {},
  isUpdate,
  handleBottomOpen,
  onEditKey,
  onEditValue,
  navigation,
  storeTimeEditHandle,
  storeupdatedrink,
  setLoading,
  loading,
  startUpdate,
  handleReport,
  handleReportList,
  handleStoreInfo,
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
  const {translateAlcohol} = useTranslateAlcohol();

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

  // 매장 연락처
  // 매장 좋아요
  // 몇미터 떨어져 있는지

  return (
    <View style={[styles.StoreTopView, isUpdate && {paddingBottom: 120}]}>
      {storedata?.categories?.length > 0 && (
        <Category
          handleEdit={handleEdit}
          storedata={storedata}
          translateCategory={translateCategory}
          isOwner={storedata?.isOwner}
        />
      )}
      {storedata?.name && (
        <Title
          handleEdit={handleEdit}
          storeName={storedata?.name}
          startUpdate={startUpdate}
          handleReport={handleReport}
          handleReportList={handleReportList}
          handleStoreInfo={handleStoreInfo}
          isUpdatable={storedata?.isUpdatable}
        />
      )}

      <Review
        navigation={navigation}
        storeData={{
          name: storedata?.name,
          id: storedata?.id,
          rate: storedata?.storeRate,
          reviewCount: storedata?.reviewCount,
          isOwner: storedata?.isOwner,
        }}
      />

      {storedata?.mainDrinkDtos?.length > 0 && (
        <Alcohol
          storeDrinkDtos={storedata?.mainDrinkDtos}
          handleEdit={handleEdit}
          translateAlcohol={translateAlcohol}
          storeupdatedrink={storeupdatedrink}
        />
      )}
      <Description
        description={storedata?.description}
        descripexpanded={descripexpanded}
        toggleDescription={toggleDescription}
      />
      <View style={styles.division} />
      {storedata?.locationDto?.address && (
        <Address locationDto={storedata?.locationDto} />
      )}

      {storedata?.operationInfoDtos?.length > 0 && (
        <OperationSchedule
          toggleExpand={toggleExpand}
          isExpanded={isExpanded}
          storedata={storedata}
          isOpen={isOpen}
          isBreak={isBreak}
          closed={closed}
          nextclosed={nextclosed}
          starttime={starttime}
          endtime={endtime}
          breakend={breakend}
        />
      )}

      <InnerOperation
        toggleExpand={toggleExpand}
        isExpanded={isExpanded}
        storedata={storedata}
        operationSchedule={operationSchedule}
      />

      <Contact contact={storedata?.contact} />

      {/* {!isUpdate && (
        <StoreExtraInfo
          navigation={navigation}
          storeData={{
            contact: storedata?.contact,
            isStoreLiked: storedata?.isStoreLiked,
            likeCount: storedata?.likeCount,
            id: storedata?.id,
            reviewCount: storedata?.reviewCount,
            isGroupAvailable: storedata?.isGroupAvailable,
            hasScreen: storedata?.hasScreen,
            name: storedata.name,
            isOwner: storedata?.isOwner,
            facilitiesInfoDto: storedata?.facilitiesInfoDto,
          }}
          distance={distance}
          unit={unit}
          setLoading={setLoading}
          loading={loading}
        />
      )} */}

      <FacilitiesInfo facilitiesInfoDto={storedata?.facilitiesInfoDto} />

      {/* {isUpdate && (
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
      )} */}
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
    color: ColorUtil.subText,
    marginTop: 3,
    marginBottom: 5,
  },
});

export default StoreMainInfo;
