import React, {
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import {StoreMenuget} from '../../api/menuApi';
import {StoreDrinkget} from '../../api/drinkApi';
import {useToast} from '../../context/ToastContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import OrderFooter from '../../components/StoreOrderScreen/OrderFooter';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';

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

const ALCOHOL_TYPE_ORDER = [
  'SOJU',
  'BEER',
  'MAKGEOLLI',
  'TRADITIONAL',
  'HIGHBALL',
  'WINE',
  'COCKTAIL',
  'SAKE',
  'KAOLIANG',
  'WHISKEY',
  'VODKA',
  'TEQUILA',
];

const StoreOrderScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {showToast} = useToast();
  const insets = useSafeAreaInsets();
  const {translateAlcohol} = useTranslateAlcohol();
  const {
    storeId,
    storeName,
    visitTime,
    peopleCount,
    initialMenus = [],
    initialAlcohols = [],
    mainDrinkDtos = [],
  } = route.params ?? {};

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

  useLayoutEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

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

  const totalMenuCount = useMemo(
    () => calculateSectionCount(menuItems),
    [menuItems],
  );
  const totalAlcoholCount = useMemo(
    () => calculateSectionCount(alcoholItems),
    [alcoholItems],
  );
  const sortedAlcoholItems = useMemo(() => {
    const items = ensureArray(alcoholItems);
    if (items.length === 0) {
      return items;
    }

    const mainTypes = new Set(
      ensureArray(mainDrinkDtos).map(drink => drink.type),
    );
    const grouped = items.reduce((acc, item) => {
      const type = item.type;
      if (!acc.has(type)) {
        acc.set(type, {main: [], regular: []});
      }
      const bucket = mainTypes.has(type) ? 'main' : 'regular';
      acc.get(type)[bucket].push(item);
      return acc;
    }, new Map());

    const sortedTypes = Array.from(grouped.keys()).sort((a, b) => {
      const aMain = mainTypes.has(a);
      const bMain = mainTypes.has(b);
      if (aMain !== bMain) {
        return aMain ? -1 : 1;
      }
      const indexA = ALCOHOL_TYPE_ORDER.indexOf(a);
      const indexB = ALCOHOL_TYPE_ORDER.indexOf(b);
      const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
      const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
      return safeIndexA - safeIndexB;
    });

    return sortedTypes.flatMap(type => {
      const group = grouped.get(type);
      return [...group.main, ...group.regular];
    });
  }, [alcoholItems, mainDrinkDtos]);
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

  const renderSection = (items, onChange, options = {}) => {
    const {isAlcohol = false, translateAlcohol} = options;

    const list = ensureArray(items);

    return (
      <View style={styles.section}>
        {list.length === 0 ? (
          <Text style={styles.emptyMessage}>등록된 항목이 없습니다.</Text>
        ) : (
          <View>
            {list.map(item => {
              const unitPrice = parsePrice(item.price);
              const formattedPrice =
                typeof item.price === 'string' &&
                !Number.isNaN(Number(item.price))
                  ? `${Number(item.price).toLocaleString()}원`
                  : unitPrice > 0
                  ? `${unitPrice.toLocaleString()}원`
                  : '가격 문의';
              const isSelected = item.quantity > 0;
              let tagLabel;
              if (isAlcohol) {
                const translated = translateAlcohol?.(item.type);
                tagLabel =
                  translated && translated !== '미지정'
                    ? translated
                    : undefined;
              } else {
                const menuType = item.menuType ?? item.type;
                tagLabel = menuType === 'MAIN' ? '대표 메뉴' : undefined;
              }
              const description = item.description?.trim();
              const hasImage =
                typeof item.imgUrl === 'string' &&
                item.imgUrl.trim().length > 0;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    isSelected && styles.itemCardSelected,
                  ]}>
                  <View
                    style={[
                      styles.itemCardBody,
                      !hasImage && styles.itemCardBodyCompact,
                    ]}>
                    <View
                      style={[
                        styles.itemMain,
                        hasImage
                          ? styles.itemMainWithImage
                          : styles.itemMainCompact,
                      ]}>
                      {tagLabel ? (
                        <Text style={styles.itemTagLabel}>{tagLabel}</Text>
                      ) : null}
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {description ? (
                        <Text style={styles.itemDescription} numberOfLines={2}>
                          {description}
                        </Text>
                      ) : null}
                    </View>

                    {hasImage ? (
                      <View
                        style={[
                          styles.itemImageWrapper,
                          isSelected && styles.itemImageWrapperSelected,
                        ]}>
                        <Image
                          source={{uri: item.imgUrl}}
                          style={styles.itemImage}
                          resizeMode="cover"
                        />
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.itemFooter}>
                    <View style={styles.footerPrice}>
                      <Text style={styles.itemPriceText}>{formattedPrice}</Text>
                    </View>

                    {item.quantity === 0 ? (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => onChange(item.id, 1)}
                        activeOpacity={0.92}>
                        <Ionicons name="add" size={16} color="#fff" />
                        <Text style={styles.addButtonLabel}>담기</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          style={[
                            styles.stepperButton,
                            styles.stepperButtonMinus,
                          ]}
                          onPress={() => onChange(item.id, -1)}
                          activeOpacity={0.85}>
                          <Ionicons name="remove" size={16} color="#1F2937" />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={[
                            styles.stepperButton,
                            styles.stepperButtonPlus,
                          ]}
                          onPress={() => onChange(item.id, 1)}
                          activeOpacity={0.85}>
                          <Ionicons name="add" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderTabButton = (key, label, count) => {
    const isActive = activeTab === key;
    const displayCount = count > 99 ? '99+' : count;

    return (
      <TouchableOpacity
        key={key}
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => setActiveTab(key)}
        activeOpacity={0.9}>
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {label}
        </Text>
        <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>
          {displayCount}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={styles.screen}>
      <View
        style={[
          styles.customHeader,
          {
            paddingTop:
              Platform.OS === 'android' ? insets.top + 10 : insets.top,
          },
        ]}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 16, right: 16}}>
          <Ionicons name="arrow-back-outline" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.storeTitle} numberOfLines={1}>
          {storeName || '한잔할까'}
        </Text>
        <View style={styles.headerTabsContainer}>
          {renderTabButton('menu', '메뉴', totalMenuCount)}
          {renderTabButton('alcohol', '주류', totalAlcoholCount)}
        </View>
      </View>

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
        {activeTab === 'menu' && (
          <>
            <View style={styles.sectionHeader}>
              {loadingMenus && (
                <View style={styles.loadingGroup}>
                  <ActivityIndicator size="small" color="#45C9FF" />
                  <Text style={styles.loadingText}>메뉴 갱신 중</Text>
                </View>
              )}
            </View>
            {renderSection(menuItems, updateMenuQuantity)}
          </>
        )}

        {activeTab === 'alcohol' && (
          <>
            <View style={styles.sectionHeader}>
              {loadingAlcohols && (
                <View style={styles.loadingGroup}>
                  <ActivityIndicator size="small" color="#45C9FF" />
                  <Text style={styles.loadingText}>주류 갱신 중</Text>
                </View>
              )}
            </View>
            {renderSection(sortedAlcoholItems, updateAlcoholQuantity, {
              isAlcohol: true,
              translateAlcohol,
            })}
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

      <OrderFooter
        visible={!isRequestFocused}
        safeAreaBottom={insets.bottom}
        visitTime={visitTime}
        peopleIconName={peopleIconName}
        peopleCountLabel={peopleCountLabel}
        totalPrice={totalPrice}
        perPersonPrice={perPersonPrice}
        canSubmit={canSubmit}
        onSubmit={handleSubmitOrder}
        totalMenuCount={totalMenuCount}
        totalAlcoholCount={totalAlcoholCount}
      />
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
    paddingTop: 24,
    paddingBottom: 24,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  storeTitle: {
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 19,
    color: '#0F172A',
    marginRight: 7,
  },
  headerTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 130,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginHorizontal: 2,
  },
  tabButtonActive: {
    backgroundColor: '#E9F5FB',
  },
  tabLabel: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
  tabLabelActive: {
    color: '#45C9FF',
  },
  tabCount: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
  tabCountActive: {
    color: '#45C9FF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2A45',
  },
  loadingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#3B82F6',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
    marginHorizontal: 18,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2933',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#9AA2AE',
  },
  emptyMessage: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#9AA2AE',
  },

  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
  },
  itemCardSelected: {
    borderColor: '#111827',
    backgroundColor: '#F5F6F8',
  },
  itemCardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemCardBodyCompact: {
    alignItems: 'stretch',
  },
  itemImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: 12,
  },
  itemImageWrapperSelected: {
    borderColor: '#111827',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemMain: {
    flex: 1,
  },
  itemMainWithImage: {
    marginRight: 16,
  },
  itemMainCompact: {
    marginRight: 0,
    marginLeft: 0,
  },
  itemTagLabel: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2A37',
  },
  itemDescription: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#6B7280',
  },
  itemFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerPrice: {
    flex: 1,
  },
  itemPriceText: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2A37',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 12,
  },
  addButtonLabel: {
    marginLeft: 6,
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
    color: '#FFFFFF',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginLeft: 12,
  },
  stepperButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonMinus: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  stepperButtonPlus: {
    backgroundColor: '#111827',
  },
  stepperValue: {
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2A37',
  },
  noteSection: {
    marginBottom: 20,
    marginHorizontal: 18,
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
    marginRight: 3,
  },
});

export default StoreOrderScreen;
