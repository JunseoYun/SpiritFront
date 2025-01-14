import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet } from 'react-native';
import MenuHeader from '../../components/MenuScreen/MenuHeader';
import MenuItem from '../../components/MenuScreen/MenuItem';
import MenuModal from '../../components/MenuScreen/MenuModal';
import { StoreMenudelete } from '../../api/menuApi';

const StoreMenuScreen = ({ navigation, storeId, menus  }) => {
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(null);

  const onPressModalOpen = menuId => {
    setSelectedMenuId(menuId); // 선택한 메뉴 ID를 상태로 저장
    setIsModalVisible(true);
  };

  const onPressModalClose = () => {
    
    setIsModalVisible(false);
    setSelectedMenuId(null);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePress = index => {
    if (index == 0) {
      navigation.navigate('UpdateMenu', { menuId: selectedMenuId });
    }
    onPressModalClose();
  };


  const opendeletemenu = () => {
    Alert.alert(
      '메뉴 삭제',
      '메뉴를 삭제하시겠습니까?',
      [
        {
          text: '확인',
          style: 'destructive',
          onPress: async () => {
            try {
              await StoreMenudelete(selectedMenuId); // StoreMaindelete 함수 호출
              Alert.alert(
                '삭제되었습니다.',
                '',
                [
                  {
                    text: '확인',
                    style: 'destructive',
                    onPress: () => {
                      setIsModalVisible(false);
                      getStoreData(); // 삭제 후 메인 페이지로 이동
                    },
                  },
                ],
                { cancelable: false },
              );
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('오류가 발생했습니다. 다시 시도해주세요.');
            }
          },
        },
        {
          text: '취소',
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  };

  useEffect(() => {
  }, [menus]);



  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader storeId={storeId} navigation={navigation} />
      {menus && menus
        .filter(menu => menu.isMain)
        .map(menu => (
          <MenuItem
            key={menu.menuId}
            menu={menu}
            onPressMenuOption={onPressModalOpen}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
            setButtonPosition={setButtonPosition}
          />
        ))}
      {isModalVisible && (
        <MenuModal
          visible={isModalVisible}
          onPressModalClose={onPressModalClose}
          onUpdate={() => handlePress(0)}
          onDelete={opendeletemenu}
          buttonPosition={buttonPosition} // 모달 위치 설정
        />
      )}
    </SafeAreaView>


  );
};
const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    backgroundColor: '#fff'
  },

});

export default StoreMenuScreen;