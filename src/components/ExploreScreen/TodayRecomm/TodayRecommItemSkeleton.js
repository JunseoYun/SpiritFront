import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import SkeletonBox from '../../../hooks/SkeletonBox';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const SPACING = width * 0.03;

const TodayRecommItemSkeleton = () => {
  return (
    <View style={{flex: 1, flexDirection: 'column'}}>
      <SkeletonBox style={styles.todayPhrasesView} />
      <SkeletonBox style={styles.reviewCard} />
    </View>
  );
};

const styles = StyleSheet.create({
  todayPhrasesView: {
    height: 22,
    width: '60%',
    marginLeft: 24,
    alignContent: 'center',
  },
  reviewCard: {
    width: ITEM_WIDTH,
    height: 230,
    marginHorizontal: SPACING,
    marginVertical: 10,
    borderRadius: 10,
    alignSelf: 'center',
  },
});

export default TodayRecommItemSkeleton;
