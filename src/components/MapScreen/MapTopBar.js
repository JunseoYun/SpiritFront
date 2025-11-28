import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, Text, Pressable, Animated, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useMapSearch} from '../../context/MapSearchContext';

import ColorUtil from '../../utils/ColorUtil';
import CustomText from '../../utils/CustomText';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MapTopBar = ({
  navigation,
  prevTab,
  onMeasureHeight,
  forceWhiteBackground = false,
}) => {
  const insets = useSafeAreaInsets();
  const {searchText, setSearchText} = useMapSearch();
  const lastHeightRef = useRef(null);
  const whiteBgAnim = useRef(
    new Animated.Value(forceWhiteBackground ? 1 : 0),
  ).current;

  useEffect(() => {
    Animated.timing(whiteBgAnim, {
      toValue: forceWhiteBackground ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [forceWhiteBackground, whiteBgAnim]);

  const handleLayout = useCallback(
    e => {
      if (!onMeasureHeight) {
        return;
      }
      const nextHeight = e?.nativeEvent?.layout?.height;
      if (typeof nextHeight !== 'number') {
        return;
      }
      if (lastHeightRef.current !== null) {
        const delta = Math.abs(lastHeightRef.current - nextHeight);
        if (delta < 1) {
          return;
        }
      }
      lastHeightRef.current = nextHeight;
      onMeasureHeight(nextHeight);
    },
    [onMeasureHeight],
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: whiteBgAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255,255,255,0)', '#fff'],
          }),
        },
        {
          shadowOpacity: whiteBgAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.15, 0],
          }),
          shadowRadius: whiteBgAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 0],
          }),
        },
        {
          paddingTop: insets.top + 10,
        },
      ]}
      onLayout={handleLayout}>
      <View style={styles.contentRow}>
        <Animated.View
          style={[
            styles.searchContainer,
            styles.searchContainerSpacing,
            forceWhiteBackground ? styles.searchContainerSolid : null,
            {
              borderWidth: whiteBgAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, StyleSheet.hairlineWidth * 2],
              }),
              shadowOpacity: whiteBgAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0],
              }),
            },
          ]}>
          <Pressable
            onPress={() => {
              const trimmed = (searchText || '').trim();
              if (trimmed.length > 0) {
                setSearchText('');
              } else {
                if (prevTab && prevTab !== 'MapScreen') {
                  navigation.navigate(prevTab);
                } else if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('MainScreen');
                }
              }
            }}
            style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </Pressable>

          <Pressable
            style={styles.searchBox}
            onPress={() => {
              navigation.navigate('SearchScreen', {
                preserveFilters: true,
                prevTab,
              });
            }}>
            <CustomText
              maxScale={1.2}
              style={[
                styles.placeholder,
                searchText?.trim()?.length > 0 && {color: 'black'},
              ]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {searchText?.trim()?.length > 0
                ? searchText
                : '술집이나 메뉴를 검색하세요'}
            </CustomText>
          </Pressable>
        </Animated.View>

        <AnimatedPressable
          style={[
            styles.homeButton,
            forceWhiteBackground ? styles.homeButtonSolid : null,
          ]}
          onPress={() => {
            navigation.navigate('MainScreen');
          }}>
          <View style={styles.homeButtonContent}>
            <Ionicons name="home" size={22} color="#333" />
          </View>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
    backgroundColor: 'transparent',
    shadowColor: '#000',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: ColorUtil.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    shadowOffset: {width: 0, height: 2},
  },
  searchContainerSpacing: {
    flex: 1,
    marginRight: 12,
  },
  searchContainerSolid: {
    borderWidth: 1,
    borderColor: ColorUtil.border,
    elevation: 0,
    shadowColor: '#000',
    shadowOpacity: 0,
  },
  searchBox: {
    flex: 1,
    justifyContent: 'center',
  },
  backBtn: {
    marginRight: 6,
    paddingRight: 6,
  },
  placeholder: {
    color: '#9E9E9E',
    fontSize: 16,
    paddingRight: 30,
    fontFamily: 'Pretendard-Regular',
  },
  homeButton: {
    width: 48,
    height: 48,
    borderRadius: 9,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 1.5,
    shadowOffset: {width: 0, height: 2},
  },
  homeButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonSolid: {
    borderWidth: 1,
    borderColor: ColorUtil.border,
    elevation: 0,
    shadowColor: '#000',
    shadowOpacity: 0,
  },
});

export default MapTopBar;
