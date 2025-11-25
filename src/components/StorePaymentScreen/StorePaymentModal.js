import React, {useEffect, useRef, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomText from '../common/CustomText';

export default function StorePaymentModal({
  visible,
  onClose,
  onConfirm,
  onAddCard,
  amount = 0,
  cards = [],
}) {
  const [internalVisible, setInternalVisible] = useState(visible);
  const WINDOW_HEIGHT = Dimensions.get('window').height;
  const translateY = useRef(new Animated.Value(WINDOW_HEIGHT)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [sheetHeight, setSheetHeight] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (internalVisible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: sheetHeight || WINDOW_HEIGHT,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) setInternalVisible(false);
      });
    }
  }, [visible]);

  const currency = (n => (Number(n) || 0).toLocaleString('ko-KR'))(amount);
  const [method, setMethod] = useState('card');

  // Carousel sizes
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const ITEM_WIDTH = Math.round((SCREEN_WIDTH - 28) * 0.6);
  const ITEM_HEIGHT = 140;
  const SPACING = 12;
  const SIDE_PAD = (SCREEN_WIDTH - 28 - ITEM_WIDTH) / 2;

  const data = [
    ...(Array.isArray(cards) ? cards : []),
    {id: '__add__', type: 'add'},
  ];
  const [index, setIndex] = useState(0);

  return (
    <Modal
      visible={internalVisible}
      statusBarTranslucent={true}
      transparent
      animationType="slide"
      hardwareAccelerated
      presentationStyle="overFullScreen">
      <Animated.View style={[styles.overlay, {opacity: fade}]}>
        <TouchableOpacity
          style={{flex: 1}}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>
      <Animated.View
        onLayout={e => setSheetHeight(e.nativeEvent.layout.height)}
        style={[
          styles.sheet,
          {transform: [{translateY}]},
          {
            paddingBottom:
              Platform.OS === 'android'
                ? insets.bottom + 20
                : insets.bottom + 10,
          },
        ]}>
        <CustomText style={styles.title}>결제수단</CustomText>

        <View style={styles.cardBlock}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.methodRow}
            onPress={() => setMethod('card')}>
            <Ionicons
              name={method === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={method === 'card' ? '#3CBBFF' : '#94A3B8'}
            />
            <CustomText style={styles.methodText}>신용/체크카드</CustomText>
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* 카드 캐러?� */}
          <FlatList
            data={data}
            keyExtractor={(item, i) => String(item?.id ?? i)}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={data.length > 1}
            bounces={false}
            contentContainerStyle={{
              paddingHorizontal: SIDE_PAD,
              paddingVertical: 14,
            }}
            ItemSeparatorComponent={() => <View style={{width: SPACING}} />}
            snapToInterval={ITEM_WIDTH + SPACING}
            decelerationRate="fast"
            snapToAlignment="start"
            onMomentumScrollEnd={e => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / (ITEM_WIDTH + SPACING));
              setIndex(Math.max(0, Math.min(idx, data.length - 1)));
            }}
            renderItem={({item}) => {
              if (item.type === 'add') {
                return (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.addCardBox,
                      {width: ITEM_WIDTH, height: ITEM_HEIGHT},
                    ]}
                    onPress={onAddCard}>
                    <Ionicons name="add" size={22} color="#6B7280" />
                    <CustomText style={styles.addCardText}>
                      카드 추가
                    </CustomText>
                  </TouchableOpacity>
                );
              }
              return (
                <View
                  style={[
                    styles.cardItem,
                    item.brand === 'KB' && {backgroundColor: '#8A8076'},
                    item.brand === 'KAKAOBANK' && {backgroundColor: '#C1C2C6'},
                    {width: ITEM_WIDTH, height: ITEM_HEIGHT},
                  ]}>
                  <View style={{position: 'absolute', top: 12, right: 14}}>
                    <Ionicons
                      name="sparkles-outline"
                      size={18}
                      color="#ffffff"
                    />
                  </View>
                  <CustomText style={styles.cardTitle} numberOfLines={1}>
                    {item.label ||
                      `${item.brand ?? '카드'} ${
                        item.last4 ? `사용불가${item.last4}` : ''
                      }`}
                  </CustomText>
                  {item.disabled ? (
                    <View style={styles.badge}>
                      <CustomText style={styles.badgeText}>사용불가</CustomText>
                    </View>
                  ) : null}
                </View>
              );
            }}
          />

          {/* ?�이지 ?�디케?�터 */}
          <View style={styles.dotsWrap}>
            {data.map((_, i) => (
              <View
                key={`dot-${i}`}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* ?�단 ?�약 �?버튼 */}
        <View style={styles.summaryWrap}>
          <CustomText style={styles.summaryLabel}>예상 결제 금액</CustomText>
          <CustomText style={styles.summaryAmount}>{currency}</CustomText>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={onClose}>
            <CustomText style={[styles.actionText, styles.cancelText]}>
              취소
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.applyBtn]}
            onPress={onConfirm}
            activeOpacity={0.9}>
            <CustomText style={[styles.actionText, styles.applyText]}>
              결제
            </CustomText>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    // paddingBottom: Platform.select({ios: 24, android: 28}),
  },
  title: {
    fontSize: 17,
    color: '#0F172A',
    fontFamily: 'Pretendard-Bold',
    paddingHorizontal: 18,
    marginVertical: 20,
  },
  cardBlock: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  methodText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  divider: {height: 1, backgroundColor: '#F1F5F9', marginVertical: 8},
  addCardBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  addCardText: {marginTop: 6, color: '#6B7280', fontSize: 14},
  cardItem: {
    borderRadius: 16,
    backgroundColor: '#b4e0f1ff',
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  cardTitle: {color: '#fff', fontSize: 16, fontWeight: '800'},
  badge: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {color: '#fff', fontSize: 12, fontWeight: '700'},
  dotsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 4,
    gap: 6,
  },
  dot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1'},
  dotActive: {width: 16, backgroundColor: '#111827'},
  summaryWrap: {
    marginTop: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {fontSize: 14, color: '#475569', fontWeight: '700'},
  summaryAmount: {fontSize: 18, color: '#0F172A', fontWeight: '800'},
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    marginTop: 14,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f5f5f5',
  },
  applyBtn: {backgroundColor: '#3CBBFF', flex: 2},
  actionText: {fontSize: 16},
  cancelText: {color: '#666', fontFamily: 'Pretendard-Medium', fontSize: 14},
  applyText: {color: '#FFFFFF', fontFamily: 'Pretendard-SemiBold'},
});
