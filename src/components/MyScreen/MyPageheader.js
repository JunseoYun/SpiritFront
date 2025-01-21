import React from 'react';
import {View, Text, Image, Pressable, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const MyPageheader = ({nickname, onProfilePress, imageuri}) => (
  <View style={styles.profiletopview}>
    <Image
      source={
        imageuri
          ? {uri: imageuri} // 동적으로 설정된 이미지 URI
          : require('../../assets/kim.png') // 기본 이미지
      }
      style={styles.profileimg}
    />
    <Text style={styles.Nickname}>{nickname}</Text>
    <Pressable onPress={onProfilePress}>
      <FontAwesomeIcon
        name={'angle-right'}
        size={40}
        color={'black'}
        style={styles.changenick}
      />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  profiletopview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 40,
    marginVertical: 40,
  },
  profileimg: {
    resizeMode: 'cover',
    width: 90,
    height: 90,
    borderRadius: 90,
  },
  Nickname: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 30,
  },
  changenick: {
    marginLeft: 20,
  },
});

export default MyPageheader;
