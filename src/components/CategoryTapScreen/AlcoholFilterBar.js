import React, {useContext, useRef} from 'react';
import {ScrollView, Pressable, Text, StyleSheet} from 'react-native';
import {AlcoholFilterContext} from '../../context/AlcoholFilterContext';

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

const AlcoholFilterBar = () => {
  const {selectedAlcohols, toggleAlcohol} = useContext(AlcoholFilterContext);
  const scrollRef = useRef(null);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      ref={scrollRef}
      style={styles.filterBar}>
      {alcoholTypes.map(({label, value}, index) => (
        <Pressable
          key={value}
          onPress={() => toggleAlcohol(value)}
          style={[
            styles.button,
            selectedAlcohols.includes(value) && styles.activeButton,
          ]}>
          <Text
            style={[
              styles.text,
              selectedAlcohols.includes(value) && styles.activeText,
            ]}>
            {label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  button: {
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Pretendard-Regular',
  },
  activeButton: {
    backgroundColor: '#45C9FF',
    borderColor: '#45C9FF',
  },
  activeText: {
    color: 'white',
    fontFamily: 'Pretendard-Bold',
  },
});

export default AlcoholFilterBar;
