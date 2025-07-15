import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {Store_getby_managed} from '../../../api/storeApi';
import Loading from '../../../hooks/Loading';
import MyManagerItem from './MyManagerItem';
import ManagerPickerModal from './ManagerPickerModal';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.65;
const CARD_SPACING = (width - CARD_WIDTH) / 2;

const MyManager = ({navigation}) => {
  const [page, setPage] = useState(0);
  const [totalpage, setTotalpage] = useState(null);
  const [mysotredata, setMystoredata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nameTabDisabled, setNameTabDisabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectStoreId, setSelectStoreId] = useState(null);
  const [selectStoreName, setSelectStoreName] = useState(null);

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const tabFlatListRef = useRef(null);

  const MyStore = async page => {
    if (page === 0) setLoading(true);
    else setLoading(true);

    try {
      const data = await Store_getby_managed(page);
      if (page === 0) {
        setMystoredata(data.content);
      } else {
        setMystoredata(prev => [...prev, ...data.content]);
      }
      setTotalpage(data.totalPages);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    MyStore(0);
  }, []);

  const handleMoveStore = () => {
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId: selectStoreId},
    });
  };

  const handleMoveStoreInfo = () => {
    navigation.navigate('ManagerStoreInfoScreen', {
      storeId: selectStoreId,
      storeName: selectStoreName,
    });
  };
  console.log(selectStoreName);

  const renderItem = ({item, index}) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <View style={{alignItems: 'center', width: CARD_WIDTH}}>
        <Animated.View
          style={{
            transform: [{scale}],
            opacity,
          }}>
          <MyManagerItem
            sotreInfo={item}
            onPress={() => {
              if (index === currentIndex) {
                // 가운데 카드 클릭 시, navigation
                // navigation.navigate('StoreStack', {
                //   screen: 'StoreMainScreen',
                //   params: {storeId: item.storeId},
                // });
                setSelectStoreId(item.storeId);
                setSelectStoreName(item.storeName);
                setIsVisible(true);
              } else {
                // 가운데가 아닌 카드 클릭 시, 가운데로 스크롤
                const offset = CARD_WIDTH * index;
                flatListRef.current?.scrollToOffset({
                  offset,
                  animated: true,
                });
              }
            }}
            width={CARD_WIDTH}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#FAFAFA'}}>
      {/* 카드 슬라이더 */}
      <Animated.FlatList
        ref={flatListRef}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index,
        })}
        onScrollBeginDrag={() => setNameTabDisabled(true)}
        onScrollEndDrag={() => setNameTabDisabled(false)}
        data={mysotredata}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: CARD_SPACING,
          paddingTop: 10,
        }}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {
            useNativeDriver: true,
            listener: event => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / CARD_WIDTH);

              if (index !== currentIndex) {
                setCurrentIndex(index);
                tabFlatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0.5,
                });
              }

              // 👇 마지막에서 3번째 전에서 페이지 호출
              if (
                !loading &&
                index >= mysotredata.length - 3 &&
                page < totalpage - 1
              ) {
                setPage(prev => {
                  const nextPage = prev + 1;
                  MyStore(nextPage);
                  return nextPage;
                });
              }
            },
          },
        )}
      />

      {/* 가게 이름 탭 */}
      {mysotredata.length === 1 ? (
        // 아이템이 하나일 때 중앙 정렬된 단일 탭
        <View style={{alignItems: 'center'}}>
          <Pressable
            disabled={nameTabDisabled}
            onPress={() => {
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              });
            }}
            style={[
              styles.nameTab,
              currentIndex === 0 && styles.activeTab,
              {
                paddingVertical: 10,
              },
            ]}>
            <Text
              style={[
                styles.nameTabText,
                currentIndex === 0 && styles.activeTabText,
                {maxWidth: width * 0.5},
              ]}
              numberOfLines={1}>
              {mysotredata[0].storeName}
            </Text>
          </Pressable>
        </View>
      ) : (
        // 아이템이 여러 개일 때는 기존 FlatList 사용
        <FlatList
          ref={tabFlatListRef}
          data={mysotredata}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: 200,
            marginTop: 10,
          }}
          renderItem={({item, index}) => (
            <Pressable
              disabled={nameTabDisabled}
              onPress={() => {
                const offset = CARD_WIDTH * index;
                flatListRef.current?.scrollToOffset({
                  offset,
                  animated: true,
                });
              }}
              style={[
                styles.nameTab,
                currentIndex === index && styles.activeTab,
                {
                  paddingVertical: 6,
                },
              ]}>
              <Text
                style={[
                  styles.nameTabText,
                  currentIndex === index && styles.activeTabText,
                  {maxWidth: width * 0.5},
                ]}
                numberOfLines={1}>
                {item.storeName}
              </Text>
            </Pressable>
          )}
        />
      )}
      <ManagerPickerModal
        isVisible={isVisible}
        setVisible={setIsVisible}
        handleMoveStore={handleMoveStore}
        handleMoveStoreInfo={handleMoveStoreInfo}
      />

      <Loading loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  nameTabContainer: {
    paddingHorizontal: 100,
  },
  nameTab: {
    paddingHorizontal: 12,
    borderRadius: 16,
    textAlign: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#E9F5FB',
  },
  nameTabText: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'Pretendard-Medium',
  },
  activeTabText: {
    color: '#45C9FF',
    fontFamily: 'Pretendard-Bold',
  },
});

export default MyManager;
