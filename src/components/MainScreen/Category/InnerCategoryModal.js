// InnerCategoryModal.js
import React from 'react';
import {View, Modal, Pressable, Image, Text, StyleSheet} from 'react-native';

const InnerCategoryModal = ({isVisible, onPressInnerCategory, onClose}) => {
  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
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
            <View>
              <Pressable onPress={onClose} style={styles.closeButton}>
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
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 6,
  },
});

const innerCategories = [
  {
    source: require('../../../assets/free-icon-barbecue-4039250.png'),
    text: '이자카야',
  },
  {
    source: require('../../../assets/free-icon-soju-5789309.png'),
    text: '한식주점',
  },
  {
    source: require('../../../assets/free-icon-pizza-3595458.png'),
    text: '양식주점',
  },
  {
    source: require('../../../assets/free-icon-dumplings-6560368.png'),
    text: '중화주점',
  },
  {
    source: require('../../../assets/bar-counter_3822705.png'),
    text: '감성주점',
  },
  {
    source: require('../../../assets/free-icon-jokbal-8740559.png'),
    text: '족발 보쌈',
  },
  {
    source: require('../../../assets/free-icon-soup-12404665.png'),
    text: '찜 찌개',
  },
  {
    source: require('../../../assets/free-icon-barbecue-4039250.png'),
    text: '구이 탕',
  },
  {
    source: require('../../../assets/free-icon-roast-chicken-2137000.png'),
    text: '치킨',
  },
  {
    source: require('../../../assets/mayonnaise_3376991.png'),
    text: '전 막걸리',
  },
  {
    source: require('../../../assets/free-icon-squid-12752294.png'),
    text: '마른안주',
  },
  {
    source: require('../../../assets/free-icon-steamed-fish-2885062.png'),
    text: '해산물',
  },
  {
    source: require('../../../assets/free-icon-folder-3370758.png'),
    text: '룸',
  },
  {
    source: require('../../../assets/free-icon-disco-ball-3935116.png'),
    text: '단체 행사',
  },
  {source: require('../../../assets/beers_2302167.png'), text: '야장'},
  {
    source: require('../../../assets/free-icon-stall-food-6734735.png'),
    text: '포차',
  },
  {source: require('../../../assets/free-icon-beer-1887156.png'), text: '호프'},
  {
    source: require('../../../assets/free-icon-wine-6454589.png'),
    text: '와인바',
  },
  {
    source: require('../../../assets/free-icon-cocktail-3086535.png'),
    text: '칵테일',
  },
  {
    source: require('../../../assets/free-icon-bar-counter-4507564.png'),
    text: '펍 바',
  },
];

export default InnerCategoryModal;
