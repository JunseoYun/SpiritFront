import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import {
  MenuUpdate,
  MenuUpdateImage,
  MenuDeleteImage,
} from '../../../api/menuApi';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useCustomAlert from '../../../hooks/useCustomAlert';
import forbiddenWords from '../../../hooks/forbiddenWords';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useRoute} from '@react-navigation/native';

const MenuUpdateScreen = ({navigation}) => {
  const route = useRoute();
  const {menu, storeId} = route.params;
  const [originalMenu, setOriginalMenu] = useState('');
  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [menuImage, setMenuImage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false); // ✅ 이미지 삭제 여부 상태 추가
  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedDescription, setIsFocusedDescription] = useState(false);
  const [isFocusedPrice, setIsFocusedPrice] = useState(false);

  const {showAlert, AlertComponent} = useCustomAlert();

  useEffect(() => {
    if (menu) {
      console.log(menu);
      setOriginalMenu(menu);
      setMenuName(menu.name || '');
      setMenuDescription(menu.description || '');
      setMenuPrice(menu.price || '');
      setIsMain(menu.isMain || false);
      setMenuImage(menu.imgUrl || '');
    }
  }, [menu]);

  const GotoStoreScreen = () => {
    showAlert({
      title: `수정 되었습니다.`,
      onConfirm: () => {
        navigation.replace('StoreStack', {
          screen: 'StoreMainScreen',
          params: {
            storeId: storeId,
          },
        });
      },
      onCancel: null,
      type: 'confirm',
    });
  };

  const selectImage = () => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        setSelectedImage(image);
        setMenuImage(image.path); // ✅ UI 미리보기 즉시 반영
        setIsImageDeleted(false); // ✅ 삭제 상태 해제
      })
      .catch(error => {});
  };

  // ✅ 이미지 삭제 (API 호출 X, UI에서만 미리 삭제)
  const handleDeleteImage = () => {
    showAlert({
      title: `이미지를 삭제하시겠습니까?`,
      onConfirm: () => {
        setMenuImage(''); // ✅ UI에서 즉시 반영 (기본 상태로 변경)
        setSelectedImage(null);
        setIsImageDeleted(true); // ✅ 삭제 상태 활성화
      },
      onCancel: null,
      type: 'delete',
    });
  };

  // ✅ 저장 버튼 클릭 시
  const handleSave = async () => {
    let isImageChanged = selectedImage !== null;
    let isInfoChanged =
      menuName !== originalMenu.name ||
      menuDescription !== originalMenu.description ||
      menuPrice !== originalMenu.price ||
      isMain !== originalMenu.isMain;

    if (!menuName.trim()) {
      showAlert({
        title: '입력 오류',
        message: '메뉴 이름을 입력해주세요.',
      });
      return;
    }

    if (!menuPrice.toString().trim()) {
      showAlert({
        title: '입력 오류',
        message: '메뉴 가격을 입력해주세요.',
      });
      return;
    }

    const containsForbiddenWord = forbiddenWords.some(
      word =>
        menuName.includes(word) ||
        menuDescription.includes(word) ||
        menuPrice.includes(word),
    );

    if (containsForbiddenWord) {
      showAlert({
        title: '가이드 위반',
        message: '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
      });
      return;
    }

    try {
      let updatedMenu = {...originalMenu};

      // 1️⃣ 이미지만 변경된 경우 → 이미지 업데이트 요청
      if (isImageChanged && !isInfoChanged) {
        await MenuUpdateImage(menu.id, selectedImage);
        updatedMenu.imgUrl = selectedImage.path;
        GotoStoreScreen();
      }

      // 2️⃣ 정보만 변경된 경우 → 메뉴 정보 업데이트 요청
      if (!isImageChanged && isInfoChanged) {
        updatedMenu = {
          ...updatedMenu,
          name: menuName,
          description: menuDescription,
          price: Number(menuPrice),
          isMain,
        };
        await MenuUpdate(menu.id, updatedMenu);
        GotoStoreScreen();
      }

      // 3️⃣ 둘 다 변경된 경우 → 이미지 업데이트 후 정보 업데이트 요청
      if (isImageChanged && isInfoChanged) {
        await MenuUpdateImage(menu.id, selectedImage);
        updatedMenu.imgUrl = selectedImage.path;

        updatedMenu = {
          ...updatedMenu,
          name: menuName,
          description: menuDescription,
          price: Number(menuPrice),
          isMain,
        };
        await MenuUpdate(menu.id, updatedMenu);
        GotoStoreScreen();
      }

      // 4️⃣ 이미지 삭제가 선택된 경우 → 이미지 삭제 API 호출
      if (isImageDeleted) {
        await MenuDeleteImage(menu.id);
        updatedMenu.imgUrl = '';
        GotoStoreScreen();
      }

      // 5️⃣ 변경 사항이 없으면 요청 없이 모달만 닫기
      if (!isImageChanged && !isInfoChanged && !isImageDeleted) {
        handleCancel();
        return;
      }
    } catch (error) {
      showAlert({
        title: '수정 실패',
        message: '잘못된 요청입니다.',
      });
    }
  };

  // ✅ 취소 버튼 클릭 시 원래 데이터로 초기화
  const handleCancel = () => {
    showAlert({
      title: '작성한 내용이 저장되지 않았습니다',
      message: '뒤로 가시겠습니까?',
      onConfirm: () => {
        setMenuName('');
        setMenuDescription('');
        setMenuPrice('');
        setIsMain(false);
        setMenuImage('');
        setSelectedImage(null);
        setIsImageDeleted(false);
        navigation.goBack();
      },
      onCancel: null,
      type: 'confirm',
    });
    // ✅ 삭제 상태 초기화
  };
  return (
    <View style={styles.modalContainer}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCancel}>
          <Ionicons name="arrow-back-outline" size={25} color="#333" />
        </TouchableOpacity>

        <Text style={styles.modalTitle}>메뉴 수정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Ionicons name="paper-plane-sharp" size={25} color="#16BBFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        {menuImage ? (
          <ImageBackground
            source={{uri: menuImage}}
            style={styles.menuImage}
            imageStyle={styles.backimagestyle}>
            {/* ✅ 이미지 안에 아이콘 배치 */}
            <View style={styles.imageButtonView}>
              <Pressable
                style={[styles.imageButton, styles.shadowEffect]}
                onPress={selectImage}>
                <MaterialIcons name="photo-library" size={28} color="#fff" />
              </Pressable>
              <Pressable
                style={[styles.deleteButton, styles.shadowEffect]}
                onPress={handleDeleteImage}>
                <Ionicons name="trash-outline" size={28} color="#fff" />
              </Pressable>
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>이미지 추가</Text>
            <Pressable onPress={selectImage}>
              <MaterialCommunityIcons
                name="image-plus"
                size={40}
                color="#333"
              />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.storeinputview}>
        {menuName && <Text style={styles.inputText}>메뉴 이름*</Text>}
        <TextInput
          style={[
            styles.input,
            {borderBottomColor: isFocusedName ? '#16BBFF' : '#F2F2F2'},
          ]}
          value={menuName}
          onChangeText={setMenuName}
          placeholder=" 메뉴 이름*"
          onFocus={() => setIsFocusedName(true)}
          onBlur={() => setIsFocusedName(false)}
        />
      </View>

      <View style={styles.storeinputview}>
        {menuDescription && <Text style={styles.inputText}>메뉴 소개</Text>}
        <TextInput
          style={[
            styles.inputMultiline,
            {
              borderBottomColor: isFocusedDescription ? '#16BBFF' : '#F2F2F2',
            },
          ]}
          value={menuDescription}
          onChangeText={setMenuDescription}
          placeholder="메뉴 소개"
          multiline={true}
          textAlignVertical="top"
          onFocus={() => setIsFocusedDescription(true)}
          onBlur={() => setIsFocusedDescription(false)}
        />
      </View>
      <View style={styles.storeinputview}>
        {menuPrice && <Text style={styles.inputText}>메뉴 가격*</Text>}
        <TextInput
          style={[
            styles.input,
            {borderBottomColor: isFocusedPrice ? '#16BBFF' : '#F2F2F2'},
          ]}
          value={menuPrice}
          onChangeText={setMenuPrice}
          placeholder="메뉴 가격*"
          onFocus={() => setIsFocusedPrice(true)}
          onBlur={() => setIsFocusedPrice(false)}
        />
      </View>
      <View style={styles.storeinputview}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>대표 메뉴 여부</Text>
          <Switch
            value={isMain}
            onValueChange={setIsMain}
            trackColor={{false: '#ccc', true: '#16BBFF'}} // ✅ 배경 색상 변경
            thumbColor={'#fff'}
          />
        </View>
      </View>
      <AlertComponent />
    </View>
  );
};
const styles = StyleSheet.create({
  modalContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333', // ✅ 더 진한 색상 적용
  },

  imageContainer: {
    alignItems: 'center',
    marginVertical: 15,
    position: 'relative', // ✅ 부모 요소 기준으로 배치
  },
  menuImage: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 12,
    overflow: 'hidden', // ✅ 이미지 둥글게 적용
  },
  backimagestyle: {
    borderRadius: 12, // ✅ ImageBackground에도 둥근 효과 적용
  },
  imageButtonView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20, // ✅ 버튼 간격 조정
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // ✅ 반투명 배경 추가
    borderRadius: 12,
  },
  imageButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // ✅ 반투명 배경으로 자연스럽게
    borderRadius: 50,
    marginTop: 135,
    marginRight: 35,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.5)', // ✅ 삭제 버튼은 빨간색 톤
    borderRadius: 50,
    marginLeft: 35,
    marginTop: 135,
  },
  shadowEffect: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },

  storeinputview: {
    width: '100%',
    marginTop: 30,
    marginHorizontal: 20,
  },

  input: {
    width: '100%',
    borderBottomColor: '#16BBFF',
    borderBottomWidth: 1,
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
    marginBottom: 20,
  },
  inputMultiline: {
    width: '100%',
    minHeight: 30, // ✅ 최소 높이 설정하여 UI 개선
    paddingVertical: 12,
    borderBottomColor: '#16BBFF',
    borderBottomWidth: 1,
    fontSize: 18,
    textAlignVertical: 'top', // ✅ 여러 줄 입력 시 텍스트가 위에서부터 입력됨
    marginBottom: 20,
  },
  inputText: {
    marginVertical: 5,
    fontSize: 16,
    color: '#333',
    fontWeight: 500,
    marginTop: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MenuUpdateScreen;
