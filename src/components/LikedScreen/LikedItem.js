// StoreCard.js
import React from 'react';
import {Pressable, View, Text, Image, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../hooks/useCategoryTranslation ';

const LikedItem = ({store, navigation}) => {
  const {translateCategory} = useCategoryTranslation();
  return (
    <Pressable
      onPress={() =>
        navigation.navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {
            storeId: store.storeId,
            innerlatitude: store.latitude,
            innerlongitude: store.longitude,
          },
        })
      }>
      <View style={styles.storeInfo}>
        <Image
          source={require('../../assets/kim.png')}
          style={styles.storeImage}
        />
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text
              style={styles.storeTitle}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.storeName}
            </Text>
            <View style={styles.scoreContainer}>
              <FontAwesomeIcon name="star" size={15} color="#FCC104" />
              <Text style={styles.scoreText}>{store.storeRate}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoItem} ellipsizeMode="tail">
              {Array.isArray(store.categories) && store.categories.length > 0
                ? store.categories
                    .map(category => translateCategory(category))
                    .join(' ')
                : '카테고리 미설정'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={styles.infoItem}
              numberOfLines={1}
              ellipsizeMode="tail">
              매운갈비찜 벽돌께란말이 까르보떡볶이
            </Text>
          </View>

          <Text style={styles.storeMainMenu}>
            <Text style={styles.highlightText}>
              {store.mainMenu || '소주 4500원'}
            </Text>{' '}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  storeInfo: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 18,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  storeImage: {
    width: 100,
    height: 120,
    borderRadius: 10,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    maxWidth: '80%',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#555',
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  infoItem: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginRight: 8,
    maxWidth: '100%',
  },
  storeCloseTime: {
    fontSize: 14,
    color: '#666',
  },
  storeMainMenu: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#16BBFF',
  },
});

export default LikedItem;
