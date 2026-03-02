import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import SkeletonBox from '../../hooks/SkeletonBox';

const {width: screenWidth} = Dimensions.get('window');

const PostItemSkeleton = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonBox style={styles.avatar} />
        <View style={styles.headerText}>
          <SkeletonBox style={styles.nickname} />
          <SkeletonBox style={styles.address} />
        </View>
      </View>
      <SkeletonBox style={styles.image} />
      <View style={styles.actions}>
        <SkeletonBox style={styles.action} />
        <SkeletonBox style={styles.action} />
        <SkeletonBox style={styles.action} />
      </View>
      <View style={styles.content}>
        <SkeletonBox style={styles.line} />
        <SkeletonBox style={styles.lineShort} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  nickname: {
    width: 120,
    height: 14,
    borderRadius: 4,
  },
  address: {
    width: 160,
    height: 12,
    borderRadius: 4,
  },
  image: {
    width: screenWidth,
    height: screenWidth,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  line: {
    width: '100%',
    height: 12,
    borderRadius: 4,
  },
  lineShort: {
    width: '70%',
    height: 12,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  action: {
    width: 42,
    height: 12,
    borderRadius: 6,
  },
});

export default PostItemSkeleton;
