// src/hooks/useHandlePendingNotification.js
import {useEffect} from 'react';
import {navigate, resetTo} from '../../navigation/NavigationService';
import {navigationRef} from '../../navigation/NavigationService';
import {NotifiRead} from '../../api/notificationApi';
import {ReviewgetbyGet} from '../../api/reviewApi';
import {PostGetById} from '../../api/postApi';

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
          redirectType === 'POST_DETAIL' &&
          notificationType === 'STORE_TAG_POST_CREATED'
        ) {
          const body = pendingNotification?.body || '';
          let storename = '';

          const match = body.match(/(.+?) 매장에/);
          if (match) {
            storename = match[1];
          }
          try {
            const response = await PostGetById(redirectId);

            navigate('PostDetailScreen', {
              postId: response.id,
              item: response,
            });
          } catch (er) {
            console.log(er);
          }
        }
        if (
          redirectType === 'STORE_DETAIL' &&
          notificationType === 'STORE_OWNERSHIP_APPROVED'
        ) {
          resetTo({
            index: 0, // 최상단 활성 스택
            routes: [
              {
                name: 'MainBtmbar', // 최상위 BottomTab
                state: {
                  index: 0, // MyStack 탭을 선택
                  routes: [
                    {
                      name: 'MyStack', // MyStack 안으로
                      state: {
                        index: 0,
                        routes: [
                          {
                            name: 'MyScreen', // 최종 화면
                            params: {invitationManager: true},
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
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
