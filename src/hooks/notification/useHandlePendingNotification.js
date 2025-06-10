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
    } catch (err) {}
  };
  useEffect(() => {
    if (!loading && pendingNotification) {
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
