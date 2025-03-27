import React from 'react';
import {Pressable, View, Text, ImageBackground, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../hooks/useStoreStatus';

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
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text
              style={styles.storeTitle}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.name}
            </Text>
            <View style={styles.scoreContainer}>
              <FontAwesomeIcon name="star" size={15} color="#FCC104" />
              <Text style={styles.scoreText}>{store.storeRate}</Text>
            </View>
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

          <View style={styles.infoRow}>
            <Text
              style={styles.infoItem}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.menuList && store.menuList.length > 0
                ? store.menuList
                    .map(
                      menu => `${menu.name}`, // 메뉴 항목 형식화
                    )
                    .join('  ') // 항목 간 간격 추가
                : '대표 메뉴 미등록'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={styles.highlightText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.mainDrinkDtos && store.mainDrinkDtos.length > 0
                ? store.mainDrinkDtos
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
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  storeInfo: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 18,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  backimage: {
    width: 100,
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
    lineHeight: 22,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    maxWidth: '80%',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#555',
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  infoItem: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginRight: 8,
    maxWidth: '100%',
  },
  storeCloseTime: {
    fontSize: 14,
    color: '#666',
  },
  highlightText: {
    marginRight: 8,
    fontWeight: 'bold',
    color: '#16BBFF',
  },
});

export default LikedItem;
