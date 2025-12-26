import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';

const LikedGridItemSkeleton = ({width, style}) => {
  const imageHeight = Math.round(width * 0.68);
  return (
    <View style={[styles.container, {width}, style]}>
      <View style={[styles.image, {height: imageHeight}]} />
      <View style={styles.info}>
        <View style={styles.linePrimary} />
        <View style={styles.lineSecondary} />
        <View style={styles.lineTertiary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  image: {
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
  },
  info: {
    paddingTop: 10,
    paddingBottom: 8,
  },
  linePrimary: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  lineSecondary: {
    height: 10,
    marginTop: 6,
    width: '80%',
    borderRadius: 5,
    backgroundColor: '#eef0f3',
  },
  lineTertiary: {
    height: 10,
    marginTop: 6,
    width: '70%',
    borderRadius: 5,
    backgroundColor: '#eef0f3',
  },
});

export default memo(LikedGridItemSkeleton);
