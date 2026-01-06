import React, {memo} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';

const ScrapImageItem = ({store, size, onPress, style}) => {
  const handlePress = () => onPress?.(store);
  const imageUrl =
    store?.postImgUrlList?.[0] ??
    store?.imgUrlList?.[0] ??
    store?.postImages?.[0] ??
    store?.mainImgUrl ??
    store?.imageUrl ??
    null;
  const imageSource = imageUrl
    ? {uri: imageUrl}
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
