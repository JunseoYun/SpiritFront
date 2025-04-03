import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {ReviewStoreGet} from '../../api/reviewApi';
import ReviewItem from '../../components/StoreReviewScreen/ReviewItem';
import {ReviewCreate} from '../../api/reviewApi';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCustomAlert from '../../hooks/useCustomAlert';
import ImagePicker from 'react-native-image-crop-picker';
import ReviewForm from '../../components/StoreReviewScreen/ReviewForm';
import forbiddenWords from '../../hooks/forbiddenWords';
import filterWords from '../../hooks/filterWords';
import {useToast} from '../../context/ToastContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StoreReviewScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, storename} = route.params;
  const [reviewdata, setReviewdata] = useState([]);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();

  const [isWriting, setIsWriting] = useState(false); // 작성 상태

  const [newrate, setNewRate] = useState(0);
  const [newReviewContent, setNewReviewContent] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [visitDate, setVisitDate] = useState(new Date()); // 방문 날짜 상태
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // 날짜 선택기 표시 상태

  const [page, setPage] = useState(0); // 페이지 번호
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [isEnd, setIsEnd] = useState(false); // 데이터 끝 여부
  const [totalpage, setTotalpage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [addloading, setAddloading] = useState(false);

  const getReviewData = async currentPage => {
    setLoading(true);

    try {
      const reviewData = await ReviewStoreGet(storeId, currentPage);
      setTotalpage(reviewData.totalPages);

      if (reviewData.content.length === 0) {
        setIsEnd(true); // 더 이상 데이터가 없으면
      } else {
        // 기존 데이터와 병합하고 중복 제거
        setReviewdata(prevReviews => {
          const mergedReviews = [...prevReviews, ...reviewData.content];
          const uniqueReviews = Array.from(
            new Map(mergedReviews.map(review => [review.id, review])).values(),
          );
          return uniqueReviews;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreReviews = () => {
    if (!loading && !isEnd) {
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        getReviewData(nextPage); // 다음 페이지 데이터를 가져옴
        return nextPage;
      });
    }
  };

  useEffect(() => {
    setReviewdata([]); // 기존 데이터 초기화
    setPage(0); // 페이지 초기화
    setIsEnd(false);
    getReviewData(0);
  }, []);

  const handleRefresh = () => {
    setReviewdata([]); // 기존 stores 초기화
    setIsEnd(true); // 추가 데이터 여부 초기화
    setPage(0);
    setRefreshing(true); // 새로고침 시작
    getReviewData(0); // 새로고침
  };

  const hadleIsWrite = () => {
    setIsWriting(true);
  };

  const hadleNoWrite = () => {
    showAlert({
      title: '작성한 내용이 저장되지 않았습니다',
      message: '리뷰 작성을 취소하시겠습니까?',
      onConfirm: () => setIsWriting(false),
      type: 'confirm',
    });
  };

  const renderStars = () => {
    return Array.from({length: 5}, (_, index) => {
      const starIndex = index + 1; // 별의 번호 (1부터 시작)
      return (
        <TouchableOpacity key={index} onPress={() => setNewRate(starIndex)}>
          <FontAwesomeIcon
            name="star"
            size={30}
            color={starIndex <= newrate ? '#FFD700' : '#D3D3D3'} // 노란색(#FFD700) 또는 회색(#D3D3D3)
            style={styles.star}
          />
        </TouchableOpacity>
      );
    });
  };

  const onChangeText = inputText => {
    setNewReviewContent(inputText);
  };

  const selectImage = () => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        setImages(prevImages => [...prevImages, image]); // 이미지를 배열에 추가
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
  };

  const handleImagePress = index => {
    setSelectedImageIndex(index); // 선택된 이미지 인덱스 설정
    showAlert({
      title: '사진 삭제',
      message: '선택한 사진을 삭제하시겠습니까?',
      onConfirm: () => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index)); // 선택된 사진 삭제
        setSelectedImageIndex(null); // 선택된 이미지 초기화
      },
      onCancel: () => {
        setSelectedImageIndex(null); // 취소 시 선택된 이미지 초기화
      },
      type: 'delete',
    });
  };

  const handleSubmitReview = async () => {
    setAddloading(true);
    try {
      // 금지된 단어 확인
      const containsForbiddenWord = forbiddenWords.some(
        word =>
          newReviewContent.includes(word) || newrate.toString().includes(word),
      );

      if (containsForbiddenWord) {
        showAlert({
          title: '가이드 위반',
          message: '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
        });
        return;
      }

      // 리뷰 내용과 별점이 비어있는지 확인
      if (!newReviewContent.trim()) {
        showToast('리뷰 내용을 적어주세요.');
        return;
      }

      if (newrate === 0) {
        showToast('별점을 입력해주세요.');
        return;
      }

      // 리뷰 등록 성공 처리
      const data = {
        files: images, // 이미지 배열
        createReviewDto: {
          content: newReviewContent,
          rate: newrate,
          visitedAt: new Date(visitDate.getTime() + 9 * 60 * 60 * 1000),
          storeId: storeId,
        },
      };

      await ReviewCreate(data);
      setImages([]); // 이미지 초기화
      setNewRate(0); // 별점 초기화
      setNewReviewContent(''); // 리뷰 내용 초기화
      setVisitDate(new Date()); // 방문 날짜 초기화

      showToast('리뷰가 등록되었습니다.');
      handleRefresh();
      setIsWriting(false);
    } catch (error) {
      console.log(error, '리뷰 등록 중 에러');
      showAlert({
        title: '등록 실패',
        message: '리뷰 등록에 실패했습니다. 다시 시도해 주세요.',
      });
    } finally {
      setAddloading(false);
    }
  };

  const renderItem = ({item}) => (
    <ReviewItem key={item.id} item={item} navigation={navigation} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {isWriting ? (
        <ReviewForm
          onChangeText={onChangeText}
          newReviewContent={newReviewContent}
          visitDate={visitDate}
          setVisitDate={setVisitDate}
          isDatePickerOpen={isDatePickerOpen}
          setIsDatePickerOpen={setIsDatePickerOpen}
          images={images}
          setImages={setImages}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          renderStars={renderStars}
          selectImage={selectImage}
          handleImagePress={handleImagePress}
          handleSubmitReview={handleSubmitReview}
          hadleNoWrite={hadleNoWrite}
        />
      ) : (
        <View style={{width: '100%'}}>
          <View style={styles.MenuaddView}>
            <Pressable style={styles.addButton} onPress={hadleIsWrite}>
              <Text style={styles.addButtonText}>리뷰 작성하기</Text>
            </Pressable>
          </View>
          <FlatList
            data={reviewdata}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10} // 처음 렌더링할 개수 (기본값: 10)
            maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
            windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
            removeClippedSubviews={true} // 보이지 않는 컴포넌트 메모리 해제
            onEndReached={loadMoreReviews} // 더 많은 데이터 불러오기
            onEndReachedThreshold={0.5}
            onRefresh={handleRefresh} // 새로고침
            refreshing={refreshing}
            contentContainerStyle={{paddingBottom: 100}}
            ListFooterComponent={
              <View style={styles.footer}>
                {loading && !isEnd ? (
                  <Text style={styles.emptyText}>Loading...</Text>
                ) : (
                  <Text style={styles.emptyText}>등록된 리뷰가 없습니다</Text>
                )}
              </View>
            }
          />
        </View>
      )}

      <AlertComponent />
      {addloading && (
        <View style={styles.footerloading}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 15,
    textAlign: 'center',
    color: '#333', // ✅ 더 진한 색상 적용
  },
  MenuaddView: {
    width: '100%',
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 18,
  },
  addButton: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'rgba(16, 190, 251, 0.7)',
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  star: {
    marginHorizontal: 3, // 별 사이 간격
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#E7E7E7',
  },
  loadMoreText: {
    color: '#1E90FF',
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    fontSize: 16,
  },
  footer: {
    marginVertical: 20,
    alignItems: 'center',
    height: 100,
  },
  footerloading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(194, 194, 194, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default StoreReviewScreen;
