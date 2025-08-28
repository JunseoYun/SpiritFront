import React from 'react';
import {View, Text, Pressable, ScrollView, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../../hooks/useStoreStatus';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../context/ToastContext';
import FastImage from 'react-native-fast-image';

const PopularStoreItem = ({store, location, navigation}) => {
  const {translateAlcohol} = useTranslateAlcohol();

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

  const {token} = useAuth();
  const {showToast} = useToast();
  const handleStorePress = () => {
    if (!token) {
      showToast('로그인 후 이용할 수 있어요!', 'center');
      return;
    }

    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId: store.id},
    });
  };

  return (
    <View style={Categorystyles.itemContainer}>
      <View style={Categorystyles.imageView}>
        <ScrollView
          horizontal
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          onStartShouldSetResponder={() => true}
          contentContainerStyle={{
            paddingHorizontal: 18,
            gap: 1,
          }}>
          <Pressable
            onPress={handleStorePress}
            style={Categorystyles.mainItemView}>
            {store.mainImgUrl ? (
              <FastImage
                resizeMode={FastImage.resizeMode.cover}
                source={
                  {uri: store.mainImgUrl} // ✅ 네트워크 이미지
                }
                style={[
                  Categorystyles.mainImageView,
                  store.menuList.every(menu => !menu.imgUrl)
                    ? {
                        borderRadius: 9, // 메뉴는 있지만 imgUrl 없는 경우
                      }
                    : {
                        borderTopLeftRadius: 9,
                        borderBottomLeftRadius: 9,
                      },
                ]}>
                {(() => {
                  let overlayText = null;

                  if (!isOpen && !nextclosed && !closed) {
                    overlayText = `영업 종료${
                      starttime ? `\n${starttime} 오픈` : ''
                    }`;
                  } else if (!isOpen && nextclosed && !closed) {
                    overlayText = '영업 종료\n익일 휴무';
                  } else if (!isOpen && !nextclosed && closed) {
                    overlayText = '금일 휴무';
                  } else if (isOpen && isBreak) {
                    overlayText = `브레이크 타임${
                      breakend ? `\n${breakend} 종료` : ''
                    }`;
                  }

                  if (!overlayText) return null; // 조건 없으면 렌더링 안함

                  // overlay 스타일 계산
                  const overlayStyle = [
                    Categorystyles.overlay,
                    store.menuList.every(menu => !menu.imgUrl)
                      ? {
                          borderRadius: 9, // 메뉴는 있지만 imgUrl 없는 경우
                        }
                      : {
                          borderTopLeftRadius: 9,
                          borderBottomLeftRadius: 9,
                        },
                  ];

                  return (
                    <View style={overlayStyle}>
                      <Text style={Categorystyles.overlayText}>
                        {overlayText}
                      </Text>
                    </View>
                  );
                })()}
              </FastImage>
            ) : (
              <FastImage
                resizeMode={FastImage.resizeMode.contain}
                style={[
                  Categorystyles.noneImageView,
                  store.menuList.every(menu => !menu.imgUrl)
                    ? {
                        borderRadius: 9, // 메뉴는 있지만 imgUrl 없는 경우
                      }
                    : {
                        borderTopLeftRadius: 9,
                        borderBottomLeftRadius: 9,
                      },
                ]}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <FastImage
                    source={require('../../../assets/store.png')}
                    style={Categorystyles.noneImg}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </View>
                {(() => {
                  let overlayText = null;

                  if (!isOpen && !nextclosed && !closed) {
                    overlayText = `영업 종료${
                      starttime ? `\n${starttime} 오픈` : ''
                    }`;
                  } else if (!isOpen && nextclosed && !closed) {
                    overlayText = '영업 종료\n익일 휴무';
                  } else if (!isOpen && !nextclosed && closed) {
                    overlayText = '금일 휴무';
                  } else if (isOpen && isBreak) {
                    overlayText = `브레이크 타임${
                      breakend ? `\n${breakend} 종료` : ''
                    }`;
                  }

                  if (!overlayText) return null; // 조건 없으면 렌더링 안함

                  // overlay 스타일 계산
                  const overlayStyle = [
                    Categorystyles.overlay,
                    store.menuList.every(menu => !menu.imgUrl)
                      ? {
                          borderRadius: 9, // 메뉴는 있지만 imgUrl 없는 경우
                        }
                      : {
                          borderTopLeftRadius: 9,
                          borderBottomLeftRadius: 9,
                        },
                  ];

                  return (
                    <View style={overlayStyle}>
                      <Text style={Categorystyles.overlayText}>
                        {overlayText}
                      </Text>
                    </View>
                  );
                })()}
              </FastImage>
            )}
          </Pressable>
          {store.menuList?.length > 0 &&
            store.menuList
              .filter(menu => !!menu.imgUrl)
              .map((menu, index, arr) => (
                <Pressable
                  onPress={handleStorePress}
                  key={index}
                  style={Categorystyles.menuItemView}>
                  <FastImage
                    source={
                      {uri: menu.imgUrl} // ✅ 네트워크 이미지
                      // ✅ 로컬 이미지
                    }
                    style={[
                      Categorystyles.menuImageView,
                      index === arr.length - 1 && {
                        borderTopRightRadius: 9,
                        borderBottomRightRadius: 9,
                      },
                    ]}>
                    {(!isOpen && !nextclosed && !closed) ||
                    (!isOpen && nextclosed && !closed) ||
                    (!isOpen && !nextclosed && closed) ||
                    (isOpen && isBreak) ? (
                      // 오버레이만 표시 (내용 없음)
                      <View
                        style={[
                          Categorystyles.overlay,
                          index === arr.length - 1 && {
                            borderTopRightRadius: 9,
                            borderBottomRightRadius: 9,
                          },
                        ]}></View>
                    ) : (
                      // 메뉴 정보가 포함된 오버레이
                      <View
                        style={[
                          Categorystyles.semiOverlay,
                          index === arr.length - 1 && {
                            borderTopRightRadius: 9,
                            borderBottomRightRadius: 9,
                          },
                        ]}>
                        <Text
                          style={Categorystyles.menuName}
                          allowFontScaling={false}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          {menu.name}
                        </Text>
                        <Text
                          style={Categorystyles.menuPrice}
                          allowFontScaling={false}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          {/^\d+$/.test(menu?.price)
                            ? Number(menu.price).toLocaleString() + '원'
                            : menu?.price}
                        </Text>
                      </View>
                    )}
                  </FastImage>
                </Pressable>
              ))}
        </ScrollView>
      </View>

      <Pressable onPress={handleStorePress} style={Categorystyles.infoTopView}>
        <View style={Categorystyles.drinkView}>
          {store.mainDrinkDtos && store.mainDrinkDtos.length > 0
            ? store.mainDrinkDtos?.map((drink, index) => {
                return (
                  <React.Fragment key={index}>
                    <Text style={[Categorystyles.drinkText]}>
                      {translateAlcohol(drink.type)} {drink.price}
                    </Text>
                    {index !== store.mainDrinkDtos.length - 1 && (
                      <View style={Categorystyles.division} />
                    )}
                  </React.Fragment>
                );
              })
            : '메인주류가 없습니다.'}
        </View>
        <View style={Categorystyles.infoTitleView}>
          {store.isCertified == true && (
            <FastImage
              source={require('../../../assets/verifyMaker.png')}
              style={Categorystyles.imageStyle}
            />
          )}
          <Text
            style={Categorystyles.storeName}
            numberOfLines={1}
            ellipsizeMode="tail">
            {store.name}
          </Text>
        </View>
        <View style={Categorystyles.infoReviewView}>
          <FontAwesomeIcon name="star" size={16} color="#FED348" />
          <Text style={Categorystyles.infoText}> {store.storeRate || 0}</Text>
          <Text
            style={[
              Categorystyles.infoText,
              {color: '#999', fontFamily: 'Pretendard-Regular', marginLeft: 3},
            ]}>
            ({store.reviewCount || 0})
          </Text>
          <Ionicons
            name="heart"
            size={16}
            color={'#F85656'}
            style={{marginLeft: 7}}
          />
          <Text style={[Categorystyles.infoText, {marginLeft: 3}]}>
            {store.storeLikeCount || 0}
          </Text>
        </View>
        <View style={Categorystyles.infoTimeView}>
          <View style={Categorystyles.infoView}>
            {store?.isAlwaysOpen == true ? (
              <Text style={Categorystyles.subInfoText}>24시간 영업</Text>
            ) : store?.isAlwaysOpen == false && closed ? (
              <Text style={Categorystyles.subInfoText}>금일 휴무</Text>
            ) : !isOpen && nextclosed && !closed ? (
              <Text style={Categorystyles.subInfoText}>
                영업 종료 익일 휴무
              </Text>
            ) : !isOpen && !nextclosed && !closed ? (
              <Text style={Categorystyles.subInfoText}>
                영업 전 {starttime ? `${starttime} 영업 시작` : ''}
              </Text>
            ) : (
              <Text style={Categorystyles.subInfoText}>
                영업 중 {`${starttime} - ${endtime}` || '정보 없음'}
              </Text>
            )}
          </View>
          {breakstart && breakend && (
            <View style={Categorystyles.infoView}>
              <Text style={Categorystyles.subInfoText}>
                휴게시간 {breakstart} ~ {breakend}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
};

const Categorystyles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    borderColor: '#EDEDED',
    borderBottomWidth: 1.5,
    backgroundColor: 'white',
    paddingVertical: 15,
  },
  imageView: {
    width: '100%',
    flexDirection: 'row',
  },
  mainItemView: {
    width: 180,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImageView: {
    width: 180,
    height: 130,
    // borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
  },

  menuItemView: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuImageView: {
    width: 130,
    height: 130,
    // borderRadius: 10,
    justifyContent: 'center',
  },
  menuImg: {
    width: 130,
    height: 130,
    // borderRadius: 9,
    resizeMode: 'cover',
  },
  noneImageView: {
    width: 180,
    height: 130,
    // borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center', // 가로 중앙
    justifyContent: 'center', // 세로 중앙
    alignSelf: 'center', // 부모 기준 중앙 (ScrollView 내에서)
    borderWidth: 1,
    borderColor: '#f1f1f1',
  },
  noneImg: {
    width: 130,
    height: 130,
    // borderRadius: 10,
    // 아래 세 줄은 삭제하세요 👇
    // alignContent: 'center',
    // alignItems: 'center',
    // justifyContent: 'center',
  },

  menuName: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#fff',
    marginTop: 3,
    marginLeft: 5,
    textAlign: 'center',
  },
  menuPrice: {
    fontSize: 11,
    fontFamily: 'Pretendard-Bold',
    color: '#fff',
    marginLeft: 5,
    textAlign: 'center',
  },
  storeMainView: {
    width: 130,
    height: 130,
    //borderRadius: 10,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEEEE',
    marginLeft: 12,
    marginBottom: 10,
  },
  storeMainImg: {
    width: 130,
    height: 130,
    //borderRadius: 10,
    alignSelf: 'center', // 자기 자신을 중앙 정렬
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius: 9,
  },
  semiOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // ✅ 반투명 배경 추가
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    lineHeight: 22,
    textAlign: 'center',
  },
  menuImageView2: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    //borderRadius: 9,
  },
  menuNoImg: {
    width: '100%',
    //borderRadius: 9,
    resizeMode: 'contain',
    justifyContent: 'center',
    position: 'absolute',
  },
  moreText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  infoTopView: {
    width: '100%',
    marginTop: 1,

    paddingHorizontal: 18,
  },
  infoTitleView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    maxWidth: '95%',
  },
  alcoholText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#45C9FF',
    width: '50%',
    textAlign: 'right',
  },
  infoReviewView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  infoView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    textAlign: 'center',
  },
  infoTimeView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  subInfoText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    textAlign: 'center',
  },
  iconStar: {
    justifyContent: 'space-between',

    height: 16,
    width: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  drinkView: {
    flexDirection: 'row',
    marginTop: 1,
  },
  drinkText: {
    fontSize: 14,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 9,
    fontFamily: 'Pretendard-Medium',
    color: '#767676',
  },
  imageStyle: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    marginRight: 5,
  },
});

export default PopularStoreItem;
