import React from 'react';
import {Pressable, StyleSheet, View, Platform, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useCustomAlert from '../../hooks/useCustomAlert';

const UpdateHeader = ({navigation, endUpdate}) => {
  const {showAlert, AlertComponent} = useCustomAlert();

  const endHandle = () => {
    showAlert({
      title: '매장 수정',
      message: '매장 수정을 완료하시겠습니까?',
      onConfirm: () => endUpdate(),
      onCancel: null,
      type: 'confirm',
    });
  };

  return (
    <View style={styles.view}>
      <Pressable onPress={endHandle}>
        <Ionicons
          name="arrow-back-outline"
          size={25}
          color="#333"
          style={styles.icon}
        />
      </Pressable>

      <Text style={styles.text}>매장 수정하기</Text>
      <Ionicons
        name="arrow-back-outline"
        size={25}
        color="#fff"
        style={styles.icon}
      />
      <AlertComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    position: 'absolute',

    top: 0,
    left: 0,

    width: '100%',
    height: Platform.OS === 'ios' ? 100 : 60,

    backgroundColor: '#fff', // 헤더 배경색
    shadowColor: '#000', // iOS 그림자 색상
    shadowOffset: {width: 0, height: 2}, // iOS 그림자 위치
    shadowOpacity: 0.1, // iOS 그림자 투명도
    shadowRadius: 4, // iOS 그림자 반경
    elevation: 5, // Android 그림자 높이
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10, // 추가
  },
  text: {
    marginTop: Platform.OS === 'ios' ? 50 : 0,
    fontSize: 18,
    alignSelf: 'center',
    fontWeight: '500',
  },
  icon: {
    marginLeft: 13,
    paddingRight: 15,
    marginTop: Platform.OS === 'ios' ? 50 : 0,
  },
});

export default UpdateHeader;
