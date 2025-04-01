import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useCustomAlert from '../../hooks/useCustomAlert';
import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../hooks/usePhotopermis';
import ImagePickermodal from '../../hooks/ImagePickermodal';

const StoreImage = ({imageUris, setImageUris, error}) => {
  const [images, setImage] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false); // 바텀시트 상태

  const {showAlert, AlertComponent} = useCustomAlert();

  const handleCameraPick = async () => {
    const hasCamera = await requestCameraPermission();
    if (!hasCamera) return;
    ImagePicker.openCamera({
      width: 1024,
      height: 768,
      cropping: true,
      mediaType: 'photo',
      quality: 1,
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
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) return;

    ImagePicker.openPicker({
      width: 1024,
      height: 768,
      cropping: true,
      mediaType: 'photo',
      quality: 1,
    })
      .then(image => {
        setImage([...images, image.path]);
        setImageUris([...imageUris, image]);
      })
      .catch(error => {
        console.log('Picker Error: ', error);
      });
  };

  const selectImage = () => {
    if (imageUris.length >= 5) {
      showAlert({
        title: '매장 이미지',
        message: '이미지는 최대 5개까지 선택할 수 있습니다.',
      });
      return;
    }
    setBottomSheetVisible(true); // 바텀시트 열기
  };

  const handleImagePress = index => {
    setSelectedImageIndex(index);
    showAlert({
      title: '이미지 삭제',
      message: '이미지를 삭제하시겠습니까?',
      onConfirm: () => deleteImage(index),
      onCancel: () => setSelectedImageIndex(null),
      type: 'delete',
    });
  };

  const deleteImage = index => {
    const newImages = images.filter((_, i) => i !== index);
    const newImageUris = imageUris.filter((_, i) => i !== index);
    setImage(newImages);
    setImageUris(newImageUris);
    setSelectedImageIndex(null);
  };

  return (
    <View>
      <View style={styles.storeinputview}>
        <Text style={styles.storeinputtext}>
          매장 사진 추가하기* (최대 5장)
        </Text>
        {error === 'StoreImage' && images.length === 0 && (
          <Text style={styles.errorMessage}>
            매장 사진을 최소 1개 이상 업로드해 주세요.
          </Text>
        )}
      </View>
      <View style={styles.storeImageView}>
        <ScrollView
          style={styles.imageview}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {images.map((uri, index) => (
            <Pressable key={index} onPress={() => handleImagePress(index)}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{uri: `file://${uri}`}}
                  style={[
                    styles.selectimage,
                    selectedImageIndex === index && styles.selectedImage,
                  ]}
                />
                {index === 0 && (
                  <View style={styles.representativeBadge}>
                    <Text style={styles.representativeText}>대표 사진</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
          <Pressable style={{alignSelf: 'center'}} onPress={selectImage}>
            <MaterialCommunityIcons name="image-plus" size={50} color="#333" />
          </Pressable>
        </ScrollView>

        <AlertComponent />
        <ImagePickermodal
          isBottomSheetVisible={isBottomSheetVisible}
          setBottomSheetVisible={setBottomSheetVisible}
          handleCameraPick={handleCameraPick}
          handleGalleryPick={handleGalleryPick}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  storeImageView: {
    marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 40,
    height: 100,
  },
  storeinputtext: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 15,
    marginTop: 5,
  },
  imageview: {
    flexDirection: 'row',
    height: 80,
  },
  imageWrapper: {
    position: 'relative', // 배지 위치를 조정하기 위해 부모 요소를 상대 위치로 설정
  },
  selectimage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedImage: {
    borderWidth: 2,
    borderColor: '#FF0000', // 빨간 테두리 추가
    opacity: 0.6, // 반투명 효과
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

export default StoreImage;
