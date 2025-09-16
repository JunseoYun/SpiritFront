import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import SkeletonBox from '../../hooks/SkeletonBox';

const {width} = Dimensions.get('window');

const StoreMainSkeleton = () => {
  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      {/* ✅ 상단 이미지 */}
      <SkeletonBox style={{width, height: 270}} />

      <View style={{paddingHorizontal: 16, paddingTop: 16}}>
        {/* ✅ 카테고리 */}
        <SkeletonBox style={{width: 100, height: 16, marginBottom: 15}} />
        {/* ✅ 가게명 */}
        <SkeletonBox style={{width: 140, height: 24, marginBottom: 15}} />
        <SkeletonBox style={{width: 100, height: 20, marginBottom: 15}} />

        {/* ✅ 가격 3개 */}
        <View style={{flexDirection: 'row', marginBottom: 20}}>
          <SkeletonBox style={[styles.priceTag, {width: 80}]} />
          <SkeletonBox style={[styles.priceTag, {width: 80}]} />
          <SkeletonBox style={[styles.priceTag, {width: 80}]} />
        </View>

        {/* ✅ 주소 */}
        <SkeletonBox style={{width: '80%', height: 14, marginBottom: 8}} />
        {/* ✅ 영업 상태 */}
        <SkeletonBox style={{width: '50%', height: 14, marginBottom: 30}} />

        <SkeletonBox
          style={{
            width: '100%',
            height: 170,
            marginBottom: 20,
            borderRadius: 17,
          }}
        />
      </View>

      {/* ✅ 탭 네비게이션 */}
      <View style={styles.tabRow}>
        <SkeletonBox style={styles.tab} />
        <SkeletonBox style={styles.tab} />
        <SkeletonBox style={styles.tab} />
      </View>

      {/* ✅ 메뉴 리스트 3개 */}
      <View style={{paddingHorizontal: 16, marginTop: 16}}>
        {Array.from({length: 3}).map((_, i) => (
          <View key={i} style={styles.menuRow}>
            <SkeletonBox style={styles.menuImage} />
            <View style={{flex: 1, marginLeft: 12}}>
              <SkeletonBox
                style={{width: '70%', height: 16, marginBottom: 8}}
              />
              <SkeletonBox style={{width: '50%', height: 14}} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  priceTag: {
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  iconContainer: {
    marginTop: 16,
    marginHorizontal: 18,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tab: {
    width: 60,
    height: 25,
    borderRadius: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
});

export default StoreMainSkeleton;
