import React from 'react';
import {View, Text, Pressable, Image, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation ';

const MapStoreItem = ({
  item,
  index,
  selectedStoreIndex,
  setSelectedStore,
  moveCenterMap,
  navigation,
  location,
}) => {
  const handlePress = () => {
    setSelectedStore(item);
    moveCenterMap(item.latitude, item.longitude);

    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {
        storeId: item.storeId,
        innerlatitude: location.latitude,
        innerlongitude: location.longitude,
      },
    });
  };

  const {translateCategory} = useCategoryTranslation();
  return (
    <Pressable
      style={[
        styles.storeInfo,
        index === selectedStoreIndex ? styles.selectedStore : null,
      ]}
      onPress={handlePress}>
      <Image
        source={require('../../../assets/kim.png')}
        style={styles.storeImage}
      />
      <View style={styles.titletopview}>
        <View style={styles.titleview}>
          <Text style={styles.storeName}>{item.storeName}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <FontAwesomeIcon name="star" size={15} color="#FCC104" />
            <Text style={styles.storeAddress}>{item.storeRate}</Text>
          </View>
        </View>
        <View style={styles.category}>
          {item.categories.slice(0, 3).map((category, idx) => (
            <Text key={idx} style={styles.StoreCategory}>
              {translateCategory(category)}
            </Text>
          ))}
        </View>
        <View style={styles.timeview}>
          <Text style={styles.timeviewtext}>
            영업종료 {item.closeHour.slice(0, 5)}
          </Text>
        </View>
        <Text style={styles.menutext}>소주 5000원</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  storeInfo: {
    flexDirection: 'row',
    width: 370, // 아이템 너비
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20, // 아이템 간 간격
  },
  storeImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  titletopview: {
    flex: 1,
    marginLeft: 20,
  },
  titleview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  storeAddress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginRight: 5,
  },
  category: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  StoreCategory: {
    top: 1,
    fontSize: 15,
    color: 'black',
    marginRight: 5,
  },
  timeview: {
    flexDirection: 'row',
  },
  timeviewtext: {
    fontSize: 12,
    fontWeight: '700',
    color: 'gray',
    marginBottom: 15,
  },
  menutext: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16BBFF',
  },
});

export default MapStoreItem;
