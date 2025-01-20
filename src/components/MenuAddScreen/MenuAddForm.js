import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import MainMenuCheck from './MainMenuCheck';
import MenuTextInput from './MenuTextInput';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useCustomAlert from '../../hooks/useCustomAlert';

const MenuAddForm = ({
  menu,
  index,
  handleMenuChange,
  handleCheckBoxChange,
  onDelete, // 삭제 함수
}) => {
  const {showAlert, AlertComponent} = useCustomAlert();
  const [isImageSelected, setIsImageSelected] = useState(false);

  const selectImage = () => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
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

  return (
    <View key={index}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuHeaderText}>메뉴 {index + 1}</Text>
        <Pressable style={styles.deleteButton} onPress={() => onDelete(index)}>
          <Text style={styles.deleteButtonText}>삭제</Text>
        </Pressable>
      </View>
      <MenuTextInput
        label="메뉴 이름*"
        value={menu.menuName}
        onChangeText={text => handleMenuChange(text, index, 'menuName')}
        placeholder="메뉴 이름*"
      />
      <MenuTextInput
        label="메뉴 가격*"
        value={menu.price}
        onChangeText={text => handleMenuChange(text, index, 'price')}
        placeholder="메뉴 가격*"
      />
      <MenuTextInput
        label="메뉴 소개"
        value={menu.menuContent}
        onChangeText={text => handleMenuChange(text, index, 'menuContent')}
        placeholder="메뉴를 간단하게 소개해주세요."
        multiline
      />

      <View style={styles.menuAddImageView}>
        <Text style={styles.menuAddImageText}>메뉴 사진</Text>
        {menu.imageUri?.path ? (
          <Pressable onPress={confirmDeleteImage} style={styles.imagePressable}>
            <Image
              source={{uri: `file://${menu.imageUri.path}`}}
              style={[
                styles.selectImage,
                isImageSelected && styles.selectedEffect, // 눌렀을 때 효과 적용
              ]}
            />
          </Pressable>
        ) : (
          <Pressable onPress={selectImage}>
            <MaterialCommunityIcons name="image-plus" size={40} color="#333" />
          </Pressable>
        )}
      </View>
      <MainMenuCheck
        isChecked={menu.main}
        onToggle={() => handleCheckBoxChange(index)}
      />
      <View style={styles.line}></View>
      <AlertComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  menuAddImageView: {
    marginVertical: 20,
    width: '100%',
    paddingHorizontal: 18,
  },
  menuAddImageText: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  menuHeader: {
    width: '100%',
    paddingHorizontal: 18,
    marginTop: 30,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuHeaderText: {
    fontWeight: '500',
    color: '#333',
    fontSize: 17,
    marginRight: 7,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FF6B6B',
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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

export default MenuAddForm;
