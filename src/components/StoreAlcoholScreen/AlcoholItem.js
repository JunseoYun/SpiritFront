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

const AlcoholItem = ({
  isLast,
  alcohol,
  onDelete,
  onUpdate,
  isUpdatable,
  isMainEditing,
  onTypeChange,
  navigation,
}) => {
  const [isEditing, setIsEditing] = useState(false);
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

  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();

  useEffect(() => {
    setName(alcohol.name);
    setDescription(alcohol.description);
    setPrice(alcohol.price);
    setType(alcohol.type);
    setImgUrl(alcohol.imgUrl);
    setIsVariable(alcohol.price === '변동');
  }, [alcohol]);

  const onEditStart = () => {
    setOriginal({name, description, price, type, imgUrl, isVariable});
    setIsEditing(true);
  };

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
    ImagePicker.openCamera({width: 1024, height: 1024, cropping: true})
      .then(image => {
        setSelectedImage(image);
        setImgUrl(image.path);
        setIsImageDeleted(false);
      })
      .catch(() => {});
  };

  const handleGalleryPick = async () => {
    if (!(await requestPhotoPermission())) return;
    ImagePicker.openPicker({width: 1024, height: 1024, cropping: true})
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
    if (!name.trim())
      return showAlert({
        title: '입력 오류',
        message: '주류 이름을 입력해주세요.',
      });
    if (!isVariable && !price.trim())
      return showAlert({
        title: '입력 오류',
        message: '주류 가격을 입력해주세요.',
      });
    if (!type.trim())
      return showAlert({title: '입력 오류', message: '주종을 선택해주세요.'});

    const hasForbidden = [name, description, price].some(value =>
      forbiddenWords.some(word => value?.includes(word)),
    );
    if (hasForbidden)
      return showAlert({
        title: '가이드 위반',
        message: '금지된 단어가 포함되어 있습니다.',
      });

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
      showToast('변경사항이 없습니다.');
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
    navigation.navigate('ImageViewerScreen', {images: imgUrl});
  };

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
                onChangeText={setName}
                placeholder="주류 이름"
                placeholderTextColor="#999"
                multiline
              />
              <TextInput
                style={[styles.input, {height: 60}]}
                value={description}
                onChangeText={setDescription}
                placeholder="주류 설명을 입력하세요"
                placeholderTextColor="#999"
                multiline
              />
              <View style={styles.rowBetween}>
                <TextInput
                  style={[styles.input, {flex: 1}]}
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

      {isUpdatable && isMainEditing && (
        <View style={[styles.buttonRow, isEditing && {marginTop: 10}]}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.save]}
                onPress={handleSave}>
                <Text style={styles.btnText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.cancel]}
                onPress={onCancelEdit}>
                <Text style={styles.btnText}>취소</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.edit]}
                onPress={onEditStart}>
                <Text style={styles.btnText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.delete]}
                onPress={() => onDelete(alcohol.id, alcohol.name)}>
                <Text style={styles.btnText}>삭제</Text>
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
    fontSize: 15,
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
    backgroundColor: '#45C9FF',
  },
  cancel: {
    backgroundColor: '#999',
  },
  edit: {
    backgroundColor: '#16BBFF',
  },
  delete: {
    backgroundColor: '#ccc',
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
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

export default AlcoholItem;
