import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
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
import FacilitiesInfo from './StoreMainInfo/FacilitiesInfo';
import Contact from './StoreMainInfo/Contact';
import Description from './StoreMainInfo/Description';
import Moods from './StoreMainInfo/Moods';
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

  // 몇미터 떨어져 있는지 distance
  return (
    <View style={[styles.StoreTopView, isUpdate && {paddingBottom: 120}]}>
      {storedata?.moods.length > 0 && <Moods moods={storedata?.moods} />}
      {storedata?.categories?.length > 0 && (
        <Category
          handleEdit={handleEdit}
          categories={storedata?.categories}
          translateCategory={translateCategory}
          isMoods={storedata?.moods.length > 0}
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
      {storedata?.description.length > 0 && (
        <Description
          description={storedata?.description}
          descripexpanded={descripexpanded}
          toggleDescription={toggleDescription}
        />
      )}

      <View style={styles.eventContainer}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>크리스마스 이벤트</Text>
          <Text style={styles.eventTag}>12/25 예정</Text>
        </View>
        <Text style={styles.eventCopy}>
          {storedata?.eventText ?? '가족 방문 시 와인 1병 제공'}
        </Text>
      </View>

      {storedata?.mainDrinkDtos?.length > 0 && (
        <Alcohol
          storeDrinkDtos={storedata?.mainDrinkDtos}
          handleEdit={handleEdit}
          translateAlcohol={translateAlcohol}
          storeupdatedrink={storeupdatedrink}
        />
      )}

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

      <FacilitiesInfo facilitiesInfoDto={storedata?.facilitiesInfoDto} />
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
  eventContainer: {
    marginHorizontal: 16,
    marginTop: 5,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#D0E6FF',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    color: '#1D5AFF',
  },
  eventTag: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 11,
    color: '#1D5AFF',
    backgroundColor: '#E0ECFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  eventCopy: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
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
