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
import {RotateCw} from 'lucide-react-native';
const {width} = Dimensions.get('window');

let fontScale = PixelRatio.getFontScale();
if (fontScale > 1.3) fontScale = 1.3;

const MapSearchBar = ({onPress}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.buttonTop]}>
      <Pressable style={styles.searchButton} onPress={onPress}>
        <View style={styles.searchView}>
          <RotateCw size={15} color={'#006EFF'} />
          <Text allowFontScaling={false} style={styles.buttonTextTop}>
            현 지도에서 검색
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonTop: {
    alignSelf: 'center', // 부모 뷰를 기준으로 가로 중앙 정렬
    marginTop: 15,
  },
  searchButton: {
    backgroundColor: '#ffffff',
    borderRadius: 100,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    shadowOffset: {width: 0, height: 2},
    width: 148,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Platform.OS === 'android' ? 0.5 : 0,
    borderColor: '#B5B5B5',
  },
  searchView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextTop: {
    color: '#006EFF',
    fontSize: 14 * fontScale,
    fontFamily: 'Pretendard-Medium',
    marginLeft: 7,
  },
});

export default MapSearchBar;
