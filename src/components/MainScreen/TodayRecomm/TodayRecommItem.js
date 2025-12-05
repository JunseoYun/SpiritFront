import React from 'react';
import {View, StyleSheet, Text, Pressable, PixelRatio} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../context/ToastContext';
import CustomText from '../../../utils/CustomText';

let fontScale = PixelRatio.getFontScale(); // let으로 변경
if (fontScale >= 1.7) fontScale = 1.7;

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
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        store.mainImgUrl && {
          borderWidth: 0.3,
          borderRadius: 10,
          borderColor: '#E5E5E5',
        },
      ]}>
      <FastImage
        style={styles.imageBackground}
        source={
          store.mainImgUrl
            ? {uri: store.mainImgUrl, priority: FastImage.priority.normal}
            : require('../../../assets/default_store6.png')
        }
        resizeMode={FastImage.resizeMode.cover}>
        {/* 오버레이 컨테이너 */}
        <View style={styles.overlay}>
          {/* ✅ 상단 그라데이션 */}
          <LinearGradient
            colors={
              store.mainImgUrl
                ? ['rgba(0, 0, 0, 0.5)', 'transparent']
                : ['rgba(0, 0, 0, 0.3)', 'transparent']
            } // 위쪽은 어두움 → 아래쪽은 투명
            style={styles.gradientTop}
            pointerEvents="none"
          />

          {/* 가게 이름 */}
          <View style={styles.storeContainer}>
            {store.isCertified && (
              <FastImage
                source={require('../../../assets/verifyMaker.png')}
                style={[
                  styles.imageStyle,
                  fontScale >= 1.5 && {width: 30, height: 30},
                ]}
              />
            )}
            <CustomText
              style={[styles.storeName]}
              numberOfLines={3}
              ellipsizeMode="tail">
              {store.name}
            </CustomText>
          </View>
        </View>

        {/* 메뉴 정보 */}
        <View style={styles.drinkView}>
          {store.mainDrinkDtos?.map((drink, index) => {
            const baseColor = drinkColors[drink.type] || '#333';
            const borderColor = hexToRGBA(baseColor, 0.5); // 살짝 연한 컬러

            // 마지막 item 체크, 3개일 때만 ellipsis 적용
            const isLast =
              store.mainDrinkDtos.length === 3 &&
              index === store.mainDrinkDtos.length - 1;

            return (
              <React.Fragment key={index}>
                <CustomText
                  {...(isLast ? {numberOfLines: 1, ellipsizeMode: 'tail'} : {})}
                  style={[
                    styles.drinkText,
                    {color: baseColor, backgroundColor: 'rgba(0,0,0,0.40)'},
                    isLast && {flexShrink: 1}, // 남은 공간 차지
                  ]}>
                  {translateAlcohol(drink.type)}
                  {drink.price ? ` ${drink.price}` : ''}
                </CustomText>
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

    borderRadius: 10,
  },
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    position: 'relative', // 기준 위치
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 115, // 그라데이션 높이
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    zIndex: 1,
  },
  storeContainer: {
    flexDirection: 'row',
    zIndex: 2, // 텍스트를 그라데이션 위로
    marginLeft: 10,
    marginTop: 5,
  },
  imageStyle: {
    alignSelf: 'center',
    width: 20,
    height: 20,
    marginRight: 5,
  },
  storeName: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Pretendard-Bold',
  },
  drinkView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 10,
  },
  drinkText: {
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    padding: 4,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 12,
  },
  division: {
    height: 12,
    width: 1.5,
    marginHorizontal: 2,
  },
});

export default React.memo(TodayRecommItem);
