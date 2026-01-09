// === MapDetailItem.js ===

import React, {useState, useCallback, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  Linking,
  Animated as RNAnimated,
  Platform,
  ToastAndroid,
  Dimensions,
} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import {ShareIcon} from 'lucide-react-native';
import Clipboard from 'react-native/Libraries/Components/Clipboard/Clipboard';
import useDirectionsModal from '../../../hooks/useDirectionsModal';
import BookmarkIcon from '../../../assets/svg/BookmarkIcon';

import ColorUtil from '../../../utils/ColorUtil';
import {normalizeFont} from '../../../hooks/normalizeFont';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../../hooks/useStoreStatus';
import useDistance from '../../../hooks/useDistance';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../context/ToastContext';

import Alcohol from '../../StoreScreen/StoreMainInfo/Alcohol';
import OperationSchedule from '../../StoreScreen/StoreMainInfo/OperationSchedule';

import {Storelikepost, get_store_share} from '../../../api/storeApi';
import CustomText from '../../../utils/CustomText';

import Ionicons from 'react-native-vector-icons/Ionicons';
const {width} = Dimensions.get('window');
const H_PADDING = 16;
const CONTENT_WIDTH = width - H_PADDING * 2;

const MapDetailItem = ({
  storeData,
  navigation,
  location,
  onCloseDetail,
  onHeaderLayout,
  detailRevealProgressValue,
  detailPointerEnabled = true,
}) => {
  const {translateCategory} = useCategoryTranslation();
  const {translateAlcohol} = useTranslateAlcohol();
  const {token} = useAuth();
  const {showToast} = useToast();
  // 영업 상태 계산
  const {
    isOpen,
    isBreak,
    closed,
    nextclosed,
    starttime,
    endtime,
    breakstart,
    breakend,
  } = useStoreStatus(storeData?.operationInfoDtos, storeData?.isAlwaysOpen);

  // 찜 상태
  const [isLiked, setIsLiked] = useState(!!storeData?.isStoreLiked);
  const [likeLoading, setLikeLoading] = useState(false);

  // 거리 계산
  const calcDistance = useDistance();
  const distanceInfo = useMemo(() => {
    if (
      !location ||
      !storeData?.locationDto ||
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number'
    ) {
      return {distance: '', unit: 'm'};
    }
    const d = calcDistance(
      location.latitude,
      location.longitude,
      storeData.locationDto.latitude,
      storeData.locationDto.longitude,
    );
    if (!Number.isFinite(d)) return {distance: '', unit: 'm'};
    if (d < 1) {
      return {distance: (d * 1000).toFixed(0), unit: 'm'};
    }
    return {distance: d.toFixed(2), unit: 'km'};
  }, [
    calcDistance,
    location?.latitude,
    location?.longitude,
    storeData?.locationDto?.latitude,
    storeData?.locationDto?.longitude,
  ]);

  // 연락처 팝오버 관련
  const [showContactPopover, setShowContactPopover] = useState(false);
  const [contactCopied, setContactCopied] = useState(false);
  const contactFadeAnim = useRef(new RNAnimated.Value(0)).current;
  const [contactAnchorHeight, setContactAnchorHeight] = useState(0);
  const {openDirectionsModal, DirectionsModal} = useDirectionsModal();
  const handleHeaderLayout = useCallback(
    e => {
      if (!onHeaderLayout) return;
      const height = e?.nativeEvent?.layout?.height;
      if (!height || Number.isNaN(height)) return;
      onHeaderLayout(height);
    },
    [onHeaderLayout],
  );

  const openContactPopover = () => {
    if (!storeData?.contact) {
      showToast?.('전화번호 정보가 없어요.', 'center');
      return;
    }
    setShowContactPopover(true);
    RNAnimated.timing(contactFadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const closeContactPopover = () => {
    RNAnimated.timing(contactFadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowContactPopover(false));
  };

  const toggleContactPopover = () => {
    showContactPopover ? closeContactPopover() : openContactPopover();
  };

  const handleCall = () => {
    if (!storeData?.contact) return;
    closeContactPopover();
    Linking.openURL(`tel:${storeData.contact}`);
  };

  const handleCopyContact = () => {
    if (!storeData?.contact) return;
    Clipboard.setString(storeData.contact);
    setContactCopied(true);

    if (Platform.OS === 'android') {
      ToastAndroid.show('전화번호가 복사되었어요.', ToastAndroid.SHORT);
    } else {
      showToast?.('전화번호가 복사되었어요.');
    }

    setTimeout(() => setContactCopied(false), 2000);
  };

  // 찜 토글
  const handleToggleLike = async e => {
    e?.stopPropagation?.();
    if (!token) {
      showToast?.('로그인 후 이용할 수 있어요!', 'center');
      return;
    }
    const next = !isLiked;
    setIsLiked(next);
    setLikeLoading(true);
    try {
      await Storelikepost(storeData.id);
    } catch {
      setIsLiked(!next);
      showToast?.('찜을 변경할 수 없어요.', 'center');
    } finally {
      setLikeLoading(false);
    }
  };

  // 공유
  const handleShare = async () => {
    try {
      const res = await get_store_share(storeData.id);
      if (!res?.shareLink) return;

      await Share.share({
        message: `${storeData?.name}에서 한잔 어때요?\n\n${res.shareLink}`,
      });
    } catch {
      showToast?.('공유에 실패했어요.');
    }
  };

  const categoriesText =
    storeData?.categories?.map(c => translateCategory(c)).join('   ') ||
    '카테고리 미설정';

  // 이미지 레이아웃
  const leftW = Math.round(CONTENT_WIDTH * 0.66) - 6;
  const rightW = CONTENT_WIDTH - leftW - 6;
  const leftH = 168;
  const rightH = Math.floor((leftH - 6) / 2);

  // Pick main/secondary images for the mosaic section
  const normalizedImgList = Array.isArray(storeData?.imgUrlList)
    ? storeData.imgUrlList.filter(Boolean)
    : [];
  const mainImageUrl = storeData?.mainImgUrl || normalizedImgList[0] || null;
  const hasPhotos = !!mainImageUrl;
  const mosaicImages = normalizedImgList
    .filter(url => url !== mainImageUrl)
    .slice(0, 2);
  const imgSrc = mainImageUrl
    ? {uri: mainImageUrl}
    : require('../../../assets/default_store6.png');
  const showMosaicLayout = hasPhotos && mosaicImages.length === 2;
  const detailBodyAnimatedStyle = useAnimatedStyle(() => {
    const progress = detailRevealProgressValue?.value ?? 1;
    return {
      opacity: progress,
    };
  }, [detailRevealProgressValue]);

  return (
    <View style={styles.container}>
      {/* 전체 이동 가능한 영역 */}
      <Pressable
        onPress={() =>
          navigation.navigate('StoreStack', {
            screen: 'StoreMainScreen',
            params: {storeId: storeData.id},
          })
        }>
        <View onLayout={handleHeaderLayout}>
          {/* 상단 Row */}
          <View style={styles.headerRow}>
            <CustomText style={styles.categories} numberOfLines={1}>
              {categoriesText}
            </CustomText>

            {/* 상단 버튼 */}
            <View style={styles.headerActions}>
              <Pressable
                style={[
                  styles.topButton,
                  isLiked && styles.saveButtonActive,
                  likeLoading && {opacity: 0.5},
                ]}
                hitSlop={8}
                onPress={handleToggleLike}>
                <BookmarkIcon
                  size={18}
                  color={isLiked ? '#3CBBFF' : '#4B5563'}
                  strokeWidth={2}
                  filled={isLiked}
                />
              </Pressable>

              <Pressable
                style={styles.topButton}
                hitSlop={8}
                onPress={onCloseDetail}>
                <Ionicons name="close" size={18} color="#4B5563" />
              </Pressable>
            </View>
          </View>

          {/* 매장명 */}
          <View style={styles.titleView}>
            {storeData?.isOwner != null && (
              <FastImage
                source={require('../../../assets/verifyMaker.png')}
                style={styles.verifyIcon}
              />
            )}
            <CustomText style={styles.storeName} numberOfLines={1}>
              {storeData?.name}
            </CustomText>
          </View>
        </View>

        <Animated.View
          pointerEvents={detailPointerEnabled ? 'auto' : 'none'}
          style={[styles.bodyContainer, detailBodyAnimatedStyle]}>
          {/* 별점 + 영업 시간 */}
          <View style={styles.infoRow}>
            <View style={styles.ratingRow}>
              <FastImage
                source={require('../../../assets/icon-star.png')}
                style={styles.starIcon}
              />
              <CustomText style={styles.ratingText}>
                {storeData?.storeRate} ({storeData?.postCount})
              </CustomText>
            </View>
            <CustomText style={{color: '#D4D4D4', marginRight: -24}}>
              {' '}
              ·{' '}
            </CustomText>
            <OperationSchedule
              type="preview"
              isAlwaysOpen={storeData?.isAlwaysOpen}
              isOpen={isOpen}
              isBreak={isBreak}
              closed={closed}
              nextclosed={nextclosed}
              starttime={starttime}
              endtime={endtime}
              breakend={breakend}
            />
          </View>

          {/* 거리 & 주소 */}
          <View style={styles.distanceAddressView}>
            <CustomText style={styles.distanceAddress}>
              {distanceInfo.distance}
              {distanceInfo.unit}
            </CustomText>
            <CustomText style={{color: '#D4D4D4'}}> · </CustomText>
            <CustomText style={styles.distanceAddress}>
              {storeData?.locationDto?.address}
            </CustomText>
          </View>

          {/* 주류 */}
          {storeData?.mainDrinkDtos?.length > 0 && (
            <Alcohol
              storeDrinkDtos={storeData.mainDrinkDtos}
              translateAlcohol={translateAlcohol}
            />
          )}

          {/* 이미지 모자이크 */}
          {hasPhotos &&
            (showMosaicLayout ? (
              <View style={styles.mosaicRow}>
                <FastImage
                  source={imgSrc}
                  style={{
                    width: leftW,
                    height: leftH,
                    borderRadius: 6,
                    backgroundColor: '#F3F4F6',
                  }}
                />
                <View style={{width: rightW, marginLeft: 6}}>
                  {mosaicImages.map((url, index) => (
                    <FastImage
                      key={`${url}-${index}`}
                      source={{uri: url}}
                      style={{
                        width: rightW,
                        height: rightH,
                        borderRadius: 6,
                        backgroundColor: '#F3F4F6',
                        marginBottom: index === 0 ? 6 : 0,
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.singleImageWrapper}>
                <FastImage
                  source={imgSrc}
                  style={[styles.singleImage, {height: leftH}]}
                />
              </View>
            ))}
        </Animated.View>
      </Pressable>

      {/* 하단 버튼 */}
      <View style={styles.bottomButtonRow}>
        <View
          style={styles.bottomButtonGroup}
          onLayout={e => setContactAnchorHeight(e.nativeEvent.layout.height)}>
          <Pressable
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate('StoreStack', {
                screen: 'StoreMainScreen',
                params: {storeId: storeData.id},
              })
            }>
            <Ionicons name="storefront" size={18} color={ColorUtil.main} />
          </Pressable>

          <Pressable style={styles.iconButton} onPress={toggleContactPopover}>
            <Ionicons name="call" size={18} color={ColorUtil.main} />
          </Pressable>

          <Pressable style={styles.iconButton} onPress={handleShare}>
            <ShareIcon size={18} color={ColorUtil.main} />
          </Pressable>
        </View>

        <Pressable
          style={styles.directionsButton}
          onPress={() =>
            openDirectionsModal({
              startLat: location?.latitude,
              startLng: location?.longitude,
              destLat: storeData?.locationDto?.latitude,
              destLng: storeData?.locationDto?.longitude,
              destName: storeData?.name,
            })
          }>
          <CustomText style={styles.directionsText}>길찾기</CustomText>
        </Pressable>
      </View>

      {/* 전화 팝오버 */}
      {showContactPopover && (
        <>
          <Pressable
            style={styles.contactBackdrop}
            onPress={closeContactPopover}
          />
          <RNAnimated.View
            style={[
              styles.contactPopover,
              {
                bottom: contactAnchorHeight + 12,
                opacity: contactFadeAnim,
                transform: [
                  {
                    translateY: contactFadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.contactHeader}>
              <CustomText style={styles.contactTitle}>
                매장과 연결되는 번호입니다
              </CustomText>
              <Pressable onPress={closeContactPopover}>
                <Ionicons name="close" size={18} color="#9AA0AF" />
              </Pressable>
            </View>

            <CustomText style={styles.contactDesc}>
              예약, 문의 등 필요한 내용을 전화로 바로 확인할 수 있어요.
            </CustomText>

            <View style={styles.contactNumberRow}>
              <CustomText style={styles.contactNumberLabel}>
                전화번호
              </CustomText>
              <CustomText style={styles.contactNumberValue}>
                {storeData?.contact}
              </CustomText>

              <Pressable onPress={handleCopyContact}>
                <CustomText style={styles.contactCopyText}>
                  {contactCopied ? '복사됨' : '복사'}
                </CustomText>
              </Pressable>
            </View>

            <Pressable
              style={[
                styles.contactCallButton,
                !storeData?.contact && {opacity: 0.5},
              ]}
              onPress={handleCall}
              disabled={!storeData?.contact}>
              <CustomText style={styles.contactCallButtonText}>
                전화하기
              </CustomText>
            </Pressable>
          </RNAnimated.View>
        </>
      )}

      <DirectionsModal />
    </View>
  );
};

// =========================
// ======== STYLES =========
// =========================

const styles = StyleSheet.create({
  container: {backgroundColor: '#fff'},

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    // marginTop: 4,
    alignItems: 'center',
  },
  categories: {
    fontSize: 14,
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
  },
  headerActions: {flexDirection: 'row', alignItems: 'center'},

  topButton: {
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  saveButtonActive: {
    backgroundColor: '#E6F3FF',
  },

  titleView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginHorizontal: 18,
  },
  verifyIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  storeName: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
    maxWidth: '90%',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  distanceAddressView: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  distanceAddress: {
    fontSize: 14,
    color: '#757F8C',
    fontFamily: 'Pretendard-Regular',
    textAlign: 'left',
  },

  mosaicRow: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 7,
  },
  bodyContainer: {
    marginTop: 4,
  },
  singleImageWrapper: {
    marginHorizontal: 18,
    marginTop: 7,
  },
  singleImage: {
    width: CONTENT_WIDTH,
    height: (CONTENT_WIDTH / 4) * 2,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },

  bottomButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginTop: 22,
  },
  bottomButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 30,
    backgroundColor: '#E9F6FF',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsButton: {
    backgroundColor: '#E9F6FF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  directionsText: {
    color: ColorUtil.main,
    fontSize: 14,
    fontFamily: 'Pretendard-Bold',
  },

  contactBackdrop: {
    ...StyleSheet.absoluteFillObject,
    top: -2000,
    bottom: -2000,
    left: -2000,
    right: -2000,
  },

  contactPopover: {
    position: 'absolute',
    left: 18,
    right: 18,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F2F6',
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#111',
  },
  contactDesc: {
    fontSize: 13,
    color: '#6C7382',
    marginTop: 6,
    fontFamily: 'Pretendard-Regular',
  },
  contactNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  contactNumberLabel: {
    fontSize: 13,
    color: '#7D8493',
    fontFamily: 'Pretendard-Regular',
  },
  contactNumberValue: {
    fontSize: 15,
    marginLeft: 6,
    color: '#111',
    fontFamily: 'Pretendard-SemiBold',
  },
  contactCopyText: {
    fontSize: 13,
    color: ColorUtil.main,
    marginLeft: 8,
    fontFamily: 'Pretendard-SemiBold',
  },
  contactCallButton: {
    marginTop: 16,
    paddingVertical: 11,
    backgroundColor: ColorUtil.main,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactCallButtonText: {
    color: '#fff',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
  },
});

export default MapDetailItem;
