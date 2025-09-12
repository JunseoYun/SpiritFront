import React, {useState, useRef, useEffect, forwardRef} from 'react';
import {View, Text, Pressable, StyleSheet, Image} from 'react-native';
import MainMenuCheck from './MainMenuCheck';
import MenuTextInput from './MenuTextInput';
import MenuPrice from './MenuPrice';
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

const MenuAddForm = forwardRef(
  (
    {
      menu,
      index,
      handleMenuChange,
      onDelete, // 삭제 함수
    },
    ref,
  ) => {
    const {showAlert, AlertComponent} = useCustomAlert();
    const [overText, setOverText] = useState(false);
    const [overdesText, setOverdesText] = useState(false);
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
        width: 1024,
        height: 1024,
        compressImageQuality: 1, // 품질
        cropping: true,
        mediaType: 'photo',
      })
        .then(image => {
          handleMenuChange(image, index, 'imageUri');
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
        width: 1024,
        height: 1024,
        compressImageQuality: 1, // 품질
        cropping: true,
        mediaType: 'photo',
      })
        .then(image => {
          handleMenuChange(image, index, 'imageUri');
        })
        .catch(error => {
          console.log('ImagePicker Error: ', error);
        });
    };

    const confirmDeleteImage = () => {
      setIsImageSelected(true); // 눌렀을 때 효과 추가

      showAlert({
        title: '사진 삭제',
        message: '선택된 사진을 삭제하시겠습니까?',
        onConfirm: () => {
          handleMenuChange('', index, 'imageUri');
          setIsImageSelected(false); // 삭제 후 효과 제거
        },
        onCancel: () => setIsImageSelected(false),
        type: 'delete',
      });
    };

    const MenuChange = (text, index, value) => {
      if (value == 'menuName') {
        handleMenuChange(text, index, 'menuName');
      }
      if (value == 'price') {
        handleMenuChange(text, index, 'price');
      }
      if (value == 'menuContent') {
        handleMenuChange(text, index, 'menuContent');
      }
    };

    const [isVariable, setIsVariable] = useState(false);
    const [purePrice, setPurePrice] = useState(
      menu.price?.replace('변동', '') || '',
    );

    useEffect(() => {
      if (menu.price === '변동') {
        setIsVariable(true);
        setPurePrice('');
        setOverText(false);
      }
    }, [menu.price]);

    const handlePriceChange = text => {
      const cleaned = text.replace(/[^0-9]/g, '');
      let num = cleaned === '' ? '' : parseInt(cleaned, 10);
      if (typeof num === 'number' && !isNaN(num)) {
        if (num > 100000000) {
          num = 100000000;
          setOverText(true);
        } else {
          setOverText(false);
        }
      }
      const value = num === '' ? '' : String(num);
      setPurePrice(value);
      MenuChange(value, index, 'price');
    };

    const handleToggleVariable = () => {
      const newChecked = !isVariable;
      setIsVariable(newChecked);

      // 상태 저장
      const value = newChecked ? '변동' : purePrice;
      MenuChange(value, index, 'price');

      if (newChecked) {
        if (menu.menuContent === '') {
          menucontentRef.current?.focus();
        }
      }
    };

    const menunameRef = useRef(null);
    const priceRef = useRef(null);
    const menucontentRef = useRef(null);

    return (
      <View key={index} ref={ref} style={styles.container}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuHeaderText}>메뉴 {index + 1}</Text>
          <Pressable
            style={styles.deleteButton}
            onPress={() => onDelete(index)}>
            <Ionicons name="close" size={25} color="#999" />
          </Pressable>
        </View>
        <MainMenuCheck
          selectedType={menu.type}
          imagecheck={menu.imageUri?.path}
          onChangeType={type => handleMenuChange(type, index, 'type')}
        />
        <MenuTextInput
          label="메뉴 이름*"
          value={menu.menuName}
          onChangeText={text => MenuChange(text, index, 'menuName')}
          placeholder="메뉴 이름*"
          ref={menunameRef}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (menu.price === '') {
              priceRef.current?.focus();
            }
          }}
        />
        <MenuPrice
          label="메뉴 가격*"
          value={menu.price}
          onChangeText={handlePriceChange}
          placeholder="메뉴 가격*"
          isVariable={isVariable}
          onToggleVariable={handleToggleVariable}
          ref={priceRef}
          returnKeyType="next" // ✅ 추가
          onSubmitEditing={() => {
            if (menu.menuContent === '') {
              menucontentRef.current?.focus();
            }
          }}
        />
        {overText && (
          <Text style={styles.errorTextprice}>
            가격은 최대 1억원까지 입력 가능합니다
          </Text>
        )}
        <MenuTextInput
          label="메뉴 소개"
          value={menu.menuContent}
          onChangeText={text => {
            const maxLines = 5;
            const maxChars = 100;
            const lines = (text || '').split('\n');
            if (lines.length > maxLines || text.length > maxChars) {
              setOverdesText(true);
              return; // 초과 입력 무시
            } else {
              setOverdesText(false);
            }
            MenuChange(text, index, 'menuContent');
          }}
          placeholder="메뉴를 간단하게 소개해주세요."
          multiline
          ref={menucontentRef}
        />
        {overdesText && (
          <Text style={styles.errorTextprice}>
            주류 설명은 최대 5줄, 최대 100자까지 입력 가능합니다.
          </Text>
        )}

        <View style={styles.menuAddImageView}>
          <Text style={styles.menuAddImageText}>메뉴 사진</Text>
          {menu.imageUri?.path ? (
            <Pressable
              onPress={confirmDeleteImage}
              style={styles.imagePressable}>
              <Image
                source={{uri: `file://${menu.imageUri.path}`}}
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
    paddingBottom: 20,
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

  errorview: {
    width: '100%',
    paddingHorizontal: 18,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
  },
  errorTextprice: {
    paddingHorizontal: 18,
    color: '#FF4816',
    fontSize: 14,
  },
});

export default MenuAddForm;
