// src/hooks/useHandlePendingNotification.js
import {useEffect} from 'react';
import {navigate} from '../../navigation/NavigationService';

const useHandlePendingNotification = (
  loading,
  pendingNotification,
  clearNotification,
) => {
  useEffect(() => {
    if (!loading && pendingNotification) {
      console.log('🔵 로딩 끝! 알림 클릭 데이터 처리 중...');
      if (
        pendingNotification.redirectType === 'STORE_DETAIL' &&
        pendingNotification.notificationType === 'STORE_OWNERSHIP_APPROVED'
      ) {
        navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {storeId: pendingNotification.redirectId},
        });
      }
      clearNotification();
    }
  }, [loading, pendingNotification, clearNotification]);
};

export default useHandlePendingNotification;
