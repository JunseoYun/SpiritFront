// AdConsentContext.js
import React, {createContext, useContext, useState, useEffect} from 'react';
import mobileAds from 'react-native-google-mobile-ads';
import {AdsConsent} from 'react-native-google-mobile-ads/consent';
import {Platform} from 'react-native';

const AdConsentContext = createContext({npa: false});

export const AdConsentProvider = ({children}) => {
  const [npa, setNpa] = useState(false);

  useEffect(() => {
    const init = async () => {
      await mobileAds().initialize();

      if (Platform.OS === 'ios') {
        try {
          await AdsConsent.requestInfoUpdate();
          const canUsePersonalized = await AdsConsent.canRequestAds();
          setNpa(!canUsePersonalized); // 동의 O → false, 동의 X → true
        } catch {
          setNpa(true);
        }
      }
    };
    init();
  }, []);

  return (
    <AdConsentContext.Provider value={{npa}}>
      {children}
    </AdConsentContext.Provider>
  );
};

export const useAdConsent = () => useContext(AdConsentContext);
