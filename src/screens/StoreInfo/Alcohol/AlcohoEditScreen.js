// ⚠ 전체 코드 복사해서 그대로 붙여도 바로 정상 동작합니다.

import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useLayoutEffect,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  BackHandler,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from 'react-native';

import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../../hooks/usePhotopermis';

import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../../constants/imagePickerLabels';

import useCustomAlert from '../../../hooks/useCustomAlert';
import Loading from '../../../hooks/Loading';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useToast} from '../../../context/ToastContext';
import ImagePicker from 'react-native-image-crop-picker';
import ImagePickermodal from '../../../hooks/ImagePickermodal';
import FastImage from 'react-native-fast-image';
import {
  DrinkDeleteImage,
  DrinkUpdate,
  DrinkUpdateImage,
  StoreDrinkcreate,
  StoreDrinkdelete,
} from '../../../api/drinkApi';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ColorUtil from '../../../utils/ColorUtil';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import forbiddenWords from '../../../hooks/forbiddenWords';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const alcoholTypes = [
  {label: '소주', value: 'SOJU'},
  {label: '맥주', value: 'BEER'},
  {label: '막걸리', value: 'MAKGEOLLI'},
  {label: '전통주', value: 'TRADITIONAL'},
  {label: '하이볼', value: 'HIGHBALL'},
  {label: '와인', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '사케', value: 'SAKE'},
  {label: '고량주', value: 'KAOLIANG'},
  {label: '위스키', value: 'WHISKEY'},
  {label: '보드카', value: 'VODKA'},
  {label: '데킬라', value: 'TEQUILA'},
];

const screenWidth = Dimensions.get('window').width;
const sidePadding = 20;
const ITEM_GAP = 10;
const NUM_COLUMNS = 4;

