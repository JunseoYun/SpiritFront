// components/CertificateSection.js
import React, {useState, useEffect} from 'react';
import {View, Pressable, Text, Image, StyleSheet} from 'react-native';

import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../hooks/usePhotopermis';
import ImagePickermodal from '../../hooks/ImagePickermodal';
import ImagePicker from 'react-native-image-crop-picker';
import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../constants/imagePickerLabels';

const BusinessCertificate = ({
  business_registration_certificate,
  setBusiness_registration_certificate,

  error,
  errorMessage,
}) => {
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false); // 바텀시트 상태

  const handleGalleryPick = () => {
    ImagePicker.openPicker({
      width: 1600,
      height: 2264, // A4 비율(대략 1.414)
      cropping: true,
      freeStyleCropEnabled: true, // 자유 크롭 허용
      mediaType: 'photo',
      compressImageQuality: 0.85, // 용량 절감
      compressImageMaxWidth: 1600,
      compressImageMaxHeight: 2264,
      includeExif: false,
      ...IMAGE_PICKER_TEXTS,
      ...IMAGE_CROPPER_TEXTS,
    })
      .then(image => {
        setBusiness_registration_certificate(image);
      })
      .catch(error => {});
  };

  const handleCameraPick = async () => {
    const hasCamera = await requestCameraPermission();
    if (!hasCamera) return;

    ImagePicker.openCamera({
      width: 1600,
      height: 2264, // A4 비율(대략 1.414)
      cropping: true,
      freeStyleCropEnabled: true, // 자유 크롭 허용
      mediaType: 'photo',
      compressImageQuality: 0.85,
      compressImageMaxWidth: 1600,
      compressImageMaxHeight: 2264,
      includeExif: false,
      ...IMAGE_PICKER_TEXTS,
      ...IMAGE_CROPPER_TEXTS,
    })
      .then(image => {
        setBusiness_registration_certificate(image);
      })
      .catch(error => {});
  };
  return (
    <View>
      <Text style={styles.sectionTitle}>사업자등록증 첨부*</Text>

      <View style={styles.certificateContainer}>
        <Pressable
          style={styles.certificateButton}
          onPress={() => setBottomSheetVisible(true)}>
          <Text style={styles.certificateButtonText}>이미지 선택하기</Text>
        </Pressable>

        {error === 'business_registration_certificate' &&
          business_registration_certificate === null && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

        {business_registration_certificate && (
          <Image
            source={{uri: business_registration_certificate.path}}
            style={styles.certificateImage}
            resizeMode="contain"
          />
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
    alignItems: 'center',
  },
  certificateButton: {
    backgroundColor: '#45C9FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 7,
  },
  certificateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
  },
  certificateImage: {width: '100%', height: 200, marginTop: 10},
  errorText: {
    color: 'red',
    fontSize: 14,
    marginVertical: 7,
    fontFamily: 'Pretendard-Regular',
    marginHorizontal: 18,
  },
});

export default BusinessCertificate;
