import React, {useCallback} from 'react';
import {StyleSheet, View, Pressable, Text} from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../common/CustomText';

const StoreImageManagementSection = ({cards = []}) => {
  const renderImagePreview = useCallback(imageUrls => {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return (
        <View style={styles.singleImageWrapper}>
          <View style={[styles.singleImageOuter, styles.stackedImageShadow]}>
            <View style={[styles.stackedImageInner, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={28} color="#9BA5B2" />
            </View>
          </View>
        </View>
      );
    }

    if (imageUrls.length === 1) {
      const uri = imageUrls[0];
      return (
        <View style={styles.singleImageWrapper}>
          <View style={[styles.singleImageOuter, styles.stackedImageShadow]}>
            <View style={styles.stackedImageInner}>
              <FastImage
                source={{uri}}
                style={styles.stackedImageImage}
                resizeMode={FastImage.resizeMode.cover}
              />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.imageStackWrapper}>
        <View
          style={[
            styles.stackedImage,
            styles.stackedImageSecondary,
            styles.stackedImageShadow,
          ]}>
          <View style={styles.stackedImageInner}>
            <FastImage
              source={{uri: imageUrls[1] || imageUrls[0]}}
              style={styles.stackedImageImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          </View>
        </View>
        <View
          style={[
            styles.stackedImage,
            styles.stackedImagePrimary,
            styles.stackedImageShadow,
          ]}>
          <View style={styles.stackedImageInner}>
            <FastImage
              source={{uri: imageUrls[0]}}
              style={styles.stackedImageImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          </View>
        </View>
      </View>
    );
  }, []);

  const getExtraCount = useCallback(list => {
    if (!Array.isArray(list)) {
      return 0;
    }
    return list.length > 2 ? list.length - 2 : 0;
  }, []);

  if (!cards.length) {
    return null;
  }

  return (
    <View style={styles.row}>
      {cards.map(card => {
        const imageUrls = card.imageUrls || [];
        const extraCount = getExtraCount(imageUrls);

        return (
          <Pressable
            key={card.key || card.title}
            style={styles.card}
            onPress={card.onPress}>
            {extraCount > 0 && (
              <View style={styles.imageBadge}>
                <CustomText
                  style={styles.imageBadgeText}>{`+${extraCount}`}</CustomText>
              </View>
            )}
            {renderImagePreview(imageUrls)}

            <CustomText style={styles.title}>{card.title}</CustomText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 30,
    marginBottom: 10,
    gap: 18,
  },
  card: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  imageStackWrapper: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  singleImageWrapper: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  stackedImage: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
  },
  stackedImageShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 2,
  },
  stackedImagePrimary: {
    transform: [{rotate: '-5deg'}],
    left: 16,
    zIndex: 2,
    top: 24,
  },
  stackedImageSecondary: {
    transform: [{rotate: '5deg'}],
    right: 16,
    top: 10,
  },
  singleImageOuter: {
    width: 90,
    height: 90,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  stackedImageInner: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackedImageImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F1F3F5',
  },
  imageBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#F1F2F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 5,
  },
  imageBadgeText: {
    color: '#333',
    fontSize: 12,
    fontFamily: 'Pretendard-SemiBold',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    textAlign: 'center',
  },
});

export default StoreImageManagementSection;
