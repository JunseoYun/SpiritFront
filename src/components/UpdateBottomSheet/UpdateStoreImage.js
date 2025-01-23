import React from 'react';
import {View, Text, ScrollView, Image, StyleSheet} from 'react-native';
import ActionButtons from './ActionButtons';

const UpdateStoreImage = ({images, onCancel, onSave}) => {
  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>매장 이미지</Text>
      {images?.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image
                source={{uri: image.imageUrl}}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text>이미지 없음</Text>
      )}
      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreImage;

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  horizontalScrollContainer: {
    flexDirection: 'row',
  },
  imageWrapper: {
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});
