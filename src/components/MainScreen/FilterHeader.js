// FilterHeader.js
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const alcoholTypes = [
  {label: '소주', value: 'SOJU'},
  {label: '맥주', value: 'BEER'},
  {label: '막걸리', value: 'MAKGEOLLI'},
  {label: '와인', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '사케', value: 'SAKE'},
  {label: '고량주', value: 'KAOLIANG'},
  {label: '위스키', value: 'WHISKEY'},
  {label: '보드카', value: 'VODKA'},
  {label: '전통주', value: 'TRADITIONAL'},
  {label: '하이볼', value: 'HIGHBALL'},
  {label: '데킬라', value: 'TEQUILA'},
];

const FilterHeader = ({
  topView2Height,
  drinkType,
  setDrinkType,
  screenWidth,
}) => {
  const scrollRef = useRef(null);
  const buttonLayouts = useRef({});
  const filterScrollX = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: filterScrollX.current || 0,
        animated: false,
      });
    }
  }, []);

  useEffect(() => {
    if (drinkType && scrollRef.current && buttonLayouts.current[drinkType]) {
      const {x, width} = buttonLayouts.current[drinkType];
      const scrollToX = x + width / 2 - screenWidth / 2;
      scrollRef.current.scrollTo({
        x: scrollToX > 0 ? scrollToX : 0,
        animated: true,
      });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: filterScrollX.current,
        animated: false,
      });
    }
  }, [drinkType]);

  const toggleAlcohol = value =>
    setDrinkType(prev => (prev === value ? null : value));
  return (
    <View
      style={{
        paddingBottom: 10,
        backgroundColor: '#fff',
      }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        onStartShouldSetResponder={() => true}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          gap: 7,
        }}
        onScroll={e => {
          filterScrollX.current = e.nativeEvent.contentOffset.x;
        }}>
        {alcoholTypes.map(({label, value}) => (
          <Pressable
            key={value}
            onPress={() => toggleAlcohol(value)}
            onLayout={e => {
              const layout = e.nativeEvent.layout;
              buttonLayouts.current[value] = {x: layout.x, width: layout.width};
            }}
            style={[
              styles.filterButton,
              drinkType === value && styles.activeFilter,
            ]}>
            <Text
              style={[
                styles.filterText,
                drinkType === value && styles.activeFilterText,
              ]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // 버튼을 덮어씌우기 위해 컨테이너를 상대배치로
  container: {
    position: 'relative',
    backgroundColor: 'white',
    paddingVertical: 10,
    minHeight: 55,
  },

  filterBar: {
    flexDirection: 'row',
    flexShrink: 1,
  },

  // 겹치는 choice 버튼
  choicebtn: {
    position: 'absolute',

    paddingHorizontal: 15,
    height: 35,
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10, // iOS
    gap: 4,
    backgroundColor: '#fff',
  },
  choicetext: {
    fontSize: 14,
    color: '#121212',
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
  },

  filterButton: {
    height: 35,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
  },
  filterText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
  },
  activeFilter: {
    backgroundColor: '#45C9FF',
    borderColor: '#45C9FF',
  },
  activeFilterText: {
    color: 'white',
    fontFamily: 'Pretendard-Bold',
  },

  dropdown: {
    position: 'absolute',
    // choicebtn 아래로
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    paddingVertical: 5,
    zIndex: 20,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  activeDropdownText: {
    color: '#121212',
  },
});

export default React.memo(FilterHeader);
