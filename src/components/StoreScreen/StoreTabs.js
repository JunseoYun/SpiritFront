import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import CustomText from '../../utils/CustomText';

const {width} = Dimensions.get('window'); // 화면 너비
const TAB_WIDTH = width / 3;
const UNDERLINE_BASE_REDUCTION = 70;
const UNDERLINE_WIDTH = Math.max(0, TAB_WIDTH - UNDERLINE_BASE_REDUCTION);
const UNDERLINE_OFFSET = (TAB_WIDTH - UNDERLINE_WIDTH) / 2;

const StoreTabs = ({
  changePage,
  currentPage,
  showBottomBorder = false,
  onTabPress,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const tabs = [
    {name: '메뉴', screen: 'StoreMenuScreen'},
    {name: '주류', screen: 'StoreAlcoholScreen'},
    {name: '지도', screen: 'StoreMapScreen'},
  ];

  // 🔹 currentPage 변경 시 탭 자동 변경
  useEffect(() => {
    const index = tabs.findIndex(tab => tab.screen === currentPage);
    if (index !== -1) {
      setSelectedTab(index);
      animatedValue.setValue(index);
    }
  }, [animatedValue, currentPage]);

  const handlePress = index => {
    const targetScreen = tabs[index].screen;
    onTabPress?.(targetScreen);
    setSelectedTab(index);
    animatedValue.setValue(index);
    changePage(targetScreen);
  };

  const underlinePosition = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, TAB_WIDTH, 2 * TAB_WIDTH],
  });

  return (
    <View
      style={[
        styles.container,
        showBottomBorder && styles.containerBottomBorder,
      ]}>
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
  containerBottomBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E1E1E1',
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
    paddingBottom: 12,
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Pretendard-SemiBold',
  },
  selectedTabText: {
    fontFamily: 'Pretendard-Bold',
    color: '#333', // 여긴
  },
  underline: {
    height: 2.5,
    width: UNDERLINE_WIDTH, // ✅ 각 탭에 맞는 밑줄 너비 설정
    backgroundColor: '#333', // 여기
    position: 'absolute',
    bottom: 0,
    left: UNDERLINE_OFFSET,
  },
});

export default StoreTabs;
