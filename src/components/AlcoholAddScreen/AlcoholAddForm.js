import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import RptAlcoholPicker from './RptAlcoholPicker';
import AlcoholTextInput from './AlcoholTextInput';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useCustomAlert from '../../hooks/useCustomAlert';

const AlcoholAddForm = ({
  alcohol,
  index,
  handleAlcoholChange,
  onDelete, // 삭제 함수
}) => {
  const {showAlert, AlertComponent} = useCustomAlert();
  const [isImageSelected, setIsImageSelected] = useState(false);
  console.log(alcohol);

  const selectImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
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

  return (
    <View key={index}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuHeaderText}>주류 {index + 1}</Text>
        <Pressable style={styles.deleteButton} onPress={() => onDelete(index)}>
          <Text style={styles.deleteButtonText}>삭제</Text>
        </Pressable>
      </View>
      <AlcoholTextInput
        label="주류 이름*"
        value={alcohol.alcoholName}
        onChangeText={text => handleAlcoholChange(text, index, 'alcoholName')}
        placeholder="주류 이름*"
      />
      <AlcoholTextInput
        label="주류 가격*"
        value={alcohol.price}
        onChangeText={text => {
          // const numericValue = text.replace(/[^0-9]/g, ''); // 숫자만 남기기
          handleAlcoholChange(text, index, 'price');
        }}
        placeholder="주류 가격*"
        keyboardType="numeric"
      />
      <AlcoholTextInput
        label="주류 소개"
        value={alcohol.alcoholContent}
        onChangeText={text =>
          handleAlcoholChange(text, index, 'alcoholContent')
        }
        placeholder="주류를 간단하게 소개해주세요."
        multiline
      />

      <RptAlcoholPicker />
      <View style={styles.menuAddImageView}>
        <Text style={styles.menuAddImageText}>주류 사진</Text>
        {alcohol.imageUri?.path ? (
          <Pressable onPress={confirmDeleteImage} style={styles.imagePressable}>
            <Image
              source={{uri: `file://${alcohol.imageUri.path}`}}
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

export default AlcoholAddForm;
