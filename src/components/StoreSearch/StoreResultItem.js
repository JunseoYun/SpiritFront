import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ImageBackground, StyleSheet} from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useStoreStatus from '../../hooks/useStoreStatus';
import Feather from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import {normalizeFont} from '../../hooks/normalizeFont';
import CustomText from '../../utils/CustomText';

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
              : require('../../assets/default_store6.png') // ✅ 로컬 이미지
          }
          style={styles.backimage}
          imageStyle={styles.backimagestyle}>
          {/* ✅ 영업 종료 표시 */}
          {!isOpen && !nextclosed && !closed && (
            <View style={styles.overlay}>
              <CustomText maxScale={1.3} style={styles.overlayText}>
                영업 종료 {starttime ? `\n${starttime} 오픈` : ''}
              </CustomText>
            </View>
          )}
          {!isOpen && nextclosed && !closed && (
            <View style={styles.overlay}>
              <CustomText maxScale={1.3} style={styles.overlayText}>
                영업 종료 익일 휴무
              </CustomText>
            </View>
          )}
          {!isOpen && !nextclosed && closed && (
            <View style={styles.overlay}>
              <CustomText maxScale={1.3} style={styles.overlayText}>
                금일 휴무
              </CustomText>
            </View>
          )}
          {/* ✅ 브레이크 타임 표시 */}
          {isOpen && isBreak && (
            <View style={styles.overlay}>
              <CustomText maxScale={1.3} style={styles.overlayText}>
                브레이크 타임 {breakend ? `\n${breakend} 종료` : ''}
              </CustomText>
            </View>
          )}
          {/* ✅ 브레이크 타임 표시 */}
        </ImageBackground>
        <View style={styles.StoreTextView}>
          <View>
            <CustomText
              style={styles.StoreCategory}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.categories
                .slice(0, 3)
                .map(category => translateCategory(category))
                .join(' ')}
            </CustomText>

            <CustomText
              style={styles.StoreTitle}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.name}
            </CustomText>
          </View>

          <CustomText
            style={styles.StoreAddressText}
            numberOfLines={1}
            ellipsizeMode="tail">
            {store.locationDto.address}
            {store.locationDto.addressDetail
              ? `, ${store.locationDto.addressDetail}`
              : ''}
          </CustomText>

          <View style={styles.subView}>
            {store?.isAlwaysOpen == true ? (
              <CustomText style={styles.StoreClose}>24시간 영업</CustomText>
            ) : store?.isAlwaysOpen == false && closed ? (
              <CustomText style={styles.StoreClose}>금일 휴무</CustomText>
            ) : (
              <CustomText style={styles.StoreClose}>
                영업 종료 {endtime || '정보 없음'}
              </CustomText>
            )}
          </View>
        </View>
      </View>
      {index === 1 &&
        (store?.isCertified ? (
          // 이미 완료된 매장일 때
          <View style={styles.completeView}>
            <FastImage
              source={require('../../assets/verifyMaker.png')}
              style={styles.imageStyle}
            />
            <CustomText style={styles.completeText}>
              사장님 인증 완료된 매장이에요
            </CustomText>
          </View>
        ) : (
          // 버튼으로 사장님 인증하기
          <Pressable
            onPress={() => {
              navigation.navigate('StoreAuthorityScreen', {
                storeId: store.id,
                storeName: store.name,
                storeLocationDto: store.locationDto,
                storeContact: store.contact,
              });
            }}
            style={styles.applyButton}>
            <CustomText style={styles.applyButtonText}>
              사장님 인증하기
            </CustomText>
            {/* <View style={{marginRight: 18}}>
              <Feather name="chevron-right" size={23} color="#3CBBFF" />
            </View> */}
          </Pressable>
        ))}

      {/* <View style={styles.horizontalDivider} /> */}
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
  applyButton: {
    alignSelf: 'center', // 가운데 정렬
    marginTop: 10,
    width: '90%', // 넓게
    paddingVertical: 14, // 버튼 높이 증가
    backgroundColor: '#fff', // 진한 파랑 (iOS 스타일)
    borderRadius: 12, // 라운드 크게
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9F5FB',
  },
  completeView: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    marginTop: 7,
  },
  imageStyle: {
    alignSelf: 'center',
    width: 17,
    height: 17,
    marginRight: 3,
  },
  completeText: {
    color: '#999',
    fontSize: 16, // ✅ 글씨 크게
    fontFamily: 'Pretendard-Medium',
    textAlign: 'left',
    marginLeft: 3,
  },
  applyButtonText: {
    color: '#3CBBFF',
    fontSize: 16, // ✅ 글씨 크게
    fontFamily: 'Pretendard-Bold',
    textAlign: 'center',
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
