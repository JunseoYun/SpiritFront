// ✅ MenuItem.js 전체 코드 (요구사항 반영)
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Pressable,
} from 'react-native';
import {MenuUpdate, MenuUpdateImage, MenuDeleteImage} from '../../api/menuApi';
import useCustomAlert from '../../hooks/useCustomAlert';
import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../hooks/usePhotopermis';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import ImagePicker from 'react-native-image-crop-picker';
import ImagePickermodal from '../../hooks/ImagePickermodal';
import MainMenuCheck from '../MenuAddScreen/MainMenuCheck';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Loading from '../../hooks/Loading';
import {useToast} from '../../context/ToastContext';
import forbiddenWords from '../../hooks/forbiddenWords';
const MenuItem = ({
  menu,
  onDelete,
  isUpdatable,
  isLast,
  isMainEditing,
  onTypeChange,
  onMenuUpdate,
  navigation,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(menu.name);
  const [description, setDescription] = useState(menu.description);
  const [price, setPrice] = useState(menu.price);
  const [type, setType] = useState(menu.menuType);
  const [imgUrl, setImgUrl] = useState(menu.imgUrl);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const [isVariable, setIsVariable] = useState(menu.price === '변동');
  const [originalState, setOriginalState] = useState({});

  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();

  const onEditStart = () => {
    setOriginalState({
      name,
      description,
      price,
      type,
      imgUrl,
      isImageDeleted,
      selectedImage,
      isVariable,
    });
    setIsEditing(true);
  };

  useEffect(() => {
    setName(menu.name);
    setDescription(menu.description);
    setPrice(menu.price);
    setType(menu.menuType);
    setImgUrl(menu.imgUrl);
    setIsVariable(menu.price === '변동');
  }, [menu]);

  const onCancelEdit = () => {
    setName(originalState.name);
    setDescription(originalState.description);
    setPrice(originalState.price);
    setType(originalState.type);
    setImgUrl(originalState.imgUrl);
    setIsImageDeleted(originalState.isImageDeleted);
    setSelectedImage(originalState.selectedImage);
    setIsVariable(originalState.isVariable);
    setIsEditing(false);
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
        setImgUrl(image.path);
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
        setImgUrl(image.path);
        setIsImageDeleted(false);
      })
      .catch(error => {});
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
    if (!name.trim())
      return showAlert({
        title: '입력 오류',
        message: '메뉴 이름을 입력해주세요.',
      });
    if (!isVariable && !price.toString().trim())
      return showAlert({title: '입력 오류', message: '가격을 입력해주세요.'});
    if (!type.trim())
      return showAlert({title: '입력 오류', message: '타입을 선택해주세요.'});

    if (
      [name, description, price].some(v =>
        forbiddenWords.some(f => v?.includes(f)),
      )
    ) {
      return showAlert({
        title: '가이드 위반',
        message: '금지된 단어가 포함되어 있습니다.',
      });
    }

    const isImageChanged = selectedImage !== null;
    const isImageRemoved = isImageDeleted && !!menu.imgUrl;
    const isImageAddedAndRemoved =
      !menu.imgUrl && selectedImage === null && isImageDeleted;

    const isInfoChanged =
      name !== menu.name ||
      description !== menu.description ||
      (isVariable ? '변동' : price) !== menu.price ||
      type !== menu.menuType;

    if (
      !isImageChanged &&
      !isImageRemoved &&
      !isInfoChanged &&
      !isImageAddedAndRemoved
    ) {
      showToast('변경사항이 없습니다.');
      setIsEditing(false);
      return;
    }

    try {
      setLoading(true);
      if (isImageChanged) await MenuUpdateImage(menu.id, selectedImage);
      if (isImageRemoved) await MenuDeleteImage(menu.id);

      if (isInfoChanged || isImageChanged || isImageRemoved) {
        const updated = {
          ...menu,
          name,
          description,
          price: isVariable ? '변동' : price,
          menuType: type,
        };

        await MenuUpdate(menu.id, updated);

        if (type !== menu.menuType && onTypeChange) {
          onTypeChange(menu.id, type);
        }

        onMenuUpdate?.({
          ...updated,
          imgUrl: isImageChanged
            ? selectedImage.path
            : isImageRemoved
            ? ''
            : imgUrl,
        });
      }

      showToast('메뉴가 수정되었습니다.');
      setIsEditing(false);
    } catch {
      showToast('메뉴 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePress = () => {
    navigation.navigate('ImageViewerScreen', {images: imgUrl});
  };

  return (
    <View style={[styles.container, isLast && {borderBottomWidth: 0}]}>
      <View
        style={[styles.menuContainer, isMainEditing && {paddingHorizontal: 0}]}>
        <View
          style={[
            styles.textView,
            description == '' && {justifyContent: 'space-evenly'},
          ]}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.inputBox}
                placeholder="메뉴 이름을 입력하세요"
                value={name}
                multiline
                onChangeText={setName}
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.inputBox]}
                placeholder="메뉴 설명을 입력하세요"
                value={description}
                onChangeText={setDescription}
                multiline
                placeholderTextColor="#999"
              />
              <View style={styles.rowBetween}>
                <TextInput
                  style={[styles.inputBox, {flex: 1}]}
                  placeholder="가격 입력"
                  value={isVariable ? '변동' : price}
                  onChangeText={t => setPrice(t.replace(/[^0-9]/g, ''))}
                  editable={!isVariable}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
                <Pressable
                  style={styles.checkRow}
                  onPress={() => {
                    setIsVariable(prev => !prev);
                    setPrice('');
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
              <MainMenuCheck
                selectedType={type}
                imagecheck={!!imgUrl}
                onChangeType={setType}
                isUpdate={true}
              />
            </>
          ) : (
            <>
              <View
                style={[styles.menuTitleRow, isMainEditing && {width: '100%'}]}>
                <Text style={styles.nameText}>{name}</Text>
                {menu?.menuType === 'MAIN' && !isMainEditing && (
                  <Text style={styles.mainMenu}>대표</Text>
                )}
              </View>
              {description && <Text style={styles.desc}>{description}</Text>}
              <Text style={styles.priceText}>
                {price === '변동'
                  ? '변동'
                  : `${Number(price).toLocaleString()}원`}
              </Text>
            </>
          )}
        </View>
        <View style={styles.ImageContainer}>
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

      {isUpdatable && isMainEditing && (
        <View style={styles.buttonRow}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.save]}
                onPress={handleSave}>
                <Text style={styles.editbtnText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.cancel]}
                onPress={onCancelEdit}>
                <Text style={styles.deletebtnText}>취소</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.edit]}
                onPress={onEditStart}>
                <Text style={styles.editbtnText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.delete]}
                onPress={() => onDelete(menu.id, menu.name)}>
                <Text style={styles.deletebtnText}>삭제</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
  menuContainer: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
  },
  textView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center', // 세로 정렬
    width: '85%',
  },
  nameText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  mainMenu: {
    fontSize: 10,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
    marginLeft: 7,
    backgroundColor: 'rgba(16, 190, 251, 0.7)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: 'center',
  },
  desc: {
    paddingVertical: 5,
    width: '90%',
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
    marginTop: 1,
    fontSize: 15,
  },
  priceText: {
    marginTop: 7,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
    marginLeft: 2,
  },
  ImageContainer: {
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
    backgroundColor: '#45C9FF',
  },
  cancel: {
    backgroundColor: '#f5f5f5',
  },
  edit: {
    backgroundColor: '#45C9FF',
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
  inputBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 14,
    color: '#333',
    marginRight: 10,
    fontFamily: 'Pretendard-Medium',
  },
  switchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center', // ✅ 수직 가운데 정렬
    marginBottom: 8,
    minHeight: 48, // ✅ TextInput 높이와 유사하게 고정
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
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
    backgroundColor: '#16BBFF',
    borderColor: '#16BBFF',
  },
  checkLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  checkLabelActive: {
    color: '#16BBFF',
    fontFamily: 'Pretendard-Medium',
  },
});

export default MenuItem;
