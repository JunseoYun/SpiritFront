import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import ImagePicker from 'react-native-image-crop-picker';
import {
  ReviewEdit,
  ReviewEditImage,
  ReviewDeleteImage,
} from '../../../api/reviewApi';
import useCustomAlert from '../../../hooks/useCustomAlert';
import forbiddenWords from '../../../hooks/forbiddenWords';
import {requestPhotoPermission} from '../../../hooks/usePhotopermis';
import Loading from '../../../hooks/Loading';
import ReviewForm from '../../../components/StoreReviewScreen/ReviewForm';
import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../../constants/imagePickerLabels';

const ReviewEditScreen = ({route, navigation}) => {
  const {reviewdata} = route.params || {};
  const {showAlert, AlertComponent} = useCustomAlert();

  const [reviewData, setReviewData] = useState(null);
  const [reviewContent, setReviewContent] = useState('');
  const [rate, setRate] = useState(0);
  const [visitedAt, setVisitedAt] = useState(new Date());
  const [serverImages, setServerImages] = useState([]);
  const [addedImages, setAddedImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (reviewdata) {
      setReviewData(reviewdata);
      setReviewContent(reviewdata.content || '');
      setRate(reviewdata.rate || 0);
      setVisitedAt(new Date(reviewdata.visitedAt));
      setServerImages(reviewdata.imgUrlList || []);
      setAddedImages([]);
      setDeletedImages([]);
      setSelectedImageIndex(null);
    }
  }, [reviewdata]);

  const combinedImages = useMemo(() => {
    const formattedServerImages = (serverImages || []).map(image => {
      if (typeof image === 'string') {
        return {uri: image};
      }
      if (image?.uri) {
        return {uri: image.uri};
      }
      if (image?.url) {
        return {uri: image.url};
      }
      return image;
    });

    return [...formattedServerImages, ...addedImages];
  }, [serverImages, addedImages]);

  const renderStars = useCallback(
    onRateSelect => {
      return Array.from({length: 5}, (_, index) => {
        const starIndex = index + 1;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setRate(starIndex);
              onRateSelect?.(starIndex);
            }}>
            <FontAwesomeIcon
              name="star"
              size={30}
              color={starIndex <= rate ? '#FFD700' : '#F0F0F0'}
              style={styles.star}
            />
          </TouchableOpacity>
        );
      });
    },
    [rate],
  );

  const totalImagesCount = serverImages.length + addedImages.length;

  const ensureImageLimit = () => {
    if (totalImagesCount >= 5) {
      showAlert({
        title: '이미지 추가 제한',
        message: '이미지는 최대 5개까지 추가할 수 있습니다.',
      });
      return false;
    }
    return true;
  };

  const selectImage = async () => {
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera || !ensureImageLimit()) {
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
        setAddedImages(prev => [...prev, image]);
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
  };

  const handleGalleryPick = async () => {
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) {
      return;
    }

    const remaining = 5 - totalImagesCount;
    if (remaining <= 0) {
      showAlert({
        title: '이미지 추가 제한',
        message: '이미지는 최대 5개까지 추가할 수 있습니다.',
      });
      return;
    }

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
          includeExif: false,
          ...IMAGE_CROPPER_TEXTS,
          cropperActiveWidgetColor: '#3CBBFF',
          cropperStatusBarLight: true,
          cropperToolbarColor: '#ffffff',
          cropperToolbarWidgetColor: '#333333',
          ...(Platform.OS === 'ios' && {
            width: 1600,
            height: 1600,
          }),
        });
        croppedImages.push(cropped);
      }

      setAddedImages(prev => [...prev, ...croppedImages]);
    } catch (error) {
      console.log('ImagePicker Error: ', error);
    }
  };

  const handleImagePress = index => {
    setSelectedImageIndex(index);

    if (index < serverImages.length) {
      const imageToRemove = serverImages[index];
      setDeletedImages(prev => [...prev, imageToRemove]);
      setServerImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const localIndex = index - serverImages.length;
      setAddedImages(prev => prev.filter((_, i) => i !== localIndex));
    }

    setSelectedImageIndex(null);
  };

  const onSave = () => {
    route.params?.onRefresh?.();
    navigation.goBack();
  };

  const hadleNoWrite = useCallback(() => {
    if (!reviewData) {
      navigation.goBack();
      return;
    }

    const hasContentChanged =
      reviewContent !== (reviewData.content || '') || rate !== reviewData.rate;
    const hasDateChanged =
      new Date(visitedAt).getTime() !==
      new Date(reviewData.visitedAt).getTime();
    const hasImageChanged = addedImages.length > 0 || deletedImages.length > 0;

    if (!hasContentChanged && !hasDateChanged && !hasImageChanged) {
      navigation.goBack();
      return;
    }

    showAlert({
      title: '수정 취소',
      message: '변경하신 내용이 저장되지 않았습니다. 수정을 취소할까요?',
      onConfirm: () => navigation.goBack(),
      type: 'confirm',
    });
  }, [
    addedImages.length,
    deletedImages.length,
    navigation,
    rate,
    reviewContent,
    reviewData,
    showAlert,
    visitedAt,
  ]);

  const handleSubmitReview = async () => {
    if (!reviewData) {
      return;
    }

    const containsForbiddenWord = forbiddenWords.some(word =>
      reviewContent.includes(word),
    );

    if (containsForbiddenWord) {
      showAlert({
        title: '가이드 위반',
        message: '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
      });
      return;
    }

    if (!reviewContent?.trim() || !rate || !visitedAt) {
      showAlert({
        title: '입력 누락',
        message: '모든 정보를 입력해 주세요.',
      });
      return;
    }

    const updatedReview = {
      content: reviewContent,
      rate: rate,
      visitedAt: visitedAt,
    };

    const imageData = {
      files: addedImages,
    };

    const isImageChanged = addedImages.length > 0;
    const isdeleteimgchanged = deletedImages.length > 0;
    const isInfoChanged =
      reviewContent !== (reviewData.content || '') ||
      rate !== reviewData.rate ||
      new Date(visitedAt).getTime() !==
        new Date(reviewData.visitedAt).getTime();

    if (!isInfoChanged && !isImageChanged && !isdeleteimgchanged) {
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);

      if (isInfoChanged) {
        await ReviewEdit(reviewData.id, updatedReview);
      }

      if (isImageChanged) {
        await ReviewEditImage(reviewData.id, imageData);
      }

      if (isdeleteimgchanged) {
        await ReviewDeleteImage(reviewData.id, deletedImages);
      }

      setAddedImages([]);
      setDeletedImages([]);
      onSave();
    } catch (error) {
      showAlert({
        title: '수정 실패',
        message: '잘못된 요청입니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <ReviewForm
          newReviewContent={reviewContent}
          onChangeText={setReviewContent}
          renderStars={renderStars}
          visitDate={visitedAt}
          setVisitDate={setVisitedAt}
          isDatePickerOpen={isDatePickerOpen}
          setIsDatePickerOpen={setIsDatePickerOpen}
          images={combinedImages}
          selectedImageIndex={selectedImageIndex}
          handleImagePress={handleImagePress}
          handleSubmitReview={handleSubmitReview}
          isBottomSheetVisible={isBottomSheetVisible}
          selectImage={selectImage}
          hadleNoWrite={hadleNoWrite}
          setBottomSheetVisible={setBottomSheetVisible}
          handleGalleryPick={handleGalleryPick}
          submitLabel="수정 완료"
          initialRate={rate}
        />
      </View>

      <AlertComponent />
      <Loading loading={loading} />
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

export default ReviewEditScreen;
