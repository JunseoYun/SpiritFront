import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, View, Text} from 'react-native';
import MenuHeader from '../../components/StoreMenuScreen/MenuHeader';
import MenuItem from '../../components/StoreMenuScreen/MenuItem';
import {StoreMenudelete} from '../../api/menuApi';
import useCustomAlert from '../../hooks/useCustomAlert';
import {Portal} from 'react-native-paper';

const StoreMenuScreen = ({
  navigation,
  storeId,
  menus,
  scrollViewRef,
  onMenuDelete,
  isUpdatable,
}) => {
  const [openItemId, setOpenItemId] = useState(null);
  const [menuList, setMenuList] = useState(menus);
  const {showAlert, AlertComponent} = useCustomAlert();
  console.log(menus, storeId);

  useEffect(() => {
    setMenuList(menus);
  }, [menus]);

  const handleOpenItem = id => {
    setOpenItemId(id);
  };

  const handleCloseAll = () => {
    setOpenItemId(null);
  };

  const handleDeleteMenu = (id, name) => {
    handleCloseAll();
    showAlert({
      title: `${name} 삭제`,
      message: `메뉴를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await StoreMenudelete(id);
          onMenuDelete(id);
        } catch (error) {}
      },
      onCancel: null,
      type: 'delete',
    });
  };

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
                storeId={storeId}
                isOpen={openItemId === menu.id}
                onOpen={() => handleOpenItem(menu.id)}
                onDelete={handleDeleteMenu}
                onClose={handleCloseAll}
                scrollViewRef={scrollViewRef}
                navigation={navigation}
                isUpdatable={isUpdatable}
                isLast={idx === mainAndNormal.length - 1} // ✅ 추가
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
                storeId={storeId}
                isOpen={openItemId === menu.id}
                onOpen={() => handleOpenItem(menu.id)}
                onDelete={handleDeleteMenu}
                onClose={handleCloseAll}
                scrollViewRef={scrollViewRef}
                navigation={navigation}
                isUpdatable={isUpdatable}
                isLast={idx === sideMenus.length - 1} // ✅ 추가
              />
            ))}

            <View style={styles.line} />
          </View>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isUpdatable && <MenuHeader storeId={storeId} navigation={navigation} />}

      {menuList?.length > 0 ? (
        renderGroupedMenus()
      ) : (
        <View style={styles.footer}>
          <Text style={styles.emptyText}>등록된 메뉴가 없어요</Text>
        </View>
      )}

      <Portal>
        <AlertComponent />
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
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
});

export default StoreMenuScreen;
