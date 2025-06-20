import React, {useState, useEffect, useCallback, useLayoutEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Switch,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
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
import MenuInput from '../../../components/StoreMenuScreen/MenuInput';
import MenupriceInput from '../../../components/StoreMenuScreen/MenupriceInput';
import MainMenuCheck from '../../../components/MenuAddScreen/MainMenuCheck';

import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../../hooks/usePhotopermis';
import ImagePickermodal from '../../../hooks/ImagePickermodal';
import Loading from '../../../hooks/Loading';

const MenuUpdateScreen = ({navigation}) => {
  const route = useRoute();
  const {menu, storeId} = route.params;
  const [originalMenu, setOriginalMenu] = useState('');
  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuType, setMenuType] = useState('NORMAL');
  const [menuImage, setMenuImage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);

  const [menuNamelength, setMenuNamelength] = useState(false);
  const [menuPricelength, setMenuPricelength] = useState(false);
  const [menuContentlength, setMenuContentlength] = useState(false);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isVariable, setIsVariable] = useState(false);
  const [loading, setLoading] = useState(false);

  const {showAlert, AlertComponent} = useCustomAlert();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSave}>
          <Text style={[styles.searchButton]}>완료</Text>
        </Pressable>
      ),
    });
  }, [handleSave, menuName, menuDescription, menuImage, menuPrice, menuType]);

  useEffect(() => {
    if (menu) {
      setOriginalMenu(menu);
      setMenuName(menu.name || '');
      setMenuDescription(menu.description || '');
      setMenuType(menu.menuType || 'NORMAL');
      setMenuImage(menu.imgUrl || '');
    }
  }, [menu]);

  useEffect(() => {
    const isVar = menu.price === '변동';
    setIsVariable(isVar);
    setMenuPrice(isVar ? '변동' : menu.price || '');
  }, [menu]);

  const MenuChange = (text, value) => {
    if (value == 'menuName') {
      if (text.length > 20) {
        setMenuNamelength(true);
      } else {
        setMenuNamelength(false);
        setMenuName(text);
      }
    }
    if (value == 'menuPrice') {
      if (text.length > 20) {
        setMenuPricelength(true);
      } else {
        setMenuPricelength(false);
        setMenuPrice(text);
      }
    }
    if (value == 'menuDescription') {
      if (text.length > 30) {
        setMenuContentlength(true);
      } else {
        setMenuContentlength(false);
        setMenuDescription(text);
      }
    }
    if (value == 'menuType') {
      if (text) {
        setMenuType(text);
      }
    }
  };

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
        setMenuImage(image.path); // ✅ UI 미리보기 즉시 반영
        setIsImageDeleted(false); // ✅ 삭제 상태 해제
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
      menuType !== originalMenu.menuType;

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
      setLoading(true);
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
          price: menuPrice,
          menuType,
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
          menuType,
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
        navigation.goBack();
        return;
      }
    } catch (error) {
      showAlert({
        title: '수정 실패',
        message: '잘못된 요청입니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ 취소 버튼 클릭 시 원래 데이터로 초기화

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.avoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.innerView}>
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
                      {/* <Text style={styles.placeholderText}>이미지 추가</Text> */}

                      <MaterialCommunityIcons
                        name="plus"
                        size={30}
                        color="#999"
                      />
                    </View>
                  </Pressable>
                )}
              </View>
              <MainMenuCheck
                selectedType={menuType}
                imagecheck={!!menuImage}
                onChangeType={value => MenuChange(value, 'menuType')}
              />
              <MenuInput
                label="메뉴 이름*"
                value={menuName}
                onChangeText={text => MenuChange(text, 'menuName')}
                placeholder="메뉴 이름*"
                maxLength={21}
              />
              {menuNamelength && (
                <View style={styles.errorview}>
                  <Text style={styles.errorText}>최대 20자 입니다.</Text>
                </View>
              )}
              <MenuInput
                label="메뉴 소개"
                value={menuDescription}
                onChangeText={text => MenuChange(text, 'menuDescription')}
                placeholder="메뉴 소개"
                multiline={true} // 여러 줄 입력 활성화
                maxLength={31}
              />
              {menuContentlength && (
                <View style={styles.errorview}>
                  <Text style={styles.errorText}>최대 30자 입니다.</Text>
                </View>
              )}
              <MenupriceInput
                label="메뉴 가격*"
                value={menuPrice}
                onChangeText={setMenuPrice}
                placeholder="메뉴 가격*"
                isVariable={isVariable}
                onToggleVariable={() => {
                  setIsVariable(prev => !prev);
                  if (!isVariable)
                    setMenuPrice('변동'); // 체크 시 '변동' 값 세팅
                  else setMenuPrice(''); // 체크 해제 시 초기화
                }}
                maxLength={21}
              />
              {menuPricelength && (
                <View style={styles.errorview}>
                  <Text style={styles.errorText}>최대 20자 입니다.</Text>
                </View>
              )}
            </View>
          </ScrollView>
          <ImagePickermodal
            isBottomSheetVisible={isBottomSheetVisible}
            setBottomSheetVisible={setBottomSheetVisible}
            handleCameraPick={handleCameraPick}
            handleGalleryPick={handleGalleryPick}
          />
          {/* 알림창 */}
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
    marginTop: 15,
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // ✅ 반투명 배경 추가
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

  storeinputview: {
    marginTop: 30,
    marginHorizontal: 20,
  },

  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  errorview: {
    width: '100%',
    paddingHorizontal: 21,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
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
  searchButton: {
    marginRight: 18,
    fontSize: 18,
    fontWeight: '500',
    color: '#16BBFF',
  },
  innerView: {
    flexGrow: 1,
    paddingBottom: 100, // 키보드가 입력창 가리는 것 방지
  },
});

export default MenuUpdateScreen;
