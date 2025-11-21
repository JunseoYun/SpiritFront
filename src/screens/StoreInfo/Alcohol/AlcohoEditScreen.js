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
  ToastAndroid,
  BackHandler,
  Pressable,
  Dimensions,
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

  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  const lastBackPressed = useRef(0);

  // 뒤로가기 핸들러

  // 이미지 선택
  const selectImage = () => setBottomSheetVisible(true);

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
        // 원래 이미지 없었으면 null로 복귀
        if (!originalImage.current) {
          setImage(null);
        } else {
          // 원래 이미지 있었으면 원래 이미지로 복귀
          setImage(originalImage.current);
        }
        setSelectedImage(null);
      },
    });
  };

  const normalize = v => (!v ? '' : v.split('?')[0]);

  // 변경 여부 계산
  const isChanged = useMemo(() => {
    if (!alcoholId) return false; // 수정 모드일 때만

    const initialPrice = alcoholPrice === '변동' ? '변동' : alcoholPrice;
    const currentPrice = isVariablePrice ? '변동' : priceValue;

    const hasImageChanged =
      normalize(image) !== normalize(originalImage.current);

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

  const hasForbiddenWords = nameHasForbidden || descHasForbidden;
  const isButtonEnabled =
    !hasForbiddenWords && (alcoholId ? isChanged : isRequiredFilled);

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
    });
  }, [navigation, isButtonEnabled]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();
        if (!isChanged) return;
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
    }, [navigation, isChanged]),
  );

  // 저장
  const AlcoholAdd = async () => {
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

        if (normalize(image) !== normalize(originalImage.current)) {
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

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;

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
            <View style={styles.imageWrapper}>
              <View style={styles.imageContainer}>
                {!image ? (
                  <Pressable style={styles.emptyBox} onPress={selectImage}>
                    <Ionicons name="image-outline" size={42} color="#9BA5B2" />
                  </Pressable>
                ) : (
                  <FastImage source={{uri: image}} style={styles.image} />
                )}
              </View>

              {image && (
                <Pressable style={styles.deleteIcon} onPress={deleteImage}>
                  <MaterialCommunityIcons name="close" size={18} color="#fff" />
                </Pressable>
              )}
            </View>
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
                nameHasForbidden && styles.fobiddenerror,
                isNameFocused && !nameHasForbidden && styles.isFocused,
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
              <View
                style={[
                  styles.priceInputBox,
                  isPriceFocused && styles.isFocused,
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
            <Pressable
              style={styles.deleteMenuBtn}
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

  imageBoxWrapper: {alignItems: 'center', marginBottom: 20},
  imageWrapper: {width: '45%', aspectRatio: 1, position: 'relative'},
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F2F3F5',
  },
  emptyBox: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  image: {width: '100%', height: '100%'},
  deleteIcon: {
    position: 'absolute',
    top: -7,
    right: -7,
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
