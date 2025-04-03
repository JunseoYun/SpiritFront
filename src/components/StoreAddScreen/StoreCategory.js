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

const StoreCategory = ({selectedCategory, setSelectedCategory, error}) => {
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
        {error === 'StoreCategory' && selectedCategory.length === 0 && (
          <Text style={styles.errorMessage}>
            매장 카테고리를 하나 이상 선택해주세요.
          </Text>
        )}
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
    text: '한식',
    value: 'KOREAN',
  },
  {
    source: require('../../assets/category/Westernfood.png'),
    text: '양식',
    value: 'WESTERN',
  },
  {
    source: require('../../assets/category/Chinesefood.png'),
    text: '중식',
    value: 'CHINESE',
  },
  {
    source: require('../../assets/category/Emotional.png'),
    text: '감성주점',
    value: 'GAMSEONG',
  },
  {
    source: require('../../assets/category/Grilled.png'),
    text: '구이 찜',
    value: 'GRILLED_STEW',
  },
  {
    source: require('../../assets/category/Hope.png'),
    text: '치킨 호프',
    value: 'CHICKEN_HOF',
  },
  {
    source: require('../../assets/category/Seafood.png'),
    text: '회 해산물',
    value: 'RAW_SEAFOOD',
  },
  {
    source: require('../../assets/category/Pupbar.png'),
    text: '펍 바',
    value: 'PUB_BAR',
  },
  {
    source: require('../../assets/category/Pocha.png'),
    text: '포장마차',
    value: 'POCHA',
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
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 7,
    paddingLeft: 1,
  },
  storeinputtext: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  inputText: {
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 1,
    paddingLeft: 1,
  },

  inputHideText: {
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 1,
    paddingLeft: 1,
    color: '#999',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    marginTop: 5,
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
    backgroundColor: 'rgba(22, 187, 255, 0.4)', // 선택된 경우 배경색 및 투명도 (50%)
    // borderColor: 'rgba(22, 187, 255, 0.7)',

    borderRadius: 10,
  },
  catagoryimgs: {
    width: 40,
    resizeMode: 'contain',
    height: 40,
  },
  catagorytext: {
    color: 'black',
    fontFamily: 'Pretendard-SemiBold',
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
    backgroundColor: '#45C9FF',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'Pretendard-Medium',
  },
});

export default StoreCategory;
