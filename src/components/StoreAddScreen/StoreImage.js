import React, {useState} from 'react';
import {View, Text, Image, ScrollView, Pressable} from 'react-native';
import styles from './StoreStyle';
import ImagePicker from 'react-native-image-crop-picker';

const StoreImage = ({imageUris, setImageUris}) => {
  const [images, setImage] = useState([]);

  const selectImage = () => {
    if (imageUris.length >= 5) {
      alert('이미지는 최대 5개까지 선택할 수 있습니다.');
      return; // 5개 이상일 경우 선택하지 않도록 함
    }

    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        console.log(image);
        setImage([...images, image.path]);
        setImageUris([...imageUris, image]); // 이미지 추가
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
  };

  return (
    <View>
      <View style={styles.storeinputview}>
        <Text style={styles.storetext}>메뉴 사진 추가하기 (최대 5장)</Text>
      </View>
      <View style={styles.storeinputview}>
        <ScrollView
          style={styles.imageview}
          horizontal
          showsHorizontalScrollIndicator={false}>
          <Pressable onPress={selectImage}>
            <Image
              source={require('../../assets/imageadd.png')}
              style={styles.image}
            />
          </Pressable>
          {images.map((uri, index) => (
            <Image
              key={index}
              source={{uri: `file://${uri}`}}
              style={styles.selectimage}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default StoreImage;
