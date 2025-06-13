import React from 'react';
import {Pressable, StyleSheet, Animated, Platform} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const StoreHeader = ({
  navigation,
  headerBackgroundColor,
  iconColor,
  titleOpacity,
  title,
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
      <Animated.Text
        style={[styles.headerTitle, {opacity: titleOpacity}]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {title || '한잔할까'}
        {/* 친구포차 */}
      </Animated.Text>
      <Pressable
        onPress={() =>
          navigation.reset({
            index: 0, // 초기 화면 인덱스
            routes: [
              {
                name: 'MainBtmbar',
                state: {
                  routes: [{name: 'MainScreen'}],
                },
              },
            ], // 이동할 화면
          })
        }>
        <Animated.Text style={{color: iconColor}}>
          <Ionicons name="home-outline" size={25} />
        </Animated.Text>
      </Pressable>
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
    width: '82%',
    textAlign: 'center',
  },
});

export default StoreHeader;
