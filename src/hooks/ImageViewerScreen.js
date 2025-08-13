import React, {useState} from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
const ImageViewerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {images, index = 0} = route.params; // index 기본값 0
  const insets = useSafeAreaInsets();

  if (!images || images.length === 0) return null;

  const formattedImages = Array.isArray(images)
    ? images.map(img => ({
        url: typeof img === 'string' ? img : img.url || img.imageUrl || '',
        boardType: typeof img === 'string' ? null : img.boardType || null,
      }))
    : [
        {
          url:
            typeof images === 'string'
              ? images
              : images?.url || images?.imageUrl || '',
          boardType:
            typeof images === 'string' ? null : images?.boardType || null,
        },
      ];

  return (
    <View style={[styles.container, {paddingTop: insets.top - 25}]}>
      <ImageViewer
        imageUrls={formattedImages}
        index={index} // 초기 보여줄 이미지 인덱스 지정
        enableSwipeDown={true}
        onSwipeDown={() => navigation.goBack()}
        flipThreshold={9999}
        renderHeader={() => (
          <TouchableOpacity
            style={styles.closeButton}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
            onPress={() => navigation.goBack()}>
            <Feather name="x" size={25} color="white" />
          </TouchableOpacity>
        )}
        saveToLocalByLongPress={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    left: 12,
    zIndex: 10,
    padding: 10,
  },
});

export default ImageViewerScreen;
