// 앱링크 stoermain 가는 예시 코드드

import {useEffect} from 'react';
import {Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const AppLinkHandler = () => {
  const navigation = useNavigation();

  const handleUrl = url => {
    if (!url) return;

    const match = url.match(/\/link\/store\/(\d+)/);
    if (match && match[1]) {
      const storeId = match[1];

      navigation.reset({
        index: 1,
        routes: [
          {name: 'MainBtmbar'},
          {
            name: 'StoreStack',
            state: {
              routes: [
                {
                  name: 'StoreMainScreen',
                  params: {storeId: storeId},
                },
              ],
            },
          },
        ],
      });
    }
  };

  useEffect(() => {
    // cold start
    Linking.getInitialURL().then(handleUrl);

    // background/runtime
    const sub = Linking.addEventListener('url', ({url}) => {
      handleUrl(url);
    });

    return () => {
      sub.remove();
    };
  }, []);
};

export default AppLinkHandler;
