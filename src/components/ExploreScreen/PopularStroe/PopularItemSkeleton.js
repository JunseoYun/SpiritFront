import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import SkeletonBox from '../../../hooks/SkeletonBox';

const PopularItemSkeleton = () => {
  return (
    <View style={styles.itemContainer}>
      {/* 상단 이미지 스크롤 */}
      <View style={styles.imageView}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 18,
            gap: 2,
          }}>
          {/* 메인 이미지 */}
          <View style={styles.mainimgitem}>
            <SkeletonBox style={styles.mainimgview} />
          </View>
          {/* 추가 메뉴 이미지 2~3개 정도 */}
          <View style={styles.menuItemView}>
            <SkeletonBox style={styles.menuImageView} />
          </View>
          <View style={styles.menuItemView}>
            <SkeletonBox style={styles.menuImageView} />
          </View>
        </ScrollView>
      </View>

      {/* 정보 섹션 */}
      <View style={styles.infoTopView}>
        {/* 주류 라벨 */}
        <View style={styles.drinkView}>
          <SkeletonBox
            style={{width: 60, height: 20, borderRadius: 5, marginRight: 7}}
          />
          <SkeletonBox
            style={{width: 60, height: 20, borderRadius: 5, marginRight: 7}}
          />
          <SkeletonBox
            style={{width: 60, height: 20, borderRadius: 5, marginRight: 7}}
          />
        </View>

        {/* 상호명 */}
        <View style={styles.infoTitleView}>
          <SkeletonBox
            style={{width: 15, height: 15, borderRadius: 7, marginRight: 5}}
          />
          <SkeletonBox style={{width: 120, height: 20, borderRadius: 4}} />
        </View>

        {/* 평점 및 좋아요 */}
        <View style={styles.infoReviewView}>
          <SkeletonBox style={{width: 16, height: 16, borderRadius: 8}} />
          <SkeletonBox style={{width: 30, height: 14, marginLeft: 5}} />
          <SkeletonBox
            style={{width: 16, height: 16, borderRadius: 8, marginLeft: 7}}
          />
          <SkeletonBox style={{width: 30, height: 14, marginLeft: 5}} />
        </View>

        {/* 영업시간 / 휴게시간 */}
        <View style={styles.infoTimeView}>
          <SkeletonBox style={{width: 100, height: 14}} />
          <SkeletonBox style={{width: 120, height: 14}} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    borderColor: '#EDEDED',
    borderBottomWidth: 1.5,
    backgroundColor: 'white',
    paddingVertical: 17,
  },
  imageView: {
    width: '100%',
    flexDirection: 'row',
  },
  mainimgitem: {
    width: 180,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainimgview: {
    width: 180,
    height: 130,
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },
  menuItemView: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuImageView: {
    width: 130,
    height: 130,
  },
  infoTopView: {
    width: '100%',
    marginTop: 4,
    paddingHorizontal: 18,
  },
  infoTitleView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  infoReviewView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  infoTimeView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  drinkView: {
    flexDirection: 'row',
    marginBottom: 0,
  },
});

export default PopularItemSkeleton;
