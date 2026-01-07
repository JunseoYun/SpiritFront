import {navigationRef} from '../../navigation/NavigationService';
import {getGlobalShowToast} from '../../context/ToastContext';
import {getGlobalShowStoreInvite} from '../../context/StoreInviteContext';
import {
  setGlobalPendingStoreId,
  setGlobalPendingStoreInviteId,
  setGlobalPendingPostId,
} from '../../context/DeepLinkContext';
import {getGlobalToken} from '../../context/AuthContext';
import Config from 'react-native-config';

export const handleUrl = ({url}) => {
  const showToast = getGlobalShowToast();
  const showStoreInvite = getGlobalShowStoreInvite();
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
      url.includes(`${Config.BASE_URL}/link/store/`) ||
      url.includes(`${Config.BASE_URL}/ul/store/`) ||
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
    } else if (
      url.includes(`${Config.BASE_URL}/link/post/`) ||
      url.includes(`${Config.BASE_URL}/ul/post/`) ||
      url.startsWith('spirit://post/')
    ) {
      const parts = url.split('/');
      const postId = parts[parts.length - 1];

      if (!postId) {
        safeShowToast('유효하지 않은 링크입니다.');
        return;
      }

      if (token && navigationRef.isReady()) {
        const currentRoute = navigationRef.getCurrentRoute();
        if (
          currentRoute?.name === 'PostDetailScreen' &&
          String(currentRoute?.params?.postId) === String(postId)
        ) {
          return;
        }
        navigationRef.reset({
          index: 1,
          routes: [
            {name: 'MainBtmbar', state: {routes: [{name: 'MainScreen'}]}},
            {
              name: 'PostDetailScreen',
              params: {postId},
            },
          ],
        });
        return;
      }

      if (!token) {
        safeShowToast('로그인 후 이용하실 수 있습니다.');
        setGlobalPendingPostId(postId);
        return;
      }

      setGlobalPendingPostId(postId);
    } else if (
      url.includes(`${Config.BASE_URL}/link/store-manager-invite/`) ||
      url.includes(`${Config.BASE_URL}/ul/store-manager-invite/`) ||
      url.startsWith('spirit://store-manager-invite/')
    ) {
      const parts = url.split('/');
      const storeInviteId = parts[parts.length - 1];

      if (!storeInviteId) {
        safeShowToast('유효하지 않은 링크입니다.');
        return;
      }

      if (token) {
        showStoreInvite?.(storeInviteId); // ✅ 로그인 되어 있으면 바로 모달 표시
      } else {
        setGlobalPendingStoreInviteId(storeInviteId); // 🔥 로그인 후 표시될 pending 저장
        safeShowToast('로그인 후 이용해주세요.');
      }

      // 🔥 토큰이 있지만 navigation 아직 준비 안 됨(앱 첫 진입) → pending
      setGlobalPendingStoreInviteId(storeInviteId);
    } else {
      safeShowToast('지원하지 않는 링크입니다.');
    }
  } catch (error) {
    console.log('URL 처리 실패', error);
  }
};
