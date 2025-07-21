import {navigationRef} from '../../navigation/NavigationService';
import {getGlobalShowToast} from '../../context/ToastContext';
import {
  setGlobalPendingStoreId,
  getGlobalPendingStoreId,
} from '../../context/DeepLinkContext';
import {getGlobalToken} from '../../context/AuthContext';

export const handleUrl = ({url}) => {
  const showToast = getGlobalShowToast();
  const token = getGlobalToken();

  const safeShowToast = (msg, pos = 'center') => {
    if (showToast) {
      showToast(msg, pos);
    } else {
      setTimeout(() => {
        getGlobalShowToast()?.(msg, pos);
      }, 300);
    }
  };

  if (!url) return;

  try {
    // 🔗 store 링크 판별
    if (
      url.startsWith('https://dev.team-spirit.click/link/store/') ||
      url.startsWith('https://dev.team-spirit.click/ul/store/') ||
      url.startsWith('spirit://store/')
    ) {
      const parts = url.split('/');
      const storeId = parts[parts.length - 1];

      if (!storeId) {
        safeShowToast('유효하지 않은 링크입니다.');
        return;
      }

      // 🔥 이미 앱이 켜져 있고, 토큰도 있다면 바로 이동
      if (token && navigationRef.isReady()) {
        const currentRoute = navigationRef.getCurrentRoute();
        if (
          currentRoute?.name === 'StoreMainScreen' &&
          currentRoute?.params?.storeId === storeId
        ) {
          return;
        }
        navigationRef.reset({
          index: 1,
          routes: [
            {name: 'MainBtmbar', state: {routes: [{name: 'MainScreen'}]}},
            {
              name: 'StoreStack',
              state: {
                routes: [{name: 'StoreMainScreen', params: {storeId}}],
              },
            },
          ],
        });
        return;
      }

      // 🔥 아직 로그인 안 됐으면 pending 으로 저장
      if (!token) {
        safeShowToast('로그인 후 이용하실 수 있습니다.');
        setGlobalPendingStoreId(storeId);
        return;
      }

      // 🔥 토큰이 있지만 navigation 아직 준비 안 됨(앱 첫 진입) → pending
      setGlobalPendingStoreId(storeId);
    } else {
      safeShowToast('지원하지 않는 링크입니다.');
    }
  } catch (error) {
    console.log('URL 처리 실패', error);
  }
};
