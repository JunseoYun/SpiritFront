import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FastImage from 'react-native-fast-image';
import CustomText from '../common/CustomText';

const MyPageheader = ({
  nickname,
  onProfilePress,
  imageuri,
  handleImagePress,
}) => (
  <View style={styles.profiletopview}>
    {imageuri ? (
      <Pressable onPress={handleImagePress}>
        <FastImage
          source={
            {uri: imageuri} // 동적으로 설정된 이미지 URI
          }
          style={styles.profileimg}
        />
      </Pressable>
    ) : (
      <FastImage
        source={
          require('../../assets/default_profile.png') // 기본 이미지
        }
        style={styles.profileimg}
      />
    )}

    <Pressable style={styles.pressView} onPress={onProfilePress}>
      <CustomText style={[styles.Nickname]}>{nickname}</CustomText>

      <FontAwesomeIcon
        name={'angle-right'}
        size={22}
        color={'#999'}
        style={styles.changenick}
      />
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
    marginLeft: 17,
  },
  changenick: {
    marginLeft: 10,
  },
  pressView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MyPageheader;
