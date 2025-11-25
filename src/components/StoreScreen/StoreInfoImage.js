import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  Text,
} from 'react-native';
import FastImage from 'react-native-fast-image';

import Feather from 'react-native-vector-icons/Feather';
import CustomText from '../common/CustomText';

const {width} = Dimensions.get('window');

const StoreInfoImage = ({imageList, navigation, storeId}) => {
  const handleImagePress = index => {
    navigation.navigate('StoreStack', {
      screen: 'ImageViewerScreen',
      params: {
        images: imageList,
        index: index,
      },
    });
  };

  return (
    <View>
      {!imageList || imageList.length === 0 ? null : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          {imageList.map((img, index) => (
            <Pressable
              key={img.id || index}
              onPress={() => handleImagePress(index)}>
              <View style={styles.imageWrapper}>
                <FastImage
                  source={{uri: img.url}}
                  style={styles.reviewImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <View style={styles.label}>
                  <CustomText style={styles.labelText}>
                    {img.boardType === 'DRINK' ? '주류' : '메뉴'}
                  </CustomText>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  addImageButton: {
    marginTop: 10,
    marginHorizontal: 18,
    paddingTop: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addImageText: {
    color: '#999',
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  label: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
  },
});

export default StoreInfoImage;
