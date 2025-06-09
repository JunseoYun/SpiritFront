// src/hooks/useHandlePendingNotification.js
import {useEffect} from 'react';
import {navigate} from '../../navigation/NavigationService';
import {navigationRef} from '../../navigation/NavigationService';

const useHandlePendingNotification = (
  loading,
  pendingNotification,
  clearNotification,
  showRejectModal,
) => {
  useEffect(() => {
    if (!loading && pendingNotification) {
      console.log('🔵 로딩 끝! 알림 클릭 데이터 처리 중...');

      const {redirectType, notificationType, redirectId} = pendingNotification;

      if (
        redirectType === 'STORE_DETAIL' &&
        notificationType === 'STORE_OWNERSHIP_APPROVED'
      ) {
        navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {storeId: redirectId},
        });
      } else if (
        notificationType === 'STORE_OWNERSHIP_REJECTED' &&
        redirectType === 'OWNERSHIP_REJECTION'
      ) {
        navigate('MainBtmbar');
        if (typeof showRejectModal === 'function') {
          showRejectModal(pendingNotification);
        }
      }

      clearNotification();
    }
  }, [loading, pendingNotification, clearNotification, showRejectModal]);
};

export default useHandlePendingNotification;
