import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window'); // 화면 너비

const MyTabs = ({changePage, isManager, selectedTab, setSelectedTab}) => {
  const animatedValue = useRef(new Animated.Value(selectedTab)).current;

  const tabs = [
    {name: '리뷰', screen: 'MyReview'},
    {name: '찜', screen: 'MyLiked'},
  ];

  if (isManager) {
    tabs.push({name: '나의 매장', screen: 'MyManager'});
  }

  const handlePress = index => {
    setSelectedTab(index);
    Animated.timing(animatedValue, {
      toValue: index,
      duration: 300,
      useNativeDriver: false,
    }).start();
    changePage(tabs[index].screen);
  };

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: selectedTab,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selectedTab]);

  const underlinePosition = animatedValue.interpolate({
    inputRange: tabs.map((_, i) => i),
    outputRange: tabs.map((_, i) => (width / tabs.length) * i),
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handlePress(index)}>
            <Text
              style={[
                styles.tabText,
                selectedTab === index && styles.selectedTabText,
              ]}>
              {tab.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.defaultUnderline} />
      <Animated.View
        style={[
          styles.animatedUnderline,
          {
            width: width / tabs.length - 30,
            transform: [{translateX: underlinePosition}],
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
    paddingTop: 15,
    paddingBottom: 17,
  },
  tabText: {
    fontSize: 17,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  selectedTabText: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#1a1a1a', // 여기도?
  },
  defaultUnderline: {
    height: 2.5,
    width: '100%',
    backgroundColor: '#E0E0E0', // 기본 회색 줄
    position: 'absolute',
    bottom: 0,
  },
  animatedUnderline: {
    height: 2.5,
    width: width / 3 - 30, // 탭 2개 기준 너비에서 양쪽 20씩 줄임
    backgroundColor: '#1a1a1a', // 여기 색상?
    position: 'absolute',
    bottom: 0,
    marginHorizontal: 15, // 양쪽 여백 추가
  },
});

export default MyTabs;
