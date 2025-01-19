import React from 'react';
import {View, Text, Pressable, ImageBackground, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation ';

const NearStoreItem = ({store, navigation}) => {
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
      <View style={styles.storeInfoView}>
        <View style={styles.backimageview}>
          <ImageBackground
            source={require('../../../assets/MainPagetodayimg.png')}
            style={styles.backimage}
            imageStyle={styles.backimagestyle}
          />
        </View>
        <View style={styles.storeViewInfo}>
          <Text style={styles.storMainInfo}>{store.storeName}</Text>
          <View style={styles.storeViewInfo}>
            <FontAwesomeIcon name="star" size={15} color="#FCC104" />
            <Text style={styles.storMainInfo}> {store.storeRate}</Text>
          </View>
        </View>
        <View style={styles.storeViewInfo}>
          {Array.isArray(store.categories) && store.categories.length > 0 ? (
            store.categories.map((category, index) => (
              <Text key={index} style={styles.StoreCategory}>
                {translateCategory(category)}
              </Text>
            ))
          ) : (
            <Text style={styles.StoreCategory}>카테고리 미설정</Text>
          )}
        </View>
        <View style={styles.storeViewInfo}>
          <Text style={styles.storeSubInfo}>
            {/* 영업 종료 {store.closeHour.slice(0, 5)} */}
            영업 종료
          </Text>
          <Text style={styles.storeSubInfo}>{store.distance} m</Text>
          {/* <Text style={styles.storeSubInfo}>{store.distance.toFixed(0)} m</Text> */}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  storeInfoView: {
    marginRight: 12,
  },
  backimageview: {
    width: 170,
    height: 120,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backimage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  backimagestyle: {
    borderRadius: 12,
  },
  storeViewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
    marginLeft: 3,
    marginRight: 3,
  },
  storMainInfo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  StoreCategory: {
    fontSize: 13,
    color: '#A3A3A3',
    marginRight: 5,
  },
  storeSubInfo: {
    fontSize: 12,
    color: 'gray',
  },
});

export default NearStoreItem;
