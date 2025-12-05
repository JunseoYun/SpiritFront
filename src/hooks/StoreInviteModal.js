import React, {useState, useEffect, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  getby_manager_invitation_preview,
  get_store_manager_invitation_accept,
} from '../api/storeApi';
import Loading from './Loading';
import {useToast} from '../context/ToastContext';
import LinearGradient from 'react-native-linear-gradient';
import {navigationRef} from '../navigation/NavigationService';
import CustomText from '../utils/CustomText';

const {width} = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.88, 420);
const COVER_HEIGHT = Math.round(CARD_WIDTH * 0.56);

const StoreInviteModal = ({storeInviteId, isShowStoreInvite, onDismiss}) => {
  if (!isShowStoreInvite) return null;

  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const {showToast} = useToast();

  // 진입 애니메이션
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  const runInAnim = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const previewDataLoad = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getby_manager_invitation_preview(storeInviteId);
      setPreviewData(data);
    } catch (e) {
      console.error(e);
      setPreviewData(null);
      onDismiss();
      showToast('초대가 만료되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isShowStoreInvite || !storeInviteId) return;
    let isActive = true;
    (async () => {
      await previewDataLoad();
      if (isActive) runInAnim();
    })();
    return () => {
      isActive = false;
    };
    // storeInviteId 변경 시 재호출
  }, [storeInviteId]);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await get_store_manager_invitation_accept(storeInviteId);
    } catch (error) {
      if (error.response.data.code === 22036) {
        showToast('이미 해당 매장을 관리하고 있습니다.');
      }
    } finally {
      setLoading(false);
      onDismiss();
      navigationRef.reset({
        index: 0, // 최상단 활성 스택
        routes: [
          {
            name: 'MainBtmbar', // 최상위 BottomTab
            state: {
              index: 0, // MyStack 탭을 선택
              routes: [
                {
                  name: 'MyStack', // MyStack 안으로
                  state: {
                    index: 0,
                    routes: [
                      {
                        name: 'MyScreen', // 최종 화면
                        params: {invitationManager: true},
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      });
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}>
      <View style={styles.overlay} />

      <View style={styles.centerWrap} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
          ]}>
          {/* 커버 이미지 */}
          {!loading && previewData && !loadError && (
            <View style={styles.coverWrap}>
              <FastImage
                source={
                  previewData?.storeImage
                    ? {uri: previewData.storeImage}
                    : require('../assets/default_store6.png')
                }
                style={styles.coverImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              <LinearGradient
                colors={
                  previewData?.storeImage
                    ? ['transparent', 'rgba(0, 0, 0, 0.5)'] // 위는 투명, 아래는 어두움
                    : ['transparent', 'rgba(0, 0, 0, 0.3)']
                }
                style={[styles.gradientBottom, {height: COVER_HEIGHT * 0.7}]}
                pointerEvents="none"
              />

              <View style={styles.coverTextWrap}>
                <CustomText style={styles.storeName} numberOfLines={1}>
                  {previewData?.storeName ?? '가게 정보'}
                </CustomText>
              </View>
            </View>
          )}

          {/* 본문 */}
          {!loading && previewData && !loadError && (
            <View style={styles.body}>
              <CustomText style={styles.subtitle} numberOfLines={1}>
                운영진 초대
              </CustomText>
              <CustomText style={styles.message} numberOfLines={3}>
                {previewData?.storeName} 매장의 운영진으로 초대되었습니다.{`\n`}
                초대를 수락하면 {previewData?.storeName} 매장을 관리할 수
                있습니다.
              </CustomText>

              <View style={styles.ctaRow}>
                <TouchableOpacity
                  onPress={onDismiss}
                  accessibilityRole="button"
                  accessibilityLabel="초대 거절"
                  style={[styles.btn, styles.btnOutline]}
                  activeOpacity={0.8}>
                  <CustomText style={[styles.btnText, styles.btnOutlineText]}>
                    거절
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAccept}
                  accessibilityRole="button"
                  accessibilityLabel="초대 수락"
                  style={[styles.btn, styles.btnPrimary]}
                  activeOpacity={0.9}>
                  <CustomText style={[styles.btnText, styles.btnPrimaryText]}>
                    수락
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      <Loading loading={loading} />
      <View
        style={{
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        }}
      />
    </Modal>
  );
};

export default StoreInviteModal;

const BRAND = '#3CBBFF';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,16,20,0.55)',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 10},
    elevation: 6,
  },
  coverWrap: {
    width: '100%',
    height: COVER_HEIGHT,
    position: 'relative',
    backgroundColor: '#f3f4f6',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: COVER_HEIGHT / 2, // 아래 절반
    zIndex: 1,
  },

  coverDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  coverTextWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    zIndex: 3,
  },
  storeName: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },

  body: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },

  message: {
    fontSize: 16,
    lineHeight: 22,
    color: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Pretendard-Regular',
  },
  ctaRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  ctaRowSingle: {
    flexDirection: 'row',
    marginTop: 6,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 7,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16,
    color: '#121212',
    fontFamily: 'Pretendard-SemiBold',
  },
  btnPrimary: {
    backgroundColor: BRAND,
    borderColor: BRAND,
    flex: 1,
  },
  btnPrimaryText: {
    color: '#fff',
  },
  btnOutline: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  btnOutlineText: {
    color: '#666',
    fontFamily: 'Pretendard-Medium',
  },
});
