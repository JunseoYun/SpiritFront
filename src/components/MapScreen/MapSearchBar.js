// SearchButton.js
import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  PixelRatio,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

let fontScale = PixelRatio.getFontScale();
if (fontScale > 1.3) fontScale = 1.3;

import EvilIcons from 'react-native-vector-icons/EvilIcons';
const MapSearchBar = ({onPress}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.buttonTop, {paddingTop: insets.top + 10}]}>
      <Pressable style={styles.searchView} onPress={onPress}>
        <EvilIcons name="redo" size={25} color={'#1a1a1a'} />
        <Text allowFontScaling={false} style={styles.buttonTextTop}>
          현 지도에서 재검색
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonTop: {
    position: 'absolute',
    alignSelf: 'center', // 부모 뷰를 기준으로 가로 중앙 정렬
  },
  searchView: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingLeft: 5,
    paddingRight: 9,
    borderRadius: 20,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 10,
  },
  buttonTextTop: {
    color: '#1a1a1a',
    fontSize: 15 * fontScale,
    fontFamily: 'Pretendard-Medium',
  },
});

export default MapSearchBar;
