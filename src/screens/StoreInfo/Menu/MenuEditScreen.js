import React, {
  useLayoutEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  ToastAndroid,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../../hooks/usePhotopermis';

import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../../constants/imagePickerLabels';

import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import ImagePickermodal from '../../../hooks/ImagePickermodal';

import {useToast} from '../../../context/ToastContext';
import useCustomAlert from '../../../hooks/useCustomAlert';

import {
  MenuUpdate,
  MenuUpdateImage,
  MenuDeleteImage,
  StoreMenucreate,
  StoreMenudelete,
} from '../../../api/menuApi';

import {useFocusEffect} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ColorUtil from '../../../utils/ColorUtil';
import forbiddenWords from '../../../hooks/forbiddenWords';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const MenuEditScreen = ({route, navigation}) => {
  const {
    storeId,
    menuId,
    menuName,
    menuType,
    menuPrice,
    menuImgUrl,
    menudescription,
  } = route.params;

  const {bottom} = useSafeAreaInsets();
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPriceFocused, setIsPirceFocused] = useState(false);
  const [isDesFocused, setIsDesFocused] = useState(false);

  // 🟦 원본 이미지 저장
  const originalImage = useRef(menuImgUrl ?? null);

  const [menuTypeValue, setMenuTypeValue] = useState(menuType || 'MAIN');
  const containsForbiddenWord = useCallback(
    text => {
      if (typeof text !== 'string') {
        return false;
      }
      const normalized = text.toLowerCase();
      return forbiddenWords.some(word =>
        normalized.includes(String(word).toLowerCase()),
      );
    },
    [forbiddenWords],
  );
  const [nameValue, setNameValue] = useState(menuName || '');
  const [descValue, setDescValue] = useState(menudescription || '');
  const [nameHasForbidden, setNameHasForbidden] = useState(
    containsForbiddenWord(menuName || ''),
  );
  const [descHasForbidden, setDescHasForbidden] = useState(
    containsForbiddenWord(menudescription || ''),
  );
  const [isVariablePrice, setIsVariablePrice] = useState(menuPrice === '변동');
  const [priceValue, setPriceValue] = useState(
    menuPrice === '변동' ? '' : menuPrice || '',
  );

  const [image, setImage] = useState(originalImage.current);
  const [selectedImage, setSelectedImage] = useState(null);
  const imageCount = Array.isArray(image) ? image.length : image ? 1 : 0;

  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  const lastBackPressed = useRef(0);

  // 이미지 선택
  const selectImage = () => {
    if (imageCount >= 1) {
      showToast('메뉴 사진은 최대 1장입니다.', 'center');
      return;
    }
    setBottomSheetVisible(true);
  };

  const handleCameraPick = async () => {
    const hasCamera = await requestCameraPermission();
    if (!hasCamera) return;

    ImagePicker.openCamera({
      width: 1024,
      height: 1024,
      cropping: true,
      mediaType: 'photo',
      quality: 1,
      ...IMAGE_PICKER_TEXTS,
      ...IMAGE_CROPPER_TEXTS,
    })
      .then(img => {
        setSelectedImage(img);
        setImage(img.path);
      })
      .catch(() => {});
  };

  const handleGalleryPick = async () => {
    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) return;

    ImagePicker.openPicker({
      width: 1024,
      height: 1024,
      cropping: true,
      mediaType: 'photo',
      quality: 1,
      ...IMAGE_PICKER_TEXTS,
      ...IMAGE_CROPPER_TEXTS,
    })
      .then(img => {
        setSelectedImage(img);
        setImage(img.path);
      })
      .catch(() => {});
  };

  // 이미지 삭제
  const deleteImage = () => {
    showAlert({
      title: '이미지 삭제',
      message: '이미지를 삭제하시겠습니까?',
      type: 'delete',
      onConfirm: () => {
        if (!originalImage.current) {
          setImage(null);
        } else {
          setImage(originalImage.current);
        }
        setSelectedImage(null);
      },
    });
  };

  const normalize = v => (!v ? '' : v.split('?')[0]);

  const isEditingMode = Boolean(menuId);

  // 변경 여부 판단
  const isChanged = useMemo(() => {
    if (!isEditingMode) return false;

    const initialPrice = menuPrice === '변동' ? '변동' : menuPrice;
    const currentPrice = isVariablePrice ? '변동' : priceValue;

    const hasImageChanged =
      normalize(image) !== normalize(originalImage.current);

    return (
      nameValue !== menuName ||
      descValue !== menudescription ||
      hasImageChanged ||
      currentPrice !== initialPrice ||
      menuTypeValue !== menuType
    );
  }, [
    nameValue,
    descValue,
    image,
    menuName,
    menudescription,
    menuPrice,
    menuTypeValue,
    menuType,
    priceValue,
    isVariablePrice,
  ]);

  // 신규 등록 시 필수 체크
  const isRequiredFilled = useMemo(() => {
    if (isEditingMode) return false;
    return (
      nameValue.trim().length > 0 &&
      menuTypeValue &&
      (isVariablePrice || priceValue.trim().length > 0)
    );
  }, [isEditingMode, isVariablePrice, menuTypeValue, nameValue, priceValue]);

  const hasCreateInput = useMemo(() => {
    if (isEditingMode) return false;
    return (
      nameValue.trim().length > 0 ||
      descValue.trim().length > 0 ||
      (!isVariablePrice && priceValue.trim().length > 0) ||
      isVariablePrice ||
      !!image ||
      menuTypeValue !== 'MAIN'
    );
  }, [
    descValue,
    image,
    isEditingMode,
    isVariablePrice,
    menuTypeValue,
    nameValue,
    priceValue,
  ]);

  const hasForbiddenWords = nameHasForbidden || descHasForbidden;
  const isButtonEnabled =
    !hasForbiddenWords && (isEditingMode ? isChanged : isRequiredFilled);
  const hasUnsavedChanges = isEditingMode ? isChanged : hasCreateInput;

  const handleBackPress = useCallback(() => {
    if (!hasUnsavedChanges) {
      navigation.goBack();
      return;
    }
    showAlert({
      title: '작성한 내용이 저장되지 않았습니다.',
      message: '뒤로 가시겠습니까?',
      onConfirm: () => {
        navigation.goBack();
      },
      onCancel: null,
      type: 'confirm',
    });
  }, [hasUnsavedChanges, navigation, showAlert]);

  useEffect(() => {
    navigation.setParams({hasChanges: isChanged});
  }, [navigation, isChanged, hasCreateInput]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={isButtonEnabled ? MenuAdd : null}>
          <Text
            style={[
              styles.headerButton,
              {color: isButtonEnabled ? '#3CBBFF' : '#A5AAB3'},
            ]}>
            완료
          </Text>
        </Pressable>
      ),
      headerLeft: () => (
        <Pressable onPress={handleBackPress} hitSlop={10}>
          <Ionicons
            name="arrow-back-outline"
            size={23}
            color="#333"
            style={{paddingLeft: 12}}
          />
        </Pressable>
      ),
    });
  }, [navigation, isButtonEnabled, handleBackPress]);

  // 뒤로가기 두 번 누르기
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();
        if (!hasUnsavedChanges) return;

        if (now - lastBackPressed.current < 2000) {
          navigation.goBack();
          return true;
        }

        lastBackPressed.current = now;
        ToastAndroid.show(
          '한 번 더 누르면 작성한 내용이 사라집니다.',
          ToastAndroid.SHORT,
        );
        return true;
      };

      const handler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => handler.remove();
    }, [navigation, hasUnsavedChanges]),
  );

  // 저장 처리
  const MenuAdd = async () => {
    try {
      if (menuId) {
        // 수정
        const payload = {
          name: nameValue,
          description: descValue,
          price: isVariablePrice ? '변동' : priceValue,
          menuType: menuTypeValue,
        };

        await MenuUpdate(menuId, payload);

        // 이미지 변경 처리
        if (normalize(image) !== normalize(originalImage.current)) {
          if (!image) {
            await MenuDeleteImage(menuId);
          } else {
            await MenuUpdateImage(menuId, image);
          }
        }

        showToast('메뉴가 수정되었습니다.');
        navigation.goBack();
        return;
      }

      // 신규 등록
      const data = {
        file: selectedImage?.path ?? null,
        createMenuDto: {
          name: nameValue,
          description: descValue,
          price: isVariablePrice ? '변동' : priceValue,
          storeId,
          menuType: menuTypeValue,
        },
      };

      await StoreMenucreate(data);
      showToast('메뉴가 추가되었습니다.');
      navigation.goBack();
    } catch (error) {
      console.log('MenuAdd error:', error);
      showToast('문제가 발생했습니다.');
    }
  };

  const handlePriceChange = text => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let num = cleaned === '' ? '' : parseInt(cleaned, 10);
    if (typeof num === 'number' && !isNaN(num)) {
      if (num > 100000000) {
        num = 100000000;
      } else {
      }
    }
    const value = num === '' ? '' : String(num);
    setPriceValue(value);
  };

  const handleNameChange = text => {
    setNameValue(text);
    setNameHasForbidden(containsForbiddenWord(text));
  };

  const handleDescChange = text => {
    setDescValue(text);
    setDescHasForbidden(containsForbiddenWord(text));
  };

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 80;

  return (
    <SafeAreaView style={[styles.safe, {paddingBottom: bottom}]}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          {/* 이미지 */}
          <View style={styles.imageBoxWrapper}>
            <Pressable style={styles.emptyBox} onPress={selectImage}>
              <MaterialIcons name="photo-camera" size={32} color="#7B8089" />
              <Text style={styles.countText}>{imageCount}/1</Text>
            </Pressable>

            {image && (
              <View style={styles.imagePreviewWrapper}>
                <FastImage source={{uri: image}} style={styles.image} />
                <Pressable style={styles.deleteIcon} onPress={deleteImage}>
                  <MaterialCommunityIcons name="close" size={18} color="#fff" />
                </Pressable>
              </View>
            )}
          </View>

          {/* 메뉴 타입 선택 */}
          <View style={styles.sectionBlock}>
            <View style={styles.radioGroup}>
              {[
                {label: '대표', value: 'MAIN'},
                {label: '일반', value: 'NORMAL'},
                {label: '사이드', value: 'SIDE'},
              ].map(item => {
                const selected = menuTypeValue === item.value;

                return (
                  <Pressable
                    key={item.value}
                    style={styles.radioItem}
                    onPress={() => setMenuTypeValue(item.value)}>
                    <View
                      style={[
                        styles.radioCircle,
                        selected && styles.radioSelectedCircle,
                      ]}>
                      {selected && <View style={styles.radioInnerDot} />}
                    </View>

                    <Text
                      style={[
                        styles.radioLabel,
                        selected && styles.radioLabelSelected,
                      ]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {menuTypeValue === 'MAIN' && !image && (
              <View style={styles.typeInfoRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color="#A5AAB3"
                  style={{marginRight: 4}}
                />
                <Text style={styles.typeInfoText}>
                  대표 메뉴는 사진이 없으면 카테고리 탭에 표시되지 않아요.
                </Text>
              </View>
            )}
          </View>

          {/* 메뉴 이름 */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>메뉴 이름</Text>
            <TextInput
              style={[
                styles.input,
                nameHasForbidden && styles.fobiddenerror,
                isNameFocused && !nameHasForbidden && styles.isFocused,
              ]}
              placeholder="메뉴 이름을 입력하세요"
              placeholderTextColor={ColorUtil.placeholderText}
              value={nameValue}
              onChangeText={handleNameChange}
              maxLength={50}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
            />
            {nameHasForbidden && (
              <Text style={styles.forbiddenText}>
                비속어 및 이용 약관에 위배되는 내용이 포함되어 있습니다.
              </Text>
            )}
            <View style={styles.textCountRow}>
              <Text style={styles.countText}>{nameValue.length}/50</Text>
            </View>
          </View>

          {/* 가격 */}
          <View style={styles.sectionBlock}>
            <View style={styles.priceHeaderRow}>
              <Text style={[styles.sectionTitle, styles.priceTitle]}>
                메뉴 가격
              </Text>

              <Pressable
                style={styles.radioItem}
                onPress={() => setIsVariablePrice(prev => !prev)}>
                <View
                  style={[
                    styles.radioCircle,
                    isVariablePrice && styles.radioSelectedCircle,
                  ]}>
                  {isVariablePrice && <View style={styles.radioInnerDot} />}
                </View>

                <Text
                  style={[
                    styles.radioLabel,
                    isVariablePrice && styles.radioLabelSelected,
                  ]}>
                  변동
                </Text>
              </Pressable>
            </View>

            {!isVariablePrice && (
              <View
                style={[
                  styles.priceInputBox,
                  isPriceFocused && styles.isFocused,
                ]}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="메뉴 가격을 입력하세요."
                  placeholderTextColor={ColorUtil.placeholderText}
                  keyboardType="numeric"
                  value={priceValue}
                  onChangeText={handlePriceChange}
                  onFocus={() => setIsPirceFocused(true)}
                  onBlur={() => setIsPirceFocused(false)}
                />
                <Text style={styles.won}>원</Text>
              </View>
            )}
          </View>

          {/* 설명 */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>메뉴 소개 (선택)</Text>
            <TextInput
              style={[
                styles.input,
                styles.textarea,
                descHasForbidden && styles.fobiddenerror,
                isDesFocused && !descHasForbidden && styles.isFocused,
              ]}
              placeholder="가격, 메뉴 특이사항 등 추가 설명을 적어주세요."
              placeholderTextColor={ColorUtil.placeholderText}
              multiline
              value={descValue}
              onChangeText={handleDescChange}
              maxLength={100}
              onFocus={() => setIsDesFocused(true)}
              onBlur={() => setIsDesFocused(false)}
            />
            {descHasForbidden && (
              <Text style={styles.forbiddenText}>
                비속어 및 이용 약관에 위배되는 내용이 포함되어 있습니다.
              </Text>
            )}
            <View style={styles.textCountRow}>
              <Text style={styles.countText}>{descValue.length}/100</Text>
            </View>
          </View>
          {/* 삭제 버튼 */}
          {menuId && (
            <View style={styles.deleteMenuBtn}>
              <Pressable
                hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}
                onPress={() =>
                  showAlert({
                    title: '메뉴 삭제',
                    message: '정말 삭제하시겠습니까?',
                    type: 'delete',
                    onConfirm: async () => {
                      try {
                        await StoreMenudelete(menuId);
                        showToast('메뉴가 삭제되었습니다.');
                        navigation.goBack();
                      } catch (e) {
                        console.log(e);
                        showToast('삭제 중 문제가 발생했습니다.');
                      }
                    },
                  })
                }>
                <Text style={styles.deleteMenuText}>삭제하기</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <AlertComponent />
      <ImagePickermodal
        isBottomSheetVisible={isBottomSheetVisible}
        setBottomSheetVisible={setBottomSheetVisible}
        handleCameraPick={handleCameraPick}
        handleGalleryPick={handleGalleryPick}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 18,
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF',
  },
  safe: {flex: 1, backgroundColor: '#fff'},
  scrollContainer: {paddingHorizontal: 20, paddingVertical: 18},

  sectionBlock: {marginTop: 18},

  /* 이미지 */
  imageBoxWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  emptyBox: {
    width: 100, // 정사각형 비율 (약 80~90px)
    aspectRatio: 1,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CBCDD2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  countText: {
    marginTop: 6,
    fontSize: 15,
    color: '#7B8089',
    fontFamily: 'Pretendard-Medium',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#F3F3F3',
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  deleteIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    elevation: 4,
  },

  /* 타입 안내 */
  typeInfoRow: {flexDirection: 'row', alignItems: 'center', marginTop: 6},
  typeInfoText: {fontSize: 13, color: '#A5AAB3'},

  /* 공통 텍스트 */
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },

  input: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E3E7ED',
  },
  fobiddenerror: {
    borderColor: 'red',
  },
  isFocused: {
    borderColor: '#3CBBFF',
  },

  textarea: {height: 120, textAlignVertical: 'top'},

  textCountRow: {alignItems: 'flex-end', marginTop: 4},
  countText: {fontSize: 13, color: '#9AA3B2'},
  forbiddenText: {
    marginTop: 6,
    fontSize: 12,
    color: '#FF4D4F',
    fontFamily: 'Pretendard-Medium',
  },

  /* 라디오 */
  radioGroup: {flexDirection: 'row', alignItems: 'center'},
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  radioSelectedCircle: {borderColor: '#3CBBFF'},
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#3CBBFF',
  },
  radioLabel: {fontSize: 14, color: '#999'},
  radioLabelSelected: {color: '#333', fontWeight: '600'},

  /* 가격 */
  priceHeaderRow: {flexDirection: 'row', alignItems: 'center'},
  priceTitle: {marginRight: 12},
  priceInputBox: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3E7ED',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {flex: 1, fontSize: 15},
  won: {fontSize: 15, color: '#555', marginLeft: 4},

  deleteMenuBtn: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'flex-start',
  },
  deleteMenuText: {
    fontSize: 13,
    color: 'red',
    fontWeight: '600',
    borderBottomWidth: 0.7,
  },
});

export default MenuEditScreen;
