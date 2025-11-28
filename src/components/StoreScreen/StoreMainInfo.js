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
import StoreEvents from './StoreMainInfo/StoreEvents';

const StoreMainInfo = ({
  storedata = {},
  events = [],
  navigation,
  startUpdate,
  handleReport,
  handleReportList,
  handleStoreInfo,
}) => {
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
    setIsExpanded(prev => !prev);
  };

  const toggleDescription = () => {
    setDescripexpanded(prev => !prev);
  };

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
    <View style={[styles.StoreTopView]}>
      {storedata?.moods.length > 0 && <Moods moods={storedata?.moods} />}
      {storedata?.categories?.length > 0 && (
        <Category
          categories={storedata?.categories}
          translateCategory={translateCategory}
          isMoods={storedata?.moods.length > 0}
          isOwner={storedata?.isOwner}
        />
      )}
      {storedata?.name && (
        <Title
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
      {storedata?.description?.length > 0 && (
        <Description
          description={storedata?.description}
          descripexpanded={descripexpanded}
          toggleDescription={toggleDescription}
        />
      )}

      {storedata?.mainDrinkDtos?.length > 0 && (
        <Alcohol
          storeDrinkDtos={storedata?.mainDrinkDtos}
          translateAlcohol={translateAlcohol}
        />
      )}

      <View style={styles.division} />

      {storedata?.locationDto?.address && (
        <Address locationDto={storedata?.locationDto} />
      )}

      <OperationSchedule
        toggleExpand={toggleExpand}
        isExpanded={isExpanded}
        isAlwaysOpen={storedata?.isAlwaysOpen}
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
        isAlwaysOpen={storedata?.isAlwaysOpen}
        operationSchedule={operationSchedule}
      />
      {storedata?.contact && <Contact contact={storedata?.contact} />}

      {storedata?.facilitiesInfoDto.length > 0 && (
        <FacilitiesInfo facilitiesInfoDto={storedata?.facilitiesInfoDto} />
      )}
      {events?.length > 0 && (
        <StoreEvents
          events={events}
          fallbackText={storedata?.eventText}
          navigation={navigation}
          storeName={storedata?.name}
        />
      )}
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
