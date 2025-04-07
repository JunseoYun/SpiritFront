import React from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  View,
  Image,
  Text,
  Pressable,
  Dimensions,
} from 'react-native';
import MapStoreItem from './MapStoreItem';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const BUTON_WIDTH = width * 0.4;
const SPACING = width * 0.05;

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
    const index = Math.round(offsetX / width); // 현재 중앙 아이템 인덱스 계산

    // 중앙 아이템이 바뀌었을 때만 처리
    if (index !== selectedStoreIndex) {
      setSelectedStoreIndex(index); // 중앙 아이템 인덱스 업데이트

      // 해당 인덱스의 좌표로 지도 이동
      const store = stores[index];
      setSelectedStore(store);
      if (store) {
        moveCenterMap(store.locationDto.latitude, store.locationDto.longitude); // 지도 이동 함수 호출
      }
    }
  };

  return (
    <>
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
            snapToInterval={width} // 아이템 너비(350) + 간격(60)
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
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onScrollToIndexFailed={({index}) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({index, animated: true});
              }, 300);
            }}
          />
        )}
      </Animated.View>
      {stores.length === 0 && (
        <View style={styles.storeInfo}>
          <View style={styles.titleview}>
            <Text style={styles.noDataText}>주변에 등록된 술집이 없어요</Text>
          </View>

          <View style={styles.noneView}>
            <Pressable
              style={styles.button2}
              onPress={() => {
                navigation.navigate('StoreSearchScreen', {
                  index: 0,
                  location: location,
                });
              }}>
              <Text style={styles.noneText2}>술집 등록하기</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={() => {
                navigation.navigate('SetLocationScreen');
              }}>
              <Text style={styles.noneText}>위치 변경하기</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  flatListContainer: {
    borderTopLeftRadius: 15,
    position: 'absolute',
    bottom: '3%',
  },
  storeInfo: {
    position: 'absolute',
    bottom: '3%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: ITEM_WIDTH,
    height: '20%',
    backgroundColor: '#fdfdfd',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  titleview: {
    marginTop: 5,
    width: '100%',
  },
  noDataText: {
    alignSelf: 'center',
    fontSize: 16,
    color: '#c9c9c9',
    fontFamily: 'Pretendard-Medium',
  },
  noneView: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  button: {
    width: BUTON_WIDTH,
    paddingHorizontal: 17,
    paddingVertical: 17,
    borderWidth: 2,
    borderColor: '#45c9ff',
    borderRadius: 10,
    backgroundColor: '#45c9ff',
  },
  button2: {
    width: BUTON_WIDTH,
    paddingHorizontal: 17,
    paddingVertical: 17,
    borderWidth: 2,
    borderColor: '#45c9ff',
    borderRadius: 10,
  },
  noneText2: {
    alignSelf: 'center',
    color: '#45c9ff',
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
  noneText: {
    alignSelf: 'center',
    color: 'white',
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default MapStoreList;
