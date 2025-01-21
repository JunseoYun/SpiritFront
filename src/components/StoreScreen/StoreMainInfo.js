import React, {useEffect, useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StoreActions from './StoreActions';
import useCategoryTranslation from '../../hooks/useCategoryTranslation ';
import {getLocation} from '../../storage/locationStorage';
import useDistance from '../../hooks/useDistance';
import useDayTranslation from '../../hooks/useDayTranslation';

import useCustomAlert from '../../hooks/useCustomAlert';

const StoreMainInfo = ({storedata = {}, onModalOpen, isUpdate, endUpdate}) => {
  const [isExpanded, setIsExpanded] = useState(true); // 매장 정보 확장 상태

  console.log(isUpdate);
  const [distance, setDistance] = useState(0);
  const [unit, setUnite] = useState('m');
  const calculateDistance = useDistance();

  const {translateCategory} = useCategoryTranslation();
  const {translateDays} = useDayTranslation();
  const {showAlert, AlertComponent} = useCustomAlert();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const endHandle = () => {
    showAlert({
      title: '매장 수정',
      message: '매장 수정을 완료하시겠습니까?',
      onConfirm: () => endUpdate(),
      onCancel: null,
      type: 'confirm',
    });
  };

  useEffect(() => {
    const updateMessage = () => {
      if (isUpdate) {
        showAlert({
          title: '매장 수정',
          message:
            '수정할 항목을 클릭하면 \n내용을 입력하거나 변경할 수 있습니다.',
        });
      }
    };
    updateMessage();
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
      <View style={styles.Storetitleview}>
        <Text style={styles.Storetitle}>{storedata?.name}</Text>

        <View style={styles.Storesubtitleview}>
          {Array.isArray(storedata?.categories) &&
            storedata.categories.map((category, index) => (
              <Text key={index} style={styles.Storesubtitle}>
                {' '}
                {translateCategory(category)}
              </Text>
            ))}
        </View>
        {!isUpdate && (
          <Pressable onPress={onModalOpen} style={styles.updateicons}>
            <Entypo name="dots-three-vertical" size={20} color="#333" />
          </Pressable>
        )}
      </View>

      {!isUpdate && (
        <View style={styles.ReviewView}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Entypo name="star" size={20} color="#FCC104" />
            <Text style={styles.reviewRatetext}> {storedata?.storeRate}</Text>
          </View>
          <Text style={styles.reviewtext}>
            고객 리뷰 {storedata?.reviewCount}
          </Text>
          <Text style={styles.reviewtext}>찜 {storedata?.likeCount}</Text>
        </View>
      )}

      {!isUpdate && (
        <View style={styles.timeview}>
          {storedata?.isStoreOpen ? (
            <>
              <Text style={[styles.timetextnow, {color: 'green'}]}>
                영업 중
              </Text>
              <Text style={styles.timetext}>
                영업 종료 - {storedata?.businessHoursDto.closeTime?.slice(0, 5)}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.timetextnow, {color: '#F05650'}]}>
                영업 종료
              </Text>
              <Text style={styles.timetext}>
                영업 시작 - {storedata?.businessHoursDto?.openTime?.slice(0, 5)}
              </Text>
            </>
          )}
        </View>
      )}

      {!isUpdate && (
        <View style={styles.locationview}>
          <Ionicons name="location-outline" size={20} color="#333" />
          <Text style={styles.locationtext}>
            {distance} {unit}
          </Text>
        </View>
      )}

      {!isExpanded && !isUpdate && (
        <Pressable onPress={toggleExpand} style={styles.introduceMoreview}>
          <Text style={styles.introduceMoreText}>매장 정보</Text>
          <Entypo name="chevron-small-down" size={25} color="#5F5F5F" />
        </Pressable>
      )}

      {/* 매장 정보 확장 */}
      {(isExpanded || isUpdate) && (
        <View style={styles.introduceview}>
          <View style={styles.infoHideView}>
            <AntDesign name="home" size={20} color="#333" />
            <Text style={styles.infoHidetext}>
              {storedata?.locationDto?.address}
            </Text>
            {storedata?.locationDto?.addressDetail && (
              <Text style={styles.addressDetailText}>
                , {storedata?.locationDto?.addressDetail}
              </Text>
            )}
          </View>

          <View style={styles.infoHideView}>
            <Ionicons name="time-outline" size={20} color="#333" />
            <Text style={styles.infoHidetext}>
              {storedata?.businessHoursDto?.openTime?.slice(0, 5)} -{' '}
              {storedata?.businessHoursDto?.closeTime?.slice(0, 5)}
            </Text>
          </View>

          <View style={styles.infoHideView}>
            <MaterialCommunityIcons name="sleep" size={20} color="#333" />

            {storedata?.businessHoursDto?.breakStartTime ? (
              <Text style={styles.infoHidetext}>
                {storedata?.businessHoursDto?.breakStartTime?.slice(0, 5)} -{' '}
                {storedata?.businessHoursDto?.breakEndTime?.slice(0, 5)}{' '}
                (브레이크타임)
              </Text>
            ) : (
              <Text style={styles.infoHidetext}>미지정 (브레이크타임)</Text>
            )}
          </View>

          <View style={styles.infoHideView}>
            <AntDesign name="calendar" size={20} color="#333" />

            {storedata?.closedDays ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.infoHidetext}>매주 </Text>
                <Text style={styles.closetext}>
                  {translateDays(storedata?.closedDays)}
                </Text>
                <Text style={styles.closetext}> 휴무</Text>
              </View>
            ) : (
              <Text style={styles.infoHidetext}>휴무일 없음</Text>
            )}
          </View>

          <View style={styles.infoHideView}>
            <SimpleLineIcons name="phone" size={20} color="#333" />
            {storedata?.contact ? (
              <Text style={styles.infoHidetext}>{storedata?.contact}</Text>
            ) : (
              <Text style={styles.infoHidetext}>
                등록된 매장 번호가 없습니다
              </Text>
            )}
          </View>

          <View style={styles.infoHideView}>
            <AntDesign name="profile" size={20} color="#333" />
            {storedata?.description ? (
              <Text style={styles.infoHidetext}>{storedata?.description}</Text>
            ) : (
              <Text style={styles.infoHidetext}>
                등록된 매장 소개가 없습니다
              </Text>
            )}
          </View>
          {!isUpdate && (
            <Pressable onPress={toggleExpand} style={styles.introduceMoreview}>
              <Text style={styles.introduceHideText}>매장 정보</Text>
              <Entypo name="chevron-small-up" size={25} color="#5F5F5F" />
            </Pressable>
          )}
        </View>
      )}
      {/*필요한 정보만 넘기는 걸로 변경*/}
      {!isUpdate && <StoreActions storeData={storedata} />}

      {isUpdate && (
        <Pressable onPress={endHandle}>
          <View style={styles.endUpdateButton}>
            <Text style={styles.endUpdateText}>완료</Text>
          </View>
        </Pressable>
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
  },
  Storetitleview: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 18,
  },
  Storetitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  updateicons: {
    position: 'absolute',
    right: 25,
  },
  Storesubtitleview: {
    width: '30%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  Storesubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#5F5F5F',
    textAlign: 'center',
  },
  ReviewView: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 7,
    marginHorizontal: 15,
  },
  reviewRatetext: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  reviewtext: {
    fontWeight: '400',
    fontSize: 16,
    color: '#5F5F5F',
    marginLeft: 10,
  },
  timeview: {
    flexDirection: 'row',
    width: '80%',
    marginTop: 10,
    marginHorizontal: 15,
    alignItems: 'center',
  },
  timetextnow: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timetext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5F5F5F',
    marginLeft: 5,
  },
  locationview: {
    flexDirection: 'row',
    width: '80%',
    marginTop: 15,
    marginHorizontal: 15,
    alignItems: 'center',
  },
  locationtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
  },
  introduceMoreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  introduceMoreText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#5F5F5F',
    marginRight: 5,
  },
  introduceHideText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#5F5F5F',
    marginRight: 5,
    marginLeft: -15,
  },
  introduceText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginRight: 5,
  },
  introduceview: {
    marginHorizontal: 15,
    marginTop: 15,
  },
  infoHideView: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoHidetext: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
  },
  addressDetailText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  closetext: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  endUpdateButton: {
    marginHorizontal: 18,
    backgroundColor: '#10BEFB',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  endUpdateText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    paddingVertical: 10,
  },
});

export default StoreMainInfo;
