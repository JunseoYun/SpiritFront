import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {StoreMenuget} from '../../api/menuApi';
import {StoreDrinkget} from '../../api/drinkApi';
import {useToast} from '../../context/ToastContext';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ensureArray = value => (Array.isArray(value) ? value : []);

const mapWithQuantity = (items, previous = []) => {
  const previousMap = new Map(previous.map(item => [item.id, item.quantity]));
  return ensureArray(items).map(item => ({
    ...item,
    quantity: previousMap.get(item.id) ?? 0,
  }));
};

const parsePrice = price => {
  if (typeof price === 'number') {
    return price;
  }
  if (typeof price === 'string') {
    const numeric = price.replace(/[^0-9]/g, '');
    return numeric ? Number(numeric) : 0;
  }
  return 0;
};

const normalizePeopleCount = value => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const calculateSectionTotal = list =>
  list.reduce(
    (total, item) => total + parsePrice(item.price) * item.quantity,
    0,
  );

const calculateSectionCount = list =>
  list.reduce((total, item) => total + item.quantity, 0);

const StoreOrderScreen = () => {
  const route = useRoute();
  const {showToast} = useToast();
  const insets = useSafeAreaInsets();
  const {
    storeId,
    storeName,
    storeCategories = [],
    visitTime,
    peopleCount,
    initialMenus = [],
    initialAlcohols = [],
  } = route.params ?? {};
  const {translateCategory} = useCategoryTranslation();

  const [menuItems, setMenuItems] = useState(() =>
    mapWithQuantity(initialMenus, []),
  );
  const [alcoholItems, setAlcoholItems] = useState(() =>
    mapWithQuantity(initialAlcohols, []),
  );
  const [requestNote, setRequestNote] = useState('');
  const [isRequestFocused, setIsRequestFocused] = useState(false);
  const [noteSectionOffset, setNoteSectionOffset] = useState(0);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [loadingAlcohols, setLoadingAlcohols] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  const scrollViewRef = useRef(null);
  const bottomBarVisibility = useRef(new Animated.Value(1)).current;
  const bottomBarTranslateY = useMemo(
    () =>
      bottomBarVisibility.interpolate({
        inputRange: [0, 1],
        outputRange: [120, 0],
      }),
    [bottomBarVisibility],
  );

  useEffect(() => {
    Animated.timing(bottomBarVisibility, {
      toValue: isRequestFocused ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [bottomBarVisibility, isRequestFocused]);

  useEffect(() => {
    let isMounted = true;
    if (!storeId) {
      return undefined;
    }

    const refreshMenus = async () => {
      try {
        setLoadingMenus(true);
        const refreshedMenus = await StoreMenuget(storeId);
        if (isMounted) {
          setMenuItems(prev => mapWithQuantity(refreshedMenus, prev));
        }
      } catch (error) {
        console.error('Failed to refresh menus', error);
        if (isMounted) {
          showToast?.('메뉴 정보를 불러오지 못했어요', 'center');
        }
      } finally {
        if (isMounted) {
          setLoadingMenus(false);
        }
      }
    };

    const refreshAlcohols = async () => {
      try {
        setLoadingAlcohols(true);
        const refreshedAlcohols = await StoreDrinkget(storeId);
        if (isMounted) {
          setAlcoholItems(prev => mapWithQuantity(refreshedAlcohols, prev));
        }
      } catch (error) {
        console.error('Failed to refresh alcohols', error);
        if (isMounted) {
          showToast?.('주류 정보를 불러오지 못했어요', 'center');
        }
      } finally {
        if (isMounted) {
          setLoadingAlcohols(false);
        }
      }
    };

    refreshMenus();
    refreshAlcohols();

    return () => {
      isMounted = false;
    };
  }, [storeId, showToast]);

  const categoriesLabel = useMemo(() => {
    if (!storeCategories || storeCategories.length === 0) {
      return '카테고리 정보 없음';
    }
    return storeCategories
      .map(category => translateCategory(category))
      .join(', ');
  }, [storeCategories, translateCategory]);

  const totalMenuCount = useMemo(
    () => calculateSectionCount(menuItems),
    [menuItems],
  );
  const totalAlcoholCount = useMemo(
    () => calculateSectionCount(alcoholItems),
    [alcoholItems],
  );
  const totalPrice = useMemo(() => {
    const menuTotal = calculateSectionTotal(menuItems);
    const alcoholTotal = calculateSectionTotal(alcoholItems);
    return menuTotal + alcoholTotal;
  }, [menuItems, alcoholItems]);

  const peopleCountNumber = useMemo(
    () => normalizePeopleCount(peopleCount),
    [peopleCount],
  );
  const peopleIconName =
    Number.isFinite(peopleCountNumber) && peopleCountNumber > 1
      ? 'people-outline'
      : 'person-outline';
  const peopleCountLabel = Number.isFinite(peopleCountNumber)
    ? `${peopleCountNumber}명`
    : '미지정';
  const perPersonPrice = useMemo(() => {
    if (!Number.isFinite(peopleCountNumber) || peopleCountNumber <= 1) {
      return undefined;
    }
    if (totalPrice <= 0) {
      return undefined;
    }
    return Math.round(totalPrice / peopleCountNumber);
  }, [peopleCountNumber, totalPrice]);

  const canSubmit =
    totalMenuCount > 0 && !submitting && !loadingMenus && !loadingAlcohols;

  const updateMenuQuantity = (id, delta) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id
          ? {...item, quantity: Math.max(0, item.quantity + delta)}
          : item,
      ),
    );
  };

  const updateAlcoholQuantity = (id, delta) => {
    setAlcoholItems(prev =>
      prev.map(item =>
        item.id === id
          ? {...item, quantity: Math.max(0, item.quantity + delta)}
          : item,
      ),
    );
  };

  const handleSubmitOrder = () => {
    if (!canSubmit) {
      if (totalMenuCount === 0) {
        showToast?.('메뉴를 1개 이상 선택해 주세요', 'center');
      }
      return;
    }

    setSubmitting(true);

    const orderedMenus = menuItems
      .filter(item => item.quantity > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parsePrice(item.price),
      }));

    const orderedAlcohols = alcoholItems
      .filter(item => item.quantity > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parsePrice(item.price),
      }));

    if (__DEV__) {
      console.log('ORDER_PAYLOAD', {
        storeId,
        visitTime,
        peopleCount,
        requestNote,
        totalPrice,
        menus: orderedMenus,
        alcohols: orderedAlcohols,
      });
    }

    showToast?.('주문 요청이 준비되었습니다. 연동을 진행해 주세요.', 'center');
    setSubmitting(false);
  };

  const renderSection = (title, items, onChange) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyMessage}>등록된 항목이 없습니다.</Text>
      ) : (
        items.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                {typeof item.price === 'string'
                  ? item.price
                  : `${item.price.toLocaleString()}원`}
              </Text>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity
                style={[
                  styles.counterButton,
                  item.quantity === 0 && styles.counterButtonDisabled,
                ]}
                onPress={() => onChange(item.id, -1)}
                disabled={item.quantity === 0}>
                <Text style={styles.counterButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => onChange(item.id, 1)}>
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={styles.screen}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: 24 + insets.bottom + (isRequestFocused ? 40 : 140),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.metaCard}>
          <Text style={styles.title}>{storeName || '정보 없는 매장'}</Text>
          <Text style={styles.metaText}>{categoriesLabel}</Text>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'menu' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('menu')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'menu' && styles.tabTextActive,
              ]}>
              메뉴 ({totalMenuCount}개)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'alcohol' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('alcohol')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'alcohol' && styles.tabTextActive,
              ]}>
              주류 ({totalAlcoholCount}개)
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'menu' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>메뉴 선택</Text>
              {loadingMenus && (
                <View style={styles.loadingGroup}>
                  <ActivityIndicator size="small" color="#45C9FF" />
                  <Text style={styles.loadingText}>메뉴 갱신 중</Text>
                </View>
              )}
            </View>
            {renderSection('식사 및 안주', menuItems, updateMenuQuantity)}
          </>
        )}

        {activeTab === 'alcohol' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>주류 선택</Text>
              {loadingAlcohols && (
                <View style={styles.loadingGroup}>
                  <ActivityIndicator size="small" color="#45C9FF" />
                  <Text style={styles.loadingText}>주류 갱신 중</Text>
                </View>
              )}
            </View>
            {renderSection('주류', alcoholItems, updateAlcoholQuantity)}
          </>
        )}

        <View
          style={styles.noteSection}
          onLayout={({nativeEvent}) =>
            setNoteSectionOffset(nativeEvent.layout.y)
          }>
          <Text style={styles.sectionTitle}>요청 사항</Text>
          <TextInput
            style={styles.noteInput}
            value={requestNote}
            onChangeText={setRequestNote}
            placeholder="예: 여러 메뉴는 한 번에 내어주시고, 주류는 제가 도착해서 받을게요!"
            placeholderTextColor="#B0B0B0"
            multiline
            maxLength={200}
            textAlignVertical="top"
            onFocus={() => {
              setIsRequestFocused(true);
              requestAnimationFrame(() => {
                scrollViewRef.current?.scrollTo({
                  y: Math.max(0, noteSectionOffset - 20),
                  animated: true,
                });
              });
            }}
            onBlur={() => setIsRequestFocused(false)}
          />
          <Text style={styles.noteCount}>{requestNote.length}/200</Text>
        </View>
      </ScrollView>

      <Animated.View
        pointerEvents={isRequestFocused ? 'none' : 'auto'}
        style={[
          styles.bottomBar,
          {
            opacity: bottomBarVisibility,
            transform: [{translateY: bottomBarTranslateY}],
            paddingBottom:
              Platform.OS === 'android'
                ? insets.bottom + 20
                : insets.bottom + 10,
          },
        ]}>
        <View style={styles.orderMetaRow}>
          <View style={styles.metaChip}>
            <View style={styles.metaIconWrapper}>
              <Ionicons name="time-outline" size={20} color="#1F2937" />
            </View>
            <View style={styles.metaChipText}>
              <Text style={styles.metaChipValue}>{visitTime || '미지정'}</Text>
            </View>
          </View>
          <View style={styles.metaChip}>
            <View style={styles.metaIconWrapper}>
              <Ionicons name={peopleIconName} size={20} color="#1F2937" />
            </View>
            <View style={styles.metaChipText}>
              <Text style={styles.metaChipValue}>{peopleCountLabel}</Text>
            </View>
          </View>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>예상 결제 금액</Text>
          <Text style={styles.totalValue}>
            {totalPrice > 0 ? `${totalPrice.toLocaleString()}원` : '-'}
          </Text>
        </View>
        {perPersonPrice !== undefined && (
          <View style={styles.perPersonRow}>
            <Text style={styles.perPersonLabel}>1인당 예상 금액</Text>
            <Text style={styles.perPersonValue}>
              {`${perPersonPrice.toLocaleString()}원`}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmitOrder}
          disabled={!canSubmit}>
          <Text
            style={[
              styles.submitButtonText,
              !canSubmit && styles.submitButtonTextDim,
            ]}>
            주문 요청하기
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  metaCard: {
    borderWidth: 1,
    borderColor: '#E8F4FA',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    backgroundColor: '#F7FCFF',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    color: '#222',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F6FA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#667085',
  },
  tabTextActive: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#222',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#222',
  },
  loadingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#45C9FF',
    marginLeft: 6,
  },
  section: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 24,
    backgroundColor: '#FAFAFA',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#999',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#222',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#666',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  counterButtonDisabled: {
    backgroundColor: '#F2F2F2',
    borderColor: '#E0E0E0',
  },
  counterButtonText: {
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
  },
  counterValue: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  noteSection: {
    marginBottom: 20,
  },
  noteInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#222',
  },
  noteCount: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#999',
    textAlign: 'right',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#222',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    color: '#45C9FF',
  },
  perPersonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  perPersonLabel: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#4B5563',
  },
  perPersonValue: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2937',
  },
  orderMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 3,
  },
  metaChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    marginLeft: 1,
  },
  metaChipText: {
    flex: 1,
  },
  metaChipLabel: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  metaChipValue: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#1F2937',
  },
  submitButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#45C9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#B6E4F6',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
  submitButtonTextDim: {
    color: '#F0F9FD',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 10,
  },
});

export default StoreOrderScreen;
