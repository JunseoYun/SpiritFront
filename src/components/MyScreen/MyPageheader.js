import React from 'react';
import {View, Text, Image, Pressable, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const MyPageheader = ({
  nickname,
  onProfilePress,
  imageuri,
  handleImagePress,
}) => (
  <View style={styles.profiletopview}>
    {imageuri ? (
      <Pressable onPress={handleImagePress}>
        <Image
          source={
            {uri: imageuri} // 동적으로 설정된 이미지 URI
          }
          style={styles.profileimg}
        />
      </Pressable>
    ) : (
      <Image
        source={
          require('../../assets/default_profile.png') // 기본 이미지
        }
        style={styles.profileimg}
      />
    )}

    <Pressable style={styles.pressView} onPress={onProfilePress}>
      <Text style={[styles.Nickname]}>{nickname}</Text>

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
    width: 60,
    height: 60,
    borderRadius: 90,
  },
  Nickname: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    color: '#121212',
    marginLeft: 20,
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
