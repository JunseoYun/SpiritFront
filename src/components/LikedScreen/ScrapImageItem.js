import React, {memo} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';

const ScrapImageItem = ({store, size, onPress, style}) => {
  const handlePress = () => onPress?.(store);
  const imageSource = store?.mainImgUrl
    ? {uri: store.mainImgUrl}
    : require('../../assets/default_store6.png');

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{color: 'rgba(0,0,0,0.06)'}}
      style={[styles.container, {width: size, height: size}, style]}>
      <FastImage
        source={imageSource}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f1f1f1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default memo(ScrapImageItem);
