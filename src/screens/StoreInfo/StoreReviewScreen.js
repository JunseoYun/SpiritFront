import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {ReviewStoreGet} from '../../api/reviewApi';
import ReviewItem from '../../components/StoreReviewScreen/ReviewItem';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ReviewCreate} from '../../api/reviewApi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useCustomAlert from '../../hooks/useCustomAlert';
import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-date-picker'; // 날짜 선택기
import ReviewForm from '../../components/StoreReviewScreen/ReviewForm';
import forbiddenWords from '../../hooks/forbiddenWords';

const StoreReviewScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId} = route.params;
  const [reviewdata, setReviewdata] = useState([]);
  const {showAlert, AlertComponent} = useCustomAlert();

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

  useFocusEffect(
    React.useCallback(() => {
      setReviewdata([]); // 기존 데이터 초기화
      setPage(0); // 페이지 초기화
      setIsEnd(false);
      getReviewData(0);
    }, [storeId]),
  );

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
          <Ionicons
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
        showAlert({
          title: '입력 오류',
          message: '리뷰 내용을 입력해주세요.',
        });
        return;
      }

      if (newrate === 0) {
        showAlert({
          title: '입력 오류',
          message: '별점을 입력해주세요.',
        });
        return;
      }

      // 리뷰 등록 성공 처리
      const data = {
        files: images, // 이미지 배열
        createReviewDto: {
          content: newReviewContent,
          rate: newrate,
          visitedAt: visitDate,
          storeId: storeId,
        },
      };

      await ReviewCreate(data);
      setImages([]); // 이미지 초기화
      setNewRate(0); // 별점 초기화
      setNewReviewContent(''); // 리뷰 내용 초기화
      setVisitDate(new Date()); // 방문 날짜 초기화

      showAlert({
        title: '등록되었습니다',
        message: '리뷰가 정상적으로 등록되었습니다.',
        onConfirm: () => {
          navigation.replace('StoreStack', {
            screen: 'StoreMainScreen',
            params: {
              storeId: storeId,
            },
          });
        },
      });
    } catch (error) {
      console.log(error, '리뷰 등록 중 에러');
      showAlert({
        title: '등록 실패',
        message: '리뷰 등록에 실패했습니다. 다시 시도해 주세요.',
      });
    }
  };

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
        <>
          <View style={styles.MenuaddView}>
            <Pressable style={styles.addButton} onPress={hadleIsWrite}>
              <Text style={styles.addButtonText}>리뷰 작성하기</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.reviewList}>
            {reviewdata.map(item => (
              <ReviewItem key={item.id} item={item} />
            ))}
            {loading && !isEnd ? (
              <View style={styles.footer}>
                <Text style={styles.emptyText}>Loading...</Text>
              </View>
            ) : reviewdata.length > 0 && page === totalpage - 1 ? (
              <View style={styles.footer}>
                <Text style={styles.emptyText}>더 이상 리뷰가 없습니다</Text>
              </View>
            ) : !loading && reviewdata.length === 0 ? (
              <View style={styles.footer}>
                <Text style={styles.emptyText}>리뷰가 없습니다</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={loadMoreReviews}
                style={styles.loadMoreButton}>
                <Text style={styles.loadMoreText}>
                  {loading ? (
                    <Text style={styles.emptyText}>Loading...</Text>
                  ) : (
                    <Text style={styles.emptyText}>더보기</Text>
                  )}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </>
      )}

      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
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
  reviewList: {
    paddingHorizontal: 18,
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

export default StoreReviewScreen;
