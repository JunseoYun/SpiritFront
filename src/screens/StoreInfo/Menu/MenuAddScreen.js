import React, {useState} from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import MenuAddForm from '../../../components/MenuAddScreen/MenuAddForm';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {StoreMenucreate} from '../../../api/menuApi';
import forbiddenWords from '../../../hooks/forbiddenWords';

const MenuAddScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId} = route.params;
  const [loading, setLoading] = useState(false);

  const {showAlert, AlertComponent} = useCustomAlert();

  const [menus, setMenus] = useState([
    {menuName: '', price: '', menuContent: '', main: false, imageUri: ''},
  ]);

  const handleMenuChange = (text, index, field) => {
    const updatedMenus = [...menus];
    updatedMenus[index][field] = text;
    setMenus(updatedMenus);
  };

  const handleAddMenu = () => {
    setMenus([
      ...menus,
      {menuName: '', price: '', menuContent: '', main: false, imageUri: ''},
    ]);
  };
  const handleCheckBoxChange = index => {
    const updatedMenus = menus.map((menu, i) => ({
      ...menu,
      main: i === index ? !menu.main : menu.main, // 해당 메뉴의 main 값을 토글
    }));
    setMenus(updatedMenus);
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
    for (const menu of menus) {
      const containsForbiddenWord = forbiddenWords.some(
        word =>
          menu.menuName.includes(word) ||
          menu.menuContent.includes(word) ||
          menu.price.toString().includes(word),
      );

      if (containsForbiddenWord) {
        showAlert({
          title: '가이드 위반',
          message: '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
        });
        return;
      }

      if (!menu.menuName.trim()) {
        showAlert({
          title: '입력 오류',
          message: '메뉴 이름을 입력해주세요.',
        });
        return;
      }

      if (!menu.price.toString().trim()) {
        showAlert({
          title: '입력 오류',
          message: '메뉴 가격을 입력해주세요.',
        });
        return;
      }
    }

    try {
      setLoading(true);
      // 각 메뉴에 대해 StoreMenucreate를 호출하도록 map 사용
      const promises = menus.map(menu => {
        const data = {
          file: menu.imageUri,
          createMenuDto: {
            name: menu.menuName,
            description: menu.menuContent,
            price: menu.price,
            storeId: storeId,
            isMain: menu.main,
          },
        };

        // StoreMenucreate 비동기 함수 호출
        return StoreMenucreate(data);
      });

      // 모든 요청이 완료될 때까지 기다립니다.
      await Promise.all(promises);
      showAlert({
        title: '메뉴 등록이 완료되었습니다.',
        onConfirm: () => {
          navigation.replace('StoreStack', {
            screen: 'StoreMainScreen',
            params: {
              storeId: storeId,
            },
          });
        },
      });
    } catch (error) {
      showAlert({
        title: '메뉴 추가 오류',
        message: `메뉴 추가 중 \n오류가 발생하였습니다.`,
      });
    } finally {
      setLoading(false);
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
      {loading && (
        <View style={styles.footer}>
          <Text style={styles.loadingtext}>Loading...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  saveButton: {
    width: '90%',
    marginVertical: 50,
    alignItems: 'center',
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'center',
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
  footer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(194, 194, 194, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingtext: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default MenuAddScreen;
