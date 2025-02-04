import React from 'react';
import {View, Text, Pressable, Image, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';

const ResultItem = ({store, navigation}) => {
  const {translateCategory} = useCategoryTranslation();

  return (
    <Pressable
      key={store.id}
      onPress={() => {
        navigation.navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {
            storeId: store.id,
            innerlatitude: store.locationDto.latitude,
            innerlongitude: store.locationDto.longitude,
          },
        });
      }}>
      <View style={styles.StoreInfo}>
        {store.mainImgUrl ? (
          <Image source={{uri: store.mainImgUrl}} style={styles.StoreImage} />
        ) : (
          <View style={styles.storeImagetext}>
            <Text style={{color: 'white', textAlign: 'center'}}>
              이미지 없음
            </Text>
          </View>
        )}
        <View style={styles.StoreTextView}>
          <View style={styles.StoreTitleView}>
            <Text
              style={styles.StoreTitle}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.name}
            </Text>
            <View style={styles.StoreScore}>
              <FontAwesomeIcon name="star" size={15} color="#FCC104" />
              <Text style={styles.Scoretext}>
                {' '}
                {store.storeRate}
                {' ('}
                {store.reviewCount}
                {')'}
              </Text>
            </View>
          </View>

          <View style={styles.StoreCategoryList}>
            {store.categories.slice(0, 3).map((category, index) => (
              <Text key={index} style={styles.StoreCategory}>
                {translateCategory(category)}
              </Text>
            ))}
          </View>
          <View style={styles.StoreAddressView}>
            <Text style={styles.StoreAddressText}>
              {store.locationDto.address}, {store.locationDto.addressDetail}
            </Text>
          </View>
          <Text style={styles.StoreClose}>
            영업 종료{' '}
            {store.businessHoursDto?.closeTime?.slice(0, 5) || '정보 없음'}
          </Text>
        </View>
      </View>

      <View style={styles.horizontalDivider} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  StoreInfo: {
    width: '90%',
    marginTop: 10,
    marginBottom: 7,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  StoreImage: {
    width: 80,
    height: 120,
    borderRadius: 10,
  },
  storeImagetext: {
    width: 80,
    height: 120,
    borderRadius: 10,
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center',
    backgroundColor: 'black',
  },
  StoreTextView: {
    width: '80%',
    marginLeft: 10,
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  StoreTitleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 5,
  },
  StoreTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: 'black',
    maxWidth: 150,
  },
  StoreScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Scoretext: {
    marginLeft: 3,
    fontSize: 15,
    color: 'black',
  },
  StoreCategoryList: {
    flexDirection: 'row',
    marginRight: 5,
  },
  StoreAddressView: {
    width: '80%',
  },
  StoreAddressText: {
    color: 'gray',
    fontSize: 14,
  },
  StoreCategory: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'black',
    marginRight: 5,
  },
  StoreClose: {
    fontSize: 13,
    color: 'black',
    marginRight: 5,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
    width: '100%',
    alignSelf: 'center',
  },
});

export default ResultItem;
