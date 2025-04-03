import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window'); // 화면 너비

const MyTabs = ({changePage}) => {
  const [selectedTab, setSelectedTab] = useState(0); // 현재 선택된 탭의 인덱스
  const animatedValue = useRef(new Animated.Value(0)).current; // 애니메이션 값 초기화

  const tabs = [
    {name: '나의 리뷰', screen: 'MyReview'},
    {name: '위치 설정', screen: 'MyLocation'},
  ];

  // 탭 전환 시 애니메이션 효과
  const handlePress = index => {
    setSelectedTab(index);
    Animated.timing(animatedValue, {
      toValue: index, // 클릭된 탭의 인덱스에 따라 애니메이션
      duration: 300, // 애니메이션 지속 시간 (ms)
      useNativeDriver: false, // 레이아웃 애니메이션은 native driver 사용 불가
    }).start();
    changePage(tabs[index].screen);
  };

  // 애니메이션 값으로 밑줄 위치 계산
  const underlinePosition = animatedValue.interpolate({
    inputRange: [0, 1], // 탭 인덱스
    outputRange: [0, width / 2], // 각 탭의 밑줄 위치
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
                selectedTab === index && styles.selectedTabText, // 선택된 탭 텍스트 스타일
              ]}>
              {tab.name}
            </Text>
          </Pressable>
        ))}
      </View>
      {/* 회색 기본 밑줄 */}
      <View style={styles.defaultUnderline} />
      {/* 애니메이션 밑줄 */}
      <Animated.View
        style={[
          styles.animatedUnderline,
          {transform: [{translateX: underlinePosition}]},
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
    fontSize: 18,
    color: '#999',
    fontFamily: 'Pretendard-SemiBold',
  },
  selectedTabText: {
    fontFamily: 'Pretendard-Bold',
    color: '#45C9FF',
  },
  defaultUnderline: {
    height: 3,
    width: '100%',
    backgroundColor: '#E0E0E0', // 기본 회색 줄
    position: 'absolute',
    bottom: 0,
  },
  animatedUnderline: {
    height: 3,
    width: width / 2 - 40, // 탭 2개 기준 너비에서 양쪽 20씩 줄임
    backgroundColor: '#45C9FF',
    position: 'absolute',
    bottom: 0,
    marginHorizontal: 20, // 양쪽 여백 추가
  },
});

export default MyTabs;
