import React from 'react';
import {View, StyleSheet, Text, Pressable} from 'react-native';
import FastImage from 'react-native-fast-image';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../context/ToastContext';
const drinkColors = {
  SOJU: '#9BE7C5', // 민트 그린
  BEER: '#FFE08A', // 라이트 앰버
  MAKGEOLLI: '#CFD8DC', // 소프트 블루그레이
  WINE: '#F28CA6', // 로지 핑크
  COCKTAIL: '#FFB199', // 코랄 오렌지
  SAKE: '#B7CADB', // 페일 슬레이트 블루
  KAOLIANG: '#E2C8B0', // 라이트 모카
  WHISKEY: '#E5B887', // 라이트 캐러멜
  VODKA: '#B6C6FF', // 페리윙클
  TRADITIONAL: '#F5E1A4', // 라이트 오커
  RUM: '#D9B89E', // 샌디 브라운
  HIGHBALL: '#A9F0E2', // 파스텔 틸
  TEQUILA: '#FFD2A1', // 피치 오렌지
};

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
const TodayRecommItem = ({store, navigation}) => {
  const {translateAlcohol} = useTranslateAlcohol();

  const {token} = useAuth();
  const {showToast} = useToast();
  const handlePress = () => {
    if (!token) {
      showToast('로그인 후 이용할 수 있어요!', 'center');
      return;
    }

    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId: store.id},
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <FastImage
        style={styles.imageBackground}
        source={
          store.mainImgUrl
            ? {uri: store.mainImgUrl, priority: FastImage.priority.normal}
            : require('../../../assets/default_store.png')
        }
        resizeMode={FastImage.resizeMode.cover}>
        <View style={styles.overlay}>
          <View style={styles.storeContainer}>
            {store.isCertified && (
              <FastImage
                source={require('../../../assets/verifyMaker.png')}
                style={styles.imageStyle}
              />
            )}
            <Text
              style={[
                styles.storeName,
                !store.mainImgUrl && {color: '#696E6F'},
              ]}
              numberOfLines={3}
              ellipsizeMode="tail">
              {store.name}
            </Text>
          </View>
        </View>
        <View style={styles.drinkView}>
          {store.mainDrinkDtos?.map((drink, index) => {
            const baseColor = drinkColors[drink.type] || '#333';
            const borderColor = hexToRGBA(baseColor, 0.5); // 살짝 연한 컬러
            return (
              <React.Fragment key={index}>
                <Text
                  style={[
                    styles.drinkText,
                    {color: baseColor, backgroundColor: 'rgba(0,0,0,0.40)'},
                  ]}>
                  {translateAlcohol(drink.type)} {drink.price}
                </Text>
                {index !== store.mainDrinkDtos.length - 1 && (
                  <View style={styles.division} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </FastImage>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 230,
    marginVertical: 10,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
  },

  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    position: 'relative', // 🔹 기준 위치로 사용
  },
  storeContainer: {
    flexDirection: 'row',
  },
  imageStyle: {
    alignSelf: 'center',
    width: 20,
    height: 20,
    marginRight: 5,
  },
  storeNameView: {
    backgroundColor: '#333',
  },
  storeName: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    lineHeight: 26,
    marginTop: 3,
  },
  likeView: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',

    padding: 7,
    borderRadius: 30,
  },
  likeIcon: {
    alignSelf: 'flex-end',
  },
  drinkView: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 12,
  },
  drinkText: {
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,

    padding: 4,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  division: {
    height: 12,
    width: 1.5,

    marginHorizontal: 2,
  },
});

export default React.memo(TodayRecommItem);
