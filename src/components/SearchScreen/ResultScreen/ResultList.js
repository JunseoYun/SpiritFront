import React from 'react';
import {FlatList, StyleSheet, ActivityIndicator} from 'react-native';
import ResultItem from './ResultItem';

const ResultList = ({stores, navigation, loading, isEnd, onEndReached}) => {
  const renderItem = ({item}) => (
    <ResultItem key={item.storeId} store={item} navigation={navigation} />
  );

  return (
    <FlatList
      data={stores}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()} // storeId를 문자열로 변환하여 고유한 키로 설정
      contentContainerStyle={styles.fastSearchModalScrollView}
      onEndReached={onEndReached} // 끝에 도달하면 실행
      onEndReachedThreshold={0.5} // 리스트의 50%까지 스크롤 시 onEndReached 호출
      ListFooterComponent={
        loading && !isEnd ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : null
      } // 로딩 상태 표시
    />
  );
};

const styles = StyleSheet.create({
  fastSearchModalScrollView: {
    marginTop: 1,
    paddingBottom: 50,
  },
});

export default ResultList;
