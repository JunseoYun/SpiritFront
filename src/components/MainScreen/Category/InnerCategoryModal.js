// InnerCategoryModal.js
import React from 'react';
import {View, Modal, Pressable, Image, Text, StyleSheet} from 'react-native';

const InnerCategoryModal = ({isVisible, onPressInnerCategory, onClose}) => {
  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <Pressable style={styles.modalBackground} onPress={onClose}>
        <View
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}>
          <View style={styles.modaltopview}>
            {innerCategories
              .reduce((acc, {source, text}, index) => {
                const rowIndex = Math.floor(index / 5);
                if (!acc[rowIndex]) acc[rowIndex] = [];
                acc[rowIndex].push(
                  <Pressable
                    key={text}
                    style={styles.catagoryinnerView}
                    onPress={() => onPressInnerCategory(index)}>
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
          <Pressable onPress={onClose} style={styles.closeButton}>
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
  catagoryinnerView: {
    padding: 5,
    alignItems: 'center',
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

const innerCategories = [
  {
    source: require('../../../assets/category/Izakaya.png'),
    text: '이자카야',
  },
  {
    source: require('../../../assets/category/Koreafood.png'),
    text: '한식주점',
  },
  {
    source: require('../../../assets/category/Westernfood.png'),
    text: '양식주점',
  },
  {
    source: require('../../../assets/category/Chinesefood.png'),
    text: '중화주점',
  },
  {
    source: require('../../../assets/category/Emotional.png'),
    text: '감성주점',
  },
  {
    source: require('../../../assets/category/Jokbal.png'),
    text: '족발 보쌈',
  },
  {
    source: require('../../../assets/category/Steamedfood.png'),
    text: '찜 찌개',
  },
  {
    source: require('../../../assets/category/Grilled.png'),
    text: '구이',
  },
  {
    source: require('../../../assets/category/Chicken.png'),
    text: '치킨',
  },
  {
    source: require('../../../assets/category/Pancake.png'),
    text: '전 막걸리',
  },
  {
    source: require('../../../assets/category/Dried.png'),
    text: '마른안주',
  },
  {
    source: require('../../../assets/category/Seafood.png'),
    text: '해산물',
  },
  {
    source: require('../../../assets/category/Room.png'),
    text: '룸',
  },
  {
    source: require('../../../assets/category/Group.png'),
    text: '단체 행사',
  },
  {source: require('../../../assets/category/Yajang.png'), text: '야장'},
  {
    source: require('../../../assets/category/Pocha.png'),
    text: '포차',
  },
  {source: require('../../../assets/category/Hope.png'), text: '호프'},
  {
    source: require('../../../assets/category/Winebar.png'),
    text: '와인바',
  },
  {
    source: require('../../../assets/category/Cocktail.png'),
    text: '칵테일',
  },
  {
    source: require('../../../assets/category/Pupbar.png'),
    text: '펍 바',
  },
];

export default InnerCategoryModal;
