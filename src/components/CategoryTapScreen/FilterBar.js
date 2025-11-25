import React, {useContext, useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  PixelRatio,
} from 'react-native';
import {AlcoholFilterContext} from '../../context/AlcoholFilterContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../common/CustomText';

const screenWidth = Dimensions.get('window').width;

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

const FilterBar = () => {
  const {
    drinkType,
    toggleAlcohol,
    filterScrollX,
    priceOrder,
    togglepriceOrder,
  } = useContext(AlcoholFilterContext);

  const scrollRef = useRef(null);
  const buttonLayouts = useRef({});

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

  // 선택된 drinkType 버튼 중앙 정렬
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
  const closeDropdown = (animated = true) => {
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
  };

  const toggleDropdown = () => {
    if (dropdownVisible) {
      closeDropdown();
    } else {
      setDropdownVisible(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleAlcoholPress = value => {
    closeDropdown(false); // 필터 선택 시 즉시 닫기
    toggleAlcohol(value);
  };

  const handlePriceOrderPress = value => togglepriceOrder(value);

  return (
    <View style={styles.container}>
      {/* 스크롤이 “버튼 뒤로” 흐르도록 먼저 ScrollView를 깔고, 버튼을 나중에 absolute로 올립니다 */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        nestedScrollEnabled
        onStartShouldSetResponder={() => true}
        onTouchStart={() => closeDropdown(false)} // 손가락 닿는 순간 닫기(즉시)
        onScrollBeginDrag={() => closeDropdown()} // 드래그 시작 시 닫기(애니메이션)
        onMomentumScrollBegin={() => closeDropdown()} // 관성 스크롤 시작 시 닫기
        contentContainerStyle={{
          paddingHorizontal: 12,
          gap: 6,
          // 버튼이 덮는 영역만큼 왼쪽 패딩을 줘서 첫 아이템이 가려지지 않게 합니다
          paddingLeft: drinkType != null ? choiceBtnWidth + OVERLAP_GAP : 12,
        }}
        onScroll={e => {
          filterScrollX.current = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}>
        {alcoholTypes.map(({label, value}) => (
          <Pressable
            key={value}
            onPress={() => handleAlcoholPress(value)}
            onLayout={e => {
              const layout = e.nativeEvent.layout;
              buttonLayouts.current[value] = {x: layout.x, width: layout.width};
            }}
            style={[
              styles.filterButton,
              drinkType === value && styles.activeFilter,
            ]}>
            <CustomText
              style={[
                styles.filterText,
                drinkType === value && styles.activeFilterText,
              ]}>
              {label}
            </CustomText>
          </Pressable>
        ))}
      </ScrollView>

      {/* choice 버튼을 절대배치로 올려 스크롤 위에 겹칩니다 */}
      {drinkType != null && (
        <Pressable
          style={styles.choicebtn}
          onPress={toggleDropdown}
          onLayout={e => setChoiceBtnWidth(e.nativeEvent.layout.width)}>
          <MaterialCommunityIcons name="tune-variant" size={17} color="#555" />
          <CustomText style={[styles.choicetext]}>
            {priceOrder === 'ASC'
              ? '낮은 가격순'
              : priceOrder === 'DESC'
              ? '높은 가격순'
              : '기본순'}
          </CustomText>
        </Pressable>
      )}

      {/* 드롭다운도 버튼 기준으로 absolute 배치 */}
      {dropdownVisible && (
        <Animated.View
          style={[
            styles.dropdown,
            {left: 5, transform: [{translateY: dropdownTranslateY}]},
          ]}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              toggleDropdown();
              handlePriceOrderPress('');
            }}>
            <CustomText
              style={[
                styles.dropdownText,
                priceOrder === '' && styles.activeDropdownText,
              ]}>
              기본순
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              toggleDropdown();
              handlePriceOrderPress('ASC');
            }}>
            <CustomText
              style={[
                styles.dropdownText,
                priceOrder === 'ASC' && styles.activeDropdownText,
              ]}>
              낮은 가격순
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              toggleDropdown();
              handlePriceOrderPress('DESC');
            }}>
            <CustomText
              style={[
                styles.dropdownText,
                priceOrder === 'DESC' && styles.activeDropdownText,
              ]}>
              높은 가격순
            </CustomText>
          </TouchableOpacity>
        </Animated.View>
      )}
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
    top: 10,
    paddingHorizontal: 15,
    height: 35,

    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    zIndex: 50, // iOS

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 0},
    // Android shadow
    elevation: 2,
  },
  choicetext: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Pretendard-Medium',
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
    backgroundColor: '#E8F7FF',
    borderColor: '#3CBBFF',
  },
  activeFilterText: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
  },

  dropdown: {
    position: 'absolute',
    top: 50, // choicebtn 아래로
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

export default FilterBar;
