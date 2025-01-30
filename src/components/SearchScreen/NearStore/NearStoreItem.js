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
            storeId: store.id,
            innerlatitude: store.locationDto.latitude,
            innerlongitude: store.locationDto.longitude,
          },
        })
      }>
      <View style={styles.storeInfoView}>
        <View style={styles.backimageview}>
          {store.mainImgUrl ? (
            <ImageBackground
              source={{uri: store.mainImgUrl}}
              style={styles.backimage}
              imageStyle={styles.backimagestyle}
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
              }}>
              <Text style={{color: 'black', textAlign: 'center'}}>
                이미지 없음
              </Text>
            </View>
          )}
        </View>
        <View style={styles.storeViewInfo}>
          <Text style={styles.storMainInfo}>{store.name}</Text>
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
            영업 종료{' '}
            {store.businessHoursDto?.closeTime?.slice(0, 5) || '정보 없음'}
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
    marginHorizontal: 12,
  },
  backimageview: {
    width: 170,
    height: 120,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
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
