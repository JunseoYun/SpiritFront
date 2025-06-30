import React, {useState, useLayoutEffect, useRef} from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import MenuAddForm from '../../../components/MenuAddScreen/MenuAddForm';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {StoreMenucreate} from '../../../api/menuApi';
import forbiddenWords from '../../../hooks/forbiddenWords';
import Loading from '../../../hooks/Loading';
import {useToast} from '../../../context/ToastContext';

const MenuAddScreen = ({navigation}) => {
  const route = useRoute();
  const scrollViewRef = useRef(null);
  const {storeId} = route.params;
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const {showToast} = useToast();

  const {showAlert, AlertComponent} = useCustomAlert();

  const [menus, setMenus] = useState([
    {menuName: '', price: '', menuContent: '', type: 'NORMAL', imageUri: ''},
  ]);

  const handleMenuChange = (text, index, field) => {
    const updatedMenus = [...menus];
    updatedMenus[index][field] = text;
    setMenus(updatedMenus);
  };

  const handleAddMenu = () => {
    setMenus([
      ...menus,
      {menuName: '', price: '', menuContent: '', type: 'NORMAL', imageUri: ''},
    ]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 100); // 0~100ms 사이의 짧은 delay 필요
  };

  const handleDeleteMenu = index => {
    if (menus.length === 1) {
      showToast('메뉴는 최소 1개 이상 등록되어야 합니다.', 'center');
      return;
    }
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

  const menuRefs = useRef([]);

  const MenuAdd = async () => {
    for (let i = 0; i < menus.length; i++) {
      const menu = menus[i];
      const containsForbiddenWord = forbiddenWords.some(
        word =>
          menu.menuName.includes(word) ||
          menu.menuContent.includes(word) ||
          menu.price.toString().includes(word),
      );

      const Gotomenuerror = () => {
        menuRefs.current[i]?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({y: y - 40, animated: true});
          },
          error => {
            console.log('measureLayout error:', error);
          },
        );
      };

      if (containsForbiddenWord) {
        showAlert({
          title: '가이드 위반',
          message: '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
          onConfirm: () => {
            Gotomenuerror();
          },
        });
        return;
      }

      if (!menu.menuName.trim()) {
        showAlert({
          title: '입력 오류',
          message: '메뉴 이름을 입력해주세요.',
          onConfirm: () => {
            Gotomenuerror();
          },
        });
        return;
      }

      if (!menu.price.toString().trim()) {
        showAlert({
          title: '입력 오류',
          message: '메뉴 가격을 입력해주세요.',
          onConfirm: () => {
            Gotomenuerror();
          },
        });
        return;
      }
    }

    try {
      setConfirm(true);
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
            menuType: menu.type,
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
          setConfirm(false);
          navigation.replace('StoreStack', {
            screen: 'StoreMainScreen',
            params: {
              storeId: storeId,
            },
          });
        },
      });
    } catch (error) {
      setConfirm(false);
      showAlert({
        title: '메뉴 추가 오류',
        message: `메뉴 추가 중 \n오류가 발생하였습니다.`,
      });
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={loading || confirm ? null : MenuAdd}
          disabled={loading || confirm}>
          <Text style={[styles.headerButton]}>완료</Text>
        </Pressable>
      ),
    });
  }, [navigation, MenuAdd, loading, confirm]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: '#F7F8FA'}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
        <View style={{flex: 1}}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {menus.map((menu, index) => (
              <MenuAddForm
                ref={el => (menuRefs.current[index] = el)}
                key={index}
                menu={menu}
                index={index}
                handleMenuChange={handleMenuChange}
                onDelete={handleDeleteMenu}
              />
            ))}
          </ScrollView>
          <View style={styles.menuAddTextview}>
            <Pressable style={styles.menuAddButton} onPress={handleAddMenu}>
              <Text style={styles.menuAddText}>메뉴 추가</Text>
            </Pressable>
          </View>
        </View>
        {/* </TouchableWithoutFeedback> */}
      </KeyboardAvoidingView>

      <AlertComponent />
      <Loading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerButton: {
    marginRight: 18,
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#16BBFF',
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
  menuAddTextview: {
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  menuAddButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45C9FF',
    borderRadius: 10,
  },
  menuAddText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
