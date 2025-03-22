import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StoreActions from './StoreActions';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import {getLocation} from '../../storage/locationStorage';
import useDistance from '../../hooks/useDistance';
import useDayTranslation from '../../hooks/useDayTranslation';
import useStoreStatus from '../../hooks/useStoreStatus';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useCustomAlert from '../../hooks/useCustomAlert';

const StoreMainInfo = ({
  storedata = {},
  onModalOpen,
  isUpdate,
  endUpdate,
  handleBottomOpen,
  onEditKey,
  onEditValue,
  navigation,
}) => {
  const handleEdit = (key, value) => {
    onEditKey(key); // 수정 키와 값을 부모 컴포넌트로 전달
    onEditValue(value);
    handleBottomOpen(); // 바텀 시트 열기
  };

  const [isExpanded, setIsExpanded] = useState(false); // 매장 정보 확장 상태

  const {
    isOpen,
    isBreak,
    closed,
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

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
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
        {isUpdate ? (
          <TouchableOpacity onPress={() => handleEdit('name', storedata?.name)}>
            <Text style={styles.Storetitle}>{storedata?.name}</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={styles.Storetitle}>{storedata?.name}</Text>
          </View>
        )}

        {isUpdate ? (
          <TouchableOpacity
            style={styles.Storesubtitleview}
            onPress={
              isUpdate
                ? () => handleEdit('categories', storedata?.categories)
                : null
            }>
            {Array.isArray(storedata?.categories) &&
              storedata?.categories.map((category, index) => (
                <Text key={index} style={styles.Storesubtitle}>
                  {' '}
                  {translateCategory(category)}
                </Text>
              ))}
          </TouchableOpacity>
        ) : (
          <View style={styles.Storesubtitleview}>
            {Array.isArray(storedata?.categories) &&
              storedata?.categories.map((category, index) => (
                <Text key={index} style={styles.Storesubtitle}>
                  {' '}
                  {translateCategory(category)}
                </Text>
              ))}
          </View>
        )}

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

      {isUpdate ? (
        <TouchableOpacity
          style={styles.timeview}
          onPress={
            isUpdate
              ? () => handleEdit('mainDrinkDtos', storedata?.mainDrinkDtos)
              : null
          }>
          {storedata?.mainDrinkDtos && storedata.mainDrinkDtos.length > 0 ? (
            storedata.mainDrinkDtos.map((drink, index) => (
              <Text
                key={index}
                style={[
                  styles.timetextnow,
                  {color: '#10BEFB', marginBottom: 5, marginRight: 7},
                  isUpdate && {color: '#333'},
                ]}>
                {translateAlcohol(drink.type)} {drink.price.toLocaleString()}원
              </Text>
            ))
          ) : (
            <Text style={[styles.alcoholText, {color: '#333'}]}>
              대표 주종 미설정
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.timeview}>
          {storedata?.mainDrinkDtos && storedata.mainDrinkDtos.length > 0 ? (
            storedata.mainDrinkDtos.map((drink, index) => (
              <Text
                key={index}
                style={[
                  styles.timetextnow,
                  {color: '#10BEFB', marginBottom: 5, marginRight: 7},
                  isUpdate && {color: '#333'},
                ]}>
                {translateAlcohol(drink.type)} {drink.price.toLocaleString()}원
              </Text>
            ))
          ) : (
            <Text style={[styles.alcoholText, {color: '#333'}]}>
              대표 주종 미설정
            </Text>
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

      {isUpdate ? (
        <TouchableOpacity
          style={styles.infoHideView}
          onPress={
            isUpdate
              ? () =>
                  handleEdit('locationDto', {
                    address: storedata?.locationDto?.address,
                    addressDetail: storedata?.locationDto?.addressDetail,
                    latitude: storedata?.locationDto?.latitude,
                    longitude: storedata?.locationDto?.longitude,
                  })
              : null
          }>
          <AntDesign name="home" size={20} color="#333" />
          <View style={{flexDirection: 'row', flexWrap: 'wrap', width: '100%'}}>
            <Text style={styles.infoHidetext}>
              {storedata?.locationDto?.address},
            </Text>
            {storedata?.locationDto?.addressDetail && (
              <Text style={styles.addressDetailText}>
                {storedata?.locationDto?.addressDetail}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.locationview}>
          <AntDesign name="home" size={20} color="#333" />
          <View style={{flexDirection: 'row', flexWrap: 'wrap', width: '100%'}}>
            <Text style={styles.infoHidetext}>
              {storedata?.locationDto?.address},
            </Text>
            {storedata?.locationDto?.addressDetail && (
              <Text style={styles.addressDetailText}>
                {storedata?.locationDto?.addressDetail}
              </Text>
            )}
          </View>
        </View>
      )}

      <Pressable onPress={toggleExpand}>
        {!isUpdate && (
          <View style={styles.timesetview}>
            {isOpen && !isBreak && storedata?.isAlwaysOpen == false && (
              <>
                <Text style={[styles.timetextnow, {color: 'green'}]}>
                  영업 중
                </Text>
                <Text style={styles.timetext}>영업 종료 - {endtime}</Text>
              </>
            )}
            {!isOpen && !isBreak && storedata?.isAlwaysOpen == false && (
              <>
                <Text style={[styles.timetextnow, {color: '#F05650'}]}>
                  영업 종료
                </Text>
                <Text style={styles.timetext}>영업 시작 - {starttime}</Text>
              </>
            )}
            {isOpen && isBreak && storedata?.isAlwaysOpen == false && (
              <>
                <Text style={[styles.timetextnow, {color: '#F05650'}]}>
                  브레이크 타임
                </Text>
                <Text style={styles.timetext}>영업 시작 - {breakend}</Text>
              </>
            )}
            {closed &&
              !isOpen &&
              !isBreak &&
              storedata?.isAlwaysOpen == false && (
                <>
                  <Text style={[styles.timetextnow, {color: '#F05650'}]}>
                    금일 휴무
                  </Text>
                </>
              )}
            {storedata?.isAlwaysOpen == true && (
              <>
                <Text style={[styles.timetextnow, {color: 'green'}]}>
                  영업 중
                </Text>
                <Text style={styles.timetext}>- 연중무휴</Text>
              </>
            )}
            {!isExpanded && (
              <Entypo name="chevron-small-down" size={25} color="#5F5F5F" />
            )}
          </View>
        )}
        <View style={styles.infoHideViewtime}>
          {operationSchedule &&
          isExpanded &&
          storedata?.isAlwaysOpen == false ? (
            <>
              <Ionicons name="time-outline" size={20} color="#333" />
              <View>
                {operationSchedule.map((dayInfo, index) =>
                  index === 0 ? (
                    <View
                      key={index}
                      style={{
                        marginBottom: 4,
                      }}>
                      <Text style={[styles.infoHidetext, {fontWeight: 'bold'}]}>
                        {dayInfo.day}{' '}
                        {dayInfo.isClosed
                          ? '휴무일'
                          : `${dayInfo.open} - ${dayInfo.close}`}
                      </Text>
                      {!dayInfo.isClosed &&
                        dayInfo.breakStart &&
                        dayInfo.breakEnd && (
                          <Text style={styles.infoHidetext}>
                            브레이크 타임 {dayInfo.breakStart} -{' '}
                            {dayInfo.breakEnd}
                          </Text>
                        )}
                    </View>
                  ) : (
                    <View key={index} style={{marginBottom: 4}}>
                      <Text style={styles.infoHidendaytext}>
                        {dayInfo.day}{' '}
                        {dayInfo.isClosed
                          ? '휴무일'
                          : `${dayInfo.open} - ${dayInfo.close}`}
                      </Text>
                      {!dayInfo.isClosed &&
                        dayInfo.breakStart &&
                        dayInfo.breakEnd && (
                          <Text style={styles.infoHidendaytext}>
                            브레이크 타임 {dayInfo.breakStart} -{' '}
                            {dayInfo.breakEnd}
                          </Text>
                        )}
                    </View>
                  ),
                )}
              </View>
              <View style={{justifyContent: 'flex-end'}}>
                <Entypo name="chevron-small-up" size={25} color="#5F5F5F" />
              </View>
            </>
          ) : (
            isExpanded &&
            storedata?.isAlwaysOpen == true && (
              <>
                <Ionicons name="time-outline" size={20} color="#333" />
                <Text style={styles.infoHidetext}>매일 00:00 - 24:00</Text>
                <View style={{justifyContent: 'flex-end'}}>
                  <Entypo name="chevron-small-up" size={25} color="#5F5F5F" />
                </View>
              </>
            )
          )}
        </View>
      </Pressable>

      <View style={styles.introduceview}>
        {isUpdate ? (
          <TouchableOpacity
            style={styles.infoHideView}
            onPress={
              isUpdate
                ? () => handleEdit('hasScreen', storedata?.hasScreen)
                : null
            }>
            <Feather name="tv" size={20} color="#333" />

            {storedata?.hasScreen ? (
              <Text style={styles.infoHidetext}>매장 내 스크린(TV) 설치</Text>
            ) : (
              <Text style={styles.infoHidetext}>매장 내 스크린(TV) 미설치</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.infoHideView}>
            <Feather name="tv" size={20} color="#333" />

            {storedata?.hasScreen ? (
              <Text style={styles.infoHidetext}>매장 내 스크린(TV) 설치</Text>
            ) : (
              <Text style={styles.infoHidetext}>매장 내 스크린(TV) 미설치</Text>
            )}
          </View>
        )}

        {isUpdate ? (
          <TouchableOpacity
            style={styles.infoHideView}
            onPress={
              isUpdate
                ? () =>
                    handleEdit('isGroupAvailable', storedata?.isGroupAvailable)
                : null
            }>
            <MaterialIcons name="group" size={20} color="#333" />

            {storedata?.isGroupAvailable ? (
              <Text style={styles.infoHidetext}>10인 이상 가능</Text>
            ) : (
              <Text style={styles.infoHidetext}>10인 이상 불가능</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.infoHideView}>
            <MaterialIcons name="group" size={20} color="#333" />

            {storedata?.isGroupAvailable ? (
              <Text style={styles.infoHidetext}>10인 이상 가능</Text>
            ) : (
              <Text style={styles.infoHidetext}>10인 이상 불가능</Text>
            )}
          </View>
        )}
        {isUpdate ? (
          <TouchableOpacity
            style={styles.infoHideView}
            onPress={
              isUpdate ? () => handleEdit('contact', storedata?.contact) : null
            }>
            <SimpleLineIcons name="phone" size={20} color="#333" />
            {storedata?.contact ? (
              <Text style={styles.infoHidetext}>{storedata?.contact}</Text>
            ) : (
              <Text style={styles.infoHidetext}>
                등록된 매장 번호가 없습니다
              </Text>
            )}
          </TouchableOpacity>
        ) : (
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
        )}
        {isUpdate ? (
          <TouchableOpacity
            style={styles.infoHideView}
            onPress={
              isUpdate
                ? () => handleEdit('description', storedata?.description)
                : null
            }>
            <AntDesign name="profile" size={20} color="#333" />
            {storedata?.description ? (
              <Text style={styles.infoHidetext}>{storedata?.description}</Text>
            ) : (
              <Text style={styles.infoHidetext}>
                등록된 매장 소개가 없습니다
              </Text>
            )}
          </TouchableOpacity>
        ) : (
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
        )}
      </View>
      {/*필요한 정보만 넘기는 걸로 변경*/}
      {!isUpdate && (
        <StoreActions
          storeData={storedata}
          navigation={navigation}
          storename={storedata.name}
        />
      )}

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
    pointerEvents: 'auto',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  Storesubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#5F5F5F',
    textAlign: 'center',
    marginRight: 10,
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
    marginHorizontal: 15,
    alignItems: 'center',
  },
  timesetview: {
    flexDirection: 'row',
    width: '80%',
    marginTop: 10,
    marginHorizontal: 15,
    alignItems: 'center',
  },
  timetextnow: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  timetext: {
    fontSize: 15,
    fontWeight: '500',
    color: '#5F5F5F',
    marginLeft: 5,
  },
  alcoholText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  locationview: {
    flexDirection: 'row',
    width: '80%',
    marginTop: 10,
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
    marginTop: 10,
  },
  infoHideView: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoHideViewtime: {
    width: '90%',
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 10,
  },
  infoHidetext: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
  },
  infoHidendaytext: {
    fontSize: 15,
    fontWeight: '500',
    color: '#777',
    marginLeft: 10,
  },
  addressDetailText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
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
    marginTop: 10,
    marginBottom: 50,
  },
  endUpdateText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    paddingVertical: 10,
  },
});

export default StoreMainInfo;
