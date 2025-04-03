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

const StoreTabs = ({changePage, currentPage}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const tabs = [
    {name: '메뉴', screen: 'StoreMenuScreen'},
    {name: '주류', screen: 'StoreAlcoholScreen'},
    {name: '길찾기', screen: 'StoreMapScreen'},
  ];

  // 🔹 currentPage 변경 시 탭 자동 변경
  useEffect(() => {
    const index = tabs.findIndex(tab => tab.screen === currentPage);
    if (index !== -1) {
      setSelectedTab(index);
      Animated.timing(animatedValue, {
        toValue: index,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentPage]);

  const handlePress = index => {
    setSelectedTab(index);
    Animated.timing(animatedValue, {
      toValue: index,
      duration: 300,
      useNativeDriver: false,
    }).start();
    changePage(tabs[index].screen);
  };

  const underlinePosition = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, width / 3, (2 * width) / 3],
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

      {/* 밑줄 애니메이션 */}
      <Animated.View
        style={[
          styles.underline,
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
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 17,
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Pretendard-SemiBold',
  },
  selectedTabText: {
    fontFamily: 'Pretendard-Bold',
    color: '#45C9FF',
  },
  underline: {
    height: 3,
    width: width / 3 - 60, // ✅ 각 탭에 맞는 밑줄 너비 설정
    backgroundColor: '#45C9FF',
    position: 'absolute',
    bottom: 0,
    left: 30,
  },
});

export default StoreTabs;
