import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Modal,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Store_getby_managed} from '../../../api/storeApi';
import Loading from '../../../hooks/Loading';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');
const CARD_WIDTH = width * 0.65;
const CARD_SPACING = (width - CARD_WIDTH) / 2;

const MyManager = ({navigation, userId}) => {
  const [page, setPage] = useState(0);
  const [totalpage, setTotalpage] = useState(null);
  const [mysotredata, setMystoredata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nameTabDisabled, setNameTabDisabled] = useState(false);

  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  // fade 애니메이션
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const tabFlatListRef = useRef(null);

  const MyStore = async page => {
    setLoading(true);
    try {
      const data = await Store_getby_managed(page);

      if (page === 0) {
        setMystoredata([...data.content]);
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

  useFocusEffect(
    useCallback(() => {
      // 화면이 포커스 될 때마다 데이터 다시 가져오기
      MyStore(0);
    }, []),
  );

  const openModal = store => {
    setSelectedStore(store);
    setModalVisible(true);
    opacityAnim.setValue(0);
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedStore(null);
    });
  };

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
        <Animated.View style={{transform: [{scale}], opacity}}>
          <Pressable
            style={styles.card}
            onPress={() => {
              if (index === currentIndex) {
                openModal(item);
              } else {
                const offset = CARD_WIDTH * index;
                flatListRef.current?.scrollToOffset({
                  offset,
                  animated: true,
                });
              }
            }}>
            <ImageBackground
              source={
                item.mainImgUrl
                  ? {uri: item.mainImgUrl}
                  : require('../../../assets/store.png')
              }
              style={styles.image}
              imageStyle={{borderRadius: 16}}>
              <LinearGradient
                colors={
                  item.mainImgUrl
                    ? ['transparent', 'rgba(0, 0, 0, 0.5)'] // 위는 투명, 아래는 어두움
                    : ['transparent', 'rgba(0, 0, 0, 0.3)']
                }
                style={[styles.gradientBottom, {height: (height * 0.47) / 1.5}]}
                pointerEvents="none"
              />
              <View style={styles.overlayContent}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.storeName || '상호명 없음'}
                </Text>
                <Text style={styles.address} numberOfLines={1}>
                  {item.locationDto?.address || '주소 정보 없음'}
                  {item.locationDto?.addressDetail
                    ? `, ${item.locationDto.addressDetail}`
                    : ''}
                </Text>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <FontAwesomeIcon name="star" size={16} color="#FFD700" />
                    <Text style={styles.statText}>{item.storeRate ?? 0}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={16}
                      color="#4FC3F7"
                    />
                    <Text style={styles.statText}>{item.reviewCount ?? 0}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Ionicons name="heart" size={16} color="#FF6B6B" />
                    <Text style={styles.statText}>{item.likeCount ?? 0}</Text>
                  </View>
                </View>

                <View style={styles.reportRow}>
                  <Text style={[styles.reportBadge, styles.normalReport]}>
                    제보 {item.normalReportCount ?? 0}
                  </Text>
                  <Text style={[styles.reportBadge, styles.priorityReport]}>
                    신고 {item.priorityReportCount ?? 0}
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#FAFAFA'}}>
      {/* 카드 리스트 */}
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
        keyExtractor={item => item.storeId.toString()}
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
        <View style={{alignItems: 'center'}}>
          <Pressable
            disabled={nameTabDisabled}
            onPress={() => {
              flatListRef.current?.scrollToOffset({offset: 0, animated: true});
            }}
            style={[
              styles.nameTab,
              currentIndex === 0 && styles.activeTab,
              {paddingVertical: 10},
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
        <FlatList
          ref={tabFlatListRef}
          data={mysotredata}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.storeId.toString()}
          contentContainerStyle={{paddingHorizontal: 200, marginTop: 10}}
          renderItem={({item, index}) => (
            <Pressable
              disabled={nameTabDisabled}
              onPress={() => {
                const offset = CARD_WIDTH * index;
                flatListRef.current?.scrollToOffset({offset, animated: true});
              }}
              style={[
                styles.nameTab,
                currentIndex === index && styles.activeTab,
                {paddingVertical: 6},
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

      {/* 모달 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        statusBarTranslucent={true}
        animationType="none"
        onRequestClose={closeModal}>
        <View style={StyleSheet.absoluteFill}>
          {Platform.OS === 'ios' ? (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={10}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {backgroundColor: 'rgba(0,0,0,0.6)'},
              ]}
            />
          )}

          {selectedStore && (
            <Animated.View
              style={[StyleSheet.absoluteFill, {opacity: opacityAnim}]}>
              <ImageBackground
                source={
                  selectedStore.mainImgUrl
                    ? {uri: selectedStore.mainImgUrl}
                    : require('../../../assets/store.png')
                }
                style={{width, height}}
                imageStyle={{resizeMode: 'cover'}}>
                <LinearGradient
                  colors={
                    selectedStore.mainImgUrl
                      ? ['transparent', 'rgba(0, 0, 0, 0.5)'] // 위는 투명, 아래는 어두움
                      : ['transparent', 'rgba(0, 0, 0, 0.3)']
                  }
                  style={styles.gradientBottom}
                  pointerEvents="none"
                />
                {/* 정보 영역 */}
                <View style={styles.modalInfoContainer}>
                  <Text style={styles.modalInfoTitle} numberOfLines={1}>
                    {selectedStore.storeName || '상호명 없음'}
                  </Text>
                  <Text style={styles.modalInfoAddress} numberOfLines={2}>
                    {selectedStore.locationDto?.address || '주소 정보 없음'}
                    {selectedStore.locationDto?.addressDetail
                      ? `, ${selectedStore.locationDto.addressDetail}`
                      : ''}
                  </Text>

                  <View style={styles.modalStatsRow}>
                    <View style={styles.modalStatItem}>
                      <FontAwesomeIcon name="star" size={16} color="#FFD700" />
                      <Text style={styles.modalStatText}>
                        {selectedStore.storeRate ?? 0}
                      </Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={16}
                        color="#4FC3F7"
                      />
                      <Text style={styles.modalStatText}>
                        {selectedStore.reviewCount ?? 0}
                      </Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Ionicons name="heart" size={16} color="#FF6B6B" />
                      <Text style={styles.modalStatText}>
                        {selectedStore.likeCount ?? 0}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalReportRow}>
                    <Text
                      style={[styles.modalReportBadge, styles.normalReport]}>
                      제보 {selectedStore.normalReportCount ?? 0}
                    </Text>
                    <Text
                      style={[styles.modalReportBadge, styles.priorityReport]}>
                      신고 {selectedStore.priorityReportCount ?? 0}
                    </Text>
                  </View>
                </View>

                {/* 닫기 버튼 */}
                <Pressable style={styles.closeBtn} onPress={closeModal}>
                  <Ionicons name="close" size={20} color="#fff" />
                </Pressable>

                {/* 하단 버튼 */}
                <View style={styles.bottomButtons}>
                  <View style={styles.bottomButtonView}>
                    <Pressable
                      style={[
                        styles.btn,
                        {borderColor: '#fff', borderWidth: 1.3},
                      ]}
                      onPress={() => {
                        closeModal();
                        navigation.navigate('StoreStack', {
                          screen: 'StoreMainScreen',
                          params: {storeId: selectedStore.storeId},
                        });
                      }}>
                      <Ionicons name="home" size={30} color="#fff" />
                    </Pressable>
                    <Text style={styles.btnText}>매장 홈</Text>
                  </View>
                  <View style={styles.bottomButtonView}>
                    <Pressable
                      style={[
                        styles.btn,
                        {borderColor: '#fff', borderWidth: 1.3},
                      ]}
                      onPress={() => {
                        closeModal();
                        navigation.navigate('StoreStack', {
                          screen: 'ManagerStoreInfoScreen',
                          params: {
                            storeId: selectedStore.storeId,
                            storename: selectedStore.storeName,
                            locationDto: selectedStore.locationDto,
                          },
                        });
                      }}>
                      <Ionicons name="stats-chart" size={30} color="#fff" />
                    </Pressable>
                    <Text style={styles.btnText}>통계 조회</Text>
                  </View>
                  <View style={styles.bottomButtonView}>
                    <Pressable
                      style={[
                        styles.btn,
                        {borderColor: '#fff', borderWidth: 1.3},
                      ]}
                      onPress={() => {
                        closeModal();
                        navigation.navigate('StoreStack', {
                          screen: 'StoreManagerScreen',
                          params: {
                            storeId: selectedStore.storeId,
                            storename: selectedStore.storeName,
                            userId,
                          },
                        });
                      }}>
                      <Ionicons name="person-sharp" size={30} color="#fff" />
                    </Pressable>
                    <Text style={styles.btnText}>운영진</Text>
                  </View>
                  <View style={styles.bottomButtonView}>
                    <Pressable
                      style={[
                        styles.btn,
                        {borderColor: '#fff', borderWidth: 1.3},
                      ]}
                      onPress={() => {
                        closeModal();
                        navigation.navigate('StoreStack', {
                          screen: 'StoreReviewScreen',
                          params: {
                            storeId: selectedStore.storeId,
                            storename: selectedStore.storeName,
                            isOwner: true,
                          },
                        });
                      }}>
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={30}
                        color="#fff"
                      />
                    </Pressable>
                    <Text style={styles.btnText}>리뷰 조회</Text>
                  </View>
                  <View style={styles.bottomButtonView}>
                    <Pressable
                      style={[
                        styles.btn,
                        {borderColor: '#fff', borderWidth: 1.3},
                      ]}
                      onPress={() => {
                        closeModal();

                        navigation.navigate('StoreStack', {
                          screen: 'StoreReportList',
                          params: {
                            storeId: selectedStore.storeId,
                            storeName: selectedStore.storeName,
                          },
                        });
                      }}>
                      <Ionicons
                        name="information-circle-sharp"
                        size={30}
                        color="#fff"
                      />
                    </Pressable>
                    <Text style={styles.btnText}>제보·신고</Text>
                  </View>
                </View>
              </ImageBackground>
            </Animated.View>
          )}
        </View>
      </Modal>

      <Loading loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    height: height * 0.47,
    marginTop: 18,
    width: CARD_WIDTH,
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },

  overlayContent: {
    padding: 12,
    zIndex: 3,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 6,
  },
  address: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'Pretendard-Regular',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 4,
    fontFamily: 'Pretendard-Medium',
  },
  reportRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  reportBadge: {
    fontSize: 14,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 6,
    fontFamily: 'Pretendard-Medium',
  },
  normalReport: {
    backgroundColor: 'rgba(255,165,0,0.25)',
    color: '#FFA500',
  },
  priorityReport: {
    backgroundColor: 'rgba(255,77,79,0.25)',
    color: '#FF4D4F',
  },

  nameTab: {
    paddingHorizontal: 12,
    borderRadius: 16,
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
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 7,
    borderRadius: 20,
    zIndex: 10,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-evenly',
    zIndex: 10,
  },
  bottomButtonView: {
    alignItems: 'center',
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    width: 55,
    height: 55,
    marginBottom: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height / 2, // 아래 절반
    zIndex: 1,
  },

  modalInfoContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    zIndex: 3,
  },
  modalInfoTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Pretendard-Bold',
    marginBottom: 6,
  },
  modalInfoAddress: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 6,
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  modalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  modalStatText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 6,
    fontFamily: 'Pretendard-SemiBold',
  },
  modalReportRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  modalReportBadge: {
    fontSize: 14,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 10,
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default MyManager;
