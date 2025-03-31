import React from 'react';
import {View, StyleSheet, Text, Pressable} from 'react-native';
import FastImage from 'react-native-fast-image';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';

const drinkColors = {
  SOJU: '#43A047',
  BEER: '#F9A825',
  MAKGEOLLI: '#616161',
  WINE: '#8E0038',
  COCKTAIL: '#D84315',
  SAKE: '#455A64',
  KAOLIANG: '#5D4037',
  WHISKEY: '#6D4C41',
  VODKA: '#3949AB',
  GIN: '#2E7D32',
  RUM: '#3E2723',
  TEQUILA: '#EF6C00',
};

const TodayRecommItem = ({store, navigation}) => {
  console.log(store);
  const {translateAlcohol} = useTranslateAlcohol();
  return (
    <Pressable
      onPress={() =>
        navigation.navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {storeId: store.id},
        })
      }
      style={styles.container}>
      <View style={styles.drinkView}>
        {store.mainDrinkDtos?.map((drink, index) => {
          const color = drinkColors[drink.type] || '#333';
          return (
            <React.Fragment key={index}>
              <Text style={[styles.drinkText, {color, borderColor: color}]}>
                {translateAlcohol(drink.type)} {drink.price}
              </Text>
              {index !== store.mainDrinkDtos.length - 1 && (
                <View style={styles.division} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <FastImage
        style={styles.imageBackground}
        source={
          store.mainImgUrl
            ? {uri: store.mainImgUrl, priority: FastImage.priority.normal}
            : require('../../../assets/default_store.png')
        }
        resizeMode={FastImage.resizeMode.cover}>
        <View style={styles.overlay}>
          <View style={styles.storeContainer}>
            <Text
              style={styles.storeName}
              numberOfLines={3}
              ellipsizeMode="tail">
              {store.name}
            </Text>
          </View>
        </View>
      </FastImage>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 230,
    marginVertical: 10,
    // borderRadius: 10,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
  },

  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    position: 'relative', // 🔹 기준 위치로 사용
  },
  storeContainer: {},
  storeNameView: {
    backgroundColor: '#333',
  },
  storeName: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    lineHeight: 26,
  },
  likeView: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',

    padding: 7,
    borderRadius: 30,
  },
  likeIcon: {
    alignSelf: 'flex-end',
  },
  drinkView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 7,
    marginBottom: 3,
  },
  drinkText: {
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    borderWidth: 1,
    padding: 4,
    borderRadius: 7,
  },
  division: {
    height: 12,
    width: 1.5,

    marginHorizontal: 2,
  },
});

export default React.memo(TodayRecommItem);
