import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ResultModalItem from './ResultModalItem';
import {Store_getby_condition_search} from '../../../../api/storeApi';
import useCategoryTranslation from '../../../../hooks/useCategoryTranslation';

const ResultModal = ({
  visible,
  onClose,
  selectedCategory,
  selectedPeople,
  selectedHour,
  selectedMinute,
  location,
  fastSearchStores,
  navigation,
}) => {
  const [faststores, setFasttores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [hasMore, setHasMore] = useState(true);
  const [totalpage, setTotalpage] = useState(0);
  const {translateCategory} = useCategoryTranslation();
  const fastgetStores = async (currentPage, refresh = false) => {
    if (location) {
      if (loading || (!hasMore && !refresh)) return;
      setLoading(true);

      try {
        const requestData = {
          page: currentPage,
          latitude: location.latitude,
          longitude: location.longitude,
          conditionSearchDto: fastSearchStores,
        };

        console.log('API 요청 데이터:', requestData); // 확인용 로그

        const storesData = await Store_getby_condition_search(requestData);

        setTotalpage(storesData.totalPages);

        if (storesData.content && storesData.content.length > 0) {
          setFasttores(prevStores => {
            const newStores = refresh
              ? storesData.content // 새로고침 시 초기화
              : [...prevStores, ...storesData.content]; // 추가 로드

            const uniqueStores = Array.from(
              new Map(newStores.map(store => [store.id, store])).values(),
            );
            return uniqueStores;
          });
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    if (location && visible && fastSearchStores) {
      setPage(0);
      fastgetStores(0, true); // 첫 페이지 데이터 로드
    }
  }, [location, fastSearchStores, visible]);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (!loading) {
      return <Text style={styles.emptyText}>가게가 없습니다.</Text>;
    }
    return null;
  };

  const renderStoreItem = ({item}) => {
    return (
      <ResultModalItem
        store={item}
        navigation={navigation}
        location={location}
      />
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <Pressable style={styles.fastSearchModalBackground} onPress={onClose}>
        <View
          style={styles.fastSearchModalContainer}
          onStartShouldSetResponder={() => true}>
          <Image
            source={require('../../../../assets/todaylogo.png')}
            style={styles.fastSearchModaltopimage}
          />
          <Text style={styles.fastSearchModaltopimage}>한잔할까</Text>
          <View style={styles.searchModaltopview}>
            <Pressable
              onPress={onClose}
              style={styles.fastSearchModalcloseButton}>
              <AntDesign name="arrowleft" size={25} color={'black'} />
            </Pressable>
          </View>
          <View style={styles.fastSearchTextView}>
            <Text style={styles.fastSearchText}>
              {translateCategory(selectedCategory)}
            </Text>
            <Text style={styles.fastSearchText}>{selectedPeople}</Text>
            <Text style={styles.fastSearchText}>
              {selectedHour}:{selectedMinute}
            </Text>
          </View>
          <FlatList
            data={faststores}
            renderItem={renderStoreItem}
            keyExtractor={item => item.id.toString()}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fastSearchModalScrollView}
            onEndReached={() => {
              if (hasMore && !loading && page < totalpage - 1) {
                setPage(prevPage => {
                  const nextPage = prevPage + 1; // 다음 페이지 번호
                  fastgetStores(nextPage); // 그 페이지 번호로 데이터 요청
                  return nextPage; // 상태를 증가된 페이지 번호로 갱신
                });
              }
            }}
            initialNumToRender={10} // 처음 렌더링할 개수 (기본값: 10)
            maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
            windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
            removeClippedSubviews={true} // 보이지 않는 컴포넌트 메모리 해제
            onEndReachedThreshold={0.5} // 리스트 끝에 가까워지면 데이터를 추가로 가져옵니다.
            ListFooterComponent={renderFooter} // 로딩 인디케이터
            ListEmptyComponent={renderEmptyComponent}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fastSearchModalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fastSearchModalContainer: {
    width: '90%',
    height: '85%',
    paddingVertical: 5,
    paddingTop: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  fastSearchModaltopimage: {
    width: 120,
    resizeMode: 'contain',
    height: 120,
    marginTop: -25,
  },
  searchModaltopview: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -75,
  },
  fastSearchModalcloseButton: {
    alignItems: 'center',
  },
  fastSearchTextView: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fastSearchText: {
    color: '#16BBFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  fastSearchModalScrollView: {
    marginTop: 1,
    paddingBottom: 50,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default ResultModal;
