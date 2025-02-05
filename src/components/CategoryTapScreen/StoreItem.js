// StoreItem.js
import React from 'react';
import {TouchableOpacity, View, Text, Image, Pressable} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Categorystyles from '../../screens/CategoryTap/CategoryTapStyles';

const StoreItem = ({store, location, navigation}) => {
  return (
    <Pressable
      style={Categorystyles.itemContainer}
      onPress={() =>
        navigation.navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {
            storeId: store.id,
            innerlatitude: location.latitude,
            innerlongitude: location.longitude,
          },
        })
      }>
      {store.menuList && (
        <View style={Categorystyles.menuView}>
          {store.menuList &&
            store.menuList.length > 0 &&
            store.menuList.map((menu, index) => (
              <View key={index} style={Categorystyles.menuItemView}>
                {menu.imgUrl ? (
                  <Image
                    source={{uri: menu.imgUrl}}
                    style={Categorystyles.storeImg}
                  />
                ) : (
                  <View style={Categorystyles.storeImagetext}>
                    <Text style={{color: 'white', textAlign: 'center'}}>
                      이미지 없음
                    </Text>
                  </View>
                )}
                <Text style={Categorystyles.menuName}>{menu.name}</Text>
                <Text style={Categorystyles.menuPrice}>
                  {menu.price.toLocaleString()}원
                </Text>
              </View>
            ))}
        </View>
      )}

      <View style={Categorystyles.infoTopView}>
        <View style={Categorystyles.infoTitleView}>
          <Text style={Categorystyles.storeName}>{store.name}</Text>
          <Text
            style={Categorystyles.alcoholText}
            numberOfLines={1}
            ellipsizeMode="tail">
            {store.mainDrinkDtos && store.mainDrinkDtos.length > 0
              ? store.mainDrinkDtos
                  .map(
                    drink =>
                      `${translateAlcohol(
                        drink.type,
                      )} ${drink.price.toLocaleString()}원`,
                  )
                  .join('  ')
              : '메인주류가 없습니다.'}
          </Text>
        </View>
        <View style={Categorystyles.infoView}>
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <Text style={Categorystyles.infoText}> {store.storeRate || 0}</Text>
          <Text style={Categorystyles.infoText}>
            {' '}
            . 고객리뷰 {store.reviewCount || 0}
          </Text>
          <Text style={Categorystyles.infoText}>
            {' '}
            . 찜 {store.storeLikeCount || 0}
          </Text>
        </View>
        <View style={Categorystyles.infoTimeView}>
          <View style={Categorystyles.infoView}>
            <Ionicons name="time-outline" size={15} color="#333" />
            <Text style={Categorystyles.infoText}>
              {' '}
              영업 중 · {store.businessHoursDto?.closeTime?.slice(0, 5) || ''}
            </Text>
          </View>
          <View style={Categorystyles.infoView}>
            <MaterialCommunityIcons name="sleep" size={15} color="#333" />
            <Text style={Categorystyles.infoText}>
              {' '}
              {store.businessHoursDto?.breakStartTime?.slice(0, 5)} ~{' '}
              {store.businessHoursDto?.breakEndTime?.slice(0, 5)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default StoreItem;
