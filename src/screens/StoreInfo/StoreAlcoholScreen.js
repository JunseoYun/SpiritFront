import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import AlcoholItem from '../../components/StoreAlcoholScreen/AlcoholItem';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import {DrinkUpdateSort} from '../../api/drinkApi';
import {useToast} from '../../context/ToastContext';
import useCustomAlert from '../../hooks/useCustomAlert';
import Loading from '../../hooks/Loading';
import CustomText from '../../utils/CustomText';

const ORDER_SPACER_HEIGHT = 0;

const alcoholMapping = {
  SOJU: '소주',
  BEER: '맥주',
  MAKGEOLLI: '막걸리',
  TRADITIONAL: '전통주',
  HIGHBALL: '하이볼',
  WINE: '와인',
  COCKTAIL: '칵테일',
  SAKE: '사케',
  KAOLIANG: '고량주',
  WHISKEY: '위스키',
  VODKA: '보드카',
  TEQUILA: '데킬라',
};
const ALCOHOL_TYPE_SEQUENCE = Object.keys(alcoholMapping);

const ensureAlcoholTypeKey = type => {
  if (ALCOHOL_TYPE_SEQUENCE.includes(type)) {
    return type;
  }
  return type || 'UNKNOWN';
};

const getMainDrinkTypeSet = (mainDrinks = []) =>
  new Set(
    (mainDrinks || [])
      .map(drink => ensureAlcoholTypeKey(drink?.type))
      .filter(type => type && type !== 'UNKNOWN'),
  );

const buildTypeSequence = mainDrinks => {
  const prioritizedSet = getMainDrinkTypeSet(mainDrinks);
  if (!prioritizedSet.size) {
    return ALCOHOL_TYPE_SEQUENCE;
  }

  const prioritized = ALCOHOL_TYPE_SEQUENCE.filter(type =>
    prioritizedSet.has(type),
  );
  const remainder = ALCOHOL_TYPE_SEQUENCE.filter(
    type => !prioritizedSet.has(type),
  );
  return [...prioritized, ...remainder];
};

const groupAlcoholsByType = (list = []) =>
  list.reduce((acc, alcohol) => {
    const typeKey = ensureAlcoholTypeKey(alcohol.type);
    acc[typeKey] = acc[typeKey] ? [...acc[typeKey], alcohol] : [alcohol];
    return acc;
  }, {});

const getOrderedTypeKeys = (
  grouped,
  typeSequence = ALCOHOL_TYPE_SEQUENCE,
) => [
  ...typeSequence.filter(type => grouped[type]?.length),
  ...Object.keys(grouped).filter(
    type => !typeSequence.includes(type) && grouped[type]?.length,
  ),
];

const flattenGroupedAlcohols = (grouped, typeSequence) =>
  getOrderedTypeKeys(grouped, typeSequence).reduce(
    (acc, type) => [...acc, ...(grouped[type] || [])],
    [],
  );

const normalizeAlcoholList = (list, typeSequence) =>
  flattenGroupedAlcohols(groupAlcoholsByType(list), typeSequence);

const mergeAlcoholListWithServer = (currentList, serverList) => {
  if (!Array.isArray(currentList) || currentList.length === 0) {
    return serverList;
  }

  const serverMap = new Map(serverList.map(item => [item.id, item]));

  const preserved = currentList
    .map(item => serverMap.get(item.id) || null)
    .filter(Boolean);

  const preservedIds = new Set(preserved.map(item => item.id));
  const appended = serverList.filter(item => !preservedIds.has(item.id));

  return [...preserved, ...appended];
};

const getDrinkIdsInApiOrder = (list, typeSequence) =>
  flattenGroupedAlcohols(groupAlcoholsByType(list), typeSequence).map(
    drink => drink.id,
  );

const areOrdersEqual = (currentList = [], baseList = []) => {
  if (!Array.isArray(currentList) || !Array.isArray(baseList)) {
    return false;
  }
  if (currentList.length !== baseList.length) {
    return false;
  }
  return currentList.every((item, index) => item?.id === baseList[index]?.id);
};

