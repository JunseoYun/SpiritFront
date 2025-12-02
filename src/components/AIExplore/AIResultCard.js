import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import CustomText from '../../utils/CustomText';
import useDistance from '../../hooks/useDistance';
import useStoreStatus from '../../hooks/useStoreStatus';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';

const AIResultCard = ({store, navigation, userLocation}) => {
  const calculateDistance = useDistance();
  const {translateCategory} = useCategoryTranslation();
  const {isOpen, isBreak, closed, nextclosed, starttime, endtime, breakend} =
    useStoreStatus(store?.operationInfoDtos, store?.isAlwaysOpen);
  const [distanceText, setDistanceText] = useState(null);

  useEffect(() => {
    if (!userLocation) {
      return;
    }
    const storeLocation = store?.locationDto;
    if (!storeLocation) {
      return;
    }

    const km = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      storeLocation.latitude,
      storeLocation.longitude,
    );
    if (!Number.isFinite(km)) {
      return;
    }
    setDistanceText(
      km < 1 ? `${(km * 1000).toFixed(0)}m` : `${km.toFixed(1)}km`,
    );
  }, [userLocation, store, calculateDistance]);

  let timeLabel = '정보 없음';
  if (store?.isAlwaysOpen) {
    timeLabel = '24시간';
  } else if (isOpen && isBreak && breakend) {
    timeLabel = `브레이크 ~ ${breakend}`;
  } else if (!isOpen && nextclosed) {
    timeLabel = '영업 종료 · 익일 휴무';
  } else if (!isOpen && closed) {
    timeLabel = '금일 휴무';
  } else if (!isOpen && starttime) {
    timeLabel = `${starttime} 오픈`;
  } else if (endtime) {
    timeLabel = `${endtime} 종료`;
  }

  const categories = store?.categories.map(category =>
    translateCategory(category),
  );
  const storeId = store?.id;

  const handlePress = () => {
    if (!storeId) {
      return;
    }
    const storeLocation = store?.locationDto;
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {
        storeId,
        innerlatitude: storeLocation?.latitude,
        innerlongitude: storeLocation?.longitude,
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!storeId}
      style={styles.resultCard}
      android_ripple={{color: 'rgba(0,0,0,0.05)', borderless: false}}>
      <FastImage
        source={
          store?.mainImgUrl
            ? {uri: store?.mainImgUrl}
            : require('../../assets/default_store.png')
        }
        style={styles.resultImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <CustomText style={styles.resultName} numberOfLines={1}>
        {store?.name}
      </CustomText>
      {!!categories.length && (
        <CustomText style={styles.resultCategory} numberOfLines={1}>
          {categories.join(' · ')}
        </CustomText>
      )}
      <View style={styles.resultMetaRow}>
        <CustomText style={styles.resultMeta} numberOfLines={1}>
          {timeLabel}
        </CustomText>
        {distanceText && (
          <CustomText style={[styles.resultMeta, styles.resultMetaDim]}>
            {distanceText}
          </CustomText>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  resultCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#eef1f5',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  resultImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
  },
  resultName: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Pretendard-Bold',
  },
  resultCategory: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7684',
    fontFamily: 'Pretendard-Regular',
  },
  resultMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  resultMeta: {
    fontSize: 13,
    color: '#222',
    fontFamily: 'Pretendard-Regular',
  },
  resultMetaDim: {
    color: '#6b7684',
  },
});

export default AIResultCard;
