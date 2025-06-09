// src/hooks/useHandlePendingNotification.js
import {useEffect} from 'react';
import {navigate} from '../../navigation/NavigationService';
import {navigationRef} from '../../navigation/NavigationService';
import {NotifiRead} from '../../api/notificationApi';

const useHandlePendingNotification = (
  loading,
  pendingNotification,
  clearNotification,
  showRejectModal,
) => {
  const NotificationRead = async notificationId => {
    try {
      await NotifiRead(notificationId);
    } catch (err) {
      console.log('읽기 실패');
    }
  };
  useEffect(() => {
    if (!loading && pendingNotification) {
      console.log('🔵 로딩 끝! 알림 클릭 데이터 처리 중...');

      const {redirectType, notificationType, redirectId, notificationId} =
        pendingNotification;

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
      NotificationRead(notificationId);
      clearNotification();
    }
  }, [loading, pendingNotification, clearNotification, showRejectModal]);
};

export default useHandlePendingNotification;
