import React from 'react';
import {Pressable, StyleSheet, Animated, Platform} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

const NonImageHeader = ({
  navigation,
  headerBackgroundColor,
  iconColor,
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
      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
          marginRight: 10,
        }}>
        <Pressable onPress={() => navigation.goBack()} style={{marginRight: 8}}>
          <Animated.Text allowFontScaling={false} style={{color: iconColor}}>
            <Ionicons name="arrow-back-outline" size={25} />
          </Animated.Text>
        </Pressable>
        <Animated.View
          style={{
            flex: 1,
          }}>
          <Animated.Text
            allowFontScaling={false}
            style={styles.headerTitle}
            numberOfLines={1}
            ellipsizeMode="tail">
            {title || '한잔할까'}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={{flexDirection: 'row'}}>
        <Pressable onPress={() => onShare()}>
          <Animated.Text
            allowFontScaling={false}
            style={{color: iconColor, marginRight: 10}}>
            <Ionicons name="share-outline" size={25} />
          </Animated.Text>
        </Pressable>
        <Pressable
          onPress={() =>
            navigation.navigate('MainBtmbar', {
              screen: 'MainScreen',
            })
          }>
          <Animated.Text allowFontScaling={false} style={{color: iconColor}}>
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
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    zIndex: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  imageStyle: {
    alignSelf: 'center',
    width: 20,
    height: 20,
    marginLeft: 3,
  },
});

export default NonImageHeader;
