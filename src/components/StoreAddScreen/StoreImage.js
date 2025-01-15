import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const StoreImage = ({ imageUris, setImageUris }) => {
  const [images, setImage] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // 선택된 이미지 인덱스 상태

  const selectImage = () => {
    if (imageUris.length >= 5) {
      Alert.alert(
        '매장 이미지',
        '이미지는 최대 5개까지 선택할 수 있습니다.',
        [
          {
            text: '확인',
            style: 'cancel',
          }
        ],
        { cancelable: true },
      );
      return; // 5개 이상일 경우 선택하지 않도록 함
    }

    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        setImage([...images, image.path]);
        setImageUris([...imageUris, image]); // 이미지 추가
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
  };

  const handleImagePress = (index) => {
    setSelectedImageIndex(index); // 선택된 이미지 인덱스 설정
    Alert.alert(
      '이미지 삭제',
      '이미지를 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => setSelectedImageIndex(null), // 선택 초기화
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => deleteImage(index),
        },
      ],
      { cancelable: true },
    );
  };

  const deleteImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newImageUris = imageUris.filter((_, i) => i !== index);
    setImage(newImages);
    setImageUris(newImageUris);
    setSelectedImageIndex(null); // 선택 초기화
  };

  return (
    <View>
      <View style={styles.storeinputview}>
        <Text style={styles.storeinputtext}>매장 사진 추가하기 (최대 5장)</Text>
      </View>
      <View style={styles.storeImageView}>
        <ScrollView
          style={styles.imageview}
          horizontal
          showsHorizontalScrollIndicator={false}>

          {images.map((uri, index) => (
            <Pressable key={index} onPress={() => handleImagePress(index)}>
              <Image
                source={{ uri: `file://${uri}` }}
                style={[
                  styles.selectimage,
                  selectedImageIndex === index && styles.selectedImage, // 선택된 이미지 스타일 추가
                ]}
              />
            </Pressable>
          ))}
          <Pressable onPress={selectImage}>
            <MaterialCommunityIcons name="image-plus" size={50} color="#333" />
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  storeImageView: {
    marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 40,
    height: 100,
  },
  storeinputtext: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  imageview: {
    flexDirection: 'row',
    height: 80,
  },
  image: {
    marginBottom: 15,
    width: 50,
    height: 50,
    marginRight: 10,
  },
  selectimage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedImage: {
    borderWidth: 2,
    borderColor: '#FF0000', // 빨간 테두리 추가
    opacity: 0.6, // 반투명 효과
  },
});

export default StoreImage;
