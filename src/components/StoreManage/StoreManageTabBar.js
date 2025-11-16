import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const StoreManageTabBar = ({activeTab, onTabPress}) => {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const TABS = [
    {label: '매장', icon: 'storefront-outline', key: 'main'},
    {label: '메뉴', icon: 'restaurant-outline', key: 'menu'},
    {label: '주류', icon: 'beer-outline', key: 'alcohol'},
  ];

  const handlePress = key => {
    const tabIndex = TABS.findIndex(tab => tab.key === key);
    if (containerWidth === 0) {
      onTabPress(key);
      return;
    }
    const tabWidth = containerWidth / TABS.length;
    Animated.spring(translateX, {
      toValue: tabIndex * tabWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
    onTabPress(key);
  };

  useEffect(() => {
    if (containerWidth === 0) return;
    const tabIndex = TABS.findIndex(tab => tab.key === activeTab);
    const tabWidth = containerWidth / TABS.length;
    Animated.spring(translateX, {
      toValue: tabIndex * tabWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
  }, [activeTab, containerWidth]);

  return (
    <View
      style={[
        styles.tabContainer,
        {
          bottom:
            Platform.OS === 'android' ? insets.bottom + 20 : insets.bottom + 10,
        },
      ]}>
      <BlurView style={styles.blur} blurType="light" blurAmount={35}>
        <LinearGradient
          colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.5)']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFillObject}
        />
      </BlurView>

      <View
        style={styles.tabRow}
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
        <Animated.View
          style={[
            styles.activeIndicator,
            {width: `${100 / TABS.length}%`, transform: [{translateX}]},
          ]}
        />
        {TABS.map(tab => {
          const focused = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.9}
              onPress={() => handlePress(tab.key)}
              style={styles.tab}>
              <View style={styles.iconBox}>
                <Ionicons
                  name={focused ? tab.icon.replace('-outline', '') : tab.icon}
                  size={22}
                  color={focused ? '#000' : '#999'}
                />
                <Text
                  style={[styles.label, {color: focused ? '#000' : '#999'}]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    alignSelf: 'center',
    width: '90%',
    height: 60,
    borderRadius: 40,
    overflow: Platform.OS === 'android' && 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 0},
    backgroundColor: 'transparent',
    zIndex: 100,
    borderWidth: 0.4,
    borderColor: 'rgba(255,255,255,0.3)',
    elevation: 0.1,
    opacity: 0.95,
    alignItems: 'center',
    padding: 5,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  label: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11.5,
    marginTop: 3,
  },
});

export default StoreManageTabBar;
