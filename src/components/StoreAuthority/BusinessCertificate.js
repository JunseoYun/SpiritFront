// components/CertificateSection.js
import React, {useState, useEffect} from 'react';
import {View, Pressable, Text, Image, StyleSheet} from 'react-native';

import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../hooks/usePhotopermis';
import ImagePickermodal from '../../hooks/ImagePickermodal';
import ImagePicker from 'react-native-image-crop-picker';

const BusinessCertificate = ({
  business_registration_certificate,
  setBusiness_registration_certificate,

  error,
  errorMessage,
}) => {
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false); // 바텀시트 상태

  const handleGalleryPick = () => {
    ImagePicker.openPicker({
      width: 2048,
      height: 2896, // A4 비율
      cropping: true,
      freeStyleCropEnabled: true, // 자유 크롭 허용
      mediaType: 'photo',
      compressImageQuality: 1, // 최대 화질
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
      width: 2048,
      height: 2896, // A4 비율
      cropping: true,
      freeStyleCropEnabled: true, // 자유 크롭 허용
      mediaType: 'photo',
      compressImageQuality: 1, // 최대 화질
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
