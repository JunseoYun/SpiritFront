// src/hooks/useHandlePendingNotification.js
import {useEffect} from 'react';
import {navigate} from '../../navigation/NavigationService';
import {navigationRef} from '../../navigation/NavigationService';
import {NotifiRead} from '../../api/notificationApi';
import {ReviewgetbyGet} from '../../api/reviewApi';

const useHandlePendingNotification = (
  loading,
  pendingNotification,
  clearNotification,
  showRejectModal,
) => {
  function extractStoreName(body) {
    const match = body.match(/(.+?)\s*매장/);
    return match ? match[1] : null;
  }
  const NotificationRead = async notificationId => {
    try {
      await NotifiRead(notificationId);
    } catch (err) {}
  };
  useEffect(() => {
    if (!loading && pendingNotification) {
      const handleNotification = async () => {
        const {
          redirectType,
          notificationType,
          redirectId,
          notificationId,
          body,
        } = pendingNotification;

        if (
          redirectType === 'REVIEW_DETAIL' &&
          notificationType === 'STORE_REVIEW_CREATED'
        ) {
          const body = pendingNotification?.body || '';
          let storename = '';

          const match = body.match(/(.+?) 매장에/);
          if (match) {
            storename = match[1];
          }
          try {
            const response = await ReviewgetbyGet(redirectId);
            navigate('StoreStack', {
              screen: 'StoreReviewScreen',
              params: {storeId: response.storeId, storename, isOwner: true},
            });
          } catch (er) {
            console.log(er);
          }
        }
        if (
          redirectType === 'STORE_DETAIL' &&
          notificationType === 'STORE_OWNERSHIP_APPROVED'
        ) {
          navigate('MyStack', {
            screen: 'MyScreen',
            params: {invitationManager: true},
          });
        } else if (
          notificationType === 'STORE_OWNERSHIP_REJECTED' &&
          redirectType === 'OWNERSHIP_REJECTION'
        ) {
          navigate('MainBtmbar');
          if (typeof showRejectModal === 'function') {
            showRejectModal(pendingNotification);
          }
        } else if (
          notificationType === 'STORE_OWNER_CHANGED' &&
          redirectType === 'STORE_MANAGER_LIST'
        ) {
          navigate('StoreStack', {
            screen: 'StoreManagerScreen',
            params: {
              storeId: redirectId,
              storename: extractStoreName(body),
            },
          });
        } else if (
          notificationType === 'STORE_MANAGER_INVITE_ACCEPTED' &&
          redirectType === 'STORE_MANAGER_LIST'
        ) {
          navigate('StoreStack', {
            screen: 'StoreManagerScreen',
            params: {
              storeId: redirectId,
              storename: extractStoreName(body),
            },
          });
        }

        await NotificationRead(notificationId);
        clearNotification();
      };

      handleNotification();
    }
  }, [loading, pendingNotification, clearNotification, showRejectModal]);
};

export default useHandlePendingNotification;
