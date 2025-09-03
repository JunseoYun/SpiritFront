import React from 'react';
import {View, Text, Pressable, ScrollView, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../../hooks/useStoreStatus';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../context/ToastContext';
import FastImage from 'react-native-fast-image';

const PopularStoreItem = ({store, location, navigation}) => {
  const {translateAlcohol} = useTranslateAlcohol();
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
    <View style={styles.itemContainer}>
      <View style={styles.imageView}>
        <ScrollView
          horizontal
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          onStartShouldSetResponder={() => true}
          contentContainerStyle={{
            paddingHorizontal: 18,
            gap: 1,
          }}>
          <Pressable onPress={handleStorePress} style={styles.mainItemView}>
            {store.mainImgUrl ? (
              <FastImage
                resizeMode={FastImage.resizeMode.cover}
                source={
                  {uri: store.mainImgUrl} // ✅ 네트워크 이미지
                }
                style={[
                  styles.mainImageView,
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
                    styles.overlay,
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
                      <Text style={styles.overlayText}>{overlayText}</Text>
                    </View>
                  );
                })()}
              </FastImage>
            ) : (
              <FastImage
                resizeMode={FastImage.resizeMode.contain}
                style={[
                  styles.noneImageView,
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
                    style={styles.noneImg}
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
                    styles.overlay,
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
                      <Text style={styles.overlayText}>{overlayText}</Text>
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
                  style={styles.menuItemView}>
                  <FastImage
                    source={
                      {uri: menu.imgUrl} // ✅ 네트워크 이미지
                      // ✅ 로컬 이미지
                    }
                    style={[
                      styles.menuImageView,
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
                          styles.overlay,
                          index === arr.length - 1 && {
                            borderTopRightRadius: 9,
                            borderBottomRightRadius: 9,
                          },
                        ]}></View>
                    ) : (
                      // 메뉴 정보가 포함된 오버레이
                      <View
                        style={[
                          styles.semiOverlay,
                          index === arr.length - 1 && {
                            borderTopRightRadius: 9,
                            borderBottomRightRadius: 9,
                          },
                        ]}>
                        <LinearGradient
                          colors={['rgba(0, 0, 0, 0.3)', 'transparent']} // 위쪽은 어두움 → 아래쪽은 투명
                          style={styles.gradientTop}
                          pointerEvents="none"
                        />
                        <Text
                          style={styles.menuName}
                          allowFontScaling={false}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          {menu.name}
                        </Text>
                        <Text
                          style={styles.menuPrice}
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

      <Pressable onPress={handleStorePress} style={styles.infoTopView}>
        {!!store?.categories?.length && (
          <Text style={styles.category} numberOfLines={1}>
            {store.categories.map(c => translateCategory(c)).join(', ')}
          </Text>
        )}
        <View style={styles.infoTitleView}>
          <View style={[styles.infoTitleViewSection, {flex: 1}]}>
            {store.isCertified == true && (
              <FastImage
                source={require('../../../assets/verifyMaker.png')}
                style={styles.imageStyle}
              />
            )}
            <Text
              style={styles.storeName}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.name}
            </Text>
          </View>
          <View style={styles.infoTitleViewSection}>
            <FontAwesomeIcon name="star" size={16} color="#FED348" />
            <Text style={styles.infoText}> {store.storeRate || 0}</Text>
            <Text
              style={[
                styles.infoText,
                {
                  color: '#999',
                  fontFamily: 'Pretendard-Regular',
                  marginLeft: 3,
                },
              ]}>
              ({Number(store.reviewCount ?? 0).toLocaleString('ko-KR')})
            </Text>
          </View>
        </View>

        <View style={styles.infoTimeView}>
          <View style={styles.infoView}>
            {store?.isAlwaysOpen == true ? (
              <Text style={styles.subInfoText}>24시간 영업</Text>
            ) : store?.isAlwaysOpen == false && closed ? (
              <Text style={styles.subInfoText}>금일 휴무</Text>
            ) : !isOpen && nextclosed && !closed ? (
              <Text style={styles.subInfoText}>영업 종료 익일 휴무</Text>
            ) : !isOpen && !nextclosed && !closed ? (
              <Text style={styles.subInfoText}>
                영업 전 {starttime ? `${starttime} 영업 시작` : ''}
              </Text>
            ) : (
              <Text style={styles.subInfoText}>
                영업 중 {`${starttime} - ${endtime}` || '정보 없음'}
              </Text>
            )}
          </View>
          {breakstart && breakend && (
            <View style={styles.infoView}>
              <Text style={styles.subInfoText}>
                휴게시간 {breakstart} ~ {breakend}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.mainDrinkView}>
          {store?.mainDrinkDtos?.slice(0, 3)?.map((drink, idx) => (
            <View key={idx} style={styles.drinkBadge}>
              <Text style={styles.drinkBadgeText}>
                {translateAlcohol(drink.type)} {drink.price}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
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
    justifyContent: 'center',
  },
  menuImg: {
    width: 130,
    height: 130,
    resizeMode: 'cover',
  },
  noneImageView: {
    width: 180,
    height: 130,
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
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 65, // 그라데이션 높이
    zIndex: 1,
  },
  menuName: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#fff',
    marginTop: 3,
    marginLeft: 5,
    textAlign: 'center',
    zIndex: 3,
  },
  menuPrice: {
    fontSize: 11,
    fontFamily: 'Pretendard-Bold',
    color: '#fff',
    marginLeft: 5,
    textAlign: 'center',

    zIndex: 3,
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
    marginTop: 10,

    paddingHorizontal: 20,
  },
  category: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 5,
    fontFamily: 'Pretendard-SemiBold',
  },
  infoTitleView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoTitleViewSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    maxWidth: '100%',
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
    marginTop: 7,
  },
  subInfoText: {
    fontSize: 14,
    color: '#4b5563',
    fontFamily: 'Pretendard-Regular',
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

  mainDrinkView: {
    flexDirection: 'row',
    marginTop: 16,
  },
  drinkBadge: {
    marginRight: 7,
    backgroundColor: 'rgba(0,0,0,0.05)', // 필요 없으면 제거
    borderRadius: 3,
  },
  drinkBadgeText: {
    color: '#121212',
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
});

export default PopularStoreItem;
