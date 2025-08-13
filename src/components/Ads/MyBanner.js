import React from 'react';
import {View, Platform} from 'react-native';
import Config from 'react-native-config';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';

const adUnitId =
  Platform.OS === 'android'
    ? `${Config.GOOGLE_ADS_ID}`
    : `${Config.GOOGLE_ADS_ID_IOS}`; // ← 배너 단위 ID

export default function MyBanner() {
  return (
    <View style={{alignItems: 'center', marginTop: 10}}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {}}
        onAdFailedToLoad={error => {
          console.error('광고 로드 실패', error);
        }}
      />
    </View>
  );
}
