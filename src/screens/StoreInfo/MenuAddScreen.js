import React, { useState, useEffect } from 'react';
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
import { useRoute } from '@react-navigation/native';
import { getToken } from '../../storage/tokenStorage';
import MenuAddForm from '../../components/MenuAddScreen/MenuAddForm';
import useAlert from '../../hooks/useAlert';

const MenuAddScreen = ({ navigation }) => {
  const route = useRoute();
  const { storeId } = route.params;
  const [token, setToken] = useState(null);

  const { showAlert } = useAlert();

  const [menus, setMenus] = useState([
    { menuName: '', price: '', menuContent: '', main: false, imageUri: '' },
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

  const handleCheckBoxChange = (index) => {
    const maxMainMenus = 3;
    const selectedCount = menus.filter((menu) => menu.main).length;

    if (!menus[index].main && selectedCount >= maxMainMenus) {
      showAlert(
        '제한 초과',
        `대표 메뉴는 최대 ${maxMainMenus}개까지 설정 가능합니다.`,
        null, // 확인만 필요하므로 확인 핸들러는 null로 설정
        null,
        'ok'
      );
      return;
    }

    const updatedMenus = [...menus];
    updatedMenus[index].main = !updatedMenus[index].main; // `main` 값 토글
    setMenus(updatedMenus);
  };

  const handleAddMenu = () => {
    setMenus([
      ...menus,
      { menuName: '', price: '', menuContent: '', main: false, imageUri: '' },
    ]);
  };

  const handleDeleteMenu = (index) => {
    showAlert(
      '메뉴 삭제',
      '해당 메뉴를 삭제하시겠습니까?',
      () => {
        const updatedMenus = menus.filter((_, i) => i !== index);
        setMenus(updatedMenus);
      },
      null,
      'delete'
    );
  };


  const MenuAdd = () => {
    // 저장 로직 구현
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
