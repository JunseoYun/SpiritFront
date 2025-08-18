import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionButtons from './ActionButtons';
import ImagePicker from 'react-native-image-crop-picker';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useToast} from '../../context/ToastContext';
import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../hooks/usePhotopermis';
import ImagePickermodal from '../../hooks/ImagePickermodal';
import Loading from '../../hooks/Loading';

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
    }, 500); // 0.5초 후 버튼 활성화

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
    setUpdatedImgValue({
      addedImages,
      deletedImages,
    });
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
    if (!hasCamera) {
      return;
    }
    setLoading(true);
    try {
      const image = await ImagePicker.openCamera({
        width: 2048,
        height: 1536,
        cropping: true,
        mediaType: 'photo',
        compressImageQuality: 0.95, // 품질
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
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) return;

    const remaining = 5 - (addedImages.length + serverImages.length); // 최대 5개 제한

    try {
      setLoading(true);

      // 이미지 선택
      const pickedImages = await ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: remaining > 1, // 2개 이상일 때만 multiple
        maxFiles: remaining > 1 ? remaining : 1,
        compressImageQuality: 0.95,
        cropping: false, // crop은 따로 처리
      });

      const selectedImages = Array.isArray(pickedImages)
        ? pickedImages
        : [pickedImages];

      const croppedImages = [];

      // 각 이미지 crop 처리
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const cropped = await ImagePicker.openCropper({
          path: image.path,
          width: 2048,
          height: 1536,
          cropping: true,
          cropperToolbarTitle: '이미지 편집',
          cropperActiveWidgetColor: '#45C9FF',
          cropperStatusBarLight: true,
          cropperToolbarColor: '#ffffff',
          cropperToolbarWidgetColor: '#333333',
          avoidEmptySpaceAroundImage: true,
        });
        croppedImages.push(cropped);
      }

      // 상태에 추가
      setAddedImages(prev => [...prev, ...croppedImages]);
      showToast('이미지 추가 완료');
    } catch (er) {
      console.log('Picker Error: ', er);
    } finally {
      setLoading(false);
    }
  };

  const selectImage = () => {
    if (addedImages.length + serverImages.length >= 5) {
      showToast('이미지는 최대 5개 입니다.');
      return;
    }
    setBottomSheetVisible(true); // 바텀시트 열기
  };

  const removeServerImage = index => {
    if (allImages.length <= 1) {
      showToast('이미지는 최소 1개 이상 필요합니다.');
      return;
    }
    setLoading(true);
    const imageToRemove = serverImages[index];
    setServerImages(prev => prev.filter((_, i) => i !== index));
    setDeletedImages(prev => [...prev, imageToRemove]);

    showToast('이미지가 삭제 되었습니다.');

    setLoading(false);
  };

  const removeAddedImage = index => {
    if (allImages.length <= 1) {
      showToast('이미지는 최소 1개 이상 필요합니다.');
      return;
    }
    setLoading(true);
    setAddedImages(prevImages => prevImages.filter((_, i) => i !== index));
    showToast('이미지가 삭제 되었습니다.');

    setLoading(false);
  };

  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>매장 이미지</Text>
      <Text style={styles.subtitle}>*최대 5장</Text>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.imageScrollContainer}
        gestureHandlerProps={{
          // 가로 스와이프 감지 범위 설정
          activeOffsetX: [0, 10],
          // 세로로 스와이프할 때, 바텀시트가 내려가지 않도록 방지
          activeOffsetY: [-100, 0], // Y 방향 스와이프를 무시하도록 범위를 설정
        }}>
        {allImages.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image
              source={{
                uri: image.imageUrl ? image.imageUrl : image.path || image,
              }} // URL 또는 path로 전달
              style={[styles.image]}
            />
            {/* 첫 번째 이미지에 '대표' 태그 추가 */}
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
        {loadingimg && addedImages.length < 5 && (
          <Pressable
            style={{
              width: ('100%' / 4) * 3,
              height: ((windowWidth - 36) * 9) / 16,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#ededed',
              borderRadius: 10,
            }}
            onPress={selectImage}>
            <View
              style={{
                width: 30,
                height: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialCommunityIcons name="plus" size={30} color="#999" />
            </View>
          </Pressable>
        )}
        <AlertComponent />
        <ImagePickermodal
          isBottomSheetVisible={isBottomSheetVisible}
          setBottomSheetVisible={setBottomSheetVisible}
          handleCameraPick={handleCameraPick}
          handleGalleryPick={handleGalleryPick}
        />
      </BottomSheetScrollView>

      <ActionButtons onCancel={handleCancel} onSave={handleSave} />
      {(loading || !loadingimg) && <Loading loading={true} />}
    </View>
  );
};

export default UpdateStoreImage;
const windowWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  imageScrollContainer: {
    paddingBottom: 50,
    gap: 16, // React Native 0.71 이상만 지원됨. 낮은 버전은 대신 marginBottom 사용
  },
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 50 : 20,
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
  imageWrapper: {
    width: ('100%' / 4) * 3,
    height: ((windowWidth - 36) * 9) / 16,
    marginVertical: 0,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  shadowEffect: {
    shadowColor: '#000', // 그림자 색상
    shadowOffset: {width: 0, height: 4}, // 그림자 위치 (x, y)
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
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});
