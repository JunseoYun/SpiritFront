import React, {useState, useEffect, useRef, forwardRef} from 'react';
import {View, Text, Pressable, StyleSheet, Image} from 'react-native';
import RptAlcoholPicker from './RptAlcoholPicker';
import AlcoholTextInput from './AlcoholTextInput';
import AlcoholPrice from './AlcoholPrice';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useCustomAlert from '../../hooks/useCustomAlert';
import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../hooks/usePhotopermis';
import ImagePickermodal from '../../hooks/ImagePickermodal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ScrollView} from 'react-native-gesture-handler';

const AlcoholAddForm = forwardRef(
  (
    {
      alcohol,
      index,
      handleAlcoholChange,
      onDelete, // 삭제 함수
    },
    ref,
  ) => {
    const {showAlert, AlertComponent} = useCustomAlert();
    const [isImageSelected, setIsImageSelected] = useState(false);
    const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

    const selectImage = () => {
      setBottomSheetVisible(true); // 바텀시트 열기
    };

    const handleCameraPick = async () => {
      const hasCamera = await requestCameraPermission();
      if (!hasCamera) {
        return;
      }
      ImagePicker.openCamera({
        compressImageQuality: 1, // 품질
        width: 1024,
        height: 1024,
        cropping: true,
        mediaType: 'photo',
      })
        .then(image => {
          handleAlcoholChange(image, index, 'imageUri');
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
      ImagePicker.openPicker({
        compressImageQuality: 1, // 품질
        width: 1024,
        height: 1024,
        cropping: true,
        mediaType: 'photo',
      })
        .then(image => {
          handleAlcoholChange(image, index, 'imageUri');
        })
        .catch(error => {
          console.log('ImagePicker Error: ', error);
        });
    };

    const confirmDeleteImage = () => {
      setIsImageSelected(true); // 눌렀을 때 효과 추가

      showAlert({
        title: '이미지 삭제',
        message: '이미지를 삭제하시겠습니까?',
        onConfirm: () => {
          handleAlcoholChange('', index, 'imageUri');
          setIsImageSelected(false); // 삭제 후 효과 제거
        },
        onCancel: () => setIsImageSelected(false), // 취소 시 효과 제거
        type: 'delete',
      });
    };

    const [isVariable, setIsVariable] = useState(false);
    const [purePrice, setPurePrice] = useState(
      alcohol.price?.replace('변동', '') || '',
    );

    useEffect(() => {
      if (alcohol.price === '변동') {
        setIsVariable(true);
        setPurePrice('');
      }
    }, [alcohol.price]);

    const handlePriceChange = text => {
      const cleaned = text.replace(/[^0-9]/g, '');
      setPurePrice(cleaned);
      handleAlcoholChange(cleaned, index, 'price');
    };

    const handleToggleVariable = () => {
      const newChecked = !isVariable;
      setIsVariable(newChecked);

      // 상태 저장
      const value = newChecked ? '변동' : purePrice;
      handleAlcoholChange(value, index, 'price');
      if (newChecked) {
        if (alcohol.alcoholContent === '') {
          alcoholcontentRef.current?.focus();
        }
      }
    };

    const alcoholnameRef = useRef(null);
    const priceRef = useRef(null);
    const alcoholcontentRef = useRef(null);

    return (
      <View key={index} ref={ref} style={styles.container}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuHeaderText}>주류 {index + 1}</Text>
          <Pressable
            style={styles.deleteButton}
            onPress={() => onDelete(index)}>
            <Ionicons name="close" size={25} color="#999" />
          </Pressable>
        </View>
        <AlcoholTextInput
          label="주류 이름 *"
          value={alcohol.alcoholName}
          onChangeText={text => handleAlcoholChange(text, index, 'alcoholName')}
          placeholder="주류 이름 *"
          ref={alcoholnameRef}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (purePrice === '') {
              priceRef.current?.focus();
            }
          }}
        />
        <AlcoholPrice
          label="주류 가격 *"
          value={purePrice}
          onChangeText={handlePriceChange}
          placeholder="주류 가격 *"
          isVariable={isVariable}
          onToggleVariable={handleToggleVariable}
          ref={priceRef}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (alcohol.alcoholContent === '') {
              alcoholcontentRef.current?.focus();
            }
          }}
        />
        <AlcoholTextInput
          label="주류 소개"
          value={alcohol.alcoholContent}
          onChangeText={text =>
            handleAlcoholChange(text, index, 'alcoholContent')
          }
          placeholder="주류를 간단하게 소개해주세요."
          multiline
          ref={alcoholcontentRef}
        />

        <RptAlcoholPicker
          selectedType={alcohol.type}
          onTypeChange={value => handleAlcoholChange(value, index, 'type')}
        />
        <View style={styles.menuAddImageView}>
          <Text style={styles.menuAddImageText}>주류 사진</Text>
          {alcohol.imageUri?.path ? (
            <Pressable
              onPress={confirmDeleteImage}
              style={styles.imagePressable}>
              <Image
                source={{uri: `file://${alcohol.imageUri.path}`}}
                style={[
                  styles.selectImage,
                  isImageSelected && styles.selectedEffect, // 눌렀을 때 효과 적용
                ]}
              />
            </Pressable>
          ) : (
            <Pressable
              style={{
                width: 100,
                height: 100,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f2f2f2',
                borderRadius: 10,
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
        </View>
        <AlertComponent />
        <ImagePickermodal
          isBottomSheetVisible={isBottomSheetVisible}
          setBottomSheetVisible={setBottomSheetVisible}
          handleCameraPick={handleCameraPick}
          handleGalleryPick={handleGalleryPick}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
    marginBottom: 10,
  },
  menuAddImageView: {
    marginVertical: 20,
    width: '100%',
    paddingHorizontal: 18,
  },
  menuAddImageText: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  menuHeader: {
    width: '100%',
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuHeaderText: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 17,
    marginRight: 7,
  },
  deleteButton: {
    paddingVertical: 5,
    paddingLeft: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  selectImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10,
  },
  selectedEffect: {
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },

  line: {
    width: '100%',
    marginVertical: 20,
    marginBottom: 10,
    paddingVertical: 4,
    backgroundColor: '#F2F2F2',
  },
});

export default AlcoholAddForm;
