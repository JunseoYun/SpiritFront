import React, {useEffect, useState} from 'react';
import {View, Platform, useWindowDimensions} from 'react-native';
import Config from 'react-native-config';
import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import {useAdConsent} from '../../context/AdConsentContext';

const searchBannerId =
  Platform.OS === 'android'
    ? Config.GOOGLE_ADS_SEARCH_ID
    : Config.GOOGLE_ADS_SEARCH_ID_IOS;

const mainBannerId =
  Platform.OS === 'android'
    ? Config.GOOGLE_ADS_MAIN_ID
    : Config.GOOGLE_ADS_MAIN_ID_IOS;

const likeBannerId =
  Platform.OS === 'android'
    ? Config.GOOGLE_ADS_LIKESCREEN_ID
    : Config.GOOGLE_ADS_LIKESCREEN_ID_IOS;

export default function MyBanner({index}) {
  const {width} = useWindowDimensions();
  const {npa} = useAdConsent();
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  let prodUnitId = mainBannerId; // 기본값
  if (index === 'search') {
    prodUnitId = searchBannerId;
  } else if (index === 'like') {
    prodUnitId = likeBannerId;
  }

  const adUnitId = __DEV__ ? TestIds.BANNER : prodUnitId;

  const handleRetry = () => {
    setLoaded(false);
    setReloadKey(prev => prev + 1); // key 변경 → BannerAd 재마운트
  };

  return (
    <View style={{width, alignSelf: 'center', marginTop: 10}}>
      {!loaded && index === 'main' && (
        <View
          style={{
            width: '100%',
            height: 10,
            backgroundColor: '#F5F5F5',
            marginTop: 5,
          }}
        />
      )}
      <BannerAd
        key={reloadKey} // key 변경 시 새로 마운트됨
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{requestNonPersonalizedAdsOnly: false}}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => handleRetry()} // 실패하면 다시 마운트
      />
    </View>
  );
}
