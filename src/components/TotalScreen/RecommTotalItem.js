import React, {useMemo} from 'react';
import {
  PixelRatio,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useStoreStatus from '../../hooks/useStoreStatus';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import CustomText from '../../utils/CustomText';

const fontScale = PixelRatio.getFontScale();
const iconSize = fontScale >= 1.5 ? 22 : 16;

const toMenuPriceText = price => {
  if (price == null) return '';
  const text = String(price);
  if (/^\d+$/.test(text)) {
    return `${Number(text).toLocaleString('ko-KR')}원`;
  }
  return text;
};

const RecommTotalItem = ({store, navigation, drinkType}) => {
  const {translateAlcohol} = useTranslateAlcohol();
  const {translateCategory} = useCategoryTranslation();
  const {token} = useAuth();
  const {showToast} = useToast();

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

  const prioritizedDrinks = useMemo(() => {
    if (!store?.mainDrinkDtos?.length) return [];
    if (!drinkType) return store.mainDrinkDtos;

    const matched = store.mainDrinkDtos.filter(
      drink => drink.type === drinkType,
    );
    const others = store.mainDrinkDtos.filter(
      drink => drink.type !== drinkType,
    );
    return [...matched, ...others];
  }, [drinkType, store?.mainDrinkDtos]);

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

  const menuRenderList = store?.menuList || [];
  const hasMenuThumb = menuRenderList.length > 0;

  const overlayText = useMemo(() => {
    if (!isOpen && !nextclosed && !closed) {
      return `영업 종료${starttime ? `\n${starttime} 오픈` : ''}`;
    }
    if (!isOpen && nextclosed && !closed) {
      return '영업 종료\n익일 휴무';
    }
    if (!isOpen && !nextclosed && closed) {
      return '금일 휴무';
    }
    if (isOpen && isBreak) {
      return `브레이크 타임${breakend ? `\n${breakend} 종료` : ''}`;
    }
    return null;
  }, [breakend, closed, isBreak, isOpen, nextclosed, starttime]);

  return (
    <View style={styles.itemContainer}>
      <View style={styles.imageView}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageScrollContent}>
          <Pressable onPress={handleStorePress} style={styles.mainItemView}>
            <FastImage
              resizeMode={FastImage.resizeMode.cover}
              source={
                store?.mainImgUrl
                  ? {uri: store.mainImgUrl}
                  : require('../../assets/default_store6.png')
              }
              style={[
                styles.mainImageView,
                hasMenuThumb
                  ? {borderTopLeftRadius: 9, borderBottomLeftRadius: 9}
                  : {borderRadius: 9},
              ]}>
              {!!overlayText && (
                <View
                  style={[
                    styles.overlay,
                    hasMenuThumb
                      ? {borderTopLeftRadius: 9, borderBottomLeftRadius: 9}
                      : {borderRadius: 9},
                  ]}>
                  <CustomText maxScale={1.3} style={styles.overlayText}>
                    {overlayText}
                  </CustomText>
                </View>
              )}
            </FastImage>
          </Pressable>

          {menuRenderList.map((menu, index, arr) => (
            <Pressable
              key={`${store?.id}-menu-${index}`}
              onPress={handleStorePress}
              style={styles.menuItemView}>
              <FastImage
                source={
                  menu?.imgUrl
                    ? {uri: menu.imgUrl}
                    : require('../../assets/default_menu2.png')
                }
                style={[
                  styles.menuImageView,
                  index === arr.length - 1
                    ? {borderTopRightRadius: 9, borderBottomRightRadius: 9}
                    : {borderTopRightRadius: 0, borderBottomRightRadius: 0},
                ]}>
                <View
                  style={[
                    styles.semiOverlay,
                    index === arr.length - 1
                      ? {borderTopRightRadius: 9, borderBottomRightRadius: 9}
                      : {borderTopRightRadius: 0, borderBottomRightRadius: 0},
                  ]}>
                  <LinearGradient
                    colors={
                      menu?.imgUrl
                        ? ['rgba(0, 0, 0, 0.3)', 'transparent']
                        : ['rgba(0, 0, 0, 0.2)', 'transparent']
                    }
                    style={styles.gradientTop}
                    pointerEvents="none"
                  />
                  <CustomText style={styles.menuName} numberOfLines={1}>
                    {menu?.name}
                  </CustomText>
                  <CustomText style={styles.menuPrice} numberOfLines={1}>
                    {toMenuPriceText(menu?.price)}
                  </CustomText>
                </View>
              </FastImage>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Pressable onPress={handleStorePress} style={styles.infoTopView}>
        {!!store?.categories?.length && (
          <CustomText style={styles.category} numberOfLines={1}>
            {store.categories
              .map(category => translateCategory(category) || category)
              .join(', ')}
          </CustomText>
        )}

        <View style={styles.infoTitleView}>
          <View style={[styles.infoTitleViewSection, {flex: 1}]}>
            {store?.isCertified && (
              <FastImage
                source={require('../../assets/verifyMaker.png')}
                style={[
                  styles.imageStyle,
                  fontScale >= 1.5 && {width: 21, height: 21},
                ]}
              />
            )}
            <CustomText style={styles.storeName} numberOfLines={1}>
              {store?.name}
            </CustomText>
          </View>

          <View style={styles.infoTitleViewSection}>
            <FontAwesomeIcon name="star" size={iconSize} color="#FED348" />
            <CustomText style={styles.infoText}>
              {' '}
              {store?.storeRate ?? 0}
            </CustomText>
            <CustomText style={[styles.infoText, styles.infoCountText]}>
              ({Number(store?.postCount ?? 0).toLocaleString('ko-KR')})
            </CustomText>
          </View>
        </View>

        <View
          style={[
            styles.infoTimeView,
            fontScale >= 1.5
              ? {flexDirection: 'column', alignItems: 'flex-start'}
              : {flexDirection: 'row', alignItems: 'center'},
          ]}>
          <View style={styles.infoView}>
            {store?.isAlwaysOpen ? (
              <CustomText style={styles.subInfoText}>24시간 영업</CustomText>
            ) : store?.isAlwaysOpen === false && closed ? (
              <CustomText style={styles.subInfoText}>금일 휴무</CustomText>
            ) : !isOpen && nextclosed && !closed ? (
              <CustomText style={styles.subInfoText}>
                영업 종료 익일 휴무
              </CustomText>
            ) : !isOpen && !nextclosed && !closed ? (
              <CustomText style={styles.subInfoText}>
                영업 전 {starttime ? `${starttime} 영업 시작` : ''}
              </CustomText>
            ) : (
              <CustomText style={styles.subInfoText}>
                영업 중 {`${starttime} - ${endtime}` || '정보 없음'}
              </CustomText>
            )}
          </View>

          {breakstart && breakend && (
            <View style={styles.infoView}>
              <CustomText style={styles.subInfoText}>
                휴게시간 {breakstart} ~ {breakend}
              </CustomText>
            </View>
          )}
        </View>

        {prioritizedDrinks.length > 0 && (
          <View style={styles.mainDrinkView}>
            {prioritizedDrinks.map((drink, idx, arr) => {
              const isLast = idx === arr.length - 1;
              return (
                <View
                  key={`${store?.id}-${drink?.type}-${idx}`}
                  style={[styles.drinkBadge, isLast ? {flexShrink: 1} : {}]}>
                  <CustomText
                    style={styles.drinkBadgeText}
                    {...(isLast
                      ? {numberOfLines: 1, ellipsizeMode: 'tail'}
                      : {})}>
                    {translateAlcohol(drink?.type) || drink?.type}
                    {drink?.price ? ` ${drink.price}` : ''}
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

const styles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    borderColor: '#EDEDED',
    borderBottomWidth: 1,
    backgroundColor: 'white',
    paddingVertical: 20,
  },
  imageView: {
    width: '100%',
    flexDirection: 'row',
  },
  imageScrollContent: {
    paddingHorizontal: 18,
    gap: 1,
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
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 55,
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
    marginTop: -2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  semiOverlay: {
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
    maxWidth: '95%',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    textAlign: 'center',
  },
  infoCountText: {
    color: '#999',
    fontFamily: 'Pretendard-Regular',
    marginLeft: 3,
  },
  infoTimeView: {
    justifyContent: 'space-between',
    marginTop: 7,
  },
  infoView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subInfoText: {
    fontSize: 14,
    color: '#4b5563',
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.05)',
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

export default RecommTotalItem;
