import React, {useMemo} from 'react';
import {View, Pressable, ScrollView, PixelRatio} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

import LinearGradient from 'react-native-linear-gradient';
import Categorystyles from '../../screens/CategoryTap/CategoryTapStyles';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../hooks/useStoreStatus';
import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';
import FastImage from 'react-native-fast-image';
import CustomText from '../../utils/CustomText';

const fontScale = PixelRatio.getFontScale();

const iconSize = fontScale >= 1.5 ? 22 : 16;

const StoreItem = ({store, location, navigation}) => {
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

  const prioritizedDrinks = useMemo(() => {
    if (!store?.mainDrinkDtos?.length) {
      return [];
    }
    return store.mainDrinkDtos;
  }, [store?.mainDrinkDtos]);

  const menuRenderList = store?.menuList || [];
  const hasMenuThumb = menuRenderList.length > 0;

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
                  hasMenuThumb
                    ? {
                        borderTopLeftRadius: 9,
                        borderBottomLeftRadius: 9,
                      }
                    : {
                        borderRadius: 9,
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
                    hasMenuThumb
                      ? {
                          borderTopLeftRadius: 9,
                          borderBottomLeftRadius: 9,
                        }
                      : {
                          borderRadius: 9,
                        },
                  ];

                  return (
                    <View style={overlayStyle}>
                      <CustomText
                        maxScale={1.3}
                        style={Categorystyles.overlayText}>
                        {overlayText}
                      </CustomText>
                    </View>
                  );
                })()}
              </FastImage>
            ) : (
              <FastImage
                resizeMode={FastImage.resizeMode.contain}
                style={[
                  Categorystyles.noneImageView,
                  hasMenuThumb
                    ? {
                        borderTopLeftRadius: 9,
                        borderBottomLeftRadius: 9,
                      }
                    : {
                        borderRadius: 9,
                      },
                ]}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <FastImage
                    source={require('../../assets/default_store2.png')}
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
                    hasMenuThumb
                      ? {
                          borderTopLeftRadius: 9,
                          borderBottomLeftRadius: 9,
                        }
                      : {
                          borderRadius: 9,
                        },
                  ];

                  return (
                    <View style={overlayStyle}>
                      <CustomText
                        maxScale={1.3}
                        style={Categorystyles.overlayText}>
                        {overlayText}
                      </CustomText>
                    </View>
                  );
                })()}
              </FastImage>
            )}
          </Pressable>
          {menuRenderList.length > 0 &&
            menuRenderList.map((menu, index, arr) => (
              <Pressable
                onPress={handleStorePress}
                key={index}
                style={Categorystyles.menuItemView}>
                <FastImage
                  source={
                    menu.imgUrl
                      ? {uri: menu.imgUrl}
                      : require('../../assets/default_menu.png')
                  }
                  style={[
                    Categorystyles.menuImageView,
                    index === arr.length - 1
                      ? {
                          borderTopRightRadius: 9,
                          borderBottomRightRadius: 9,
                        }
                      : {
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                        },
                  ]}>
                  <View
                    style={[
                      Categorystyles.semiOverlay,
                      index === arr.length - 1
                        ? {
                            borderTopRightRadius: 9,
                            borderBottomRightRadius: 9,
                          }
                        : {
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                          },
                    ]}>
                    <LinearGradient
                      colors={
                        menu.imgUrl
                          ? ['rgba(0, 0, 0, 0.5)', 'transparent']
                          : ['rgba(0, 0, 0, 0.2)', 'transparent']
                      } // 위쪽은 어두움 → 아래쪽은 투명 (기본 이미지는 약하게)
                      style={Categorystyles.gradientTop}
                      pointerEvents="none"
                    />
                    <CustomText
                      style={Categorystyles.menuName}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {menu.name}
                    </CustomText>
                    <CustomText
                      style={Categorystyles.menuPrice}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {/^\d+$/.test(menu?.price)
                        ? Number(menu.price).toLocaleString() + '원'
                        : menu?.price}
                    </CustomText>
                  </View>
                </FastImage>
              </Pressable>
            ))}
        </ScrollView>
      </View>

      <Pressable onPress={handleStorePress} style={Categorystyles.infoTopView}>
        <View style={Categorystyles.infoTitleView}>
          <View style={[Categorystyles.infoTitleViewSection, {flex: 1}]}>
            {store.isCertified == true && (
              <FastImage
                source={require('../../assets/verifyMaker.png')}
                style={[
                  Categorystyles.imageStyle,
                  fontScale >= 1.5 && {width: 21, height: 21},
                ]}
              />
            )}
            <CustomText
              style={Categorystyles.storeName}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.name}
            </CustomText>
          </View>
          <View style={Categorystyles.infoTitleViewSection}>
            <FontAwesomeIcon name="star" size={iconSize} color="#FED348" />
            <CustomText style={Categorystyles.infoText}>
              {' '}
              {store.storeRate || 0}
            </CustomText>
            <CustomText
              style={[
                Categorystyles.infoText,
                {
                  color: '#999',
                  fontFamily: 'Pretendard-Regular',
                  marginLeft: 3,
                },
              ]}>
              ({Number(store.reviewCount ?? 0).toLocaleString('ko-KR')})
            </CustomText>
          </View>
        </View>
        <View
          style={[
            Categorystyles.infoTimeView,
            fontScale >= 1.5
              ? {flexDirection: 'column', alignItems: 'flex-start'}
              : {flexDirection: 'row', alignItems: 'center'},
          ]}>
          <View style={Categorystyles.infoView}>
            {store?.isAlwaysOpen == true ? (
              <CustomText style={Categorystyles.subInfoText}>
                24시간 영업
              </CustomText>
            ) : store?.isAlwaysOpen == false && closed ? (
              <CustomText style={Categorystyles.subInfoText}>
                금일 휴무
              </CustomText>
            ) : !isOpen && nextclosed && !closed ? (
              <CustomText style={Categorystyles.subInfoText}>
                영업 종료 익일 휴무
              </CustomText>
            ) : !isOpen && !nextclosed && !closed ? (
              <CustomText style={Categorystyles.subInfoText}>
                영업 전 {starttime ? `${starttime} 영업 시작` : ''}
              </CustomText>
            ) : (
              <CustomText style={Categorystyles.subInfoText}>
                영업 중 {`${starttime} - ${endtime}` || '정보 없음'}
              </CustomText>
            )}
          </View>
          {breakstart && breakend && (
            <View style={Categorystyles.infoView}>
              <CustomText style={Categorystyles.subInfoText}>
                휴게시간 {breakstart} ~ {breakend}
              </CustomText>
            </View>
          )}
        </View>

        {prioritizedDrinks.length > 0 && (
          <View style={Categorystyles.mainDrinkView}>
            {prioritizedDrinks.map((drink, idx, arr) => {
              const isLast = idx === arr.length - 1;

              return (
                <View
                  key={idx}
                  style={[
                    Categorystyles.drinkBadge,
                    isLast ? {flexShrink: 1} : {},
                  ]}>
                  <CustomText
                    style={Categorystyles.drinkBadgeText}
                    {...(isLast
                      ? {numberOfLines: 1, ellipsizeMode: 'tail'}
                      : {})}>
                    {translateAlcohol(drink.type)}
                    {drink.price ? ` ${drink.price}` : ''}
                  </CustomText>
                </View>
              );
            })}
          </View>
        )}
      </Pressable>
    </View>
  );
};

export default StoreItem;
