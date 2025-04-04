import React from 'react';
import {
  Pressable,
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../hooks/useStoreStatus';
const drinkColors = {
  SOJU: '#43A047',
  BEER: '#F9A825',
  MAKGEOLLI: '#616161',
  WINE: '#8E0038',
  COCKTAIL: '#D84315',
  SAKE: '#455A64',
  KAOLIANG: '#5D4037',
  WHISKEY: '#6D4C41',
  VODKA: '#3949AB',
  GIN: '#2E7D32',
  RUM: '#3E2723',
  HIGHBALL: '#20B2AA',
  TEQUILA: '#EF6C00',
};
// utils/colorUtils.js (또는 상단에 직접 추가해도 됨)
const hexToRGBA = (hex, opacity = 0.3) => {
  let col = hex.replace('#', '');

  if (col.length === 3) {
    col = col
      .split('')
      .map(c => c + c)
      .join('');
  }

  const num = parseInt(col, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth - 36;
const imageHeight = imageWidth * (4.2 / 8);

const LikedItem = ({store, navigation}) => {
  const {translateCategory} = useCategoryTranslation();
  const {translateAlcohol} = useTranslateAlcohol();
  const {
    isOpen,
    isBreak,
    closed,
    nextclosed,
    starttime,
    endtime,
    breakstart,
    breakend,
  } = useStoreStatus(store?.operationInfoDtos, store?.isAlwaysOpen);

  return (
    <Pressable
      style={{marginBottom: 10}}
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
      <View style={styles.storeInfo}>
        <ImageBackground
          source={
            store.mainImgUrl
              ? {uri: store.mainImgUrl} // ✅ 네트워크 이미지
              : require('../../assets/default_store.png') // ✅ 로컬 이미지
          }
          style={styles.backimage}
          imageStyle={styles.backimagestyle}>
          {/* ✅ 영업 종료 표시 */}
          {!isOpen && !nextclosed && !closed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                영업 종료 {starttime ? `\n${starttime} 오픈` : ''}
              </Text>
            </View>
          )}
          {!isOpen && nextclosed && !closed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>영업 종료 익일 휴무</Text>
            </View>
          )}
          {!isOpen && !nextclosed && closed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>금일 휴무</Text>
            </View>
          )}
          {/* ✅ 브레이크 타임 표시 */}
          {isOpen && isBreak && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                브레이크 타임 {breakend ? `\n${breakend} 종료` : ''}
              </Text>
            </View>
          )}
        </ImageBackground>
      </View>
      <View style={styles.textContainer}>
        <View style={styles.infoRow}>
          <View style={styles.drinkView}>
            {store.mainDrinkDtos && store.mainDrinkDtos.length > 0
              ? store.mainDrinkDtos?.map((drink, index) => {
                  const baseColor = drinkColors[drink.type] || '#333';
                  const borderColor = hexToRGBA(baseColor, 0.5); // 살짝 연한 컬러
                  return (
                    <React.Fragment key={index}>
                      <Text
                        style={[
                          styles.drinkText,
                          {color: baseColor, borderColor: borderColor},
                        ]}>
                        {translateAlcohol(drink.type)} {drink.price}
                      </Text>
                      {index !== store.mainDrinkDtos.length - 1 && (
                        <View style={styles.division} />
                      )}
                    </React.Fragment>
                  );
                })
              : '메인주류가 없습니다.'}
          </View>
        </View>
        <View style={styles.headerRow}>
          <Text
            style={styles.storeTitle}
            numberOfLines={1}
            ellipsizeMode="tail">
            {store.name}
          </Text>
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

        {store.menuList && store.menuList.length > 0 && (
          <View style={styles.infoRow}>
            <Text
              style={styles.infoItem}
              numberOfLines={1}
              ellipsizeMode="tail">
              {
                store.menuList
                  .map(
                    menu => `#${menu.name}`, // 메뉴 항목 형식화
                  )
                  .join('  ') // 항목 간 간격 추가
              }
            </Text>
          </View>
        )}
        <View style={styles.scoreContainer}>
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <Text style={styles.scoreText}>{store.storeRate}</Text>
          <Text style={styles.scoreCountText}>({store.reviewCount})</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  storeInfo: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginTop: 20,
    marginVertical: 8,
    alignSelf: 'center',
    borderRadius: 12,
  },
  backimage: {
    width: imageWidth,
    height: imageHeight,
    borderRadius: 10,

    alignSelf: 'center',
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
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    textAlign: 'center',
    lineHeight: 26,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: 22,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeTitle: {
    fontSize: 19,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    maxWidth: '90%',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
  scoreCountText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#999',
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  drinkView: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 3,
  },
  drinkText: {
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    borderWidth: 1.2,
    padding: 4,
    borderRadius: 5,
    marginRight: 7,
  },
  infoItem: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#767676',
    marginRight: 8,
    maxWidth: '100%',
  },
  storeCloseTime: {
    fontSize: 14,
    color: '#666',
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#16BBFF',
  },
});

export default LikedItem;
