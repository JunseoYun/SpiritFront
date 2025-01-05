import React from 'react';
import {View, Text, Pressable, Image, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MapCategory from '../../../../hooks/MapCategory';

const ResultModalItem = ({store, navigation, onClose}) => {
  return (
    <Pressable
      onPress={() => {
        navigation.navigate('StoreStack', {
          screen: 'StoreMainPage',
          params: {
            storeId: store.storeId,
            innerlatitude: store.latitude,
            innerlongitude: store.longitude,
          },
        });

        onClose();
      }}>
      <View style={styles.fastSearchStoreInfo}>
        <Image
          source={require('../../../../assets/kim.png')}
          style={styles.fastSearchStoreImage}
        />
        <View style={styles.fastStoreText}>
          <View style={styles.fastSearchStoreView}>
            <Text
              style={styles.fastStoreTitle}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.storeName}
            </Text>
            <View style={styles.fastStorescore}>
              <FontAwesomeIcon name="star" size={15} color="#FCC104" />
              <Text style={styles.fastScoretext}>{store.storeRate}</Text>
            </View>
          </View>
          <View style={styles.fastStoreCategoryList}>
            {store.categories.slice(0, 3).map((category, index) => (
              <MapCategory
                key={index}
                categories={[category]}
                style={styles.fastStoreCategory}
              />
            ))}
          </View>
          <Text style={styles.fastStoreClose}>
            영업 종료 {store.closeHour.slice(0, 5)}
          </Text>
          <Text style={styles.fastStoreMain}>대표 메뉴: </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fastSearchStoreInfo: {
    width: '90%',
    marginTop: 10,
    marginBottom: 7,
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: '5%',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 10,
  },
  fastSearchStoreImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  fastStoreText: {
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  fastSearchStoreView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 200,
    marginTop: 1,
  },
  fastStoreTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: 'black',
    maxWidth: 150,
  },
  fastStorescore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fastScoretext: {
    marginLeft: 3,
    fontSize: 15,
    color: 'black',
  },
  fastStoreCategoryList: {
    flexDirection: 'row',
    marginRight: 5,
  },
  fastStoreCategory: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
    marginRight: 5,
  },
  fastStoreClose: {
    fontSize: 13,
    color: 'black',
    marginRight: 5,
  },
  fastStoreMain: {
    fontSize: 12,
    color: 'black',
  },
});

export default ResultModalItem;
