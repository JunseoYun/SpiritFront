import React, {useState, useEffect} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  Pressable,
  PixelRatio,
  Platform,
} from 'react-native';
import OpenStoreItem from './OpenStoreItem';
import {Store_getby_business_hours} from '../../../api/storeApi';
import Feather from 'react-native-vector-icons/Feather';

let fontScale = PixelRatio.getFontScale(); // let으로 변경
if (fontScale > 1.7) fontScale = 1.7;

const fontSize = 18 * fontScale;
const subfontSize = 13 * fontScale;

const OpenStoreList = ({location, navigation, refresh}) => {
  const [distancestores, setDistancestores] = useState([]);
  const [distancepage, setDistancepage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalpage, setTotalpage] = useState(0);

  const fetchdistanceStores = async (currentPage, reset = false) => {
    if (location) {
      if (loading || (!hasMore && !reset)) return;
      setLoading(true);

      if (reset) {
        setDistancepage(0);
      }
      try {
        const data = await Store_getby_business_hours(
          currentPage,
          location.latitude,
          location.longitude,
        );

        setTotalpage(data.totalPages);

        if (data.content && data.content.length > 0) {
          setDistancestores(prevData => {
            const newData = reset
              ? data.content
              : [...prevData, ...data.content];
            const uniqueData = newData.filter(
              (item, index, self) =>
                index === self.findIndex(existing => existing.id === item.id),
            );
            return uniqueData;
          });
        } else {
          setHasMore(false); // 더 이상 데이터가 없으면 false로 설정
        }
      } catch (error) {
      } finally {
        setLoading(false); // 로딩 상태를 false로 설정
      }
    }
  };

  useEffect(() => {
    if (location) {
      fetchdistanceStores(0, true);
    }
  }, [location]);

  useEffect(() => {
    if (refresh) {
      setDistancestores([]); // distancestores 초기화
      fetchdistanceStores(0, true); // 새로고침 데이터 로드
      setHasMore(true);
    }
  }, [refresh]);

  const renderStoreItem = ({item}) => (
    <View style={styles.storeContainer}>
      <OpenStoreItem store={item} location={location} navigation={navigation} />
    </View>
  );

  return (
    <View>
      <Pressable
        style={styles.todayPhrasesView}
        onPress={() =>
          distancestores.length >= 3 &&
          navigation.navigate('OpenStoreScreen', {location})
        }>
        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginRight: 20,
            alignItems: 'center',
          }}>
          <Text
            style={[styles.mylocationlivetext, {fontSize}]}
            allowFontScaling={false}>
            현재 영업 중인 술집은?
          </Text>
          {distancestores.length >= 3 && (
            <View style={styles.totalView}>
              <Text
                style={[styles.totalText, {fontSize: subfontSize}]}
                allowFontScaling={false}>
                전체보기
              </Text>
              <Feather name={'chevron-right'} size={15} color="#333" />
            </View>
          )}
        </View>
        <Text style={styles.mylocationlivesubtext}>
          내 주변 늦게까지 영업하는 술집을 알려드려요
        </Text>
      </Pressable>

      <FlatList
        data={distancestores}
        renderItem={renderStoreItem}
        keyExtractor={(item, index) => `${item.id}-${index}`} // 고유 키 생성
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        initialNumToRender={10} // 처음 렌더링할 개수 (기본값: 10)
        maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
        windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
        removeClippedSubviews={Platform.OS === 'android'} // iOS에서는 화면이 잘려 렌더링 오류가 발생해 안드로이드에서만 사용
        onEndReached={() => {
          if (!loading && hasMore && distancepage < totalpage - 1) {
            setDistancepage(prevPage => {
              const nextPage = prevPage + 1; // 다음 페이지 번호
              fetchdistanceStores(nextPage); // 그 페이지 번호로 데이터 요청
              return nextPage; // 상태를 증가된 페이지 번호로 갱신
            });
          }
        }}
        onEndReachedThreshold={0.5} // 스크롤 임계값 조정
        ListFooterComponent={
          loading ? (
            <View style={styles.footer}>
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : null
        }
      />
      {distancestores.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>주변에 영업 중인 술집이 없어요</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingRight: 18,
    paddingLeft: 10,
    alignItems: 'center',
    paddingBottom: 10,
  },
  todayPhrasesView: {
    marginTop: 20,
    marginLeft: 20,
  },
  mylocationlivetext: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#121212',
  },
  totalView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalText: {
    fontFamily: 'Pretendard-Regular',
    color: '#333',
  },
  mylocationlivesubtext: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#777',
    marginTop: 5,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default OpenStoreList;
