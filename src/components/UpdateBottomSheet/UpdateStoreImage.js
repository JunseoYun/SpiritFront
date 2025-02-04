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
  const [serverImages, setServerImages] = useState([]);
  const [addedImages, setAddedImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  useEffect(() => {
    if (Array.isArray(images)) {
      setServerImages(images);
    } else {
      setServerImages([]); // images가 배열이 아니면 빈 배열로 초기화
    }
    setAddedImages([]);
    setDeletedImages([]);
  }, [images]);

  useEffect(() => {
    setUpdatedImgValue({
      addedImages,
      deletedImages,
    });
  }, [addedImages, deletedImages]);

  const handleSave = () => {
    const updateObj = {
      addedImages: addedImages,
      deletedImages: deletedImages,
    };
    setUpdatedImgValue(updateObj);
    setTimeout(() => {
      onSave();
    }, 100);
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

  const removeAddedImage = index => {
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

  // 서버에서 받아온 이미지를 삭제하는 함수
  const removeServerImage = async index => {
    showAlert({
      title: `이미지를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          const imageToRemove = serverImages[index]; // 삭제할 이미지 가져오기

          // imageUrl을 기준으로 삭제할 이미지 찾기
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

  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>매장 이미지</Text>
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
        {(serverImages || []).map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image
              source={{uri: image.imageUrl ? image.imageUrl : image}} // 선택한 이미지가 URL로 전달될 때
              style={[styles.image, {borderColor: '#E7E7E7', borderWidth: 2}]}
            />
            <TouchableOpacity
              onPress={() => removeServerImage(index)}
              style={[styles.removeButton, styles.shadowEffect]}>
              <Ionicons name="trash-outline" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {addedImages.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image
              source={{uri: image.path}} // 추가한 이미지의 URI
              style={[styles.image, {borderColor: '#E7E7E7', borderWidth: 2}]}
            />
            <TouchableOpacity
              onPress={() => removeAddedImage(index)}
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
      <ActionButtons onCancel={onCancel} onSave={handleSave} />
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
    marginBottom: 20,
  },
  // horizontalScrollContainer: {
  //   flexDirection: 'row',
  // },
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
    top: 10,
    right: 10,
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
});
