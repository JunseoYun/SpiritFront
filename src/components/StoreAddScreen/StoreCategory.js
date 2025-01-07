import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Image, TouchableOpacity } from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation ';

const StoreCategory = ({ selectedCategory, setSelectedCategory }) => {

  const { translateCategory } = useCategoryTranslation();

  const [visible, setVisible] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState([]);

  const openHandle = () => setVisible(true);
  const closeHandle = () => setVisible(false);

  const toggleCategory = (category) => {
    setTempSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // 이미 선택된 경우 해제
        return prev.filter((item) => item !== category);
      } else if (prev.length < 3) {
        // 선택된 항목이 3개 미만이면 추가
        return [...prev, category];
      }
      return prev; // 3개 이상은 추가 안 함
    });
  };

  const applySelectedCategories = () => {
    setSelectedCategory(tempSelectedCategories); // 최종 선택된 카테고리 저장
    closeHandle();
  };

  return (
    <View>
      <View style={styles.storeinputview}>
        <TouchableOpacity style={styles.storeinput} onPress={openHandle}>
          {selectedCategory && selectedCategory.length > 0 ? (
            <>
              <Text style={styles.storeinputtext}>카테고리*</Text>
              <Text style={styles.inputText}>
                {selectedCategory.map(item => translateCategory(item)).join('     ')}
              </Text>
            </>
          ) : (
            <Text style={styles.inputHideText}>카테고리*</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={visible} animationType="fade" transparent={true}>
        <Pressable style={styles.modalBackground} onPress={closeHandle}>
          <View style={styles.modalContainer}
            onStartShouldSetResponder={() => true} >
            <View style={styles.modaltopview}>
              {innerCategories
                .reduce((acc, { source, text, value }, index) => {
                  const rowIndex = Math.floor(index / 5);
                  if (!acc[rowIndex]) acc[rowIndex] = [];
                  acc[rowIndex].push(
                    <Pressable
                      key={value}
                      style={[
                        styles.catagoryinnerView,
                        tempSelectedCategories.includes(value) && styles.selectedCategory, // 선택된 스타일
                      ]}
                      onPress={() => toggleCategory(value)}>
                      <Image source={source} style={styles.catagoryimgs} />
                      <Text style={styles.catagorytext}>{text}</Text>
                    </Pressable>
                  );
                  return acc;
                }, [])
                .map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.catagoryView}>
                    {row}
                  </View>
                ))}

            </View>
            <Pressable onPress={applySelectedCategories} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>확인</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};


const innerCategories = [
  {
    source: require('../../assets/free-icon-barbecue-4039250.png'),
    text: '이자카야', value: 'IZAKAYA'
  },
  {
    source: require('../../assets/free-icon-soju-5789309.png'),
    text: '한식주점', value: 'KOREAN'
  },
  {
    source: require('../../assets/free-icon-pizza-3595458.png'),
    text: '양식주점', value: 'WESTERN'
  },
  {
    source: require('../../assets/free-icon-dumplings-6560368.png'),
    text: '중화주점', value: 'CHINESE'
  },
  {
    source: require('../../assets/bar-counter_3822705.png'),
    text: '감성주점', value: 'GAMSEONG'
  },
  {
    source: require('../../assets/free-icon-jokbal-8740559.png'),
    text: '족발 보쌈', value: 'JOGBO'
  },
  {
    source: require('../../assets/free-icon-soup-12404665.png'),
    text: '찜 찌개', value: 'STEW'
  },
  {
    source: require('../../assets/free-icon-barbecue-4039250.png'),
    text: '구이 탕', value: 'GRILLED'
  },
  {
    source: require('../../assets/free-icon-roast-chicken-2137000.png'),
    text: '치킨', value: 'CHICKEN'
  },
  {
    source: require('../../assets/mayonnaise_3376991.png'),
    text: '전 막걸리', value: 'JEONMAK'
  },
  {
    source: require('../../assets/free-icon-squid-12752294.png'),
    text: '마른안주', value: 'DRIED'
  },
  {
    source: require('../../assets/free-icon-steamed-fish-2885062.png'),
    text: '해산물', value: 'SEAFOOD'
  },
  {
    source: require('../../assets/free-icon-folder-3370758.png'),
    text: '룸', value: 'ROOM'
  },
  {
    source: require('../../assets/free-icon-disco-ball-3935116.png'),
    text: '단체 행사', value: 'GROUP'
  },
  { source: require('../../assets/beers_2302167.png'), text: '야장', value: 'OUTDOOR' },
  {
    source: require('../../assets/free-icon-stall-food-6734735.png'),
    text: '포차', value: 'POCHA'
  },
  { source: require('../../assets/free-icon-beer-1887156.png'), text: '호프', value: 'HOF' },
  {
    source: require('../../assets/free-icon-wine-6454589.png'),
    text: '와인바', value: 'WINE'
  },
  {
    source: require('../../assets/free-icon-cocktail-3086535.png'),
    text: '칵테일', value: 'COCKTAIL'
  },
  {
    source: require('../../assets/free-icon-bar-counter-4507564.png'),
    text: '펍 바', value: 'PUBBAR'
  },
];

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  storeinput: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
  },
  storeinputtext: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  inputText: {
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 1,
    paddingLeft: 1,
  },
  storetext: {
    fontWeight: '400',
    color: 'black',
    fontSize: 14,
    marginVertical: 5,
    marginBottom: 5,
  },
  inputHideText: {
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 1,
    paddingLeft: 1,
    color: '#999',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    paddingVertical: 5,
    paddingTop: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modaltopview: {
    width: '100%',
  },
  catagoryinnerView: {
    padding: 5,
    alignItems: 'center',
  },
  selectedCategory: {
    // backgroundColor: 'rgba(22, 187, 255, 0.7)', // 선택된 경우 배경색 및 투명도 (50%)
    borderColor: 'rgba(22, 187, 255, 0.7)',
    borderWidth: 3,
    borderRadius: 10,
  },
  catagoryimgs: {
    width: 40,
    resizeMode: 'contain',
    height: 40,
  },
  catagorytext: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 7,
  },
  catagoryView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 25,
    marginTop: 15,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 30,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(22, 187, 255, 0.9)',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default StoreCategory;
