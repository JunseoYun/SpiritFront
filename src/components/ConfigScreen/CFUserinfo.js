import React from 'react';
import {View, Text, StyleSheet, Pressable, Image} from 'react-native';
import FastImage from 'react-native-fast-image';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const CFUserinfo = ({userdata, navigation}) => {
  return (
    <>
      <View style={styles.topcontainer}>
        <Pressable
          style={styles.row}
          onPress={() => navigation.navigate('Mynickchange', {userdata})}>
          <Text style={styles.label}>닉네임</Text>
          <View style={styles.info}>
            <Text style={styles.value}>{userdata.nickname}</Text>
            <View>
              <FontAwesomeIcon name="angle-right" size={18} color="#999" />
            </View>
          </View>
        </Pressable>
      </View>
      <View style={styles.midlecontainer}>
        <Pressable
          style={styles.row}
          onPress={() =>
            navigation.navigate('OAuthStack', {
              screen: 'IdentityScreen',
              params: {
                index: 1,
              },
            })
          }>
          <Text style={styles.label}>이름</Text>
          <View style={styles.info}>
            <Text style={styles.value}>{userdata.nickname}</Text>
            <View>
              <FontAwesomeIcon name="angle-right" size={18} color="#999" />
            </View>
          </View>
        </Pressable>
      </View>
      <View style={styles.bottomcontainer}>
        <Pressable
          style={styles.row}
          onPress={() =>
            navigation.navigate('OAuthStack', {
              screen: 'IdentityScreen',
              params: {
                index: 1,
              },
            })
          }>
          <Text style={styles.label}>휴대폰 번호 변경</Text>
          <View style={styles.info}>
            <View>
              <FontAwesomeIcon name="angle-right" size={18} color="#999" />
            </View>
          </View>
        </Pressable>
      </View>
      <View style={styles.socialcontainer}>
        <View style={styles.row}>
          <Text style={styles.label}>연동된 소셜 계정</Text>
          <View style={styles.info}>
            <FastImage
              style={[
                styles.socialimg,
                userdata.socialInfoDto?.type === 'GOOGLE' && {
                  marginRight: 10,
                },
              ]}
              source={
                userdata.socialInfoDto?.type === 'GOOGLE'
                  ? require('../../assets/g-logo.png')
                  : userdata.socialInfoDto?.type === 'APPLE'
                  ? require('../../assets/AppleLogozmek.png')
                  : require('../../assets/kakao_symbol_yellow.png') // 기본값 또는 KAKAO
              }
              resizeMode={FastImage.resizeMode.contain}
            />
            {/* <View>
              <FontAwesomeIcon name="angle-right" size={25} color="#999" />
            </View> */}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topcontainer: {
    marginHorizontal: 18,
    borderWidth: 0.7,
    borderColor: '#E9E9E9',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  midlecontainer: {
    marginHorizontal: 18,
    borderWidth: 0.7,
    borderColor: '#E9E9E9',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  bottomcontainer: {
    marginHorizontal: 18,
    borderWidth: 0.7,
    borderColor: '#E9E9E9',
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },

  socialcontainer: {
    marginHorizontal: 18,
    borderWidth: 0.7,
    borderColor: '#E9E9E9',
    borderRadius: 10,
    marginTop: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    marginRight: 7,
  },
  socialimg: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 5,
  },
});

export default CFUserinfo;