const itemWidth =
  (screenWidth - sidePadding * 2 - ITEM_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const AlcoholEditScreen = ({route, navigation}) => {
  const {
    alcoholId,
    alcoholName,
    alcoholType,
    alcoholPrice,
    alcoholImgUrl,
    alcoholdescription,
    storeId,
  } = route.params;

  const {bottom} = useSafeAreaInsets();
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();
  const [loading, setLoading] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPriceFocused, setIsPirceFocused] = useState(false);
  const [isDesFocused, setIsDesFocused] = useState(false);

  const originalImage = useRef(alcoholImgUrl ?? null);

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

  const [image, setImage] = useState(originalImage.current);
  const [selectedImage, setSelectedImage] = useState(null);
  const imageCount = Array.isArray(image) ? image.length : image ? 1 : 0;
  const [alcoholTypeValue, setAlcoholTypeValue] = useState(
    alcoholType || 'SOJU',
  );
  const [nameValue, setNameValue] = useState(alcoholName || '');
  const [descValue, setDescValue] = useState(alcoholdescription || '');
  const [nameHasForbidden, setNameHasForbidden] = useState(
    containsForbiddenWord(alcoholName || ''),
  );
  const [descHasForbidden, setDescHasForbidden] = useState(
    containsForbiddenWord(alcoholdescription || ''),
  );

  const [isVariablePrice, setIsVariablePrice] = useState(
    alcoholPrice === '변동',
  );
  const [priceValue, setPriceValue] = useState(
    alcoholPrice === '변동' ? '' : alcoholPrice || '',
  );

  const [priceerror, setPriceerror] = useState(false);
  const [nameerror, setNameerror] = useState(false);

  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  // 뒤로가기 핸들러

  // 이미지 선택
  const selectImage = () => {
    if (imageCount >= 1) {
      showToast('주류 사진은 최대 1장입니다.', 'center');
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
        setImage(null);
        setSelectedImage(null);
      },
    });
  };

  // 변경 여부 계산
  const isChanged = useMemo(() => {
    if (!alcoholId) return false; // 수정 모드일 때만

    const initialPrice = alcoholPrice === '변동' ? '변동' : alcoholPrice;
    const currentPrice = isVariablePrice ? '변동' : priceValue;

    const hasImageChanged = image !== originalImage.current;

    return (
      nameValue !== alcoholName ||
      descValue !== alcoholdescription ||
      hasImageChanged ||
      currentPrice !== initialPrice ||
      alcoholTypeValue !== alcoholType
    );
  }, [
    nameValue,
    descValue,
    image,
    alcoholName,
    alcoholdescription,
    alcoholTypeValue,
    alcoholType,
    alcoholPrice,
    priceValue,
    isVariablePrice,
  ]);

  const isRequiredFilled = useMemo(() => {
    if (alcoholId) return false;
    return (
      nameValue.trim().length > 0 &&
      alcoholTypeValue &&
      (isVariablePrice || priceValue.trim().length > 0)
    );
  }, [nameValue, alcoholTypeValue, priceValue, isVariablePrice, alcoholId]);

  const hasCreateInput = useMemo(() => {
    if (alcoholId) return false;
    return (
      !!image ||
      nameValue.trim().length > 0 ||
      descValue.trim().length > 0 ||
      (!isVariablePrice && priceValue.trim().length > 0) ||
      isVariablePrice ||
      alcoholTypeValue != 'SOJU'
    );
  }, [
    alcoholId,
    descValue,
    image,
    nameValue,
    priceValue,
    isVariablePrice,
    alcoholTypeValue,
  ]);

  const hasForbiddenWords = nameHasForbidden || descHasForbidden;
  const isButtonEnabled =
    !hasForbiddenWords && (alcoholId ? isChanged : isRequiredFilled);
  const hasUnsavedChanges = alcoholId ? isChanged : hasCreateInput;

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
  }, [navigation, isChanged, hasUnsavedChanges]);

  // 저장
  const AlcoholAdd = useCallback(async () => {
    if (priceValue == '') {
      setPriceerror(true);
      return;
    }
    if (nameValue == '') {
      setNameerror(true);
      return;
    }
    setLoading(true);
    try {
      if (alcoholId) {
        // 수정
        const payload = {
          name: nameValue,
          description: descValue,
          price: isVariablePrice ? '변동' : priceValue,
          type: alcoholTypeValue,
        };

        await DrinkUpdate(alcoholId, payload);

        if (image !== originalImage.current) {
          // 이미지 변경됨
          if (!image) {
            await DrinkDeleteImage(alcoholId);
          } else {
            await DrinkUpdateImage(alcoholId, image);
          }
        }

        showToast('주류가 수정되었습니다.');
        navigation.goBack();
        return;
      }

      // 신규 등록
      const data = {
        file: selectedImage?.path ?? null,
        createDrinkDto: {
          name: nameValue,
          description: descValue,
          price: isVariablePrice ? '변동' : priceValue,
          storeId,
          type: alcoholTypeValue,
        },
      };

      await StoreDrinkcreate(data);
      showToast('주류가 추가되었습니다.');
      navigation.goBack();
    } catch (error) {
      console.log('AlcoholAdd Error:', error);
      showToast('문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [
    descValue,
    image,
    isVariablePrice,
    alcoholId,
    alcoholType,
    nameValue,
    navigation,
    priceValue,
    selectedImage,
    showToast,
    storeId,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={isButtonEnabled ? AlcoholAdd : null}>
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
  }, [navigation, isButtonEnabled, handleBackPress, AlcoholAdd]);

  const lastBackPressed = useRef(0);

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

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => backHandler.remove();
    }, [navigation, hasUnsavedChanges]),
  );

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
          {/* 이미지 영역 */}

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

          {/* 주종 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>주종</Text>
            <View style={styles.alcoholGrid}>
              {alcoholTypes.map(item => {
                const isSelected = alcoholTypeValue === item.value;

                return (
                  <Pressable
                    key={item.value}
                    style={[
                      styles.alcoholItem,
                      {width: itemWidth},
                      isSelected
                        ? styles.alcoholSelected
                        : styles.alcoholUnselected,
                    ]}
                    onPress={() => setAlcoholTypeValue(item.value)}>
                    <Text
                      style={[
                        styles.alcoholLabel,
                        isSelected
                          ? styles.alcoholLabelSelected
                          : styles.alcoholLabelUnselected,
                      ]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 이름 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>주류 이름</Text>
            <TextInput
              style={[
                styles.input,
                (nameHasForbidden || nameerror) && styles.fobiddenerror,
                isNameFocused &&
                  !nameHasForbidden &&
                  !nameerror &&
                  styles.isFocused,
              ]}
              value={nameValue}
              onChangeText={handleNameChange}
              maxLength={50}
              placeholder="주류 이름을 입력하세요"
              placeholderTextColor={ColorUtil.placeholderText}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
            />
            {nameHasForbidden && (
              <Text style={styles.forbiddenText}>
                비속어 및 이용 약관에 위배되는 내용이 포함되어 있습니다.
              </Text>
            )}
            {nameerror && (
              <Text style={styles.forbiddenText}>
                주류 이름을 입력해주세요.
              </Text>
            )}
            <Text style={styles.countText}>{nameValue.length}/50</Text>
          </View>

          {/* 가격 */}
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>주류 가격</Text>
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
              <>
                <View
                  style={[
                    styles.priceInputBox,
                    isPriceFocused && !priceerror && styles.isFocused,
                    priceerror && styles.fobiddenerror,
                  ]}>
                  <TextInput
                    style={styles.priceInput}
                    keyboardType="numeric"
                    placeholder="주류 가격을 입력하세요."
                    value={priceValue}
                    onChangeText={handlePriceChange}
                    placeholderTextColor={ColorUtil.placeholderText}
                    onFocus={() => setIsPirceFocused(true)}
                    onBlur={() => setIsPirceFocused(false)}
                  />
                  <Text style={styles.won}>원</Text>
                </View>
                {priceerror && (
                  <Text style={styles.forbiddenText}>가격을 입력해주세요.</Text>
                )}
              </>
            )}
          </View>

          {/* 소개 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>주류 소개 (선택)</Text>
            <TextInput
              style={[
                styles.textarea,
                descHasForbidden && styles.fobiddenerror,
                isDesFocused && !descHasForbidden && styles.isFocused,
              ]}
              value={descValue}
              onChangeText={handleDescChange}
              maxLength={100}
              multiline
              placeholder="가격, 특이사항 등 추가 설명을 적어주세요."
              placeholderTextColor={ColorUtil.placeholderText}
              onFocus={() => setIsDesFocused(true)}
              onBlur={() => setIsDesFocused(false)}
            />
            {descHasForbidden && (
              <Text style={styles.forbiddenText}>
                비속어 및 이용 약관에 위배되는 내용이 포함되어 있습니다.
              </Text>
            )}
            <Text style={styles.countText}>{descValue.length}/100</Text>
          </View>

          {/* 삭제 버튼 */}
          {alcoholId && (
            <View style={styles.deleteMenuBtn}>
              <Pressable
                hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}
                onPress={() =>
                  showAlert({
                    title: '주류 삭제',
                    message: '정말 삭제하시겠습니까?',
                    type: 'delete',
                    onConfirm: async () => {
                      try {
                        await StoreDrinkdelete(alcoholId);
                        showToast('주류가 삭제되었습니다.');
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

      <Loading loading={loading} />
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

  section: {marginTop: 18},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
    marginRight: 12,
  },
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
  alcoholGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  alcoholItem: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  alcoholSelected: {backgroundColor: '#E8F7FF', borderColor: '#3CBBFF'},
  alcoholUnselected: {backgroundColor: '#fff', borderColor: '#D0D4DB'},
  alcoholLabel: {fontSize: 14},
  alcoholLabelSelected: {color: '#3CBBFF', fontWeight: '600'},
  alcoholLabelUnselected: {color: '#999'},

  input: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E3E7ED',
    fontSize: 15,
  },
  fobiddenerror: {
    borderColor: 'red',
  },
  isFocused: {
    borderColor: '#3CBBFF',
  },
  textarea: {
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E3E7ED',
    textAlignVertical: 'top',
    fontSize: 15,
  },
  countText: {fontSize: 13, color: '#9AA3B2', marginTop: 4, textAlign: 'right'},
  forbiddenText: {
    marginTop: 6,
    fontSize: 12,
    color: '#FF4D4F',
    fontFamily: 'Pretendard-Medium',
  },

  rowBetween: {flexDirection: 'row', alignItems: 'center'},
  radioItem: {flexDirection: 'row', alignItems: 'center', marginBottom: 11},
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  radioSelectedCircle: {borderColor: '#3CBBFF'},
  radioInnerDot: {
    width: 9,
    height: 9,
    borderRadius: 9,
    backgroundColor: '#3CBBFF',
  },
  radioLabel: {fontSize: 14, color: '#999'},
  radioLabelSelected: {color: '#333', fontWeight: '600'},

  priceInputBox: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3E7ED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 6,
  },
  priceInput: {flex: 1, fontSize: 15},
  won: {fontSize: 15, color: '#555', marginLeft: 4},

  deleteMenuBtn: {marginTop: 20, marginBottom: 40, alignItems: 'flex-start'},
  deleteMenuText: {
    fontSize: 13,
    color: 'red',
    fontWeight: '600',
    borderBottomWidth: 0.7,
  },
});

export default AlcoholEditScreen;
