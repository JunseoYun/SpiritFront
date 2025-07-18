import {navigationRef} from '../../navigation/NavigationService';
import {getGlobalShowToast} from '../../context/ToastContext';
import {setGlobalPendingStoreId} from '../../context/DeepLinkContext';
import {getGlobalToken} from '../../context/AuthContext';

export const handleUrl = ({url}) => {
  const showToast = getGlobalShowToast();
  const token = getGlobalToken();

  const safeShowToast = (msg, pos = 'center') => {
    if (showToast) {
      showToast(msg, pos);
    } else {
      setTimeout(() => {
        const fallbackToast = getGlobalShowToast();
        fallbackToast?.(msg, pos);
      }, 300);
    }
  };

  if (!url || !navigationRef.isReady()) {
    return;
  }

  try {
    if (url.startsWith('https://dev.team-spirit.click/link/store/')) {
      const parts = url.split('/');
      const storeId = parts[parts.length - 1];

      if (!storeId) {
        return;
      }

      if (!token) {
        safeShowToast('로그인이 필요합니다');
        setGlobalPendingStoreId(storeId); // ✅ 전역 함수 사용
        return;
      }

      navigationRef.reset({
        index: 1,
        routes: [
          {
            name: 'MainBtmbar',
            state: {
              routes: [{name: 'MainScreen'}], // 👈 반드시 초기 탭 명시
            },
          },
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
    } else {
      safeShowToast('URL 경로가 예상과 다름');
    }
  } catch (error) {
    safeShowToast('URL 처리 실패');
  }
};
