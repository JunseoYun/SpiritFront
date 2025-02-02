import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import MenuHeader from '../../components/StoreMenuScreen/MenuHeader';
import MenuItem from '../../components/StoreMenuScreen/MenuItem';
import {StoreMenudelete} from '../../api/menuApi';
import useCustomAlert from '../../hooks/useCustomAlert';

const StoreMenuScreen = ({navigation, storeId, menus, scrollViewRef}) => {
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
          setMenuList(prevMenus => prevMenus.filter(menu => menu.id !== id));
        } catch (error) {}
      },
      onCancel: null,
      type: 'delete',
    });
  };

  const handleEditMenu = updatedMenu => {
    setMenuList(prevMenus =>
      prevMenus.map(menu => (menu.id === updatedMenu.id ? updatedMenu : menu)),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader storeId={storeId} navigation={navigation} />

      {sortedMenus.map(menu => (
        <MenuItem
          key={menu.id}
          menu={menu}
          isOpen={openItemId === menu.id}
          onOpen={() => handleOpenItem(menu.id)}
          onClose={handleCloseAll}
          onEdit={handleEditMenu}
          onDelete={() => handleDeleteMenu(menu.id, menu.name)} // 삭제 함수 전달
          scrollViewRef={scrollViewRef} // 스크롤 참조 전달
        />
      ))}
      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
});

export default StoreMenuScreen;
