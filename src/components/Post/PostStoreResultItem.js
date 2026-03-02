import React, {memo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import CustomText from '../../utils/CustomText';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import ColorUtil from '../../utils/ColorUtil';

const PostStoreResultItem = ({store, width, onPress, style}) => {
  const {translateCategory} = useCategoryTranslation();

  const handlePress = () => onPress?.(store);
  const imageSource = store?.mainImgUrl
    ? {uri: store.mainImgUrl}
    : require('../../assets/default_store6.png');
  const categoriesText = (store?.categories || [])
    .map(category => translateCategory(category) || category)
    .filter(Boolean)
    .join('  ');
  const addressText = store?.locationDto?.addressDetail
    ? `${store.locationDto.address}, ${store.locationDto.addressDetail}`
    : store?.locationDto?.address || store?.address || '';
  const imageHeight = Math.round(width * 0.68);

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{color: 'rgba(0,0,0,0.06)'}}
      style={({pressed}) => [
        styles.container,
        {width},
        pressed && styles.cardPressed,
        style,
      ]}>
      <View style={[styles.imageWrap, {height: imageHeight}]}>
        <FastImage
          source={imageSource}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>
      <View style={styles.info}>
        <CustomText style={styles.title} numberOfLines={1}>
          {store?.name || ''}
        </CustomText>
        {Boolean(categoriesText) && (
          <CustomText style={styles.category} numberOfLines={1}>
            {categoriesText}
          </CustomText>
        )}
        {Boolean(addressText) && (
          <CustomText
            style={styles.address}
            numberOfLines={1}
            ellipsizeMode="tail">
            {addressText}
          </CustomText>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  cardPressed: {
    opacity: 0.92,
  },
  imageWrap: {
    width: '100%',
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: ColorUtil.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
  },
  info: {
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Pretendard-SemiBold',
  },
  category: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Pretendard-Regular',
  },
  address: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Pretendard-Medium',
  },
});

export default memo(PostStoreResultItem);
