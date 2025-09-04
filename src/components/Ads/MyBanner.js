import React, {useEffect} from 'react';
import {View, Platform, useWindowDimensions} from 'react-native';
import Config from 'react-native-config';
import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import {useAdConsent} from '../../context/AdConsentContext';

const prodUnitId =
  Platform.OS === 'android'
    ? `${Config.GOOGLE_ADS_ID}`
    : `${Config.GOOGLE_ADS_ID_IOS}`;

export default function MyBanner({}) {
  const {width} = useWindowDimensions();
  const {npa} = useAdConsent();
  const adUnitId = __DEV__ ? TestIds.BANNER : prodUnitId;

  return (
    <View style={{width, alignSelf: 'center', marginTop: 10}}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: npa, // 기본은 false
        }}
        onAdLoaded={() => {}}
        onAdFailedToLoad={e => {
          console.error('광고 로드 실패', e);
        }}
      />
    </View>
  );
}
