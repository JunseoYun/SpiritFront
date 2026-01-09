import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import {NotifiGet, NotifiRead, NotifiReadAll} from '../../api/notificationApi';
import Loading from '../../hooks/Loading';
import RejectModal from '../../components/Reject/RejectModal';
import {useToast} from '../../context/ToastContext';
import {ReviewgetbyGet} from '../../api/reviewApi';
import {has_unread_notification} from '../../api/notificationApi';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import CustomText from '../../utils/CustomText';
import {PostGetById} from '../../api/postApi';

const NotificationCard = ({title, message, date, hasRead}) => {
  const textColorStyle = hasRead ? styles.readText : styles.unreadText;

  return (
    <View style={styles.card}>
      <CustomText style={[styles.cardTitle, textColorStyle]}>
        {title}
      </CustomText>
      <CustomText style={[styles.cardMessage, textColorStyle]}>
        {message}
      </CustomText>
      <CustomText style={[styles.cardDate, textColorStyle]}>
        {formatDate(date)}
      </CustomText>
    </View>
  );
};
// 날짜 포맷 함수 (yyyy-mm-dd hh:mm)
const formatDate = iso => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(
    2,
    '0',
  )}:${String(d.getMinutes()).padStart(2, '0')}`;
};

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
  const {bottom} = useSafeAndroidInsets();
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

  return (
    <SafeAreaView style={[styles.container, {paddingBottom: bottom}]}>
      <FlatList
        data={notifidata}
        keyExtractor={item => item.id.toString()}
        initialNumToRender={20}
        maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
        windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
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

                if (item.notificationType === 'STORE_OWNERSHIP_REJECTED') {
                  setSelectedReject(item);
                  if (!item.hasRead) {
                    setHasReadmodal(true);
                  }
                }

                if (item.notificationType === 'STORE_OWNERSHIP_APPROVED') {
                  navigation.reset({
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
                  const match = body.match(/(.+?) 매장에/);
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
                setClickedItemId(null);
              };

              handlePress();
            }}>
            <NotificationCard
              title={item.title}
              message={item.body}
              date={item.createdAt}
              hasRead={item.hasRead}
            />
          </Pressable>
        )}
        onEndReached={() => {
          if (!loading && !isEnd && page < totalpage - 1) {
            setPage(prevPage => {
              const nextPage = prevPage + 1; // 다음 페이지 번호
              Notifigetall(nextPage); // 그 페이지 번호로 데이터 요청
              return nextPage; // 상태를 증가된 페이지 번호로 갱신
            });
          }
        }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && notifidata.length === 0 ? (
            <View style={styles.footer}>
              <CustomText style={styles.emptyText}>알림이 없어요</CustomText>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <Pressable
            disabled={!unreadNotification || loading}
            onPress={unreadNotification && !loading ? readallnotifi : null}>
            <CustomText
              style={[
                styles.allReadText,
                unreadNotification && !loading
                  ? {color: '#121212'}
                  : {color: '#c0c0c0'},
              ]}>
              알림 전체 읽기
            </CustomText>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#121212',
    marginBottom: 6,
  },
  cardMessage: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    fontFamily: 'Pretendard-Medium',
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    fontFamily: 'Pretendard-Regular',
  },
  allReadText: {
    paddingBottom: 16,
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#999',
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
