import React, {useEffect, useState, useCallback, useRef} from 'react';
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
  BackHandler,
  ToastAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {useToast} from '../../../context/ToastContext';
import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../../hooks/usePhotopermis';
import ImagePickermodal from '../../../hooks/ImagePickermodal';
import Loading from '../../../hooks/Loading';

const InfoImageEditScreen = ({navigation, route}) => {
  const {storeId, Source} = route.params;
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

  // useEffect(() => {
  //   if (Array.isArray(images)) {
  //     setServerImages(images);
  //   } else {
  //     setServerImages([]);
  //   }
  // }, [images]);

  useEffect(() => {
    const updatedImages = [...serverImages, ...addedImages];
    setAllImages(updatedImages);
  }, [serverImages, addedImages, deletedImages]);

  // const handleCancel = () => {
  //   setAddedImages([]);
  //   setDeletedImages([]);
  //   setAllImages([]);
  // };

  const handleCameraPick = async () => {
    const hasCamera = await requestCameraPermission();
    if (!hasCamera) {
      return;
    }
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
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) {
      return;
    }
    setLoading(true);
    try {
      const image = await ImagePicker.openPicker({
        cropping: true,
        freeStyleCropEnabled: true,
        mediaType: 'photo',
        compressImageQuality: 1,
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
      showToast('이미지는 최대 5개 입니다.');
      return;
    }
    setBottomSheetVisible(true); // 바텀시트 열기
  };

  const removeServerImage = index => {
    setLoading(true);
    const imageToRemove = serverImages[index];
    setServerImages(prev => prev.filter((_, i) => i !== index));
    setDeletedImages(prev => [...prev, imageToRemove]);

    showToast('이미지가 삭제 되었습니다.');

    setLoading(false);
  };

  const removeAddedImage = index => {
    setLoading(true);
    setAddedImages(prevImages => prevImages.filter((_, i) => i !== index));
    showToast('이미지가 삭제 되었습니다.');

    setLoading(false);
  };

  const lastBackPressed = useRef(0);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();

        if (now - lastBackPressed.current < 2000) {
          navigation.goBack();
          return true;
        }

        lastBackPressed.current = now;
        ToastAndroid.show(
          '한 번 더 누르면 작성한 내용이 사라집니다.',
          ToastAndroid.SHORT,
        );
        return true; // 기본 동작 막기
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove(); // cleanup
    }, [navigation]),
  );

  return (
    <>
      <ScrollView style={styles.bottomSheetContent}>
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
              marginBottom: Platform.OS === 'ios' ? 70 : 40,
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
      </ScrollView>
      {(loading || !loadingimg) && <Loading loading={true} />}
    </>
  );
};

export default InfoImageEditScreen;

const windowWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 20,
  },

  imageWrapper: {
    width: ('100%' / 4) * 3,
    height: ((windowWidth - 36) * 9) / 16,
    marginVertical: 0,
    marginBottom: 20,
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
