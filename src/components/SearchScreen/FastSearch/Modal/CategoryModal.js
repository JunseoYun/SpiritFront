import React, {useState} from 'react';
import {Modal, View, Text, Pressable, Image, StyleSheet} from 'react-native';

const CategoryModal = ({
  isModalVisible,
  onPressCategory,
  onPressModalClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(''); // 단일 선택 상태

  const handleCategoryPress = (text, category) => {
    setSelectedCategory(category); // 선택된 카테고리 업데이트
    setTimeout(() => {
      onPressCategory(text, category); // 100ms 뒤에 실행
      setSelectedCategory(null);
    }, 100);
  };

  return (
    <Modal visible={isModalVisible} animationType="fade" transparent={true}>
      <Pressable style={styles.modalBackground} onPress={onPressModalClose}>
        <View
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}>
          <View style={styles.modaltopview}>
            {innerCategories
              .reduce((acc, {source, text, category}, index) => {
                const rowIndex = Math.floor(index / 5);
                if (!acc[rowIndex]) acc[rowIndex] = [];
                acc[rowIndex].push(
                  <Pressable
                    key={text}
                    style={[
                      styles.categoryInnerView,
                      selectedCategory === category && styles.selectedCategory, // 선택된 카테고리에 스타일 적용
                    ]}
                    onPress={() => handleCategoryPress(text, category)}>
                    <Image source={source} style={styles.categoryImage} />
                    <Text style={styles.categoryText}>{text}</Text>
                  </Pressable>,
                );
                return acc;
              }, [])
              .map((row, index) => (
                <View key={index} style={styles.categoryView}>
                  {row}
                </View>
              ))}
          </View>
          <Pressable onPress={onPressModalClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  categoryView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 25,
    marginTop: 15,
    textAlign: 'center',
  },
  categoryInnerView: {
    padding: 5,
    alignItems: 'center',
  },
  selectedCategory: {
    borderWidth: 1,
    borderColor: 'rgba(22, 187, 255, 0.7)',
    borderRadius: 10,
    padding: 5,
  },
  categoryImage: {
    width: 40,
    resizeMode: 'contain',
    height: 40,
  },
  categoryText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 7,
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

const innerCategories = [
  {
    source: require('../../../../assets/category/Izakaya.png'),
    text: '이자카야',
    category: 'IZAKAYA',
  },
  {
    source: require('../../../../assets/category/Koreafood.png'),
    text: '한식',
    category: 'KOREAN',
  },
  {
    source: require('../../../../assets/category/Westernfood.png'),
    text: '양식',
    category: 'WESTERN',
  },
  {
    source: require('../../../../assets/category/Chinesefood.png'),
    text: '중식',
    category: 'CHINESE',
  },
  {
    source: require('../../../../assets/category/Emotional.png'),
    text: '감성주점',
    category: 'GAMSEONG',
  },
  {
    source: require('../../../../assets/category/Grilled.png'),
    text: '구이 찜',
    category: 'GRILLED_STEW',
  },
  {
    source: require('../../../../assets/category/Hope.png'),
    text: '치킨 호프',
    category: 'CHICKEN_HOF',
  },
  {
    source: require('../../../../assets/category/Seafood.png'),
    text: '회 해산물',
    category: 'RAW_SEAFOOD',
  },
  {
    source: require('../../../../assets/category/Pupbar.png'),
    text: '펍 바',
    category: 'PUB_BAR',
  },
  {
    source: require('../../../../assets/category/Pocha.png'),
    text: '포장마차',
    category: 'POCHA',
  },
];
export default CategoryModal;
