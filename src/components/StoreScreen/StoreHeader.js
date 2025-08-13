import React from 'react';
import {Pressable, StyleSheet, Animated, Platform} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

const StoreHeader = ({
  navigation,
  headerBackgroundColor,
  iconColor,
  titleOpacity,
  title,
  onShare,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      style={[
        styles.navigateView,
        {
          backgroundColor: headerBackgroundColor,
          paddingTop: Platform.OS === 'android' ? insets.top + 10 : insets.top,
        },
      ]}>
      <Pressable onPress={() => navigation.goBack()}>
        <Animated.Text style={{color: iconColor}}>
          <Ionicons name="arrow-back-outline" size={25} />
        </Animated.Text>
      </Pressable>
      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          maxWidth: '78%',
          opacity: titleOpacity, // ✅ 제목과 마커에 동일한 opacity 애니메이션
        }}>
        <Animated.Text
          style={styles.headerTitle}
          numberOfLines={1}
          ellipsizeMode="tail">
          {title || '한잔할까'}
        </Animated.Text>
      </Animated.View>
      <Animated.View style={{flexDirection: 'row'}}>
        <Pressable onPress={() => onShare()}>
          <Animated.Text style={{color: iconColor, marginRight: 10}}>
            <Ionicons name="share-outline" size={25} />
          </Animated.Text>
        </Pressable>

        <Pressable
          onPress={() =>
            navigation.navigate('MainBtmbar', {
              screen: 'MainScreen',
            })
          }>
          <Animated.Text style={{color: iconColor}}>
            <Ionicons name="home-outline" size={25} />
          </Animated.Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  navigateView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    zIndex: 1,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    textAlign: 'center',
  },
  imageStyle: {
    alignSelf: 'center',
    width: 20,
    height: 20,
    marginLeft: 3,
  },
});

export default StoreHeader;
