import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  DrinkUpdate,
  DrinkUpdateImage,
  DrinkDeleteImage,
} from '../../api/drinkApi';
import useCustomAlert from '../../hooks/useCustomAlert';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RptAlcoholPicker from '../AlcoholAddScreen/RptAlcoholPicker';
import Loading from '../../hooks/Loading';
import {useToast} from '../../context/ToastContext';
import {
  requestCameraPermission,
  requestPhotoPermission,
} from '../../hooks/usePhotopermis';
import ImagePickermodal from '../../hooks/ImagePickermodal';
import forbiddenWords from '../../hooks/forbiddenWords';
import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../constants/imagePickerLabels';

const AlcoholItem = ({
  isLast,
  alcohol,
  onDelete,
  onUpdate,
  isUpdatable,
  isMainEditing,
  onTypeChange,
  navigation,
  expose,
  autoEdit,
  draft,
  onDraftChange,
}) => {
  // Initialize editing true when parent edit mode with autoEdit/draft
  const [isEditing, setIsEditing] = useState(
    () => !!(isMainEditing && (autoEdit || !!draft)),
  );
  const [name, setName] = useState(alcohol.name);
  const [description, setDescription] = useState(alcohol.description);
  const [price, setPrice] = useState(alcohol.price);
  const [type, setType] = useState(alcohol.type);
  const [imgUrl, setImgUrl] = useState(alcohol.imgUrl);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const [isVariable, setIsVariable] = useState(alcohol.price === '변동');
  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(false);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [overText, setOverText] = useState(false);
  const [overdesText, setOverdesText] = useState(false);
  const [overnameText, setOvernameText] = useState(false);

  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();

  const onEditStart = () => {
    setOriginal({name, description, price, type, imgUrl, isVariable});
    setIsEditing(true);
  };

  // auto-start editing when requested by parent (e.g., edit screen)
  useEffect(() => {
    if (autoEdit && !isEditing) {
      onEditStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoEdit]);

  // Ensure editing stays on after remount if draft/autoEdit present
  useEffect(() => {
    if (isMainEditing && (autoEdit || draft) && !isEditing) {
      setIsEditing(true);
    }
  }, [isMainEditing, autoEdit, draft, isEditing]);

  useEffect(() => {
    if (isEditing) return;
    setName(alcohol.name);
    setDescription(alcohol.description);
    setPrice(alcohol.price);
    setType(alcohol.type);
    setImgUrl(alcohol.imgUrl);
    setIsVariable(alcohol.price === '변동');
  }, [alcohol, isEditing]);

  // hydrate from parent draft if present (handles remounts)
  useEffect(() => {
    if (!isMainEditing) return;
    if (draft) {
      setName(draft.name ?? alcohol.name);
      setDescription(draft.description ?? alcohol.description);
      setPrice(draft.price ?? alcohol.price);
      setType(draft.type ?? alcohol.type);
      setImgUrl(draft.imgUrl ?? alcohol.imgUrl);
      setIsVariable(
        draft.isVariable !== undefined
          ? draft.isVariable
          : alcohol.price === '변동',
      );
      if (draft?.selectedImage !== undefined)
        setSelectedImage(draft.selectedImage);
      if (draft?.isImageDeleted !== undefined)
        setIsImageDeleted(draft.isImageDeleted);
      setIsEditing(true);
    }
  }, [draft]);

  // persist draft upward while editing so parent can restore after list changes
  useEffect(() => {
    if (!isMainEditing) return;
    if (!onDraftChange) return;
    onDraftChange(alcohol.id, {
      name,
      description,
      price,
      type,
      imgUrl,
      isVariable,
      selectedImage,
      isImageDeleted,
    });
  }, [
    name,
    description,
    price,
    type,
    imgUrl,
    isVariable,
    selectedImage,
    isImageDeleted,
  ]);

  const onCancelEdit = () => {
    setName(original.name);
    setDescription(original.description);
    setPrice(original.price);
    setType(original.type);
    setImgUrl(original.imgUrl);
    setIsImageDeleted(false);
    setSelectedImage(null);
    setIsVariable(original.isVariable);
    setIsEditing(false);
  };

  const selectImage = () => setBottomSheetVisible(true);

  const handleCameraPick = async () => {
    if (!(await requestCameraPermission())) return;
    ImagePicker.openCamera({
      width: 1024,
      height: 1024,
      cropping: true,
      ...IMAGE_PICKER_TEXTS,
      ...IMAGE_CROPPER_TEXTS,
    })
      .then(image => {
        setSelectedImage(image);
        setImgUrl(image.path);
        setIsImageDeleted(false);
      })
      .catch(() => {});
  };

  const handleGalleryPick = async () => {
    if (!(await requestPhotoPermission())) return;
    ImagePicker.openPicker({
      width: 1024,
      height: 1024,
      cropping: true,
      ...IMAGE_PICKER_TEXTS,
      ...IMAGE_CROPPER_TEXTS,
    })
      .then(image => {
        setSelectedImage(image);
        setImgUrl(image.path);
        setIsImageDeleted(false);
      })
      .catch(() => {});
  };

  const deleteImage = () => {
    showAlert({
      title: '이미지 삭제',
      message: '이미지를 삭제하시겠습니까?',
      onConfirm: () => {
        setImgUrl('');
        setSelectedImage(null);
        setIsImageDeleted(true);
      },
      type: 'delete',
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return showToast('주류 이름을 입력해주세요.');
    if (!isVariable && !price.trim())
      return showToast('주류 가격을 입력해주세요.');

    if (!type.trim()) return showToast('주류 주종을 선택해주세요.');

    const isImageChanged = selectedImage !== null;
    const isImageRemoved = isImageDeleted && !!alcohol.imgUrl;
    const isImageAddedAndRemoved =
      !alcohol.imgUrl && selectedImage === null && isImageDeleted;

    const isInfoChanged =
      name !== alcohol.name ||
      description !== alcohol.description ||
      (isVariable ? '변동' : price) !== alcohol.price ||
      type !== alcohol.type;

    if (
      !isImageChanged &&
      !isImageRemoved &&
      !isInfoChanged &&
      !isImageAddedAndRemoved
    ) {
      setIsEditing(false);
      return;
    }

    let updated = {...alcohol};

    try {
      setLoading(true);
      if (isImageChanged) {
        await DrinkUpdateImage(alcohol.id, selectedImage);
        updated.imgUrl = selectedImage.path;
      }
      if (isImageRemoved) {
        await DrinkDeleteImage(alcohol.id);
        updated.imgUrl = '';
      }
      if (isInfoChanged || isImageChanged || isImageRemoved) {
        updated = {
          ...updated,
          name,
          description,
          price: isVariable ? '변동' : price,
          type,
        };
        await DrinkUpdate(alcohol.id, updated);
      }

      if (onTypeChange && type !== alcohol.type) {
        onTypeChange(alcohol.id, type);
      }
      if (onUpdate) onUpdate(updated);
      showToast('주류가 수정되었습니다.');
      setIsEditing(false);
    } catch (error) {
      showToast('주류 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePress = () => {
    if (isEditing) return;
    navigation.navigate('ImageViewerScreen', {images: imgUrl});
  };

  // expose imperative-like API to parent if requested
  useEffect(() => {
    if (!expose) return;
    const api = {
      save: handleSave,
      cancel: onCancelEdit,
      isEditing: () => isEditing,
    };
    expose(api);
    return () => expose(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    expose,
    isEditing,
    name,
    description,
    price,
    type,
    imgUrl,
    isImageDeleted,
    selectedImage,
  ]);

  return (
    <View style={[styles.container, isLast && {borderBottomWidth: 0}]}>
      <View
        style={[
          styles.contentRow,
          isMainEditing && {paddingHorizontal: 0},
          isEditing && {paddingBottom: 0},
        ]}>
        <View
          style={[
            styles.textWrap,
            description == '' && {justifyContent: 'space-evenly'},
          ]}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={text => {
                  const maxChars = 50;
                  if (text.length > maxChars) {
                    setOvernameText(true);
                    return; // 초과 입력 무시
                  } else {
                    setOvernameText(false);
                  }
                  setName(text);
                }}
                placeholder="주류 이름"
                placeholderTextColor="#999"
                multiline
              />
              {overnameText && (
                <Text style={styles.errorText}>
                  주류 이름은 최대 50자까지 입력 가능합니다.
                </Text>
              )}

              <TextInput
                style={[styles.input]}
                value={description}
                onChangeText={text => {
                  const maxChars = 100;
                  if (text.length > maxChars) {
                    setOverdesText(true);
                    return; // 초과 입력 무시
                  } else {
                    setOverdesText(false);
                  }
                  setDescription(text);
                }}
                placeholder="주류 설명을 입력하세요"
                placeholderTextColor="#999"
                multiline
              />
              {overdesText && (
                <Text style={styles.errorText}>
                  주류 설명은 최대 100자까지 입력 가능합니다.
                </Text>
              )}
              <View style={styles.rowBetween}>
                <TextInput
                  style={[styles.input, {flex: 1}]}
                  placeholder="가격 입력"
                  value={isVariable ? '변동' : price}
                  onChangeText={t => {
                    const cleaned = t.replace(/[^0-9]/g, '');
                    if (cleaned === '') {
                      setPrice('');
                      return;
                    }
                    let num = parseInt(cleaned, 10);
                    if (!isNaN(num) && num > 100000000) {
                      num = 100000000;
                      setOverText(true);
                    } else {
                      setOverText(false);
                    }
                    setPrice(String(num));
                  }}
                  editable={!isVariable}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
                <Pressable
                  style={styles.checkRow}
                  onPress={() => {
                    setIsVariable(prev => !prev);
                    setPrice('');
                    setOverText(false);
                  }}>
                  <View
                    style={[
                      styles.checkBox,
                      isVariable && styles.checkBoxChecked,
                    ]}>
                    {isVariable && (
                      <MaterialIcons name="check" size={16} color="#fff" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.checkLabel,
                      isVariable && styles.checkLabelActive,
                    ]}>
                    변동
                  </Text>
                </Pressable>
              </View>
              {overText && (
                <Text style={styles.errorText}>
                  가격은 최대 1억원까지 입력 가능합니다
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.name}>{name}</Text>
              {description && <Text style={styles.desc}>{description}</Text>}
              <Text style={styles.price}>
                {price === '변동'
                  ? '변동'
                  : `${Number(price).toLocaleString()}원`}
              </Text>
            </>
          )}
        </View>
        <View style={styles.imgWrap}>
          {imgUrl && (
            <Pressable onPress={handleImagePress}>
              <Image source={{uri: imgUrl}} style={styles.image} />
            </Pressable>
          )}
          {!imgUrl && isMainEditing && !isEditing && (
            <View style={styles.emptyImage}>
              <Text style={{color: '#aaa'}}>사진 없음</Text>
            </View>
          )}
          {!imgUrl && isMainEditing && isEditing && (
            <Pressable onPress={selectImage} style={styles.emptyImage}>
              <MaterialCommunityIcons name="plus" size={25} color="#ccc" />
            </Pressable>
          )}
          {isEditing && imgUrl && (
            <TouchableOpacity style={styles.deleteIcon} onPress={deleteImage}>
              <Ionicons name="close-circle" size={22} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {isUpdatable && isMainEditing && isEditing && (
        <RptAlcoholPicker
          selectedType={type}
          onTypeChange={setType}
          isUpdate={true}
        />
      )}

      <AlertComponent />
      <ImagePickermodal
        isBottomSheetVisible={isBottomSheetVisible}
        setBottomSheetVisible={setBottomSheetVisible}
        handleCameraPick={handleCameraPick}
        handleGalleryPick={handleGalleryPick}
      />
      <Loading loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.7,
    borderColor: '#eee',
  },
  contentRow: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
  },
  textWrap: {
    flex: 1,
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 14,
    color: '#333',
    marginRight: 10,
    fontFamily: 'Pretendard-Medium',
  },
  name: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  desc: {
    paddingVertical: 5,
    width: '90%',
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
    marginTop: 1,
    lineHeight: 22,
  },
  price: {
    marginTop: 7,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  imgWrap: {
    // width: 100,
    // height: 100,
    // borderRadius: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  emptyImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingBottom: 12,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
  },
  save: {
    backgroundColor: '#3CBBFF',
  },
  cancel: {
    backgroundColor: '#f5f5f5',
  },
  edit: {
    backgroundColor: '#3CBBFF',
  },
  delete: {
    backgroundColor: '#f5f5f5',
  },
  editbtnText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Pretendard-Bold',
  },
  deletebtnText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Pretendard-Medium',
  },
  rowBetween: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', // ✅ 수직 가운데 정렬
    marginBottom: 8,
    marginRight: 8,
    justifyContent: 'space-between',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxChecked: {
    backgroundColor: '#3CBBFF',
    borderColor: '#3CBBFF',
  },
  checkLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  checkLabelActive: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
  },
  errorText: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 8,
  },
});

export default AlcoholItem;
