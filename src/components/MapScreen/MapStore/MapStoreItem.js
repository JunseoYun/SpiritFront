import React from 'react';
import {View, Text, Pressable, Image, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation ';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';

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
    moveCenterMap(item.locationDto.latitude, item.locationDto.longitude);

    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {
        storeId: item.id,
      },
    });
  };

  const {translateCategory} = useCategoryTranslation();
  const {translateAlcohol} = useTranslateAlcohol();
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
          <Text style={styles.storeName}>{item.name}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <FontAwesomeIcon name="star" size={15} color="#FCC104" />
            <Text style={styles.storeAddress}>{item.storeRate}</Text>
          </View>
        </View>
        <View style={styles.category}>
          {Array.isArray(item.categories) && item.categories.length > 0 ? (
            item.categories.map((category, index) => (
              <Text key={index} style={styles.StoreCategory}>
                {translateCategory(category)}
              </Text>
            ))
          ) : (
            <Text style={styles.StoreCategory}>카테고리 미설정</Text>
          )}
        </View>
        <View style={styles.timeview}>
          <Text style={styles.timeviewtext}>
            영업 종료{' '}
            {item.businessHoursDto?.closeTime?.slice(0, 5) || '정보 없음'}
          </Text>
        </View>
        {/* <Text style={styles.menutext}>소주 5000원</Text> */}
        <Text style={styles.menutext} numberOfLines={1} ellipsizeMode="tail">
          {item.mainDrinkDtos && item.mainDrinkDtos.length > 0
            ? item.mainDrinkDtos
                .map(
                  drink =>
                    `${translateAlcohol(
                      drink.type,
                    )} ${drink.price.toLocaleString()}원`,
                ) // 데이터 형식화
                .join('  ') // 아이템 간 간격 추가
            : '메인주류가 없습니다.'}
        </Text>
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
