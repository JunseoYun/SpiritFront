import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View, Text, Pressable, Platform} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import MenuItem from '../../components/StoreMenuScreen/MenuItem';
import Feather from 'react-native-vector-icons/Feather';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import {MenuUpdateSort} from '../../api/menuApi';
import {useToast} from '../../context/ToastContext';
import useCustomAlert from '../../hooks/useCustomAlert';
import Loading from '../../hooks/Loading';

const ORDER_SPACER_HEIGHT = 0;

const MENU_TYPE_SEQUENCE = ['MAIN', 'NORMAL', 'SIDE'];

const groupMenusByType = (list = []) =>
  list.reduce(
    (acc, menu) => {
      const type = MENU_TYPE_SEQUENCE.includes(menu.menuType)
        ? menu.menuType
        : 'NORMAL';
      acc[type] = acc[type] ? [...acc[type], menu] : [menu];
      return acc;
    },
    {MAIN: [], NORMAL: [], SIDE: []},
  );

const flattenGroupedMenus = grouped =>
  MENU_TYPE_SEQUENCE.reduce(
    (merged, type) => [...merged, ...(grouped[type] || [])],
    [],
  );

const normalizeMenuList = list => flattenGroupedMenus(groupMenusByType(list));
const mergeMenuListWithServer = (currentList, serverList) => {
  if (!Array.isArray(currentList) || currentList.length === 0) {
    return serverList;
  }

  const serverMap = new Map(serverList.map(menu => [menu.id, menu]));

  const preservedMenus = currentList
    .map(menu => {
      const latest = serverMap.get(menu.id);
      return latest || null;
    })
    .filter(Boolean);

  const preservedIds = new Set(preservedMenus.map(menu => menu.id));
  const appendedMenus = serverList.filter(menu => !preservedIds.has(menu.id));

  return [...preservedMenus, ...appendedMenus];
};

const getMenuIdsInApiOrder = list =>
  flattenGroupedMenus(groupMenusByType(list)).map(menu => menu.id);

const areOrdersEqual = (currentList = [], baseList = []) => {
  if (!Array.isArray(currentList) || !Array.isArray(baseList)) {
    return false;
  }
  if (currentList.length !== baseList.length) {
    return false;
  }
  return currentList.every(
    (item, index) => item?.id === baseList[index]?.id,
  );
};

export const MENU_CATEGORY_OPTIONS = ['전체', '대표', '일반', '사이드'];

