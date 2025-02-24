import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ImageBackground, StyleSheet} from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';

const StoreResultItem = ({store, navigation, index}) => {
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
        <ImageBackground
          source={
            store.mainImgUrl
              ? {uri: store.mainImgUrl} // ✅ 네트워크 이미지
              : require('../../assets/default_store.png') // ✅ 로컬 이미지
          }
          style={styles.backimage}
          imageStyle={styles.backimagestyle}>
          {/* ✅ 영업 종료 표시 */}

          {/* ✅ 브레이크 타임 표시 */}
        </ImageBackground>
        <View style={styles.StoreTextView}>
          <View style={styles.StoreTitleView}>
            <Text
              style={styles.StoreTitle}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.name}
            </Text>
            {index === 1 && (
              <Pressable
                key={store.id}
                onPress={() => {
                  navigation.navigate('StoreCheckScreen', {
                    storeId: store.id,
                    storeName: store.name,
                    storeAddress: store.locationDto.address,
                    storeAddressDetail: store.locationDto.addressDetail,
                    storeContact: store.contact,
                  });
                }}
                style={styles.badge}>
                <Text style={styles.badgeText}>권한신청</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.StoreCategoryList}>
            {store.categories.slice(0, 3).map((category, index) => (
              <Text key={index} style={styles.StoreCategory}>
                {translateCategory(category)}
              </Text>
            ))}
          </View>
          <Text style={styles.StoreAddressText}>
            {store.locationDto.address}, {store.locationDto.addressDetail}
          </Text>
          <View style={styles.subView}>
            <Text style={styles.StoreClose}>
              영업 종료{' '}
              {store.businessHoursDto?.closeTime?.slice(0, 5) || '정보 없음'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.horizontalDivider} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  StoreInfo: {
    width: '100%',
    marginTop: 10,
    marginBottom: 7,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignSelf: 'center',
    paddingHorizontal: 18,
  },
  backimage: {
    width: 90,
    height: 120,
    borderRadius: 10,
    borderRadius: 10,
  },
  backimagestyle: {
    borderRadius: 10,
  },

  StoreTextView: {
    marginLeft: 10,
    justifyContent: 'space-between',
    marginVertical: 3,
    flex: 1,
  },
  StoreTitleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 5,
  },
  StoreTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#333',
    maxWidth: 190,
  },
  badge: {
    backgroundColor: '#16BBFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  StoreCategoryList: {
    flexDirection: 'row',
    marginRight: 5,
    alignItems: 'center',
  },

  StoreAddressText: {
    color: '#999',
    fontSize: 14,
    fontWeight: 600,
  },
  StoreCategory: {
    fontWeight: '500',
    fontSize: 15,
    color: '#333',
    marginRight: 5,
  },
  subView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  StoreClose: {
    fontSize: 13,
    color: '#333',
    marginRight: 5,
    fontWeight: '500',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
    width: '100%',
    alignSelf: 'center',
  },
});

export default StoreResultItem;
