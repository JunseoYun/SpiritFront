// FilterHeader.js
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TouchableOpacity,
  PixelRatio,
} from 'react-native';

let fontScale = PixelRatio.getFontScale(); // let으로 변경

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

const FilterHeader = forwardRef(
  ({drinkType, setDrinkType, priceOrder, setPriceOrder, screenWidth}, ref) => {
    const scrollRef = useRef(null);
    const buttonLayouts = useRef({});
    const filterScrollX = useRef(0);

    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownAnim = useRef(new Animated.Value(0)).current;

    const [choiceBtnWidth, setChoiceBtnWidth] = useState(64); // 버튼 대략 너비(초기값)
    const OVERLAP_GAP = 8; // 버튼과 스크롤 콘텐츠 사이 여백

    const dropdownTranslateY = dropdownAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-5, 0],
    });

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
        const scrollToX = x + width / 2 - screenWidth / 2 + 30;
        scrollRef.current.scrollTo({
          x: scrollToX > 0 ? scrollToX : 0,
          animated: true,
        });
      } else if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: filterScrollX.current - choiceBtnWidth,
          animated: false,
        });
      }
    }, [drinkType]);

    // 드롭다운 닫기 유틸
    useImperativeHandle(ref, () => ({
      closeDropdown: (animated = true) => {
        if (!dropdownVisible) return;
        if (animated) {
          Animated.timing(dropdownAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setDropdownVisible(false));
        } else {
          dropdownAnim.setValue(0);
          setDropdownVisible(false);
        }
      },
    }));

    const toggleDropdown = () => {
      if (dropdownVisible) {
        ref?.current?.closeDropdown();
      } else {
        setDropdownVisible(true);
        Animated.timing(dropdownAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    };

    const toggleAlcohol = value => {
      ref?.current?.closeDropdown(false);
      setDrinkType(prev => {
        if (prev === value) {
          setPriceOrder(''); // alcohol 해제 시 priceOrder 초기화
          return null;
        }
        return value;
      });
    };

    const togglepriceOrder = value => {
      setPriceOrder(prev => (prev === value ? '' : value));
    };
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
          onTouchStart={() => ref?.current?.closeDropdown(false)}
          onScrollBeginDrag={() => ref?.current?.closeDropdown()}
          onMomentumScrollBegin={() => ref?.current?.closeDropdown()} // 관성 스크롤 시작 시 닫기
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 10,
            gap: 7,
            paddingLeft: drinkType != null ? choiceBtnWidth + OVERLAP_GAP : 12,
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
                buttonLayouts.current[value] = {
                  x: layout.x,
                  width: layout.width,
                };
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
        {drinkType != null && (
          <Pressable
            style={[styles.choicebtn, {top: 10}]}
            onPress={toggleDropdown}
            onStartShouldSetResponder={() => true}
            onLayout={e => setChoiceBtnWidth(e.nativeEvent.layout.width)}>
            <MaterialCommunityIcons
              name="tune-variant"
              size={fontScale >= 1.5 ? 20 : 17}
              color="#555"
            />
            <Text style={styles.choicetext}>
              {priceOrder === 'ASC'
                ? '낮은 가격순'
                : priceOrder === 'DESC'
                ? '높은 가격순'
                : '기본순'}
            </Text>
            <View
              style={[
                {
                  width: 1,
                  height: 18,
                  backgroundColor: '#ccc',
                  marginLeft: 5,
                },
                fontScale >= 1.5 && {height: 25},
              ]}
            />
          </Pressable>
        )}

        {/* 드롭다운도 버튼 기준으로 absolute 배치 */}
        {dropdownVisible && (
          <Animated.View
            style={[
              styles.dropdown,
              {top: 50},
              {left: 5, transform: [{translateY: dropdownTranslateY}]},
            ]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                toggleDropdown();
                togglepriceOrder('');
              }}>
              <Text
                style={[
                  styles.dropdownText,
                  priceOrder === '' && styles.activeDropdownText,
                ]}>
                기본순
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                toggleDropdown();
                togglepriceOrder('ASC');
              }}>
              <Text
                style={[
                  styles.dropdownText,
                  priceOrder === 'ASC' && styles.activeDropdownText,
                ]}>
                낮은 가격순
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                toggleDropdown();
                togglepriceOrder('DESC');
              }}>
              <Text
                style={[
                  styles.dropdownText,
                  priceOrder === 'DESC' && styles.activeDropdownText,
                ]}>
                높은 가격순
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  },
);

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
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 50, // iOS
    gap: 4,
    backgroundColor: '#fff',
    paddingLeft: 18,
    paddingVertical: 7,
    paddingBottom: 10,
  },
  choicetext: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
  },

  filterButton: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    paddingVertical: 7,
  },
  filterText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
  },
  activeFilter: {
    backgroundColor: '#E8F7FF',
    borderColor: '#45C9FF',
  },
  activeFilterText: {
    color: '#45C9FF',
    fontFamily: 'Pretendard-Medium',
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
