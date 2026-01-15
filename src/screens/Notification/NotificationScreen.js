import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NotifiGet, NotifiRead, NotifiReadAll} from '../../api/notificationApi';
import Loading from '../../hooks/Loading';
import RejectModal from '../../components/Reject/RejectModal';
import {useToast} from '../../context/ToastContext';
import {has_unread_notification} from '../../api/notificationApi';
import CustomText from '../../utils/CustomText';
import {PostGetById} from '../../api/postApi';
import {CommentGetById} from '../../api/commentApi';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import formatRelativeTime from '../../utils/formatRelativeTime';
import ColorUtil from '../../utils/ColorUtil';
import HeartIcon from '../../assets/svg/HeartIcon';

const avatarNotificationTypes = [
  'COMMENT_LIKED',
  'POST_LIKED',
  'REPLY_COMMENT_CREATED',
  'ROOT_COMMENT_CREATED',
];
const storeNotificationTypes = [
  'STORE_SUGGESTION_CREATED',
  'STORE_OWNERSHIP_REQUESTED',
  'STORE_OWNERSHIP_REQUEST_CREATED',
  'STORE_OWNERSHIP_REJECTED',
  'STORE_OWNERSHIP_APPROVED',
  'STORE_OWNER_CHANGED',
  'STORE_MANAGER_INVITE_ACCEPTED',
  'STORE_TAG_POST_CREATED',
];
const reportNotificationTypes = ['REPORT_RECEIVED'];

const defaultProfile = require('../../assets/default_profile.png');
const defaultStore = require('../../assets/default_store6.png');

