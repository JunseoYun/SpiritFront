import React, {useCallback, useEffect, useRef} from 'react';
import {View, Text, Pressable, StyleSheet, Dimensions} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../../hooks/useStoreStatus';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../context/ToastContext';
import FastImage from 'react-native-fast-image';
import {normalizeFont} from '../../../hooks/normalizeFont';
import ColorUtil from '../../../utils/ColorUtil';
import {
  TapGestureHandler,
  State as GestureState,
} from 'react-native-gesture-handler';

const {width} = Dimensions.get('window');

const MapStoreItem = ({
  item,
  index,
  selectedStoreIndex,
  setSelectedStore,
  moveCenterMap,
  navigation,
  onItemPress,
  isListRestoring,
}) => {
  const {isOpen, isBreak, closed, nextclosed, starttime, endtime, breakend} =
    useStoreStatus(item?.operationInfoDtos, item?.isAlwaysOpen);

  const {token} = useAuth();
  const {showToast} = useToast();
  const pressLockRef = useRef(false);
  const resetTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };
  }, []);

  const triggerPress = useCallback(() => {
    if (pressLockRef.current || !item) {
      return;
    }
    pressLockRef.current = true;
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      pressLockRef.current = false;
      resetTimerRef.current = null;
    }, 250);

    setSelectedStore(item);
    moveCenterMap(item.locationDto.latitude, item.locationDto.longitude, 1);

    if (typeof onItemPress === 'function') {
      try {
        onItemPress(item);
      } catch (e) {}
    }
  }, [item, moveCenterMap, onItemPress, setSelectedStore]);

  const handleTapStateChange = useCallback(
    ({nativeEvent}) => {
      if (nativeEvent.state === GestureState.END) {
        triggerPress();
      }
    },
    [triggerPress],
  );

  const {translateCategory} = useCategoryTranslation();
  const {translateAlcohol} = useTranslateAlcohol();
  return (
    <TapGestureHandler
      onHandlerStateChange={handleTapStateChange}
      shouldCancelWhenOutside={false}
      maxDurationMs={350}
      maxDist={28}>
      <Pressable
        style={[
          styles.storeInfo,
          index === selectedStoreIndex && styles.selectedStore,
        ]}
        onPress={triggerPress}>
        <View style={styles.backimageview}>
          <FastImage
            source={
              item.mainImgUrl
                ? {uri: item.mainImgUrl, priority: FastImage.priority.normal}
                : require('../../../assets/default_store.png')
            }
            style={styles.backimage}
          />

          {/* 오버레이 처리 */}
          {!isOpen && !nextclosed && !closed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                영업 종료{'\n'}
                {starttime ? `${starttime} 오픈` : ''}
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
          {isOpen && isBreak && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                브레이크 타임{'\n'}
                {breakend ? `${breakend} 종료` : ''}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.titletopview}>
          <View>
            <View style={styles.category}>
              {Array.isArray(item.categories) && item.categories.length > 0 ? (
                item.categories.map((category, index) => (
                  <Text key={index} style={styles.StoreCategory}>
                    {translateCategory(category)}
                  </Text>
                ))
              ) : (
                <Text style={styles.StoreCategory}>카테고리 미설정</Text>
              )}
            </View>
            <View style={styles.titleview}>
              {item.isCertified == true && (
                <FastImage
                  source={require('../../../assets/verifyMaker.png')}
                  style={styles.imageStyle}
                />
              )}
              <Text
                style={styles.storeName}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.name}
              </Text>
            </View>
          </View>
          <Text style={styles.drinkText} numberOfLines={1} ellipsizeMode="tail">
            {item.mainDrinkDtos && item.mainDrinkDtos.length > 0
              ? item.mainDrinkDtos
                  .map(drink => {
                    const priceText =
                      drink.price != null
                        ? `${drink.price.toLocaleString()}원`
                        : '';
                    return `${translateAlcohol(drink.type)} ${priceText}`;
                  })
                  .join('  ')
              : '메인주류가 없습니다.'}
          </Text>
          <View style={styles.timeview}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <FontAwesomeIcon name="star" size={15} color="#FCC104" />
              <Text style={styles.storeRateText}>
                {item.storeRate}({item.reviewCount})
              </Text>
            </View>
            {item?.isAlwaysOpen == true ? (
              <Text style={styles.timeviewtext}>24시간 영업</Text>
            ) : item?.isAlwaysOpen == false && closed ? (
              <Text style={styles.timeviewtext}>금일 휴무</Text>
            ) : (
              <Text style={styles.timeviewtext}>
                영업 종료 {endtime || '정보 없음'}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  storeInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderColor: ColorUtil.border,
  },
  selectedStore: {
    backgroundColor: '#F7FBFF',
  },
  backimageview: {
    width: 100,
    height: 100,
    borderRadius: 9,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: ColorUtil.border,
  },
  backimage: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: normalizeFont(14, 1.5),
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
    lineHeight: 22,
  },

  titletopview: {
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  titleview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  imageStyle: {
    width: 15,
    height: 15,
    marginRight: 4,
  },
  storeName: {
    fontSize: normalizeFont(16, 1.5),
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    width: '90%',
  },
  category: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  StoreCategory: {
    fontSize: normalizeFont(14, 1.5),
    color: ColorUtil.subText,
    marginRight: 5,
    fontFamily: 'Pretendard-Regular',
  },
  drinkText: {
    fontSize: normalizeFont(14, 1.5),
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF',
  },
  timeview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeviewtext: {
    fontSize: normalizeFont(13, 1.5),
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
  },
  storeRateText: {
    fontSize: normalizeFont(13, 1.5),
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
    marginLeft: 3,
  },
});

export default React.memo(MapStoreItem);
