import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import NearStoreItem from './NearStoreItem';
import {Store_getby_distance} from '../../../api/storeApi';

const NearStoreList = ({navigation, location}) => {
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    console.log(location);
    if (location) {
      getStoreData(true);
    } else {
      console.log('getStoreData fail');
    }
  }, [location]);

  const getStoreData = async (reset = false) => {
    setLoading(true);

    if (location) {
      try {
        const storesData = await Store_getby_distance(
          reset ? 0 : page,
          location.latitude,
          location.longitude,
        );
        console.log(storesData);

        if (storesData && storesData.length > 0) {
          setStores(prevData => {
            const newData = reset ? storesData : [...prevData, ...storesData];
            const uniqueData = newData.filter(
              (item, index, self) =>
                index === self.findIndex(existing => existing.id === item.id),
            );
            return uniqueData;
          });
          setPage(reset ? 0 : prevPage => prevPage + 1);
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

  const renderStoreItem = ({item}) => {
    return <NearStoreItem store={item} navigation={navigation} />;
  };

  return (
    <View>
      <View style={styles.storeTextView}>
        <Text style={styles.storeText}>제일 가까운 주점은?</Text>
        <Text style={styles.storeSubText}>
          현재 위치에서 가장 가까운 주점을 알려드려요
        </Text>
      </View>
      <FlatList
        data={stores}
        renderItem={renderStoreItem}
        keyExtractor={item => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalFlatListContent}
        onEndReached={() => {
          if (hasMore && !loading) {
            getStoreData(); // 추가 매장을 가져옵니다.
          }
        }}
        onEndReachedThreshold={0.5} // 리스트 끝에 가까워지면 데이터를 추가로 가져옵니다.
        ListFooterComponent={
          loading ? <Text style={styles.emptyText}>Loading...</Text> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  storeTextView: {
    width: '100%',
    marginLeft: 20,
    marginTop: 10,
  },
  storeText: {
    marginTop: 10,
    fontSize: 17,
    color: 'black',
    fontWeight: 'bold',
  },
  storeSubText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'gray',
    marginTop: 7,
  },
  storeView: {
    marginTop: 1,
    width: '100%',
  },
  horizontalScrollViewContent: {
    paddingHorizontal: 20, // 필요에 따라 조정
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default NearStoreList;