const NotificationScreen = ({navigation}) => {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [totalpage, setTotalpage] = useState(0);
  const [notifidata, setNotifidata] = useState([]);
  const [selectedReject, setSelectedReject] = useState(null);
  const [hasReadmodal, setHasReadmodal] = useState(false);
  const [clickedItemId, setClickedItemId] = useState(null);
  const [unreadNotification, setUnreadNotification] = useState(false);
  const {showToast} = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setNotifidata([]); // 기존 데이터 초기화
    setPage(0);
    setIsEnd(false);
    Notifigetall(0);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      setLoading(true);
      try {
        const unread = await has_unread_notification();
        setUnreadNotification(unread.hasUnread);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUnread();
  }, []);

  const Notifigetall = async page => {
    setLoading(true);
    try {
      const data = await NotifiGet(page);
      setTotalpage(data.totalPages);
      if (data.content.length === 0) {
        setIsEnd(true); // 더 이상 데이터가 없으면
      } else {
        // 기존 데이터와 병합하고 중복 제거
        setNotifidata(prev => {
          const merged = [...prev, ...data.content];
          return Array.from(new Map(merged.map(v => [v.id, v])).values());
        });
      }
    } catch (error) {
      console.log('알림 불러오기 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setNotifidata([]);
    setIsEnd(false);
    setPage(0);
    setRefreshing(true);
    Notifigetall(0);
  };

  const NotificationRead = async notificationId => {
    setLoading(true);
    try {
      await NotifiRead(notificationId);
      setNotifidata(prev =>
        prev.map(n => (n.id === notificationId ? {...n, hasRead: true} : n)),
      );
      setUnreadNotification(prev => {
        const stillUnread = notifidata.some(
          n => n.id !== notificationId && !n.hasRead,
        );
        return stillUnread;
      });
    } catch (err) {
      console.log('읽기 실패');
    } finally {
      setLoading(false);
    }
  };

  const readallnotifi = async () => {
    try {
      setLoading(true);
      await NotifiReadAll();
      // Optimistically update UI: mark all as read and disable the button
      setNotifidata(prev => prev.map(n => ({...n, hasRead: true})));
      setUnreadNotification(false);
    } catch (err) {
      showToast('다시 시도해 주세요.', 'center');
    } finally {
      setLoading(false);
      // Optionally refresh to ensure server state, but button already disabled
      handleRefresh();
    }
  };
  function extractStoreName(body) {
    const match = body.match(/(.+?)\s*매장/);
    return match ? match[1] : null;
  }

  const renderNotificationContent = item => {
    const textColor = item.hasRead ? styles.readText : styles.unreadText;
    const isAvatarNotification = avatarNotificationTypes.includes(
      item.notificationType,
    );
    const isStoreNotification = storeNotificationTypes.includes(
      item.notificationType,
    );
    const isReportNotification = reportNotificationTypes.includes(
      item.notificationType,
    );

    const hasAvatar =
      isAvatarNotification || isStoreNotification || isReportNotification;
    const showHeartBadge =
      item.notificationType === 'COMMENT_LIKED' ||
      item.notificationType === 'POST_LIKED';

    const avatarSource =
      isStoreNotification || isReportNotification
        ? defaultStore
        : item.imageUrl && item.imageUrl.length > 0
        ? {uri: item.imageUrl}
        : defaultProfile;

    const inlineText = (
      <View style={styles.inlineContent}>
        <CustomText style={[styles.bodyText, textColor]}>
          {item.body}
          <CustomText style={styles.dateInline}>
            {'  '}
            {formatRelativeTime(item.createdAt, new Date(), false)}
          </CustomText>
        </CustomText>
      </View>
    );

    if (!hasAvatar) {
      return inlineText;
    }

    return (
      <View style={styles.itemRow}>
        <View style={styles.avatarWrap}>
          {isReportNotification ? (
            <View
              style={[styles.avatar, styles.iconAvatar, styles.reportIconWrap]}>
              <MaterialIcons
                name="report-gmailerrorred"
                size={24}
                color="#222"
              />
            </View>
          ) : (
            <Image source={avatarSource} style={styles.avatar} />
          )}
          {showHeartBadge && (
            <View style={styles.heartBadge}>
              <HeartIcon size={12} color="#fff" filled />
            </View>
          )}
        </View>
        {inlineText}
      </View>
    );
  };

  return (
    <View style={[styles.container]}>
      <FlatList
        data={notifidata}
        keyExtractor={item => item.id.toString()}
        initialNumToRender={20}
        maxToRenderPerBatch={5} // 한번에 추가 로드할 개수
        windowSize={5} // 화면 밖의 높이를 얼마나 유지할지
        removeClippedSubviews={Platform.OS === 'android'}
        renderItem={({item}) => (
          <Pressable
            onPress={() => {
              if (clickedItemId) return; // 이미 클릭 중이면 무시
              setClickedItemId(item.id); // 클릭 시작

              const handlePress = async () => {
                if (!item.hasRead) {
                  await NotificationRead(item.id);
                }

                if (item.notificationType === 'REPORT_RECEIVED') {
                  setClickedItemId(null);
                  return;
                }

                if (item.notificationType === 'STORE_OWNERSHIP_REJECTED') {
                  setSelectedReject(item);
                  if (!item.hasRead) {
                    setHasReadmodal(true);
                  }
                }

                if (item.notificationType === 'STORE_OWNERSHIP_APPROVED') {
                  navigation.reset({
                    index: 0, // 최상단으로 선택
                    routes: [
                      {
                        name: 'MainBtmbar', // 최상단 BottomTab
                        state: {
                          index: 0, // MyStack 탭을 선택
                          routes: [
                            {
                              name: 'MyStack', // MyStack 으로
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
                }

                if (
                  item.notificationType === 'STORE_OWNER_CHANGED' ||
                  item.notificationType === 'STORE_MANAGER_INVITE_ACCEPTED'
                ) {
                  navigation.navigate('StoreStack', {
                    screen: 'StoreManagerScreen',
                    params: {
                      storeId: item.redirectId,
                      storename: extractStoreName(item.body),
                    },
                  });
                }
                if (item.notificationType === 'STORE_TAG_POST_CREATED') {
                  const body = item.body || '';
                  let storename = '';
                  const match = body.match(/(.+?) 매장?/);
                  if (match) storename = match[1];

                  try {
                    const response = await PostGetById(item.redirectId);
                    navigation.navigate('PostDetailScreen', {
                      postId: response.id,
                      item: response,
                    });
                  } catch (er) {
                    console.log(er);
                  }
                }
                if (
                  (item.notificationType === 'COMMENT_LIKED' ||
                    item.notificationType === 'REPLY_COMMENT_CREATED') &&
                  item.redirectType === 'COMMENT_DETAIL'
                ) {
                  try {
                    const comment = await CommentGetById(item.redirectId);
                    navigation.navigate('PostDetailScreen', {
                      postId: comment?.postId,
                      rootCommentId: comment?.rootCommentId,
                      rootCommentOrderIndex: comment?.rootCommentOrderIndex,
                      replyCommentOrderIndex: comment?.replyCommentOrderIndex,
                      openCommentSheet: true,
                      scrollToCommentId: comment?.id ?? item.redirectId,
                    });
                  } catch (er) {
                    console.log(er);
                  }
                }
                if (
                  item.notificationType === 'POST_LIKED' &&
                  item.redirectType === 'POST_DETAIL'
                ) {
                  const targetPostId = item.redirectId ?? item.targetId;
                  if (targetPostId) {
                    try {
                      const response = await PostGetById(targetPostId);
                      navigation.navigate('PostDetailScreen', {
                        postId: response.id,
                        item: response,
                      });
                    } catch (er) {
                      console.log(er);
                    }
                  }
                }
                if (
                  item.notificationType === 'ROOT_COMMENT_CREATED' &&
                  item.redirectType === 'POST_COMMENT_RECENT_LIST'
                ) {
                  const targetPostId = item.redirectId ?? item.targetId;
                  if (targetPostId) {
                    try {
                      const response = await PostGetById(targetPostId);
                      navigation.navigate('PostDetailScreen', {
                        postId: response.id,
                        item: response,
                        openCommentSheet: true,
                      });
                    } catch (er) {
                      console.log(er);
                    }
                  }
                }
                setClickedItemId(null);
              };

              handlePress();
            }}>
            <View style={styles.itemContainer}>
              {renderNotificationContent(item)}
            </View>
          </Pressable>
        )}
        onEndReached={() => {
          if (!loading && !isEnd && page < totalpage - 1) {
            setPage(prevPage => {
              const nextPage = prevPage + 1; // 다음 페이지 번호
              Notifigetall(nextPage); // 해당 페이지 데이터 요청
              return nextPage; // 상태값으로 페이지 번호 갱신
            });
          }
        }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: insets.bottom},
        ]}
        ListEmptyComponent={
          !loading && notifidata.length === 0 ? (
            <View style={styles.footer}>
              <CustomText style={styles.emptyText}>알림이 없습니다.</CustomText>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <Pressable
            disabled={!unreadNotification || loading}
            onPress={unreadNotification && !loading ? readallnotifi : null}>
            <CustomText style={styles.allReadText}>알림 전체 읽기</CustomText>
          </Pressable>
        }
      />
      {selectedReject && (
        <RejectModal
          data={selectedReject}
          onClose={() => {
            setSelectedReject(null);
            if (hasReadmodal == true) {
              handleRefresh();
              setHasReadmodal(false);
            }
          }}
        />
      )}
      <Loading loading={refreshing || loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  itemContainer: {
    paddingVertical: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  bodyText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#222',
    flexShrink: 1,
  },
  dateInline: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#8c8c8c',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f1f1',
    borderColor: ColorUtil.border,
    borderWidth: 0.5,
  },
  iconAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportIconWrap: {
    backgroundColor: '#fff',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  heartBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: '#FF5E5E',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff',
    borderWidth: 2,
  },
  allReadText: {
    paddingBottom: 16,
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#121212',
    textAlign: 'right',
  },
  readText: {
    color: '#aaa',
  },
  unreadText: {
    color: '#222',
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 60,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default NotificationScreen;
