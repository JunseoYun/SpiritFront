import React, {useEffect, useRef} from 'react';
import {View, Pressable, StyleSheet, Animated, Dimensions} from 'react-native';
import CustomText from '../../utils/CustomText';

const {width} = Dimensions.get('window');

const MyTabs = ({changePage, isManager, selectedTab}) => {
  const animatedValue = useRef(new Animated.Value(selectedTab)).current;

  const tabs = [{name: '게시글', screen: 'MyReview'}];

  if (isManager) {
    tabs.push({name: '나의 매장', screen: 'MyManager'});
  }

  const TAB_COUNT = tabs.length;
  const TAB_WIDTH = width / TAB_COUNT;
  const INDICATOR_WIDTH = TAB_WIDTH * 0.28;

  const translateX = Animated.add(
    Animated.multiply(animatedValue, TAB_WIDTH),
    (TAB_WIDTH - INDICATOR_WIDTH) / 2,
  );

  const handlePress = index => {
    changePage(index);
  };

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: selectedTab,
      stiffness: 160,
      damping: 20,
      mass: 0.35,
      useNativeDriver: true,
    }).start();
  }, [selectedTab, animatedValue]);

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handlePress(index)}>
            <CustomText
              style={[
                styles.tabText,
                selectedTab === index && styles.selectedTabText,
              ]}>
              {tab.name}
            </CustomText>
          </Pressable>
        ))}
      </View>

      <Animated.View
        style={[
          styles.animatedUnderline,
          {
            width: INDICATOR_WIDTH,
            transform: [{translateX}],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  tabText: {
    fontSize: 17,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  selectedTabText: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#1a1a1a',
  },
  defaultUnderline: {
    height: 1.5,
    width: '100%',
    backgroundColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
  },
  animatedUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 1.5,
    backgroundColor: '#1a1a1a',
  },
});

export default MyTabs;