export const AlcoholTypeRadioGroup = ({
  types,
  selectedType,
  onSelect,
  containerStyle,
  ...wrapperProps
}) => {
  if (!types?.length) {
    return null;
  }
  const {style: wrapperStyle, ...restProps} = wrapperProps;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View
        style={[styles.radioGroup, containerStyle, wrapperStyle]}
        {...restProps}>
        {['전체', ...types].map(type => (
          <Pressable
            key={type}
            style={styles.radioItem}
            hitSlop={10}
            onPress={() => onSelect?.(type)}>
            <View
              style={[
                styles.radioCircle,
                selectedType === type && styles.radioSelectedCircle,
              ]}>
              {selectedType === type && <View style={styles.radioInnerDot} />}
            </View>
            <CustomText
              style={[
                styles.radioLabel,
                selectedType === type && styles.radioLabelSelected,
              ]}>
              {type}
            </CustomText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

const StoreAlcoholScreen = ({
  navigation,
  storeId,
  alcohols = [],
  mainDrinks = [],
  setSectionPositions: setParentSectionPositions, // 상위에서 섹션 위치 관리 함수
  isUpdatable = false,
  isOrderEnabled,
  onAlcoholUpdateComplete = null,
  selectedType: controlledType,
  onTypeChange,
  hideTypeFilter = false,
  onAvailableTypesChange,
  typeFilterProps = {},
  onSortDirtyChange,
  setAlcoholtopheight,
}) => {
  const typeSequence = useMemo(
    () => buildTypeSequence(mainDrinks),
    [mainDrinks],
  );
  const [alcoholList, setAlcoholList] = useState(() =>
    normalizeAlcoholList(alcohols, typeSequence),
  );
  const [isSortDirty, setIsSortDirty] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const isSortDirtyRef = useRef(false);
  const [uncontrolledType, setUncontrolledType] = useState('전체');
  const normalizedAlcohols = useMemo(
    () => normalizeAlcoholList(alcohols, typeSequence),
    [alcohols, typeSequence],
  );
  const {bottom: androidBottom} = useSafeAndroidInsets();
  const {bottom: safeBottom} = useSafeAreaInsets();
  const bottomInset =
    Platform.OS === 'android' ? androidBottom + 30 : safeBottom;
  const {translateAlcohol} = useTranslateAlcohol();
  const toastContext = useToast();
  const showToast = toastContext?.showToast;
  const {showAlert, AlertComponent} = useCustomAlert();
  const containerPaddingBottom = isOrderEnabled
    ? ORDER_SPACER_HEIGHT + bottomInset
    : bottomInset;

  useEffect(() => {
    isSortDirtyRef.current = isSortDirty;
  }, [isSortDirty]);

  useEffect(() => {
    setAlcoholList(prevList => {
      if (
        isSortDirtyRef.current &&
        Array.isArray(prevList) &&
        prevList.length
      ) {
        return mergeAlcoholListWithServer(prevList, normalizedAlcohols);
      }
      return normalizedAlcohols;
    });
  }, [normalizedAlcohols]);

  const groupedSections = useMemo(() => {
    const grouped = groupAlcoholsByType(alcoholList);
    return getOrderedTypeKeys(grouped, typeSequence).map(typeKey => ({
      typeKey,
      label: translateAlcohol(typeKey) || alcoholMapping[typeKey] || typeKey,
      items: grouped[typeKey] || [],
    }));
  }, [alcoholList, translateAlcohol, typeSequence]);

  const availableTypes = useMemo(
    () => groupedSections.map(section => section.label),
    [groupedSections],
  );

  const isTypeControlled =
    typeof controlledType === 'string' && typeof onTypeChange === 'function';
  const currentType = isTypeControlled ? controlledType : uncontrolledType;

  const handleTypeSelect = type => {
    if (isTypeControlled) {
      onTypeChange(type);
    } else {
      setUncontrolledType(type);
    }
  };

  useEffect(() => {
    if (currentType !== '전체' && !availableTypes.includes(currentType)) {
      if (isTypeControlled) {
        onTypeChange?.('전체');
      } else {
        setUncontrolledType('전체');
      }
    }
  }, [availableTypes, currentType, isTypeControlled, onTypeChange]);

  useEffect(() => {
    onAvailableTypesChange?.(availableTypes);
  }, [availableTypes, onAvailableTypesChange]);

  const filteredSections =
    currentType === '전체'
      ? groupedSections
      : groupedSections.filter(section => section.label === currentType);

  const moveItem = (alcoholId, direction, type) => {
    if (!Array.isArray(alcoholList)) {
      return;
    }

    const grouped = groupAlcoholsByType(alcoholList);
    const typeKey = ensureAlcoholTypeKey(type);
    const targetGroup = grouped[typeKey] || [];
    if (targetGroup.length === 0) {
      return;
    }

    const currentIndex = targetGroup.findIndex(item => item.id === alcoholId);
    if (currentIndex === -1) {
      return;
    }

    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= targetGroup.length) {
      if (typeof showToast === 'function') {
        showToast(
          direction > 0
            ? '이 이상 아래로 움직일 수 없습니다.'
            : '이 이상 위로 움직일 수 없습니다.',
        );
      }
      return;
    }

    const updatedGroup = [...targetGroup];
    const [movedItem] = updatedGroup.splice(currentIndex, 1);
    updatedGroup.splice(newIndex, 0, movedItem);
    grouped[typeKey] = updatedGroup;

    const updatedList = flattenGroupedAlcohols(grouped, typeSequence);
    setAlcoholList(updatedList);
    setIsSortDirty(!areOrdersEqual(updatedList, normalizedAlcohols));
  };

  const handleSaveOrder = useCallback(async () => {
    if (isSavingOrder || !isSortDirty || !storeId) {
      return;
    }

    try {
      setIsSavingOrder(true);
      await DrinkUpdateSort(
        storeId,
        getDrinkIdsInApiOrder(alcoholList, typeSequence),
      );
      setIsSortDirty(false);
      showToast?.('주류 순서를 저장했어요.', 'center');
    } catch (error) {
      showToast?.('순서 저장에 실패했어요. 다시 시도해주세요.', 'center');
    } finally {
      setIsSavingOrder(false);
    }
  }, [alcoholList, isSavingOrder, isSortDirty, showToast, storeId, typeSequence]);

  const handleAlcoholManagePress = () => {
    navigation.navigate('StoreStack', {
      screen: 'AlcoholEditScreen',
      params: {storeId},
    });
    if (typeof onAlcoholUpdateComplete === 'function') {
      const unsubscribe = navigation.addListener('focus', async () => {
        await onAlcoholUpdateComplete();
        unsubscribe();
      });
    }
  };

  useEffect(() => {
    if (typeof onSortDirtyChange === 'function') {
      onSortDirtyChange(isSortDirty);
    }
  }, [isSortDirty, onSortDirtyChange]);

  useEffect(() => {
    return () => {
      if (typeof onSortDirtyChange === 'function') {
        onSortDirtyChange(false);
      }
    };
  }, [onSortDirtyChange]);

  useEffect(() => {
    if (!isUpdatable || !navigation?.addListener) {
      return;
    }

    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (!isSortDirtyRef.current) {
        return;
      }

      e.preventDefault();
      showAlert({
        title: '주류 순서가 저장되지 않았습니다.',
        message: '뒤로 가시겠습니까?',
        onConfirm: () => {
          navigation.dispatch(e.data.action);
        },
        onCancel: null,
        type: 'confirm',
      });
    });

    return unsubscribe;
  }, [isUpdatable, navigation, showAlert]);

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, {paddingBottom: containerPaddingBottom}]}>
      {/* 주류 리스트 */}
      {/* 내부 ScrollView 제거하고 View로 감싸기 */}
      {isUpdatable && (
        <View
          style={{marginTop: 10}}
          onLayout={e => setAlcoholtopheight(e.nativeEvent.layout.height)}>
          <Pressable
            style={styles.reorderButton}
            onPress={handleAlcoholManagePress}>
            <CustomText style={styles.alcoholAddButtonText}>
              주류 추가
            </CustomText>
          </Pressable>

          {alcoholList?.length > 0 && (
            <Pressable
              style={[
                styles.saveOrderButton,
                (!isSortDirty || isSavingOrder) &&
                  styles.saveOrderButtonDisabled,
              ]}
              disabled={!isSortDirty || isSavingOrder}
              onPress={handleSaveOrder}>
              <CustomText
                style={[
                  styles.saveOrderText,
                  (!isSortDirty || isSavingOrder) &&
                    styles.saveOrderButtonDisabledText,
                ]}>
                순서 저장
              </CustomText>
            </Pressable>
          )}
        </View>
      )}
      {availableTypes.length > 0 && !hideTypeFilter && isUpdatable && (
        <AlcoholTypeRadioGroup
          types={availableTypes}
          selectedType={currentType}
          onSelect={handleTypeSelect}
          {...typeFilterProps}
        />
      )}
      <View style={{flex: 1}}>
        {filteredSections.map(section => (
          <View
            key={section.typeKey}
            onLayout={e => {
              if (typeof setParentSectionPositions === 'function') {
                const y = e.nativeEvent.layout.y;
                setParentSectionPositions(prev => ({
                  ...(prev || {}),
                  [section.label]: y,
                }));
              }
            }}>
            {currentType === '전체' && (
              <CustomText style={styles.typeLabel}>{section.label}</CustomText>
            )}
            {section.items.map((alcohol, idx) => (
              <AlcoholItem
                key={alcohol.id}
                alcohol={alcohol}
                storeId={storeId}
                navigation={navigation}
                isUpdatable={isUpdatable}
                onAlcoholUpdateComplete={onAlcoholUpdateComplete}
                onMoveUp={() => moveItem(alcohol.id, -1, alcohol.type)}
                onMoveDown={() => moveItem(alcohol.id, 1, alcohol.type)}
                isLast={idx === section.items.length - 1}
              />
            ))}
            <View style={styles.line} />
          </View>
        ))}

        {alcoholList?.length === 0 && (
          <View style={styles.footer}>
            <CustomText style={styles.emptyText}>
              등록된 주류가 없어요
            </CustomText>
          </View>
        )}
      </View>
      <AlertComponent />
      <Loading loading={isSavingOrder} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  reorderButton: {
    backgroundColor: '#F1F2F3',
    padding: 12,
    marginHorizontal: 18,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  alcoholAddButtonText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },
  tabContainer: {
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  tabButton: {
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginBottom: 5,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
  typeLabel: {
    fontSize: 20,
    color: '#999',
    marginLeft: 18,
    fontFamily: 'Pretendard-SemiBold',
    marginTop: 10,
    marginBottom: 5,
  },
  line: {
    height: 7,
    backgroundColor: '#F2F2F2',
    marginBottom: 10,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
    color: '#c0c0c0',
  },
  addImageButton: {
    marginTop: 20,
    marginHorizontal: 18,
    paddingTop: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addImageText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircle: {
    width: 15,
    height: 15,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  radioSelectedCircle: {
    borderColor: '#3CBBFF',
  },
  radioInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#3CBBFF',
  },
  radioLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  radioLabelSelected: {
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  saveOrderButton: {
    backgroundColor: '#fff',
    borderColor: '#3CBBFF',
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 18,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
  },
  saveOrderButtonDisabled: {
    backgroundColor: '#fff',
    borderColor: '#D0D4DB',

    opacity: 0.5,
  },
  saveOrderText: {
    fontSize: 14,
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Bold',
  },
  saveOrderButtonDisabledText: {
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
});

export default StoreAlcoholScreen;
