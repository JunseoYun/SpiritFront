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

const StoreMainInfo = ({storedata = {}, onModalOpen}) => {
  const [isExpanded, setIsExpanded] = useState(false); // 매장 정보 확장 상태

  const [distance, setDistance] = useState(0);
  const [unit, setUnite] = useState('m');
  const calculateDistance = useDistance();

  const {translateCategory} = useCategoryTranslation();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
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

  return (
    <View style={styles.StoreTopView}>
      {/* 매장 제목 */}
      <View style={styles.Storetitleview}>
        <Text style={styles.Storetitle}>{storedata?.name}</Text>
        <View style={styles.Storesubtitleview}>
          {Array.isArray(storedata?.categories) &&
            storedata.categories.map((category, index) => (
              <Text key={index} style={styles.Storesubtitle}>
                {translateCategory(category)}
              </Text>
            ))}
        </View>
        <Pressable onPress={onModalOpen} style={styles.updateicons}>
          <Entypo name="dots-three-vertical" size={20} color="#333" />
        </Pressable>
      </View>

      {/* 리뷰 정보 */}
      <View style={styles.ReviewView}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Entypo name="star" size={20} color="#FCC104" />
          <Text style={styles.reviewRatetext}> {storedata?.storeRate}</Text>
        </View>
        <Text style={styles.reviewtext}>
          고객 리뷰 {storedata?.reviewCount}
        </Text>
        <Text style={styles.reviewtext}>찜 {storedata?.storeLikeCount}</Text>
      </View>

      {/* 영업 정보 */}
      <View style={styles.timeview}>
        {storedata?.isStoreOpen ? (
          <>
            <Text style={[styles.timetextnow, {color: 'green'}]}>영업 중</Text>
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

      {/* 영업 정보 */}
      <View style={styles.locationview}>
        <Ionicons name="location-outline" size={20} color="#333" />
        <Text style={styles.locationtext}>
          {distance} {unit}
        </Text>
      </View>

      {/* 매장 정보 더보기 */}
      {!isExpanded && (
        <Pressable onPress={toggleExpand} style={styles.introduceMoreview}>
          <Text style={styles.introduceMoreText}>매장 정보</Text>
          <Entypo name="chevron-small-down" size={25} color="#5F5F5F" />
        </Pressable>
      )}

      {/* 매장 정보 확장 */}
      {isExpanded && (
        <View style={styles.introduceview}>
          <View style={styles.infoHideView}>
            <AntDesign name="home" size={20} color="#333" />
            <Text style={styles.infoHidetext}>
              {storedata?.locationDto.address}
            </Text>
            {storedata?.locationDto.addressDetail && (
              <Text style={styles.addressDetailText}>
                , {storedata?.locationDto.addressDetail}
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
          <Pressable onPress={toggleExpand} style={styles.introduceMoreview}>
            <Text style={styles.introduceHideText}>매장 정보</Text>
            <Entypo name="chevron-small-up" size={25} color="#5F5F5F" />
          </Pressable>
        </View>
      )}
      <StoreActions storeData={storedata} />
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
    width: '95%',
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
});

export default StoreMainInfo;
