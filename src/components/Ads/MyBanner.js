import React, {useState} from 'react';
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

export default function MyBanner({onAdLoaded, index}) {
  const {width} = useWindowDimensions();
  const {npa} = useAdConsent();
  const [loaded, setLoaded] = useState(false);

  let prodUnitId = mainBannerId; // 기본값
  if (index === 'search') prodUnitId = searchBannerId;

  const adUnitId = __DEV__ ? TestIds.BANNER : prodUnitId;

  return (
    <View style={{width, alignSelf: 'center', marginTop: 10}}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{requestNonPersonalizedAdsOnly: npa}}
        onAdLoaded={() => {
          setLoaded(true);
          onAdLoaded && onAdLoaded(true);
        }}
        onAdFailedToLoad={e => {
          console.error('광고 로드 실패', e);
          onAdLoaded && onAdLoaded(false);
        }}
      />
    </View>
  );
}
