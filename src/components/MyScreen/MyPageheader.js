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
}) => (
  <View style={styles.profiletopview}>
    {imageuri ? (
      <Pressable onPress={handleImagePress}>
        <FastImage source={{uri: imageuri}} style={styles.profileimg} />
      </Pressable>
    ) : (
      <FastImage
        source={require('../../assets/default_profile.png')}
        style={styles.profileimg}
      />
    )}

    <Pressable style={styles.pressView} onPress={onProfilePress}>
      <View style={styles.leftGroup}>
        <CustomText style={styles.Nickname}>{nickname}</CustomText>
        <FontAwesomeIcon
          name={'angle-right'}
          size={22}
          color={'#999'}
          style={styles.changenick}
        />
      </View>
      <CustomText style={styles.postCountText}>게시글 {postCount}</CustomText>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  profiletopview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  profileimg: {
    resizeMode: 'cover',
    width: 55,
    height: 55,
    borderRadius: 90,
  },
  Nickname: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  changenick: {
    marginLeft: 10,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postCountText: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#666',
  },
  pressView: {
    flex: 1,
    marginLeft: 17,
    alignItems: 'flex-start',
  },
});

export default MyPageheader;
