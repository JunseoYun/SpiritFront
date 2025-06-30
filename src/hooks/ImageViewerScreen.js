import React, {useState} from 'react';
import {View, Modal, TouchableOpacity, StyleSheet} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation, useRoute} from '@react-navigation/native';

const ImageViewerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {images, index = 0} = route.params; // index 기본값 0

  if (!images || images.length === 0) return null;

  const formattedImages = Array.isArray(images)
    ? images.map(img =>
        typeof img === 'string' ? {url: img} : {url: img.imageUrl},
      )
    : [{url: typeof images === 'string' ? images : images?.imageUrl}];

  return (
    <View style={{flex: 1}}>
      <ImageViewer
        imageUrls={formattedImages}
        index={index} // 초기 보여줄 이미지 인덱스 지정
        enableSwipeDown={true}
        onSwipeDown={() => navigation.goBack()}
        flipThreshold={9999}
        renderHeader={() => (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}>
            <Feather name="x" size={32} color="white" />
          </TouchableOpacity>
        )}
        saveToLocalByLongPress={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
});

export default ImageViewerScreen;
