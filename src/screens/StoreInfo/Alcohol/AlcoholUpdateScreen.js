import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  DrinkUpdate,
  DrinkUpdateImage,
  DrinkDeleteImage,
} from '../../../api/drinkApi';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useCustomAlert from '../../../hooks/useCustomAlert';
import forbiddenWords from '../../../hooks/forbiddenWords';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useRoute} from '@react-navigation/native';
import AlcoholInput from '../../../components/StoreAlcoholScreen/AlcoholInput';
import Alcoholpriceinput from '../../../components/StoreAlcoholScreen/Alcoholpriceinput';
import RptAlcoholPicker from '../../../components/AlcoholAddScreen/RptAlcoholPicker';
import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../../hooks/usePhotopermis';
import ImagePickermodal from '../../../hooks/ImagePickermodal';
import Loading from '../../../hooks/Loading';

const AlcoholUpdateScreen = ({navigation}) => {
  const route = useRoute();
  const {alcohol, storeId} = route.params;
  const [originalAlcohol, setOriginalAlcohol] = useState('');
  const [alcoholName, setAlcoholName] = useState('');
  const [alcoholDescription, setAlcoholDescription] = useState('');
  const [alcoholPrice, setAlcoholPrice] = useState('');
  const [alcoholType, setAlcoholType] = useState('');
  const [alcoholImage, setAlcoholImage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isVariable, setIsVariable] = useState(false);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSave}>
          <Text style={[styles.searchButton]}>완료</Text>
        </Pressable>
      ),
    });
  }, [
    handleSave,
    alcoholName,
    alcoholDescription,
    alcoholImage,
    alcoholPrice,
    alcoholType,
  ]);

  useEffect(() => {
    if (alcohol) {
      setOriginalAlcohol(alcohol);
      setAlcoholName(alcohol.name || '');
      setAlcoholDescription(alcohol.description || '');

      setAlcoholType(alcohol.type || '');
      setAlcoholImage(alcohol.imgUrl || '');
    }
  }, [alcohol]);

  useEffect(() => {
    const isVar = alcohol.price === '변동';
    setIsVariable(isVar);
    setAlcoholPrice(isVar ? '변동' : alcohol.price || '');
  }, [alcohol]);

  const GotoStoreScreen = () => {
    showAlert({
      title: `수정이 완료되었습니다.`,
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
    setBottomSheetVisible(true); // 바텀시트 열기
  };

  const handleCameraPick = async () => {
    const hasCamera = await requestCameraPermission();
    if (!hasCamera) {
      return;
    }
    ImagePicker.openCamera({
      width: 1024,
      height: 1024,
      cropping: true,
      mediaType: 'photo',
      quality: 1,
    })
      .then(image => {
        setSelectedImage(image);
        setAlcoholImage(image.path);
        setIsImageDeleted(false);
      })
      .catch(error => {});
  };

  const handleGalleryPick = async () => {
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) {
      return;
    }
    ImagePicker.openPicker({
      width: 1024,
      height: 1024,
      cropping: true,
      mediaType: 'photo',
      quality: 1,
    })
      .then(image => {
        setSelectedImage(image);
        setAlcoholImage(image.path);
        setIsImageDeleted(false);
      })
      .catch(error => {});
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
      setLoading(true);
      let updatedAlcohol = {...originalAlcohol};

      // 1️⃣ 이미지만 변경된 경우 → 이미지 업데이트 요청
      if (isImageChanged && !isInfoChanged) {
        await DrinkUpdateImage(alcohol.id, selectedImage);
        updatedAlcohol.imgUrl = selectedImage.path;
        GotoStoreScreen();
      }

      // 2️⃣ 정보만 변경된 경우 → 메뉴 정보 업데이트 요청
      if (!isImageChanged && isInfoChanged) {
        updatedAlcohol = {
          ...updatedAlcohol,
          name: alcoholName,
          description: alcoholDescription,
          price: alcoholPrice,
          type: alcoholType,
        };
        await DrinkUpdate(alcohol.id, updatedAlcohol);
        GotoStoreScreen();
      }

      // 3️⃣ 둘 다 변경된 경우 → 이미지 업데이트 후 정보 업데이트 요청
      if (isImageChanged && isInfoChanged) {
        await DrinkUpdateImage(alcoholData.id, selectedImage);
        updatedAlcohol.imgUrl = selectedImage.path;

        updatedAlcohol = {
          ...updatedAlcohol,
          name: alcoholName,
          description: alcoholDescription,
          price: alcoholPrice,
          type: alcoholType,
        };
        await DrinkUpdate(alcohol.id, updatedAlcohol);
        GotoStoreScreen();
      }

      // 4️⃣ 이미지 삭제가 선택된 경우 → 이미지 삭제 API 호출
      if (isImageDeleted) {
        await DrinkDeleteImage(alcohol.id);
        updatedAlcohol.imgUrl = '';
        GotoStoreScreen();
      }

      // 5️⃣ 변경 사항이 없으면 요청 없이 모달만 닫기
      if (!isImageChanged && !isInfoChanged && !isImageDeleted) {
        navigation.goBack();
        return;
      }
    } catch (error) {
      showAlert({
        title: '업데이트 오류',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    showAlert({
      title: '작성한 내용이 저장되지 않았습니다',
      message: '뒤로 가시겠습니까?',
      onConfirm: () => {
        setAlcoholName('');
        setAlcoholDescription('');
        setAlcoholPrice('');
        setAlcoholType('');
        setAlcoholImage('');
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
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.avoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.innerView}>
              <View style={styles.imageContainer}>
                {alcoholImage ? (
                  <ImageBackground
                    source={{uri: alcoholImage}}
                    style={styles.menuImage}
                    imageStyle={styles.backimagestyle}>
                    {/* ✅ 이미지 안에 아이콘 배치 */}
                    <View style={styles.imageButtonView}>
                      <Pressable
                        style={[styles.imageButton, styles.shadowEffect]}
                        onPress={selectImage}>
                        <MaterialIcons
                          name="photo-library"
                          size={28}
                          color="#fff"
                        />
                      </Pressable>
                      <Pressable
                        style={[styles.deleteButton, styles.shadowEffect]}
                        onPress={handleDeleteImage}>
                        <Ionicons name="trash-outline" size={28} color="#fff" />
                      </Pressable>
                    </View>
                  </ImageBackground>
                ) : (
                  <Pressable onPress={selectImage}>
                    <View style={styles.placeholderImage}>
                      <MaterialCommunityIcons
                        name="plus"
                        size={30}
                        color="#999"
                      />
                    </View>
                  </Pressable>
                )}
              </View>
              <AlcoholInput
                label="주류 이름*"
                value={alcoholName}
                onChangeText={setAlcoholName}
                placeholder="주류 이름*"
              />

              <AlcoholInput
                label="주류 소개"
                value={alcoholDescription}
                onChangeText={setAlcoholDescription}
                placeholder="주류 소개"
                isMultiline={true}
              />

              <Alcoholpriceinput
                label="주류 가격*"
                value={alcoholPrice}
                onChangeText={setAlcoholPrice}
                placeholder="주류 가격*"
                isVariable={isVariable}
                onToggleVariable={() => {
                  setIsVariable(prev => !prev);
                  if (!isVariable)
                    setAlcoholPrice('변동'); // 체크 시 '변동' 값 세팅
                  else setAlcoholPrice(''); // 체크 해제 시 초기화
                }}
              />

              <RptAlcoholPicker
                selectedType={alcoholType}
                onTypeChange={setAlcoholType}
              />
            </View>
          </ScrollView>
          <ImagePickermodal
            isBottomSheetVisible={isBottomSheetVisible}
            setBottomSheetVisible={setBottomSheetVisible}
            handleCameraPick={handleCameraPick}
            handleGalleryPick={handleGalleryPick}
          />
          <AlertComponent />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Loading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'white',
  },
  avoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
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
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
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

  searchButton: {
    marginRight: 18,
    fontSize: 18,
    fontWeight: '500',
    color: '#16BBFF',
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
  innerView: {
    flexGrow: 1,
    paddingBottom: 100, // 키보드가 입력창 가리는 것 방지
  },
});

export default AlcoholUpdateScreen;
