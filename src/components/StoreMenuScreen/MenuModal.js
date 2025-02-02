import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import {MenuUpdate, MenuUpdateImage, MenuDeleteImage} from '../../api/menuApi';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useCustomAlert from '../../hooks/useCustomAlert';
import forbiddenWords from '../../hooks/forbiddenWords';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Portal} from 'react-native-paper';

const MenuModal = ({isModalVisible, onPressModalClose, menuData, onUpdate}) => {
  const [originalMenu, setOriginalMenu] = useState(menuData);
  const [menuName, setMenuName] = useState(menuData.name);
  const [menuDescription, setMenuDescription] = useState(menuData.description);
  const [menuPrice, setMenuPrice] = useState(menuData.price);
  const [isMain, setIsMain] = useState(menuData.isMain);
  const [menuImage, setMenuImage] = useState(menuData.imgUrl || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false); // ✅ 이미지 삭제 여부 상태 추가
  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedDescription, setIsFocusedDescription] = useState(false);
  const [isFocusedPrice, setIsFocusedPrice] = useState(false);

  const {showAlert, AlertComponent} = useCustomAlert();

  // ✅ 이미지 선택
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
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
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
        await MenuUpdateImage(menuData.id, selectedImage);
        updatedMenu.imgUrl = selectedImage.path;
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
        await MenuUpdate(menuData.id, updatedMenu);
      }

      // 3️⃣ 둘 다 변경된 경우 → 이미지 업데이트 후 정보 업데이트 요청
      if (isImageChanged && isInfoChanged) {
        await MenuUpdateImage(menuData.id, selectedImage);
        updatedMenu.imgUrl = selectedImage.path;

        updatedMenu = {
          ...updatedMenu,
          name: menuName,
          description: menuDescription,
          price: Number(menuPrice),
          isMain,
        };
        await MenuUpdate(menuData.id, updatedMenu);
      }

      // 4️⃣ 이미지 삭제가 선택된 경우 → 이미지 삭제 API 호출
      if (isImageDeleted) {
        await MenuDeleteImage(menuData.id);
        updatedMenu.imgUrl = '';
      }

      // 5️⃣ 변경 사항이 없으면 요청 없이 모달만 닫기
      if (!isImageChanged && !isInfoChanged && !isImageDeleted) {
        onPressModalClose();
        return;
      }

      setOriginalMenu(updatedMenu);
      onUpdate(updatedMenu);
      onPressModalClose();
    } catch (error) {
      console.error('Update Error:', error);
    }
  };

  // ✅ 취소 버튼 클릭 시 원래 데이터로 초기화
  const handleCancel = () => {
    setMenuName(originalMenu.name);
    setMenuDescription(originalMenu.description);
    setMenuPrice(String(originalMenu.price));
    setIsMain(originalMenu.isMain);
    setMenuImage(originalMenu.imgUrl || '');
    setSelectedImage(null);
    setIsImageDeleted(false); // ✅ 삭제 상태 초기화
    onPressModalClose();
  };

  return (
    <Portal>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={onPressModalClose}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons
                  name="arrow-back-outline"
                  size={25}
                  color="#333"
                  style={{marginLeft: 13}}
                />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>메뉴 수정</Text>
              <TouchableOpacity onPress={handleSave}>
                <Ionicons
                  name="paper-plane-sharp"
                  size={25}
                  color="#16BBFF"
                  style={{marginRight: 13}}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={{width: '100%'}}>
              <View style={styles.imageContainer}>
                {menuImage ? (
                  <Image source={{uri: menuImage}} style={styles.menuImage} />
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

              {menuImage && (
                <View style={styles.imageButtonView}>
                  <TouchableOpacity
                    style={[styles.imageButton, styles.shadowEffect]}
                    onPress={selectImage}>
                    <MaterialIcons
                      name="photo-library"
                      size={35}
                      color="#16BBFF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteButton, styles.shadowEffect]}
                    onPress={handleDeleteImage}>
                    <Ionicons name="trash-outline" size={35} color="#FF4D4D" />
                  </TouchableOpacity>
                </View>
              )}
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

              {menuDescription && (
                <Text style={styles.inputText}>메뉴 소개</Text>
              )}
              <TextInput
                style={[
                  styles.inputMultiline,
                  {
                    borderBottomColor: isFocusedDescription
                      ? '#16BBFF'
                      : '#F2F2F2',
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
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>대표 메뉴 여부</Text>
                <Switch
                  value={isMain}
                  onValueChange={setIsMain}
                  trackColor={{false: '#ccc', true: '#16BBFF'}} // ✅ 배경 색상 변경
                />
              </View>
            </ScrollView>
          </View>
        </View>
        <AlertComponent />
      </Modal>
    </Portal>
  );
};
const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // ✅ 어두운 배경 추가
  },
  modalContainer: {
    width: '85%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15, // ✅ 둥근 모서리 추가
    alignItems: 'center',
    elevation: 10, // ✅ 안드로이드 그림자
    shadowColor: '#000', // ✅ iOS 그림자
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
  },
  menuImage: {
    width: 200, // ✅ 이미지 크기 증가
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E7E7E7',
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
  imageButtonView: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  imageButton: {
    position: 'absolute',
    top: -75,
    left: 50,
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
  },
  imageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  deleteButton: {
    position: 'absolute',
    top: -75,
    right: 50,
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
  },
  shadowEffect: {
    shadowColor: '#000', // 그림자 색상
    shadowOffset: {width: 0, height: 4}, // 그림자 위치 (x, y)
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
  cancelButton: {
    flex: 1,
    backgroundColor: '#CCCCCC',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 5,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#16BBFF',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MenuModal;
