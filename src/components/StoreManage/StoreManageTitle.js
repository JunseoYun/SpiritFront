import React from 'react';
import {Pressable, StyleSheet, View, Text, Share} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

import ColorUtil from '../../utils/ColorUtil';
const StoreManageTitle = ({
  iconSize = null,
  storeRate = null,
  reviewCount = null,
  likeCount = null,
  name = null,
  type = '',
}) => {
  return (
    <>
      {type === 'main' ? (
        <View style={styles.titleView}>
          <FontAwesomeIcon name="star" size={iconSize} color="#FED348" />
          <Text style={[styles.infoText]}>
            {' '}
            {storeRate || 0} ({reviewCount || 0})
          </Text>

          <Ionicons
            name="heart"
            size={iconSize}
            color={'#F85656'}
            style={{marginLeft: 7}}
          />
          <Text style={[styles.infoText, {marginLeft: 3}]}>
            {likeCount || 0}
          </Text>
        </View>
      ) : (
        <View style={styles.titleView}>
          <Text style={[styles.infoText]}>
            {type === 'menu' ? '메뉴' : '주류'}
          </Text>
        </View>
      )}

      {/* 매장명 */}
      <Text style={styles.title}>{name}</Text>
    </>
  );
};

const styles = StyleSheet.create({
  titleView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginHorizontal: 18,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    marginTop: 5,
    marginHorizontal: 18,
  },
});

export default StoreManageTitle;
