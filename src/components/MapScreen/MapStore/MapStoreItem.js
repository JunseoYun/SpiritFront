import React from 'react';
import {View, Text, Pressable, StyleSheet, ImageBackground} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../../hooks/useStoreStatus';
const MapStoreItem = ({
  item,
  index,
  selectedStoreIndex,
  setSelectedStore,
  moveCenterMap,
  navigation,
}) => {
  const {isOpen, isBreak, closed, starttime, endtime, breakstart, breakend} =
    useStoreStatus(item?.operationInfoDtos, item?.isAlwaysOpen);

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
      <View style={styles.backimageview}>
        <ImageBackground
          source={
            item.mainImgUrl
              ? {uri: item.mainImgUrl} // ✅ 네트워크 이미지
              : require('../../../assets/default_store.png') // ✅ 로컬 이미지
          }
          style={styles.backimage}
          imageStyle={styles.backimagestyle}>
          {/* ✅ 영업 종료 표시 */}
          {!isOpen && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                영업 종료{'\n'}
                {starttime ? `${starttime} 오픈` : ''}
              </Text>
            </View>
          )}
          {/* ✅ 브레이크 타임 표시 */}
          {isOpen && isBreak && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                브레이크 타임{'\n'}
                {breakend ? `${breakend} 종료` : ''}
              </Text>
            </View>
          )}
        </ImageBackground>
      </View>
      <View style={styles.titletopview}>
        <View>
          <View style={styles.titleview}>
            <Text
              style={styles.storeName}
              numberOfLines={1} // 한 줄로 제한
              ellipsizeMode="tail">
              {item.name}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <FontAwesomeIcon name="star" size={15} color="#FCC104" />
              <Text style={styles.storeAddress}>
                {' '}
                {item.storeRate} ({item.reviewCount})
              </Text>
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
        </View>
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
        <View style={styles.timeview}>
          <Text style={styles.timeviewtext}>
            영업 종료 {endtime || '정보 없음'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  storeInfo: {
    flexDirection: 'row',
    width: 370, // 아이템 너비
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20, // 아이템 간 간격
  },
  backimageview: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12, // ✅ 부모 컨테이너 둥글게
    overflow: 'hidden', // ✅ 넘치는 부분 숨기기
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  backimage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // ✅ 이미지가 꽉 차도록
  },
  backimagestyle: {
    borderRadius: 12, // ✅ borderRadius 적용
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 22,
  },

  titletopview: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
    marginVertical: 3,
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
    color: '#333',
    width: '60%',
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
    alignItems: 'center',
  },
  StoreCategory: {
    fontSize: 14,
    color: '#999',
    marginRight: 5,
    fontWeight: '700',
    marginTop: 2,
  },
  timeview: {
    flexDirection: 'row',
  },
  timeviewtext: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
  },
  menutext: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16BBFF',
  },
});

export default MapStoreItem;
