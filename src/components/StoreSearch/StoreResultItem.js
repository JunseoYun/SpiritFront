import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ImageBackground, StyleSheet} from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useStoreStatus from '../../hooks/useStoreStatus';

const StoreResultItem = ({store, navigation, index}) => {
  const {translateCategory} = useCategoryTranslation();

  const {
    isOpen,
    isBreak,
    closed,
    nextclosed,
    starttime,
    endtime,
    breakstart,
    breakend,
  } = useStoreStatus(store?.operationInfoDtos, store?.isAlwaysOpen);

  return (
    <Pressable
      key={store.id}
      onPress={() => {
        navigation.navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {
            storeId: store.id,
            innerlatitude: store.locationDto.latitude,
            innerlongitude: store.locationDto.longitude,
          },
        });
      }}>
      <View style={styles.StoreInfo}>
        <ImageBackground
          source={
            store.mainImgUrl
              ? {uri: store.mainImgUrl} // ✅ 네트워크 이미지
              : require('../../assets/default_store.png') // ✅ 로컬 이미지
          }
          style={styles.backimage}
          imageStyle={styles.backimagestyle}>
          {/* ✅ 영업 종료 표시 */}
          {!isOpen && !nextclosed && !closed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                영업 종료 {starttime ? `\n${starttime} 오픈` : ''}
              </Text>
            </View>
          )}
          {!isOpen && nextclosed && !closed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>영업 종료 익일 휴무</Text>
            </View>
          )}
          {!isOpen && !nextclosed && closed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>금일 휴무</Text>
            </View>
          )}
          {/* ✅ 브레이크 타임 표시 */}
          {isOpen && isBreak && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                브레이크 타임 {breakend ? `\n${breakend} 종료` : ''}
              </Text>
            </View>
          )}
          {/* ✅ 브레이크 타임 표시 */}
        </ImageBackground>
        <View style={styles.StoreTextView}>
          <View>
            <Text
              style={styles.StoreCategory}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.categories
                .slice(0, 3)
                .map(category => translateCategory(category))
                .join(' ')}
            </Text>

            <Text
              style={styles.StoreTitle}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.name}
            </Text>
            {index === 1 && (
              <Pressable
                key={store.id}
                onPress={() => {
                  navigation.navigate('StoreCheckScreen', {
                    storeId: store.id,
                    storeName: store.name,
                    storeAddress: store.locationDto.address,
                    storeAddressDetail: store.locationDto.addressDetail,
                    storeContact: store.contact,
                  });
                }}
                style={styles.badge}>
                <Text style={styles.badgeText}>권한신청</Text>
              </Pressable>
            )}
          </View>

          <Text
            style={styles.StoreAddressText}
            numberOfLines={1}
            ellipsizeMode="tail">
            {store.locationDto.address}
            {store.locationDto.addressDetail
              ? `, ${store.locationDto.addressDetail}`
              : ''}
          </Text>

          <View style={styles.subView}>
            {store?.isAlwaysOpen == true ? (
              <Text style={styles.StoreClose}>24시간 영업</Text>
            ) : store?.isAlwaysOpen == false && closed ? (
              <Text style={styles.StoreClose}>금일 휴무</Text>
            ) : (
              <Text style={styles.StoreClose}>
                영업 종료 {endtime || '정보 없음'}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.horizontalDivider} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  StoreInfo: {
    width: '100%',
    marginTop: 20,
    marginBottom: 7,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignSelf: 'center',
    paddingHorizontal: 18,
  },
  backimage: {
    width: 110,
    height: 110,
    borderRadius: 10,
    borderRadius: 10,
  },
  backimagestyle: {
    borderRadius: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
    lineHeight: 22,
  },
  StoreTextView: {
    marginLeft: 10,
    justifyContent: 'space-between',
    marginVertical: 3,
    flex: 1,
  },

  StoreTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    color: '#333',
    width: '100%',
  },
  badge: {
    backgroundColor: '#16BBFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Pretendard-SemiBold',
  },
  StoreCategoryList: {
    flexDirection: 'row',
    marginRight: 5,
    alignItems: 'center',
    width: '100%',
  },

  StoreAddressText: {
    color: '#181A1A',
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    width: '100%',
  },
  StoreCategory: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    color: '#767676',
    marginRight: 5,
    marginBottom: 3,
  },
  subView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  StoreClose: {
    fontSize: 13,
    color: '#767676',
    marginRight: 5,
    fontFamily: 'Pretendard-Regular',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 10,
    width: '100%',
    alignSelf: 'center',
  },
});

export default StoreResultItem;
