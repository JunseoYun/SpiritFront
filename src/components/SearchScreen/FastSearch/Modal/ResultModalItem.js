import React from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MapCategory from '../../../../hooks/MapCategory';
import useCategoryTranslation from '../../../../hooks/useCategoryTranslation';
import useStoreStatus from '../../../../hooks/useStoreStatus';

const ResultModalItem = ({store, navigation, onClose}) => {
  const {translateCategory} = useCategoryTranslation();
  const isStoreOpen = useStoreStatus(
    store?.businessHoursDto?.openTime,
    store?.businessHoursDto?.closeTime,
    store?.closedDays,
  );
  const isStoreBreak = useStoreStatus(
    store?.businessHoursDto?.breakStartTime,
    store?.businessHoursDto?.breakEndTime,
  );
  console.log(store);
  return (
    <Pressable
      onPress={() => {
        navigation.navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {
            storeId: store.id,
            innerlatitude: store.locationDto.latitude,
            innerlongitude: store.locationDto.longitude,
          },
        });

        onClose();
      }}>
      <View style={{width: '100%', alignItems: 'center'}}>
        <View style={styles.fastSearchStoreInfo}>
          <ImageBackground
            source={
              store.mainImgUrl
                ? {uri: store.mainImgUrl} // ✅ 네트워크 이미지
                : require('../../../../assets/default_store.png') // ✅ 로컬 이미지
            }
            style={styles.backimage}
            imageStyle={styles.backimagestyle}>
            {/* ✅ 영업 종료 표시 */}
            {!isStoreOpen && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  영업 종료{' '}
                  {store.businessHoursDto?.openTime
                    ? `\n${store.businessHoursDto.openTime.slice(0, 5)} 오픈`
                    : ''}
                </Text>
              </View>
            )}
            {/* ✅ 브레이크 타임 표시 */}
            {isStoreOpen && isStoreBreak && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  브레이크 타임{' '}
                  {store.businessHoursDto?.breakEndTime
                    ? `\n${store.businessHoursDto.breakEndTime.slice(
                        0,
                        5,
                      )} 종료`
                    : ''}
                </Text>
              </View>
            )}
          </ImageBackground>
          <View style={styles.fastStoreText}>
            <View style={styles.fastSearchStoreView}>
              <Text
                style={styles.fastStoreTitle}
                numberOfLines={1}
                ellipsizeMode="tail">
                {store.name}
              </Text>
              <View style={styles.fastStorescore}>
                <FontAwesomeIcon name="star" size={15} color="#FCC104" />
                <Text style={styles.fastScoretext}>{store.storeRate}</Text>
              </View>
            </View>
            <View style={styles.fastStoreCategoryList}>
              <Text style={styles.fastStoreCategory} ellipsizeMode="tail">
                {Array.isArray(store.categories) && store.categories.length > 0
                  ? store.categories
                      .map(category => translateCategory(category))
                      .join(' ')
                  : '카테고리 미설정'}
              </Text>
            </View>
            <Text style={styles.fastStoreClose}>
              영업 종료{' '}
              {store.businessHoursDto?.closeTime?.slice(0, 5) || '정보 없음'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fastSearchStoreInfo: {
    width: '95%',
    marginTop: 10,
    marginBottom: 7,

    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 10,
  },

  backimage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 12,
    borderRadius: 10,
  },
  backimagestyle: {
    borderRadius: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fastStoreText: {
    flex: 1,
    paddingHorizontal: 10,
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
    paddingRight: 10,
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
