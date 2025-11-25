import React, {useState} from 'react';
import {View, Text, Image, StyleSheet, Pressable} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../hooks/usePhotopermis';
import ImagePickermodal from '../../hooks/ImagePickermodal';
import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../constants/imagePickerLabels';
import ImageAddButton from '../../utils/ImageAddButton';
import CustomText from '../common/CustomText';

const BusinessCertificate = ({
  business_registration_certificate,
  setBusiness_registration_certificate,
  type = 'default',
  error,
  errorMessage,
}) => {
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const isRegistration = type === 'registration';

  const pickImage = async picker => {
    const options = {
      width: 1600,
      height: 2264,
      cropping: true,
      freeStyleCropEnabled: true,
      mediaType: 'photo',
      compressImageQuality: 0.85,
      compressImageMaxWidth: 1600,
      compressImageMaxHeight: 2264,
      includeExif: false,
      ...IMAGE_PICKER_TEXTS,
      ...IMAGE_CROPPER_TEXTS,
    };

    try {
      const image = await picker(options);
      setBusiness_registration_certificate(image);
    } catch (_) {}
  };

  const handleGalleryPick = async () => {
    const granted = await requestPhotoPermission();
    if (!granted) {
      setBottomSheetVisible(false);
      return;
    }
    await pickImage(ImagePicker.openPicker);
    setBottomSheetVisible(false);
  };

  const handleCameraPick = async () => {
    const granted = await requestCameraPermission();
    if (!granted) {
      setBottomSheetVisible(false);
      return;
    }
    await pickImage(ImagePicker.openCamera);
    setBottomSheetVisible(false);
  };

  const handleRemoveImage = () => {
    setBusiness_registration_certificate(null);
  };

  const currentPreviewUri =
    business_registration_certificate?.path ||
    business_registration_certificate?.uri ||
    business_registration_certificate;

  return (
    <View>
      {!isRegistration && (
        <CustomText style={styles.sectionTitle}>사업자등록증 첨부</CustomText>
      )}

      <View
        style={[
          styles.certificateContainer,
          isRegistration && styles.registrationSpacing,
        ]}>
        {!currentPreviewUri && (
          <ImageAddButton
            currentCount={currentPreviewUri ? 1 : 0}
            maxCount={1}
            onPress={() => setBottomSheetVisible(true)}
          />
        )}

        {currentPreviewUri && (
          <View style={styles.previewWrapper}>
            <Image
              source={{uri: currentPreviewUri}}
              style={styles.certificateImage}
              resizeMode="contain"
            />
            <Pressable
              onPress={handleRemoveImage}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              style={styles.deleteButton}>
              <Ionicons name="close" size={16} color="#fff" />
            </Pressable>
          </View>
        )}

        {(error === 'business_registration_certificate' ||
          error === 'businessCertificate') &&
          !currentPreviewUri && (
            <CustomText style={styles.errorText}>
              {errorMessage || '사업자등록증을 첨부해주세요.'}
            </CustomText>
          )}
      </View>

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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    marginHorizontal: 20,
    marginVertical: 10,
    color: '#333',
  },
  certificateContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  registrationSpacing: {
    marginTop: 10,
  },
  previewWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificateImage: {
    width: '100%',
    height: 220,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF4816',
    fontSize: 13,
    marginTop: 8,
    fontFamily: 'Pretendard-Regular',
  },
});

export default BusinessCertificate;
