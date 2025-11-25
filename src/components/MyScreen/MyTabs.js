import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import CustomText from '../common/CustomText';

const {width} = Dimensions.get('window');

const MyTabs = ({changePage, isManager, selectedTab, setSelectedTab}) => {
  const animatedValue = useRef(new Animated.Value(selectedTab)).current;

  const tabs = [
    {name: '리뷰', screen: 'MyReview'},
    {name: '위치', screen: 'MyLiked'},
  ];

  if (isManager) {
    tabs.push({name: '나의 매장', screen: 'MyManager'});
  }

  const TAB_COUNT = tabs.length;
  const TAB_WIDTH = width / TAB_COUNT;

  // underline 이동 (가장 부드러운 방식)
  const translateX = Animated.multiply(animatedValue, TAB_WIDTH);

  const handlePress = index => {
    setSelectedTab(index);

    Animated.spring(animatedValue, {
      toValue: index,
      stiffness: 160,
      damping: 20,
      mass: 0.35,
      useNativeDriver: true, // 가능해짐
    }).start();

    changePage(tabs[index].screen);
  };

  // 외부에서 selectedTab 변경 시 반영
  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: selectedTab,
      stiffness: 160,
      damping: 20,
      mass: 0.35,
      useNativeDriver: true,
    }).start();
  }, [selectedTab]);

  return (
    <View style={styles.container}>
      {/* 탭 버튼 영역 */}
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

      {/* 바닥 기본 줄 */}
      <View style={styles.defaultUnderline} />

      {/* 이동하는 밑줄 */}
      <Animated.View
        style={[
          styles.animatedUnderline,
          {
            width: TAB_WIDTH - 30,
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
    color: '#1a1a1a',
  },
  defaultUnderline: {
    height: 2.5,
    width: '100%',
    backgroundColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
  },
  animatedUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 2.5,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 15,
  },
});

export default MyTabs;
