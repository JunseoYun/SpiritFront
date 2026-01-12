import React from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FastImage from 'react-native-fast-image';
import CustomText from '../../utils/CustomText';

const MyPageheader = ({
  nickname,
  postCount = 0,
  onProfilePress,
  imageuri,
  handleImagePress,
  onWritePress,
}) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {/* Left : Avatar */}
        <Pressable onPress={handleImagePress} hitSlop={10}>
          <FastImage
            source={
              imageuri
                ? {uri: imageuri}
                : require('../../assets/default_profile.png')
            }
            style={styles.avatar}
          />
        </Pressable>

        {/* Center : Text */}
        <Pressable
          onPress={onProfilePress}
          hitSlop={10}
          style={styles.textArea}>
          <View style={styles.nameLine}>
            <CustomText numberOfLines={1} style={styles.nickname}>
              {nickname}
            </CustomText>
            <FontAwesomeIcon name="angle-right" size={20} color="#9CA3AF" />
          </View>

          <CustomText style={styles.meta}>게시글 {postCount}</CustomText>
        </Pressable>

        {/* Right : Write */}
        <Pressable onPress={onWritePress} hitSlop={10} style={styles.writeBtn}>
          <CustomText style={styles.writeText}>글쓰기</CustomText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 26,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 74,
    height: 74,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
  },

  textArea: {
    flex: 1,
    marginLeft: 14,
  },

  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  nickname: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#111827',
    letterSpacing: -0.2,
  },

  meta: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
  },

  writeBtn: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 2, // 버튼 티 안 나게
  },

  writeText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF', // 한잔할까 포인트 컬러
  },
});

export default MyPageheader;
