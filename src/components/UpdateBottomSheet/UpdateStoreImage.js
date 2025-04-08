import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionButtons from './ActionButtons';
import ImagePicker from 'react-native-image-crop-picker';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useToast} from '../../context/ToastContext';
import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../hooks/usePhotopermis';
import ImagePickermodal from '../../hooks/ImagePickermodal';

const UpdateStoreImage = ({images, setUpdatedImgValue, onCancel, onSave}) => {
  const {showAlert, AlertComponent} = useCustomAlert();
  const [allImages, setAllImages] = useState([]);
  const [serverImages, setServerImages] = useState([]);
  const [addedImages, setAddedImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingimg, setLoadingimg] = useState(false);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const {showToast} = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingimg(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Array.isArray(images)) {
      setServerImages(images);
    } else {
      setServerImages([]);
    }
  }, [images]);

  useEffect(() => {
    const updatedImages = [...serverImages, ...addedImages];
    setAllImages(updatedImages);
  }, [serverImages, addedImages, deletedImages]);

  useEffect(() => {
    setUpdatedImgValue({
      addedImages,
      deletedImages,
    });
  }, [addedImages, deletedImages]);

  const handleSave = () => {
    setUpdatedImgValue({addedImages, deletedImages});
    setTimeout(() => {
      onSave();
    }, 100);
    setAddedImages([]);
    setDeletedImages([]);
    setAllImages([]);
  };

  const handleCancel = () => {
    setAddedImages([]);
    setDeletedImages([]);
    setAllImages([]);
    onCancel();
  };

  const handleCameraPick = async () => {
    const hasCamera = await requestCameraPermission();
    if (!hasCamera) return;
    setLoading(true);
    try {
      const image = await ImagePicker.openCamera({
        width: 1024,
        height: 768,
        cropping: true,
        mediaType: 'photo',
        quality: 1,
      });
      setAddedImages(prev => [...prev, image]);
      showToast('이미지 추가 완료');
    } catch (er) {
      console.log('Picker Error: ', er);
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryPick = async () => {
    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) return;
    setLoading(true);
    try {
      const image = await ImagePicker.openPicker({
        width: 1024,
        height: 768,
        cropping: true,
        mediaType: 'photo',
        quality: 1,
      });
      setAddedImages(prev => [...prev, image]);
      showToast('이미지 추가 완료');
    } catch (er) {
      console.log('Picker Error: ', er);
    } finally {
      setLoading(false);
    }
  };

  const selectImage = () => {
    if (addedImages.length + serverImages.length >= 5) {
      showToast('이미지는 최대 5개까지 추가할 수 있습니다.');
      return;
    }
    setBottomSheetVisible(true);
  };

  const removeServerImage = index => {
    if (allImages.length <= 1) {
      showToast('이미지는 최소 1개 이상 필요합니다.');
      return;
    }
    showAlert({
      title: '이미지를 삭제하시겠습니까?',
      onConfirm: () => {
        const imageToRemove = serverImages[index];
        setServerImages(prev => prev.filter((_, i) => i !== index));
        setDeletedImages(prev => [...prev, imageToRemove]);
        showToast('삭제 되었습니다.');
      },
      type: 'delete',
    });
  };

  const removeAddedImage = index => {
    if (allImages.length <= 1) {
      showToast('이미지는 최소 1개 이상 필요합니다.');
      return;
    }
    showAlert({
      title: '이미지를 삭제하시겠습니까?',
      onConfirm: () => {
        setAddedImages(prev => prev.filter((_, i) => i !== index));
        showToast('삭제 되었습니다.');
      },
      type: 'delete',
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>매장 이미지</Text>
      <Text style={styles.subtitle}>*최대 5장</Text>
      <View style={styles.imageContainer}>
        {allImages.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image
              source={{
                uri: image.imageUrl ? image.imageUrl : image.path || image,
              }}
              style={[styles.image, {borderColor: '#E7E7E7', borderWidth: 2}]}
            />
            {index === 0 && (
              <View style={styles.representativeBadge}>
                <Text style={styles.representativeText}>대표 사진</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() =>
                index < serverImages.length
                  ? removeServerImage(index)
                  : removeAddedImage(index - serverImages.length)
              }
              style={[styles.removeButton, styles.shadowEffect]}>
              <Ionicons name="trash-outline" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {loadingimg && addedImages.length + serverImages.length < 5 && (
          <Pressable onPress={selectImage} style={styles.addButton}>
            <MaterialCommunityIcons name="image-plus" size={40} color="#333" />
          </Pressable>
        )}
      </View>

      <ImagePickermodal
        isBottomSheetVisible={isBottomSheetVisible}
        setBottomSheetVisible={setBottomSheetVisible}
        handleCameraPick={handleCameraPick}
        handleGalleryPick={handleGalleryPick}
      />

      <ActionButtons onCancel={handleCancel} onSave={handleSave} />

      {(loading || !loadingimg) && (
        <View style={styles.footer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      )}
      <AlertComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    marginBottom: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 160,
    height: 120,
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  shadowEffect: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  representativeBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#45C9FF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  representativeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Pretendard-SemiBold',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 160,
    height: 120,
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
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    fontSize: 20,
    color: '#333',
  },
});

export default UpdateStoreImage;
