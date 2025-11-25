import React from 'react';
import {Pressable, StyleSheet, View, Platform, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useCustomAlert from '../../hooks/useCustomAlert';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import CustomText from '../common/CustomText';

const UpdateHeader = ({endUpdate}) => {
  const {top} = useSafeAndroidInsets();
  const {showAlert, AlertComponent} = useCustomAlert();

  return (
    <View style={[styles.view, {paddingTop: top}]}>
      <Pressable onPress={endUpdate}>
        <Ionicons
          name="arrow-back-outline"
          size={25}
          color="#333"
          style={styles.icon}
        />
      </Pressable>

      <CustomText style={styles.text}>매장 수정하기</CustomText>
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
    height: Platform.OS === 'ios' ? 100 : 80,

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
