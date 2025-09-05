import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  Pressable,
} from 'react-native';
import {
  NotifiGet,
  NotifiRead,
  NotifiReadAll,
} from '../../../../api/notificationApi';
import Loading from '../../../../hooks/Loading';
import RejectModal from '../../../../components/Reject/RejectModal';
import {useToast} from '../../../../context/ToastContext';
import {ReviewgetbyGet} from '../../../../api/reviewApi';

const NotificationCard = ({title, message, date, hasRead}) => {
  const textColorStyle = hasRead ? styles.readText : styles.unreadText;

  return (
    <View style={styles.card}>
      <Text style={[styles.cardTitle, textColorStyle]}>{title}</Text>
      <Text style={[styles.cardMessage, textColorStyle]}>{message}</Text>
      <Text style={[styles.cardDate, textColorStyle]}>{formatDate(date)}</Text>
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
  const {showToast} = useToast();

  useEffect(() => {
    setNotifidata([]); // 기존 데이터 초기화
    setPage(0);
    setIsEnd(false);
    Notifigetall(0);
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
    } catch (err) {
      showToast('다시 시도해 주세요.', 'center');
    } finally {
      setLoading(false);
      handleRefresh();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifidata}
        keyExtractor={item => item.id.toString()}
        initialNumToRender={20}
        maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
        windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
        removeClippedSubviews={true}
        renderItem={({item}) => (
          <Pressable
            onPress={() => {
              const handlePress = async () => {
                if (item.notificationType === 'STORE_OWNERSHIP_REJECTED') {
                  setSelectedReject(item);
                  if (!item.hasRead) {
                    await NotificationRead(item.id);
                    setHasReadmodal(true);
                  }
                }

                if (item.notificationType === 'STORE_OWNERSHIP_APPROVED') {
                  if (!item.hasRead) {
                    await NotificationRead(item.id);
                  }
                  navigation.navigate('StoreStack', {
                    screen: 'StoreMainScreen',
                    params: {storeId: item.redirectId},
                  });
                }

                if (item.notificationType === 'STORE_REVIEW_CREATED') {
                  if (!item.hasRead) {
                    await NotificationRead(item.id);
                  }

                  const body = item.body || '';
                  let storename = '';
                  const match = body.match(/(.+?) 매장에/);
                  if (match) storename = match[1];

                  try {
                    const response = await ReviewgetbyGet(item.redirectId);
                    navigation.navigate('StoreStack', {
                      screen: 'StoreReviewScreen',
                      params: {
                        storeId: response.storeId,
                        storename,
                        isOwner: true,
                      },
                    });
                  } catch (er) {
                    console.log(er);
                  }
                }
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
              <Text style={styles.emptyText}>알림이 없어요</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <Pressable onPress={readallnotifi}>
            <Text
              style={{
                paddingBottom: 16,
                fontSize: 14,
                fontFamily: 'Pretendard-Medium',
                color: '#333',
                textAlign: 'right',
              }}>
              알람 전체 읽기
            </Text>
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
    backgroundColor: '#fdfdfd',
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
