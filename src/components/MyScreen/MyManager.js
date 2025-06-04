import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Store_getby_managed} from '../../api/storeApi';
import Loading from '../../hooks/Loading';
import MyManagerItem from './MyManagerItem';

const MyManager = ({navigation}) => {
  const [page, setPage] = useState(0);
  const [totalpage, setTotalpage] = useState(null);
  const [mysotredata, setMystoredata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // ✅ 추가

  const MyStore = async page => {
    if (page === 0) setRefreshing(true); // ✅ 첫 페이지는 refresh 로직 적용
    else setLoading(true);

    try {
      const data = await Store_getby_managed();
      console.log(data.content);
      if (page === 0) {
        setMystoredata(data.content); // 새로고침 시 기존 데이터 덮어씀
      } else {
        setMystoredata(prev => [...prev, ...data.content]); // 페이지네이션 시 누적
      }
      setTotalpage(data.totalPages);
    } catch (error) {
      console.log(error);
    } finally {
      if (page === 0) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    MyStore(0);
  }, []);

  const onRefresh = useCallback(() => {
    setPage(0); // 페이지 초기화
    MyStore(0); // 새로고침용 요청
  }, []);

  const renderItem = ({item}) => (
    <MyManagerItem key={item.id} sotreInfo={item} navigation={navigation} />
  );

  return (
    <>
      <FlatList
        data={mysotredata}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        refreshing={refreshing} // ✅ 추가
        onRefresh={onRefresh} // ✅ 추가
        onEndReached={() => {
          if (!loading && page < totalpage - 1) {
            setPage(prevPage => {
              const nextPage = prevPage + 1;
              MyStore(nextPage);
              return nextPage;
            });
          }
        }}
        onEndReachedThreshold={0.5}
      />
      <Loading loading={loading} />
    </>
  );
};

export default MyManager;
