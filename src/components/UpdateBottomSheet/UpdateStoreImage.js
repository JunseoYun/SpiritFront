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

const UpdateStoreImage = ({images, setUpdatedImgValue, onCancel, onSave}) => {
  const {showAlert, AlertComponent} = useCustomAlert();
  const [allImages, setAllImages] = useState([]);
  const [serverImages, setServerImages] = useState([]);
  const [addedImages, setAddedImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [mainImages, setMainImages] = useState('');

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

    // 기존 mainImages 상태 유지
    let newMainImage = mainImages;

    if (serverImages.length > 0) {
      // 기존 첫 번째 이미지 저장 (변경 감지용)
      const prevFirstImage =
        allImages.length > 0 ? allImages[0].imageUrl : null;

      if (updatedImages.length > 0) {
        if (updatedImages[0].imageUrl !== prevFirstImage) {
          newMainImage = updatedImages[0].imageUrl || updatedImages[0].path;
        }
      } else {
        newMainImage = ''; // 모든 이미지가 삭제되면 초기화
      }
    } else if (updatedImages.length > 0) {
      newMainImage = updatedImages[0].imageUrl || updatedImages[0].path;
    } else {
      newMainImage = '';
    }

    setMainImages(newMainImage);
  }, [serverImages, addedImages, deletedImages]);

  useEffect(() => {
    setUpdatedImgValue({
      addedImages,
      deletedImages,
      mainImages,
    });
  }, [addedImages, deletedImages, mainImages]);

  const handleSave = () => {
    const updatedImages = [...serverImages, ...addedImages];

    // 최신 상태를 강제로 반영
    const latestMainImage =
      updatedImages.length > 0
        ? updatedImages[0].imageUrl || updatedImages[0].path
        : '';

    setMainImages(latestMainImage); // 최신 mainImages 업데이트
    setUpdatedImgValue({
      addedImages,
      deletedImages,
      mainImages: latestMainImage, // 최신 mainImages 반영
    });

    console.log(
      {
        addedImages,
        deletedImages,
        mainImages: latestMainImage,
      },
      '전체 이미지',
    );

    setTimeout(() => {
      onSave();
    }, 100);
  };

  const handleCancel = () => {
    setAddedImages([]);
    setDeletedImages([]);
    setMainImages([]);
    setAllImages([]);
    onCancel();
  };

  const selectImage = () => {
    // 서버에 있는 이미지와 추가된 이미지를 합쳐서 5개 이하로 제한
    if (addedImages.length + serverImages.length < 5) {
      ImagePicker.openPicker({
        width: 500,
        height: 500,
        mediaType: 'photo',
        cropping: true,
      })
        .then(images => {
          setAddedImages([...addedImages, images]); // 기존 이미지 배열에 새 이미지를 추가
        })
        .catch(error => {});
    } else {
      showAlert({
        title: '이미지 추가 제한',
        message: '이미지는 최대 5개까지 추가할 수 있습니다.',
      });
    }
  };

  const removeServerImage = async index => {
    if (allImages.length <= 1) {
      showAlert({
        title: '이미지는 최소 1개 이상 필요합니다.',
      });
      return;
    }

    showAlert({
      title: `이미지를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          const imageToRemove = serverImages[index];

          setServerImages(prevImages =>
            prevImages.filter(
              image => image.imageUrl !== imageToRemove.imageUrl,
            ),
          );
          setDeletedImages(prevDeleted => [...prevDeleted, imageToRemove]);

          showAlert({
            title: '삭제 되었습니다',
          });
        } catch (error) {
          showAlert({
            title: '이미지 삭제 실패',
          });
        }
      },
      onCancel: null,
      type: 'delete',
    });
  };

  const removeAddedImage = index => {
    if (allImages.length <= 1) {
      showAlert({
        title: '이미지는 최소 1개 이상 필요합니다.',
      });
      return;
    }

    showAlert({
      title: `이미지를 삭제하시겠습니까?`,
      onConfirm: async () => {
        setAddedImages(prevImages => prevImages.filter((_, i) => i !== index));
        showAlert({
          title: '삭제 되었습니다',
        });
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
        {addedImages.length + images.length < 5 && (
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
    width: 100,
    height: 100,
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
});
