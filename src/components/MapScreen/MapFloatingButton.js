import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ColorUtil from '../../utils/ColorUtil';

const hitSlop = {top: 12, bottom: 12, left: 12, right: 12};

const MapFloatingButton = ({bottom = 20, onPress}) => {
  return (
    <Pressable
      style={[styles.container, {bottom}]}
      onPress={onPress}
      hitSlop={hitSlop}>
      <Ionicons name="map" size={17} color={ColorUtil.main} />
      <Text style={styles.text}>지도보기</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: ColorUtil.main,
    backgroundColor: '#FFF',
  },
  text: {
    color: ColorUtil.main,
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    marginLeft: 7,
  },
});

export default MapFloatingButton;
