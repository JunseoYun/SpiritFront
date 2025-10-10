import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import MenuItem from '../../components/StoreMenuScreen/MenuItem';
import Feather from 'react-native-vector-icons/Feather';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';

const ORDER_SPACER_HEIGHT = 40;

const StoreMenuScreen = ({
  navigation,
  storeId,
  menus,
  onMenuDelete,
  isUpdatable,
  onMenuUpdateComplete,
  isOrderEnabled,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [menuList, setMenuList] = useState(menus);
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
    const mainAndNormal = menuList
      ?.filter(menu => menu.menuType === 'MAIN' || menu.menuType === 'NORMAL')
      ?.sort((a, b) => {
        const order = {MAIN: 0, NORMAL: 1};
        return order[a.menuType] - order[b.menuType];
      });

    const sideMenus = menuList?.filter(menu => menu.menuType === 'SIDE');

    return (
      <>
        {mainAndNormal.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>주 메뉴</Text>
            {mainAndNormal.map((menu, idx) => (
              <MenuItem
                key={menu.id}
                menu={menu}
                isLast={idx === mainAndNormal.length - 1} // ✅ 추가
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
                isLast={idx === sideMenus.length - 1} // ✅ 추가
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
            onPress={() => setModalVisible(true)}>
            <Text style={styles.menuAddButtonText}>메뉴 편집</Text>
          </Pressable>
        </>
      )}

      {menuList?.length > 0 ? (
        renderGroupedMenus()
      ) : (
        <View style={styles.footer}>
          <Text style={styles.emptyText}>등록된 메뉴가 없어요</Text>
        </View>
      )}
      <Modal
        transparent
        visible={isModalVisible}
        animationType="fade"
        statusBarTranslucent={true}>
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                navigation.navigate('MenuEditScreen', {
                  storeId,
                  menus,
                  onMenuUpdateComplete, // ✅ 메뉴 다시 불러오는 콜백 전달
                  onMenuDelete,
                });
                setModalVisible(false);
              }}>
              <Text style={styles.optionText}>메뉴 수정/삭제</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                navigation.navigate('MenuAddScreen', {storeId: storeId});
                setModalVisible(false);
              }}>
              <Text style={styles.optionText}>새 메뉴 추가</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  reorderButton: {
    marginHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#E9F5FB',
  },
  menuAddButtonText: {
    color: '#45C9FF',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    padding: 16,
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: 260,
  },
  option: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});

export default StoreMenuScreen;
