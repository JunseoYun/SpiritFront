import React from 'react';
import {View, Text, Image, Pressable, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const MyPageheader = ({nickname, onProfilePress}) => (
  <View style={styles.profiletopview}>
    <Image source={require('../../assets/kim.png')} style={styles.profileimg} />
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
    resizeMode: 'contain',
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
