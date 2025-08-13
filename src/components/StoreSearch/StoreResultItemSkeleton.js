import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import SkeletonBox from '../../hooks/SkeletonBox';

const windowWidth = Dimensions.get('window').width;
const imageSize = 110;

const StoreResultItemSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* 왼쪽 이미지 박스 */}
      <SkeletonBox
        style={{width: imageSize, height: imageSize, borderRadius: 10}}
      />

      {/* 오른쪽 텍스트 영역 */}
      <View style={styles.textContainer}>
        <SkeletonBox style={{width: 120, height: 16, borderRadius: 4}} />
        <SkeletonBox
          style={{width: 180, height: 20, borderRadius: 4, marginTop: 8}}
        />
        <SkeletonBox
          style={{width: 200, height: 16, borderRadius: 4, marginTop: 8}}
        />
        <SkeletonBox
          style={{width: 80, height: 14, borderRadius: 4, marginTop: 8}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
    marginBottom: 7,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignSelf: 'center',
    paddingHorizontal: 18,
  },
  textContainer: {
    marginLeft: 10,
    justifyContent: 'center',
    flex: 1,
  },
});

export default StoreResultItemSkeleton;
