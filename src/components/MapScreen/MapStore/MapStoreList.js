import React from 'react';
import {Animated, FlatList, StyleSheet} from 'react-native';
import MapStoreItem from './MapStoreItem';

const MapStoreList = ({
  panHandlers,
  flatListAnim,
  isFlatListVisible,
  stores,
  selectedStoreIndex,
  setSelectedStoreIndex,
  setSelectedStore,
  moveCenterMap,
  flatListRef,
  navigation,
  location,
}) => {
  const handleScroll = event => {
    const offsetX = event.nativeEvent.contentOffset.x; // 스크롤 위치
    const index = Math.round(offsetX / 410); // 현재 중앙 아이템 인덱스 계산

    // 중앙 아이템이 바뀌었을 때만 처리
    if (index !== selectedStoreIndex) {
      setSelectedStoreIndex(index); // 중앙 아이템 인덱스 업데이트

      // 해당 인덱스의 좌표로 지도 이동
      const store = stores[index];
      setSelectedStore(store);
      if (store) {
        moveCenterMap(store.latitude, store.longitude); // 지도 이동 함수 호출
      }
    }
  };

  return (
    <Animated.View
      {...panHandlers} // PanResponder 연결
      style={[
        styles.flatListContainer,
        {transform: [{translateY: flatListAnim}], zIndex: 10}, // 위치 애니메이션
      ]}>
      {isFlatListVisible && (
        <FlatList
          ref={flatListRef}
          data={stores}
          horizontal
          keyExtractor={item => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          snapToInterval={410} // 아이템 너비(350) + 간격(60)
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16} // 스크롤 이벤트 호출 빈도
          renderItem={({item, index}) => (
            <MapStoreItem
              item={item}
              index={index}
              selectedStoreIndex={selectedStoreIndex}
              setSelectedStore={setSelectedStore}
              moveCenterMap={moveCenterMap}
              navigation={navigation}
              location={location}
            />
          )}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flatListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 10,
    elevation: 10,
    minHeight: 30, // 숨김 상태에서도 60px 정도 보이도록 설정
  },
});

export default MapStoreList;
