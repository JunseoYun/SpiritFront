import React from 'react';
import {Pressable, StyleSheet, Animated} from 'react-native';
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
        {backgroundColor: headerBackgroundColor, paddingTop: insets.top + 10},
      ]}>
      <Pressable onPress={() => navigation.goBack()}>
        <Animated.Text style={{color: iconColor}}>
          <Ionicons name="arrow-back-outline" size={25} />
        </Animated.Text>
      </Pressable>
      <Animated.Text style={[styles.headerTitle, {opacity: titleOpacity}]}>
        {title || '한잔할까'}
        {/* 친구포차 */}
      </Animated.Text>
      <Pressable onPress={() => navigation.navigate('MainBtmbar')}>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default StoreHeader;
