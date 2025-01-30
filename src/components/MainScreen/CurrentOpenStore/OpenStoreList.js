import React, {useState, useEffect} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import OpenStoreItem from './OpenStoreItem';
import {Store_getby_business_hours} from '../../../api/storeApi';

const OpenStoreList = ({location, navigation, refresh, setRefresh}) => {
  const [distancestores, setDistancestores] = useState([]);
  const [distancepage, setDistancepage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchdistanceStores = async (reset = false) => {
    setLoading(true);

    if (location) {
      try {
        const data = await Store_getby_business_hours(
          reset ? 0 : distancepage,
          location.latitude,
          location.longitude,
        );

        if (data && data.length > 0) {
          setDistancestores(prevData => {
            const newData = reset ? data : [...prevData, ...data];
            const uniqueData = newData.filter(
              (item, index, self) =>
                index === self.findIndex(existing => existing.id === item.id),
            );
            return uniqueData;
          });
          setDistancepage(reset ? 0 : prevPage => prevPage + 1);
          setHasMore(true); // 데이터가 있으면 계속 로드 가능
        } else {
          setHasMore(false); // 더 이상 데이터가 없으면 false로 설정
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (location) {
      fetchdistanceStores(true);
    }
    if (refresh) {
      setDistancestores([]); // distancestores 초기화
      fetchdistanceStores(true); // 새로고침 데이터 로드
      setHasMore(true);
      setRefresh(false);
    }
  }, [location, refresh]);

  const renderStoreItem = ({item}) => (
    <View style={styles.storeContainer}>
      <OpenStoreItem store={item} location={location} navigation={navigation} />
    </View>
  );

  return (
    <View>
      <View style={styles.todayPhrasesView}>
        <Text style={styles.mylocationlivetext}>현재 영업 중인 주점은?</Text>
        <Text style={styles.mylocationlivesubtext}>
          현재 위치에서 내 근처 영업 중인 주점을 알려드려요
        </Text>
      </View>

      <FlatList
        data={distancestores}
        renderItem={renderStoreItem}
        keyExtractor={(item, index) => `${item.id}-${index}`} // 고유 키 생성
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        onEndReached={() => {
          if (hasMore) {
            fetchdistanceStores();
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
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>가게가 없어요</Text> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
    paddingBottom: 20,
  },
  todayPhrasesView: {
    marginTop: 10,
    marginLeft: 25,
    marginBottom: 5,
  },
  mylocationlivetext: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
  },
  mylocationlivesubtext: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'gray',
    marginTop: 3,
  },
  storeContainer: {
    marginHorizontal: 3,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default OpenStoreList;
