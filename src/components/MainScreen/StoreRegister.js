import React from 'react';
import {View, Pressable, Text, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
const StoreRegister = ({storeactiveIndex, handlestoreItemClick}) => {
  const options = [
    {
      id: 0,
      title: '매장등록',
      description: '내가 좋아하는 매장을 추가해보세요!',
    },
    // {
    //   id: 1,
    //   title: '매장 권한 신청',
    //   description: '사장님이시라면 매장 권한을 등록해주세요!',
    // },
  ];

  return (
    <View style={styles.StoreregView}>
      {options.map(option => (
        <Pressable
          key={option.id}
          style={[
            styles.StorereginnerView,
            storeactiveIndex === option.id && styles.storeactiveBorder,
          ]}
          onPress={() => handlestoreItemClick(option.id)}>
          <View style={styles.imageView}>
            <FastImage
              source={
                option.id === 0
                  ? require('../../assets/icon-note.png')
                  : require('../../assets/icon-note.png')
              }
              style={styles.imageStyle}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>

          <View style={styles.textView}>
            <Text style={styles.StoreMainText}>{option.title}</Text>
            <Text style={styles.StoresubText}>{option.description}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  StoreregView: {
    flexDirection: 'row',
    marginTop: 15,
    marginHorizontal: 18,
    borderRadius: 16,
  },
  StorereginnerView: {
    borderRadius: 23,
    flexDirection: 'row',
    backgroundColor: '#EFF3F6',
    flex: 1,
    padding: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  storeactiveBorder: {
    borderColor: 'skyblue',
  },
  textView: {
    marginLeft: 10,
  },
  StoreMainText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#181a1a',
  },
  StoresubText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    marginTop: 7,
    color: '#888',
    lineHeight: 19,
  },
  imageView: {
    width: 60,
    height: 60, // 추가
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle: {
    width: 42,
    height: 40, // 추가
    borderRadius: 10,
    resizeMode: 'contain',

    // backgroundColor: '#fff',

    // justifyContent: 'center',
    // top: 10,
  },
});

export default StoreRegister;
