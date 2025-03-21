import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionButtons from './ActionButtons';
import ImagePicker from 'react-native-image-crop-picker';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useToast} from '../../context/ToastContext';

const UpdateStoreImage = ({images, setUpdatedImgValue, onCancel, onSave}) => {
  const {showAlert, AlertComponent} = useCustomAlert();
  const [allImages, setAllImages] = useState([]);
  const [serverImages, setServerImages] = useState([]);
  const [addedImages, setAddedImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [hasmainImg, setHasmainImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingimg, setLoadingimg] = useState(false);
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
      hasmainImg,
    });
  }, [addedImages, deletedImages, hasmainImg]);

  const handleSave = () => {
    setUpdatedImgValue({
      addedImages,
      deletedImages,
      hasmainImg,
    });
    setHasmainImg(false);
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
    setHasmainImg(false);
    onCancel();
  };

  const selectImage = async () => {
    if (addedImages.length + serverImages.length >= 5) {
      showToast('이미지는 최대 5개까지 추가할 수 있습니다.');
      return;
    }

    setLoading(true);
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 300,
        mediaType: 'photo',
        cropping: true,
      });
      setAddedImages(prev => [...prev, image]);
      showToast('이미지 추가 완료');
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        showToast('이미지 추가 중 오류 발생');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeServerImage = index => {
    if (allImages.length <= 1) {
      showToast('이미지는 최소 1개 이상 필요합니다.');
      return;
    }

    showAlert({
      title: `이미지를 삭제하시겠습니까?`,
      onConfirm: async () => {
        setLoading(true);
        try {
          const imageToRemove = serverImages[index];
          setServerImages(prev => prev.filter((_, i) => i !== index));
          setDeletedImages(prev => [...prev, imageToRemove]);

          showToast('삭제 되었습니다.');
        } catch (error) {
          showToast('이미지 삭제 실패.');
        } finally {
          setLoading(false);
        }
      },
      onCancel: null,
      type: 'delete',
    });
  };

  const removeAddedImage = index => {
    if (allImages.length <= 1) {
      showToast('이미지는 최소 1개 이상 필요합니다.');
      return;
    }
    showAlert({
      title: `이미지를 삭제하시겠습니까?`,
      onConfirm: async () => {
        setLoading(true);
        try {
          setAddedImages(prevImages =>
            prevImages.filter((_, i) => i !== index),
          );
          showToast('삭제 되었습니다.');
        } catch (err) {
          showToast('이미지 삭제 실패.');
        } finally {
          setLoading(false);
        }
      },
      onCancel: null,
      type: 'delete',
    });
  };

  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>매장 이미지</Text>
      <Text style={styles.subtitle}>*최대 5장</Text>
      <BottomSheetScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContainer}
        gestureHandlerProps={{
          // 가로 스와이프 감지 범위 설정
          activeOffsetX: [0, 10],
          // 세로로 스와이프할 때, 바텀시트가 내려가지 않도록 방지
          activeOffsetY: [-100, 0], // Y 방향 스와이프를 무시하도록 범위를 설정
        }}
        style={styles.scrollView}>
        {allImages.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image
              source={{
                uri: image.imageUrl ? image.imageUrl : image.path || image,
              }} // URL 또는 path로 전달
              style={[styles.image, {borderColor: '#E7E7E7', borderWidth: 2}]}
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
        {loadingimg && addedImages.length + images.length < 5 && (
          <Pressable
            onPress={selectImage}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 100,
            }}>
            <MaterialCommunityIcons name="image-plus" size={40} color="#333" />
          </Pressable>
        )}
        <AlertComponent />
      </BottomSheetScrollView>
      <ActionButtons onCancel={handleCancel} onSave={handleSave} />
      {(loading || !loadingimg) && (
        <View style={styles.footer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

export default UpdateStoreImage;

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 20,
  },
  imageWrapper: {
    marginRight: 10,
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
    shadowColor: '#000', // 그림자 색상
    shadowOffset: {width: 0, height: 4}, // 그림자 위치 (x, y)
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    flexGrow: 1, // 부모 요소가 자식 요소의 크기에 맞게 조정되도록
  },
  representativeBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#16BBFF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  representativeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
