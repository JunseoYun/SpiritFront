import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../hooks/usePhotopermis';
import ImagePickermodal from '../../hooks/ImagePickermodal';
import Loading from '../../hooks/Loading';
import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../constants/imagePickerLabels';
import ImageAddButton from '../../utils/ImageAddButton';

import {useToast} from '../../context/ToastContext';
const resolveDisplayUri = value => {
  if (!value) {
    return '';
  }
  const normalized = typeof value === 'string' ? value : `${value}`;
  const hasScheme =
    normalized.startsWith('file://') ||
    normalized.startsWith('content://') ||
    normalized.startsWith('ph://') ||
    normalized.startsWith('assets-library://') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://');

  if (hasScheme) {
    return normalized;
  }

  return `file://${normalized}`;
};

const StoreImage = ({
  imageUris,
  setImageUris,
  error,
  setLoading,
  type = 'default',
}) => {
  const isRegistration = type === 'registration';
  const [images, setImage] = useState([]);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false); // 바텀시트 상태

  const {showToast} = useToast();

  useEffect(() => {
    const normalized = (imageUris || [])
      .map(item => {
        if (typeof item === 'string') {
          return item;
        }
        if (item?.path) {
          return item.path;
        }
        if (item?.uri) {
          return item.uri;
        }
        return '';
      })
      .filter(Boolean);

    setImage(prev => {
      const isSame =
        prev.length === normalized.length &&
        prev.every((value, index) => value === normalized[index]);

      return isSame ? prev : normalized;
    });
  }, [imageUris]);

  const handleCameraPick = async () => {
    const hasCamera = await requestCameraPermission();
    if (!hasCamera) return;
    ImagePicker.openCamera({
      width: 1600,
      height: 1200,
      cropping: true,
      mediaType: 'photo',
      compressImageQuality: 0.95,
      compressImageMaxWidth: 1600,
      compressImageMaxHeight: 1200,
      includeExif: false,
      ...IMAGE_PICKER_TEXTS,
      ...IMAGE_CROPPER_TEXTS,
    })
      .then(image => {
        setImage([...images, image.path]);
        setImageUris([...imageUris, image]);
      })
      .catch(error => {
        console.log('Camera Error: ', error);
      });
  };

  const handleGalleryPick = async () => {
    setLoading(true);
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) return;

    const remaining = 5 - imageUris.length; // 최대 5개 제한

    try {
      const pickedImages = await ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: remaining > 1, // 2개 이상일 때만 multiple
        maxFiles: remaining > 1 ? remaining : 1,
        cropping: false, // 우선 crop 안함
        compressImageQuality: 0.95,
        compressImageMaxWidth: 1600,
        compressImageMaxHeight: 1200,
        includeExif: false,
        ...IMAGE_PICKER_TEXTS,
      });

      const selectedImages = Array.isArray(pickedImages)
        ? pickedImages
        : [pickedImages];

      const croppedImages = [];

      // 각 이미지 2048 x 1536, 4:3 비율 crop
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const cropped = await ImagePicker.openCropper({
          path: image.path,
          width: 1600,
          height: 1200,
          cropping: true,
          compressImageQuality: 0.95,
          compressImageMaxWidth: 1600,
          compressImageMaxHeight: 1200,
          includeExif: false,
          ...IMAGE_CROPPER_TEXTS,
          cropperActiveWidgetColor: '#3CBBFF',
          cropperStatusBarLight: true,
          cropperToolbarColor: '#ffffff',
          cropperToolbarWidgetColor: '#333333',
          avoidEmptySpaceAroundImage: true,
        });
        croppedImages.push(cropped);
      }

      // 상태에 추가
      setImage(prev => [...prev, ...croppedImages.map(img => img.path)]);
      setImageUris(prev => [...prev, ...croppedImages]);
    } catch (error) {
      console.log('Picker Error: ', error);
    } finally {
      setLoading(false);
    }
  };

  const selectImage = () => {
    if (imageUris.length >= 5) {
      showToast('이미지는 최대 5개까지 선택할 수 있습니다.');
      return;
    }
    setBottomSheetVisible(true); // 바텀시트 열기
  };

  const deleteImage = index => {
    const newImages = images.filter((_, i) => i !== index);
    const newImageUris = imageUris.filter((_, i) => i !== index);
    setImage(newImages);
    setImageUris(newImageUris);
  };

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= imageUris.length || fromIndex === toIndex) {
      return;
    }

    setImage(prev => {
      if (
        !prev.length ||
        fromIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex < 0 ||
        toIndex >= prev.length
      ) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    setImageUris(prev => {
      if (
        !prev.length ||
        fromIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex < 0 ||
        toIndex >= prev.length
      ) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  return (
    <View>
      <View
        style={[
          styles.storeinputview,
          isRegistration && styles.registrationSpacing,
        ]}>
        {!isRegistration && (
          <Text style={styles.storeinputtext}>매장 이미지</Text>
        )}
      </View>

      <ScrollView
        style={styles.imageview}
        horizontal
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}>
        {imageUris.length !== 5 && (
          <ImageAddButton
            currentCount={imageUris.length}
            maxCount={5}
            onPress={selectImage}
          />
        )}

        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            {resolveDisplayUri(uri) !== '' && (
              <Image
                source={{uri: resolveDisplayUri(uri)}}
                style={[styles.selectimage]}
              />
            )}

            {/* 대표 배지 (좌상단) */}
            {index === 0 && (
              <View style={styles.representativeBadge}>
                <Text style={styles.representativeText}>대표 사진</Text>
              </View>
            )}

            {/* 🗑 삭제 X 버튼 (우상단) */}
            <Pressable
              style={styles.deleteButton}
              onPress={() => deleteImage(index)} // 기존 삭제 로직 재사용(알림→삭제)
              hitSlop={{top: 8, right: 8, bottom: 8, left: 8}}>
              <MaterialCommunityIcons name="close" size={18} color="#fff" />
            </Pressable>

            {imageUris.length > 1 && (
              <>
                {index > 0 && (
                  <Pressable
                    style={[styles.reorderButton, styles.reorderButtonLeft]}
                    onPress={() => moveImage(index, index - 1)}
                    hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                    <Ionicons name="chevron-back" size={16} color="#fff" />
                  </Pressable>
                )}
                {index < imageUris.length - 1 && (
                  <Pressable
                    style={[styles.reorderButton, styles.reorderButtonRight]}
                    onPress={() => moveImage(index, index + 1)}
                    hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                  </Pressable>
                )}
              </>
            )}
          </View>
        ))}
      </ScrollView>
      {error === 'StoreImage' && images.length === 0 && (
        <Text style={styles.errorMessage}>
          매장 사진을 최소 1개 이상 업로드해 주세요.
        </Text>
      )}
      {!isRegistration && (
        <View style={styles.tipView}>
          <View style={styles.tipbadge}>
            <Text style={styles.tipbadgeText}>Tip</Text>
          </View>
          <Text style={styles.tipText}>
            첫 번째로 추가한 사진이 대표 사진으로 설정돼요
          </Text>
        </View>
      )}

      <ImagePickermodal
        isBottomSheetVisible={isBottomSheetVisible}
        setBottomSheetVisible={setBottomSheetVisible}
        handleCameraPick={handleCameraPick}
        handleGalleryPick={handleGalleryPick}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 15,
    marginHorizontal: 18,
  },
  registrationSpacing: {
    marginTop: 0,
  },
  storeinputtext: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 15,
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    marginVertical: 5,
    marginHorizontal: 18,
  },
  imageview: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingHorizontal: 18, // 하단 버튼 영역 확보
    paddingVertical: 12,
  },
  imageWrapper: {
    position: 'relative', // 배지 위치를 조정하기 위해 부모 요소를 상대 위치로 설정
  },
  selectimage: {
    width: 100,
    height: 100,
    borderRadius: 9,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F3F3F3',
  },
  deleteButton: {
    position: 'absolute',
    top: -7, // 스크린샷처럼 바깥쪽에 살짝 걸치게
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    elevation: 4, // Android 그림자 약하게
  },
  representativeBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#3CBBFF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  representativeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reorderButton: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButtonLeft: {
    left: 6,
    bottom: 6,
  },
  reorderButtonRight: {
    right: 15,
    bottom: 6,
  },
  tipView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 6,
  },
  tipbadge: {
    backgroundColor: 'rgba(0, 83, 200, 0.08)', // 은은한 파란 배경 (약한 블루)
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
  },
  tipbadgeText: {
    color: '#003C8F', // 짙은 블루 (#003C8F)
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  tipText: {
    color: '#003C8F',
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
});

export default StoreImage;
