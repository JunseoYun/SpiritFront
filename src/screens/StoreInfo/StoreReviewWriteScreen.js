import React, {useCallback, useRef, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  ToastAndroid,
  BackHandler,
} from 'react-native';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import ImagePicker from 'react-native-image-crop-picker';
import {ReviewCreate} from '../../api/reviewApi';
import ReviewForm from '../../components/StoreReviewScreen/ReviewForm';
import forbiddenWords from '../../hooks/forbiddenWords';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useToast} from '../../context/ToastContext';
import {requestPhotoPermission} from '../../hooks/usePhotopermis';
import Loading from '../../hooks/Loading';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../constants/imagePickerLabels';

const StoreReviewWriteScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, storename, onReviewSubmitted} = route.params;
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();
  const {bottom} = useSafeAndroidInsets();

  const [newrate, setNewRate] = useState(0);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [visitDate, setVisitDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [addloading, setAddloading] = useState(false);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  const renderStars = onRateSelect => {
    return Array.from({length: 5}, (_, index) => {
      const starIndex = index + 1;
      return (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setNewRate(starIndex);
            onRateSelect?.(starIndex);
          }}>
          <FontAwesomeIcon
            name="star"
            size={30}
            color={starIndex <= newrate ? '#FFD700' : '#F0F0F0'}
            style={styles.star}
          />
        </TouchableOpacity>
      );
    });
  };

  const onChangeText = inputText => {
    setNewReviewContent(inputText);
  };

  const selectImage = async () => {
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) {
      return;
    }

    ImagePicker.openCamera({
      cropping: true,
      freeStyleCropEnabled: true,
      mediaType: 'photo',
      avoidEmptySpaceAroundImage: true,
      compressImageQuality: 0.95,
      compressImageMaxWidth: 2160,
      compressImageMaxHeight: 2160,
      includeExif: false,
      ...IMAGE_PICKER_TEXTS,
      ...IMAGE_CROPPER_TEXTS,
      ...(Platform.OS === 'ios' && {
        width: 1600,
        height: 1600,
      }),
    })
      .then(image => {
        setImages(prevImages => [...prevImages, image]);
      })
      .catch(error => {
      });
  };

  const handleGalleryPick = async () => {
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) {
      return;
    }

    const remaining = 5 - images.length;

    try {
      const pickedImages = await ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: remaining > 1,
        maxFiles: remaining > 1 ? remaining : 1,
        cropping: false,
        includeExif: false,
        ...IMAGE_PICKER_TEXTS,
      });

      const selectedImages = Array.isArray(pickedImages)
        ? pickedImages
        : [pickedImages];

      const croppedImages = [];

      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const cropped = await ImagePicker.openCropper({
          path: image.path,
          cropping: true,
          freeStyleCropEnabled: true,
          avoidEmptySpaceAroundImage: true,
          compressImageQuality: 0.95,
          compressImageMaxWidth: 2160,
          compressImageMaxHeight: 2160,
          ...IMAGE_CROPPER_TEXTS,
          cropperActiveWidgetColor: '#3CBBFF',
          cropperStatusBarLight: true,
          cropperToolbarColor: '#ffffff',
          cropperToolbarWidgetColor: '#333333',
          includeExif: false,
          ...(Platform.OS === 'ios' && {
            width: 1600,
            height: 1600,
          }),
        });
        croppedImages.push(cropped);
      }

      setImages(prev => [...prev, ...croppedImages]);
    } catch (error) {
    }
  };

  const handleImagePress = index => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setSelectedImageIndex(null);
  };

  const hadleNoWrite = useCallback(() => {
    const hasContent =
      newReviewContent.trim().length > 0 || newrate > 0 || images.length > 0;

    if (!hasContent) {
      navigation.goBack();
      return;
    }

    showAlert({
      title: '작성한 내용이 저장되지 않았습니다',
      message: '리뷰 작성을 취소하시겠습니까?',
      onConfirm: () => {
        navigation.goBack();
      },
      type: 'confirm',
    });
  }, [images.length, navigation, newReviewContent, newrate, showAlert]);

  const lastBackPressed = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();

        if (now - lastBackPressed.current < 2000) {
          hadleNoWrite();
          return true;
        }

        lastBackPressed.current = now;
        ToastAndroid.show(
          '한 번 더 누르면 작성한 내용이 사라집니다.',
          ToastAndroid.SHORT,
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [hadleNoWrite]),
  );

  const handleSubmitReview = async () => {
    setAddloading(true);
    try {
      const containsForbiddenWord = forbiddenWords.some(
        word =>
          newReviewContent.includes(word) || newrate.toString().includes(word),
      );

      if (containsForbiddenWord) {
        showAlert({
          title: '가이드 위반',
          message: '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
        });
        return;
      }

      if (!newReviewContent.trim()) {
        showToast('리뷰 내용을 적어주세요.');
        return;
      }

      if (newrate === 0) {
        showToast('별점을 입력해주세요.');
        return;
      }

      const data = {
        files: images,
        createReviewDto: {
          content: newReviewContent,
          rate: newrate,
          visitedAt: new Date(visitDate.getTime() + 9 * 60 * 60 * 1000),
          storeId: storeId,
        },
      };

      await ReviewCreate(data);
      showToast('리뷰가 등록되었습니다.');
      onReviewSubmitted?.();
      navigation.goBack();
    } catch (error) {
      if (error.response?.data?.code == 25006) {
        showAlert({
          title: '등록 제한',
          message: '해당 가게에는 하루에 한 번만 리뷰를 작성할 수 있습니다.',
        });
        return;
      }
      if (error.response?.data?.code == 25005) {
        showAlert({
          title: '등록 제한',
          message: '리뷰는 하루 최대 5개까지만 작성할 수 있습니다.',
        });
        return;
      } else {
        showAlert({
          title: '등록 실패',
          message:
            '리뷰 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
        return;
      }
    } finally {
      setAddloading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={false}>
      <View style={[styles.container]}>
        <ReviewForm
          newReviewContent={newReviewContent}
          onChangeText={onChangeText}
          renderStars={renderStars}
          visitDate={visitDate}
          setVisitDate={setVisitDate}
          isDatePickerOpen={isDatePickerOpen}
          setIsDatePickerOpen={setIsDatePickerOpen}
          images={images}
          selectedImageIndex={selectedImageIndex}
          handleImagePress={handleImagePress}
          selectImage={selectImage}
          handleSubmitReview={handleSubmitReview}
          hadleNoWrite={hadleNoWrite}
          isBottomSheetVisible={isBottomSheetVisible}
          setBottomSheetVisible={setBottomSheetVisible}
          handleGalleryPick={handleGalleryPick}
          setSelectedImageIndex={setSelectedImageIndex}
          initialRate={newrate}
        />
      </View>

      <AlertComponent />
      <Loading loading={addloading} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  star: {
    marginHorizontal: 3,
  },
});

export default StoreReviewWriteScreen;
