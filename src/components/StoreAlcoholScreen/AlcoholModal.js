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
  Pressable,
} from 'react-native';
import {
  DrinkUpdate,
  DrinkUpdateImage,
  DrinkDeleteImage,
} from '../../api/drinkApi';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useCustomAlert from '../../hooks/useCustomAlert';
import forbiddenWords from '../../hooks/forbiddenWords';
import AlcoholInput from './AlcoholInput';
import RptAlcoholPicker from '../AlcoholAddScreen/RptAlcoholPicker';
import {Portal} from 'react-native-paper';
const AlcoholModal = ({
  isModalVisible,
  onPressModalClose,
  alcoholData,
  onUpdate,
}) => {
  const [originalAlcohol, setOriginalAlcohol] = useState(alcoholData);
  const [alcoholName, setAlcoholName] = useState(alcoholData.name);
  const [alcoholDescription, setAlcoholDescription] = useState(
    alcoholData.description,
  );
  const [alcoholPrice, setAlcoholPrice] = useState(alcoholData.price);
  const [alcoholType, setAlcoholType] = useState(alcoholData.type);
  const [alcoholImage, setAlcoholImage] = useState(alcoholData.imgUrl || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();

  const selectImage = () => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
      mediaType: 'photo',
    }).then(image => {
      setSelectedImage(image);
      setAlcoholImage(image.path);
      setIsImageDeleted(false);
    });
  };

  const handleDeleteImage = () => {
    showAlert({
      title: `이미지를 삭제하시겠습니까?`,
      onConfirm: () => {
        setAlcoholImage('');
        setSelectedImage(null);
        setIsImageDeleted(true);
      },
      onCancel: null,
      type: 'delete',
    });
  };

  const handleSave = async () => {
    let isImageChanged = selectedImage !== null;
    let isInfoChanged =
      alcoholName !== originalAlcohol.name ||
      alcoholDescription !== originalAlcohol.description ||
      alcoholPrice !== originalAlcohol.price ||
      alcoholType !== originalAlcohol.type;

    if (!alcoholName.trim()) {
      showAlert({
        title: '입력 오류',
        message: '주류 이름을 입력해주세요.',
      });
      return;
    }

    if (!alcoholPrice.toString().trim()) {
      showAlert({
        title: '입력 오류',
        message: '주류 가격을 입력해주세요.',
      });
      return;
    }

    if (!alcoholType.trim()) {
      showAlert({
        title: '입력 오류',
        message: '주종을 선택해주세요.',
      });
      return;
    }

    const containsForbiddenWord = forbiddenWords.some(
      word =>
        alcoholName.includes(word) ||
        alcoholDescription.includes(word) ||
        alcoholPrice.includes(word),
    );

    if (containsForbiddenWord) {
      showAlert({
        title: '가이드 위반',
        message: '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
      });
      return;
    }

    try {
      let updatedAlcohol = {...originalAlcohol};

      // 1️⃣ 이미지만 변경된 경우 → 이미지 업데이트 요청
      if (isImageChanged && !isInfoChanged) {
        await DrinkUpdateImage(alcoholData.id, selectedImage);
        updatedAlcohol.imgUrl = selectedImage.path;
      }

      // 2️⃣ 정보만 변경된 경우 → 메뉴 정보 업데이트 요청
      if (!isImageChanged && isInfoChanged) {
        updatedAlcohol = {
          ...updatedAlcohol,
          name: alcoholName,
          description: alcoholDescription,
          price: Number(alcoholPrice),
          type: alcoholType,
        };
        await DrinkUpdate(alcoholData.id, updatedAlcohol);
      }

      // 3️⃣ 둘 다 변경된 경우 → 이미지 업데이트 후 정보 업데이트 요청
      if (isImageChanged && isInfoChanged) {
        await DrinkUpdateImage(alcoholData.id, selectedImage);
        updatedAlcohol.imgUrl = selectedImage.path;

        updatedAlcohol = {
          ...updatedAlcohol,
          name: alcoholName,
          description: alcoholDescription,
          price: Number(alcoholPrice),
          type: alcoholType,
        };
        await DrinkUpdate(alcoholData.id, updatedAlcohol);
      }

      // 4️⃣ 이미지 삭제가 선택된 경우 → 이미지 삭제 API 호출
      if (isImageDeleted) {
        await DrinkDeleteImage(alcoholData.id);
        updatedAlcohol.imgUrl = '';
      }

      // 5️⃣ 변경 사항이 없으면 요청 없이 모달만 닫기
      if (!isImageChanged && !isInfoChanged && !isImageDeleted) {
        onPressModalClose();
        return;
      }

      setOriginalAlcohol(updatedAlcohol);
      onUpdate(updatedAlcohol);
      onPressModalClose();
    } catch (error) {
      showAlert({
        title: '업데이트 오류',
      });
    }
  };

  const handleCancel = () => {
    setAlcoholName(originalAlcohol.name);
    setAlcoholDescription(originalAlcohol.description);
    setAlcoholPrice(String(originalAlcohol.price));
    setAlcoholType(originalAlcohol.type);
    setAlcoholImage(originalAlcohol.imgUrl || '');
    setSelectedImage(null);
    setIsImageDeleted(false);
    onPressModalClose();
  };

  return (
    <Portal>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
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

              <Text style={styles.modalTitle}>주류 수정</Text>
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
                {alcoholImage ? (
                  <Image
                    source={{uri: alcoholImage}}
                    style={styles.menuImage}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
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

              {alcoholImage && (
                <View style={styles.imageButtonView}>
                  <TouchableOpacity
                    style={[styles.deleteButton, styles.shadowEffect]}
                    onPress={handleDeleteImage}>
                    <Ionicons name="trash-outline" size={30} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.imageButton, styles.shadowEffect]}
                    onPress={selectImage}>
                    <MaterialIcons
                      name="photo-library"
                      size={30}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              )}
              <AlcoholInput
                label="주류 이름*"
                value={alcoholName}
                onChangeText={text => setAlcoholName(text)}
                placeholder="주류 이름*"
              />

              <AlcoholInput
                label="주류 소개"
                value={alcoholDescription}
                onChangeText={setAlcoholDescription}
                placeholder="주류 소개"
                isMultiline={true}
              />

              <AlcoholInput
                label="주류 가격*"
                value={alcoholPrice}
                onChangeText={setAlcoholPrice}
                placeholder="주류 가격*"
              />

              <RptAlcoholPicker
                selectedType={alcoholType}
                onTypeChange={setAlcoholType}
              />
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
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 15, // ✅ 둥근 모서리 추가
    alignItems: 'center',
    elevation: 10, // ✅ 안드로이드 그림자
    shadowColor: '#000', // ✅ iOS 그림자
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
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
    right: 65,
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
    left: 65,
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

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AlcoholModal;
