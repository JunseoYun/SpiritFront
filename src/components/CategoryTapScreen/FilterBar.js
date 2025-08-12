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
} from 'react-native';
import {AlcoholFilterContext} from '../../context/AlcoholFilterContext';
import Feather from 'react-native-vector-icons/Feather';

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

  const dropdownTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 0],
  });

  useEffect(() => {
    if (scrollRef.current) {
      // 전역에 저장된 스크롤 위치로 복원
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
      scrollRef.current.scrollTo({x: filterScrollX.current, animated: false});
    }
  }, [drinkType]);

  const toggleDropdown = () => {
    if (dropdownVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDropdownVisible(false));
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
    toggleAlcohol(value);
  };

  const handlePriceOrderPress = value => {
    togglepriceOrder(value);
  };

  return (
    <View style={styles.container}>
      {drinkType != null && (
        <Pressable style={styles.choicebtn} onPress={toggleDropdown}>
          <Text style={styles.choicetext}>
            {priceOrder === 'ASC'
              ? '낮은가격순'
              : priceOrder === 'DESC'
              ? '높은가격순'
              : '기본순'}
          </Text>
          <Feather
            name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={17}
            color="#555"
          />
        </Pressable>
      )}

      {dropdownVisible && (
        <Animated.View
          style={[
            styles.dropdown,
            {transform: [{translateY: dropdownTranslateY}]},
          ]}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              toggleDropdown();
              handlePriceOrderPress('');
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
              handlePriceOrderPress('ASC');
            }}>
            <Text
              style={[
                styles.dropdownText,
                priceOrder === 'ASC' && styles.activeDropdownText,
              ]}>
              낮은가격순
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              toggleDropdown();
              handlePriceOrderPress('DESC');
            }}>
            <Text
              style={[
                styles.dropdownText,
                priceOrder === 'DESC' && styles.activeDropdownText,
              ]}>
              높은가격순
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        nestedScrollEnabled={true}
        onStartShouldSetResponder={() => true}
        contentContainerStyle={{paddingHorizontal: 12, gap: 6}}
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  choicebtn: {
    marginRight: 1,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    height: 35,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  choicetext: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Pretendard-Bold',
    textAlign: 'center',
    marginRight: 3,
  },
  filterBar: {
    flexDirection: 'row',
    flexShrink: 1,
  },
  filterButton: {
    height: 35,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
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
    top: 50,
    left: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    paddingVertical: 5,
    zIndex: 999,
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
