import React from 'react';
import {Modal, View, Text, Pressable, Image, StyleSheet} from 'react-native';

const CategoryModal = ({
  isModalVisible,
  onPressCategory,
  onPressModalClose,
}) => {
  return (
    <Modal visible={isModalVisible} animationType="fade" transparent={true}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.modaltopview}>
            {innerCategories
              .reduce((acc, {source, text, category}, index) => {
                const rowIndex = Math.floor(index / 5);
                if (!acc[rowIndex]) acc[rowIndex] = [];
                acc[rowIndex].push(
                  <Pressable
                    key={text}
                    style={styles.categoryInnerView}
                    onPress={() => onPressCategory(text, category)}>
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
            <View>
              <Pressable onPress={onPressModalClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
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
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'gray',
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: 15,
    paddingBottom: 6,
  },
});

const innerCategories = [
  {
    source: require('../../../../assets/free-icon-barbecue-4039250.png'),
    text: '이자카야',
    category: 'IZAKAYA',
  },
  {
    source: require('../../../../assets/free-icon-soju-5789309.png'),
    text: '한식주점',
    category: 'KOREAN',
  },
  {
    source: require('../../../../assets/free-icon-pizza-3595458.png'),
    text: '양식주점',
    category: 'WESTERN',
  },
  {
    source: require('../../../../assets/free-icon-dumplings-6560368.png'),
    text: '중화주점',
    category: 'CHINESE',
  },
  {
    source: require('../../../../assets/bar-counter_3822705.png'),
    text: '감성주점',
    category: 'GAMSEONG',
  },
  {
    source: require('../../../../assets/free-icon-jokbal-8740559.png'),
    text: '족발 보쌈',
    category: 'JOGBO',
  },
  {
    source: require('../../../../assets/free-icon-soup-12404665.png'),
    text: '찜 찌개',
    category: 'STEW',
  },
  {
    source: require('../../../../assets/free-icon-barbecue-4039250.png'),
    text: '구이 탕',
    category: 'GRILLED',
  },
  {
    source: require('../../../../assets/free-icon-roast-chicken-2137000.png'),
    text: '치킨',
    category: 'CHICKEN',
  },
  {
    source: require('../../../../assets/mayonnaise_3376991.png'),
    text: '전 막걸리',
    category: 'JEONMAK',
  },
  {
    source: require('../../../../assets/free-icon-squid-12752294.png'),
    text: '마른안주',
    category: 'DRIED',
  },
  {
    source: require('../../../../assets/free-icon-steamed-fish-2885062.png'),
    text: '해산물',
    category: 'SEAFOOD',
  },
  {
    source: require('../../../../assets/free-icon-folder-3370758.png'),
    text: '룸',
    category: 'ROOM',
  },
  {
    source: require('../../../../assets/free-icon-disco-ball-3935116.png'),
    text: '단체 행사',
    category: 'GROUP',
  },
  {
    source: require('../../../../assets/beers_2302167.png'),
    text: '야장',
    category: 'OUTDOOR',
  },
  {
    source: require('../../../../assets/free-icon-stall-food-6734735.png'),
    text: '포차',
    category: 'POCHA',
  },
  {
    source: require('../../../../assets/free-icon-beer-1887156.png'),
    text: '호프',
    category: 'HOF',
  },
  {
    source: require('../../../../assets/free-icon-wine-6454589.png'),
    text: '와인바',
    category: 'WINE',
  },
  {
    source: require('../../../../assets/free-icon-cocktail-3086535.png'),
    text: '칵테일',
    category: 'COCKTAIL',
  },
  {
    source: require('../../../../assets/free-icon-bar-counter-4507564.png'),
    text: '펍 바',
    category: 'PUBBAR',
  },
];
export default CategoryModal;
