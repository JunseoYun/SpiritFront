import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, Pressable, Platform} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import MenuItem from '../../components/StoreMenuScreen/MenuItem';
import Feather from 'react-native-vector-icons/Feather';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';

const ORDER_SPACER_HEIGHT = 0;

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
  onMenuUpdateComplete = null,
  isOrderEnabled = false,
  selectedCategory: controlledCategory,
  onCategoryChange,
  hideCategoryFilter = false,
  categoryFilterProps = {},
}) => {
  const [menuList, setMenuList] = useState(menus);
  const [uncontrolledCategory, setUncontrolledCategory] = useState('전체');
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
    if (currentCategory === '전체') return menuList;
    if (currentCategory === '대표')
      return menuList.filter(menu => menu.menuType === 'MAIN');
    if (currentCategory === '일반')
      return menuList.filter(menu => menu.menuType === 'NORMAL');
    if (currentCategory === '사이드')
      return menuList.filter(menu => menu.menuType === 'SIDE');
    return menuList;
  };
  const {bottom: androidBottom} = useSafeAndroidInsets();
  const {bottom: safeBottom} = useSafeAreaInsets();
  const bottomInset =
    Platform.OS === 'android' ? androidBottom + 30 : safeBottom;
  const containerPaddingBottom = isOrderEnabled
    ? ORDER_SPACER_HEIGHT + bottomInset
    : bottomInset;
  useEffect(() => {
    setMenuList(menus);
  }, [menus]);

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
            <Text style={styles.sectionTitle}>주 메뉴</Text>
            {mainAndNormal.map((menu, idx) => (
              <MenuItem
                key={menu.id}
                menu={menu}
                isLast={idx === mainAndNormal.length - 1}
                navigation={navigation}
              />
            ))}
            <View style={styles.line} />
          </View>
        )}

        {sideMenus.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>사이드 메뉴</Text>
            {sideMenus.map((menu, idx) => (
              <MenuItem
                key={menu.id}
                menu={menu}
                isLast={idx === sideMenus.length - 1}
                navigation={navigation}
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
        <>
          <Pressable
            style={styles.reorderButton}
            onPress={() => {
              navigation.navigate('StoreStack', {
                screen: 'MenuEditScreen',
                params: {
                  storeId,
                  menus: menuList,
                },
              });
              const unsubscribe = navigation.addListener('focus', async () => {
                await onMenuUpdateComplete(); // 뒤로 돌아올 때 새로고침
                unsubscribe();
              });
            }}>
            <Text style={styles.menuAddButtonText}>메뉴 관리</Text>
          </Pressable>

          {!hideCategoryFilter && (
            <MenuCategoryRadioGroup
              selectedCategory={currentCategory}
              onSelect={handleCategorySelect}
              {...categoryFilterProps}
            />
          )}
        </>
      )}
      {menuList?.length > 0 ? (
        renderGroupedMenus()
      ) : (
        <View style={styles.footer}>
          <Text style={styles.emptyText}>등록된 메뉴가 없어요</Text>
        </View>
      )}
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
    marginBottom: 32,
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