export const MenuCategoryRadioGroup = ({
  options = MENU_CATEGORY_OPTIONS,
  selectedCategory,
  onSelect,
  containerStyle,
  ...wrapperProps
}) => {
  const {style: wrapperStyle, ...restProps} = wrapperProps;
  return (
    <View
      style={[styles.radioGroup, containerStyle, wrapperStyle]}
      {...restProps}>
      {options.map(item => (
        <Pressable
          key={item}
          style={styles.radioItem}
          hitSlop={10}
          onPress={() => onSelect?.(item)}>
          <View
            style={[
              styles.radioCircle,
              selectedCategory === item && styles.radioSelectedCircle,
            ]}>
            {selectedCategory === item && <View style={styles.radioInnerDot} />}
          </View>
          <Text
            style={[
              styles.radioLabel,
              selectedCategory === item && styles.radioLabelSelected,
            ]}>
            {item}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const StoreMenuScreen = ({
  navigation,
  storeId,
  menus,
  isUpdatable,
  loading = false,
  onMenuUpdateComplete = null,
  isOrderEnabled = false,
  selectedCategory: controlledCategory,
  onCategoryChange,
  hideCategoryFilter = false,
  categoryFilterProps = {},
  onSortDirtyChange,
  setMenutopheight,
}) => {
  const [menuList, setMenuList] = useState(() => normalizeMenuList(menus));
  const [isSortDirty, setIsSortDirty] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const isSortDirtyRef = useRef(isSortDirty);
  const [uncontrolledCategory, setUncontrolledCategory] = useState('전체');
  const normalizedMenus = useMemo(() => normalizeMenuList(menus), [menus]);
  const toastContext = useToast();
  const {showAlert, AlertComponent} = useCustomAlert();
  const showToast = toastContext?.showToast;
  const isCategoryControlled =
    typeof controlledCategory === 'string' &&
    typeof onCategoryChange === 'function';
  const currentCategory = isCategoryControlled
    ? controlledCategory
    : uncontrolledCategory;

  const handleCategorySelect = category => {
    if (isCategoryControlled) {
      onCategoryChange(category);
    } else {
      setUncontrolledCategory(category);
    }
  };
  const filterMenusByCategory = () => {
    const list = Array.isArray(menuList) ? menuList : [];
    if (currentCategory === '전체') return list;
    if (currentCategory === '대표')
      return list.filter(menu => menu.menuType === 'MAIN');
    if (currentCategory === '일반')
      return list.filter(menu => menu.menuType === 'NORMAL');
    if (currentCategory === '사이드')
      return list.filter(menu => menu.menuType === 'SIDE');
    return list;
  };
  const {bottom: androidBottom} = useSafeAndroidInsets();
  const {bottom: safeBottom} = useSafeAreaInsets();
  const bottomInset =
    Platform.OS === 'android' ? androidBottom + 30 : safeBottom;
  const containerPaddingBottom = isOrderEnabled
    ? ORDER_SPACER_HEIGHT + bottomInset
    : bottomInset;
  useEffect(() => {
    isSortDirtyRef.current = isSortDirty;
  }, [isSortDirty]);

  useEffect(() => {
    setMenuList(prevList => {
      if (
        isSortDirtyRef.current &&
        Array.isArray(prevList) &&
        prevList.length
      ) {
        return mergeMenuListWithServer(prevList, normalizedMenus);
      }
      return normalizedMenus;
    });
  }, [normalizedMenus]);

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

  const syncSortOrder = useCallback(
    async orderedList => {
      if (!storeId || !Array.isArray(orderedList)) {
        return;
      }

      const payload = getMenuIdsInApiOrder(orderedList);
      try {
        await MenuUpdateSort(storeId, payload);
      } catch (error) {
        console.error('Failed to update menu sort order', error);
        throw error;
      }
    },
    [storeId],
  );

  // ⭐ 메뉴 순서 변경 기능
  const moveItem = (menuId, direction, menuType) => {
    if (!Array.isArray(menuList)) {
      return;
    }

    const grouped = groupMenusByType(menuList);
    const targetGroup = grouped[menuType] || [];
    if (targetGroup.length === 0) {
      return;
    }

    const currentIndex = targetGroup.findIndex(menu => menu.id === menuId);
    if (currentIndex === -1) {
      return;
    }

    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= targetGroup.length) {
      if (typeof showToast === 'function') {
        if (direction > 0) {
          showToast('이 이상 아래로 움직일 수 없습니다.');
        } else {
          showToast('이 이상 위로 움직일 수 없습니다.');
        }
      }
      return;
    }

    const updatedGroup = [...targetGroup];
    const [movedItem] = updatedGroup.splice(currentIndex, 1);
    updatedGroup.splice(newIndex, 0, movedItem);
    grouped[menuType] = updatedGroup;

    const updatedList = flattenGroupedMenus(grouped);
    setMenuList(updatedList);
    setIsSortDirty(!areOrdersEqual(updatedList, normalizedMenus));
  };

  const handleSaveOrder = useCallback(async () => {
    if (isSavingOrder || !isSortDirty) {
      return;
    }

    try {
      setIsSavingOrder(true);
      await syncSortOrder(menuList);
      setIsSortDirty(false);
      showToast?.('메뉴 순서를 저장했어요.');
    } catch (error) {
      showToast?.('순서 저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSavingOrder(false);
    }
  }, [isSavingOrder, isSortDirty, menuList, showToast, syncSortOrder]);

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
        title: '메뉴 순서가 저장되지 않았습니다.',
        message: '뒤로 가시겠습니까?',
        onConfirm: () => {
          navigation.dispatch(e.data.action);
        },
        onCancel: null,
        type: 'confirm',
      });
    });

    return unsubscribe;
  }, [navigation, isUpdatable, showAlert]);

  const renderGroupedMenus = () => {
    const filteredMenus = filterMenusByCategory();
    const mainAndNormal = filteredMenus
      ?.filter(menu => menu.menuType === 'MAIN' || menu.menuType === 'NORMAL')
      ?.sort((a, b) => {
        const order = {MAIN: 0, NORMAL: 1};
        return order[a.menuType] - order[b.menuType];
      });

    const sideMenus = filteredMenus?.filter(menu => menu.menuType === 'SIDE');

    return (
      <>
        {mainAndNormal.length > 0 && (
          <View style={styles.section}>
            {currentCategory === '전체' && (
              <Text style={styles.sectionTitle}>주 메뉴</Text>
            )}
            {mainAndNormal.map((menu, idx) => (
              <MenuItem
                key={menu.id}
                menu={menu}
                isLast={idx === mainAndNormal.length - 1}
                navigation={navigation}
                isUpdatable={isUpdatable}
                onMenuUpdateComplete={onMenuUpdateComplete}
                onMoveUp={() => moveItem(menu.id, -1, menu.menuType)}
                onMoveDown={() => moveItem(menu.id, 1, menu.menuType)}
              />
            ))}
            <View style={styles.line} />
          </View>
        )}

        {sideMenus.length > 0 && (
          <View style={styles.section}>
            {currentCategory === '전체' && (
              <Text style={styles.sectionTitle}>사이드 메뉴</Text>
            )}
            {sideMenus.map((menu, idx) => (
              <MenuItem
                key={menu.id}
                menu={menu}
                isLast={idx === sideMenus.length - 1}
                navigation={navigation}
                isUpdatable={isUpdatable}
                onMenuUpdateComplete={onMenuUpdateComplete}
                onMoveUp={() => moveItem(menu.id, -1, menu.menuType)}
                onMoveDown={() => moveItem(menu.id, 1, menu.menuType)}
              />
            ))}
            <View style={styles.line} />
          </View>
        )}
      </>
    );
  };

  // 메뉴판, 주류 정보 사진 없을때 이미지 추가로 수정
  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, {paddingBottom: containerPaddingBottom}]}>
      {isUpdatable && (
        <View
          style={{marginTop: 10}}
          onLayout={e => setMenutopheight(e.nativeEvent.layout.height)}>
          <Pressable
            style={styles.reorderButton}
            onPress={() => {
              navigation.navigate('StoreStack', {
                screen: 'MenuEditScreen',
                params: {storeId},
              });
              const unsubscribe = navigation.addListener('focus', async () => {
                await onMenuUpdateComplete(); // 뒤로 돌아올 때 새로고침
                unsubscribe();
              });
            }}>
            <Text style={styles.menuAddButtonText}>메뉴 추가</Text>
          </Pressable>

          {menuList?.length > 0 && (
            <Pressable
              style={[
                styles.saveOrderButton,
                (!isSortDirty || isSavingOrder) &&
                  styles.saveOrderButtonDisabled,
              ]}
              disabled={!isSortDirty || isSavingOrder}
              onPress={handleSaveOrder}>
              <Text
                style={[
                  styles.saveOrderText,
                  (!isSortDirty || isSavingOrder) &&
                    styles.saveOrderButtonDisabledText,
                ]}>
                순서 저장
              </Text>
            </Pressable>
          )}
        </View>
      )}
      {!hideCategoryFilter && isUpdatable && (
        <MenuCategoryRadioGroup
          selectedCategory={currentCategory}
          onSelect={handleCategorySelect}
          {...categoryFilterProps}
        />
      )}
      {menuList?.length > 0 ? (
        renderGroupedMenus()
      ) : !loading ? (
        <View style={styles.footer}>
          <Text style={styles.emptyText}>등록된 메뉴가 없어요</Text>
        </View>
      ) : null}
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
  menuAddButtonText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
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
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
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
    marginTop: 10,
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
  radioGroup: {
    flexDirection: 'row',
    // justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 10,
    marginTop: 10,
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
});

export default StoreMenuScreen;
