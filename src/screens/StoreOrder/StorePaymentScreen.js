import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

// ----- utils -----
const formatCurrency = n => (Number(n) || 0).toLocaleString('ko-KR');

const ensureArray = v => (Array.isArray(v) ? v : []);

const parsePrice = price => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const numeric = price.replace(/[^0-9]/g, '');
    return numeric ? Number(numeric) : 0;
  }
  return 0;
};

const CartItemRow = ({item, onInc, onDec, onRemove}) => {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}원</Text>
      </View>

      <View style={styles.itemControls}>
        <TouchableOpacity
          accessibilityLabel="감소"
          onPress={onDec}
          style={[styles.qtyBtn]}
          activeOpacity={0.8}>
          {item.quantity === 1 ? (
            <Feather name="trash-2" size={16} color="#1F2937" />
          ) : (
            <Feather name="minus" size={16} color="#1F2937" />
          )}
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity
          accessibilityLabel="증가"
          onPress={onInc}
          style={styles.qtyBtn}
          activeOpacity={0.8}>
          <Feather name="plus" size={18} color="#111827" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const StorePaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const {
    storeId,
    storeName,
    visitTime,
    peopleCount,
    requestNote: initialRequestNote = '',
    totalPrice: initialTotalPrice,
    menus = [],
    alcohols = [],
  } = route.params ?? {};

  // 수령 방식: dine-in(매장 이용) | pickup(가져갈게요)
  const [receiveMethod, setReceiveMethod] = useState('pickup');
  const [requestNote, setRequestNote] = useState(initialRequestNote);

  // 장바구니 아이템을 단일 배열로 관리 (type으로 구분)
  const [cartItems, setCartItems] = useState(() => {
    const m = ensureArray(menus).map(it => ({
      id: it.id,
      name: it.name,
      price: parsePrice(it.price),
      quantity: it.quantity ?? 1,
      type: 'menu',
    }));
    const a = ensureArray(alcohols).map(it => ({
      id: it.id,
      name: it.name,
      price: parsePrice(it.price),
      quantity: it.quantity ?? 1,
      type: 'alcohol',
    }));
    return [...m, ...a];
  });

  // 총 금액 계산 (수량 0인 항목은 자동 제외되므로 필터링 불필요)
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, it) => sum + parsePrice(it.price) * it.quantity,
      0,
    );
  }, [cartItems]);

  // 인원수 1명 초과면 1인 금액 표시
  const perPerson = useMemo(() => {
    const num = Number(peopleCount);
    if (!Number.isFinite(num) || num <= 1 || totalPrice <= 0) return undefined;
    return Math.round(totalPrice / num);
  }, [peopleCount, totalPrice]);

  const changeQty = useCallback((id, delta) => {
    setCartItems(prev => {
      const next = prev
        .map(it =>
          it.id === id
            ? {...it, quantity: Math.max(0, (it.quantity || 0) + delta)}
            : it,
        )
        .filter(it => it.quantity > 0); // 수량 0이면 자동 삭제
      return next;
    });
  }, []);

  const removeItem = useCallback(id => {
    setCartItems(prev => prev.filter(it => it.id !== id));
  }, []);

  const handleAddMore = () => {
    // 메뉴 추가하러 이전 화면으로 이동
    navigation.goBack();
  };

  const handlePay = () => {
    // TODO: 실제 결제 연동 지점
    // 현재는 페이로드만 구성해서 콘솔 출력
    const payload = {
      storeId,
      storeName,
      visitTime,
      peopleCount,
      requestNote,
      receiveMethod,
      totalPrice,
      items: cartItems.map(({id, name, price, quantity, type}) => ({
        id,
        name,
        price,
        quantity,
        type,
      })),
    };
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('(PAY) ORDER_PAYLOAD', payload);
    }
    // 결제 화면/PG로 이동하거나 성공 토스트 등 연결 지점
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}>
      <ScrollView
        contentContainerStyle={{paddingBottom: 24 + insets.bottom + 140}}
        showsVerticalScrollIndicator={false}>
        {/* 매장 정보 + 지도 */}
        <View style={styles.section}>
          <View style={styles.storeCard}>
            <View style={styles.mapThumb}>
              {/* 지도 썸네일 대체 박스 */}
              <Ionicons name="map-outline" size={18} color="#6B7280" />
              <Text style={styles.mapText}>지도</Text>
            </View>
            <View style={styles.storeInfo}>
              <View style={styles.storeInfoHeader}>
                <Text style={styles.storeName} numberOfLines={1}>
                  {storeName || '매장명 미지정'}
                </Text>
                {visitTime && peopleCount ? (
                  <Text style={styles.storeMeta}>
                    {visitTime} · {peopleCount}명
                  </Text>
                ) : null}
              </View>
              <Text style={styles.storeAddress} numberOfLines={1}>
                주소정보는 추후 연동 예정
              </Text>
            </View>
          </View>
        </View>

        {/* 주문 상품 리스트 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>주문 내역</Text>
          <View style={styles.card}>
            {cartItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="cart-outline" size={20} color="#9AA2AE" />
                <Text style={styles.emptyText}>담긴 상품이 없습니다.</Text>
              </View>
            ) : (
              cartItems.map(it => (
                <View key={`${it.type}-${it.id}`}>
                  <CartItemRow
                    item={it}
                    onInc={() => changeQty(it.id, +1)}
                    onDec={() => changeQty(it.id, -1)}
                    onRemove={() => removeItem(it.id)}
                  />
                </View>
              ))
            )}

            {/* 메뉴 더 담기 */}
            <TouchableOpacity
              style={styles.addMoreBtn}
              onPress={handleAddMore}
              activeOpacity={0.85}>
              <Ionicons name="add-circle-outline" size={18} color="#3B82F6" />
              <Text style={styles.addMoreText}>메뉴 더 담기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 요청사항 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>요청 사항</Text>
          <View style={styles.card}>
            <TextInput
              placeholder="매장에 전달할 요청사항이 있다면 입력해주세요"
              value={requestNote}
              onChangeText={setRequestNote}
              style={styles.noteInput}
              placeholderTextColor="#9AA2AE"
              multiline
            />
          </View>
        </View>
      </ScrollView>

      {/* 하단 결제 영역 */}
      <View style={[styles.footerWrap, {paddingBottom: insets.bottom + 10}]}>
        <View style={styles.footerTermsWrap}>
          <Text style={styles.footerTerms}>
            결제 진행 시 이용약관 및 개인정보 처리방침에 동의한 것으로
            간주됩니다.
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.payBtn,
            cartItems.length === 0 && styles.payBtnDisabled,
          ]}
          disabled={cartItems.length === 0}
          onPress={handlePay}
          activeOpacity={0.9}>
          <Text style={styles.payBtnText}>
            {cartItems.length === 0
              ? '상품을 담아주세요'
              : `${formatCurrency(totalPrice)}원 결제하기`}
          </Text>
          {/* {perPerson ? (
            <Text style={styles.payBtnSubText}>
              1인당 약 {formatCurrency(perPerson)}원 · {peopleCount}명 기준
            </Text>
          ) : null} */}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FFFFFF'},
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Pretendard-SemiBold',
  },

  section: {
    marginTop: 18,
    paddingHorizontal: 18,
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2933',
    marginBottom: 10,
    marginLeft: 3,
  },

  tabs: {flexDirection: 'row'},
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  tabBtnActive: {
    backgroundColor: '#E8F7FF',
    borderColor: '#45C9FF',
  },
  tabText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Pretendard-Medium',
  },
  tabTextActive: {
    color: '#45C9FF',
  },

  // Store card
  storeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
  },
  mapThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mapText: {fontSize: 10, color: '#6B7280', marginTop: 2},
  storeInfo: {flex: 1},
  storeInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Pretendard-SemiBold',
    flex: 1,
    paddingRight: 8,
  },
  storeMeta: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
  },
  storeAddress: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 3,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 12,
    marginHorizontal: 12,
  },
  itemName: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Pretendard-Medium',
  },
  itemPrice: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
  },

  itemControls: {
    height: 30,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#F4F4F4',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',

    marginHorizontal: 12,
  },
  qtyBtn: {
    height: 30,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#F4F4F4',
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
  },
  qtyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#111827',
    paddingHorizontal: 15,
    fontFamily: 'Pretendard-Medium',
  },
  trashBtn: {marginLeft: 8, padding: 6},

  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  addMoreText: {
    marginLeft: 6,
    color: '#3B82F6',
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
  },

  // Note input
  noteInput: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 80,
    fontSize: 13,
    color: '#111827',
    fontFamily: 'Pretendard-Regular',
  },

  // Empty
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {marginTop: 6, color: '#9AA2AE', fontSize: 12},

  // Footer
  footerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerTermsWrap: {paddingHorizontal: 2, marginBottom: 8},
  footerTerms: {
    fontSize: 11,
    color: '#9AA2AE',
    textAlign: 'center',
    lineHeight: 16,
  },
  payBtn: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnDisabled: {backgroundColor: '#CBD5E1'},
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  payBtnSubText: {color: '#FFFFFF', opacity: 0.9, marginTop: 4, fontSize: 12},
});

export default StorePaymentScreen;
