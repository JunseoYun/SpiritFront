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
}) => {
  const [openItemId, setOpenItemId] = useState(null); // 열려 있는 메뉴 ID 관리
  const [menuList, setMenuList] = useState(menus);

  const {showAlert, AlertComponent} = useCustomAlert();

  const sortedMenus = menuList
    ? [...menuList].sort((a, b) => b.isMain - a.isMain)
    : [];

  useEffect(() => {
    setMenuList(menus);
  }, [menus]);

  const handleOpenItem = id => {
    setOpenItemId(id); // 현재 열려 있는 항목의 ID 설정
  };

  const handleCloseAll = () => {
    setOpenItemId(null); // 모든 항목 닫기
  };

  const handleDeleteMenu = (id, name) => {
    handleCloseAll();
    showAlert({
      title: `${name} 삭제`,
      message: `메뉴를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await StoreMenudelete(id);
          onMenuDelete(id); // 부모에게 메뉴 삭제 알리기
        } catch (error) {}
      },
      onCancel: null,
      type: 'delete',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader storeId={storeId} navigation={navigation} />

      {sortedMenus.map(menu => (
        <MenuItem
          key={menu.id}
          menu={menu}
          storeId={storeId}
          isOpen={openItemId === menu.id}
          onOpen={() => handleOpenItem(menu.id)}
          onClose={handleCloseAll}
          scrollViewRef={scrollViewRef} // 스크롤 참조 전달
          navigation={navigation}
        />
      ))}
      {menuList?.length === 0 && (
        <View style={styles.footer}>
          <Text style={styles.emptyText}>등록된 메뉴가 없습니다</Text>
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
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default StoreMenuScreen;
