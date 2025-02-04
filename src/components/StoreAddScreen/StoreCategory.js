import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';

const StoreCategory = ({selectedCategory, setSelectedCategory}) => {
  const {translateCategory} = useCategoryTranslation();

  const [visible, setVisible] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState([]);

  const openHandle = () => setVisible(true);
  const closeHandle = () => setVisible(false);

  const toggleCategory = category => {
    setTempSelectedCategories(prev => {
      if (prev.includes(category)) {
        // 이미 선택된 경우 해제
        return prev.filter(item => item !== category);
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
              <Text style={styles.storeinputtext}>카테고리* (최대 3개)</Text>
              <Text style={styles.inputText}>
                {selectedCategory
                  .map(item => translateCategory(item))
                  .join('     ')}
              </Text>
            </>
          ) : (
            <Text style={styles.inputHideText}>카테고리*</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={visible} animationType="fade" transparent={true}>
        <Pressable style={styles.modalBackground} onPress={closeHandle}>
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}>
            <View style={styles.modaltopview}>
              {innerCategories
                .reduce((acc, {source, text, value}, index) => {
                  const rowIndex = Math.floor(index / 5);
                  if (!acc[rowIndex]) acc[rowIndex] = [];
                  acc[rowIndex].push(
                    <Pressable
                      key={value}
                      style={[
                        styles.catagoryinnerView,
                        tempSelectedCategories.includes(value) &&
                          styles.selectedCategory, // 선택된 스타일
                      ]}
                      onPress={() => toggleCategory(value)}>
                      <Image source={source} style={styles.catagoryimgs} />
                      <Text style={styles.catagorytext}>{text}</Text>
                    </Pressable>,
                  );
                  return acc;
                }, [])
                .map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.catagoryView}>
                    {row}
                  </View>
                ))}
            </View>
            <Pressable
              onPress={applySelectedCategories}
              style={styles.closeButton}>
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
    source: require('../../assets/category/Izakaya.png'),
    text: '이자카야',
    value: 'IZAKAYA',
  },
  {
    source: require('../../assets/category/Koreafood.png'),
    text: '한식주점',
    value: 'KOREAN',
  },
  {
    source: require('../../assets/category/Westernfood.png'),
    text: '양식주점',
    value: 'WESTERN',
  },
  {
    source: require('../../assets/category/Chinesefood.png'),
    text: '중화주점',
    value: 'CHINESE',
  },
  {
    source: require('../../assets/category/Emotional.png'),
    text: '감성주점',
    value: 'GAMSEONG',
  },
  {
    source: require('../../assets/category/Jokbal.png'),
    text: '족발 보쌈',
    value: 'JOGBO',
  },
  {
    source: require('../../assets/category/Steamedfood.png'),
    text: '찜 찌개',
    value: 'STEW',
  },
  {
    source: require('../../assets/category/Grilled.png'),
    text: '구이',
    value: 'GRILLED',
  },
  {
    source: require('../../assets/category/Chicken.png'),
    text: '치킨',
    value: 'CHICKEN',
  },
  {
    source: require('../../assets/category/Pancake.png'),
    text: '전 막걸리',
    value: 'JEONMAK',
  },
  {
    source: require('../../assets/category/Dried.png'),
    text: '마른안주',
    value: 'DRIED',
  },
  {
    source: require('../../assets/category/Seafood.png'),
    text: '해산물',
    value: 'SEAFOOD',
  },
  {
    source: require('../../assets/category/Room.png'),
    text: '룸',
    value: 'ROOM',
  },
  {
    source: require('../../assets/category/Group.png'),
    text: '단체 행사',
    value: 'GROUP',
  },
  {
    source: require('../../assets/category/Yajang.png'),
    text: '야장',
    value: 'OUTDOOR',
  },
  {
    source: require('../../assets/category/Pocha.png'),
    text: '포차',
    value: 'POCHA',
  },
  {
    source: require('../../assets/category/Hope.png'),
    text: '호프',
    value: 'HOF',
  },
  {
    source: require('../../assets/category/Winebar.png'),
    text: '와인바',
    value: 'WINE',
  },
  {
    source: require('../../assets/category/Cocktail.png'),
    text: '칵테일',
    value: 'COCKTAIL',
  },
  {
    source: require('../../assets/category/Pupbar.png'),
    text: '펍 바',
    value: 'PUBBAR',
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
