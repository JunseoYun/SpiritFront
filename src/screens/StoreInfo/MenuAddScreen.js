import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {getToken} from '../../storage/tokenStorage';
import MenuAddForm from '../../components/MenuAddScreen/MenuAddForm';
import useCustomAlert from '../../hooks/useCustomAlert';
import {StoreMenucreate} from '../../api/menuApi';

const MenuAddScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId} = route.params;
  const [token, setToken] = useState(null);

  const {showAlert, AlertComponent} = useCustomAlert();

  const [menus, setMenus] = useState([
    {menuName: '', price: '', menuContent: '', main: false, imageUri: ''},
  ]);

  useEffect(() => {
    const fetchToken = async () => {
      const savedToken = await getToken();
      setToken(savedToken); // 토큰을 가져온 후에 데이터 요청
    };
    fetchToken();
  }, []);

  const handleMenuChange = (text, index, field) => {
    const updatedMenus = [...menus];
    updatedMenus[index][field] = text;
    setMenus(updatedMenus);
  };

  const handleCheckBoxChange = index => {
    const maxMainMenus = 3;
    const selectedCount = menus.filter(menu => menu.main).length;

    if (!menus[index].main && selectedCount >= maxMainMenus) {
      showAlert({
        title: '제한 초과',
        message: `대표 메뉴는 최대 ${maxMainMenus}개까지 설정 가능합니다.`,
      });
      return;
    }

    const updatedMenus = [...menus];
    updatedMenus[index].main = !updatedMenus[index].main; // `main` 값 토글
    setMenus(updatedMenus);
  };

  const handleAddMenu = () => {
    setMenus([
      ...menus,
      {menuName: '', price: '', menuContent: '', main: false, imageUri: ''},
    ]);
  };

  const handleDeleteMenu = index => {
    showAlert({
      title: '메뉴 삭제',
      message: '해당 메뉴를 삭제하시겠습니까?',
      onConfirm: () => {
        const updatedMenus = menus.filter((_, i) => i !== index);
        setMenus(updatedMenus);
      },
      onCancel: null, // 취소 시 효과 제거
      type: 'delete',
    });
  };

  const MenuAdd = async () => {
    try {
      // 각 메뉴에 대해 StoreMenucreate를 호출하도록 map 사용
      const promises = menus.map(menu => {
        const data = {
          menuName: menu.menuName,
          price: menu.price,
          menuContent: menu.menuContent,
          main: menu.main,
          storeId: storeId, // storeId는 고정된 값으로 유지되었습니다.
        };
        console.log(data + 'data리스트');

        // StoreMenucreate 비동기 함수 호출
        return StoreMenucreate(JSON.stringify(data));
      });

      // 모든 요청이 완료될 때까지 기다립니다.
      await Promise.all(promises);
      console.log('모든 메뉴가 추가되었습니다.');
    } catch (error) {
      console.error('메뉴 추가 중 오류 발생:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {menus.map((menu, index) => (
          <MenuAddForm
            key={index}
            menu={menu}
            index={index}
            handleMenuChange={handleMenuChange}
            handleCheckBoxChange={handleCheckBoxChange}
            onDelete={handleDeleteMenu}
          />
        ))}

        <Pressable style={styles.menuAddButton} onPress={handleAddMenu}>
          <Text style={styles.menuAddText}>메뉴 추가</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={MenuAdd}>
          <Text style={styles.saveButtonText}>작성 완료</Text>
        </Pressable>
      </ScrollView>
      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  saveButton: {
    left: '10%',
    width: '80%',
    marginVertical: 50,
    alignItems: 'center',
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  menuAddButton: {
    marginTop: 30,
    color: 'white',
    width: 120,
    height: 50,
    fontSize: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  menuAddText: {
    color: '#333',
    fontSize: 17,
    alignSelf: 'center',
    fontWeight: '600',
  },
});

export default MenuAddScreen;
